# Registration Form

A registration form with a username and a country. The username is checked for availability as you type, and submit stays disabled until the form is valid and the name is free.

## What it does

- **Username**: required, lowercase letters and digits, max 20 characters. Checked against the "API" after a 500 ms pause (`debounceTime` + `distinctUntilChanged` + `switchMap`, so stale lookups are dropped).
- **Country**: dropdown loaded from the countries "API".
- **Submit**: guarded against double-submit; shows the response message or a retry notice on failure.

## Mock APIs

There is no backend. `DataService` calls static JSON in `src/assets/json/`:

| File | Stands in for |
|------|---------------|
| `countries.json` | country list |
| `usernames.json` | username search. `admin123` and `admin456` are taken, for the negative case |
| `success-response.json` | form submit |

To simulate a failure, edit a file so `error` is `true`, `msg` holds the message and `data` is `[]`.

## Run

```bash
npm install && npm start   # http://localhost:4200
```
