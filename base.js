const http = require("http");
fs = require("fs");

// ms before a new chunk is sent. The lower, the faster values update.
// The higher, the slower; however, HTML will aggregate more slowly (good).
const REPEAT_MS = 500;
const PORT = 1234;

let user = {
  cookies: 0,
  store: {
    upgrades: {
      RIF: 0,
      CTPC: 0,
    },
    items: {
      clickers: 0,
      grandmas: 0,
      farms: 0,
      mines: 0,
      factories: 0,
    },
  },
};

let clientConnectionStopped = false;

http
  .createServer((req, res) => {
    switch (req.url.split("?")[0]) {
      case "/":
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(fs.readFileSync("./index.html"));
        break;
      case "/cookie":
        res.writeHead(204);
        res.end("");
        user.cookies += 1;
        break;
      case "/counter":
        res.writeHead(200, {
          "Content-Type": "text/html",
          Connection: "keep-alive",
        });
        res.write(fs.readFileSync("./counter.html"));
        let loop = 0;
        const loop_update = () => {
          setTimeout(() => {
            res.write(
              `<b id="c${loop}">${user.cookies}</b><style>#c${
                loop - 1
              }{display:none}</style>`
            );
            loop++;
            if (!clientConnectionStopped) loop_update();
          }, REPEAT_MS);
        };
        loop_update();
        break;
      default:
        res.writeHead(200);
        res.end(fs.readFileSync("." + req.url.split("?")[0])) 
        break;
    }
  })
  .listen(PORT);

console.log("Listening: " + PORT);
