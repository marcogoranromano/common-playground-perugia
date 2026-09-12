(function () {
  "use strict";

  var navLinks = Array.prototype.slice.call(
    document.querySelectorAll(".site-nav__link")
  );
  var sections = Array.prototype.slice.call(
    document.querySelectorAll("[data-nav-section]")
  );
  var eventsTrack = document.querySelector(".events__track");
  var prevButton = document.querySelector(".events__arrow--prev");
  var nextButton = document.querySelector(".events__arrow--next");
  var animImages = Array.prototype.slice.call(
    document.querySelectorAll(".anim-image")
  );

  function setActiveLink(id) {
    navLinks.forEach(function (link) {
      var href = link.getAttribute("href");
      var isActive = href === "#" + id;
      link.classList.toggle("is-active", isActive);
    });
  }

  function initActiveNavigation() {
    if (!("IntersectionObserver" in window) || sections.length === 0) {
      return;
    }

    var visibleMap = {};

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          visibleMap[entry.target.id] = entry.intersectionRatio;
        });

        var bestId = null;
        var bestRatio = 0;

        sections.forEach(function (section) {
          var ratio = visibleMap[section.id] || 0;
          if (ratio > bestRatio) {
            bestRatio = ratio;
            bestId = section.id;
          }
        });

        if (bestId) {
          setActiveLink(bestId);
        }
      },
      {
        root: null,
        threshold: [0.15, 0.3, 0.45, 0.6, 0.75],
        rootMargin: "-20% 0px -35% 0px"
      }
    );

    sections.forEach(function (section) {
      observer.observe(section);
    });
  }

  function getEventStep() {
    if (!eventsTrack) {
      return 0;
    }

    var card = eventsTrack.querySelector(".event-card");
    if (!card) {
      return eventsTrack.clientWidth * 0.8;
    }

    var styles = window.getComputedStyle(eventsTrack);
    var gap = parseFloat(styles.columnGap || styles.gap) || 0;
    /* offsetWidth stays in layout px under CSS zoom (unlike getBoundingClientRect). */
    return card.offsetWidth + gap;
  }

  function initEventsControls() {
    if (!eventsTrack || !prevButton || !nextButton) {
      return;
    }

    prevButton.addEventListener("click", function () {
      eventsTrack.scrollBy({
        left: -getEventStep(),
        behavior: "smooth"
      });
    });

    nextButton.addEventListener("click", function () {
      eventsTrack.scrollBy({
        left: getEventStep(),
        behavior: "smooth"
      });
    });
  }

  var PAGE_WIDTH = 1440;

  function updatePageScale() {
    var page = document.getElementById("page");
    if (!page) {
      return;
    }

    var viewportWidth = window.innerWidth;

    if (viewportWidth > PAGE_WIDTH) {
      page.style.width = PAGE_WIDTH + "px";
      page.style.zoom = String(viewportWidth / PAGE_WIDTH);
    } else {
      page.style.width = "";
      page.style.zoom = "";
    }
  }

  function initPageScale() {
    updatePageScale();
    window.addEventListener("resize", updatePageScale);
  }

  function getRevealOffset(image) {
    var direction = image.getAttribute("data-reveal");

    /* Event card frames must stay fully covered — avoid vertical offset gaps. */
    if (image.closest(".event-card__media")) {
      return { translateX: 0, translateY: 0 };
    }

    switch (direction) {
      case "left":
        return { translateX: -28, translateY: 0 };
      case "right":
        return { translateX: 28, translateY: 0 };
      case "up":
      default:
        return { translateX: 0, translateY: 24 };
    }
  }

  function initImageAnimations() {
    if (!animImages.length) {
      return;
    }

    var reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (reduceMotion || typeof anime === "undefined") {
      animImages.forEach(function (image) {
        image.style.opacity = "1";
        image.style.transform = "none";
      });
      return;
    }

    animImages.forEach(function (image) {
      var offset = getRevealOffset(image);
      image.style.opacity = "0";
      image.style.transform =
        "translate(" + offset.translateX + "px, " + offset.translateY + "px)";
    });

    var observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }

          var image = entry.target;
          var offset = getRevealOffset(image);

          anime({
            targets: image,
            opacity: [0, 1],
            translateX: [offset.translateX, 0],
            translateY: [offset.translateY, 0],
            duration: 900,
            easing: "easeOutCubic"
          });

          obs.unobserve(image);
        });
      },
      {
        root: null,
        threshold: 0.18,
        rootMargin: "0px 0px -8% 0px"
      }
    );

    animImages.forEach(function (image) {
      observer.observe(image);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initPageScale();
    initActiveNavigation();
    initEventsControls();
    initImageAnimations();
  });
})();
