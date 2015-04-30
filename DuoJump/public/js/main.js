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

	//JQUERY EVENTS
	var attachEvents = function() {
		$( window ).resize(function() {
			windowWidth=$( window ).width();
			center(windowWidth);
		});
		$('#js-btn-start').off('click').on('click', function(){
			if(!name){
				name = prompt("Please enter your name", "bunny");
			}

			socket.emit('join game', {
				username: name
			});
		});

	};

	attachEvents();

	//CANVAS EVENT LISTENER
	c.addEventListener('click', function(evt){
		//ADD CROW IN CLIENT SIDE
		var container = c.getBoundingClientRect();
 		var cx = evt.clientX - container.left * (c.width  / container.width),
	        cy = evt.clientY - container.top  * (c.height / container.height)

		var crow = new Image();
		crow.src = '/img/crow.png';
		crow.onload = function() {
			ctx.drawImage(crow, cx, cy);
		};



		// console.log(cx + ' ' + cy);
	}, false);

	//SOCKET IO
	socket.on('start game', function(user){
		if(user.role == "bunny"){
			name = bunny;
		}
		if(user.role == "crow"){
			name = crow;
		}
	});
	
};

app.init();

