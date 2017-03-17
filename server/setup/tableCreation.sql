drop database smartticket;
CREATE DATABASE smartTicket;
USE smartTicket;

CREATE TABLE PERMISSIONS(
PERMISSION_ID int NOT NULL,
NAME VARCHAR(10),
PRIMARY KEY(PERMISSION_ID)
);

-- DEPARTMENTS and CLIENT primary key is an auto incrememnting variable, this way when new departments or clients are added there is less required information

CREATE TABLE DEPARTMENTS(
DEPARTMENT_ID int NOT NULL AUTO_INCREMENT,
NAME VARCHAR(20),
PRIMARY KEY(DEPARTMENT_ID)
);

CREATE TABLE CLIENTS(
CLIENT_ID int NOT NULL AUTO_INCREMENT,
EMAIL varchar(35),
PRIMARY KEY(CLIENT_ID)
);

/*
User table is dependant on permissions and departments
added a variable for containing an encrypted password
this system doesn't immediatly provide a salt, a salt can be added later for convenience
*/
CREATE TABLE USERS(
USER_ID int NOT NULL AUTO_INCREMENT,
DEPARTMENT varchar(20),
PERMISSION int NOT NULL,
FNAME varchar(20),
LNAME varchar(20),
BIRTH_DAY DATE,
WORK_EMAIL varchar(35),
PERSONAL_EMAIL varchar(35),
PHONE varchar(15),
PASSWORD BINARY(64) NOT NULL,
PRIMARY KEY (USER_ID),
FOREIGN KEY (PERMISSION) REFERENCES PERMISSIONS(PERMISSION_ID)
);

-- created table for categories
CREATE TABLE CATEGORIES(
CATEGORY_ID int NOT NULL AUTO_INCREMENT,
NAME VARCHAR(20),
PRIMARY KEY(CATEGORY_ID)
);

-- Attempted text fields for description and later for messasge content
CREATE TABLE TICKETS(
TICKET_ID int NOT NULL AUTO_INCREMENT,
DEPARTMENT int,
CLIENT int NOT NULL,
CATEGORY int,
TITLE varchar(30),
DESCRIPTION MEDIUMTEXT,
ASSIGNEE_ID varchar(100),
OPEN_STATUS BOOLEAN,
PRIORITY int,
PRIMARY KEY (TICKET_ID),
FOREIGN KEY (DEPARTMENT) REFERENCES DEPARTMENTS(DEPARTMENT_ID),
FOREIGN KEY (CLIENT) REFERENCES CLIENTS(CLIENT_ID),
FOREIGN KEY (CATEGORY) REFERENCES CATEGORIES(CATEGORY_ID)
);

CREATE TABLE MESSAGES (
MESSAGE_ID int NOT NULL AUTO_INCREMENT,
TICKET int,
CLIENT int,
USER int,
MESSAGE_CONTENT TEXT,
TIME_SENT DATE,
SENDER BOOLEAN,
PRIMARY KEY (MESSAGE_ID),
FOREIGN KEY (TICKET) REFERENCES TICKETS(TICKET_ID),
FOREIGN KEY (CLIENT) REFERENCES CLIENTS(CLIENT_ID),
FOREIGN KEY (USER) REFERENCES USERS(USER_ID)
);

INSERT INTO PERMISSIONS(PERMISSION_ID,NAME) VALUES(0,"root");
INSERT INTO PERMISSIONS(PERMISSION_ID,NAME) VALUES(1,"manager");
INSERT INTO PERMISSIONS(PERMISSION_ID,NAME) VALUES(2,"User");

INSERT INTO DEPARTMENTS(NAME) VALUES ("Networking");
INSERT INTO DEPARTMENTS(NAME) VALUES ("Licensing");
INSERT INTO DEPARTMENTS(NAME) VALUES ("HR");

INSERT INTO USERS(PERMISSION,FNAME,LNAME,BIRTH_DAY,WORK_EMAIL,PERSONAL_EMAIL,PHONE,PASSWORD,DEPARTMENT) VALUES(0,"Caleb","Riggs","1997-11-04","criggs2892@flpoly.org","madscientist626@verizon.net","7277102842",MD5("password"),"0");
INSERT INTO USERS(PERMISSION,FNAME,LNAME,BIRTH_DAY,WORK_EMAIL,PERSONAL_EMAIL,PHONE,PASSWORD,DEPARTMENT) VALUES(1,"Jared","Davis","1991-04-23","jareddavis0237@flpoly.org","jdavis@gmail.com","8139999999",MD5("password"),"0");
INSERT INTO USERS(PERMISSION,FNAME,LNAME,BIRTH_DAY,WORK_EMAIL,PERSONAL_EMAIL,PHONE,PASSWORD,DEPARTMENT) VALUES(0,"Gabriel","Hutchison","1997-08-11","ghutchison2600@flpoly.org","","8138082533",MD5("password"),"0");
INSERT INTO USERS(PERMISSION,FNAME,LNAME,BIRTH_DAY,WORK_EMAIL,PERSONAL_EMAIL,PHONE,PASSWORD,DEPARTMENT) VALUES(1,"William","Bell","1996-06-21","williambell0161@flpoly.org","","12345678900",MD5("password"),"0");
INSERT INTO USERS(PERMISSION,FNAME,LNAME,BIRTH_DAY,WORK_EMAIL,PERSONAL_EMAIL,PHONE,PASSWORD,DEPARTMENT) VALUES(1,"Thomas","Carter","1996-06-21","thomascarter@flpoly.org","","12345678900",MD5("password"),"0");
INSERT INTO USERS(PERMISSION,FNAME,LNAME,BIRTH_DAY,WORK_EMAIL,PERSONAL_EMAIL,PHONE,PASSWORD,DEPARTMENT) VALUES(1,"Henrique","Bolivar","1996-02-21","henriquebolivar1000@flpoly.org","","12345678900",MD5("calebRox"),"0");

INSERT INTO CLIENTS (EMAIL) VALUES("test@gmail.com");
INSERT INTO CLIENTS (EMAIL) VALUES("secondTest@verizon.net");
INSERT INTO CLIENTS (EMAIL) VALUES("thirdTest@yahoo.com");
INSERT INTO CLIENTS (EMAIL) VALUES("fourth@flpoly.org");

INSERT INTO CATEGORIES(NAME) VALUES("Unknown");
INSERT INTO CATEGORIES(NAME) VALUES("End User");
INSERT INTO CATEGORIES(NAME) VALUES("Software Request");

INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"Network Issues","I am having issues connecting to the internet on my laptop, I wonder if it is something to do with the security settings? Please if you could take a look at it and let. I have a class later and internet is necessary","[1,2]",TRUE,3);
INSERT INTO TICKETS (CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,"Issue","I can't get it to work... I just can't...","[1]",TRUE,5);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(3,1,"Office","I need to have access to microsoft office on my computer. If you could make that work that would be great.","[2]",TRUE,2);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(1,1,"Long ticket test","Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum","[0]",TRUE,2);
