var context = context;

//Rendering functions
function printRectangle (rect,color,opacity, outlineWidth) {
	if(opacity !== undefined) context.globalAlpha=opacity;
	
	if(outlineWidth === undefined){
		context.fillStyle = color;
		context.fillRect(camera.projectX(rect.x,rect.z),camera.projectY(rect.y,rect.z),
			camera.projectXDistance(rect.width,rect.z),-camera.projectYDistance(rect.height,rect.z));
	}else{
		context.beginPath();
		context.rect(camera.projectX(rect.x,rect.z),camera.projectY(rect.y,rect.z),
			camera.projectXDistance(rect.width,rect.z),-camera.projectYDistance(rect.height,rect.z));
		context.strokeStyle = color;
		context.lineWidth = outlineWidth;
		context.stroke();
	}
	
	context.globalAlpha = 1;
	
}
function printCircle (circle,color,slice,opacity,outlineWidth,start){
  if(!camera.isCircleOnScreen(circle)) return false;
  if(!start) start = 0;
	if(!slice) slice = 2 * Math.PI + start;
	if(opacity !== undefined) context.globalAlpha=opacity;
	context.beginPath();
	context.arc(camera.projectX(circle.x,circle.z), camera.projectY(circle.y,circle.z), camera.projectXDistance(circle.radius), start, slice, false);
  if(!outlineWidth){
  	context.fillStyle = color;
  	context.fill();
  } else {
  	context.strokeStyle = color;
  	context.lineWidth = outlineWidth;
  	context.stroke();
  }
  context.globalAlpha=1;
}

function printArc(circle,start,end,color,opacity,outlineWidth){
  if(!camera.isCircleOnScreen(circle)) return false;
  
  if(start === end){
    start = 0;
    end = Math.PI * 2;
  }
  
  //end = Math.PI;//TEMP
  //start = Math.PI;
  //outlineWidth = false;
  
	if(opacity !== undefined) context.globalAlpha=opacity;
	context.beginPath();
	//context.arc(camera.projectX(circle.x,circle.z), camera.projectY(circle.y,circle.z), camera.projectXDistance(circle.radius), Math.PI*2-end, Math.PI*2-start, false);
  
  var x = camera.projectX(circle.x,circle.z);
  var y = camera.projectY(circle.y,circle.z);
  
  context.arc(x, y, camera.projectXDistance(circle.radius), flipAngle(start), flipAngle(end), true);
  
  if(!outlineWidth){
    $(".qd5").text(circle.x+", "+circle.y);
    context.lineTo(x,y);
  	context.fillStyle = color;
  	context.fill();
  } else {
  	context.strokeStyle = color;
  	context.lineWidth = outlineWidth;
  	context.stroke();
  }
  context.globalAlpha=1;
}

function flipAngle(angle){
  return Math.PI*2 - angle;
}

function printLine(x,y,endX,endY,width,color,opacity) {
	context.beginPath();
	context.lineWidth = width;
	context.strokeStyle = color;
	context.globalAlpha=opacity;
	context.moveTo(camera.projectX(x),camera.projectY(y));
	context.lineTo(camera.projectX(endX),camera.projectY(endY));
	context.stroke();
	context.globalAlpha=1;
}

function getGradient(x1,y1,x2,y2) {
	return context.createLinearGradient(camera.projectX(x1),camera.projectY(y1),
		camera.projectX(x2),camera.projectY(y2));
}

//Shape definitions
function Rectangle (x,y,width,height) {
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.render = function(color) {
		printRectangle(this,color);
	}
}

function Point(x,y,z){
  this.x = x;
  this.y = y;
  this.z = z || 10;
}

function Line(x1,y1,x2,y2,width) {
	this.x1 = x1;
	this.y1 = y1;
	this.x2 = x2;
	this.y2 = y2;
	this.render = function(color){
		printLine(this.x1,this.y1,this.x2,this.y2,width,color);
	};
}

//The camera
var camera = {
	x:0,
	y:0,
	z:0,
	DEFAULT_Z:10,
	width: 1000,
	height: -1,
	center: {},
	absoluteMode: false,
	init: function(){
	  this.height = this.width * (canvas.height / canvas.width);
	  this.center = new Point(this.x+this.width/2, this.y+this.height/2, 0);
	},
	update: function(delta){
		this.moveTo(player.x,player.y);
		$(".camX").text(this.center.x);
		$(".camY").text(this.center.y);
	},
	moveTo: function(x,y){
	    this.center.x=x;
	    this.center.y=y;
	    this.x = x-this.width/2;
	  this.y = y-this.height/2;
	},
	projectX: function(x,z){
	  if(this.absoluteMode) return x;
		return (x-this.center.x)*((this.DEFAULT_Z/z) || 1)*(canvas.width/this.width) + this.width/2;
	},
	projectXDistance: function(distance){
		return (distance/this.width)*canvas.width;
	},
	projectY: function(y,z){
	  if(this.absoluteMode) return canvas.height - y;
		return canvas.height/2 - (y-this.center.y)*((this.DEFAULT_Z/z) || 1)*(canvas.height/this.height);
	},
	projectYDistance: function(distance){
		return (distance/this.height)*canvas.height;
	},

	isCircleOnScreen: function(circle){
	  if(this.absoluteMode) return true;
	  var z = circle.z || this.DEFAULT_Z;
	  if(Math.abs(circle.x-this.center.x)-circle.radius>z*this.width/this.DEFAULT_Z/2) return false;
	  if(Math.abs(circle.y-this.center.y)-circle.radius>z*this.height/this.DEFAULT_Z/2) return false;
	  return true;
	}

}
