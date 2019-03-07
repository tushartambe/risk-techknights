const loadGameDetails = function (currentGameDetails) {
  const { currentGame, highlight, currentPlayer, player, horsePosition } = currentGameDetails;
  renderTerritories(currentGame.territories, highlight);
  updatePlayerNames(currentGame.players);
  highlightCurrentPlayer(currentPlayer);
  updatePlayerDetails(player);
  updateHorsePosition(horsePosition);
  highlightPhase(player.phase);
}

const initializeGamePage = function () {
  fetch('/initializeGamePage')
    .then(res => res.json())
    .then(currentGameDetails => {
      const { currentPlayer, isGameRunning, winner, isEliminated, player } = currentGameDetails;
      if (!isGameRunning) {
        displayClosedGamePopup(currentGameDetails);
        return;
      }
      if (winner) {
        loadGameDetails(currentGameDetails);
        displayWinningPopup(currentPlayer.name);
        return;
      }
      if (isEliminated && !player.wantsToContinue) {
        displayEliminationPopup(player.name);
      }
      if (player.wantsToContinue) {
        hideElement(document.getElementById('phaseSection'));
        hideElement(document.getElementById('placeMilitarySection'));
        setElementDisplay(document.getElementById('closeGame'), DISPLAY_BLOCK);
        deactivateSaveGameOption();
      }
      loadGameDetails(currentGameDetails);
    });
};

const mapFetcher = setInterval(initializeGamePage, 1000);