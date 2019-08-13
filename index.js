function reader(config, logPath) {

  const request = require("request");
  const fs = require("fs");

  const TOKEN_PATH = __dirname + "/token.json";
  const LOG_JSON_PATH = __dirname + "/log.json";

  let tokenGetLimit = 1;
  let tokenGetCounter;

  function testConfig () {
    if (!config.host) {
      return Promise.reject({message: "Host configuration is missing, please specify it."});
    }
    else if (!config.username) {
      return Promise.reject({message: "Username configuration is missing, please specify it."});
    }
    else if (!config.password) {
      return Promise.reject({message: "Password configuration is missing, please specify it."});
    }
    else if (!config.level) {
      return Promise.reject({message: "Level configuration is missing, please specify it."});
    }
    else {
      return Promise.resolve();
    }
  }

  function getToken(force) {
    tokenGetCounter += 1;

    let token = JSON.parse(fs.readFileSync(TOKEN_PATH).toString());
    var bodyLogin = {
      grant_type: "password",
      username: config.username,
      password: config.password
    };

    var stats = fs.statSync(TOKEN_PATH);
    var mtime = stats.mtime;

    let current = new Date();
    let currentMinusChanged = parseInt(current.valueOf() / 1000 - mtime.valueOf() / 1000);
    
    if (!force || !token.expires_in || currentMinusChanged >= token.expires_in) {
      return new Promise((resolve, reject) => {
      
        request.post({
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          url: config.host + "/ccadmin/v1/login",
          form: bodyLogin
        }, function (error, response, body) {
          try{
            token = JSON.parse(body);
            if ( token.access_token ) {
              fs.writeFileSync(TOKEN_PATH, body);
              resolve();
            }
            else {
              reject(body);
            }
          }
          catch(e){
            reject( { message: body } );
          }
        });
      });
    }
    else {
      return Promise.resolve();
    }

  }

  function logGet() {
    let updatedToken = JSON.parse(fs.readFileSync(TOKEN_PATH).toString());
    let readDate;
    if( config.date && config.date === "yesterday" ){
      let today = new Date();
      today.setDate(today.getDate() - 1);
      readDate = today.toISOString().substr(0, 10).replace(/-/g, "");
    }
    else if( config.date && config.date === "today" ){
      readDate = "";
    }
    else{
      readDate = config.date;
    }
    
    return new Promise((resolve, reject) => {
      request.get({
        url: config.host + "/ccadminx/custom/v1/logs?loggingLevel=" + config.level + "&date=" + readDate,
        headers: {
          "Authorization": "Bearer " + updatedToken.access_token,
          "content-type": "application/json"
        }
      }, function (error, response, body) {
        if(body){
          fs.writeFileSync(LOG_JSON_PATH, body);
          let bodyParsed = JSON.parse(body);
          if ( tokenGetCounter <= tokenGetLimit && bodyParsed.errorCode ) {
            getToken(true).then(logGet).then(() => {
              resolve();
            });
          }
          else {
            resolve();
          }
        }
        else{
          reject(body);
        }
        
      });
    });
  }

  function logCreate() {
    let log = JSON.parse(fs.readFileSync(LOG_JSON_PATH).toString());
    if (logPath) {
      fs.writeFileSync(logPath, log.fileContents);
      return Promise.resolve();
    } 
    return Promise.resolve(log.fileContents);
  }

  fs.writeFileSync(LOG_JSON_PATH, "{}");
  
  return testConfig().then(getToken).then(logGet).then(logCreate).then((data) => {
    return Promise.resolve(data);
  })
    .catch(function(error){
      return Promise.resolve({error});
    });
}

module.exports = reader;