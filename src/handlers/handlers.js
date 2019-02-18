const { Game } = require("../models/game.js");
const Player = require("../models/player");

const logger = function(games, req, res, next) {
  console.log("URL:", req.url);
  console.log("Method:", req.method);
  console.log("Body:", req.body);
  console.log("Cookie:", req.cookies);
  console.log("games:", games);
  console.log("-------------------------------------------------------------");
  next();
};

const createGame = function(getUniqueNum, games, req, res) {
  let id = getUniqueNum(5, Object.keys(games));
  let game = new Game(id);

  games.addGame(game);
  res.cookie("game", `${id}`);
  res.redirect("/hostGame.html");
  res.end();
};

const addHost = function(games, req, res) {
  if (!req.cookies.game) {
    res.redirect("/");
    return;
  }
  let gameId = req.cookies.game;
  let playerId = 1;
  let currentGame = games.getGame(gameId);
  currentGame.addPlayer(new Player(playerId, req.body.playerName));
  res.redirect("waitingPage.html");
};

module.exports = {
  logger,
  createGame,
  addHost
};