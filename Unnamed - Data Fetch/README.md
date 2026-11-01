# Calories Report

## 1. Problem Statement

Fetch the [calories JSON feed](https://git.unnamed.com/screeners/calories-json/-/raw/main/calories.json) and show these in the browser:

1. Load and parse the JSON.
2. Dishes over $49.9, cheapest first, top 3.
3. The 3 most recent entries, oldest first.
4. For user 10, 2022-12-04 to 2022-12-10: the meal type with the highest protein, carbs and fat.
5. Top calorie user in November 2022.
6. Second top calorie user in November 2022.
7. Top calorie user in November 2022, excluding user 18.
8. The same 3 entries as #3, newest first, as `<date> <time> - <name> - <user_id>`.

## 2. Our Approach

- `script.js` fetches the data once and computes each report. `index.html` has one `<pre>` per report.
- The upstream blocks cross-origin browser calls, so `server.js` serves the page and proxies `/api/calories`.
- Known gaps: ties for the leading meal type in #4 go to the first one seen, and there are no tests.

## 3. How to Run

```bash
node server.js   # Node 18+, no dependencies; open http://localhost:3000
```
