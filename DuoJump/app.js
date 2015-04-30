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
			//not working
			io.to(user.username).emit('start game', {
				role: 'bunny'
			});
			number++;
			console.log("bunny is in the room");
		} else if (number == 1) {
			//not working
			io.to(user.username).emit('start game', {
				role: 'crow'
			});
			number++;
			console.log("crow is in the room");
		}
	});

	socket.on('crow', function(data){
		socket.broadcast.emit('crowPos', {
			x: data.x,
			y: data.y
		});
	});

	socket.on('bunny', function(data){
		socket.broadcast.emit('bunnyPos', {
			x: data.x,
			y: data.y
		});
	});
});