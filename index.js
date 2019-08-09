try{
  var chalk = require("chalk");
  var figlet = require("figlet");
  var inquirer = require("inquirer");
  var open = require('open');
  var fs = require('fs');
}
catch(err){
  setTimeout(() => {}, 4000);
  console.error("\r\nPlease run INSTALL.bat\r\n");
}

const reader = require(__dirname + '/read');

const CONFIG_PATH = __dirname + '/../config.json';
const LOG_PATH = __dirname + '/../log.log';

let currentConfig = require(CONFIG_PATH);

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

const askQuestions = () => {

  var isDefault = { value: false };

  function changeIsDefault(val){
    if(currentConfig.host){
      if(val === 'Yes'){
        isDefault.value = true;
        return true;
      }
      else if(val === 'No'){
        isDefault.value = false;
        return false;
      }
    }
    else {
      isDefault.value = false;
      return false;
    }
    
  }

  function getIsDefault(){
    return isDefault.value;
  }

  const questions = [
    {
      name: "default",
      type: "list",
      message: "Use default config? # ",
      choices: ["Yes", "No"],
      filter: changeIsDefault
    },
    {
      name: "host",
      type: "input",
      message: "What is the host? # ",
      when: function(){
        return !getIsDefault();
      },
      filter: function (val) {
        if(val){
          currentConfig.host = val;
        }
        return val;
      }
    },
    {
      name: "username",
      type: "input",
      message: "What is the username? # ",
      when: function () {
        return !getIsDefault();
      },
      filter: function (val) {
        if(val){
          currentConfig.username = val;
        }
        return val;
      }
    },
    {
      name: "password",
      type: "input",
      message: "What is the password? # ",
      when: function () {
        return !getIsDefault();
      },
      filter: function (val) {
        if(val){
          currentConfig.password = val;
        }
        return val;
      }
    },
    {
      type: "list",
      name: "level",
      message: "What is the LOG LEVEL? # ",
      choices: ["error", "info", "warning", "debug"],
      when: function () {
        return !getIsDefault();
      },
      filter: function (val) {
        if(val){
          currentConfig.level = val;
        }
        return val;
      }
    },
    {
      name: "selectDate",
      type: "list",
      message: "Select the log date # ",
      choices: ["today", "yesterday", "custom"],
      filter: function (val) {
        if(val){
          currentConfig.date = val;
        }
        return val;
      },
      when: function () {
        return !getIsDefault();
      }
    },
    {
      name: "customDate",
      type: "input",
      message: "Write the LOG DATE? (Format: YYYYMMDD) # ",
      when: function () {
        return !getIsDefault() && (currentConfig.date === 'custom');
      },
      filter: function (val) {
        let formatIsCorrect = /\d\d\d\d\d\d\d\d/.test(val);
        if (formatIsCorrect) {
          currentConfig.date = val;
          return val;
        } else {
          currentConfig.date = "";
          return ""
        }
      }
    },
    {
      name: "editor",
      type: "list",
      message: "Select prefer editor to open log file # ",
      choices: ["don't open", "atom", "code", "default", "path to the *.exe file"],
      filter: function (val) {
        if(val && (val !== "don't open") && (val !== "default") ){
          currentConfig.editor = val;
          return val;
        }
        else {
          currentConfig.editor = "";
          return "";
        }
        
      },
      when: function () {
        return !getIsDefault();
      }
    },
    {
      name: "editorPath",
      type: "input",
      message: "Path to the editor *.exe # ",
      when: function () {
        return !getIsDefault() && (currentConfig.editor === 'path to the *.exe file');
      },
      filter: function (val) {
        if(val){
          currentConfig.editor = val;
        }
        return val;
      }
    },
    {
      name: "save",
      type: "list",
      choices: ["No", "Yes"],
      message: "Do we need to save current options to the config? # ",
      when: function () {
        return !getIsDefault();
      }
    }
  ];
  return inquirer.prompt(questions);
};

const run = async () => {

  printLogo("/ OCC  LOGS by VN  /", "white")

  const answers = await askQuestions();

  if(answers.save === "Yes"){
    console.log("Config saved");
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(currentConfig))
  }

  let readFinished = await reader(currentConfig);
  setTimeout(() => {}, 4000);

  if(readFinished){
    if(currentConfig.editor){
      printLogo("/ Open in Your editor /", "white");
      await open(LOG_PATH, { wait: false, app: currentConfig.editor });
    }
    else{
      printLogo("/ Look at  _ log.log _  file /", "green");
    }
  }
  else {
    printLogo("/ Erorr /", "red");
  }

  

};

run();