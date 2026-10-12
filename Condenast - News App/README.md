# News App

A news reader with three views: top headlines, the latest stories on a topic, and a list of news sources. React front end, Express back end that proxies [NewsAPI](https://newsapi.org).

## Layout

| Folder | Role |
|--------|------|
| `UI/` | React 17 + Material-UI. Routes: `/` and `/headlines`, `/today`, `/sources` |
| `Backend/` | Express API on `:3001`. Wraps NewsAPI so the key stays server-side |

## API

| Endpoint | NewsAPI call |
|----------|--------------|
| `GET /news/headlines` | `top-headlines` for the configured country |
| `GET /news/all` | `everything` for the configured query |
| `GET /news/category` | `sources` for the configured country |

Country and query are set in `Backend/config.js`.

## Run

```bash
cd Backend && npm install && npm run go   # API on :3001
cd UI && npm install && npm start         # app on :3000
```

Put your own NewsAPI key in `Backend/config.js` before running.
