// Run: node server.js  ->  http://localhost:3000
// Serves the page and proxies the API, so the browser never makes a cross-origin call.
const http = require("http");
const fs = require("fs");

const API = "https://git.unnamed.com/screeners/calories-json/-/raw/main/calories.json";
const files = { "/": ["index.html", "text/html"], "/script.js": ["script.js", "text/javascript"] };

http
  .createServer(async (req, res) => {
    if (req.url === "/api/calories") {
      const upstream = await fetch(API);
      res.writeHead(upstream.status, { "Content-Type": "application/json" });
      return res.end(await upstream.text());
    }
    const file = files[req.url];
    if (!file) return res.writeHead(404).end("Not found");
    res.writeHead(200, { "Content-Type": file[1] });
    res.end(fs.readFileSync(file[0]));
  })
  .listen(3000, () => console.log("http://localhost:3000"));
