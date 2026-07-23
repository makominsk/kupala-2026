(function () {
  "use strict";

  // Полноразмерные оригиналы для скачивания — на GitHub Release.
  var RELEASE_BASE = "https://github.com/makominsk/kupala-2026/releases/download/v1/";
  // Лёгкие копии для встроенного просмотра — с самого GitHub Pages
  // (отдаётся с Content-Type: video/mp4 и без attachment, поэтому играет в Safari/iOS).
  var WEB_BASE = "web/";

  var gallery = document.getElementById("gallery");
  var modal = document.getElementById("modal");
  var modalVideo = document.getElementById("modal-video");
  var modalDownload = document.getElementById("modal-download");
  var modalCounter = document.getElementById("modal-counter");

  var names = [];
  var current = -1;

  function downloadUrl(name) {
    return RELEASE_BASE + name + ".mp4";
  }

  function showVideo(index) {
    if (!names.length) return;
    // зациклено по кругу
    current = (index + names.length) % names.length;
    var name = names[current];

    var hint = modal.querySelector(".modal-error-hint");
    if (hint) hint.remove();

    modalVideo.poster = "posters/" + name + ".jpg";
    modalVideo.src = WEB_BASE + name + ".mp4";
    modalVideo.load();
    modalDownload.href = downloadUrl(name);
    modalDownload.setAttribute("download", name + ".mp4");
    if (modalCounter) modalCounter.textContent = (current + 1) + " / " + names.length;
    modalVideo.play().catch(function () {});
  }

  function openModal(index) {
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    showVideo(index);
  }

  function closeModal() {
    modal.hidden = true;
    document.body.style.overflow = "";
    modalVideo.pause();
    modalVideo.removeAttribute("src");
    modalVideo.removeAttribute("poster");
    modalVideo.load();
  }

  function nextVideo() { showVideo(current + 1); }
  function prevVideo() { showVideo(current - 1); }

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

  // Клики: закрытие по фону/крестику, стрелки-кнопки
  modal.addEventListener("click", function (e) {
    var t = e.target;
    if (t.closest("[data-close]")) { closeModal(); return; }
    if (t.closest(".modal-nav-next")) { nextVideo(); return; }
    if (t.closest(".modal-nav-prev")) { prevVideo(); return; }
  });

  // Клавиатура: Esc — закрыть, стрелки — листать
  document.addEventListener("keydown", function (e) {
    if (modal.hidden) return;
    if (e.key === "Escape") closeModal();
    else if (e.key === "ArrowRight") { e.preventDefault(); nextVideo(); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); prevVideo(); }
  });

  // Свайп влево/вправо для листания (не закрывает окно)
  var touchX = null, touchY = null;
  modal.addEventListener("touchstart", function (e) {
    if (e.touches.length !== 1) { touchX = null; return; }
    touchX = e.touches[0].clientX;
    touchY = e.touches[0].clientY;
  }, { passive: true });
  modal.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    var dy = e.changedTouches[0].clientY - touchY;
    touchX = null;
    // горизонтальный жест заметно длиннее вертикального
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      if (dx < 0) nextVideo(); else prevVideo();
    }
  }, { passive: true });

  function render(list) {
    names = list;
    var frag = document.createDocumentFragment();

    list.forEach(function (name, i) {
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

      card.addEventListener("click", function () { openModal(i); });
      card.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal(i);
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
