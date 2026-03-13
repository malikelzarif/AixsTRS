/* /js/main.js
   =========================================================
   AxisTRS — Full Website JS (Vanilla)
   Works for ALL pages:
   - Sticky header behavior (optional shadow on scroll)
   - Mobile menu open/close + ESC + click outside + focus trap
   - Services dropdown (desktop hover/focus + click outside)
   - Mobile Services accordion inside menu
   - Smooth scroll for on-page anchors
   - Accordion (FAQ) one-open-at-a-time (supports both structures)
   - Metric count-up on scroll (supports .metric__num and .metric h3[data-count])
   - Reveal on scroll (adds premium animations)
   - Support form submit handler
   =========================================================
*/

(function () {
  const qs = (sel, scope = document) => scope.querySelector(sel);
  const qsa = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));

  /* -----------------------------
     Footer year
  ------------------------------ */
  const yearEl = qs("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* -----------------------------
     Sticky header shadow
  ------------------------------ */
  const headerBar = qs(".header__bar");
  if (headerBar) {
    const onScroll = () => {
      if (window.scrollY > 8) headerBar.classList.add("is-scrolled");
      else headerBar.classList.remove("is-scrolled");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* =======================================================
     Mobile Menu
  ======================================================== */
  const mobile = qs(".mobile");
  const hamburger = qs(".hamburger");
  const mobileCloseBtn = qs(".mobile__close");
  const mobileBackdrop = qs(".mobile__backdrop");

  function getFocusable(container) {
    const selectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])'
    ].join(",");
    return qsa(selectors, container).filter((el) => el.offsetParent !== null);
  }

  function openMobileMenu() {
    if (!mobile) return;
    openMobileMenu._lastFocused = document.activeElement;
    mobile.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";

    const focusables = getFocusable(mobile);
    if (focusables.length) focusables[0].focus();
  }

  function closeMobileMenu() {
    if (!mobile) return;
    mobile.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";

    const ms = qs(".mobile__services");
    if (ms) ms.setAttribute("aria-expanded", "false");

    const last = openMobileMenu._lastFocused;
    if (last && typeof last.focus === "function") last.focus();
  }

  if (hamburger) hamburger.addEventListener("click", openMobileMenu);
  if (mobileCloseBtn) mobileCloseBtn.addEventListener("click", closeMobileMenu);
  if (mobileBackdrop) mobileBackdrop.addEventListener("click", closeMobileMenu);

  /* -----------------------------
     Mobile Services accordion
  ------------------------------ */
  const mobileServices = qs(".mobile__services");
  const mobileServicesBtn = qs(".mobile__servicesBtn");
  if (mobileServices && mobileServicesBtn) {
    mobileServicesBtn.addEventListener("click", () => {
      const expanded = mobileServices.getAttribute("aria-expanded") === "true";
      mobileServices.setAttribute("aria-expanded", String(!expanded));
    });
  }

  /* =======================================================
     Desktop Services Dropdown
  ======================================================== */
  const dropdown = qs(".dropdown");
  const dropdownTrigger = qs(".dropdown__trigger");

  function openDropdown() {
    if (!dropdown) return;
    dropdown.setAttribute("aria-expanded", "true");
  }

  function closeDropdown() {
    if (!dropdown) return;
    dropdown.setAttribute("aria-expanded", "false");
  }

  if (dropdown && dropdownTrigger) {
    let dropdownCloseTimer = null;

    dropdown.addEventListener("mouseenter", () => {
      if (dropdownCloseTimer) clearTimeout(dropdownCloseTimer);
      openDropdown();
    });

    dropdown.addEventListener("mouseleave", () => {
      dropdownCloseTimer = setTimeout(() => {
        closeDropdown();
      }, 220);
    });

    dropdown.addEventListener("focusin", openDropdown);
    dropdown.addEventListener("focusout", (e) => {
      if (!dropdown.contains(e.relatedTarget)) closeDropdown();
    });

    dropdownTrigger.addEventListener("click", (e) => {
      const isExpanded = dropdown.getAttribute("aria-expanded") === "true";
      if (!isExpanded) {
        e.preventDefault();
        openDropdown();
      }
    });

    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target)) closeDropdown();
    });

    qsa(".dropdown__menu a").forEach((a) => {
      a.addEventListener("click", () => closeDropdown());
    });
  }

  /* =======================================================
     Global key handling
  ======================================================== */
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeMobileMenu();
      closeDropdown();
    }

    if (!mobile || mobile.getAttribute("aria-hidden") !== "false") return;
    if (e.key !== "Tab") return;

    const focusables = getFocusable(mobile);
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  /* =======================================================
     Smooth scroll for same-page anchors
  ======================================================== */
  qsa('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;

      const target = qs(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });

      if (mobile && mobile.getAttribute("aria-hidden") === "false") {
        closeMobileMenu();
      }
    });
  });

  /* =======================================================
     FAQ / Accordion
  ======================================================== */
  const accordionItems = qsa(".accordion__item");

  function setPanelHeight(item, open) {
    const panel = qs(".accordion__panel", item);
    if (!panel) return;

    if (!open) {
      panel.style.maxHeight = null;
      return;
    }

    panel.style.maxHeight = panel.scrollHeight + "px";
  }

  if (accordionItems.length) {
    accordionItems.forEach((item) => {
      const btn = qs(".accordion__button", item);
      if (!btn) return;

      btn.addEventListener("click", () => {
        const isOpen = item.getAttribute("aria-expanded") === "true";

        accordionItems.forEach((i) => {
          i.setAttribute("aria-expanded", "false");
          setPanelHeight(i, false);
        });

        if (!isOpen) {
          item.setAttribute("aria-expanded", "true");
          setPanelHeight(item, true);
        }
      });
    });

    window.addEventListener("resize", () => {
      accordionItems.forEach((item) => {
        if (item.getAttribute("aria-expanded") === "true") {
          setPanelHeight(item, true);
        }
      });
    });
  }

  const simpleFaq = qsa(".faq-item");
  if (simpleFaq.length) {
    simpleFaq.forEach((item) => {
      const h = qs("h3", item);
      const p = qs("p", item);
      if (!h || !p) return;

      h.style.cursor = "pointer";
      h.setAttribute("tabindex", "0");
      h.setAttribute("role", "button");
      h.setAttribute("aria-expanded", "false");
      p.style.maxHeight = p.scrollHeight + "px";

      function toggle() {
        const expanded = h.getAttribute("aria-expanded") === "true";
        h.setAttribute("aria-expanded", String(!expanded));
        p.style.overflow = "hidden";
        p.style.transition = "max-height 260ms cubic-bezier(.2,.9,.2,1)";

        if (expanded) p.style.maxHeight = "0px";
        else p.style.maxHeight = p.scrollHeight + "px";
      }

      h.addEventListener("click", toggle);
      h.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggle();
        }
      });
    });
  }

  /* =======================================================
     Metric Counters
  ======================================================== */
  const metricNums = qsa(".metric__num[data-count]");
  const metricH3s = qsa(".metric h3[data-count]");
  const metricTargets = metricNums.length ? metricNums : metricH3s;

  function animateCount(el, target, duration = 1100) {
    const start = 0;
    const startTime = performance.now();

    function step(now) {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.floor(start + (target - start) * eased);
      el.textContent = val.toLocaleString();
      if (t < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  if (metricTargets.length) {
    let played = false;

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !played) {
              played = true;
              metricTargets.forEach((el) => {
                const target = parseInt(el.getAttribute("data-count"), 10);
                if (!isNaN(target)) animateCount(el, target, 1100);
              });
              io.disconnect();
            }
          });
        },
        { threshold: 0.35 }
      );

      io.observe(metricTargets[0]);
    } else {
      metricTargets.forEach((el) => {
        const target = parseInt(el.getAttribute("data-count"), 10);
        if (!isNaN(target)) el.textContent = String(target);
      });
    }
  }

  /* =======================================================
     Scroll-Reveal Animations
  ======================================================== */
  (function initReveal() {
    const selectors = [
      ".section .container > *",
      ".card",
      ".serviceCard",
      ".services-page__item",
      ".approachCard",
      ".logo",
      ".accordion__item",
      ".case-card",
      ".support-form",
      ".support-info"
    ];

    const els = Array.from(new Set(selectors.flatMap((s) => qsa(s)))).filter(Boolean);

    els.forEach((el) => {
      el.classList.add("reveal");
      if (
        el.classList.contains("card") ||
        el.classList.contains("serviceCard") ||
        el.classList.contains("services-page__item") ||
        el.classList.contains("case-card")
      ) {
        el.classList.add("reveal--card");
      }
    });

    const groups = qsa(".grid, .logoRow, .accordion, .services-page, .approach__grid, .case-grid, .support-grid");
    groups.forEach((group) => {
      const kids = Array.from(group.children);
      kids.forEach((child, idx) => {
        const delay = Math.min(idx * 60, 240);
        child.style.setProperty("--reveal-delay", `${delay}ms`);
        child.dataset.delay = "1";
      });
    });

    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("reveal--in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal--in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -6% 0px" }
    );

    els.forEach((el) => io.observe(el));
  })();
})();

/* --- Hero parallax hover (optional premium effect) --- */
const heroPanel = document.querySelector(".hero__panel");
const heroImg = document.querySelector(".hero__img");

if (heroPanel && heroImg && window.matchMedia("(pointer:fine)").matches) {
  heroPanel.addEventListener("mousemove", (e) => {
    const rect = heroPanel.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    heroImg.style.transform = `translate(${x * 10}px, ${y * 10}px) scale(1.02)`;
  });

  heroPanel.addEventListener("mouseleave", () => {
    heroImg.style.transform = "";
  });
}

/* --- Support form submit --- */
const form = document.getElementById("axistrs-contact-form");
const status = document.getElementById("form-status");

if (form && status) {
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    status.textContent = "Submitting your request...";

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: {
          Accept: "application/json"
        }
      });

      if (response.ok) {
        form.reset();
        status.textContent = "Thank you. Your inquiry has been submitted successfully.";
      } else {
        status.textContent = "Something went wrong. Please try again.";
      }
    } catch (error) {
      status.textContent = "Unable to submit right now. Please try again later.";
    }
  });
}
