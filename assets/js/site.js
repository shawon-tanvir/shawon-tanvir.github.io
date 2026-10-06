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


  var canvas = document.querySelector(".bg-network");
  if (canvas && canvas.getContext && !reduceMotion) {
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var mouse = { x: -9999, y: -9999 };
    var nodes = [];
    var colors = ["167,139,250", "45,212,191", "245,158,11"];
    var resize = function () {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var count = Math.min(90, Math.floor(window.innerWidth * window.innerHeight / 16000));
      nodes = [];
      for (var i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: 1 + Math.random() * 1.6,
          c: colors[i % colors.length]
        });
      }
    };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", function (e) { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    window.addEventListener("mouseleave", function () { mouse.x = -9999; mouse.y = -9999; });
    var linkDist = 150;
    var frame = function () {
      var w = window.innerWidth, h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < nodes.length; i++) {
        var n = nodes[i];
        var dx = n.x - mouse.x, dy = n.y - mouse.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < 22500) {
          var f = (22500 - d2) / 22500 * 0.6;
          n.vx += dx * f * 0.002;
          n.vy += dy * f * 0.002;
        }
        n.vx *= 0.99; n.vy *= 0.99;
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      for (var a = 0; a < nodes.length; a++) {
        for (var b = a + 1; b < nodes.length; b++) {
          var p = nodes[a], q = nodes[b];
          var ddx = p.x - q.x, ddy = p.y - q.y;
          var dist = Math.sqrt(ddx * ddx + ddy * ddy);
          if (dist < linkDist) {
            ctx.strokeStyle = "rgba(167,139,250," + (0.22 * (1 - dist / linkDist)).toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      for (var k = 0; k < nodes.length; k++) {
        var m = nodes[k];
        ctx.fillStyle = "rgba(" + m.c + ",0.75)";
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
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

  var navLinks = document.querySelectorAll(".topbar__nav a[href^='#']");
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
