# OCC read logs package

### Usage
Add dependency into _package.json_:
```
"occ-log-reader-package": "git+https://github.com/infiniti008/occ-log-reader.git#semver:^v1.0.0"
```
Read logs:
```
const reader = require("occ-log-reader-package");
let content = await reader(config);
```

### Export
```
module.exports = reader(config, logPath)
```

### Params
```
config | Mandatory, Object {
    host: Mandatory, String,
    username: Mandatory, String,
    password: Mandatory, String,
    level: Mandatory, String, [ "error" | "info" | "warning" | "debug" ],
    date: Optional, Format: YYYYMMDD
}
```

```
logPath | Optional, String, If present - log content will be saved to spacified file.
```