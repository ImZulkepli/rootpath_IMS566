/* ==========================================================
   dashboard.js - Terminal hero, rank card, KPIs, charts,
   heatmap and achievements. Everything is computed from the
   LABS and CERTS data, so it stays meaningful when data changes.
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const done = LABS.filter(function (l) { return l.status === "Completed"; });
  const inProgress = LABS.filter(function (l) { return l.status === "In Progress"; });
  const xp = totalXP();
  const rank = getRank(xp);
  const certsDone = CERTS.filter(function (c) { return c.status === "Completed"; }).length;

  /* ----- KPI cards (animated count-up) ----- */
  countUp(document.getElementById("kpiCompleted"), done.length);
  countUp(document.getElementById("kpiProgress"), inProgress.length);
  countUp(document.getElementById("kpiPoints"), xp);
  countUp(document.getElementById("kpiCerts"), certsDone, " / " + CERTS.length);

  /* ----- Rank card ----- */
  document.getElementById("rankName").textContent = rank.name;
  document.getElementById("rankXp").textContent = xp + " XP";
  const bar = document.getElementById("rankBar");
  const note = document.getElementById("rankNote");
  if (rank.next) {
    const pct = Math.round(((xp - rank.min) / (rank.next.min - rank.min)) * 100);
    setTimeout(function () { bar.style.width = pct + "%"; }, 300);
    note.textContent = (rank.next.min - xp) + " XP to " + rank.next.name;
  } else {
    setTimeout(function () { bar.style.width = "100%"; }, 300);
    note.textContent = "Maximum rank reached";
  }

  const termBody = document.getElementById("termBody"), termForm = document.getElementById("termForm"), termInput = document.getElementById("termInput");
  const cmdHistory = []; let historyPos = 0;
  function print(text, cls) { const div = document.createElement("div"); div.className = cls || "out"; div.textContent = text; termBody.appendChild(div); termBody.scrollTop = termBody.scrollHeight; }
  function runCommand(line) {
    const parts = line.trim().split(/\s+/), name = (parts[0] || "").toLowerCase(), arg = parts[1];
    if (!name) return;
    switch (name) {
      case "help": ["help           list commands","whoami         show your username","rank           show rank and XP","labs           list all labs with IDs","next           show your next target","start <id>     start a lab","complete <id>  mark a lab completed","clear          clear the terminal"].forEach(function (t) { print(t); }); break;
      case "whoami": print(currentUser); break;
      case "rank": { const x = totalXP(), r = getRank(x); print(r.name + " | " + x + " XP" + (r.next ? " | " + (r.next.min - x) + " XP to " + r.next.name : "")); break; }
      case "labs": LABS.forEach(function (l) { print(String(l.id).padStart(2, " ") + "  " + l.status.padEnd(11, " ") + " " + l.name); }); break;
      case "next": { const u = LABS.find(function (l) { return l.status === "In Progress"; }) || LABS.find(function (l) { return l.status === "Planned"; }); print(u ? u.name + " [" + u.platform + "]" : "All targets completed."); break; }
      case "start": case "complete": {
        const lab = LABS.find(function (l) { return l.id === Number(arg); }); const ns = name === "start" ? "In Progress" : "Completed";
        if (!lab) { print("Usage: " + name + " <id>   (type 'labs' to see IDs)", "err"); break; }
        if (lab.status === ns) { print("Already " + ns.toLowerCase() + ": " + lab.name, "err"); break; }
        const before = getRank(totalXP()); setLabStatus(lab.id, ns);
        print(name === "start" ? "Started: " + lab.name : "Completed: " + lab.name + " (+" + lab.points + " XP)", "ok");
        if (getRank(totalXP()).index > before.index) print("RANK UP! You are now " + getRank(totalXP()).name, "ok");
        print("Refreshing dashboard...", "hint"); setTimeout(function () { location.reload(); }, 1400); break; }
      case "clear": termBody.innerHTML = ""; break;
      default: print("command not found: " + name + "  (type 'help')", "err");
    }
  }
  termForm.addEventListener("submit", function (e) { e.preventDefault(); const line = termInput.value; termInput.value = ""; print(line, "cmd"); if (line.trim()) cmdHistory.push(line); historyPos = cmdHistory.length; runCommand(line); });
  termInput.addEventListener("keydown", function (e) {
    if (e.key === "ArrowUp" && cmdHistory.length) { e.preventDefault(); historyPos = Math.max(0, historyPos - 1); termInput.value = cmdHistory[historyPos]; }
    else if (e.key === "ArrowDown") { e.preventDefault(); historyPos = Math.min(cmdHistory.length, historyPos + 1); termInput.value = cmdHistory[historyPos] || ""; } });
  document.querySelector(".terminal").addEventListener("click", function () { termInput.focus(); });

  // "? Help" button in the section menu: jump to the terminal and run `help`
  document.getElementById("helpBtn").addEventListener("click", function () {
    document.querySelector(".terminal").scrollIntoView({ behavior: "smooth", block: "center" });
    if (termInput.disabled) { toast("Terminal is still starting, try again in a moment"); return; }
    print("help", "cmd");
    runCommand("help");
    termInput.focus({ preventScroll: true });
  });
  const next = LABS.find(function (l) { return l.status === "In Progress"; }) || LABS.find(function (l) { return l.status === "Planned"; });
  typeLines(termBody, [
    { cls: "cmd", text: "whoami" }, { cls: "out", text: currentUser },
    { cls: "cmd", text: "rank --show" }, { cls: "out", text: rank.name + "  |  " + xp + " XP  |  " + done.length + " labs pwned" },
    { cls: "cmd", text: "next-target" }, { cls: "out", text: next ? next.name + "  [" + next.platform + "]" : "all targets pwned. add more labs!" }
  ], 26).then(function () { const c = termBody.querySelector(".caret"); if (c) c.remove(); print("Type 'help' to see commands.", "hint"); termInput.disabled = false; });

  /* ----- Chart defaults ----- */
  Chart.defaults.color = cssVar("--rt-chart-text");
  Chart.defaults.borderColor = cssVar("--rt-chart-grid");
  Chart.defaults.font.family = "Inter, system-ui, sans-serif";

  /* ----- Radar: skill coverage by category ----- */
  const skills = categoryScores();
  new Chart(document.getElementById("radarChart"), {
    type: "radar",
    data: {
      labels: skills.map(function (s) { return s.name; }),
      datasets: [{
        label: "Skill coverage (%)",
        data: skills.map(function (s) { return s.score; }),
        backgroundColor: accentA(0.25),
        borderColor: accentA(1),
        pointBackgroundColor: accentA(1),
        borderWidth: 2
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        r: {
          min: 0, max: 100,
          ticks: { display: false, stepSize: 25 },
          grid: { color: cssVar("--rt-chart-grid") },
          angleLines: { color: cssVar("--rt-chart-grid") },
          pointLabels: { color: cssVar("--rt-chart-label"), font: { size: 11 } }
        }
      }
    }
  });

  /* ----- Bar + line: XP per month and cumulative ----- */
  const now = new Date();
  const monthKeys = [];
  for (let i = 4; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthKeys.push({
      key: d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"),
      label: d.toLocaleString("en", { month: "short" })
    });
  }
  const firstKey = monthKeys[0].key;
  let running = done.filter(function (l) { return l.date && l.date.slice(0, 7) < firstKey; })
                    .reduce(function (s, l) { return s + l.points; }, 0);
  const monthly = [], cumulative = [];
  monthKeys.forEach(function (m) {
    const pts = done.filter(function (l) { return l.date && l.date.slice(0, 7) === m.key; })
                    .reduce(function (s, l) { return s + l.points; }, 0);
    running += pts;
    monthly.push(pts);
    cumulative.push(running);
  });

  new Chart(document.getElementById("monthChart"), {
    type: "bar",
    data: {
      labels: monthKeys.map(function (m) { return m.label; }),
      datasets: [
        {
          type: "line", label: "Total XP", data: cumulative, order: 0,
          borderColor: cssVar("--rt-chart-line"), borderWidth: 2, tension: 0.4,
          pointBackgroundColor: cssVar("--rt-chart-line"), pointRadius: 4
        },
        {
          label: "XP earned that month", data: monthly, order: 1, borderRadius: 8,
          backgroundColor: function (ctx) {
            const area = ctx.chart.chartArea;
            if (!area) return accentA(0.6);
            const g = ctx.chart.ctx.createLinearGradient(0, area.bottom, 0, area.top);
            g.addColorStop(0, accentA(0.15));
            g.addColorStop(1, accentA(0.95));
            return g;
          }
        }
      ]
    },
    options: {
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: { legend: { position: "bottom" } },
      scales: { y: { beginAtZero: true, title: { display: true, text: "XP" } } }
    }
  });

  /* ----- Doughnut: completed labs by category ----- */
  const byCategory = {};
  done.forEach(function (l) { byCategory[l.category] = (byCategory[l.category] || 0) + 1; });
  new Chart(document.getElementById("categoryChart"), {
    type: "doughnut",
    data: {
      labels: Object.keys(byCategory),
      datasets: [{
        data: Object.values(byCategory),
        backgroundColor: ["#22d3ee", "#a855f7", "#f59e0b", "#ec4899", "#34d399", "#60a5fa", "#f87171"],
        borderWidth: 0, hoverOffset: 10
      }]
    },
    options: {
      maintainAspectRatio: false,
      cutout: "68%",
      plugins: {
        legend: { position: "bottom", labels: { boxWidth: 10 } },
        tooltip: { callbacks: { label: function (c) { return c.label + ": " + c.parsed + " lab(s)"; } } }
      }
    }
  });

  /* ----- Stacked bar: labs completed per month by difficulty ----- */
  const diffColors = { Easy: "#34d399", Medium: "#f59e0b", Hard: "#f87171" };
  new Chart(document.getElementById("difficultyChart"), {
    type: "bar",
    data: {
      labels: monthKeys.map(function (m) { return m.label; }),
      datasets: ["Easy", "Medium", "Hard"].map(function (level) {
        return {
          label: level,
          backgroundColor: diffColors[level],
          borderRadius: 4,
          data: monthKeys.map(function (m) {
            return done.filter(function (l) {
              return l.difficulty === level && l.date && l.date.slice(0, 7) === m.key;
            }).length;
          })
        };
      })
    },
    options: {
      maintainAspectRatio: false,
      plugins: { legend: { position: "bottom", labels: { boxWidth: 10 } } },
      scales: {
        x: { stacked: true },
        y: { stacked: true, beginAtZero: true, ticks: { precision: 0 }, title: { display: true, text: "Labs" } }
      }
    }
  });

  /* ----- Gauge: overall roadmap completion ----- */
  const roadmapPct = Math.round(CERTS.reduce(function (s, c) { return s + c.progress; }, 0) / CERTS.length);
  document.getElementById("gaugeNote").textContent = certsDone + " of " + CERTS.length + " milestones completed";
  new Chart(document.getElementById("gaugeChart"), {
    type: "doughnut",
    data: {
      labels: ["Complete", "Remaining"],
      datasets: [{
        data: [roadmapPct, 100 - roadmapPct],
        backgroundColor: [accentA(1), cssVar("--rt-chart-grid")],
        borderWidth: 0
      }]
    },
    options: {
      maintainAspectRatio: false,
      rotation: -90, circumference: 180, cutout: "74%",
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: function (c) { return c.label + ": " + c.parsed + "%"; } } }
      }
    },
    plugins: [{
      id: "gaugeText",
      afterDraw: function (chart) {
        const arc = chart.getDatasetMeta(0).data[0];
        const g = chart.ctx;
        g.save();
        g.textAlign = "center";
        g.fillStyle = cssVar("--rt-strong");
        g.font = "800 34px 'JetBrains Mono', monospace";
        g.fillText(roadmapPct + "%", arc.x, arc.y - 24);
        g.fillStyle = cssVar("--rt-muted");
        g.font = "12px Inter, sans-serif";
        g.fillText("of roadmap complete", arc.x, arc.y - 4);
        g.restore();
      }
    }]
  });

  /* ----- Sankey: platform -> category -> status (counts labs) ----- */
  const flowCount = {};
  function addFlow(from, to) { const k = from + "|" + to; flowCount[k] = (flowCount[k] || 0) + 1; }
  LABS.forEach(function (l) { addFlow(l.platform, l.category); addFlow(l.category, l.status); });
  const flowData = Object.keys(flowCount).map(function (k) {
    const p = k.split("|");
    return { from: p[0], to: p[1], flow: flowCount[k] };
  });
  const nodeColors = { "TryHackMe": "#60a5fa", "HackTheBox": "#a3e635", "Completed": "#34d399", "In Progress": "#f59e0b", "Planned": "#64748b" };
  function nodeColor(name) { return nodeColors[name] || accentA(0.9); }
  new Chart(document.getElementById("sankeyChart"), {
    type: "sankey",
    data: {
      datasets: [{
        label: "Labs",
        data: flowData,
        colorFrom: function (c) { return nodeColor(c.dataset.data[c.dataIndex].from); },
        colorTo: function (c) { return nodeColor(c.dataset.data[c.dataIndex].to); },
        colorMode: "gradient",
        color: cssVar("--rt-chart-label")
      }]
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function (c) {
              const f = c.dataset.data[c.dataIndex];
              return f.from + " → " + f.to + ": " + f.flow + " lab(s)";
            }
          }
        }
      }
    }
  });

  /* ----- Activity heatmap (last 26 weeks) ----- */
  const counts = {};
  done.forEach(function (l) { if (l.date) counts[l.date] = (counts[l.date] || 0) + 1; });
  const heat = document.getElementById("heatmap");
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - (26 * 7 - 1));
  start.setDate(start.getDate() - start.getDay()); // go back to a Sunday
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const key = isoDate(d);
    const n = counts[key] || 0;
    const cell = document.createElement("div");
    cell.className = "hm" + (n ? " l" + Math.min(n, 3) : "");
    cell.title = key + ": " + n + " lab(s) completed";
    heat.appendChild(cell);
  }
  heat.scrollLeft = heat.scrollWidth; // newest weeks visible on mobile

  /* ----- Achievements ----- */
  const list = getAchievements();
  const unlocked = list.filter(function (a) { return a.unlocked; }).length;
  document.getElementById("achCount").textContent = unlocked + " / " + list.length + " unlocked";
  document.getElementById("achGrid").innerHTML = list.map(function (a) {
    return '<div class="col-6 col-md-3"><div class="badge-tile ' + (a.unlocked ? "unlocked" : "locked") + '">' +
      '<div class="badge-ico" aria-hidden="true">' + (a.unlocked ? a.icon : "🔒") + "</div>" +
      '<div><div class="fw-semibold small">' + a.title + '</div><div class="text-secondary tiny">' + a.desc + "</div></div>" +
      "</div></div>";
  }).join("");

  /* ----- Certification progress bars ----- */
  document.getElementById("progressList").innerHTML = CERTS.map(function (c) {
    return '<div class="mb-3">' +
      '<div class="d-flex justify-content-between small"><span>' + c.name + "</span><span>" + c.progress + "%</span></div>" +
      '<div class="progress" role="progressbar" aria-valuenow="' + c.progress + '" aria-valuemin="0" aria-valuemax="100">' +
      '<div class="progress-bar rt-bar" style="width:' + c.progress + '%"></div></div></div>';
  }).join("");

  /* ----- Section menu: highlight the section being viewed ----- */
  const spyNav = document.getElementById("sectionNav");
  const spyLinks = Array.prototype.slice.call(spyNav.querySelectorAll("a"));
  const spySections = spyLinks.map(function (a) { return document.querySelector(a.getAttribute("href")); });
  let spyTicking = false;
  function updateSpy() {
    spyTicking = false;
    let current = 0;
    spySections.forEach(function (sec, i) { if (sec && sec.getBoundingClientRect().top <= 170) current = i; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = spySections.length - 1;
    spyLinks.forEach(function (a, i) { a.classList.toggle("active", i === current); });
    if (spyNav.scrollWidth > spyNav.clientWidth) {
      spyNav.scrollTo({ left: spyLinks[current].offsetLeft - 16, behavior: "smooth" });
    }
  }
  window.addEventListener("scroll", function () {
    if (!spyTicking) { spyTicking = true; requestAnimationFrame(updateSpy); }
  }, { passive: true });
  updateSpy();

  initReveal();
});
