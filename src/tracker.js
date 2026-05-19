#!/usr/bin/env node
// 🔥 streakkeeper — Habit Streak Tracker

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const GREEN  = '\x1b[32m'; const YELLOW = '\x1b[33m';
const CYAN   = '\x1b[36m'; const BOLD   = '\x1b[1m';
const DIM    = '\x1b[2m';  const RED    = '\x1b[31m';
const NC     = '\x1b[0m';

const DATA_FILE = '.streakkeeper.json';
const SHADES    = ['░', '▒', '▓', '█'];

// ── Storage ───────────────────────────────────────────────
function loadData() {
  if (!fs.existsSync(DATA_FILE)) return { habits: {}, logs: {} };
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function saveData(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

function today() { return new Date().toISOString().slice(0, 10); }

// ── Streak calc ───────────────────────────────────────────
function calcStreak(logs, habit) {
  const dates = Object.keys(logs[habit] || {}).filter(d => logs[habit][d] > 0).sort().reverse();
  if (!dates.length) return { current: 0, longest: 0, total: dates.length };

  let current = 0;
  let longest = 0;
  let streak  = 0;
  let prev    = null;

  for (const d of dates) {
    if (!prev) { streak = 1; prev = d; continue; }
    const expected = new Date(new Date(d) + 86400000).toISOString().slice(0, 10);
    if (prev === expected) { streak++; }
    else { longest = Math.max(longest, streak); streak = 1; }
    prev = d;
  }
  longest = Math.max(longest, streak);

  // Current = streak from today backwards
  let cur = 0;
  let check = today();
  while (logs[habit]?.[check] > 0) {
    cur++;
    check = new Date(new Date(check) - 86400000).toISOString().slice(0, 10);
  }

  return { current: cur, longest, total: dates.length };
}

// ── Calendar heatmap ──────────────────────────────────────
function renderCalendar(logs, habit, weeks = 16) {
  const now    = new Date();
  const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const vals   = Object.values(logs[habit] || {}).filter(v => v > 0);
  const max    = Math.max(...vals, 1);

  console.log(`\n${CYAN}${BOLD}🔥 ${habit} — last ${weeks} weeks${NC}\n`);

  let monthRow = '     ';
  let lastMo   = -1;
  const grid   = [];

  for (let w = weeks - 1; w >= 0; w--) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(now - (w * 7 + (6 - d)) * 86400000);
      const key  = date.toISOString().slice(0, 10);
      const val  = logs[habit]?.[key] || 0;
      const lvl  = val === 0 ? 0 : Math.ceil((val / max) * 4);
      week.push({ lvl, val });
      if (d === 0 && date.getMonth() !== lastMo) {
        if (w < weeks - 1) monthRow += MONTHS[date.getMonth()].slice(0, 3) + ' ';
        else monthRow += '    ';
        lastMo = date.getMonth();
      } else if (d === 0) {
        monthRow += '    ';
      }
    }
    grid.push(week);
  }

  console.log(DIM + monthRow + NC);
  [1, 3, 5].forEach(di => {
    const DNAMES = ['','Mon','','Wed','','Fri',''];
    let row = DIM + (DNAMES[di] || '   ').padEnd(5) + NC;
    grid.forEach(w => {
      const { lvl } = w[di];
      const color   = lvl === 0 ? DIM : GREEN;
      const shade   = lvl === 0 ? '░' : SHADES[Math.min(lvl - 1, 3)];
      row += `${color}${shade}${shade}${NC} `;
    });
    console.log(row);
  });
}

// ── Status ────────────────────────────────────────────────
function showStatus(data) {
  const habits = Object.keys(data.habits);
  if (!habits.length) { console.log(`${YELLOW}No habits tracked yet. Run: node src/tracker.js log "workout"${NC}\n`); return; }

  console.log(`\n${CYAN}${BOLD}🔥 streakkeeper — Today's Status (${today()})${NC}\n`);
  habits.forEach(habit => {
    const { current, longest, total } = calcStreak(data.logs, habit);
    const doneToday = data.logs[habit]?.[today()] > 0;
    const icon      = doneToday ? GREEN + '✅' : YELLOW + '○ ';
    const fire      = current >= 7 ? '🔥' : current >= 3 ? '✨' : '';
    console.log(`  ${icon}${NC} ${BOLD}${habit}${NC}`);
    console.log(`     Current: ${fire} ${current > 0 ? GREEN + current + ' days' + NC : DIM + 'none' + NC}   Longest: 💎 ${longest}d   Total: ${total} days`);
  });
  console.log();
}

// ── Commit to git ─────────────────────────────────────────
function commitLog(habit, value) {
  try {
    execSync(`git add ${DATA_FILE} 2>/dev/null && git commit -m "🔥 streak: logged ${habit} (${value}) on ${today()}" 2>/dev/null`, { stdio: 'pipe' });
    return true;
  } catch { return false; }
}

// ── CLI ───────────────────────────────────────────────────
const args  = process.argv.slice(2);
const cmd   = args[0] || 'status';
const habit = args[1];
const value = parseFloat(args[args.indexOf('--value') + 1]) || 1;

const data  = loadData();

console.log(`\n${CYAN}${BOLD}🔥 streakkeeper${NC}\n`);

if (cmd === 'log' && habit) {
  const t = today();
  if (!data.logs[habit])    data.logs[habit] = {};
  if (!data.habits[habit])  data.habits[habit] = { created: t, unit: 'days' };
  data.logs[habit][t] = (data.logs[habit][t] || 0) + value;
  saveData(data);
  const { current } = calcStreak(data.logs, habit);
  console.log(`${GREEN}✅ Logged "${habit}" — value: ${value}${NC}`);
  console.log(`   Current streak: ${current > 0 ? '🔥 ' + current + ' days' : '1 day (starting today)'}\n`);
  commitLog(habit, value);

} else if (cmd === 'status') {
  showStatus(data);

} else if (cmd === 'calendar' && habit) {
  renderCalendar(data.logs, habit, 16);
  console.log();

} else if (cmd === 'stats') {
  if (!Object.keys(data.habits).length) { console.log(`${YELLOW}No habits yet.${NC}\n`); }
  else {
    console.log(`${BOLD}All Habits — Stats${NC}\n`);
    Object.keys(data.habits).forEach(h => {
      const { current, longest, total } = calcStreak(data.logs, h);
      console.log(`  🔥 ${h.padEnd(20)} streak: ${current}d  longest: ${longest}d  total: ${total}d`);
    });
    console.log();
  }

} else if (cmd === 'habits') {
  const hs = Object.keys(data.habits);
  console.log(`${BOLD}Tracked habits (${hs.length}):${NC} ${hs.join(', ') || 'none'}\n`);

} else if (cmd === 'demo') {
  // Seed demo data
  const demoHabits = ['workout', 'reading'];
  demoHabits.forEach(h => {
    data.habits[h] = { created: '2025-01-01', unit: 'days' };
    data.logs[h]   = {};
    for (let d = 60; d >= 0; d--) {
      const date = new Date(Date.now() - d * 86400000).toISOString().slice(0, 10);
      if (Math.random() > 0.25) data.logs[h][date] = Math.ceil(Math.random() * 5);
    }
  });
  saveData(data);
  showStatus(data);
  renderCalendar(data.logs, 'workout', 12);

} else {
  console.log(`Usage:`);
  console.log(`  node src/tracker.js log "workout"`);
  console.log(`  node src/tracker.js log "reading" --value 45`);
  console.log(`  node src/tracker.js status`);
  console.log(`  node src/tracker.js calendar workout`);
  console.log(`  node src/tracker.js stats`);
  console.log(`  node src/tracker.js demo\n`);
}
