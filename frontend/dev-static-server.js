const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;
const port = Number(process.env.PORT || 8080);
const types = {
    ".html": "text/html",
    ".css": "text/css",
    ".js": "text/javascript",
    ".json": "application/json",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".webp": "image/webp",
    ".otf": "font/otf",
    ".ttf": "font/ttf"
};

http.createServer((req, res) => {
    let requestPath = decodeURIComponent(req.url.split("?")[0]);
    if (requestPath === "/") requestPath = "/index.html";

    const filePath = path.join(root, requestPath);
    if (!filePath.startsWith(root)) {
        res.writeHead(403);
        res.end("forbidden");
        return;
    }

    fs.readFile(filePath, (error, data) => {
        if (error) {
            res.writeHead(404);
            res.end("not found");
            return;
        }

        res.writeHead(200, {
            "Content-Type": types[path.extname(filePath)] || "application/octet-stream"
        });
        res.end(data);
    });
}).listen(port, "127.0.0.1", () => {
    console.log(`Static frontend server running at http://127.0.0.1:${port}/`);
});
