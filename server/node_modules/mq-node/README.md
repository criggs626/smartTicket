# mQ node

Mysql library inspired on [mQ.php](https://github.com/webcaetano/mQ). 
Suporting JSON to create mysql queries. 
Using on module [node-mysql](https://github.com/felixge/node-mysql/)

Example :

```javascript
var mq = require('mq-node')({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'players'
});

mq.insert('players',{
	player:'Lulu',
	goal:80
}); 

// return INSERT INTO players SET player="Lulu", goal=80
```

## Query

mq.query(query[string],callback)

```javascript
mq.query('SELECT 1+1 as s',function(err,data){
	//result data[0]['s'] 2
})
```

## Delete

mq.delete(table[string or array], where[string, object or array],callback)

```javascript
mq.delete('test',{player:'Janna'},function(err,data){
});

// return DELETE FROM test where player="Janna"

mq.delete('test',{'player:"Janna"','score=100'},function(err,data){
});

// return DELETE FROM test where player="Janna" and score=100

mq.delete('test','player:"Janna" or score=100',function(err,data){
});

// return DELETE FROM test where player="Janna" or score=100
```

## Insert 

mq.insert(table[string or array],set [string, object or array],callback)

```javascript
mq.insert('players',{
	player:'Lulu',
	goal:80
}); 

// return INSERT INTO players SET player="Lulu", goal=80

mq.insert('players',[
	'player="Lulu"',
	'goal=80'
]); 

// return INSERT INTO players SET player="Lulu"

mq.insert('players','player="Lulu", goal=80'); 

// return INSERT INTO players SET player="Lulu"
```

## Update 

mq.update(table[string or array],set [string, object or array],where [string, object or array],callback)

mq.set // Alias

```javascript
mq.update('test',{goal:30},{player:'Janna'},function(err,data){
})

// return UPDATE test set goal=30 WHERE player="Janna"
```

## Select 

mq.select(data[object],callback)

mq.set // Alias

```javascript
mq.select({
	from:'test',
	cols:['player','goal','id'],
	where:{player:'Janna'}
},function(err,data){
})

// RETURN SELECT player, goal, id FROM test WHERE player="Janna"

// full data attributes

mq.select({
	from:'test', // [string or array]
	cols:['player','goal','id'], // [string or array]
	where:{player:'Janna'}, // [string, array or object]
	group:'goal', // [string or array]
	order:'goal DESC', // [string or array]
	limit:'0,10', // [string or array]
	have:'player="Janna"', // [string or array]
},function(err,data){
})
```

## Single Row

mq.select({
	from:'test',
	cols:['player','goal','id'],
	where:{player:'Janna'}
},function(err,data){
},{single: true}) // output just one row as object
```

## Nest Tables Result (optional)

```
mysql.query('SELECT t1.name,t2.name FROM players as t1, teams as t2 WHERE t2.id=t1.team',function(err,data){
	// result example : [ { t1: { name: 'Distillers 345' }, t2: { name: 'Heroes Team' } } ]
},{nestTables: true})
```

## Debug Query

```
mysql.select({
	from:'test',
	cols:['player','goal','id'],
	where:{player:'Janna'}
},{debug: true}) // console.log -> SELECT player, goal, id, FROM test WHERE player="Janna";
```

## Node mysql object 

mq.connection

## Install

```Batchfile
npm install mq-node
```

---------------------------------

The MIT [License](https://raw.githubusercontent.com/webcaetano/mq-node/master/LICENSE.md)
