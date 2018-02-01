var dataCollector = require('./dataCollector');
var marketChecker = require('./marketChecker');
var common = require('./common').event;
// var bot = require('./bitmobot/ubmo_4.7_alpha.3');
var bot = require('./bitmobot/ubmo_4.7');
var intervalTime = 5 * 1000;

dataCollector.init(common, intervalTime);
marketChecker.init(common);
bot.init(common);
