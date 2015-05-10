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

	//BUNNY INIT
	var bunnyPosX = 100,
		bunnyPosY = 550;
	var bunny = new Image();
	bunny.src = '/img/bunny.png';
	bunny.onload = function() {
		ctx4.drawImage(bunny, bunnyPosX, bunnyPosY);
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
	window.addEventListener('click', function(evt){
		if(name == 'cloud'){
			//ADD CROW IN CLIENT SIDE
			var container = c3.getBoundingClientRect();
	 		var cx = evt.clientX - container.left * (c3.width  / container.width),
		        cy = evt.clientY - container.top  * (c3.height / container.height)

			cx = cx - 170/2;
			cy = cy - 98/2;
			var cloud = new Image();
			cloud.src = '/img/cloud.png';
			cloud.onload = function() {
				ctx3.drawImage(cloud, cx, cy);
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
				ctx4.clearRect(bunnyPosX, bunnyPosY, bunny.width, bunny.height);
				bunnyPosY -= 10;
				bunny.onload();
			}
			// KEY S
			if ( evt.keyCode == 83 ) {
				ctx4.clearRect(bunnyPosX, bunnyPosY, bunny.width, bunny.height);
				bunnyPosY += 10;
				bunny.onload();
			}
			// KEY A
			if ( evt.keyCode == 65 ) {
				ctx4.clearRect(bunnyPosX, bunnyPosY, bunny.width, bunny.height);
				bunnyPosX -= 10;
				bunny.onload();
			}
			// KEY D
			if ( evt.keyCode == 68 ) {
				ctx4.clearRect(bunnyPosX, bunnyPosY, bunny.width, bunny.height);
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

	socket.on('bunnyPos', function(data){
		ctx4.clearRect(bunnyPosX, bunnyPosY, bunny.width, bunny.height);
		bunnyPosX = data.x;
		bunnyPosY = data.y;
		bunny.onload();
	});
	
};

app.init();

