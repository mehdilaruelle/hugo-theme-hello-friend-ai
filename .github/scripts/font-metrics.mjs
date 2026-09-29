import fs from 'node:fs'
import zlib from 'node:zlib'

// Reads head and OS/2, which is all the metrics overrides need, out of a WOFF
// or a WOFF2. Neither table is ever transformed in a WOFF2.
const buf = fs.readFileSync(process.argv[2])
const signature = buf.toString('ascii', 0, 4)
const numTables = buf.readUInt16BE(12)
const tables = {}

if (signature === 'wOFF') {
  for (let i = 0; i < numTables; i++) {
    const o = 44 + i * 20
    const tag = buf.toString('ascii', o, o + 4)
    const offset = buf.readUInt32BE(o + 4)
    const compLength = buf.readUInt32BE(o + 8)
    const origLength = buf.readUInt32BE(o + 12)
    const raw = buf.subarray(offset, offset + compLength)
    tables[tag] = compLength === origLength ? raw : zlib.inflateSync(raw)
  }
} else if (signature === 'wOF2') {
  // The first known tags of the WOFF2 spec, in its order; head is 1, OS/2 is 6.
  const KNOWN = ['cmap', 'head', 'hhea', 'hmtx', 'maxp', 'name', 'OS/2', 'post', 'cvt ', 'fpgm', 'glyf', 'loca']
  let o = 48
  const base128 = () => {
    let v = 0
    for (let i = 0; i < 5; i++) {
      const b = buf[o++]
      v = v * 128 + (b & 0x7f)
      if (!(b & 0x80)) return v
    }
    throw new Error('bad UIntBase128')
  }
  const entries = []
  for (let i = 0; i < numTables; i++) {
    const flags = buf[o++]
    let tag = KNOWN[flags & 0x3f]
    if ((flags & 0x3f) === 63) { tag = buf.toString('ascii', o, o + 4); o += 4 }
    const length = base128()
    const version = flags >> 6
    const transformed = tag === 'glyf' || tag === 'loca' ? version === 0 : version !== 0
    entries.push({ tag, length: transformed ? base128() : length })
  }
  const data = zlib.brotliDecompressSync(buf.subarray(o, o + buf.readUInt32BE(20)))
  let at = 0
  for (const { tag, length } of entries) {
    if (tag) tables[tag] = data.subarray(at, at + length)
    at += length
  }
} else {
  throw new Error('not a WOFF or WOFF2 file')
}

const head = tables['head']
const os2 = tables['OS/2']
if (!head || !os2) throw new Error('head or OS/2 missing')

const unitsPerEm = head.readUInt16BE(18)
const typoAscender = os2.readInt16BE(68)
const typoDescender = os2.readInt16BE(70)
const typoLineGap = os2.readInt16BE(72)
const winAscent = os2.readUInt16BE(74)
const winDescent = os2.readUInt16BE(76)

const pct = (v) => `${(Math.abs(v) / unitsPerEm * 100).toFixed(2)}%`

console.log(JSON.stringify({
  file: process.argv[2].split(/[\\/]/).pop(),
  unitsPerEm,
  typoAscender, typoDescender, typoLineGap,
  winAscent, winDescent,
  // Chrome derives the used metrics from the OS/2 win values for most fonts,
  // which is what the overrides have to match.
  ascentOverride: pct(winAscent),
  descentOverride: pct(winDescent),
  lineGapOverride: pct(typoLineGap),
}, null, 2))
