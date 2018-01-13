var fs = require('fs');
var log = require('./logger');
var request = require('request');
var events = require('events');
var eventEmitter = new events.EventEmitter();

var currencyInfo = {};
var currArr;
var tickCount = 0;
var stack = 0;
var defaultValue = 0;
var defaultStack = 0;
var now;


var url = 'https://crix-api-endpoint.upbit.com/v1/crix/trades/ticks?code=CRIX.UPBIT.KRW-{coinname}&count=3';
const intervalTime = 3000;

function Currency(key, name) {
  this.name = name;
  this.key = key;
  this.price = [];
  this.histogram = [];
  this.maxMacd = 0;
  this.initTrade = false;
}

function makeCurruncyInfo(cb) {
  fs.readFile('currency.json', function(err, data) {
    var currObj = JSON.parse(decodeURIComponent(data))[0];
    currArr = Object.keys(currObj);

    for (var i = 0; i < currArr.length - 1; i++) {
      currencyInfo[currArr[i]] = new Currency(currArr[i], currObj[currArr[i]]);
    }

    cb();
  });
}

function checkTicker(currency) {
  var key = currency.key;
  var name = currency.name;
  var price = currency.price;
  var localUrl = url.replace('{coinname}', key);
  var curPrice;
  var _histogram;
  var marketPrice = 0;

  request(localUrl, function(err, res, body) {
    try {
      var result = JSON.parse(body);
      curPrice = result[0].tradePrice;
      price.push(curPrice);

      stack = price.length;
      tickCount++;
      defaultStack++;
      eventEmitter.emit('collected');
      fs.writeFile('./logs/' +  key + '.txt', JSON.stringify({price: price}), 'utf8', (err) => {
        if(err) console.log(err)
      });
      
    } catch (e) {
      tickCount++;
      console.log('restart server........')
      eventEmitter.emit('collected');
    }
  });
}


function checkStatus(){
  for (var i = 0; i < currArr.length - 1; i++){
    checkTicker(currencyInfo[currArr[i]]);
  }
}

function readData(){
  var i = 0;

  for(var key in currencyInfo){
    var filename = currencyInfo[key].key + '.txt';
    i++;
    try {
      currencyInfo[key].price = JSON.parse(log.read(filename)).price.slice(0);
      console.log('read complete', filename, '(', i , '/', currArr.length, ')');
    } catch(e) {
      console.log(filename, 'log is not created yet.', '(', i , '/', currArr.length, ')');
    }
  }


  console.log('Data load Complete');
  checkStatus();
}

eventEmitter.on('collected', function() {
  if (tickCount == currArr.length - 1) {
    tickCount = 0;
    console.log(stack + ' data Collected');
    setTimeout(function(){
      checkStatus()
    }, intervalTime);
  }
});

eventEmitter.on('inited', function() {
  console.log('inited');
  readData();
});

module.exports = {
  init: function(){
    makeCurruncyInfo(function() {
      eventEmitter.emit('inited');
    });
  }
}