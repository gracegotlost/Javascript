var app = {};

app.init = function() {
	var w = 621,
		h = 1104,
		windowWidth=$( window ).width();
	
	var center=function(ww){
		$(".container").css("left",ww/2-w/2);
		$("#myCanvas").css("left",ww/2-w/2);
	};

	//BUNNY INIT
	var bunnyPosX = 100,
		bunnyPosY = 550;
	var bunny = new Image();
	bunny.src = '/img/bunny.png';

	//SOCKET INIT
	var socket;
	socket = io.connect();

	//CANVAS INIT
	var c = document.getElementById("myCanvas");
	var ctx = c.getContext("2d");
	
	c.width=w;
	c.height=h;
	center(windowWidth);

	var img = new Image();
	img.src = '/img/mountain.png';
	img.onload = function() {
		ctx.drawImage(img, 0, 0);
	};

	//JQUERY EVENTS
	var attachEvents = function() {
		$( window ).resize(function() {
			windowWidth=$( window ).width();
			center(windowWidth);
		});
		$('#js-btn-start').off('click').on('click', function(){
			if(!name){
				name = prompt("Please enter your name", "username");
			}

			socket.emit('join game', {
				username: name
			});
		});

	};

	attachEvents();

	//CANVAS EVENT LISTENER
	c.addEventListener('click', function(evt){
		if(name == 'cloud'){
			//ADD CROW IN CLIENT SIDE
			var container = c.getBoundingClientRect();
	 		var cx = evt.clientX - container.left * (c.width  / container.width),
		        cy = evt.clientY - container.top  * (c.height / container.height)

			var cloud = new Image();
			cloud.src = '/img/cloud.png';
			cloud.onload = function() {
				ctx.drawImage(cloud, cx, cy);
			};

			//ADD CROW IN SERVER SIDE
			socket.emit('cloud', {
				x: cx,
				y: cy
			});

			// console.log(cx + ' ' + cy);
		} else {
			console.log(name);
		}
	}, false);

	window.addEventListener('keydown', function(evt){
		if(name == 'bunny'){
			//MOVE BUNNY IN CLIENT SIDE
			// KEY W
			if ( evt.keyCode == 87 ) {
				//clear only the image
				ctx.clearRect(bunnyPosX, bunnyPosY, bunny.width, bunny.height);
				bunnyPosY -= 10;
				bunny.onload();
			}
			// KEY S
			if ( evt.keyCode == 83 ) {
				ctx.clearRect(bunnyPosX, bunnyPosY, bunny.width, bunny.height);
				bunnyPosY += 10;
				bunny.onload();
			}
			// KEY A
			if ( evt.keyCode == 65 ) {
				ctx.clearRect(bunnyPosX, bunnyPosY, bunny.width, bunny.height);
				bunnyPosX -= 10;
				bunny.onload();
			}
			// KEY D
			if ( evt.keyCode == 68 ) {
				ctx.clearRect(bunnyPosX, bunnyPosY, bunny.width, bunny.height);
				bunnyPosX += 10;
				bunny.onload();
			}

			//MOVE BUNNY IN SERVER SIDE
			socket.emit('bunny', {
				x: bunnyPosX,
				y: bunnyPosY
			});
		}
	}, true);

	//SOCKET IO
	socket.on('start game', function(user){
		if(user.role == 'bunny'){
			name = 'bunny';
			// console.log("this user is bunny");
		}
		if(user.role == 'cloud'){
			name = 'cloud';
			// console.log("this user is cloud");
		}

		bunny.onload = function() {
			ctx.drawImage(bunny, bunnyPosX, bunnyPosY);
		};

		// console.log('role: ' + user.role);
	});

	socket.on('cloudPos', function(data){
		var cloud = new Image();
		cloud.src = '/img/cloud.png';
		cloud.onload = function() {
			ctx.drawImage(cloud, data.x, data.y);
		};
		// console.log(data.x + ' ' + data.y);
	});

	socket.on('bunnyPos', function(data){
		ctx.clearRect(bunnyPosX, bunnyPosY, bunny.width, bunny.height);
		bunnyPosX = data.x;
		bunnyPosY = data.y;
		bunny.onload();
	});
	
};

app.init();

