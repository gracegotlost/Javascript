var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = 9001;

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
			x: data.x,
			y: data.y
		});
	});

	socket.on('cloud remove', function(data){
		io.emit('removePos', {
			x: data.x,
			y: data.y
		});
	});

	socket.on('bunny', function(data){
		io.emit('bunnyPos', {
			oldx: data.oldx,
			oldy: data.oldy,
			x: data.x,
			y: data.y
		});
	});

	socket.on('bunny jump', function(data){
		io.emit('jumpPos', {
			oldx: data.oldx,
			oldy: data.oldy,
			x: data.x,
			y: data.y
		});
	});
});