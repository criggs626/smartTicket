@echo off
set /p user="Enter MySQL username: "
set /p pass="Enter MySQL password: "
mysql -u %user% --password=%pass% < tableCreation.sql && echo Success!
pause
