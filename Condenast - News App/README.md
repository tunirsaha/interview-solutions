# News App

## 1. Problem Statement

Build a news reader with three views: top headlines, the latest stories on a topic, and a list of news sources. Data comes from [NewsAPI](https://newsapi.org).

## 2. Our Approach

- `UI/`: React 17 and Material-UI. Routes are `/` and `/headlines`, `/today`, `/sources`.
- `Backend/`: a small Express API on `:3001` that proxies NewsAPI, so the key stays server-side.
- Endpoints: `/news/headlines` (top-headlines), `/news/all` (everything), `/news/category` (sources). Country and query are set in `Backend/config.js`.

## 3. How to Run

Put your own NewsAPI key in `Backend/config.js`, then:

```bash
cd Backend && npm install && npm run go   # API on :3001
cd UI && npm install && npm start         # app on :3000
```
