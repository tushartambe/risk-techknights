const addTerritory = function(game, territory, player) {
  game.activityLog.claimTerritory(territory, player);
  territory.setRuler(player);
  territory.addMilitaryUnits(1);
  player.removeMilitaryUnits(1);
  game.changeTurn();
};

const sendTerritoryDetails = function(
  res,
  isValidTerritory,
  color,
  territoryMilitaryUnits,
  nextPlayer
) {
  const content = {
    isValidTerritory,
    color,
    territoryMilitaryUnits,
    nextPlayer
  };
  res.send(content);
};

const addValidTerritory = function(req, res) {
  const game = req.app.games.getGame(req.cookies.game);
  const currentPlayer = game.getCurrentPlayer();
  const nextPlayer = game.getNextPlayer();
  const territory = game.territories[req.body.territoryName];
  const isValidTerritory =
    !territory.isOccupied() && currentPlayer.id == req.cookies.playerId;

  if (isValidTerritory) {
    addTerritory(game, territory, currentPlayer);
  }

  if (game.isAllTerritoriesOccupied()) {
    game.changePhase();
  }

  sendTerritoryDetails(
    res,
    isValidTerritory,
    currentPlayer.color,
    territory.militaryUnits,
    nextPlayer
  );
};

const selectedTerritories = function(game) {
  let highlight = [];
  if (game.attack) {
    highlight.push(game.attack.attackingTerritory.name);
    if (game.attack.defendingTerritory)
      highlight.push(game.attack.defendingTerritory.name);
  }

  if (game.fortify) {
    highlight.push(game.fortify.sourceTerritory.name);
    if (game.fortify.destinationTerritory)
      highlight.push(game.fortify.destinationTerritory.name);
  }

  if (game.reinforcement) {
    highlight.push(game.reinforcement.territory.name);
  }
  return highlight;
};

const sendGamePageDetails = function(req, res) {
  if (req.app.games.isRunning(req.cookies.game)) {
    const game = req.app.games.getGame(req.cookies.game);
    const currentPlayer = game.getCurrentPlayer();
    const highlight = selectedTerritories(game);
    const horsePosition = game.getHorsePosition();
    const playerId = req.cookies.playerId;
    let player = game.getPlayerDetailsById(playerId);
    const isCurrentPlayer = game.getCurrentPlayer().id == req.cookies.playerId;
    const gamePageDetails = {
      territories: game.territories,
      currentPlayer,
      highlight,
      isCurrentPlayer,
      isGameRunning: true,
      horsePosition,
      players: game.players,
      phase: player.phase,
      player,
      activityLog: game.activityLog
    };
    res.send(gamePageDetails);
    return;
  }
  res.send({
    isGameRunning: false,
    gameId: req.cookies.game,
    playerId: req.cookies.playerId,
    players: game.players
  });
};

module.exports = { sendGamePageDetails, addValidTerritory };
