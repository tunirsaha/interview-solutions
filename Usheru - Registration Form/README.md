# Registration Form

## 1. Problem Statement

Build a registration form with a username and a country. Check the username's availability as the user types. Keep submit disabled until the form is valid and the name is free.

## 2. Our Approach

- Username: required, lowercase letters and digits, max 20. The lookup runs after a 500 ms pause (`debounceTime`, `distinctUntilChanged`, `switchMap`), so stale lookups are dropped.
- Country: a dropdown loaded from the countries "API".
- Submit is guarded against double-submit and shows the response message, or a retry notice on failure.
- No backend. `DataService` reads static JSON in `src/assets/json/`: `countries.json`, `usernames.json` (`admin123` and `admin456` are taken) and `success-response.json`. To simulate a failure, set `error` to `true`, put the message in `msg` and make `data` `[]`.

## 3. How to Run

```bash
npm install && npm start   # http://localhost:4200
```
