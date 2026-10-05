(function () {
  var root = document.documentElement;

  function safeGet(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function safeSet(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }

  var toggle = document.querySelector("[data-theme-toggle]");
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    if (toggle) {
      toggle.setAttribute("aria-label", theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
      toggle.textContent = theme === "dark" ? "Light" : "Dark";
    }
  }
  applyTheme(root.getAttribute("data-theme") || "light");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
      safeSet("theme", next);
    });
  }

  var typeEl = document.querySelector("[data-typing]");
  if (typeEl && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var phrases = JSON.parse(typeEl.getAttribute("data-typing"));
    var pi = 0, ci = 0, deleting = false;
    var tick = function () {
      var word = phrases[pi];
      typeEl.textContent = deleting ? word.slice(0, ci--) : word.slice(0, ci++);
      var delay = deleting ? 45 : 90;
      if (!deleting && ci > word.length) { deleting = true; delay = 1600; }
      else if (deleting && ci < 0) { deleting = false; ci = 0; pi = (pi + 1) % phrases.length; delay = 400; }
      setTimeout(tick, delay);
    };
    tick();
  }

  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  var links = document.querySelectorAll(".site-nav__links a[href^='#']");
  var sections = [];
  links.forEach(function (a) {
    var s = document.querySelector(a.getAttribute("href"));
    if (s) sections.push({ link: a, section: s });
  });
  if ("IntersectionObserver" in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        sections.forEach(function (item) {
          item.link.classList.toggle("is-active", item.section === entry.target);
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (item) { spy.observe(item.section); });
  }
})();
