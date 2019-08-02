function reader(config) {

  const request = require('request');
  const fs = require('fs');

  const TOKEN_PATH = __dirname + '/token.json';
  const LOG_JSON_PATH = __dirname + '/log.json';
  const LOG_PATH = __dirname + '/../log.log';

  let token = require(TOKEN_PATH);

  function getToken() {
    process.stdout.write('Reading .')
    var bodyLogin = {
      grant_type: "password",
      username: config.username,
      password: config.password
    }

    var stats = fs.statSync(TOKEN_PATH);
    var mtime = stats.mtime;

    let current = new Date();
    let currentMinusChanged = parseInt(current.valueOf() / 1000 - mtime.valueOf() / 1000);

    return new Promise(resolve => {
      if (!token.expires_in || currentMinusChanged >= token.expires_in) {
        request.post({
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          url: config.host + '/ccadmin/v1/login',
          form: bodyLogin
        }, function (error, response, body) {
          token = JSON.parse(body);
          fs.writeFileSync(TOKEN_PATH, body);
          resolve(token);
        });
      }
      else {
        resolve(token);
      }
    });
  }

  function logGet(token) {
    let readDate;
    if( config.date && config.date === "yesterday" ){
      let today = new Date();
      today.setDate(today.getDate() - 1);
      readDate = today.toISOString().substr(0, 10).replace(/-/g, '');
    }
    else if( config.date && config.date === "today" ){
      readDate = "";
    }
    else{
      readDate = config.date;
    }
    
    return new Promise(resolve => {
      request.get({
        url: config.host + '/ccadminx/custom/v1/logs?loggingLevel=' + config.level + '&date=' + readDate,
        headers: {
          "Authorization": 'Bearer ' + token.access_token,
          'content-type': 'application/json'
        }
      }, function (error, response, body) {
        fs.writeFileSync(LOG_JSON_PATH, body);
        resolve();
      });
    });
  }

  function logCreate() {
    var log = require(LOG_JSON_PATH);
    fs.writeFileSync(LOG_PATH, log.fileContents);
    return Promise.resolve();
  }

  let intervalId = setInterval(() => { process.stdout.write('.') }, 700)

  return getToken().then(logGet).then(logCreate).then(() => {
    process.stdout.write(' Finished\r\n');
    clearInterval(intervalId);
    return Promise.resolve(true);
  });  
}

module.exports = reader;