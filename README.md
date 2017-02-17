# SmartTicketingSystem
A smart ticketing system for organizations to track issues using machine learning concepts.

## Setup
Run setup.bat (Windows) in the root directory of the repository to build the MySQL tables.

## Configuration
Configure some details of the server in ```config.json```.

### Example
```json
{
    "mysql-username": "root",     // mysql user
    "mysql-password": "password", // mysql password
    "port": "80"                  // port to run server on
}
```

## Run
To start the server, open the command line and run
```shell
cd server
node server.js
```
If that doesn't work, try
```shell
cd server
nodejs server.js
```
