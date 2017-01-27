create database ticketing_test;

use ticketing_test;

CREATE TABLE tickets(
id int NOT NULL AUTO_INCREMENT,
subject varchar(1000),
user_id varchar(100),
asignee_id varchar(100),
priority int(1),
description varchar(20000),
PRIMARY KEY (id)
);
insert into tickets(subject,user_id,asignee_id,priority,description) values("Wind Tunnel computer not working","Hal Jordan","Ferris C.",0,"I was trying to do some simulations before the test flight on thursday and the wind tunnel computer just wasn't working. It kept flashing green and telling me to contact OA whatever that means. I could used this fixed as soon as possible so I can make my flight. Afterall it's not like I can fly on my own.");
insert into tickets(subject,user_id,asignee_id,priority,description) values("Power Problems","Maxwell Dillon","Scott Lang",0,"The lights in my office keep flickering. I don't know why but I am assuming it is something electrical. If you could send someone to look at it that would be apprecieated. Would want anyone getting electrocuted afterall...");
insert into tickets(subject,user_id,asignee_id,priority,description) values("Bird repellent","Dick Greyson","Alfred Pennyworth",0,"Every night I keep seeing wings outside my office window, audibal deterent is broken or something but the it's all I see at night! Wings! If you could fix the audible repellent that would be great.");
insert into tickets(subject,user_id,asignee_id,priority,description) values("QWERTY not working","Bob T.","Lary C.",1,"QWERTY just isn't working properly. I don't know why but it seems like it just isn't turning on. I really need it in order to communicate what we've learned today in class. Please help.");
insert into tickets(subject,user_id,asignee_id,priority,description) values("Thrust output","Tiberius K.","Scott T.",0,"My motors in the physics lab aren't outputing the proper thrust. I don't know what you can do to fix them but I really need all their power you know? give them all they have! thanks for any help");
