var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);

// app.use(function (req, res, next) {
//   console.log('middleware');
//   req.testing = 'testing';
//   return next();
// });
app.use(express.static('app/')); 
 
app.get('/', function(req, res, next){
  console.log('get route', req.testing);
  res.end();
});

function BBService(){
	this.rooms = {};
}

BBService.prototype = {
	connect (ws,bbid) {
		ws.bbid = bbid;
		if(!this.rooms[bbid]){
			this.rooms[bbid] = [ws];
		}else{
			if(this.rooms[bbid].indexOf(ws)==-1){
				this.rooms[bbid].push(ws);	
			}
		}

		console.log("新用户加入："+bbid+ ' 房间');
	},
	disconnect (ws,bbid) {
		if(!this.rooms[bbid]){
			return;
		}else{
			var index = -1;
			if((index = this.rooms[bbid].indexOf(ws))>=0){
				this.rooms[bbid].shift(index);	
			}
		}
		console.log("用户离开："+bbid+ ' 房间');
	},

	broadcast(ws,data){
		var roomClients = this.rooms[ws.bbid];
		if(!roomClients||roomClients.length<=1){
			return;
		}
		roomClients.forEach(function(client) {
			if(client == ws){
				return;
			}
		    client.send(data);
		});
	}
}

let bbs = new BBService();
app.ws('/ws/', function(ws, req) {
	// console.log(JSON.stringify(Object.keys(ws)));
  ws.on('message', function(msg) {
  	let msgObj = JSON.parse(msg);
  	let data = msgObj.data;
  	let type = msgObj.type;
  	switch(type){
  		case 'conn':
  			bbs.connect(ws,data);
  			break;
  		case 'disconn':
  			bbs.disconnect(ws,data);
  			break;
  		default:
  			bbs.broadcast(ws,msg);
  			console.log('============ '+ws.bbid);
  			console.log('Type : '+type);
  			console.log('Data : '+data);
  			console.log('============');
  			break;
  	}

  	ws.on('close', function(msg) {
  		bbs.disconnect(ws,data);
  	});

  });

  // console.log('socket','req'+(+new Date()));
});

app.listen(3000);