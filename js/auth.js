/* ==========================================================
   auth.js - Simulated authentication (login / register)
   - Demo credentials are hardcoded in data.js
   - Registered users are kept in localStorage (browser only)
   - Login state is kept in sessionStorage
   ========================================================== */

// Already logged in? Skip the login page.
if (sessionStorage.getItem("rt_user")) {
  window.location.href = "dashboard.html";
}

function getRegisteredUsers() {
  try { return JSON.parse(localStorage.getItem("rt_users")) || []; }
  catch (e) { return []; }
}

function showMessage(boxId, text, type) {
  const box = document.getElementById(boxId);
  box.className = "alert alert-" + type + " py-2 small";
  box.textContent = text;
}

function shakeCard() {
  const card = document.getElementById("authCard");
  card.classList.remove("shake");
  void card.offsetWidth; // restart the animation
  card.classList.add("shake");
}

function grantAccess(displayName) {
  sessionStorage.setItem("rt_user", displayName);
  document.getElementById("grantName").textContent = "Welcome back, " + displayName;
  document.getElementById("accessOverlay").classList.add("show");
  setTimeout(function () { window.location.href = "dashboard.html"; }, RT_REDUCED ? 300 : 1300);
}

function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById("loginUser").value.trim();
  const password = document.getElementById("loginPass").value;

  if (!username || !password) {
    showMessage("loginMsg", "Please enter both username and password.", "warning");
    shakeCard();
    return;
  }

  let matched = null;
  if (username === DEMO_USER.username && password === DEMO_USER.password) {
    matched = DEMO_USER;
  } else {
    matched = getRegisteredUsers().find(function (u) {
      return u.username === username && u.password === password;
    });
  }

  if (matched) {
    grantAccess(matched.name || matched.username);
  } else {
    showMessage("loginMsg", "Invalid username or password. Please try again.", "danger");
    shakeCard();
  }
}

function handleRegister(event) {
  event.preventDefault();
  const name = document.getElementById("regName").value.trim();
  const username = document.getElementById("regUser").value.trim();
  const password = document.getElementById("regPass").value;

  if (password.length < 6) {
    showMessage("registerMsg", "Password must be at least 6 characters.", "warning");
    shakeCard();
    return;
  }
  const users = getRegisteredUsers();
  if (username === DEMO_USER.username || users.some(function (u) { return u.username === username; })) {
    showMessage("registerMsg", "That username is already taken.", "danger");
    shakeCard();
    return;
  }
  users.push({ name: name, username: username, password: password });
  localStorage.setItem("rt_users", JSON.stringify(users));
  showMessage("registerMsg", "Account created! Switch to the Login tab to enter.", "success");
  event.target.reset();
}

document.addEventListener("DOMContentLoaded", function () {
  initBackdrop();
  startNetwork(document.getElementById("network"));
  document.body.appendChild(createModeToggle("mode-toggle-float"));

  // Demo credentials shown on the login card (kept in sync with data.js)
  document.getElementById("demoUser").textContent = DEMO_USER.username;
  document.getElementById("demoPass").textContent = DEMO_USER.password;

  // Hero stats count up from the data in data.js
  countUp(document.getElementById("statLabs"), LABS.length);
  countUp(document.getElementById("statCerts"), CERTS.length);
  countUp(document.getElementById("statRanks"), RANKS.length);

  document.getElementById("loginForm").addEventListener("submit", handleLogin);
  document.getElementById("registerForm").addEventListener("submit", handleRegister);

  // Show / hide password
  const toggle = document.getElementById("togglePass");
  toggle.addEventListener("click", function () {
    const input = document.getElementById("loginPass");
    const show = input.type === "password";
    input.type = show ? "text" : "password";
    toggle.textContent = show ? "Hide" : "Show";
  });
});
