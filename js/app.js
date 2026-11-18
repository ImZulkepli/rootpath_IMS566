/* ==========================================================
   app.js - Shared logic for all pages after login
   - Route guard (redirect to login if not logged in)
   - Navbar: greeting, logout, accent colour picker
   - Background effects and scroll reveal
   - Badge helpers used by the labs and roadmap pages
   ========================================================== */

// Route guard: protected pages need a logged-in session
const currentUser = sessionStorage.getItem("rt_user");
if (!currentUser) {
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", function () {
  initBackdrop();

  const nameEl = document.getElementById("navUser");
  if (nameEl) nameEl.textContent = currentUser;

  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      sessionStorage.removeItem("rt_user");
      window.location.href = "index.html";
    });
  }

  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Accent colour picker
  const picker = document.getElementById("accentPicker");
  if (picker) {
    Object.keys(RT_ACCENTS).forEach(function (key) {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "accent-dot" + (key === RT_ACCENT_KEY ? " active" : "");
      b.style.background = "rgb(" + RT_ACCENTS[key] + ")";
      b.title = "Theme: " + key;
      b.setAttribute("aria-label", "Switch to " + key + " theme");
      b.addEventListener("click", function () {
        try { localStorage.setItem("rt_accent", key); } catch (e) {}
        location.reload();
      });
      picker.appendChild(b);
    });
  }

  // Light / dark mode toggle
  const nav = document.getElementById("modeSlot") || picker;
  if (nav) nav.appendChild(createModeToggle());

  initReveal();
});

// Badge helpers
function statusBadge(status) {
  const map = { "Completed": "success", "In Progress": "warning", "Planned": "secondary" };
  return '<span class="badge text-bg-' + (map[status] || "secondary") + '">' + status + "</span>";
}

function difficultyBadge(level) {
  const map = { "Easy": "info", "Medium": "primary", "Hard": "danger" };
  return '<span class="badge text-bg-' + (map[level] || "secondary") + '">' + level + "</span>";
}
