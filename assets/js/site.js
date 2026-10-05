(function () {
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var typeEl = document.querySelector("[data-typing]");
  if (typeEl && !reduceMotion) {
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

  var bar = document.querySelector(".scroll-progress");
  if (bar) {
    var updateProgress = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
  }

  var counters = document.querySelectorAll("[data-count]");
  var countUp = function (el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) { el.textContent = target.toFixed(decimals) + suffix; return; }
    var start = null, duration = 1200;
    var step = function (ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  var hasIO = "IntersectionObserver" in window;

  if (hasIO && counters.length && !reduceMotion) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          countUp(entry.target);
          cio.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  document.querySelectorAll(".grid-2, .credits, .entry-list").forEach(function (group) {
    Array.prototype.forEach.call(group.children, function (child, i) {
      child.classList.add("reveal");
      child.style.transitionDelay = (i * 0.08) + "s";
    });
  });
  document.querySelectorAll("section .card, section .box").forEach(function (el) {
    el.classList.add("reveal");
  });

  var revealEls = document.querySelectorAll(".reveal");
  if (hasIO && revealEls.length && !reduceMotion) {
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

  var navLinks = document.querySelectorAll(".profile__nav a[href^='#']");
  var sections = [];
  navLinks.forEach(function (a) {
    var s = document.querySelector(a.getAttribute("href"));
    if (s) sections.push({ link: a, section: s });
  });
  if (hasIO && sections.length) {
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
