/* /js/main.js
   =========================================================
   Unique IT SOLUTIONS — Full Website JS (Vanilla)
   Works for ALL pages:
   - Sticky header behavior (optional shadow on scroll)
   - Mobile menu open/close + ESC + click outside + focus trap
   - Services dropdown (desktop hover/focus + click outside)
   - Mobile Services accordion inside menu
   - Smooth scroll for on-page anchors
   - Accordion (FAQ) one-open-at-a-time (supports both structures)
   - Metric count-up on scroll (supports .metric__num and .metric h3[data-count])
   - Reveal on scroll (adds premium animations)
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
     Sticky header shadow (safe)
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
      '[tabindex]:not([tabindex="-1"])',
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

    // Close mobile services accordion too (optional)
    const ms = qs(".mobile__services");
    if (ms) ms.setAttribute("aria-expanded", "false");

    const last = openMobileMenu._lastFocused;
    if (last && typeof last.focus === "function") last.focus();
  }

  if (hamburger) hamburger.addEventListener("click", openMobileMenu);
  if (mobileCloseBtn) mobileCloseBtn.addEventListener("click", closeMobileMenu);
  if (mobileBackdrop) mobileBackdrop.addEventListener("click", closeMobileMenu);

  document.addEventListener("keydown", (e) => {
    // ESC closes
    if (e.key === "Escape") {
      closeMobileMenu();
      closeDropdown();
    }

    // Focus trap when mobile is open
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
     - Works if you have:
       .dropdown [aria-expanded]
       .dropdown__trigger
       .dropdown__menu
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
    // Hover open/close (desktop)
    let dropdownCloseTimer = null;

dropdown.addEventListener("mouseenter", () => {
  if (dropdownCloseTimer) clearTimeout(dropdownCloseTimer);
  openDropdown();
});

dropdown.addEventListener("mouseleave", () => {
  // small delay makes it easier to click items
  dropdownCloseTimer = setTimeout(() => {
    closeDropdown();
  }, 220);
});

    // Keyboard open on focus
    dropdown.addEventListener("focusin", openDropdown);
    dropdown.addEventListener("focusout", (e) => {
      if (!dropdown.contains(e.relatedTarget)) closeDropdown();
    });

    // Click toggle (keeps accessible)
    // Click behavior:
// - On desktop: first click opens dropdown, second click goes to services.html
// - On touch devices: tap opens dropdown, tap again goes
dropdownTrigger.addEventListener("click", (e) => {
  const isExpanded = dropdown.getAttribute("aria-expanded") === "true";

  // If dropdown is NOT open yet, open it and stop navigation
  if (!isExpanded) {
    e.preventDefault();
    openDropdown();
    return;
  }

  // If dropdown IS already open, allow navigation to services.html (NO preventDefault)
});

    // Click outside closes
    document.addEventListener("click", (e) => {
      if (!dropdown.contains(e.target)) closeDropdown();
    });

    // Close after selecting an item
    qsa(".dropdown__menu a").forEach((a) => {
      a.addEventListener("click", () => closeDropdown());
    });
  }

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

      // Close mobile menu if open
      if (mobile && mobile.getAttribute("aria-hidden") === "false") closeMobileMenu();
    });
  });

  /* =======================================================
     FAQ / Accordion (supports 2 structures)
     A) Accessible accordion:
        .accordion__item[aria-expanded] + .accordion__button + .accordion__panel
     B) Simple FAQ blocks:
        .faq-item h3 + p (adds click-to-toggle without breaking)
  ======================================================== */

  // A) Accessible accordion
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

        // Close all
        accordionItems.forEach((i) => {
          i.setAttribute("aria-expanded", "false");
          setPanelHeight(i, false);
        });

        // Open this if it was closed
        if (!isOpen) {
          item.setAttribute("aria-expanded", "true");
          setPanelHeight(item, true);
        }
      });
    });

    window.addEventListener("resize", () => {
      accordionItems.forEach((item) => {
        if (item.getAttribute("aria-expanded") === "true") setPanelHeight(item, true);
      });
    });
  }

  // B) Simple FAQ items (support.html version)
  const simpleFaq = qsa(".faq-item");
  if (simpleFaq.length) {
    simpleFaq.forEach((item) => {
      const h = qs("h3", item);
      const p = qs("p", item);
      if (!h || !p) return;

      // Make heading clickable without changing your HTML
      h.style.cursor = "pointer";
      h.setAttribute("tabindex", "0");
      h.setAttribute("role", "button");
      h.setAttribute("aria-expanded", "false");

      // Start collapsed visually (only if you want)
      p.style.maxHeight = p.scrollHeight + "px"; // start open by default
      // If you want closed-by-default, uncomment:
      // p.style.overflow = "hidden";
      // p.style.maxHeight = "0px";

      function toggle() {
        const expanded = h.getAttribute("aria-expanded") === "true";
        h.setAttribute("aria-expanded", String(!expanded));

        // Toggle paragraph
        p.style.overflow = "hidden";
        p.style.transition = "max-height 260ms cubic-bezier(.2,.9,.2,1)";
        if (expanded) {
          p.style.maxHeight = "0px";
        } else {
          p.style.maxHeight = p.scrollHeight + "px";
        }
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
     Metric Counters (supports 2 structures)
     A) .metric__num[data-count]
     B) .metric h3[data-count]
  ======================================================== */
  const metricNums = qsa(".metric__num[data-count]");
  const metricH3s = qsa(".metric h3[data-count]");
  const metricTargets = metricNums.length ? metricNums : metricH3s;

  function animateCount(el, target, duration = 1100) {
    const start = 0;
    const startTime = performance.now();

    function step(now) {
      const t = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
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
      // Fallback
      metricTargets.forEach((el) => {
        const target = parseInt(el.getAttribute("data-count"), 10);
        if (!isNaN(target)) el.textContent = String(target);
      });
    }
  }

  /* =======================================================
     Scroll-Reveal Animations
     - Adds: .reveal + .reveal--in + optional stagger vars
     Requires CSS classes (already in styles.css)
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
      ".support-info",
    ];

    const els = Array.from(new Set(selectors.flatMap((s) => qsa(s)))).filter(Boolean);

    els.forEach((el) => {
      el.classList.add("reveal");
      // cards: slightly nicer motion
      if (
        el.classList.contains("card") ||
        el.classList.contains("serviceCard") ||
        el.classList.contains("services-page__item") ||
        el.classList.contains("case-card")
      ) {
        el.classList.add("reveal--card");
      }
    });

    // Stagger inside common groups
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
})();/* --- Hero parallax hover (optional premium effect) --- */
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