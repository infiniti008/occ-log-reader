# OCC Logs Reader

![Instruction GIF](/src/instruction.gif?raw=true)

## Releases
* [0.9.1](https://gitlab.com/vyacheslav_nikitenok/occ-log-reader/-/tags/v0.9.1)

## 1. Get application
* ### Load file
    ```
    Load *.zip
    ```
* ### By console
    ```
    git clone https://gitlab.com/vyacheslav_nikitenok/occ-log-reader.git
    ```
## 2. Install dependencies
* ### Automatical
    ```
    Run INSTALL.bat
    ```
* ### By console
    ```
    cd occ-log-reader/src

    npm i

    cd ..
    ```
## 3. Run application
Leave input empty to use saved option. Logs will insert to the _log.log_ file. Open this file with code editor eg. Atom, VS Code, Web Storm, IDE.
* ### Automatical
    ```
    Run START.bat
    ```

* ### By console
    ```
    node src/index
    ```
    or
    ```
    ./START.bat
    ```

### 4. Manual configuring the application
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