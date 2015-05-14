var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = 3001;

app.use('/', express.static(__dirname + '/public'));
server.listen(port, function(){
	console.log('Server running at port: ' + port);
});

var number = 0;

io.on('connection', function(socket){
	socket.on('join game', function(user){
		if(number == 0){
			io.to(socket.id).emit('start game', {
				role: 'bunny'
			});
			number++;
			console.log("bunny is in the room");
		} else if (number == 1) {
			io.to(socket.id).emit('start game', {
				role: 'cloud'
			});
			number++;
			console.log("cloud is in the room");
		}
	});

	socket.on('cloud', function(data){		
		io.emit('cloudPos', {
			cloudCount: data.cloudCount
		});
	});

	socket.on('crow', function(data){
		io.emit('crowPos', {
			crowCount: data.crowCount,
			crowSpeed: data.crowSpeed
		});
	});

	socket.on('bunny', function(data){
		// console.log("server received");
		socket.broadcast.emit('bunnyPos', {
			x: data.x,
			y: data.y
		});
	});

	socket.on('reset', function(data){
		// console.log("server received");
		socket.broadcast.emit('resetPos', {
			x: data.x,
			y: data.y,
			y1: data.y1,
			y2: data.y2,
			crowCount: data.crowCount,
			crowSpeed: data.crowSpeed,
			cloudCount: data.cloudCount
		});
	});
});
