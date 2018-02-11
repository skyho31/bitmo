var fs = require('fs');
var dataCollector = require('./dataCollector');
var marketChecker = require('./marketChecker');
var common = require('./common').event;
// var bot = require('./bitmobot/bitmo_alpha');
// var bot = require('./bitmobot/testmo_alpha');
var intervalTime = 5 * 1000;
var date = new Date();
var dateStr = '_' + (date.getMonth() < 9 ? '0' + (date.getMonth()+1) : (date.getMonth()+1)) + '_' + (date.getDate() < 10 ? '0' + date.getDate() : date.getDate());
var duplicatedNum = 0;

function duplicateCheck(filename){
  var name = filename;
  var isDuplicated = fs.existsSync('./logs/log' + name + '.txt');
  if(isDuplicated){
    duplicatedNum++;
    if(duplicatedNum == 1){
      duplicateCheck(name + '(' + duplicatedNum + ')');
    } else {
      duplicateCheck(name.slice(0, name.length -3) + '(' + duplicatedNum + ')');
    }

  } else {
    rename(name);
  }
}

function rename(name){
  fs.rename('./logs/log.txt', './logs/log' + name + '.txt', (err) => {
    console.log(err);
  })
}

duplicateCheck(dateStr);

dataCollector.init(common, intervalTime);
marketChecker.init(common);
// bot.init(common);
