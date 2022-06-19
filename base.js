const http = require("http");
fs = require("fs");

// ms before a new chunk is sent. The lower, the faster values update.
// The higher, the slower; however, HTML will aggregate more slowly (good).
const REPEAT_MS = 500;
const PORT = 1234;

// Init all user data
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

// (TODO) bool which will be used to stop chunk loops once the user quits the game.
let clientConnectionStopped = false;

// Create the http server
http
  .createServer((req, res) => {
    // Specify which endpoints. We cut off the parameters because we don't use them (and the form submit auto-adds them).
    switch (req.url.split("?")[0]) {
      case "/":
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(fs.readFileSync("./index.html"));
        break;
      case "/cookie":
        // Server endpoint used only to count up the number of cookie clicks.
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

        // Set up a loop of chunks, so that we can slowly provide up-to-date information
        let loop = 0;
        const loop_update = () => {
          setTimeout(() => {
            // Add a chunk of updated HTML, along with extra CSS to hide the outdated HTML
            res.write(
              `<b id="c${loop}">${user.cookies}</b><style>#c${
                loop - 1
              }{display:none}</style>`
            );
            // increment loop for next iteration to hide
            loop++;
            // Re-call the same function [TODO: only if the client still is connected]
            if (!clientConnectionStopped) loop_update();
          }, REPEAT_MS);
        };
        loop_update();
        break;
      default:
        // just try to grab the file requested. [TODO - replace this with a 404 and its dependents with specified endpoints]
        res.writeHead(200);
        res.end(fs.readFileSync("." + req.url.split("?")[0])) 
        break;
    }
  })
  .listen(PORT);

console.log("Listening: " + PORT);
