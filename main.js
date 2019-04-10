var width = 1000; //Dimenstions of the canvas
var height = 1000;

var LOG_FPS=true; //Will print fps to .fps
var LOG_TIME=true; //Will print current time to .time

var animate = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
        window.setTimeout(callback, 1000 / 60)
    };
var canvas = document.createElement("canvas");
canvas.width = width;
canvas.height = height;
var context = canvas.getContext('2d');
var delta = 0;
var now = Date.now()/1000;
var keysDown = {};

var SECTORS_X = 50; //Was 50x50
var SECTORS_Y = 50;
var STARS_PER_SECTOR = 50;

var sectorCounter=0;
var sectors = [];

var goals;
var goalCounter=0;

var minimap;

var timeLeft = 120;
var totalTime = 120;

var init = function(){

  camera.init();
  for (var i=0;i<SECTORS_X;i++) {
    for (var j=0;j<SECTORS_Y;j++) {
      var x = i*width - SECTORS_X*width/2;
      var y = j*height - SECTORS_Y*height/2;
      sectors.push(new Sector(new Rectangle(x,y,width,height),STARS_PER_SECTOR,50));
    }  
  }
  
  goals = new GoalManager(200, {x:0,y:150});
  goals.generate();
  
  minimap = new Minimap({x:width-202,y:height-202,width:200,height:200},goals.goals,player);

};

var render = function (){
	context.fillStyle = "#000000";
  context.fillRect(0, 0, width, height);
  
  var beforeStars = Date.now();
  sectorCounter = 0;
  sectors.forEach(s => s.render());
  $(".qd0").text(sectorCounter)
  $(".qd3").text((Date.now()-beforeStars) * 60);
  
  goals.render();
  player.render();
  if(player.inBulletTime) printRectangle({x:player.x - width/2,y:player.y - height/2,width:width,height:height},"white",0.15);
  
  minimap.renderCircle(timeLeft/totalTime);

};

var update = function (){
	//Update time and FPS
    var newTime=Date.now()/1000;
    delta=(newTime-now);
    now=newTime;
    fpsCalculator.update();
    if(LOG_TIME) $(".time").text(now%100000);

    goals.update(delta);
    timeLeft -= player.update(delta);
    camera.update(delta);
    minimap.update(delta,player);
};


function changeAngle(angle, value){
  var res = angle+value;
  while(res<0) res += Math.PI * 2;
  while(res>Math.PI*2) res -= Math.PI * 2;
  return res;
}

function Circle(x,y,z,size,color) {
  this.x=x;
  this.y=y;
  this.z=z;
  this.radius=size;
  this.color=color;
  this.render = function(){
    printCircle(this,color);
  };
}

//Adding listeners for keyboard keys
window.addEventListener("keydown", function (event) {
  if(!keysDown[event.keyCode]){
  	$(".keyCode").text(event.keyCode);
  	keysDown[event.keyCode] = true;
  }
});

window.addEventListener("keyup", function (event) {
	//---React to keys being unpressed here---
  delete keysDown[event.keyCode];
});

//Adding listener for mouse clicks
canvas.addEventListener("mousedown", function (event){
	var mouseX = event.pageX; //Coordinates of the click
	var mouseY = event.pageY;
	//---React to mouse clicks here---	
}, false);

//Simple helper functions
function distance(thing1,thing2) {
	return pointDistance(thing1.x,thing1.y, thing2.x,thing2.y);
}
function pointDistance(x,y,x2,y2) {
	return Math.sqrt(Math.pow(x-x2,2) + Math.pow(y-y2,2));
}


//Use fpsCalculator.fps to get current fps
var fpsCalculator = {
	lastCheck: now,
	fps: 0,
	framesSinceLastCheck: 0,
	update: function () {
		this.framesSinceLastCheck++;
		if(now>this.lastCheck+1){
			this.fps=this.framesSinceLastCheck/(now-this.lastCheck);
			this.lastCheck=now;
			this.framesSinceLastCheck=0;
			if(LOG_FPS) $(".fpsLog").text(this.fps);
		}
	}
}

//Starting the game
var step = function () {
    update();
    render();
    animate(step);
};

init();
document.body.appendChild(canvas);
animate(step);