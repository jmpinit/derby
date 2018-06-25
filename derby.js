var http = require('http'),
	url = require('url'),
	fs = require('fs');
	
//GAME STUFF
var mapSizeX = 1024;
var mapSizeY = 600;
var cars = new Array();

var screen = {
	connected: false
}

function Car(x, y) {
	this.x = x;
	this.y = y;
	this.vx = 0;
	this.vy = 0;
	
	this.dir = 0;
	this.speed = 4;
}

Car.prototype.update = function() {
	this.vx = this.speed*Math.sin(this.dir);
	this.vy = this.speed*Math.cos(this.dir);
	
	this.x += this.vx;
	this.y += this.vy;

	this.turn_speed = Math.PI/32;
	
	if(this.x<0)
		this.x = 0;
	if(this.x>mapSizeX)
		this.x = mapSizeX;
	if(this.y<0)
		this.y = 0;
	if(this.y>mapSizeY)
		this.y = mapSizeY;
}

Car.prototype.turn = function(amt) {
	if(amt > -this.turn_speed && amt < this.turn_speed) {
		this.dir += amt;
		console.log("turning: "+amt);
	}
}

// static resource server
var server = http.createServer(function(req, res) {
	var path = url.parse(req.url).pathname;

	switch (path) {
		case '/':
			fs.readFile(__dirname + '/static/index.html', function(err, data) {
			if(err) return send404(res);
				res.writeHead(200, {'Content-Type': path == 'json.js' ? 'text/javascript' : 'text/html'})
				res.write(data, 'utf8');
				res.end();
			});
		break;

		default:
			fs.readFile(__dirname + '/static/' + path, function(err, data) {
			if(err) return send404(res);
				res.writeHead(200, {'Content-Type': path == 'json.js' ? 'text/javascript' : 'text/html'})
				res.write(data, 'utf8');
				res.end();
			});
		break;
	}
}),

send404 = function(res) {
	res.writeHead(404);
	res.write('404');
	res.end();
};

const PORT = 1337;
server.listen(PORT);
console.log(`Interface accessible at http://127.0.0.1:${PORT}`);

var io = require('./node_modules/socket.io').listen(server, { log: false });

// on a 'connection' event
io.sockets.on('connection', function(socket) {
	var address = socket.handshake.address.address;

	console.log("Connection " + address + " accepted.");

	if(address != '127.0.0.1' || screen.connected) {
		//add a new car to the game
		cars[socket.id] = new Car(mapSizeX/2 + (Math.random()-0.5)*mapSizeX, mapSizeY/2 + (Math.random()-0.5)*mapSizeY);
		socket.send(socket.id);
		console.log("GAME: created new car.");

		socket.on('message', function(message) {
			//consume message
			var data = message.split(',');
			var id = data[0];
			
			if(id in cars) {
				if(data[1]=="turn") {
					if(data[2] != undefined) {
						var turn_speed = parseFloat(data[2])
						if(turn_speed) {
							cars[id].turn(turn_speed);
						}
					}
				}
			}
		});

		socket.on('disconnect', function() {
			console.log("Connection " + socket.id + " terminated.");
		});
	} else {
		screen.connected = true;

		socket.on('disconnect', function() {
			screen.connected = false;
			console.log("Screen disconnected.");
		});
	}
});

setInterval(function() {
	//UPDATE ALL OF THEM
	for(var id in cars) {
		cars[id].update();
	}
	
	var message = "";
	for(id in cars) {
		message += id+','+cars[id].x+','+cars[id].y+','+cars[id].dir+',';
	}
	io.sockets.emit('game', message);
}, 100 );

