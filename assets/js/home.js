(function () {
  var sections = Array.prototype.slice.call(document.querySelectorAll(".home-section[id]"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".home-nav a[href^='#']"));

  if (!sections.length || !navLinks.length || !("IntersectionObserver" in window)) {
    return;
  }

  var linkFor = {};
  navLinks.forEach(function (link) {
    linkFor[link.getAttribute("href").slice(1)] = link;
  });

  var setActive = function (id) {
    navLinks.forEach(function (link) {
      link.classList.remove("is-active");
    });
    if (linkFor[id]) {
      linkFor[id].classList.add("is-active");
    }
  };

  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          setActive(entry.target.id);
        }
      });
    },
    { rootMargin: "-40% 0px -55% 0px", threshold: 0 }
  );

  sections.forEach(function (section) {
    observer.observe(section);
  });

  var toggle = document.querySelector(".home-nav__toggle");
  var nav = document.querySelector(".home-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", nav.classList.contains("is-open"));
    });
    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }
})();
