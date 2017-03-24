CREATE TABLE IF NOT EXISTS `categories` (
  `CATEGORY_ID` int(11) NOT NULL AUTO_INCREMENT,
  `NAME` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`CATEGORY_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `clients` (
  `CLIENT_ID` int(11) NOT NULL AUTO_INCREMENT,
  `EMAIL` varchar(35) DEFAULT NULL,
  PRIMARY KEY (`CLIENT_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `departments` (
  `DEPARTMENT_ID` int(11) NOT NULL AUTO_INCREMENT,
  `NAME` varchar(20) DEFAULT NULL,
  PRIMARY KEY (`DEPARTMENT_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `messages` (
  `MESSAGE_ID` int(11) NOT NULL AUTO_INCREMENT,
  `TICKET` int(11) DEFAULT NULL,
  `CLIENT` int(11) DEFAULT NULL,
  `USER` int(11) DEFAULT NULL,
  `MESSAGE_CONTENT` text,
  `TIME_SENT` date DEFAULT NULL,
  `SENDER` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`MESSAGE_ID`),
  KEY `TICKET` (`TICKET`),
  KEY `CLIENT` (`CLIENT`),
  KEY `USER` (`USER`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`TICKET`) REFERENCES `tickets` (`TICKET_ID`),
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`CLIENT`) REFERENCES `clients` (`CLIENT_ID`),
  CONSTRAINT `messages_ibfk_3` FOREIGN KEY (`USER`) REFERENCES `users` (`USER_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `permissions` (
  `PERMISSION_ID` int(11) NOT NULL,
  `NAME` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`PERMISSION_ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `tickets` (
  `TICKET_ID` int(11) NOT NULL AUTO_INCREMENT,
  `DEPARTMENT` int(11) DEFAULT NULL,
  `CLIENT` int(11) NOT NULL,
  `CATEGORY` int(11) DEFAULT NULL,
  `TITLE` tinytext,
  `DESCRIPTION` mediumtext,
  `ASSIGNEE_ID` varchar(100) DEFAULT NULL,
  `OPEN_STATUS` tinyint(1) DEFAULT NULL,
  `PRIORITY` int(11) DEFAULT NULL,
  PRIMARY KEY (`TICKET_ID`),
  KEY `DEPARTMENT` (`DEPARTMENT`),
  KEY `CLIENT` (`CLIENT`),
  KEY `CATEGORY` (`CATEGORY`),
  CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`DEPARTMENT`) REFERENCES `departments` (`DEPARTMENT_ID`),
  CONSTRAINT `tickets_ibfk_2` FOREIGN KEY (`CLIENT`) REFERENCES `clients` (`CLIENT_ID`),
  CONSTRAINT `tickets_ibfk_3` FOREIGN KEY (`CATEGORY`) REFERENCES `categories` (`CATEGORY_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=latin1;

CREATE TABLE IF NOT EXISTS `users` (
  `USER_ID` int(11) NOT NULL AUTO_INCREMENT,
  `DEPARTMENT` varchar(20) DEFAULT NULL,
  `PERMISSION` int(11) NOT NULL,
  `FNAME` varchar(20) DEFAULT NULL,
  `LNAME` varchar(20) DEFAULT NULL,
  `BIRTH_DAY` date DEFAULT NULL,
  `WORK_EMAIL` varchar(35) DEFAULT NULL,
  `PERSONAL_EMAIL` varchar(35) DEFAULT NULL,
  `PHONE` varchar(15) DEFAULT NULL,
  `PASSWORD` binary(64) NOT NULL,
  PRIMARY KEY (`USER_ID`),
  KEY `PERMISSION` (`PERMISSION`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`PERMISSION`) REFERENCES `permissions` (`PERMISSION_ID`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=latin1;

INSERT INTO `categories` (`CATEGORY_ID`,`NAME`) VALUES (1,'Unknown');
INSERT INTO `categories` (`CATEGORY_ID`,`NAME`) VALUES (2,'End User');
INSERT INTO `categories` (`CATEGORY_ID`,`NAME`) VALUES (3,'Software Request');

INSERT INTO `clients` (`CLIENT_ID`,`EMAIL`) VALUES (1,'test@gmail.com');
INSERT INTO `clients` (`CLIENT_ID`,`EMAIL`) VALUES (2,'secondTest@verizon.net');
INSERT INTO `clients` (`CLIENT_ID`,`EMAIL`) VALUES (3,'thirdTest@yahoo.com');
INSERT INTO `clients` (`CLIENT_ID`,`EMAIL`) VALUES (4,'fourth@flpoly.org');
INSERT INTO `clients` (`CLIENT_ID`,`EMAIL`) VALUES (5,'madscientist626@verizon.net');
INSERT INTO `clients` (`CLIENT_ID`,`EMAIL`) VALUES (6,'madscientist626@verizon.net');

INSERT INTO `departments` (`DEPARTMENT_ID`,`NAME`) VALUES (1,'Networking');
INSERT INTO `departments` (`DEPARTMENT_ID`,`NAME`) VALUES (2,'Licensing');
INSERT INTO `departments` (`DEPARTMENT_ID`,`NAME`) VALUES (3,'HR');

INSERT INTO `messages` (`MESSAGE_ID`,`TICKET`,`CLIENT`,`USER`,`MESSAGE_CONTENT`,`TIME_SENT`,`SENDER`) VALUES (1,1,NULL,1,'Help!','2017-03-21 00:00:00.000',0);
INSERT INTO `messages` (`MESSAGE_ID`,`TICKET`,`CLIENT`,`USER`,`MESSAGE_CONTENT`,`TIME_SENT`,`SENDER`) VALUES (2,1,NULL,1,'Tacos!!!!','2017-03-24 00:00:00.000',0);

INSERT INTO `permissions` (`PERMISSION_ID`,`NAME`) VALUES (0,'root');
INSERT INTO `permissions` (`PERMISSION_ID`,`NAME`) VALUES (1,'manager');
INSERT INTO `permissions` (`PERMISSION_ID`,`NAME`) VALUES (2,'User');

INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (1,NULL,1,2,'I have an internet question','My internet won\'t connect. Could you help with that?','[1]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (2,NULL,1,2,'My internet won\'t work','I\'ve tried connecting to polysecure, but it won\'t work.','[1]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (3,NULL,1,2,'WIFI problems','I can\'t connect to the Wi-Fi for the life of me.','[1]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (4,NULL,1,2,'Network card won\'t connect to wifi network polysecure','I tried changing my settings so I could bridge the connection, but I broke it and now it won\'t connect. Could you help me out?','[1]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (5,NULL,1,2,'Do you have an existential crisis when your computer can\'t connect to the intiernet? I do.','AND THAT IS THE SITUATION I\'M IN RIGHT NOW!!!! UGHHHHH!!!! HELP ME OR DIE!!!','[1]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (6,NULL,1,2,'BSOD','My internet won\'t connect. Could you help with that?','[2]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (7,NULL,1,2,'Blue screen of death','My internet won\'t connect. Could you help with that?','[2]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (8,NULL,1,2,'My computer went blue and won\'t turn back on. Help?','I just see this blue screen that says \'Error bad handler issue 44932\'. What should I do to fix it?','[2]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (9,NULL,1,2,'Can\'t avoid the BSOD forever','Finally happened to me for the first time ever. It\'s your problem now, man.','[2]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (10,NULL,1,2,'I think I have that blue screen of death thing that everybody keeps talking about.','I tried looking it up on the internet to no avail. Help?','[0]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (11,NULL,1,2,'On second, trying to connect to the wifi network. The next, about to die because my computer turned blue. WHY??','FIX IT OR I WILL HURT EVERYBODY YOU LOVE','[2]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (12,NULL,1,2,'BSOD','BSOD, can\'t connect to the internet so I just attached a picture instead.','[2]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (13,NULL,1,2,'Photoshop won\'t install','I can\'t get Photoshop to install what am i doing wrong','[3]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (14,NULL,1,2,'I can\'t get Google Chrome to install right','Which means I\'m stuck with Internet Explorer. Sucks, right?','[3]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (15,NULL,1,2,'I hate chrome.','CHROME CHROME CHROME <troll>','[3]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (16,NULL,1,2,'Can\'t get my download to work for adobe dreamweaver','Or Photoshop either.','[3]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (17,NULL,1,2,'Google chrome won\'t install.','I need a bit of space to die in my heart','[3]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (18,NULL,1,2,'Drivers','You need to give me assistance','[4]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (19,NULL,1,2,'Drivers won\'t install error','You need to give me assistance sometimes','[4]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (20,NULL,1,2,'Can\'t get the drivers to work','no matter how hard I\'m trying','[4]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (21,NULL,1,2,'Printer says it\'s missing the necessary drivers','You NEED to give ME assistance with destroying my drivers','[4]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (22,NULL,1,2,'I hate Uber drivers','Help me to get them fire like they\'re supposed to be.','[4]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (23,NULL,1,2,'My phone is not working the way it is supposed to.','My Android phone stopped working and NOW I CAN\'T make calls. Also, this is Gospel for the fallen ones locked away in permanent slumber assembling their philosophies from pieces of broken memories.','[0]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (24,NULL,1,2,'My phone is not working the way it is supposed to.','My Apple phone stopped working and NOW I CAN\'T make calls. Also, this is Gospel for the fallen ones locked away in permanent slumber assembling their philosophies from pieces of broken memories.','[0]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (25,NULL,1,2,'My phone is not working the way it is supposed to.','My iPhone stopped working and NOW I CAN\'T make calls. Also, this is Gospel for the fallen ones locked away in permanent slumber assembling their philosophies from pieces of broken memories.','[5]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (26,NULL,1,2,'My phone is not working the way it is supposed to.','My Windows phone stopped working and NOW I CAN\'T make calls. Also, this is Gospel for the fallen ones locked away in permanent slumber assembling their philosophies from pieces of broken memories.','[5]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (27,NULL,1,2,'My phone is not working the way it is supposed to.','My Blackberry smartphone stopped working and NOW I CAN\'T make calls. Also, this is Gospel for the fallen ones locked away in permanent slumber assembling their philosophies from pieces of broken memories.','[5]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (28,NULL,1,2,'My phone is not working the way it is supposed to.','My smart phone stopped working and NOW I CAN\'T make calls. Also, this is Gospel for the fallen ones locked away in permanent slumber assembling their philosophies from pieces of broken memories.','[5]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (29,NULL,1,2,'My phone is not working the way it is supposed to.','My Google pixel stopped working and NOW I CAN\'T make calls. Also, this is Gospel for the fallen ones locked away in permanent slumber assembling their philosophies from pieces of broken memories.','[5]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (30,NULL,1,2,'Graphics design tips','Photoshop or GIMP?.','[6]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (31,NULL,1,2,'Graphics design is hard','I was told one of you guys could help.','[6]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (32,NULL,1,2,'My Photoshop won\'t open','And neither will my computer. This is actually a BSOD problem.','[6]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (33,NULL,1,2,'Gimp won\'t open, either.','What in incorrect operation?.','[6]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (34,NULL,1,2,'Gotta go fast to get ms paint to work','Otherwise it crashes before I can submit.','[6]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (35,NULL,1,2,'MSPaint is awesome in my opinion','But do you have any preferences toward other things? Are there any photo editors for Internet Explorer?','[6]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (36,NULL,1,2,'I need a bit more time to design my graphics','We\'ll walk this road together through the storm whatever whether cold or warm.','[6]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (37,NULL,1,2,'I\'ll never let you down again like that All I\'m trying to say is get back click clack pow!','That\'s what I\'m trying to write in my graphics design program. What font should I use? Comic Sans?','[0]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (38,NULL,1,2,'Can\'t get python to work','Programming is difficult.','[7]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (39,NULL,1,2,'Can you help me with Java or Python?','How do I get started???.','[7]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (40,NULL,1,2,'What is the optimal way to program a for loop in Java?','Last time I tried it didn\'t for too loop..','[7]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (41,NULL,1,2,'Can I get a whooop whoopppp? for Java','Java is a nice language. Not a real human language, a programming language..','[7]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (42,NULL,1,2,'If python oh oh your a baby','Boy don\'t try to run I know just just what you are. You got me going your oh so charming but I can\'t do it.','[0]',1,3);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (43,NULL,5,2,'My ticket system isn\'t alerting','It won\'t alert properly','1',1,NULL);
INSERT INTO `tickets` (`TICKET_ID`,`DEPARTMENT`,`CLIENT`,`CATEGORY`,`TITLE`,`DESCRIPTION`,`ASSIGNEE_ID`,`OPEN_STATUS`,`PRIORITY`) VALUES (44,NULL,5,2,'password reset','I need to reset my password how can I do this?','3',1,NULL);

INSERT INTO `users` (`USER_ID`,`DEPARTMENT`,`PERMISSION`,`FNAME`,`LNAME`,`BIRTH_DAY`,`WORK_EMAIL`,`PERSONAL_EMAIL`,`PHONE`,`PASSWORD`) VALUES (1,'0,3',0,'Caleb','Riggs','1997-11-04 00:00:00.000','criggs2892@flpoly.org','madscientist626@verizon.net','7277102842',''35663464636333623561613736356436316438333237646562383832636639390000000000000000000000000000000000000000000000000000000000000000');
INSERT INTO `users` (`USER_ID`,`DEPARTMENT`,`PERMISSION`,`FNAME`,`LNAME`,`BIRTH_DAY`,`WORK_EMAIL`,`PERSONAL_EMAIL`,`PHONE`,`PASSWORD`) VALUES (2,'0,1',1,'Jared','Davis','1991-04-23 00:00:00.000','jareddavis0237@flpoly.org','jdavis@gmail.com','8139999999',''35663464636333623561613736356436316438333237646562383832636639390000000000000000000000000000000000000000000000000000000000000000');
INSERT INTO `users` (`USER_ID`,`DEPARTMENT`,`PERMISSION`,`FNAME`,`LNAME`,`BIRTH_DAY`,`WORK_EMAIL`,`PERSONAL_EMAIL`,`PHONE`,`PASSWORD`) VALUES (3,'0,2',0,'Gabriel','Hutchison','1997-08-11 00:00:00.000','ghutchison2600@flpoly.org','','8138082533',''35663464636333623561613736356436316438333237646562383832636639390000000000000000000000000000000000000000000000000000000000000000');
INSERT INTO `users` (`USER_ID`,`DEPARTMENT`,`PERMISSION`,`FNAME`,`LNAME`,`BIRTH_DAY`,`WORK_EMAIL`,`PERSONAL_EMAIL`,`PHONE`,`PASSWORD`) VALUES (4,'0,2',1,'William','Bell','1996-06-21 00:00:00.000','williambell0161@flpoly.org','','12345678900',''35663464636333623561613736356436316438333237646562383832636639390000000000000000000000000000000000000000000000000000000000000000');
INSERT INTO `users` (`USER_ID`,`DEPARTMENT`,`PERMISSION`,`FNAME`,`LNAME`,`BIRTH_DAY`,`WORK_EMAIL`,`PERSONAL_EMAIL`,`PHONE`,`PASSWORD`) VALUES (5,'0,1',1,'Thomas','Carter','1996-06-21 00:00:00.000','thomascarter@flpoly.org','','12345678900',''35663464636333623561613736356436316438333237646562383832636639390000000000000000000000000000000000000000000000000000000000000000');
INSERT INTO `users` (`USER_ID`,`DEPARTMENT`,`PERMISSION`,`FNAME`,`LNAME`,`BIRTH_DAY`,`WORK_EMAIL`,`PERSONAL_EMAIL`,`PHONE`,`PASSWORD`) VALUES (6,'0,3',1,'Henrique','Bolivar','1996-02-21 00:00:00.000','henriquebolivar1000@flpoly.org','','12345678900',''32396263656637373039643837613738313733323431613466336536643966640000000000000000000000000000000000000000000000000000000000000000');