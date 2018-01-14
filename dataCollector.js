var fs = require('fs');
var log = require('./logger');
var request = require('request');
var events = require('events');
var eventEmitter = new events.EventEmitter();

var currencyInfo = {};
var currArr;
var recentCount = 0;
var tickCount = 0;
var stack = 0;
var defaultValue = 0;
var defaultStack = 0;
var now;


var recentUrl = 'https://api.bithumb.com/public/recent_transactions/{coinname}';
var tickerUrl = 'https://api.bithumb.com/public/ticker/all';
const intervalTime = 5000;

function Currency(key, name) {
  this.name = name;
  this.key = key;
  this.price = [];
  this.histogram = [];
  this.maxMacd = 0;
  this.initTrade = false;
  this.buyPrice = [];
  this.sellPrice = [];
}

function makeCurruncyInfo(cb) {
  fs.readFile('currency.json', function(err, data) {
    var currObj = JSON.parse(decodeURIComponent(data))[0];
    currArr = Object.keys(currObj);

    for (var i = 0; i < currArr.length; i++) {
      currencyInfo[currArr[i]] = new Currency(currArr[i], currObj[currArr[i]]);
    }

    cb();
  });
}
function checkTicker(){

  request(tickerUrl, function(err, res, body){
    try{
      var result = JSON.parse(body);

      for (var i = 0; i < currArr.length; i++){
        var currency = currencyInfo[currArr[i]];
        var key = currency.key;
        currency.buyPrice.push(Number(result.data[key].buy_price));
        currency.sellPrice.push(Number(result.data[key].sell_price));
      }

      checkStatus();
      tickCount++;
    } catch(e){
      tickCount++;
      console.log(e);
    }
  })
}

function checkRecentTransaction(currency) {
  var key = currency.key;
  var name = currency.name;
  var price = currency.price;
  var localUrl = recentUrl.replace('{coinname}', key.toLowerCase());
  var buyPrice = currency.buyPrice;
  var sellPrice = currency.sellPrice;
  var dataSet;
  var curPrice;

  request(localUrl, function(err, res, body) {
    try {
      var result = JSON.parse(body);
      // api 변경 시 바꾸어줘야함
      curPrice = Number(result.data[0].price);
      price.push(curPrice);

      dataSet = {
        price: price,
        buyPrice: buyPrice,
        sellPrice: sellPrice
      }

      if(key == 'BTC'){
        stack = price.length;
      }
      
      recentCount++;
      defaultStack++;
      eventEmitter.emit('collected');
      fs.writeFile('./logs/' +  key + '.txt', JSON.stringify(dataSet), 'utf8', (err) => {
        if(err) console.log(err)
      });
      
    } catch (e) {
      recentCount++;
      console.log('restart server........')
      eventEmitter.emit('collected');
    }
  });
}


function checkStatus(){
  for (var i = 0; i < currArr.length; i++){
    checkRecentTransaction(currencyInfo[currArr[i]]);
  }
}

function readData(){
  var i = 0;

  for(var key in currencyInfo){
    var filename = currencyInfo[key].key + '.txt';
    i++;
    try {
      var result = JSON.parse(log.read(filename))
      currencyInfo[key].price = result.price.slice(0);
      currencyInfo[key].buyPrice = result.buyPrice.slice(0);
      currencyInfo[key].sellPrice = result.sellPrice.slice(0);

      console.log('read complete', filename, '(', i , '/', currArr.length, ')');
    } catch(e) {
      console.log(filename, 'log is not created yet.', '(', i , '/', currArr.length, ')');
    }
  }


  console.log('Data load Complete');
  checkTicker();
}

eventEmitter.on('collected', function() {
  if (recentCount >= currArr.length && tickCount == 1) {
    recentCount = 0;
    tickCount = 0;
    console.log(stack + ' data Collected');
    setTimeout(function(){
      checkTicker()
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