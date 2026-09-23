// Client-side search over the index the site publishes at build time.
//
// No library and no service: the index is one JSON file, fetched the first
// time someone types. A site of a few hundred posts is a few hundred KB, and
// filtering that in memory is faster than a round trip would be.
//
// The form is hidden in the markup and revealed here, so a visitor without
// JavaScript is told search is unavailable rather than handed a dead box.

(function () {
  const form = document.querySelector("[data-search]");
  if (!form) return;

  const input = form.querySelector("input[type=search]");
  const status = document.querySelector("[data-search-status]");
  const list = document.querySelector("[data-search-results]");
  const url = form.getAttribute("data-index");

  form.hidden = false;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
  });

  let index = null;
  let loading = null;

  // Accents are a spelling detail, not a distinction the reader is making:
  // "resume" should find "résumé". NFD splits a letter from its accent, and
  // the range strips the accents that are now their own characters.
  function fold(s) {
    return (s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
  }

  function load() {
    if (index) return Promise.resolve(index);
    if (loading) return loading;
    loading = fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then((data) => {
        index = data.map((p) => {
          return {
            page: p,
            haystack: fold(
              [p.title, (p.tags || []).join(" "), p.summary, p.content].join(" ")
            ),
            title: fold(p.title),
            tags: fold((p.tags || []).join(" ")),
          };
        });
        return index;
      })
      .catch((e) => {
        // Forget the failure, or every later keystroke would be handed this
        // same rejected promise and search would stay broken until reload.
        loading = null;
        throw e;
      });
    return loading;
  }

  // Every word has to appear somewhere, in any order — the way a reader
  // expects two words typed together to narrow the result rather than widen it.
  function match(entry, terms) {
    for (let i = 0; i < terms.length; i++) {
      if (entry.haystack.indexOf(terms[i]) === -1) return false;
    }
    return true;
  }

  // A hit in the title says more about the page than a hit in the body.
  function score(entry, terms) {
    let n = 0;
    for (let i = 0; i < terms.length; i++) {
      if (entry.title.indexOf(terms[i]) !== -1) n += 10;
      if (entry.tags.indexOf(terms[i]) !== -1) n += 4;
    }
    return n;
  }

  function say(key, count) {
    const t = form.getAttribute("data-hits-" + key) || "";
    status.textContent = t.replace("%d", count);
  }

  // Every render takes a number, and only the newest one is allowed to write
  // to the page. Without it a slow query that resolves late overwrites the
  // results of a newer one, or refills a list the visitor has just cleared.
  let generation = 0;

  function render(query) {
    const mine = ++generation;
    const terms = fold(query).split(/\s+/).filter(Boolean);
    list.innerHTML = "";

    if (!terms.length) {
      status.textContent = "";
      return;
    }

    // The index is fetched on the first keystroke, and on a slow link that
    // wait is dead air: say so rather than leave the page looking inert.
    if (!index) say("loading", 0);

    load()
      .then((entries) => {
        if (mine !== generation) return;

        const hits = entries
          .filter((e) => {
            return match(e, terms);
          })
          .sort((a, b) => {
            const d = score(b, terms) - score(a, terms);
            return d !== 0 ? d : (b.page.date || "").localeCompare(a.page.date || "");
          });

        say(hits.length === 1 ? "one" : "many", hits.length);

        const frag = document.createDocumentFragment();
        hits.forEach((h) => {
          const li = document.createElement("li");
          const a = document.createElement("a");
          a.href = h.page.url;
          a.textContent = h.page.title;
          li.appendChild(a);
          if (h.page.date) {
            const time = document.createElement("time");
            time.dateTime = h.page.date;
            time.textContent = h.page.date;
            li.appendChild(time);
          }
          if (h.page.summary) {
            const p = document.createElement("p");
            // textContent, not innerHTML: the summary is content, and content
            // is not markup to be executed.
            p.textContent = h.page.summary;
            li.appendChild(p);
          }
          frag.appendChild(li);
        });
        list.appendChild(frag);
      })
      .catch(() => {
        if (mine !== generation) return;
        say("failed", 0);
      });
  }

  let timer;
  input.addEventListener("input", () => {
    clearTimeout(timer);
    const q = input.value;
    timer = setTimeout(() => {
      render(q);
      // Keep the query in the URL so a result list can be shared or reloaded,
      // without adding an entry to the back button for every keystroke.
      const next = q ? "?q=" + encodeURIComponent(q) : location.pathname;
      history.replaceState(null, "", next);
    }, 120);
  });

  // Arriving with ?q= runs the search straight away.
  const initial = new URLSearchParams(location.search).get("q");
  if (initial) {
    input.value = initial;
    render(initial);
  }
  input.focus();
})();
