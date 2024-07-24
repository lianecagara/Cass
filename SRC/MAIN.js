process.on("unhandledRejection", function (err) {
  console.error(err);
});
process.on("uncaughtException", function (err) {
  console.error(err);
});

var { readJSONSync } = require("fs-extra");
var login = require("../LIB/LOGIN");
var utils = require("../LIB/UTILS");
var express = require("express");
var app = express();

app.get("/", function (_, res) {
  res.send(
    "If you can see this, this means the server is running, but you cannot make sure it it's working",
  );
});

app.listen(3000, function () {
  console.log("Port: 3000");
});

global.config = readJSONSync(`${__dirname}/../LIB/CONF.json`);
global.replies = new Map();
var handleMessage = require("../LIB/HANDLE/MESSAGE");
var handleReply = require("../LIB/HANDLE/REPLY");

var start = function () {
  utils.getState().then((appState) => {
    login(
      {
        appState,
      },
      function (err, api) {
        if (err) {
          console.error(JSON.stringify(err));
          return;
        }

        api.listen(function (err, event) {
          if (err) {
            console.error(JSON.stringify(err));
          }

          event.prefixes = [global.config.PREFIX];
          event.strictPrefix = true;

          switch (event.type) {
            case "message":
              try {
                handleMessage(api, event);
              } catch (err) {
                console.error(err);
              }
              break;
            case "message_reply":
              try {
                handleReply(api, event);
              } catch (err) {
                console.error(err);
              }
              break;
          }
        });
      },
    );
  });
};

start();
