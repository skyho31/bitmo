var fs = require('fs');

function write(speaker, message, isAppendable) {
  //var str = `[${speaker}] : ${message}`;
  var filename = './logs/' + speaker + '.txt';

  // console.log(str);

  if (!isAppendable) {
    
    fs.writeFile(filename, message, (err) => {
      if (err) console.log(err);
      // console.log('The file has been saved');
    });
  } else {
    fs.appendFile(filename, message, (err) => {
      if (err) {
        fs.writeFile(filename, message, (err) => {
          if (err) console.log(err);
          // console.log('The file has been saved');
        });
      }
      // console.log('The "data to append" was appended to file!');
    });
  }
}

function read(filename) {
  return fs.readFileSync('./logs/' + filename, 'utf-8');
}


module.exports = {
  write: write,
  read: read
};
