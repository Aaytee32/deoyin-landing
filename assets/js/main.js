(function () {
  "use strict";

  // ---------- Theme toggle ----------
  var root = document.documentElement;
  var THEME_KEY = "deoyin-theme";
  var stored = null;
  try { stored = localStorage.getItem(THEME_KEY); } catch (e) {}
  if (stored === "light" || stored === "dark") root.setAttribute("data-theme", stored);

  function currentTheme() {
    var attr = root.getAttribute("data-theme");
    if (attr) return attr;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }

  function applyToggleLabel(btn) {
    if (!btn) return;
    var theme = currentTheme();
    btn.textContent = theme === "light" ? "●" : "○";
    btn.setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var toggle = document.querySelector("[data-theme-toggle]");
    applyToggleLabel(toggle);
    if (toggle) {
      toggle.addEventListener("click", function () {
        var next = currentTheme() === "light" ? "dark" : "light";
        root.setAttribute("data-theme", next);
        try { localStorage.setItem(THEME_KEY, next); } catch (e) {}
        applyToggleLabel(toggle);
      });
    }

    // ---------- Mobile nav ----------
    var burger = document.querySelector("[data-nav-burger]");
    var links = document.querySelector("[data-nav-links]");
    if (burger && links) {
      burger.addEventListener("click", function () {
        var open = links.classList.toggle("open");
        burger.setAttribute("aria-expanded", open ? "true" : "false");
      });
      links.querySelectorAll("a").forEach(function (a) {
        a.addEventListener("click", function () {
          links.classList.remove("open");
          burger.setAttribute("aria-expanded", "false");
        });
      });
    }

    // ---------- Active nav link ----------
    var path = window.location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll("[data-nav-links] a").forEach(function (a) {
      var href = a.getAttribute("href");
      if (href === path || (path === "" && href === "index.html")) {
        a.setAttribute("aria-current", "page");
      }
    });

    // ---------- Footer year ----------
    var yearEl = document.querySelector("[data-year]");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    // ---------- Scroll reveal ----------
    var revealEls = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && revealEls.length) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("in-view");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add("in-view"); });
    }

    // ---------- Contact form (Web3Forms) ----------
    var form = document.querySelector("[data-contact-form]");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var status = form.querySelector("[data-form-status]");
        var submitBtn = form.querySelector("button[type=submit]");
        var accessKey = form.querySelector("input[name=access_key]");

        if (!accessKey || !accessKey.value || accessKey.value.indexOf("YOUR_") === 0) {
          if (status) {
            status.textContent = "Form isn't configured yet: add a Web3Forms access key in contact.html.";
            status.className = "form-status error";
          }
          return;
        }

        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Sending…"; }
        if (status) { status.textContent = ""; status.className = "form-status"; }

        fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
        })
          .then(function (res) { return res.json(); })
          .then(function (data) {
            if (data.success) {
              form.reset();
              if (status) {
                status.textContent = "Message sent. We'll get back to you shortly.";
                status.className = "form-status success";
              }
            } else {
              throw new Error(data.message || "Submission failed");
            }
          })
          .catch(function () {
            if (status) {
              status.textContent = "Something went wrong. Please email us directly instead.";
              status.className = "form-status error";
            }
          })
          .finally(function () {
            if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Send Message"; }
          });
      });
    }
  });
})();
