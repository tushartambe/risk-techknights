const Fortify = require('../models/fortify');
const { INSTRUCTIONS } = require('../constants');

const getCurrentGame = function(req) {
  const gameID = req.cookies.game;
  const activeGames = req.app.games;
  return activeGames.getGame(gameID);
};

const changeCurrentPlayerPhase = function(req, res) {
  const playerId = req.cookies.playerId;
  const currentGame = getCurrentGame(req);
  let currentPlayer = currentGame.getCurrentPlayer();
  currentPlayer.getCard(Math.random);
  if (currentPlayer.id == playerId) {
    currentGame.changePlayerPhase();
  }
  currentPlayer = currentGame.getCurrentPlayer();
  if (currentPlayer.phase == 3) {
    const militaryCount = currentGame.calculateBonusMilitaryUnits(currentPlayer.id);
    currentPlayer.addMilitaryUnits(militaryCount);
  }
  currentGame.attack = undefined;
  currentGame.fortify = undefined;
  currentGame.reinforcement = undefined;
  res.end();
};

const changePhase = function(req, res) {
  const currentGame = getCurrentGame(req);
  currentGame.changePhase(INSTRUCTIONS);
  currentGame.attack = undefined;
  currentGame.fortify = undefined;
  res.end();
};

const setFortifier = function(game, fortifier) {
  if (!game.fortify) {
    game.fortify = new Fortify(fortifier);
  }
};

const setFortifyingTerritories = function(fortify, territory) {
  if (fortify.sourceTerritory && fortify.sourceTerritory != territory) {
    fortify.destinationTerritory = territory;
    return { error: false };
  }
  if (territory.hasMilitaryUnits()) {
    fortify.sourceTerritory = territory;
    return { error: false };
  }
  return {
    error: true,
    data: { msg: 'Please Select valid fortify source territory' }
  };
};

const validateTerritory = function(currentGame, fortifier, territory) {
    setFortifier(currentGame, fortifier);
    return setFortifyingTerritories(currentGame.fortify, territory);
};

const selectFortifyingTerritory = function(
  currentGame,
  fortifierID,
  territory
) {
  const fortifier = currentGame.getPlayerDetailsById(fortifierID);
  if (territory.isOccupiedBy(fortifier)) {
    return validateTerritory(currentGame, fortifier, territory);
  }

  if (currentGame.fortify.sourceTerritory) {
    return {
      data: { msg: 'Please Select valid destinationTerritory' },
      error: true
    };
  }
  return { data: { msg: 'Please Select valid sourceTerritory' }, error: true };
};

const startFortify = function(req, res) {
  const currentGame = getCurrentGame(req);
  const selectedTerritory = currentGame.territories[req.body.territoryName];
  const fortifierId = req.cookies.playerId;
  let { error, data } = selectFortifyingTerritory(
    currentGame,
    fortifierId,
    selectedTerritory
  );
  if (error) {
    return res.send(data);
  }
  res.send(currentGame.fortify);
};

const fortifyComplete = function(req, res) {
  const currentGame = getCurrentGame(req);
  const currentPlayer = currentGame.getCurrentPlayer();
  const militaryUnits = +req.body.militaryUnits;
  if (!currentGame.fortify.destinationTerritory) {
    currentGame.fortify = undefined;
    startFortify(req, res);
    return;
  }
  currentGame.fortify.fortifyMilitaryUnits(militaryUnits);
  currentGame.activityLog.fortify(currentGame.fortify, militaryUnits);
  currentGame.fortify = undefined;
  if (currentPlayer.phase == 5) {
    currentGame.changePlayerPhase();
  }

  const player = currentGame.getCurrentPlayer();
  if (player.phase == 3) {
    const militaryCount = currentGame.calculateBonusMilitaryUnits(player.id);
    player.addMilitaryUnits(militaryCount);
  }

  res.end();
};

module.exports = {
  startFortify,
  fortifyComplete,
  changePhase,
  changeCurrentPlayerPhase
};
