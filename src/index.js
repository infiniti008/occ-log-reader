var chalk = require("chalk");
var figlet = require("figlet");
var open = require('open');
var fs = require('fs');

const printLogo = (text, color) => {
  console.log(
    chalk[color](
      figlet.textSync(text, {
        horizontalLayout: "default",
        verticalLayout: "default"
      })
    )
  );
}

const getLogs = async (configPath, logPath) => {

  let config = require(configPath);

  const reader = require("occ-log-reader-package");

  const askTerminal = require(__dirname + "/ask-terminal");

  printLogo("/ OCC  LOGS by VN  /", "white")

  const answers = await askTerminal(config);

  if(answers.save === "Yes"){
    console.log("Config saved");
    fs.writeFileSync(configPath, JSON.stringify(config))
  }

  let readFinished = await reader(config, logPath);
  setTimeout(() => {}, 4000);

  if(readFinished){
    if(config.editor){
      printLogo("/ Open in Your editor /", "white");
      await open(logPath, { wait: false, app: config.editor });
    }
    else{
      printLogo("/ Look at  _ log.log _  file /", "green");
    }
  }
  else {
    printLogo("/ Erorr /", "red");
  }

  

};

// getLogs();

module.exports = getLogs;