(function () {
  "use strict";

  /* ─────────────────────────────────────────────────────────────────────
     RSVP STATE  (isolated — replace readRsvpState / writeRsvpState
                  with real API calls when a backend is available)
     States: "invited" | "accepting" | "confirmed" | "declining" | "declined"
  ───────────────────────────────────────────────────────────────────── */
  var STORAGE_KEY = "rsvp_state_" + (INVITE.id || "default");

  function readRsvpState() {
    try {
      return localStorage.getItem(STORAGE_KEY) || "invited";
    } catch (e) {
      return "invited";
    }
  }

  function writeRsvpState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, state);
    } catch (e) { /* storage unavailable */ }
  }

  /* ─── helpers ─────────────────────────────────────────────────────── */
  function el(id) { return document.getElementById(id); }

  function setText(id, value) {
    var node = el(id);
    if (node) node.textContent = value;
  }

  function setHTML(id, markup) {
    var node = el(id);
    if (node) node.innerHTML = markup;
  }

  function setAttr(id, attr, value) {
    var node = el(id);
    if (node) node.setAttribute(attr, value);
  }

  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function initials(name) {
    return name.split(" ").filter(Boolean).map(function (w) { return w[0].toUpperCase(); }).join("");
  }

  function announce(msg) {
    var live = el("rsvp-live");
    if (live) { live.textContent = ""; setTimeout(function () { live.textContent = msg; }, 50); }
  }

  /* ─── RSVP panel state machine ────────────────────────────────────── */
  var STATES = ["invited", "accepting", "confirmed", "declining", "declined"];

  function showState(name) {
    STATES.forEach(function (s) {
      var node = el("rsvp-state-" + s);
      if (!node) return;
      var active = s === name;
      node.classList.toggle("rsvp-panel__state--hidden", !active);
      node.setAttribute("aria-hidden", active ? "false" : "true");
    });

    /* sticky CTA: hide once responded */
    var responded = name === "confirmed" || name === "declined";
    document.body.classList.toggle("rsvp-responded", responded);
    var sticky = el("sticky-cta");
    if (sticky) sticky.setAttribute("aria-hidden", responded ? "true" : "false");

    /* if returning confirmed guest, surface what's new */
    if (name === "confirmed") {
      var wn = document.querySelector(".whats-new");
      if (wn) {
        wn.classList.add("whats-new--prominent");
        var note = el("whats-new-return-note");
        if (note) note.classList.remove("sr-only");
      }
    }
  }

  function transitionState(toState, announcement) {
    writeRsvpState(toState);
    showState(toState);
    if (announcement) announce(announcement);

    /* smooth scroll panel into view on mobile */
    if (window.innerWidth <= 960) {
      var panel = el("rsvp-panel");
      if (panel) {
        setTimeout(function () {
          panel.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 80);
      }
    }
  }

  /* ─── render static content ───────────────────────────────────────── */
  function render(d) {
    /* page title */
    document.title = d.executive.firstName + "’s Invitation — " + d.event.name;

    /* hero left */
    setText("hero-eyebrow", "A private invitation for " + d.executive.fullName);
    setHTML("hero-headline",
      esc(d.executive.firstName) + ", we would be <em>delighted</em> to host you in " + esc(d.event.city));
    setText("hero-event-label", d.event.fullName);

    var dateNode = el("hero-date");
    if (dateNode) {
      var t = document.createElement("time");
      t.setAttribute("datetime", d.event.dateISO);
      t.textContent = d.event.date;
      dateNode.appendChild(t);
    }
    setText("hero-venue", d.event.venue);
    setText("hero-sub", d.invitation.personalMessage);
    setText("hero-selection", d.invitation.selectionReason || "");

    /* rsvp panel — deadline */
    setText("rsvp-deadline-invited", d.rsvp.deadline);
    setText("rsvp-confirmed-date", d.event.date);
    setText("rsvp-confirmed-venue", d.event.venue);
    setAttr("rsvp-cal-link", "href", d.rsvp.calendarUrl || "#");

    /* confirmed / declined personalised headings */
    setText("rsvp-confirmed-heading", "You’re confirmed, " + d.executive.firstName);
    setText("rsvp-declined-heading", "Thank you for letting us know, " + d.executive.firstName + ".");

    /* your summit heading */
    setHTML("your-summit-heading",
      "Your " + esc(d.event.city) + " Summit");

    /* why you */
    setHTML("why-you-company", esc(d.executive.company));
    setText("why-you-body", d.invitation.relevanceStatement);

    /* sessions */
    var sessionsList = el("sessions-list");
    if (sessionsList && d.sessions) {
      sessionsList.innerHTML = d.sessions.map(function (s, i) {
        return (
          '<li class="session-card reveal reveal--delay-' + (i + 1) + '">' +
            '<span class="session-card__number" aria-hidden="true">' + esc(s.number) + '</span>' +
            '<p class="session-card__relevance">' + esc(s.relevance) + '</p>' +
            '<h4 class="session-card__title">' + esc(s.title) + '</h4>' +
            '<p class="session-card__desc">' + esc(s.description) + '</p>' +
            '<p class="session-card__outcome">' + esc(s.outcome) + '</p>' +
          '</li>'
        );
      }).join("");
    }

    /* host */
    setText("host-heading", d.host.name);
    setText("host-role", d.host.title + " · " + d.host.company);
    setText("host-welcome", d.host.welcomeMessage || "");
    setText("host-bio-text", d.host.bio);
    setText("host-initials", initials(d.host.name));

    /* experience */
    var expList = el("experience-list");
    if (expList && d.experience) {
      expList.innerHTML = d.experience.map(function (item) {
        return (
          '<li class="experience-item">' +
            '<span class="experience-item__label">' + esc(item.label) + '</span>' +
            '<span class="experience-item__detail">' + esc(item.detail) + '</span>' +
          '</li>'
        );
      }).join("");
    }

    /* what's new */
    var wnList = el("whats-new-list");
    if (wnList && d.whatsNew) {
      wnList.innerHTML = d.whatsNew.map(function (item) {
        var badge = item.isNew
          ? '<span class="whats-new-item__badge">New</span>'
          : '';
        return (
          '<li class="whats-new-item reveal">' +
            '<div class="whats-new-item__meta">' +
              '<span class="whats-new-item__date">' + esc(item.dateFormatted) + '</span>' +
              badge +
            '</div>' +
            '<div>' +
              '<p class="whats-new-item__title">' + esc(item.title) + '</p>' +
              '<p class="whats-new-item__desc">' + esc(item.description) + '</p>' +
            '</div>' +
          '</li>'
        );
      }).join("");
    }

    /* concierge */
    setText("concierge-name-line", d.concierge.name + " · " + d.concierge.title);
    setText("concierge-note", d.concierge.note);
    setText("concierge-availability", d.concierge.availability || "");

    var svcs = el("concierge-services");
    if (svcs && d.concierge.services) {
      svcs.innerHTML = d.concierge.services.map(function (s) {
        return '<li>' + esc(s) + '</li>';
      }).join("");
    }

    var emailEl = el("concierge-email");
    if (emailEl) {
      emailEl.textContent = d.concierge.email;
      emailEl.href = "mailto:" + d.concierge.email;
    }
    var emailBtn = el("concierge-email-btn");
    if (emailBtn) emailBtn.href = "mailto:" + d.concierge.email;

    var phoneEl = el("concierge-phone");
    if (phoneEl) {
      phoneEl.textContent = d.concierge.phone;
      phoneEl.href = "tel:" + d.concierge.phone.replace(/[^+\d]/g, "");
    }

    /* footer */
    setText("footer-legal", d.footer.legal);
    setAttr("footer-privacy", "href", d.footer.privacy);
  }

  /* ─── wire RSVP interactions ──────────────────────────────────────── */
  function wireRsvp() {
    /* Accept invitation */
    var btnAccept = el("btn-accept");
    if (btnAccept) {
      btnAccept.addEventListener("click", function () {
        transitionState("accepting", "Opening acceptance form. Please complete the optional details.");
      });
    }

    /* Back from accepting */
    var btnBackAccept = el("btn-back-from-accept");
    if (btnBackAccept) {
      btnBackAccept.addEventListener("click", function () {
        transitionState("invited", "Returned to invitation.");
      });
    }

    /* Confirm my place */
    var acceptForm = el("rsvp-accept-form");
    if (acceptForm) {
      acceptForm.addEventListener("submit", function (e) {
        e.preventDefault();
        transitionState("confirmed", "You’re confirmed. We look forward to welcoming you to New York.");
      });
    }

    /* Decline open */
    var btnDeclineOpen = el("btn-decline-open");
    if (btnDeclineOpen) {
      btnDeclineOpen.addEventListener("click", function () {
        transitionState("declining", "Decline confirmation step opened.");
      });
    }

    /* Back from declining */
    var btnBackDecline = el("btn-back-from-decline");
    if (btnBackDecline) {
      btnBackDecline.addEventListener("click", function () {
        transitionState("invited", "Returned to invitation.");
      });
    }

    /* Confirm decline */
    var declineForm = el("rsvp-decline-form");
    if (declineForm) {
      declineForm.addEventListener("submit", function (e) {
        e.preventDefault();
        transitionState("declined", "Your response has been noted. Thank you for letting us know.");
      });
    }

    /* Sticky CTA — scroll/focus panel */
    var stickyCta = el("sticky-cta-btn");
    if (stickyCta) {
      stickyCta.addEventListener("click", function () {
        var panel = el("rsvp-panel");
        if (panel) {
          panel.scrollIntoView({ behavior: "smooth", block: "start" });
          /* focus first interactive element */
          setTimeout(function () {
            var firstBtn = panel.querySelector("button, a");
            if (firstBtn) firstBtn.focus();
          }, 400);
        }
      });
    }
  }

  /* ─── scroll reveal ───────────────────────────────────────────────── */
  function initReveal() {
    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll(".reveal").forEach(function (n) { n.classList.add("is-visible"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });

    document.querySelectorAll(".reveal").forEach(function (n) { io.observe(n); });
  }

  function addRevealClasses() {
    [
      ".your-summit-label .container--narrow",
      ".why-you .container--narrow",
      ".sessions__heading",
      ".host__card",
      ".the-experience .container--narrow",
      ".whats-new .container--narrow",
      ".concierge .container--narrow",
    ].forEach(function (sel) {
      var n = document.querySelector(sel);
      if (n && !n.classList.contains("reveal")) n.classList.add("reveal");
    });
  }

  /* ─── init ────────────────────────────────────────────────────────── */
  function init() {
    if (typeof INVITE === "undefined") {
      console.error("[invite] INVITE data not found.");
      return;
    }

    render(INVITE);
    addRevealClasses();

    /* restore prior RSVP state */
    var currentState = readRsvpState();
    showState(currentState);

    wireRsvp();
    initReveal();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();
