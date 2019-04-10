var player = {
	radius: 20,
	x: 0,
	xVel: 0,
	y: 0,
	yVel: 0,
	heading: Math.PI/2, //Direction of movement, in radians
	headingVector: {x:0,y:1},
	
	exhaust: [],
	exhaustDelay: 0.05,
	nextExhaustIn: 0,
	
	isThisEasyMode: false,
	lineLength: 1,
	
	speed: 250,
	rotationSpeed: 4,
	maxBulletTime: 3.5,
	bulletTimeRefillRate: 0.5,
	bulletTimeStrength: 5,
	
	bulletTime: 5,//this.maxBulletTime,
	burnedOut: false,
	inBulletTime: false,
	
	//Time travel
	snapshots: [],
	recallCooldown: 5,
	nextRecallIn: 0,
	inRecall: false,
	
	render: function () {
	  
	  //Render recall ghost //TODO condition
	  var expiry = this.snapshots[0].expiry;
		if(this.snapshots[0] && expiry < (this.recallCooldown - this.nextRecallIn )){
		  var progress = 1 - this.nextRecallIn / this.recallCooldown;
		  
		  var pos = this.snapshots[0].restore();
		  var circle = {x:pos[0],y:pos[1],radius:this.radius};
		  if(progress < 1){ //Not charged
		    var sansExpiryProgress = (this.recallCooldown - this.nextRecallIn - expiry) / (this.recallCooldown - expiry);
		    var opacityMultiplier = sansExpiryProgress<0.66 ? sansExpiryProgress*1.5 : 1;
		    printCircle(circle,"white",false,0.3 * opacityMultiplier,3);
		    printArc(circle,0,progress * Math.PI*2,"aqua",0.45 * opacityMultiplier,4);
		    $(".qd4").text(sansExpiryProgress);
		  } else {
		    printCircle(circle,"aqua",false,0.8,5);
		  }
		  
		}
	  
	  //Render exhaust particles
	  this.exhaust.forEach(particle => particle.render());
	  
	  //Render the ship
		printCircle(this,"blue",false,1);
		printArc(this, this.heading, this.heading + Math.PI * 2 * this.bulletTime / this.maxBulletTime , this.burnedOut ? "red" : "white", 1, 3);
		printCircle({x: this.x +this.radius*this.headingVector.x, y:this.y+this.radius*this.headingVector.y, radius:this.radius/3},"aqua");

		//Render velocity vector
		if(this.isThisEasyMode && this.inBulletTime){
		  printLine(this.x,this.y,this.x + this.xVel * this.lineLength, this.y + this.yVel * this.lineLength, 6, "aqua", 0.5);
		}
	},
	update: function(trueDelta){
		var delta = trueDelta;
		this.applyKeys(delta);
		if(this.inBulletTime) delta /= this.bulletTimeStrength;
		//Movement physics
		this.x += this.xVel * delta
		this.y += this.yVel * delta
		//Apply drag
		this.xVel -= this.xVel * 0.1 * delta
		this.yVel -= this.yVel * 0.1 * delta
		
		//Exhaust effects
		if(this.nextExhaustIn>0) this.nextExhaustIn -= trueDelta;
		while(this.exhaust.length>0 && this.exhaust[0].lifeLeft<0) this.exhaust.shift(); //Remove all 'expired' particles
		this.exhaust.forEach(particle => particle.update(delta));
		
		if(this.nextExhaustIn<=0 && (keysDown[87] || keysDown[83])){
		  if(keysDown[87]){
		    this.exhaust.push(new Exhaust({x:this.x,y:this.y,radius:this.radius*0.8},this.xVel + this.headingVector.x * (-100), this.yVel + this.headingVector.y * (-100)));  
		  }
		  if(keysDown[83]){
		    this.exhaust.push(new Exhaust({
		      x:this.x - this.headingVector.y*this.radius * 0.7,
  		    y:this.y + this.headingVector.x*this.radius * 0.7,
  		    radius:this.radius*0.3},
  		    this.xVel + this.headingVector.x * (100), 
  		    this.yVel + this.headingVector.y * (100)));  
  		  this.exhaust.push(new Exhaust({
		      x:this.x + this.headingVector.y*this.radius * 0.7,
  		    y:this.y - this.headingVector.x*this.radius * 0.7,
  		    radius:this.radius*0.3},
  		    this.xVel + this.headingVector.x * (100), 
  		    this.yVel + this.headingVector.y * (100)));  
		  }
		  
		  this.nextExhaustIn += this.exhaustDelay;
		  
		  return delta; //Returns the bullet time that passed
		}
		
		//Snapshots and recalls
		if(this.snapshots.length>0 && this.snapshots[0].isExpired(now)) this.snapshots.shift();
		while(this.snapshots[2] && this.snapshots[2].isExpired(now)){
		  this.snapshots.shift();
		}
		this.snapshots.push(new Snapshot(this.x,this.y,now));
		if(this.nextRecallIn > 0) {
		  this.nextRecallIn-=delta; //Or trueDelta ? 
		  if(this.nextRecallIn < 0 ) this.nextRecallIn = 0;
		}
	},
	
	applyKeys(trueDelta){
	  var delta = trueDelta;
	  if(keysDown[32] && !this.burnedOut){
	    if(this.bulletTime<=delta) this.burnedOut = true;
	    else{
	      this.bulletTime -= delta;
	      this.inBulletTime = true;  
	    }
	  } else {
	    this.bulletTime += delta * this.bulletTimeRefillRate;
	    if(this.bulletTime > this.maxBulletTime){
	      this.bulletTime = this.maxBulletTime;
	      this.burnedOut = false;
	    } 
	    this.inBulletTime = false;
	  }
	  
	  if(this.inBulletTime) delta /= this.bulletTimeStrength;
	  
	  //Handle A and D (rotation)
	  var rotation = 0;
	  if(keysDown[65]) rotation++;
	  if(keysDown[68]) rotation--;
	  this.changeHeading(rotation * this.rotationSpeed * trueDelta);
	  //Handle (de)acceleration
	  var acceleration = 0
	  if(keysDown[87]) acceleration++;
	  if(keysDown[83]) acceleration -= 0.8;
	  this.xVel += this.headingVector.x * acceleration * this.speed * trueDelta;
	  this.yVel += this.headingVector.y * acceleration * this.speed * trueDelta;
	  //Handle recalls
	  if(keysDown[69]) this.recall();
	  else this.inRecall = false;
	  
	},
	changeHeading(value){
	  this.heading += value;
	  //Correct to be between 0 and 2*PI
	  while(this.heading<0) this.heading += Math.PI*2;
	  while(this.heading>=Math.PI*2) this.heading -= Math.PI*2;
	  //Update the vector
	  this.headingVector = {x:Math.cos(this.heading), y:Math.sin(this.heading)};
	},
	breaking(delta, value){
	  this.xVel -= this.xVel * value * delta;
		this.yVel -= this.yVel * value * delta;
	},
	recall(){
	  if(this.inRecall || this.snapshots.length === 0) return;
	  var cost = this.maxBulletTime * this.recallCost;
	  if(this.nextRecallIn > 0) return;
	  
	  //If all conditions are met, actually perform recall:
	  this.nextRecallIn = this.recallCooldown;
	  //this.inRecall = true; //TODO some nicer effect for recall
	  [this.x, this.y] = this.snapshots.shift().restore();
	  //this.snapshots = [];
	}
	
	
	
};


function Exhaust(circle, xVel, yVel){
  this.lifeLength = 1.1; // Time one particle will live
  
  this.circle = circle;
  this.initialRadius = circle.radius
  this.xVel = xVel;
  this.yVel = yVel;
  this.lifeLeft = this.lifeLength; 
  
  this.render = function(){
    printCircle(circle, "aqua", false, this.lifeLeft/this.lifeLength)
  };
  this.update = function(delta){
    this.lifeLeft -= delta;
    if(this.lifeLeft<=0) return;
    this.circle.x += this.xVel * delta;
    this.circle.y += this.yVel * delta;
    this.circle.radius = this.initialRadius * (this.lifeLeft / this.lifeLength);
    
  };
  
}

function Snapshot(x,y,time) {
  this.expiry = 1.25;
  
  this.x=x;
  this.y=y;
  this.time=time;
  
  this.restore = function () {
    return [x,y];
  };
  this.isExpired = function(currentTime){
    return currentTime - this.expiry > this.time;
  }
}
















