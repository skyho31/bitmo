var dataCollector = require('./dataCollector');
var marketChecker = require('./marketChecker');
var common = require('./common').event;
var bot = require('./bitmobot/bitmo_alpha');
// var bot = require('./bitmobot/testmo_alpha');
var intervalTime = 5 * 1000;

dataCollector.init(common, intervalTime);
marketChecker.init(common);
bot.init(common);
