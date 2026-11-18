/* ==========================================================
   labs.js - Labs table with search + filters, and a detail
   modal where you can start / complete a lab. Changes are saved
   and feed the dashboard (XP, rank, charts, achievements).
   ========================================================== */

document.addEventListener("DOMContentLoaded", function () {
  const body = document.getElementById("labsBody");
  const search = document.getElementById("searchInput");
  const statusFilter = document.getElementById("statusFilter");
  const platformFilter = document.getElementById("platformFilter");
  const count = document.getElementById("resultCount");
  const modalEl = document.getElementById("labModal");
  const modal = new bootstrap.Modal(modalEl);
  let openId = null;
  let sortKey = null, sortDir = 1; // 1 = ascending, -1 = descending
  const ORDER = {
    difficulty: { "Easy": 1, "Medium": 2, "Hard": 3 },
    status: { "Planned": 1, "In Progress": 2, "Completed": 3 }
  };

  function sortValue(l, key) {
    return ORDER[key] ? (ORDER[key][l[key]] || 0) : l[key];
  }

  function render() {
    const q = search.value.toLowerCase().trim();
    const rows = LABS.filter(function (l) {
      // search every visible column
      const hay = [l.name, l.platform, l.category, l.difficulty, l.status, l.points].join(" ").toLowerCase();
      return (!q || hay.includes(q)) &&
             (statusFilter.value === "All" || l.status === statusFilter.value) &&
             (platformFilter.value === "All" || l.platform === platformFilter.value);
    });

    if (sortKey) {
      rows.sort(function (a, b) {
        const x = sortValue(a, sortKey), y = sortValue(b, sortKey);
        const c = typeof x === "number" ? x - y : String(x).localeCompare(String(y));
        return (c || a.id - b.id) * sortDir;
      });
    }
    document.querySelectorAll("th.sortable").forEach(function (th) {
      const on = th.dataset.sort === sortKey;
      th.setAttribute("aria-sort", on ? (sortDir === 1 ? "ascending" : "descending") : "none");
      th.querySelector(".sort-ind").textContent = on ? (sortDir === 1 ? " ▲" : " ▼") : " ↕";
    });

    body.innerHTML = rows.length
      ? rows.map(function (l) {
          return '<tr data-id="' + l.id + '" tabindex="0">' +
            "<td>" + l.name + "</td>" +
            "<td>" + l.platform + "</td>" +
            "<td>" + l.category + "</td>" +
            "<td>" + difficultyBadge(l.difficulty) + "</td>" +
            "<td>" + statusBadge(l.status) + "</td>" +
            '<td class="text-end font-mono">' + l.points + "</td>" +
          "</tr>";
        }).join("")
      : '<tr><td colspan="6" class="text-center text-secondary py-4">No labs match your filters.</td></tr>';

    count.textContent = rows.length + " of " + LABS.length + " labs shown  ·  click a row for details";
  }

  function openModal(id) {
    const lab = LABS.find(function (l) { return l.id === id; });
    if (!lab) return;
    openId = id;
    document.getElementById("mTitle").textContent = lab.name;
    document.getElementById("mBadges").innerHTML =
      statusBadge(lab.status) + " " + difficultyBadge(lab.difficulty) +
      ' <span class="badge border text-body">' + lab.platform + "</span>";
    document.getElementById("mDesc").textContent = lab.desc;
    document.getElementById("mMeta").innerHTML =
      '<div class="col-6">Category<br><strong class="text-body-emphasis">' + lab.category + "</strong></div>" +
      '<div class="col-6">Reward<br><strong class="text-body-emphasis font-mono">+' + lab.points + " XP</strong></div>" +
      (lab.date ? '<div class="col-12 mt-2">Completed on <strong class="text-body-emphasis">' + lab.date + "</strong></div>" : "");

    const certs = CERTS.filter(function (c) { return c.labIds && c.labIds.indexOf(lab.id) !== -1; });
    document.getElementById("mMeta").innerHTML +=
      '<div class="col-12 mt-2">Tools<br>' + (lab.tools || []).map(function (t) { return '<span class="chip">' + t + "</span>"; }).join("") + "</div>" +
      '<div class="col-12 mt-2">Key takeaway<br><span class="text-body-emphasis">' + (lab.takeaway || "") + "</span></div>" +
      (certs.length ? '<div class="col-12 mt-2">Prepares you for<br>' + certs.map(function (c) { return '<span class="chip chip-acc">' + c.name + "</span>"; }).join("") + "</div>" : "");

    const actions = {
      "Planned":     [["In Progress", "Start lab", "btn-outline-secondary"], ["Completed", "Mark completed", "btn-rt"]],
      "In Progress": [["Completed", "Mark completed", "btn-rt"], ["Planned", "Back to planned", "btn-outline-secondary"]],
      "Completed":   [["In Progress", "Reopen", "btn-outline-secondary"]]
    }[lab.status];
    document.getElementById("mActions").innerHTML = actions.map(function (a) {
      return '<button type="button" class="btn ' + a[2] + '" data-status="' + a[0] + '">' + a[1] + "</button>";
    }).join("");
    modal.show();
  }

  function changeStatus(status) {
    const lab = LABS.find(function (l) { return l.id === openId; });
    const before = getRank(totalXP());
    setLabStatus(openId, status);
    const after = getRank(totalXP());
    modal.hide();
    render();
    if (status === "Completed") toast("+" + lab.points + " XP  ·  " + lab.name + " completed", "");
    else toast(lab.name + " → " + status, "");
    if (after.index > before.index) {
      setTimeout(function () { toast("RANK UP!  You are now " + after.name, "rankup"); }, 600);
    }
  }

  body.addEventListener("click", function (e) {
    const tr = e.target.closest("tr[data-id]");
    if (tr) openModal(Number(tr.dataset.id));
  });
  body.addEventListener("keydown", function (e) {
    const tr = e.target.closest("tr[data-id]");
    if (tr && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openModal(Number(tr.dataset.id)); }
  });
  document.getElementById("mActions").addEventListener("click", function (e) {
    const btn = e.target.closest("button[data-status]");
    if (btn) changeStatus(btn.dataset.status);
  });
  document.getElementById("resetBtn").addEventListener("click", function () {
    if (confirm("Reset all lab progress back to the sample data?")) resetState();
  });

  function toggleSort(th) {
    const key = th.dataset.sort;
    if (sortKey === key) sortDir = -sortDir; else { sortKey = key; sortDir = 1; }
    render();
  }
  document.querySelectorAll("th.sortable").forEach(function (th) {
    th.addEventListener("click", function () { toggleSort(th); });
    th.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleSort(th); }
    });
  });

  [search, statusFilter, platformFilter].forEach(function (el) { el.addEventListener("input", render); });
  render();
});
