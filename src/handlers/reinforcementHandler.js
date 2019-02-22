const Reinforcement = require("../models/reinforcement");
const { INSTRUCTIONS } = require('../constants');


const getCurrentGame = function(req) {
  const gameID = req.cookies.game;
  const activeGames = req.app.games;
  return activeGames.getGame(gameID);
};

const changeToAttackPhase = function(req, res) {
  const currentGame = getCurrentGame(req);
  currentGame.changePhase();
};

const selectReinforcingTerritory = function(
  currentGame,
  currentPlayerID,
  territory
) {
  const currentPlayer = currentGame.getPlayerDetailsById(currentPlayerID);
  if (territory.isOccupiedBy(currentPlayer)) {
    const reinforcement = new Reinforcement(currentPlayer);
    currentGame.reinforcement = reinforcement;
    currentGame.reinforcement.setTerritory(territory);
    return { error: false };
  }

  return { data: { msg: "Please Select valid Territory" }, error: true };
};

const startReinforcement = function(req, res) {
  const currentGame = getCurrentGame(req);
  const selectedTerritory = currentGame.territories[req.body.territoryName];
  const currentPlayerID = req.cookies.playerId;
  let { error, data } = selectReinforcingTerritory(
    currentGame,
    currentPlayerID,
    selectedTerritory
  );
  if (error) {
    return res.send(data);
  }
  res.send(currentGame.reinforcement);
};

const reinforcementComplete = function(req, res) {
  const currentGame = getCurrentGame(req);
  const militaryUnits = +req.body.militaryUnits;
  currentGame.reinforcement.reinforceMilitaryUnits(militaryUnits);
  currentGame.reinforcement = undefined;
  res.send(currentGame.getCurrentPlayer());
};

const changeTurnAndPhase = function(req, res) {
  const currentGame = getCurrentGame(req);
  currentGame.changePlayerPhase();
  currentGame.changeTurn(INSTRUCTIONS);
  res.end();
}

module.exports = {
  startReinforcement,
  reinforcementComplete,
  changeToAttackPhase
  ,changeTurnAndPhase
};