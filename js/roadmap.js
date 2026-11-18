/* ==========================================================
   roadmap.js - Certification roadmap as a vertical timeline
   with animated SVG progress rings.
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const R = 30;
  const CIRC = 2 * Math.PI * R;
  // Certificates already earned (from EARNED in data.js)
  document.getElementById("earnedCount").textContent = EARNED.length;
  document.getElementById("earnedGrid").innerHTML = EARNED.map(function (e) {
    const thumb = e.img
      ? '<img class="earned-img" src="' + e.img + '" alt="Certificate: ' + e.name + '" loading="lazy">'
      : '<div class="earned-icon" aria-hidden="true">🎓</div>';
    const link = e.pdf
      ? '<a class="small d-inline-block mt-2" href="' + e.pdf + '" target="_blank" rel="noopener">View PDF ↗</a>'
      : "";
    return '<div class="col-md-6 col-lg-4 reveal"><div class="card rt-card h-100"><div class="card-body d-flex gap-3">' +
      (e.pdf ? '<a href="' + e.pdf + '" target="_blank" rel="noopener" aria-label="Open certificate PDF: ' + e.name + '">' + thumb + "</a>" : thumb) +
      '<div><span class="chip chip-acc">' + e.type + "</span>" +
      '<h3 class="h6 mb-1">' + e.name + "</h3>" +
      '<p class="small text-secondary mb-1">' + e.issuer + "</p>" +
      '<div class="small font-mono">' + e.date + "</div>" + link + "</div>" +
    "</div></div></div>";
  }).join("");

  const list = document.getElementById("timeline");
  function labById(id) { return LABS.find(function (l) { return l.id === id; }); }

  list.innerHTML = CERTS.map(function (c) {
    return '<li class="tl-item reveal">' +
      '<div class="tl-rail">' +
        '<div class="ring" data-progress="' + c.progress + '">' +
          '<svg width="72" height="72" viewBox="0 0 72 72" aria-hidden="true">' +
            '<circle class="ring-bg" cx="36" cy="36" r="' + R + '"></circle>' +
            '<circle class="ring-fg" cx="36" cy="36" r="' + R + '" stroke-dasharray="' + CIRC + '" stroke-dashoffset="' + CIRC + '"></circle>' +
          "</svg>" +
          '<span class="ring-text font-mono">' + c.progress + "%</span>" +
        "</div>" +
        '<div class="tl-line"></div>' +
      "</div>" +
      '<div class="card rt-card tl-card">' +
        '<div class="card-body">' +
          '<div class="d-flex justify-content-between align-items-start mb-1">' +
            '<span class="small text-secondary">' + c.level + "</span>" + statusBadge(c.status) +
          "</div>" +
          '<h2 class="h6 mb-1">' + c.name + "</h2>" +
          '<p class="small text-secondary mb-2">' + c.provider + "</p>" +
          '<div class="small font-mono mb-2">Target: ' + c.target + "</div>" +
          '<p class="small mb-2">' + c.focus + "</p>" +
          (c.labIds
            ? '<div class="small text-secondary mb-1">Prep labs (' + c.labIds.filter(function (id) { return labById(id).status === "Completed"; }).length + " of " + c.labIds.length + " done)</div>" +
              '<div class="mb-2">' + c.labIds.map(function (id) { const l = labById(id); return '<span class="chip ' + (l.status === "Completed" ? "chip-done" : "") + '">' + (l.status === "Completed" ? "✓ " : "") + l.name + "</span>"; }).join("") + "</div>"
            : '<div class="small text-secondary mb-2">Progress is a manual estimate (study-based, no linked labs).</div>') +
          (c.site ? '<a class="small" href="' + c.site + '" target="_blank" rel="noopener">Provider site ↗</a>' : "") +
        "</div>" +
      "</div>" +
    "</li>";
  }).join("");

  // Animate each ring when it scrolls into view
  const rings = list.querySelectorAll(".ring");
  function fill(ring) {
    const p = Number(ring.dataset.progress);
    ring.querySelector(".ring-fg").style.strokeDashoffset = CIRC * (1 - p / 100);
  }
  if (RT_REDUCED || !("IntersectionObserver" in window)) {
    rings.forEach(fill);
  } else {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { fill(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    rings.forEach(function (r) { io.observe(r); });
  }

  initReveal();
});
