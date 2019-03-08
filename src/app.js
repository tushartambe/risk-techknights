const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const fs = require('fs');

const { getUniqueNum } = require('./utils.js');
const { Games } = require('./models/game');

const { startAttack, updateMilitaryUnits, attackAgain, battleComplete } = require('./handlers/attackHandler');
const { startFortify, fortifyComplete, changePhase, changeCurrentPlayerPhase } = require('./handlers/fortifyHandler');
const { startReinforcement, reinforcementComplete, changeTurnAndPhase } = require('./handlers/reinforcementHandler');
const { sendGamePageDetails, claimTerritory, makePlayerToContinueWatching } = require('./handlers/claimTerritoryHandler');
const { logger, hostGame, validateGameId, updateWaitingList, loadSavedGame, saveGame, getPlayersCard, 
  getCardBonus, getActivityLog } = require('./handlers/handlers');
const { isCurrentPlayer } = require('../src/handlers/util');

const games = new Games();
app.games = games;
app.fs = fs;
app.getUniqueNum = getUniqueNum;

const getGamePhase = function (req, res) {
  const gameID = req.cookies.game;
  const isCurrentPlayerRequest = isCurrentPlayer(req);
  const currentGame = req.app.games.getGame(gameID);
  const phase = currentGame.getCurrentPlayer().phase;
  res.send({ phase, isCurrentPlayerRequest });
};

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
// app.use(logger);

app.get('/getGamePhase', getGamePhase);
app.post('/hostGame', hostGame);
app.post('/validateGameId', validateGameId);
app.get('/updateWaitingList', updateWaitingList);

app.post('/claimTerritory', claimTerritory);
app.get('/initializeGamePage', sendGamePageDetails);

app.post('/attack', startAttack);
app.post('/updateCount', updateMilitaryUnits);
app.get('/attackAgain', attackAgain);
app.get('/battleComplete', battleComplete);

app.post('/fortify', startFortify);
app.post('/fortifyComplete', fortifyComplete);

app.get('/changePhase', changePhase);
app.get('/changeTurnAndPhase', changeTurnAndPhase);
app.get('/changeCurrentPlayerPhase', changeCurrentPlayerPhase);

app.post('/reinforcement', startReinforcement);
app.post('/reinforcementComplete', reinforcementComplete);

app.post('/loadSavedGame', loadSavedGame);
app.get('/saveGame', saveGame);

app.get('/getCards', getPlayersCard);
app.get('/tradeCards', getCardBonus);

app.get('/getActivityLog', getActivityLog);
app.get('/wantsToContinue', makePlayerToContinueWatching);

app.use(express.static('public', { extensions: ['html'] }));

module.exports = app;
