# JSFreeCookieClicker
Implementation of the popular webgame "Cookie Clicker" **without using any (client-side) JavaScript at all.**

Done via a "socket" with a DOM stream and some iframes.

## Run
To run, all you need is node-js at a reasonably recent version. Its only dependencies are `fs` and `http` which should, of course, both already be installed.

The command to serve the app is `node base`. Once this command has been run, visit `localhost:1234` to see it in action.

## Purpose
This is a **proof-of-concept** for a DOM-based socket (which is why it is so rough around the edges). The way that it all works is by getting user input within iframes, and using this input to change data in a continuous DOM stream.

## Inspiration
Of all places to get inspiration, this project was inspired by an online Monero poker game which was designed for Tor, called [PokerClub](TODO). This website connects you to a multiplayer Poker table along with a chatbox, all done without any JavaScript. The website describes the system as a "pseudo web socket" which uses a very similar system to the one seen here.

## Problems/TODO
* Because of the core design of this in general, it isn't really sustainable, because there are like 7 elements getting added every .2 seconds. It works just fine for extended periods (and will work waay longer at not much cost if you change this update ms to like 1s instead of .2), but obviously, a continually growing memory usage is not a good thing.
* The game itself has a multitude of issues. Aside from the math of the purchases being way off, the way that I place all of the dynamic content is hilariously hacky and not adaptable at all.
* Currently, in this POC, the code is designed with global variables that will be accessed by whoever visits the webpage. In other words, if I ever feel like making the "cookie clicker" part of this concept more fleshed out, I'm probably going to want to set up some sort of user differentiation.
* Because the backend is written in node.js I have a sneaking suspicion that all a multitude of people will respond to this with is "WTF BUT IT LITERALLY USES JS." So if anyone feels like re-implementing the backend in Go or something be my guest lol.

## Future
Of course, this is just a POC for something much bigger which I plan on working on - and that is a module for this "DOM socket" concept. This README will be updated if and when I follow through with creating this module.
