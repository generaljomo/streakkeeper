# 🔥 streakkeeper

> A habit tracking tool that stores data in your GitHub repo and renders contribution-style streak calendars.

[![CI](https://img.shields.io/github/actions/workflow/status/yourusername/streakkeeper/ci.yml?style=for-the-badge)](https://github.com/yourusername/streakkeeper/actions)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](./LICENSE)
[![Codespace Ready](https://img.shields.io/badge/Codespace-Ready-green?style=for-the-badge&logo=github)](https://codespaces.new/yourusername/streakkeeper)

---

## 🚀 What is streakkeeper?

`streakkeeper` tracks daily habits by committing your check-ins directly to a GitHub repo. Every logged habit becomes a commit — giving you a real contribution graph that reflects your personal discipline, not just code.

```bash
streakkeeper log "workout"           # Log today's habit
streakkeeper log "reading" --value 45  # Log with a value (minutes)
streakkeeper status                  # Show today's streaks
streakkeeper calendar workout        # Render a heatmap calendar
streakkeeper stats                   # Streak stats for all habits
streakkeeper habits                  # List all tracked habits
```

## ✨ Features
- 🔥 Streak tracking with longest/current counts
- 📅 GitHub-style calendar heatmap per habit
- 💾 Data stored as JSON committed to your repo
- 📊 Stats: total days, average, best week, missed days
- 🔔 Daily reminder mode via terminal
- 🏆 Milestone badges (7-day, 30-day, 100-day streaks)
- 🤝 Share your streaks via GitHub README embed

## 📊 Sample Output
```
🔥 streakkeeper — workout (last 12 weeks)

  ░░▒░░▓█░  ░▒▒░▓▓█  ░░▒▓▓██  ▒▒▓▓███

Current streak:  🔥 14 days
Longest streak:  💎 41 days
Total logged:    🏆 89 days
This week:       ✅ 5 / 7 days
```

## 🏆 Achievement Scripts
```bash
bash scripts/setup.sh && bash scripts/unlock-all.sh
```

## 🤝 Contributing
See [CONTRIBUTING.md](./CONTRIBUTING.md)
