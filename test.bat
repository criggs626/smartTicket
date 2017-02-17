@echo off
set /p user="Enter MySQL username: "
set /p pass="Enter MySQL password: "
echo %user% > file.txt
echo %pass% >> file.txt