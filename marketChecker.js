var request = require('request');
var fs = require('fs');
var defaultCap = 0;
var date = new Date();
var now = `${date.getDate()}${date.getMonth() + 1}${date.getHours()}${date.getMinutes()}`;
var defaultStack = 0;

var marketUrl = 'https://crix-api-endpoint.upbit.com/v1/crix/marketcap?currency=KRW';
var badCoins = ["MCAP","BTM","MGO","PPT","GAS","ETP","BQX","BNB","ICO","BTCD","PLR","DICE","LKK","BDL","PPC","XAS","STX","MLN","DNT","NLC2","EB3","LEO","XRL","FRST","LUN","XCP","EMC","TAAS","ROUND","PPY","IOC","POT","PLBT","NMC","NLG","SNM","TRST","FAIR","TKN","SKY","MIOTA","USDT","EOS","BCN","VSL","DTB","WGR","SAN","MSP","TIME","CLAM","OBITS","B@","GOLOS","ICN","ECOB","YBC","NET","OAX","OMNI","UNITY","UNO","VERI","QAU","NXC","LMC","NEOS","EAC","CRW","ECN","GRC","UNY","JINN","BITCNY","WCT","SPR","RBY","XRB","EDR","MOON","ENRG","IXT","DMD","TOA","PEPECASH","BELA","BCAP","PLU","BTA","HEAT","AEON","STA","XMG","PTC","TRUST","XC","ERC","CANN","POSW","MNE","THC","XWC","NDC","DBIX","IFC","BCY","ETT","WDC","DAXX","NOTE","CRB","QRK","BASH","INCNT","XBC","XBY","GAM","DENT","BET","QWARK","APX","VASH","DIME","MGC","TIPS","SNC","MUSIC","BLITZ","GLD","EQT","ABY","FLO","XCN","AUR","MAX","NVST","FLDC","PASC","CURE","ESP","GCR","SEQ","CMP","WBB","NVC","ECC","CHC","SMART","CADASTRAL","PDC","XMY","SIGT","DAR","EMV","PUT","XSPEC","CVCOIN","PINK","XBB","XVC","MEC","PZM","MINT","ZRC","COVAL","ZENI","SLR","SWIFT","XST","PBT","ZET","XPM","2GIVE","HTML5","ICOO","ZCC","FYN","SKIN","DCN","BITUSD","RIC","ATMS","CREA","EGC","CCRB","LGD","MALC","ZEIT","SNRG","AC","BRX","NAUT","GEO","BRK","INSN","VRM","LNK","MBRS","RAIN","JNS","SOAR","CTR","SPRTS","PIE","COE","VISIO","INPAY","VSM","TKS","DOT","ZRX","ADZ","CRAVE","FNC","ZCL"];

function getMarketInfo(){
  request(marketUrl, 'utf8', function(err, res, body){
    var dataArr = JSON.parse(body);
    var returnObj = {};
    var totalCap = 0;
  
    for(var i = 0; i < dataArr.length; i++){
      var key = dataArr[i].symbol.replace("'", '');
      var name = dataArr[i].koreanName;
      var marketCap = dataArr[i].marketCap;
  
      if(badCoins.indexOf(key) == -1){
        totalCap += marketCap;
      }
    }
  
    if(defaultStack == 0){
      defaultCap = totalCap;
    }
  
    var dataSet = {
      default : defaultCap,
      totalCap : totalCap,
      changeRate : Math.floor((defaultCap/totalCap - 1) * 100)
    }
  
    fs.writeFile('./logs/' + now + '.txt', JSON.stringify(dataSet), function(){
      console.log(`${now} - [defaultCap] : ${defaultCap} [currentCap] : ${totalCap} [changeRate] : ${dataSet.changeRate}%`);
      defaultStack++;
    })
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