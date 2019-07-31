# OCC Logs Reader
## Cloning the NodeJS application
```
git clone https://gitlab.com/vyacheslav_nikitenok/occ-log-reader.git
```
## Installing dependencies
```
cd occ-log-reader/src

npm i

cd ..
```
## Run application
```
Double click on occ-log-reader/start.bat
```
# OR

## Manual configuring the application
* Open _config.json_ file
* Specify admin _host_
  * Format: _https://ccadmin-***.oracleoutsourcing.com_
* Specify admin _username_
* Specify admin _password_
* Specify log _level_ 
  * Default is "_error_"
  * Available options are: _debug_ | _info_ | _error_ | _warning_
* Specify log _date_
  * Default is current date
  * Format: _YYYYMMDD_
  * Example: _20190731_
* Specify default _editor_
  * atom
  * code
  * nothing
  * default
  * don't open
## Manual reading logs
```
node src/index
```
## Logs will insert to the _log.log_ file. Open this file with code editor eg. Atom, VS Code, Web Storm, IDE.