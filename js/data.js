/* ==========================================================
   data.js - Datasets, XP/rank system and achievements.
   Edit the LABS and CERTS arrays to use your own data.
   Progress you make in the app (start/complete a lab) is saved
   in localStorage, so the dashboard updates live.
   ========================================================== */

// Hardcoded demo account (assignment allows simulated authentication)
const DEMO_USER = { username: "demo", password: "rootpath123", name: "Demo Student" };

// ---------- Dataset 1: Labs / CTF rooms ----------
const LABS = [
  { id: 1,  name: "Pre Security: Intro to Networking", platform: "TryHackMe",  category: "Networking",   difficulty: "Easy",   status: "Completed",   points: 50,  date: "2026-08-03", desc: "OSI model, IP addressing, ports and how data moves across a network.", tools: ["ping","traceroute","whois"], takeaway: "Know how the OSI and TCP/IP layers map to real traffic before attacking anything." },
  { id: 2,  name: "Linux Fundamentals Part 1",         platform: "TryHackMe",  category: "Linux",        difficulty: "Easy",   status: "Completed",   points: 40,  date: "2026-08-06", desc: "Navigate the terminal, manage files and run your first commands.", tools: ["bash","grep","find","cat"], takeaway: "Terminal comfort is the base skill every other lab assumes." },
  { id: 3,  name: "Linux Fundamentals Part 2",         platform: "TryHackMe",  category: "Linux",        difficulty: "Easy",   status: "Completed",   points: 40,  date: "2026-08-17", desc: "Permissions, processes, and basic shell scripting.", tools: ["chmod","ps","cron","bash scripts"], takeaway: "Permissions and processes explain most Linux privilege issues later on." },
  { id: 4,  name: "OWASP Top 10",                      platform: "TryHackMe",  category: "Web",          difficulty: "Easy",   status: "Completed",   points: 80,  date: "2026-09-02", desc: "The ten most critical web application security risks, with hands-on tasks.", tools: ["Browser DevTools","cURL"], takeaway: "Most web flaws come from trusting user input; the Top 10 names give you a shared vocabulary with real reports." },
  { id: 5,  name: "Nmap: The Basics",                  platform: "TryHackMe",  category: "Recon",        difficulty: "Easy",   status: "Completed",   points: 60,  date: "2026-09-09", desc: "Host discovery, port scanning and service detection.", tools: ["nmap"], takeaway: "Enumeration comes first: what is listening decides what you try next." },
  { id: 6,  name: "Burp Suite: The Basics",            platform: "TryHackMe",  category: "Web",          difficulty: "Medium", status: "Completed",   points: 90,  date: "2026-09-22", desc: "Intercept, modify and replay HTTP requests with Burp.", tools: ["Burp Suite","Proxy","Repeater"], takeaway: "Intercepting and replaying requests shows what the browser hides from you." },
  { id: 7,  name: "SQL Injection Lab",                 platform: "TryHackMe",  category: "Web",          difficulty: "Medium", status: "Completed",   points: 100, date: "2026-10-05", desc: "Find and exploit SQL injection in a safe, intentionally vulnerable app.", tools: ["Browser","SQL payloads","Burp Suite"], takeaway: "Never build queries by joining user input; parameterised queries stop this whole bug class." },
  { id: 8,  name: "Metasploit: Introduction",          platform: "TryHackMe",  category: "Exploitation", difficulty: "Medium", status: "In Progress", points: 120, date: null,         desc: "Use the Metasploit framework: modules, payloads and sessions.", tools: ["Metasploit","msfconsole","Meterpreter"], takeaway: "Frameworks speed up exploitation, but you still need to know why a module works." },
  { id: 9,  name: "Starting Point: Meow",              platform: "HackTheBox", category: "Recon",        difficulty: "Easy",   status: "Completed",   points: 30,  date: "2026-10-12", desc: "Your first HackTheBox machine: enumerate a service and get in.", tools: ["nmap","telnet"], takeaway: "Weak or default credentials on an exposed service are a real way in." },
  { id: 10, name: "Starting Point: Fawn",              platform: "HackTheBox", category: "Networking",   difficulty: "Easy",   status: "Completed",   points: 30,  date: "2026-10-12", desc: "Learn FTP basics and anonymous access on a lab target.", tools: ["ftp","nmap"], takeaway: "Anonymous access on legacy services leaks files, so always check for it." },
  { id: 11, name: "Privilege Escalation: Linux",       platform: "TryHackMe",  category: "PrivEsc",      difficulty: "Hard",   status: "In Progress", points: 150, date: null,         desc: "Escalate from a low-privilege user to root using common misconfigurations.", tools: ["LinPEAS","sudo -l","SUID files","cron"], takeaway: "Misconfigurations (sudo, SUID, cron) are the usual road from user to root." },
  { id: 12, name: "Active Directory Basics",           platform: "TryHackMe",  category: "Active Directory", difficulty: "Medium", status: "Planned", points: 110, date: null,         desc: "Domains, users, groups and how Windows networks are organised.", tools: ["Windows Server","AD Users and Computers","PowerShell"], takeaway: "Domains, users and groups must be understood before attacking Active Directory." },
  { id: 13, name: "Wireshark: Packet Operations",      platform: "TryHackMe",  category: "Networking",   difficulty: "Medium", status: "Planned",     points: 100, date: null,         desc: "Capture and filter traffic to spot suspicious activity.", tools: ["Wireshark","display filters"], takeaway: "Reading packets is how you verify what a scan or exploit really did." },
  { id: 14, name: "Retired Box: Lame",                 platform: "HackTheBox", category: "Exploitation", difficulty: "Easy",   status: "Planned",     points: 70,  date: null,         desc: "A classic beginner box: enumerate, exploit and capture the flags.", tools: ["nmap","Metasploit","smbclient"], takeaway: "Chain enumeration into a known vulnerable service version, then confirm both flags." }
];

// ---------- Dataset 2: Certification / skills roadmap ----------
const CERTS = [
  { id: 1, name: "TryHackMe Pre Security",            provider: "TryHackMe",    level: "Foundation",   status: "Completed",   progress: 100, target: "Sep 2026", labIds: [1, 2, 3],
    focus: "Networking, Linux and web basics: the starting point before any offensive work.", site: "https://tryhackme.com" },
  { id: 2, name: "CompTIA Security+ (SY0-701)",       provider: "CompTIA",      level: "Foundation",   status: "In Progress", progress: 35,  target: "Mar 2027",
    focus: "Broad security fundamentals (threats, architecture, operations, governance). Study-based, so progress is a manual estimate.", site: "https://www.comptia.org" },
  { id: 3, name: "TryHackMe Offensive Pentesting",    provider: "TryHackMe",    level: "Intermediate", status: "In Progress", progress: 40,  target: "Jan 2027", labIds: [5, 6, 7, 8, 11],
    focus: "Hands-on pentest workflow: recon, web attacks, exploitation and privilege escalation.", site: "https://tryhackme.com" },
  { id: 4, name: "eJPT (Junior Penetration Tester)",  provider: "INE",          level: "Intermediate", status: "Planned",     progress: 0,   target: "Jun 2027", labIds: [8, 13, 14],
    focus: "Practical entry-level pentest exam: enumeration, exploitation and reporting in a lab network.", site: "https://ine.com" },
  { id: 5, name: "PJPT (Practical Junior Pentester)", provider: "TCM Security", level: "Intermediate", status: "Planned",     progress: 0,   target: "Aug 2027", labIds: [11, 12],
    focus: "Practical exam centred on Active Directory and network attacks, finished with a report.", site: "https://tcm-sec.com" },
  { id: 6, name: "Cybersecurity Internship (Practicum)", provider: "UiTM",      level: "Career",       status: "Planned",     progress: 0,   target: "Sep 2027",
    focus: "The goal of the whole roadmap: apply the skills in a real security team.", site: null }
];

// ---------- Dataset 3: Certificates already earned ----------
// Add more entries here. "img" is optional: put the certificate image in
// images/certs/ and set img: "images/certs/file.png" (leave null for an icon).
// "pdf" is optional too: path to the PDF, shown as a "View PDF" link.
const EARNED = [
  { name: "Become a Data Analyst with No Coding: Microsoft Excel", issuer: "KSWAMY Global Academy (National Training Week 2026, HRD Corp)", type: "Course", date: "14 Jun 2026", img: "images/certs/excel-data-analyst.png", pdf: "images/certs/excel-data-analyst.pdf" },
  { name: "AI Security: Blue & Red Using AI", issuer: "GDGoC UPM", type: "Workshop", date: "20 Jun 2026", img: "images/certs/ai-security-gdgoc.png", pdf: "images/certs/ai-security-gdgoc.pdf" },
  { name: "Cybersecurity Training (APAC Cybersecurity Fund Malaysia)", issuer: "Trainocate, The Asia Foundation", type: "Training", date: "Certificate of completion", img: "images/certs/apac-cybersecurity.png", pdf: "images/certs/apac-cybersecurity.pdf" }
];

// ---------- Ranks ----------
const RANKS = [
  { name: "Script Kiddie", min: 0 },
  { name: "Recon Rookie",  min: 150 },
  { name: "Packet Hunter", min: 400 },
  { name: "Exploit Dev",   min: 640 },
  { name: "Red Teamer",    min: 1000 }
];

// ---------- Saved progress (localStorage) ----------
const STATE_KEY = "rt_state";

function loadState() {
  try { return JSON.parse(localStorage.getItem(STATE_KEY)) || {}; }
  catch (e) { return {}; }
}

function isoDate(d) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + m + "-" + day;
}

function applyState() {
  const saved = loadState();
  LABS.forEach(function (lab) {
    if (saved[lab.id]) {
      lab.status = saved[lab.id].status;
      lab.date = saved[lab.id].date;
    }
  });
}

function setLabStatus(id, status) {
  const saved = loadState();
  const lab = LABS.find(function (l) { return l.id === id; });
  const date = status === "Completed" ? isoDate(new Date()) : null;
  saved[id] = { status: status, date: date };
  try { localStorage.setItem(STATE_KEY, JSON.stringify(saved)); } catch (e) {}
  lab.status = status;
  lab.date = date;
  syncCerts();
}

function resetState() {
  try { localStorage.removeItem(STATE_KEY); } catch (e) {}
  location.reload();
}

applyState();

// Cert progress is derived from its linked prep labs (labIds); certs without
// labIds keep the manual progress value above. Status follows the progress.
function syncCerts() {
  CERTS.forEach(function (c) {
    if (!c.labIds) return;
    const done = c.labIds.filter(function (id) {
      const l = LABS.find(function (x) { return x.id === id; });
      return l && l.status === "Completed";
    }).length;
    c.progress = Math.round((done / c.labIds.length) * 100);
    if (c.progress === 100) c.status = "Completed";
    else if (c.progress > 0) c.status = "In Progress";
    else c.status = "Planned";
  });
}
syncCerts();

// ---------- XP, rank, skills, achievements ----------
function totalXP() {
  return LABS.filter(function (l) { return l.status === "Completed"; })
             .reduce(function (s, l) { return s + l.points; }, 0);
}

function getRank(xp) {
  let idx = 0;
  RANKS.forEach(function (r, i) { if (xp >= r.min) idx = i; });
  const next = RANKS[idx + 1] || null;
  return { index: idx, name: RANKS[idx].name, min: RANKS[idx].min, next: next };
}

// Skill score per category = completed points / total points (0-100)
function categoryScores() {
  const cats = {};
  LABS.forEach(function (l) {
    cats[l.category] = cats[l.category] || { done: 0, total: 0 };
    cats[l.category].total += l.points;
    if (l.status === "Completed") cats[l.category].done += l.points;
  });
  return Object.keys(cats).map(function (name) {
    return { name: name, score: Math.round((cats[name].done / cats[name].total) * 100) };
  });
}

function countDone(filterFn) {
  return LABS.filter(function (l) { return l.status === "Completed" && filterFn(l); }).length;
}

function getAchievements() {
  const platformsDone = new Set(LABS.filter(function (l) { return l.status === "Completed"; })
                                    .map(function (l) { return l.platform; }));
  return [
    { icon: "🩸", title: "First Blood",     desc: "Complete your first lab",         unlocked: countDone(function () { return true; }) >= 1 },
    { icon: "🕸️", title: "Web Warrior",     desc: "Complete 3 web labs",             unlocked: countDone(function (l) { return l.category === "Web"; }) >= 3 },
    { icon: "🐧", title: "Linux Ninja",     desc: "Complete 2 Linux labs",           unlocked: countDone(function (l) { return l.category === "Linux"; }) >= 2 },
    { icon: "📡", title: "Net Navigator",   desc: "Complete 2 networking labs",      unlocked: countDone(function (l) { return l.category === "Networking"; }) >= 2 },
    { icon: "🌐", title: "Both Worlds",     desc: "Finish labs on 2 platforms",      unlocked: platformsDone.size >= 2 },
    { icon: "💯", title: "XP Hunter",       desc: "Earn 500 XP",                     unlocked: totalXP() >= 500 },
    { icon: "🎓", title: "Cert Collector",  desc: "Complete a certification",        unlocked: CERTS.some(function (c) { return c.status === "Completed"; }) },
    { icon: "👑", title: "Red Teamer",      desc: "Reach the top rank",              unlocked: totalXP() >= RANKS[RANKS.length - 1].min }
  ];
}
