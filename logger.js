var fs = require('fs');

function write(speaker, message, isAppendable) {
  var str = `[${speaker}] : ${message}`;
  var filename = './logs/' + speaker + '.txt';

  // console.log(str);

  if (!isAppendable) {
    
    fs.writeFile(filename, str, (err) => {
      if (err) console.log(err);
      // console.log('The file has been saved');
    });
  } else {
    fs.appendFile(filename, str, (err) => {
      if (err) {
        fs.writeFile(filename, str, (err) => {
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
