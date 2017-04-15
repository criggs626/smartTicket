@echo off

:: Collect data

set mysql_user=
set mysql_pass=
set mysql_port=
set gmail_user=
set gmail_pass=
set server_port=

set /p mysql_user="Enter MySQL username (default 'root'): "
set password=
set "psCommand=powershell -Command "$pword = read-host 'Enter MySQL password (default blank)' -AsSecureString ; ^
    $BSTR=[System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pword); ^
        [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)""
for /f "usebackq delims=" %%p in (`%psCommand%`) do set password=%%p
set mysql_pass=%password%
set /p mysql_port="Enter MySQL port (default '3306'): "
set /p gmail_user="Enter Gmail email: "
set password=
set "psCommand=powershell -Command "$pword = read-host 'Enter Gmail password' -AsSecureString ; ^
    $BSTR=[System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pword); ^
        [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)""
for /f "usebackq delims=" %%p in (`%psCommand%`) do set password=%%p
set gmail_pass=%password%
set /p server_port="Enter server port (default '80'): "

IF [%mysql_user%] == [] set mysql_user=root
IF [%mysql_port%] == [] set mysql_port=3306
IF [%gmail_user%] == [] echo "smartTicket requires a gmail account (no username given)" && pause
IF [%server_port%] == [] set server_port=80


:: Create initial configuration files

mysql -u %mysql_user% --password=%mysql_pass% --port=%port% < tableCreation.sql && echo Created MySQL database && ^
echo { > ../config.json && ^
echo 	"mysql_username": "%mysql_user%", >> ../config.json && ^
echo 	"mysql_password": "%mysql_pass%", >> ../config.json && ^
echo 	"mysql_port": "%mysql_port%", >> ../config.json && ^
echo 	"port": "%server_port%", >> ../config.json && ^
echo 	"gmail_username": "%gmail_user%", >> ../config.json && ^
echo 	"gmail_password": "%gmail_pass%" >> ../config.json && ^
echo } >> ../config.json && ^
echo Created config.json && ^
echo {} > ../machineLearning/dataCount.json && ^
echo Created dataCount.json && ^
cp default_files/colors* ../frontEnd/ && ^
echo Created colors files