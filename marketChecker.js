var request = require('request');
var fs = require('fs');
var date = new Date().getTime();
var marketurl;
var common;
var currencyInfo = {};
var stack = 0;

function Currency(key){
  this.key = key;
  this.price = 0;
  this.cap = 0;
  this.cap_price = 0;
}

function getMarketInfo(){

  var curDate = new Date().getTime();
  var curDateStr = String(curDate);
  if(curDateStr.length < 13) {
    var remainNum = 13 - curDateStr.length;
    for(var i = 0; i < remainNum; i++){
      curDateStr += '0';
    }
  } 
  marketurl = 'https://www.bithumb.com/resources/csv/market_sise.json?_=' + curDateStr;

  var requestMarket = function(marketurl){
    request(marketurl, 'utf8', function(err, res, body){
      try{
        var dataArr = JSON.parse(body);
        var returnObj = {};
        var totalCap = 0;
      
        for(var i = 0; i < dataArr.length; i++){
          var key = dataArr[i].symbol;
          currencyInfo[key].cap = Number(dataArr[i].market_cap_usd);
        }
        currencyInfo.timestamp = curDate;
  
      
        fs.writeFile('./logs/alphaCap.json', JSON.stringify(currencyInfo), function(){
          console.log(`${curDate} - collected`);
          
          if(stack == 0){
            common.emit('collected_init');
          } else {
            common.emit('collected1');
          }
          
          stack++;
        })

        
  
      } catch(e){
        console.log(e);
      }
    })
  }

  try{
    requestMarket(marketurl);
  } catch(e) {
    console.log(e);
    requestMarket(marketurl);
  }
  
}

function getReadCurrency(cb){
  fs.readFile('currency.json', 'utf8', function(err, data){
    if(err) console.log(err);
    var currObj = JSON.parse(decodeURIComponent(data))[0];
    currArr = Object.keys(currObj);

    for (var i = 0; i < currArr.length; i++) {
      currencyInfo[currArr[i]] = new Currency(currArr[i]);
    }

    currencyInfo.startTime = date;
    
    cb();
  })

  
}

module.exports = {
  init: function(event){
    common = event

    getReadCurrency(function(){
      common.on('collected0', function(){
        getMarketInfo();
      })
    });


    // setInterval(function(){
    //   getMarketInfo()
    // },  60 * 1000);
  }
}
