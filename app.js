(function () {
  "use strict";

  /* ── helpers ──────────────────────────────────────────────── */
  function el(id) {
    return document.getElementById(id);
  }
  function setText(id, value) {
    var node = el(id);
    if (node) node.textContent = value;
  }
  function setHTML(id, value) {
    var node = el(id);
    if (node) node.innerHTML = value;
  }
  function setAttr(id, attr, value) {
    var node = el(id);
    if (node) node.setAttribute(attr, value);
  }

  function initials(name) {
    return name
      .split(" ")
      .filter(Boolean)
      .map(function (w) { return w[0].toUpperCase(); })
      .join("");
  }

  /* ── render ───────────────────────────────────────────────── */
  function render(d) {
    /* page title */
    document.title =
      d.executive.firstName + "’s Invitation — " + d.event.name;

    /* hero */
    el("hero-eyebrow").textContent =
      d.event.city + " · " + d.event.date;
    setHTML(
      "hero-headline",
      d.executive.firstName +
        ", we would be <em>delighted</em> to host you in Paris"
    );
    setText("hero-event-label", d.event.name);
    setText("hero-sub", d.event.tagline);
    setAttr("hero-cta", "href", "#rsvp");

    /* event details */
    setText("event-heading", d.event.fullName || d.event.name);
    setText("event-date", d.event.date);
    setText("event-venue", d.event.venue);
    setText("event-city", d.event.city);
    setText("event-address", d.event.venueAddress);

    var dateEl = el("event-date");
    if (dateEl) {
      var time = document.createElement("time");
      time.setAttribute("datetime", d.event.dateISO);
      time.textContent = d.event.date;
      dateEl.textContent = "";
      dateEl.appendChild(time);
    }

    /* invitation */
    setText("invitation-message", d.invitation.personalMessage);
    setText("invitation-from-name", d.host.name);
    setText("invitation-from-role", d.host.title + ", " + d.host.company);

    /* relevance */
    setText("relevance-company", d.executive.company);
    setText("relevance-body", d.invitation.relevanceStatement);

    /* highlights */
    var grid = el("highlights-grid");
    if (grid && d.highlights) {
      grid.innerHTML = d.highlights
        .map(function (h, i) {
          return (
            '<li class="highlight-card reveal reveal--delay-' +
            (i + 1) +
            '">' +
            '<span class="highlight-card__icon" aria-hidden="true">' +
            h.icon +
            "</span>" +
            '<h3 class="highlight-card__title">' +
            escapeHTML(h.title) +
            "</h3>" +
            '<p class="highlight-card__desc">' +
            escapeHTML(h.description) +
            "</p>" +
            "</li>"
          );
        })
        .join("");
    }

    /* host */
    setText("host-heading", d.host.name);
    setText("host-role", d.host.title + " · " + d.host.company);
    setText("host-bio-text", d.host.bio);
    setText("host-initials", initials(d.host.name));

    /* rsvp */
    setText("rsvp-seats", d.rsvp.seats);
    setText("rsvp-cta", d.rsvp.ctaLabel);
    setAttr("rsvp-cta", "href", d.rsvp.url);
    setText("rsvp-deadline", d.rsvp.deadline);

    /* concierge */
    setText("concierge-heading", "Your dedicated concierge");
    setText("concierge-note", d.concierge.note);
    setText("concierge-name", d.concierge.name + " · " + d.concierge.title);

    var emailEl = el("concierge-email");
    if (emailEl) {
      emailEl.textContent = d.concierge.email;
      emailEl.href = "mailto:" + d.concierge.email;
    }

    var phoneEl = el("concierge-phone");
    if (phoneEl) {
      phoneEl.textContent = d.concierge.phone;
      phoneEl.href = "tel:" + d.concierge.phone.replace(/[^+\d]/g, "");
    }

    /* footer */
    setText("footer-legal", d.footer.legal);
    setAttr("footer-privacy", "href", d.footer.privacy);
  }

  /* ── escape utility ───────────────────────────────────────── */
  function escapeHTML(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /* ── scroll reveal ────────────────────────────────────────── */
  function initReveal() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach(function (node) {
        node.classList.add("is-visible");
      });
      return;
    }
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -48px 0px" }
    );
    document.querySelectorAll(".reveal").forEach(function (node) {
      io.observe(node);
    });
  }

  /* ── add reveal class to sections after render ────────────── */
  function addRevealClasses() {
    var selectors = [
      ".event-details .container--narrow",
      ".invitation .container--narrow",
      ".relevance .container--narrow",
      ".highlights__heading",
      ".host__card",
      ".rsvp__inner",
      ".concierge .container--narrow",
    ];
    selectors.forEach(function (sel) {
      var node = document.querySelector(sel);
      if (node && !node.classList.contains("reveal")) {
        node.classList.add("reveal");
      }
    });
  }

  /* ── init ─────────────────────────────────────────────────── */
  function init() {
    if (typeof INVITE === "undefined") {
      console.error("[invite] INVITE data not found. Did invite-data.js load?");
      return;
    }
    render(INVITE);
    addRevealClasses();
    initReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
