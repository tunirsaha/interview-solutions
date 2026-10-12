# Calories Report

Fetches a daily-diet JSON feed and prints eight reports in the browser: expensive dishes, most recent entries, per-meal nutrient leaders for one user, and top calorie users for a month.

Data: https://git.unnamed.com/screeners/calories-json/-/raw/main/calories.json

## Reports

| # | Report |
|---|--------|
| 1 | Load and parse the JSON |
| 2 | Dishes over $49.9, cheapest first, top 3 |
| 3 | 3 most recent entries, oldest first |
| 4 | User 10, 2022-12-04 to 2022-12-10: meal type with highest protein, carbs, fat |
| 5 | Top calorie user in November 2022 |
| 6 | Second top calorie user in November 2022 |
| 7 | Top calorie user in November 2022, excluding user 18 |
| 8 | Same 3 entries as #3, newest first (`<date> <time> - <name> - <user_id>`) |

## Files

| File | Role |
|------|------|
| `server.js` | Static server plus a same-origin proxy at `/api/calories` (the upstream blocks cross-origin browser calls) |
| `index.html` | One `<pre>` per report |
| `script.js` | Fetches the data and computes each report |

## Run

```bash
node server.js   # Node 18+, no dependencies; open http://localhost:3000
```

## Known gaps

- Ties for the leading meal type in #4 go to the first one seen.
- No automated tests.
