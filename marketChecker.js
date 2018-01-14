var request = require('request');
var fs = require('fs');
var defaultCap = 0;
var date = new Date().getTime();
var defaultStack = 0;
var marketurl;

function getMarketInfo(){

  var curDate = new Date().getTime();
  marketurl = 'https://www.bithumb.com/resources/csv/market_sise.json?_=' + curDate;

  request(marketurl, 'utf8', function(err, res, body){
    try{
      var dataArr = JSON.parse(body);
      var returnObj = {};
      var totalCap = 0;
    
      for(var i = 0; i < dataArr.length; i++){
        var marketCap = dataArr[i].market_cap_usd;
        totalCap += Number(marketCap);
      }
    
      if(defaultStack == 0){
        defaultCap = totalCap;
      }
    
      var dataSet = {
        default : defaultCap,
        totalCap : totalCap,
        changeRate : ((totalCap/defaultCap - 1) * 100).toFixed(2)
      }
    
      fs.writeFile('./logs/' + date + '.txt', JSON.stringify(dataSet), function(){
        console.log(`${curDate} - [defaultCap] : ${defaultCap} [currentCap] : ${totalCap} [changeRate] : ${dataSet.changeRate}%`);
        defaultStack++;
      })
    } catch(e){
      console.log(e);
    }
  })
}

module.exports = {
  init: function(){
    getMarketInfo()
    setInterval(function(){
      getMarketInfo()
    },  60 * 1000);
  }
}