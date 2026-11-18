/* ==========================================================
   about.js - Builds the About page tables from data.js so the
   explanation always matches the real data.
   ========================================================== */
document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("rankRows").innerHTML = RANKS.map(function (r) {
    return "<tr><td>" + r.name + '</td><td class="text-end font-mono">' + r.min + "</td></tr>";
  }).join("");

  function uniq(key) {
    return LABS.map(function (l) { return l[key]; }).filter(function (v, i, a) { return a.indexOf(v) === i; });
  }
  const fields = [
    ["Name", "What the lab is called", "Free text"],
    ["Platform", "Where the lab is hosted", uniq("platform").join(", ")],
    ["Category", "Skill area (feeds the radar and doughnut charts)", uniq("category").join(", ")],
    ["Difficulty", "How hard the lab is", "Easy, Medium, Hard"],
    ["Status", "Where you are with it", "Planned, In Progress, Completed"],
    ["XP (points)", "Reward when completed", "Number"],
    ["Tools / Key takeaway", "What you used and the main lesson", "Free text"]
  ];
  document.getElementById("fieldRows").innerHTML = fields.map(function (f) {
    return "<tr><td><strong>" + f[0] + "</strong></td><td>" + f[1] + "</td><td>" + f[2] + "</td></tr>";
  }).join("");

  document.getElementById("catChips").innerHTML = uniq("category").map(function (c) {
    const n = LABS.filter(function (l) { return l.category === c; }).length;
    return '<span class="chip chip-acc">' + c + " · " + n + "</span>";
  }).join("");

  const terms = [
    ["CTF", "Capture The Flag: a challenge where you find hidden strings (flags) by solving security puzzles."],
    ["XP", "Experience points earned by completing labs; they decide your rank."],
    ["Recon", "Reconnaissance: gathering information about a target before testing it."],
    ["Enumeration", "Listing what a target exposes: open ports, services, users and shares."],
    ["Exploit", "Code or a technique that takes advantage of a vulnerability."],
    ["Payload", "The action an exploit delivers, such as opening a remote shell."],
    ["PrivEsc", "Privilege escalation: gaining higher access, for example from a normal user to root."],
    ["OWASP Top 10", "A widely used list of the most critical web application security risks."],
    ["Active Directory", "Microsoft's directory service for managing users and computers in a Windows network."],
    ["Writeup", "A written walkthrough of how a lab or box was solved."]
  ];
  document.getElementById("glossaryList").innerHTML = terms.map(function (t) {
    return "<dt>" + t[0] + "</dt><dd>" + t[1] + "</dd>";
  }).join("");

  initReveal();
});
