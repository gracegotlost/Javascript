var app = {};

app.init = function() {
	var w = 621,
		h = 1104,
		windowWidth=$( window ).width();
	
	var center=function(ww){
		$(".center").css("left",ww/2-w/2);
		$("#background").css("left",ww/2-w/2);
		$("#mountain").css("left",ww/2-w/2);
		$("#crow").css("left",ww/2-w/2);
		$("#cloud").css("left",ww/2-w/2);
		$("#bunny").css("left",ww/2-w/2);
	};

	//SOCKET INIT
	var socket;
	socket = io.connect();

	//CANVAS INIT
	var c0 = document.getElementById("background");
	var ctx0 = c0.getContext("2d");
	c0.width=w;
	c0.height=h;

	var c1 = document.getElementById("mountain");
	var ctx1 = c1.getContext("2d");
	c1.width=w;
	c1.height=h;

	var c2 = document.getElementById("crow");
	var ctx2 = c2.getContext("2d");
	c2.width=w;
	c2.height=h;

	var c3 = document.getElementById("cloud");
	var ctx3 = c3.getContext("2d");
	c3.width=w;
	c3.height=h;

	var c4 = document.getElementById("bunny");
	var ctx4 = c4.getContext("2d");
	c4.width=w;
	c4.height=h;

	center(windowWidth);

	//BG INIT
	var background = new Image();
	background.src = './img/bg.png';
	background.onload = function() {
		ctx0.drawImage(background, 0, 0);
	};

	//MOUNTAIN INIT
	var mountain = new Image();
	mountain.src = '/img/mountain.png';
	mountain.onload = function() {
		ctx1.drawImage(mountain, 0, 0);
	};

	//CLOUD VAR
	var cloudCount = [];
	var cloudWidth = 170;
	var cloudHeight = 98;

	//BUNNY INIT
	var bunnyPosX = 100,
		bunnyPosY = 550;
	var bunny = new Image();
	bunny.src = '/img/bunny.png';
	bunny.onload = function() {
		ctx4.drawImage(bunny, bunnyPosX, bunnyPosY);
	};

	//BUNNY JUMP
	var xVel = 5;
	var yVel = 0;
	var gravity = 1.2;
	var isJumping = false;
	var moveLeft = false;
	var moveRight = false;

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
	window.addEventListener('click', function(evt){
		if(name == 'cloud'){
			var container = c3.getBoundingClientRect();
	 		var cx = evt.clientX - container.left * (c3.width  / container.width),
		        cy = evt.clientY - container.top  * (c3.height / container.height)

			cx = cx - cloudWidth/2; //cloud.width
			cy = cy - cloudHeight/2;  //cloud.height

		    var cloud = new Image();
			cloud.src = '/img/cloud.png';
			cloud.onload = function() {
				//ADD CLOUD IN CLIENT SIDE
				ctx3.drawImage(cloud, cx, cy);
			};

			//ADD CLOUD IN SERVER SIDE
			socket.emit('cloud', {
				x: cx,
				y: cy
			});

			//WHETHER REMOVE OLD ONE
			cloudCount[cloudCount.length] = {x: cx, y: cy};

			if(cloudCount.length > 2){
				//REMOVE CLOUD IN CLIENT SIDE
				ctx3.clearRect(cloudCount[0].x, cloudCount[0].y, cloud.width, cloud.height);
				//REMOVE CLOUD IN SERVER SIDE
				socket.emit('cloud remove', {
					x: cloudCount[0].x,
					y: cloudCount[0].y
				});
				//REMOVE ELEMENT FROM ARRAY
				cloudCount.splice(0, 1);
			}

		} else {
			console.log(name);
		}
	}, false);

	window.addEventListener('keydown', function(evt){
		if(name == 'bunny'){
			//MOVE BUNNY IN CLIENT SIDE
			// KEY A
			if ( evt.keyCode == 65 || evt.keyCode == 37 ) {
				ctx4.clearRect(bunnyPosX, bunnyPosY, bunny.width, bunny.height);
				bunnyPosX -= xVel ;
				if(bunnyPosX < 0 - bunny.width){
					bunnyPosX = c4.width;
				}
				bunny.onload();
				moveLeft = true;
			}
			// KEY D
			if ( evt.keyCode == 68 || evt.keyCode == 39) {
				ctx4.clearRect(bunnyPosX, bunnyPosY, bunny.width, bunny.height);
				bunnyPosX += xVel ;
				if(bunnyPosX > c4.width){
					bunnyPosX = 0 - bunny.width;
				}
				bunny.onload();
				moveRight = true;
			}

			if (evt.keyCode == 32) {
				if(isJumping == false){
					yVel = -15;
					isJumping = true;
				}
				// console.log("space bar is pressed");
			}

			//MOVE BUNNY IN SERVER SIDE
			socket.emit('bunny', {
				x: bunnyPosX,
				y: bunnyPosY
			});
		}
	}, true);

	window.addEventListener('keyup', function(evt){
		if(name == 'bunny'){
			//KEY A
			if (evt.keyCode == 65 || evt.keyCode == 37) {
				moveLeft = false;
			}
			//KEY D
			if (evt.keyCode == 68 || evt.keyCode == 39) {
				moveRight = false;
			}
		}
	}, true);

	//BUNNY JUMP
	setInterval(function(){
		if(isJumping == true){
			ctx4.clearRect(bunnyPosX, bunnyPosY, bunny.width, bunny.height);
			
			//MOVE X
			if(moveLeft){
				bunnyPosX -= xVel;
				if(bunnyPosX < 0 - bunny.width){
					bunnyPosX = c4.width;
				}
			}
			if(moveRight){
				bunnyPosX += xVel;
				if(bunnyPosX > c4.width){
					bunnyPosX = 0 - bunny.width;
				}
			}
			//MOVE Y
			yVel += gravity;
			bunnyPosY += yVel;
			if(bunnyPosY > 550){
				bunnyPosY = 550;
				yVel = 0;
				isJumping = false;
			}
			//MOVE BUNNY IN CLIENT SIDE
			bunny.onload();

			//MOVE BUNNY IN SERVER SIDE
			socket.emit('bunny jump', {
				x: bunnyPosX,
				y: bunnyPosY
			});
		}
	}, 50);

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

		// console.log('role: ' + user.role);
	});

	socket.on('cloudPos', function(data){
		var cloud = new Image();
		cloud.src = '/img/cloud.png';
		cloud.onload = function() {
			ctx3.drawImage(cloud, data.x, data.y);
		};
		// console.log(data.x + ' ' + data.y);
	});

	socket.on('removePos', function(data){
		ctx3.clearRect(data.x, data.y, cloudWidth, cloudHeight);
	});

	socket.on('bunnyPos', function(data){
		ctx4.clearRect(bunnyPosX, bunnyPosY, bunny.width, bunny.height);
		bunnyPosX = data.x;
		bunnyPosY = data.y;
		bunny.onload();
	});

	socket.on('jumpPos', function(data){
		ctx4.clearRect(bunnyPosX, bunnyPosY, bunny.width, bunny.height);
		bunnyPosX = data.x;
		bunnyPosY = data.y;
		bunny.onload();
	});
	
};

app.init();

