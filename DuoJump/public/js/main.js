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
	var restart = false;
	var score = 0;
	var scoreAdded = false;
	var background = new Image();
	background.src = './img/bg.png';
	background.onload = function() {
		ctx0.drawImage(background, 0, 0);
		ctx0.font="40px Helvetica Neue";
		// ctx0.fillText("Score: " + score, c0.width - 100, 50);
	};

	//MOUNTAIN INIT
	var mountain = new Image();
	var mountainPosY = 0;
	mountain.src = '/img/mountain.png';
	mountain.onload = function() {
		ctx1.drawImage(mountain, 0, mountainPosY);
		// ctx1.fillRect(80, 698, 100, 20);
	};	

	//MOUNTAIN SUPPORT
	var mountainPos = {x: 80, y: 698, width: 100, height: 30};

	//CLOUD INIT
	var cloudCount = [];
	var cloudWidth = 170, cloudHeight = 98;
	var cloudImg = new Image();
	cloudImg.src = '/img/cloud.png';
	cloudImg.onload = function() {};

	//CROW INIT
	var crowCount = [];
	var crowSpeed = [];
	var timeCount = 0;
	var max_TimeCount = Math.floor(Math.random() * 100);
	var isHit = false;
	var crowImg = new Image();
	crowImg.src = '/img/crow.png';
	crowImg.onload = function() {};

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
	var hasStage = false;

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

			restart = true;
		});

	};

	attachEvents();

	var cloudClick = function(){
		if(name == 'cloud'){
			//CANVAS EVENT LISTENER
			window.addEventListener('click', function(evt){
				var container = c3.getBoundingClientRect();
		 		var cx = evt.clientX - container.left * (c3.width  / container.width),
			        cy = evt.clientY - container.top  * (c3.height / container.height)

				cx = cx - cloudWidth/2; 
				cy = cy - cloudHeight/2;

				cloudCount[cloudCount.length] = {x: cx, y: cy};

				//ADD CLOUD IN SERVER SIDE
				socket.emit('cloud', {
					cloudCount: cloudCount
				});
			}, false);
		}
	}();
	

	var bunnyMove = function(){
		if(name == 'bunny'){
			window.addEventListener('keydown', function(evt){
				// KEY A
				if ( evt.keyCode == 65 || evt.keyCode == 37 ) {
					moveLeft = true;
				}
				// KEY D
				if ( evt.keyCode == 68 || evt.keyCode == 39) {
					moveRight = true;
				}
				// SPACE BAR
				if (evt.keyCode == 32) {
					if(isJumping == false){
						yVel = -20;
						isJumping = true;
					}
				}
			}, true);

			window.addEventListener('keyup', function(evt){
				//KEY A
				if (evt.keyCode == 65 || evt.keyCode == 37) {
					moveLeft = false;
				}
				//KEY D
				if (evt.keyCode == 68 || evt.keyCode == 39) {
					moveRight = false;
				}
			}, true);

			//BUNNY JUMP
			setInterval(function(){
				//CHECK WALKING
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
				//CHECK JUMPING
				if(isJumping){
					yVel += gravity;
					bunnyPosY += yVel;
				}

				if(moveLeft || moveRight || isJumping){
					ctx4.clearRect(0, 0, c4.width, c4.height);
					bunny.onload();
				}

				//CHECK COLLISION
				var tempY = 0;
				if( bunnyPosX + bunny.width/2 > mountainPos.x 
					&& bunnyPosX + bunny.width/2 < mountainPos.x + mountainPos.width
					&& bunnyPosY + bunny.height >= mountainPos.y
					&& bunnyPosY + bunny.height <= mountainPos.y + mountainPos.height/2
					&& yVel >= 0){
					//MOUNTAIN
					hasStage = true;
					tempY = mountainPos.y;
				} else if(cloudCount.length > 0){
					//CLOUD
					var i;
					for(i = 0; i < cloudCount.length; i++){
						if( bunnyPosX + bunny.width/2 > cloudCount[i].x
							&& bunnyPosX + bunny.width/2 < cloudCount[i].x + cloudWidth
							&& bunnyPosY + bunny.height >= cloudCount[i].y + cloudHeight/4
							&& bunnyPosY + bunny.height <= cloudCount[i].y + cloudHeight/2
							&& yVel >= 0){
							hasStage = true;
							tempY = cloudCount[i].y + cloudHeight/4;
							if(scoreAdded == false){
								score++;
								scoreAdded = true;
							}
							break;
						}
					}
					if(i == cloudCount.length){
						hasStage = false;
						tempY = 0;
					}
				} else {
					hasStage = false;
					tempY = 0;
				}

				//CHECK ABSTOCLE
				if(crowCount.length > 0) {
					//CROW
					var i;
					for (i = 0; i < crowCount.length; i++) {
						if( bunnyPosX + bunny.width > crowCount[i].x
							&& bunnyPosX < crowCount[i].x + crowImg.width
							&& bunnyPosY < crowCount[i].y + crowImg.height 
							&& bunnyPosY + bunny.height > crowCount[i].y
							){
							isHit = true;
							// console.log("is hit");
							break;
						}
					}
				}

				if(hasStage){
					bunnyPosY = tempY - bunny.height;
					yVel = 0;
					isJumping = false;
					ctx4.clearRect(0, 0, c4.width, c4.height);
					bunny.onload();
				} else if(isJumping == false){
					yVel += gravity;
					bunnyPosY += yVel;
					isJumping = true;
					ctx4.clearRect(0, 0, c4.width, c4.height);
					bunny.onload();
				}

				//CHECK GAME OVER
				if( bunnyPosY > c4.height || isHit == true){
					//GAME OVER
					ctx0.fillText("GAME OVER", c0.width/2 - 100, c0.height/2 - 100);
					socket.emit('gameover');
					setTimeout(function(){ 
						ctx0.clearRect(0, 0, c0.width, c0.height);
						ctx0.drawImage(background, 0, 0);
					}, 1000);
					//GAME INIT			
					yVel = 0;
					isJumping = false;
					isHit = false;
					restart = false;
					score = 0;
					scoreAdded = false;
					// ctx0.fillText("Score: " + score, c0.width - 100, 50);
					//MOUNTAIN INIT
					ctx1.clearRect(0, 0, c1.width, c1.height);
					mountainPosY = 0;
					mountainPos.y = 698;
					mountain.onload();
					//CROW INIT
					ctx2.clearRect(0, 0, c2.width, c2.height);
					crowCount.splice(0, crowCount.length);
					crowSpeed.splice(0, crowSpeed.length);
					//CLOUD INIT
					ctx3.clearRect(0, 0, c3.width, c3.height);
					cloudCount.splice(0, cloudCount.length);
					//BUNNY INIT
					ctx4.clearRect(0, 0, c4.width, c4.height);
					bunnyPosX = 100;
					bunnyPosY = 550;
					bunny.onload();

					socket.emit('reset', {
						x: bunnyPosX,
						y: bunnyPosY,
						y1: mountainPosY,
						y2: mountainPos.y,
						crowCount: crowCount,
						crowSpeed: crowSpeed,
						cloudCount: cloudCount
					});
				} else {
					//MOVE BUNNY IN SERVER SIDE
					socket.emit('bunny', {
						x: bunnyPosX,
						y: bunnyPosY
					});
				}	
				
			}, 50);
		}
	}();

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
		while(data.cloudCount.length > 2){
			//REMOVE ELEMENT FROM ARRAY
			ctx3.clearRect(data.cloudCount[0].x-10, data.cloudCount[0].y-10, cloudWidth+20, cloudHeight+20);
			data.cloudCount.splice(0, 1);
		}
		cloudCount = data.cloudCount;
	});

	socket.on('crowPos', function(data){
		while(data.crowCount.x < 0 - crow.width){
			data.crowCount.splice(0, 1);
			data.crowSpeed.splice(0, 1);
		}
		crowCount = data.crowCount;
		crowSpeed = data.crowSpeed;
	});

	socket.on('bunnyPos', function(data){
		ctx4.clearRect(0, 0, c4.width, c4.height);
		bunnyPosX = data.x;
		bunnyPosY = data.y;
		bunny.onload();
	});

	socket.on('resetPos', function(data){
		//MOUNTAIN INIT
		ctx1.clearRect(0, 0, c1.width, c1.height);
		mountainPosY = data.y1;
		mountainPos.y = data.y2;
		mountain.onload();
		//CROW INIT
		ctx2.clearRect(0, 0, c2.width, c2.height);
		crowCount = data.crowCount;
		crowSpeed = data.crowSpeed;
		//CLOUD INIT
		ctx3.clearRect(0, 0, c3.width, c3.height);
		cloudCount = data.cloudCount;
		//BUNNY INIT
		ctx4.clearRect(0, 0, c4.width, c4.height);
		bunnyPosX = data.x;
		bunnyPosY = data.y;
		bunny.onload();
	});

	socket.on('gameoverText', function(){
		ctx0.fillText("GAME OVER", c0.width/2 - 100, c0.height/2 - 100);
		setTimeout(function(){ 
			ctx0.clearRect(0, 0, c0.width, c0.height);
			ctx0.drawImage(background, 0, 0);
		}, 1000);
	});

	setInterval(function() {
		// clear all the existing cloud images
		for (var i = 0; i < cloudCount.length; i ++) {
			ctx3.clearRect(cloudCount[i].x, cloudCount[i].y, cloudWidth, cloudHeight);
		}	

		// draw new cloud images
		for (var i = 0; i < cloudCount.length; i++) {
			cloudCount[i].y += 2;
			ctx3.drawImage(cloudImg, cloudCount[i].x, cloudCount[i].y);
		}

		//move mountain
		if(cloudCount.length != 0){
			if(mountainPosY < c3.height){
				ctx1.clearRect(0, mountainPosY, mountain.width, mountain.height);
				mountainPosY += 2;
				mountainPos.y += 2;
				ctx1.drawImage(mountain, 0, mountainPosY);
			}	
		}

		//generate crow
		if(cloudCount.length != 0){
			if(timeCount > max_TimeCount){
				//move crow
				for (var i = 0; i < crowCount.length; i++){
					ctx2.clearRect(crowCount[i].x, crowCount[i].y, crow.width, crow.height);
				}

				for (var i = 0; i < crowCount.length; i++){
					crowCount[i].x -= crowSpeed[i];
					ctx2.drawImage(crowImg, crowCount[i].x, crowCount[i].y);
				}
				//add new crow
				crowCount[crowCount.length] = {x: c2.width, y: Math.floor(Math.random() * c2.height)};
				crowSpeed[crowSpeed.length] = Math.floor(Math.random() * 5 + 1);
				//send to server side
				socket.emit('crow', {
					crowCount: crowCount,
					crowSpeed: crowSpeed
				});
				timeCount = 0;
				max_TimeCount = Math.floor(Math.random() * 500 + 100);
			} else {
				//move crow
				for (var i = 0; i < crowCount.length; i++){
					ctx2.clearRect(crowCount[i].x, crowCount[i].y, crow.width, crow.height);
				}

				for (var i = 0; i < crowCount.length; i++){
					crowCount[i].x -= crowSpeed[i];
					ctx2.drawImage(crowImg, crowCount[i].x, crowCount[i].y);
				}

				timeCount++;
			}
		}


	}, 50);
	
	
};

app.init();

