/**
 * Page content retrieved with TinyFish MCP `fetch_content`
 * URL: https://4cc4797e.temp-web-tinyfish.pages.dev/
 * format: html, include_selectors: main/article/section/body
 */
const PAGE_HTML = `<body>
<div class="notice"><div class="wrap">
  Demo data site for a hackathon project. Not an official Scaler website. All entries below are sample data.
</div></div>
<header class="site"><div class="wrap">
<h1>ScalerPulse demo data</h1>

<p>Last updated: <time datetime="2026-11-01">1 November 2026</time>. Three sources are collected on this page: Scaler website, SST dashboard and NLogN.</p>
</div></header>
<nav aria-label="Sections" class="site"><div class="wrap">
<a href="#scaler-com">Scaler.com</a>
<a href="#sst-dashboard">SST dashboard</a>
<a href="#nlogn-sst">NLogN SST</a>
<a href="forms.html">Forms</a>
</div></nav>
<main>

<section class="source" id="scaler-com">
<div class="wrap">
<h2>Information from scaler.com</h2>
<p class="source-url">Source: scaler.com (public website and announcements)</p>

<article class="item">
<h3>Mid-semester exam schedule released</h3>
<p class="meta"><time datetime="2026-11-09">9 Nov 2026</time> | Priority: <span class="tag critical">critical</span> | Type: announcement</p>
<p>Mid-semester exams for Semester 1 run from 9 to 13 November. Carry your ID card. Seating plan will be shared 24 hours before each exam.</p>
</article>


<article class="item">
<h3>Guest lecture: building with AI agents</h3>
<p class="meta"><time datetime="2026-11-06">6 Nov 2026</time> | Priority: <span class="tag optional">optional</span> | Type: event | Venue: Auditorium, Bangalore campus</p>
<p>An industry speaker walks through how web agents are built. Open to all first-year students. No registration needed.</p>
</article>


<article class="item">
<h3>Fee instalment reminder</h3>
<p class="meta"><time datetime="2026-11-15">15 Nov 2026</time> | Priority: <span class="tag important">important</span> | Type: deadline</p>
<p>The second instalment is due by 15 November. Pay from the student portal to avoid a late fee.</p>
</article>


</div>
</section>

<section class="source" id="sst-dashboard">
<div class="wrap">
<h2>Information from sst-dashboard.com</h2>
<p class="source-url">Source: sst-dashboard.com (student dashboard export)</p>

<div class="table-scroll">
<table>
<caption>Assignments and deadlines</caption>
<thead><tr><th>Subject</th><th>Task</th><th>Due date</th><th>Priority</th></tr></thead>
<tbody>
<tr><td>Programming Basics</td><td>Lab 4: loops and arrays</td><td><time datetime="2026-11-04">4 Nov 2026, 11:59 PM</time></td><td><span class="tag important">important</span></td></tr>
<tr><td>Mathematics</td><td>Problem set 3</td><td><time datetime="2026-11-07">7 Nov 2026, 6:00 PM</time></td><td><span class="tag important">important</span></td></tr>
<tr><td>Communication Skills</td><td>Reflection essay</td><td><time datetime="2026-11-12">12 Nov 2026, 11:59 PM</time></td><td><span class="tag optional">optional</span></td></tr>

</tbody>
</table>
</div>

<article class="item">
<h3>Meal preference form for next week</h3>
<p class="meta">Deadline: <time datetime="2026-11-02">2 Nov 2026, 9:00 PM</time> | Priority: <span class="tag critical">critical</span> | Type: form</p>
<p>Choose your meals for 3 to 9 November. Fill it here: <a href="forms.html#meal-preference">Meal preference form</a>.</p>
</article>


</div>
</section>

<section class="source" id="nlogn-sst">
<div class="wrap">
<h2>Information from nlogn-sst.com</h2>
<p class="source-url">Source: nlogn-sst.com (coding club)</p>

<article class="item">
<h3>Weekly coding contest #12</h3>
<p class="meta"><time datetime="2026-11-08">8 Nov 2026, 8:00 PM</time> | Priority: <span class="tag important">important</span> | Type: contest | Duration: 2 hours</p>
<p>Four problems on arrays and strings. Top three get club points. Register on the contest page before it starts.</p>
</article>


<article class="item">
<h3>Intro to Git and GitHub workshop</h3>
<p class="meta"><time datetime="2026-11-05">5 Nov 2026, 5:30 PM</time> | Priority: <span class="tag optional">optional</span> | Type: workshop | Venue: Lab 2</p>
<p>Hands-on session for beginners. Bring your laptop.</p>
</article>


</div>
</section>
</main>
</body>`;

function stripTags(html) {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function parseAnnouncements(html) {
  const items = [];
  const articleRe =
    /<article class="item">[\s\S]*?<h3>([\s\S]*?)<\/h3>[\s\S]*?<time datetime="([^"]+)">([\s\S]*?)<\/time>[\s\S]*?<p>([\s\S]*?)<\/p>\s*<\/article>/g;

  let match;
  while ((match = articleRe.exec(html))) {
    items.push({
      title: stripTags(match[1]),
      date: stripTags(match[3]) || match[2],
      content: stripTags(match[4]),
    });
  }

  const rowRe =
    /<tr><td>([\s\S]*?)<\/td><td>([\s\S]*?)<\/td><td><time datetime="([^"]+)">([\s\S]*?)<\/time><\/td>/g;
  while ((match = rowRe.exec(html))) {
    items.push({
      title: stripTags(match[2]),
      date: stripTags(match[4]) || match[3],
      content: `${stripTags(match[1])} assignment deadline.`,
    });
  }

  return items;
}

const announcements = parseAnnouncements(PAGE_HTML);

if (require.main === module) {
  console.log(JSON.stringify(announcements, null, 2));
}

module.exports = announcements;
