/* ==========================================================
   theme.js - Loaded in <head> so accent colour and light/dark
   mode are applied before the page paints (no flash).
   Both choices are optional extras saved in localStorage.
   ========================================================== */
(function () {
  var ACCENTS = {
    dark: {
      red:    "245,76,82",
      green:  "46,230,140",
      cyan:   "34,211,238",
      purple: "168,85,247"
    },
    light: {
      red:    "220,38,38",
      green:  "22,163,74",
      cyan:   "8,145,178",
      purple: "147,51,234"
    }
  };

  var mode = "dark", key = "red";
  try { mode = localStorage.getItem("rt_mode") || "dark"; } catch (e) {}
  try { key = localStorage.getItem("rt_accent") || "red"; } catch (e) {}
  if (mode !== "light") mode = "dark";
  if (!ACCENTS[mode][key]) key = "red";

  var root = document.documentElement;
  root.setAttribute("data-bs-theme", mode);
  root.setAttribute("data-mode", mode);
  root.style.setProperty("--rt-accent-rgb", ACCENTS[mode][key]);
  root.style.setProperty("--rt-accent", "rgb(" + ACCENTS[mode][key] + ")");

  window.RT_MODE = mode;
  window.RT_ACCENTS = ACCENTS[mode];
  window.RT_ACCENT_KEY = key;
})();
