/* eslint-disable require-atomic-updates */
const vscode = require("vscode");
const fs = require("fs");
const CONFIG_PATH = __dirname + "/config.json";

/**
 * @param {vscode.ExtensionContext} context
 */

function activate(context) {

  let readLogsCommand = vscode.commands.registerCommand("extension.readLogs", readLogs);
  context.subscriptions.push(readLogsCommand);

  let configureCommand = vscode.commands.registerCommand("extension.configureLogs", configureLogs);

  context.subscriptions.push(configureCommand);

  let cloneConfigCommand = vscode.commands.registerCommand("extension.cloneConfig", cloneConfig);

  context.subscriptions.push(cloneConfigCommand);

  let readWithConfigCommand = vscode.commands.registerCommand("extension.readWithConfig", readWithConfig);

  context.subscriptions.push(readWithConfigCommand);
}

exports.activate = activate;

function deactivate() { }

async function configureLogs() {
  let newConfig = await makeConfigureLogs();
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(newConfig));
}

async function makeConfigureLogs() {
  let currentConfig = JSON.parse(fs.readFileSync(CONFIG_PATH));

  currentConfig.host = await vscode.window.showInputBox({
    placeHolder: currentConfig.host || "Enter host URL"
  }) || currentConfig.host;

  currentConfig.username = await vscode.window.showInputBox({
    placeHolder: currentConfig.username || "Enter username"
  }) || currentConfig.username;

  currentConfig.password = await vscode.window.showInputBox({
    placeHolder: currentConfig.password || "Enter password"
  }) || currentConfig.password;

  currentConfig.level = await vscode.window.showQuickPick(["error", "info", "warning", "debug"], {
    canPickMany: false,
    placeHolder: currentConfig.level || "Select logs level"
  }) || currentConfig.level;

  currentConfig.date = await vscode.window.showQuickPick(["today", "yesterday", "custom"], {
    canPickMany: false,
    placeHolder: currentConfig.date || "Select logs date"
  }) || currentConfig.date;

  await checkCustomDate();

  async function checkCustomDate() {
    let correctFormat = /\d\d\d\d\d\d\d\d/;
    let inputDate;
    if (currentConfig.date === "custom") {
      inputDate = await vscode.window.showInputBox({
        placeHolder: "Input custom date in format YYYYMMDD"
      });

      if (correctFormat.test(inputDate)) {
        currentConfig.date = inputDate;
      }
      checkCustomDate();
    }
  }

  return currentConfig;
}

async function cloneConfig() {
  let filesList = await vscode.window.showOpenDialog({
    openLabel: "Clone selected config",
    canSelectFiles: true,
    canSelectFolders: false,
    canSelectMany: false,
    filters: {
      "Configs": ["json"]
    }
  });

  try {
    let config = require(filesList[0].fsPath);
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config));
  }
  catch (err) {
    vscode.window.showErrorMessage("Unable to clone existing config");
  }

  vscode.window.showInformationMessage("Config is cloned success");
}

async function readWithConfig() {
  let newConfig = await makeConfigureLogs();

  await makeReadLogs(newConfig);
}

async function readLogs() {
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH).toString());

  await makeReadLogs(config);
}

async function makeReadLogs(readConfig) {

  const reader = require("occ-log-reader-package");

  vscode.window.withProgress({ title: "Reading logs", location: vscode.ProgressLocation.Notification, cancellable: false }, async (progress) => {
    progress.report({ increment: 5, message: "Starting" });

    let increment = 5;
    let count = 0;
    let dotts = ["."];
    let interval = setInterval(() => {
      progress.report({ increment, message: dotts.join("") });
      dotts.push(".");
      count += 1;
      increment = parseInt(15 / count) || 1;
    }, 700);

    let content = await reader(readConfig);
    clearInterval(interval);

    if (content.error) {
      progress.report({ increment: 100, message: "Reading logs is finished with error" });
      vscode.window.showErrorMessage(content.error.message);
    }
    else {
      increment = 90;
      progress.report({ increment, message: "Opening the file." });

      const path = require("path");
      const newFile = vscode.Uri.parse("untitled:" + path.join(vscode.workspace.rootPath, "log.log"));
      let newDocument = await vscode.workspace.openTextDocument(newFile);

      const edit = new vscode.WorkspaceEdit();
      edit.insert(newFile, new vscode.Position(0, 0), content);

      let applyedEdit = await vscode.workspace.applyEdit(edit);

      if (applyedEdit) {
        let showedDocument = await vscode.window.showTextDocument(newDocument);

        vscode.commands.executeCommand("editorScroll", { to: "down", by: "line", value: showedDocument.document.lineCount - 40 });
      } else {
        vscode.window.showInformationMessage("Error!");
      }

      newDocument = null;
      content = null;

      setTimeout(() => {
        progress.report({ increment: 100, message: "Reading logs is finished" });
      }, 3000);
    }
  });
}

module.exports = {
  activate,
  deactivate
};
