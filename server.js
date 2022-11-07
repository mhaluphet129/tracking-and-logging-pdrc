require("dotenv").config();
const { createServer } = require("https");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");

const hostname = process.env.hostname;
const port = process.env.port;
const dev = process.env.NODE_ENV !== "production";

const app = next({
  dev,
  hostname,
  port,
});
const handle = app.getRequestHandler();
const httpsOptions = {
  key: fs.readFileSync("./certificates/localhost.key"),
  cert: fs.readFileSync("./certificates/localhost.crt"),
};
app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log(`> Server started on https://${hostname}:${port}`);
  });
});
