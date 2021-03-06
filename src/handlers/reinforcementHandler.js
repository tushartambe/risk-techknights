const Reinforcement = require("../models/reinforcement");

const getCurrentGame = function (req) {
  const gameID = req.cookies.game;
  const activeGames = req.app.games;
  return activeGames.getGame(gameID);
};

const selectReinforcingTerritory = function (currentGame,currentPlayerID,territory) {
  const currentPlayer = currentGame.getPlayerDetailsById(currentPlayerID);
  if (territory.isOccupiedBy(currentPlayer)) {
    const reinforcement = new Reinforcement(currentPlayer);
    currentGame.reinforcement = reinforcement;
    currentGame.reinforcement.setTerritory(territory);
  }
};

const startReinforcement = function (req, res) {
  const currentGame = getCurrentGame(req);
  const selectedTerritory = currentGame.territories[req.body.territoryName];
  const currentPlayerID = req.cookies.playerId;
  selectReinforcingTerritory(currentGame,currentPlayerID,selectedTerritory);
  if(currentGame.reinforcement) {
    return res.send(currentGame.reinforcement)
  }
  res.send({});
};

const reinforcementComplete = function (req, res) {
  const currentGame = getCurrentGame(req);
  const militaryUnits = +req.body.militaryUnits;
  const { activityLog, reinforcement } = currentGame
  const player = currentGame.getCurrentPlayer();
  reinforcement.reinforceMilitaryUnits(militaryUnits);
  currentGame.reinforcement = undefined;
  activityLog.placeMilitaryUnits(reinforcement.territory, player, militaryUnits)
  res.send(currentGame.getCurrentPlayer());
};

const changeTurnAndPhase = function (req, res) {
  const currentGame = getCurrentGame(req);
  currentGame.changePlayerPhase();
  currentGame.changeTurn();
  const player = currentGame.getCurrentPlayer();
  if (player.phase == 3) {
    const militaryCount = currentGame.calculateBonusMilitaryUnits(player.id);
    player.addMilitaryUnits(militaryCount);
  }
  res.end();
};

module.exports = {
  startReinforcement,
  reinforcementComplete,
  changeTurnAndPhase
};
