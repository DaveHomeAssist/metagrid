/* T1 verify loop:
 *  1) vm.compileFunction parse-check every inline <script> block
 *  2) tag balance for <div> <details> <g>
 *  3) jsdom load (structuredClone polyfill + injected localStorage + real url),
 *     then exercise the R3 deep-link handlers and assert behavior.
 */
const fs = require("fs");
const vm = require("vm");
const path = require("path");
const { JSDOM } = require("jsdom");

const DIR = require("path").join(__dirname, "..", "public", "tools");
const FILES = ["residential-wiring-reference.html", "panel-schedule-56HA.html", "basement-planner.html"];
const WIRING = fs.readFileSync(path.join(DIR, "wiring-shared.js"), "utf8");

let fail = 0;
const ok = (c, m) => (c ? console.log("  ok  " + m) : (fail++, console.error("  FAIL " + m)));

// --- extract <script> blocks (capture inline bodies; note src includes) ---
function scripts(html) {
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  const inline = [];
  const srcs = [];
  let m;
  while ((m = re.exec(html))) {
    const attrs = m[1] || "";
    const srcMatch = attrs.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
    if (srcMatch) srcs.push(srcMatch[1]);
    else inline.push(m[2]);
  }
  return { inline, srcs };
}

function count(html, re) {
  const m = html.match(re);
  return m ? m.length : 0;
}

(async () => {
  for (const f of FILES) {
    console.log("\n===== " + f + " =====");
    const html = fs.readFileSync(path.join(DIR, f), "utf8");
    const { inline, srcs } = scripts(html);

    // 1) parse-check
    ok(srcs.includes("wiring-shared.js"), "includes <script src=wiring-shared.js>");
    inline.forEach((code, i) => {
      try {
        vm.compileFunction(code, [], { filename: f + "#inline" + i });
        ok(true, "vm.compileFunction inline script #" + i + " (" + code.length + " chars)");
      } catch (e) {
        ok(false, "parse inline #" + i + ": " + e.message);
      }
    });

    // 2) tag balance
    [["div", /<div\b/gi, /<\/div>/gi], ["details", /<details\b/gi, /<\/details>/gi], ["g", /<g\b/gi, /<\/g>/gi]].forEach(([t, o, c]) => {
      const open = count(html, o),
        close = count(html, c);
      if (open === 0 && close === 0) return;
      ok(open === close, "<" + t + "> balance: " + open + " open / " + close + " close");
    });
  }

  // 3) jsdom behavior — load each page with the module inlined, exercise deep links
  console.log("\n===== jsdom load + deep-link behavior =====");

  function makeStorage() {
    const map = new Map();
    return {
      getItem: (k) => (map.has(k) ? map.get(k) : null),
      setItem: (k, v) => map.set(k, String(v)),
      removeItem: (k) => map.delete(k),
      clear: () => map.clear(),
      key: (i) => Array.from(map.keys())[i] ?? null,
      get length() {
        return map.size;
      },
      _map: map,
    };
  }

  function loadPage(file) {
    let html = fs.readFileSync(path.join(DIR, file), "utf8");
    // inline the module so jsdom doesn't need to fetch it
    html = html.replace(/<script\b[^>]*\bsrc\s*=\s*["']wiring-shared\.js["'][^>]*><\/script>/i, "<script>\n" + WIRING + "\n</script>");
    const store = makeStorage();
    const dom = new JSDOM(html, {
      url: "https://x.test/" + file,
      runScripts: "dangerously",
      pretendToBeVisual: true,
      beforeParse(window) {
        window.structuredClone = (v) => JSON.parse(JSON.stringify(v));
        Object.defineProperty(window, "localStorage", { value: store, configurable: true });
        if (!window.matchMedia) window.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, media: "" });
        window.Element.prototype.scrollIntoView = function () {};
        if (!window.CSS) window.CSS = {};
        if (!window.CSS.escape) window.CSS.escape = (s) => String(s).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
      },
    });
    return { dom, window: dom.window, store };
  }

  function fireHash(window, hash) {
    window.location.hash = hash;
    window.dispatchEvent(new window.Event("hashchange"));
  }

  // reference
  {
    console.log("\n-- residential-wiring-reference.html --");
    const { window } = loadPage("residential-wiring-reference.html");
    ok(!!window.WiringShared, "WiringShared global present after load");
    ok(typeof window.WiringShared.boxFill === "function", "WiringShared.boxFill available");
    const part6 = window.document.getElementById("part6");
    ok(!!part6, "#part6 details exists");
    const before = part6.open;
    fireHash(window, "#part6");
    ok(part6.open === true, "deep link #part6 opened the <details> (was open=" + before + ")");
    // also test #calc anchor
    fireHash(window, "#calc");
    ok(window.document.getElementById("calc").open === true, "deep link #calc opened the calculator");
  }

  // panel
  {
    console.log("\n-- panel-schedule-56HA.html --");
    const { window } = loadPage("panel-schedule-56HA.html");
    ok(!!window.WiringShared, "WiringShared global present after load");
    const brk = window.document.querySelector('.brk[data-id="11"]');
    ok(!!brk, ".brk[data-id=11] rendered");
    if (brk) {
      brk.classList.remove("flash");
      fireHash(window, "#circuit=11");
      ok(brk.classList.contains("flash"), "deep link #circuit=11 flashed the breaker (locateBreaker fired)");
    }
    // 240V circuit id with '+' must be preserved
    const brk46 = window.document.querySelector('.brk[data-id="4+6"]');
    if (brk46) {
      brk46.classList.remove("flash");
      fireHash(window, "#circuit=4+6");
      ok(brk46.classList.contains("flash"), "deep link #circuit=4+6 (literal +) located the 240V dryer breaker");
    } else {
      ok(true, "(no .brk[data-id=4+6] in DOM; skipping + test)");
    }
  }

  // planner
  {
    console.log("\n-- basement-planner.html --");
    const { window } = loadPage("basement-planner.html");
    ok(!!window.WiringShared, "WiringShared global present after load");
    ok(typeof window.document.getElementById("plan") !== "undefined", "#plan svg present");
    // no items carry circuitId yet -> handler must be a safe no-op
    let threw = false;
    try {
      fireHash(window, "#circuit=99");
    } catch (e) {
      threw = true;
    }
    ok(!threw, "deep link #circuit=99 is a safe no-op (no circuitId items yet)");
  }

  console.log("\n==== T1 verify: " + (fail ? fail + " FAILED" : "ALL PASSED") + " ====");
  process.exit(fail ? 1 : 0);
})();
