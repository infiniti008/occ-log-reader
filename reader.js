function reader(config, logPath) {

  const request = require('request');
  const fs = require('fs');

  const TOKEN_PATH = __dirname + '/token.json';
  const LOG_JSON_PATH = __dirname + '/log.json';

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

    return new Promise((resolve, reject) => {
      if (!token.expires_in || currentMinusChanged >= token.expires_in) {
        request.post({
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          url: config.host + '/ccadmin/v1/login',
          form: bodyLogin
        }, function (error, response, body) {
          try{
            token = JSON.parse(body);
            if(token.access_token){
              fs.writeFileSync(TOKEN_PATH, body);
              resolve(token);
            }
            else {
              reject(body);
            }
          }
          catch(e){
            reject(body);
          }
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
    
    return new Promise((resolve, reject) => {
      request.get({
        url: config.host + '/ccadminx/custom/v1/logs?loggingLevel=' + config.level + '&date=' + readDate,
        headers: {
          "Authorization": 'Bearer ' + token.access_token,
          'content-type': 'application/json'
        }
      }, function (error, response, body) {
        if(body){
          fs.writeFileSync(LOG_JSON_PATH, body);
          resolve();
        }
        else{
          reject(body);
        }
        
      });
    });
  }

  function logCreate() {
    var log = require(LOG_JSON_PATH);
    if (logPath) {
      fs.writeFileSync(logPath, log.fileContents);
      return Promise.resolve();
    } 
    return Promise.resolve(log.fileContents);
  }

  let intervalId = setInterval(() => { process.stdout.write('.') }, 700)

  return getToken().then(logGet).then(logCreate).then((data) => {
    process.stdout.write(' Finished\r\n');
    clearInterval(intervalId);
    return Promise.resolve(data);
  })
  .catch(function(err){
    console.log("\r\n")
    console.log(err)
    clearInterval(intervalId);
    Promise.resolve(false);
  })
}

module.exports = reader;