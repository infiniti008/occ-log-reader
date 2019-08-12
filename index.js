const getLogs = require("occ-log-reader-package");
process.env.PRODUCTION = "BAT";

const LOG_PATH = __dirname + "/log.log";
const CONFIG_PATH = __dirname + "/config.json";

getLogs(CONFIG_PATH, LOG_PATH);