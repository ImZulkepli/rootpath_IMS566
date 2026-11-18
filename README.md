# RootPath

**IMS566 Advanced Web Design Development and Content Management: Individual Project**

RootPath is a gamified web app prototype for tracking offensive security learning: labs and CTF rooms (TryHackMe, HackTheBox), XP and ranks, skills coverage, and a certification roadmap leading to a cybersecurity internship.

## Live Demo
- Website: `https://<your-username>.github.io/<repo-name>/`
- Repository: https://github.com/ImZulkepli/rootpath_IMS566

## Features
- **Login / Register** landing page with a hero headline ("Your road to root.") and live stat counters, plus error feedback (invalid credentials, short password, duplicate username), an interactive particle-network background and an "Access granted" transition
- **Light and dark mode** toggle (sun/moon button) on every page, plus a theme-colour switcher (red by default, plus green, cyan and purple); charts recolour to match the mode
- **Responsive navigation** on every page
- **Dashboard**: interactive terminal, rank and XP progress, animated KPI counters, and six Chart.js visualisations (skill radar, XP growth bar + line, labs-by-category doughnut, difficulty-per-month stacked bar, roadmap completion gauge and a platform → category → status Sankey diagram), plus an activity heatmap, achievements and certification progress
- **WebGL shader background** on every page (flowing noise glow + perspective grid, written as a raw GLSL fragment shader with no library). It follows the accent colour and light/dark mode, reacts to the mouse, pauses when the tab is hidden, and falls back to a CSS dot grid if WebGL is unavailable or "reduce motion" is on
- **Section menu** on the dashboard that sticks under the navbar, highlights the section you are viewing, and has a **? Help** button that runs the terminal's `help` command
- **Interactive terminal** on the dashboard: type `help`, `rank`, `labs`, `next`, `start <id>`, `complete <id>` or `clear` (arrow keys recall previous commands); completing a lab updates XP, rank and every chart
- **Labs page**: table with click-to-sort headers (ascending / descending on every column), a search box that matches every column (lab, platform, category, difficulty, status, XP) and status/platform filters. Click a lab to start it or mark it completed; XP, rank, charts and achievements update live (rank-up toast included)
- **Roadmap page**: vertical timeline with animated progress rings. Each certification shows what it validates, its linked prep labs (ticked when completed) and a provider link; progress is calculated from those labs
- **Certificates earned** section on the Roadmap (from the `EARNED` array in `js/data.js`; add an optional image in `images/certs/`)
- **Lab detail**: tools used, key takeaway and the certifications each lab prepares you for
- **About page**: how XP, ranks and progress are calculated, the content structure (metadata fields and vocabularies, generated from the real data), a glossary and an ethics and scope notice
- Route guard (pages redirect to login if not logged in), footer, page titles and meta descriptions on every page
- Respects the "reduce motion" accessibility setting

## How to Test Login
| Field | Value |
|---|---|
| Username | `demo` |
| Password | `rootpath123` |

The demo username and password are also shown on the login card. Wrong credentials show an error and shake the form. You can also create an account on the **Register** tab (stored in your browser's localStorage only).

**Quick demo tip:** on the Dashboard terminal type `labs` to see the lab IDs, then `complete 8`. The page refreshes with a rank-up and updated charts. You can do the same on the **Labs** page by clicking *Metasploit: Introduction* and pressing *Mark completed*. Use *Reset progress* on the Labs page to restore the sample data.

## Data and Storage
- All content (labs, certifications, ranks, achievements and the demo login) is **hardcoded in `js/data.js`**, so every visitor sees the same data. No database or server is used.
- The browser's local storage is only used for optional demo extras: lab status changes made on the Labs page or in the terminal, accounts created on the Register tab, and the chosen theme colour and light/dark mode. The site works fully without them. If they are missing, everything simply shows the default hardcoded data.

## Content Structure
- **Labs** are records with the same metadata: platform, category, difficulty, status, XP, tools and a key takeaway. Fixed vocabularies keep content consistent and make it sortable and searchable.
- **Certifications** link to labs through `labIds`. Progress = completed linked labs / total linked labs. Certifications without linked labs (e.g. Security+) use a manual estimate.
- **XP and ranks**: XP is the sum of completed labs' points (set by hand from estimated effort); ranks use XP thresholds. Everything is documented on the in-app **About** page.
- **Sample data:** the labs, dates and takeaways are sample content for the prototype. Replace them in `js/data.js` with your own.

## Ethics
RootPath only tracks learning. Practise only on legal, authorised targets (TryHackMe, HackTheBox, your own machines).

## Frameworks and Libraries
- [Bootstrap 5.3](https://getbootstrap.com/) for layout, components and responsiveness
- [Chart.js 4](https://www.chartjs.org/) for data visualisation
- [chartjs-chart-sankey](https://github.com/kurkle/chartjs-chart-sankey) plugin for the Sankey diagram
- Google Fonts (Inter, JetBrains Mono)
- Vanilla JavaScript (no build step)

## Project Structure
```
rootpath/
├── index.html        Login / Register
├── dashboard.html    Dashboard
├── labs.html         Data view 1: labs table + detail modal
├── roadmap.html      Data view 2: certification timeline
├── about.html        XP logic, content structure, glossary, ethics
├── css/style.css     Custom theme and animations
├── js/
│   ├── theme.js      Accent colour + light/dark mode (loaded first)
│   ├── data.js       Datasets, XP/rank system, achievements
│   ├── shader.js     WebGL shader background
│   ├── fx.js         Particle network, typing, count-up, toasts, reveal
│   ├── auth.js       Login / register logic
│   ├── app.js        Route guard, navbar, badge helpers
│   ├── dashboard.js  Dashboard widgets, charts and interactive terminal
│   ├── labs.js       Labs table, filters, modal
│   └── roadmap.js    Roadmap timeline
└── README.md
```

## Run Locally
Open `index.html` in Google Chrome (internet needed for the Bootstrap, Chart.js, Sankey plugin and font CDN links).

## Deploy on GitHub Pages
1. Push this folder to a GitHub repository.
2. Go to **Settings > Pages**.
3. Under **Source**, choose the `main` branch and `/ (root)`, then Save.
4. Wait about a minute, then open the link shown.

## Note
Authentication is simulated for learning purposes only. Credentials are not secure and no data is stored on a server.
