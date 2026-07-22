(function () {
  "use strict";

  var RELEASE_BASE = "https://github.com/makominsk/kupala-2026/releases/download/v1/";

  var gallery = document.getElementById("gallery");
  var modal = document.getElementById("modal");
  var modalVideo = document.getElementById("modal-video");
  var modalDownload = document.getElementById("modal-download");

  function assetUrl(name, ext) {
    return RELEASE_BASE + name + "." + ext;
  }

  function openModal(name) {
    var hint = modal.querySelector(".modal-error-hint");
    if (hint) hint.remove();
    modalVideo.poster = "posters/" + name + ".jpg";
    modalVideo.src = assetUrl(name, "mp4");
    modalVideo.load();
    modalDownload.href = assetUrl(name, "mp4");
    modalDownload.setAttribute("download", name + ".mp4");
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    modalVideo.play().catch(function () {});
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    modalVideo.pause();
    modalVideo.removeAttribute("src");
    modalVideo.removeAttribute("poster");
    modalVideo.load();
  }

  modalVideo.addEventListener("error", function () {
    if (modal.hidden) return;
    var hint = modal.querySelector(".modal-error-hint");
    if (!hint) {
      hint = document.createElement("p");
      hint.className = "modal-error-hint";
      hint.textContent = "Не получилось загрузить видео для просмотра. Попробуйте скачать файл кнопкой ниже.";
      modalDownload.insertAdjacentElement("beforebegin", hint);
    }
  });

  modal.addEventListener("click", function (e) {
    if (e.target.hasAttribute("data-close")) closeModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modal.hidden) closeModal();
  });

  function render(names) {
    var frag = document.createDocumentFragment();

    names.forEach(function (name, i) {
      var card = document.createElement("div");
      card.className = "card";
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", "Открыть видео " + (i + 1));

      var img = document.createElement("img");
      img.src = "posters/" + name + ".jpg";
      img.loading = "lazy";
      img.alt = "";
      card.appendChild(img);

      var overlay = document.createElement("div");
      overlay.className = "card-overlay";
      var badge = document.createElement("div");
      badge.className = "play-badge";
      overlay.appendChild(badge);
      card.appendChild(overlay);

      var tag = document.createElement("span");
      tag.className = "card-tag";
      tag.textContent = "№ " + String(i + 1).padStart(2, "0");
      card.appendChild(tag);

      card.addEventListener("click", function () { openModal(name); });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal(name);
        }
      });

      frag.appendChild(card);
    });

    gallery.appendChild(frag);
    observeCards();
  }

  function observeCards() {
    var cards = document.querySelectorAll(".card:not(.in-view)");
    if (!("IntersectionObserver" in window)) {
      cards.forEach(function (c) { c.classList.add("in-view"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry, i) {
        if (entry.isIntersecting) {
          var el = entry.target;
          setTimeout(function () { el.classList.add("in-view"); }, (i % 6) * 60);
          io.unobserve(el);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    cards.forEach(function (c) { io.observe(c); });
  }

  function showError() {
    var p = document.createElement("p");
    p.style.color = "#e0a";
    p.style.gridColumn = "1 / -1";
    p.textContent = "Не удалось загрузить список видео.";
    gallery.appendChild(p);
  }

  fetch("videos.json")
    .then(function (r) { return r.json(); })
    .then(render)
    .catch(function (err) {
      showError();
      console.error(err);
    });
})();
