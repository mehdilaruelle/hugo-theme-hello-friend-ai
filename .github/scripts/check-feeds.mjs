// Asserts that every XML output is well-formed. Nothing else parses the XML the
// build writes, so a feed could stop being XML and still ship.
//
// A scanner, not a validator: it checks what a template can get wrong.
//
//   node .github/scripts/check-feeds.mjs <public-dir>

import { readFileSync } from "node:fs";
import { walk } from "./_lib.mjs";

const NAME = "[A-Za-z_:][-A-Za-z0-9_:.]*";
// The five XML predefines. Anything else needs a DTD these documents lack, so
// &nbsp; is as fatal as a bare &.
const ENTITY = /^&(?:#[0-9]+|#[xX][0-9a-fA-F]+|lt|gt|amp|quot|apos);/;

const ATTRS = new RegExp(`^(?:\\s+${NAME}\\s*=\\s*("[^"<]*"|'[^'<]*'))*\\s*$`);
const ONE_ATTR = new RegExp(`${NAME}\\s*=\\s*("[^"<]*"|'[^'<]*')`, "g");

function scan(s) {
  const bad = [];
  const stack = [];
  const at = (i) => {
    const line = s.slice(0, i).split("\n").length;
    return `line ${line}`;
  };
  let i = 0;

  while (i < s.length) {
    const lt = s.indexOf("<", i);
    const text = s.slice(i, lt === -1 ? s.length : lt);

    // "]]>" here means a CDATA section ended where it should not have.
    const stray = text.indexOf("]]>");
    if (stray !== -1) bad.push(`${at(i + stray)}: "]]>" in character data — a CDATA section closed early`);
    for (let k = text.indexOf("&"); k !== -1; k = text.indexOf("&", k + 1)) {
      if (!ENTITY.test(text.slice(k))) { bad.push(`${at(i + k)}: "&" that starts no entity`); break; }
    }
    if (lt === -1) break;
    i = lt;

    if (s.startsWith("<!--", i)) {
      const end = s.indexOf("-->", i + 4);
      if (end === -1) { bad.push(`${at(i)}: unterminated comment`); break; }
      i = end + 3; continue;
    }
    if (s.startsWith("<![CDATA[", i)) {
      const end = s.indexOf("]]>", i + 9);
      if (end === -1) { bad.push(`${at(i)}: unterminated CDATA section`); break; }
      i = end + 3; continue;
    }
    if (s.startsWith("<?", i)) {
      const end = s.indexOf("?>", i + 2);
      if (end === -1) { bad.push(`${at(i)}: unterminated processing instruction`); break; }
      i = end + 2; continue;
    }
    if (s.startsWith("<!", i)) {           // DOCTYPE and friends
      const end = s.indexOf(">", i + 2);
      if (end === -1) { bad.push(`${at(i)}: unterminated declaration`); break; }
      i = end + 1; continue;
    }

    // Scan to ">", skipping any inside a quoted value.
    let j = i + 1, quote = null, end = -1;
    for (; j < s.length; j++) {
      const c = s[j];
      if (quote) { if (c === quote) quote = null; continue; }
      if (c === '"' || c === "'") { quote = c; continue; }
      if (c === ">") { end = j; break; }
    }
    if (end === -1) { bad.push(`${at(i)}: unterminated tag`); break; }

    const raw = s.slice(i + 1, end);
    const closing = raw.startsWith("/");
    const selfClosing = raw.endsWith("/");
    const name = (raw.replace(/^\//, "").match(new RegExp(`^${NAME}`)) || [])[0];
    if (name) {
      // An unquoted value is not XML, however happily a browser reads it.
      const rest = raw.slice((closing ? 1 : 0) + name.length).replace(/\/$/, "");
      if (!ATTRS.test(rest)) {
        bad.push(`${at(i)}: <${name}> has an attribute with no quoted value`);
      } else {
        for (const m of rest.matchAll(ONE_ATTR)) {
          const value = m[1].slice(1, -1);
          for (let k = value.indexOf("&"); k !== -1; k = value.indexOf("&", k + 1)) {
            if (!ENTITY.test(value.slice(k))) {
              bad.push(`${at(i)}: <${name}> has an "&" that starts no entity in an attribute`);
              break;
            }
          }
        }
      }
    }
    if (!name) {
      bad.push(`${at(i)}: "<" that starts no tag`);
    } else if (closing) {
      const open = stack.pop();
      if (open === undefined) bad.push(`${at(i)}: </${name}> with nothing open`);
      else if (open.name !== name) bad.push(`${at(i)}: </${name}> closes <${open.name}> opened at ${at(open.i)}`);
    } else if (!selfClosing) {
      stack.push({ name, i });
    }
    i = end + 1;
  }

  for (const open of stack) bad.push(`${at(open.i)}: <${open.name}> is never closed`);
  return bad;
}

const root = process.argv[2] || "public";
const failures = [];
let files = 0;

for (const file of walk(root, ".xml")) {
  files++;
  const problems = scan(readFileSync(file, "utf8"));
  // One broken item breaks the document; a handful of lines is enough.
  for (const p of problems.slice(0, 5)) failures.push([file, p]);
}

// A wrong working-directory: every assertion above is vacuously true over
// nothing, and the run reads as a pass.
if (files === 0) {
  console.error(`no XML found under ${root}: nothing was checked`);
  process.exit(1);
}

console.log(`checked ${files} XML files`);
if (failures.length) {
  console.error(`\n${failures.length} problem(s):\n`);
  for (const [file, why] of failures) console.error(`  ${file}\n    ${why}`);
  process.exit(1);
}
console.log("every XML output is well-formed");
