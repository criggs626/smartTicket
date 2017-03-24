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
TITLE TINYTEXT,
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

INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"I have an internet question","My internet won't connect. Could you help with that?","[0]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"My internet won't work","I've tried connecting to polysecure, but it won't work.","[1]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"WIFI problems","I can't connect to the Wi-Fi for the life of me.","[1]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"Network card won't connect to wifi network polysecure","I tried changing my settings so I could bridge the connection, but I broke it and now it won't connect. Could you help me out?","[1]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"Do you have an existential crisis when your computer can't connect to the intiernet? I do.","AND THAT IS THE SITUATION I'M IN RIGHT NOW!!!! UGHHHHH!!!! HELP ME OR DIE!!!","[1]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"BSOD","My internet won't connect. Could you help with that?","[2]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"Blue screen of death","My internet won't connect. Could you help with that?","[0]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"My computer went blue and won't turn back on. Help?","I just see this blue screen that says 'Error bad handler issue 44932'. What should I do to fix it?","[2]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"Can't avoid the BSOD forever","Finally happened to me for the first time ever. It's your problem now, man.","[2]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"I think I have that blue screen of death thing that everybody keeps talking about.","I tried looking it up on the internet to no avail. Help?","[2]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"On second, trying to connect to the wifi network. The next, about to die because my computer turned blue. WHY??","FIX IT OR I WILL HURT EVERYBODY YOU LOVE","[2]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"BSOD","BSOD, can't connect to the internet so I just attached a picture instead.","[0]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"Photoshop won't install","I can't get Photoshop to install what am i doing wrong","[0]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"I can't get Google Chrome to install right","Which means I'm stuck with Internet Explorer. Sucks, right?","[3]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"I hate chrome.","CHROME CHROME CHROME <troll>","[3]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"Can't get my download to work for adobe dreamweaver","Or Photoshop either.","[3]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"Google chrome won't install.","I need a bit of space to die in my heart","[3]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"Drivers","You need to give me assistance","[4]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"Drivers won't install error","You need to give me assistance sometimes","[0]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"Can't get the drivers to work","no matter how hard I'm trying","[4]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"Printer says it's missing the necessary drivers","You NEED to give ME assistance with destroying my drivers","[4]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"I hate Uber drivers","Help me to get them fire like they're supposed to be.","[4]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"My phone is not working the way it is supposed to.","My Android phone stopped working and NOW I CAN'T make calls. Also, this is Gospel for the fallen ones locked away in permanent slumber assembling their philosophies from pieces of broken memories.","[5]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"My phone is not working the way it is supposed to.","My Apple phone stopped working and NOW I CAN'T make calls. Also, this is Gospel for the fallen ones locked away in permanent slumber assembling their philosophies from pieces of broken memories.","[5]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"My phone is not working the way it is supposed to.","My iPhone stopped working and NOW I CAN'T make calls. Also, this is Gospel for the fallen ones locked away in permanent slumber assembling their philosophies from pieces of broken memories.","[5]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"My phone is not working the way it is supposed to.","My Windows phone stopped working and NOW I CAN'T make calls. Also, this is Gospel for the fallen ones locked away in permanent slumber assembling their philosophies from pieces of broken memories.","[5]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"My phone is not working the way it is supposed to.","My Blackberry smartphone stopped working and NOW I CAN'T make calls. Also, this is Gospel for the fallen ones locked away in permanent slumber assembling their philosophies from pieces of broken memories.","[5]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"My phone is not working the way it is supposed to.","My smart phone stopped working and NOW I CAN'T make calls. Also, this is Gospel for the fallen ones locked away in permanent slumber assembling their philosophies from pieces of broken memories.","[5]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"My phone is not working the way it is supposed to.","My Google pixel stopped working and NOW I CAN'T make calls. Also, this is Gospel for the fallen ones locked away in permanent slumber assembling their philosophies from pieces of broken memories.","[5]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"Graphics design tips","Photoshop or GIMP?.","[6]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"Graphics design is hard","I was told one of you guys could help.","[6]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"My Photoshop won't open","And neither will my computer. This is actually a BSOD problem.","[6]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"Gimp won't open, either.","What in incorrect operation?.","[6]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"Gotta go fast to get ms paint to work","Otherwise it crashes before I can submit.","[6]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"MSPaint is awesome in my opinion","But do you have any preferences toward other things? Are there any photo editors for Internet Explorer?","[6]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"I need a bit more time to design my graphics","We'll walk this road together through the storm whatever whether cold or warm.","[6]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"I'll never let you down again like that All I'm trying to say is get back click clack pow!","That's what I'm trying to write in my graphics design program. What font should I use? Comic Sans?","[6]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"Can't get python to work","Programming is difficult.","[7]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"Can you help me with Java or Python?","How do I get started???.","[7]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"What is the optimal way to program a for loop in Java?","Last time I tried it didn't for too loop..","[7]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"Can I get a whooop whoopppp? for Java","Java is a nice language. Not a real human language, a programming language..","[7]",TRUE,3);
INSERT INTO TICKETS (CATEGORY,CLIENT,TITLE,DESCRIPTION,ASSIGNEE_ID,OPEN_STATUS,PRIORITY) VALUES(2,1,"If python oh oh your a baby","Boy don't try to run I know just just what you are. You got me going your oh so charming but I can't do it.","[7]",TRUE,3);
