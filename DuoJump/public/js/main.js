var app = {};

app.init = function() {
	var w = 621,
		h = 1104,
		windowWidth=$( window ).width();
	
	var center=function(ww){
		$(".container").css("left",ww/2-w/2);
		$("#myCanvas").css("left",ww/2-w/2);
	};

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

	//SHOULD BE ADDED IN SOCKET "START GAME"
	var bunnyPosX = 100,
		bunnyPosY = 550;
	var bunny = new Image();
	bunny.src = '/img/bunny.png';
	bunny.onload = function() {
		ctx.drawImage(bunny, bunnyPosX, bunnyPosY);
	};
	////////////////////////////////////////

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
		if(name == 'crow'){
			//ADD CROW IN CLIENT SIDE
			var container = c.getBoundingClientRect();
	 		var cx = evt.clientX - container.left * (c.width  / container.width),
		        cy = evt.clientY - container.top  * (c.height / container.height)

			var crow = new Image();
			crow.src = '/img/crow.png';
			crow.onload = function() {
				ctx.drawImage(crow, cx, cy);
			};

			//ADD CROW IN SERVER SIDE
			socket.emit('crow', {
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
		}
		if(user.role == 'crow'){
			name = 'crow';
		}

		//ADD BUNNY IN CANVAS HERE

		console.log('role: ' + user.role);
	});

	socket.on('crowPos', function(data){
		var crow = new Image();
		crow.src = '/img/crow.png';
		crow.onload = function() {
			ctx.drawImage(crow, data.x, data.y);
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

