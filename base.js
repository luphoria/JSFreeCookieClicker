const http = require("http");
fs = require("fs");

// ms before a new chunk is sent. The lower, the faster values update.
// The higher, the slower; however, HTML will aggregate more slowly (good).
const BASE_REPEAT_MS = 500;
const PORT = 1234;

// Init all game data
let cookies = -1; // -1 because the initial req to /cookie will increment this to 0
let store = {
  // upgrades: {
  //   RIF: {
  //     basePrice: 100,
  //     owned: 0,
  //   },
  //   CTPC: {
  //     basePrice: 500,
  //     owned: 0,
  //   },
  // },
  items: {
    clicker: {
      basePrice: 15,
      owned: 0,
    },
    grandma: {
      basePrice: 100,
      owned: 0,
    },
    farm: {
      basePrice: 1100,
      owned: 0,
    },
    // mine: {
    //   basePrice: 12000,
    //   owned: 0,
    // },
    // factory: 0,
  },
};

const auto_clicks = () => {
  setTimeout(() => {
    cookies +=
      store.items.clicker.owned * 0.1 +
      store.items.grandma.owned * 1 +
      store.items.farm.owned * 8;
      auto_clicks();
  }, 1000);
};
auto_clicks();

// (TODO) bool which will be used to stop chunk loops once the user quits the game.
let clientConnectionStopped = false;

// Create the http server
http
  .createServer((req, res) => {
    // Specify which endpoints. We cut off the parameters because we don't use them (and the form submit auto-adds them).

    if (req.url.startsWith("/purchase")) {
      let pick = req.url.split("-")[1].split("?")[0];
      res.writeHead(204);
      res.end();

      let price = Math.ceil(
        store.items[pick].basePrice *
          (store.items[pick].owned == 0 ? 1 : store.items[pick].owned * 1.15)
      );

      if (cookies >= price) {
        cookies -= price;
        store.items[pick].owned += 1;
      }
      return;
    }

    if (req.url.startsWith("/buy")) {
      let pick = req.url.split("-")[1].split("?")[0];

      res.end(
        "<b>" +
          pick.charAt(0).toUpperCase() +
          pick.slice(1) +
          "</b>" +
          fs.readFileSync("./buy-item-footer.html") +
          pick +
          '"></iframe>'
      );

      return;
    }

    switch (req.url.split("?")[0]) {
      case "/":
        res.writeHead(200, { "Content-Type": "text/html" });
        res.write(fs.readFileSync("./index.html"));
        let loop = 0;
        // Set up a loop of chunks, so that we can slowly provide up-to-date information
        const loop_update = () => {
          setTimeout(() => {
            // Add a chunk of updated HTML, along with extra CSS to hide the outdated HTML
            res.write(
              // LIST OF EXISTING 1CHAR ELS = abgipqsu
              // EXPLANATION: This is the "data stream". What it does is
              // feed new information into the DOM, including a stylesheet
              // to hide the outdated info. Each item has a weird element
              // name, to save data transfer.
              `<c id="c${loop}">${Math.floor(cookies)}</c><d id="a${loop}">${
                store.items.clicker.owned
              }</d><e id="b${loop}">${Math.ceil(
                store.items.clicker.basePrice *
                  (store.items.clicker.owned == 0
                    ? 1
                    : store.items.clicker.owned * 1.15)
              )}</e><f id="a${loop}">${
                store.items.grandma.owned
              }</f><h id="b${loop}">${Math.ceil(
                store.items.grandma.basePrice *
                  (store.items.grandma.owned == 0
                    ? 1
                    : store.items.grandma.owned * 1.15)
              )}</h><l id="a${loop}">${
                store.items.farm.owned
              }</l><j id="b${loop}">${Math.ceil(
                store.items.farm.basePrice *
                  (store.items.farm.owned == 0
                    ? 1
                    : store.items.farm.owned * 1.15)
              )}</j>
              <style>#a${loop - 1},#b${loop - 1},#c${loop - 1},#d${
                loop - 1
              },#e${loop - 1},#f${loop - 1},#h${loop - 1},#j${
                loop - 1
              }{display:none}</style>`
            );
            // increment loop for next iteration to hide
            loop++;
            // Re-call the same function [TODO: only if the client still is connected]
            if (!clientConnectionStopped) loop_update();
          }, BASE_REPEAT_MS);
        };
        loop_update();
        break;
      case "/cookie":
        // Server endpoint used only to count up the number of cookie clicks.
        res.writeHead(204);
        res.end();
        cookies += 1;
        break;
      case "/counter":
        res.writeHead(200, {
          "Content-Type": "text/html",
          Connection: "keep-alive",
        });
        res.write(fs.readFileSync("./counter.html"));

        break;
      default:
        // just try to grab the file requested. [TODO - replace this with a 404 and its dependents with specified endpoints]
        res.writeHead(200);
        res.end(fs.readFileSync("." + req.url.split("?")[0]));
        break;
    }
  })
  .listen(PORT);

console.log("Listening: " + PORT);
