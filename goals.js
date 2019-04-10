function GoalManager(amount, start){
  this.DISTANCE = {min:250, max:350};
  this.amount = amount;
  this.goals = [];
  
  this.generate = function(){
    var current = new Goal(start.x,start.y,0);
    this.goals[0] = current;
    var direction = Math.PI/2;
    for (var i = 1; i < amount; i++) {
      var distance = this.DISTANCE.min + Math.random() * (this.DISTANCE.max - this.DISTANCE.min);
      var x = current.x + Math.cos(direction) * distance;
      var y = current.y + Math.sin(direction) * distance;
      current = new Goal(x,y,i);
      this.goals.push(current);
      direction = changeAngle(direction, (0.5-Math.random()) * Math.PI/2);
    }
    
  };
  this.render = function(){
    var current = this.goals[goalCounter];
    if(!current) return; //If there are no more goals left, nothing to do here
    
    this.goals.forEach(goal => goal.render());
    
    //Render hint arrow TODO extract constants
    if(distance(player,current) > canvas.width/2 + canvas.height/2){
      var distanceFromPlayer = Math.min(canvas.width, canvas.height)/2 - 100;
      var angle = Math.atan2(current.y - player.y, current.x - player.x);
      var x = Math.cos(angle) * distanceFromPlayer + player.x;
      var y = Math.sin(angle) * distanceFromPlayer + player.y;
      printArc({x:x,y:y,radius:100},Math.PI+(angle-0.3),Math.PI+(angle+0.3),"green",0.8,false);
      //printArc({x:x,y:y,radius:10},angle-0.3,angle+0.3,"red",0.8,20);
      
    }
  };
  this.update = function(delta){
    this.goals.forEach(goal => goal.update(delta));
  }

}


function Goal(x,y,id){
  this.x = x;
  this.y = y;
  this.radius = 75
  this.color = "green";
  this.circle = {x:x,y:y,radius:75,color:"green"}; //TODO refractor and remove
  this.id = id;
  this.effect = "None"; //Values: None, Caught, Wrong, Reminder
  this.effectTime = 0;
  this.effectLengths = {'None':0,'Caught':0.2,'Wrong':0.2,'Reminder':0.2}
  this.done = false;
  
  this.render = function(){
    if(this.done || this.id - goalCounter > 5) return;
    var goalsLeft = this.id - goalCounter;
    if(goalsLeft > 3) return;
    var opacity = 0.9 - goalsLeft * 0.25;
    switch (this.effect) {
      case 'None':
        printCircle(this.circle,"green",false,opacity);
        break;
      case 'Caught':
        var progress = Math.min(1, 1 - this.effectTime/this.effectLengths['Caught']);
        var x = this.circle.x * (1-progress) + player.x * progress;
        var y = this.circle.y * (1-progress) + player.y * progress;
        var radius = this.circle.radius * (1-progress) + player.radius * progress;
        printCircle({x:x,y:y,radius:radius},"green", false, 1-progress/2);
        break;
      case 'Wrong':
        printCircle(this, "red", false, opacity)
        break;
      case 'Reminder':
        var size = this.radius * 1.2;
        var progress = Math.min(1, 1 - this.effectTime/this.effectLengths['Reminder']);
        if(progress>0.5) size = this.radius * (1 + 0.2 * (1-progress) * 2);
        printCircle({x:this.x,y:this.y,radius:size}, "green", false, opacity);
        break;
      default:
        // code
    }
    
  };
  this.update = function(delta){
    if(this.done || this.id - goalCounter > 5) return; //If done or way ahead, do nothing
    
    //Handle effect transitions
    this.effectTime -= delta;
    if(this.effectTime < 0){
      if(this.effect === 'Caught') this.done=true;
      else this.effect = 'None';
    }
    
    //Check for collision with the player
    if(distance(this.circle,player) <= player.radius + this.circle.radius + 10){
      if(this.id === goalCounter){
        //this is the right goal
        this.startEffect('Caught');
        goalCounter++;
      } else if(this.effect !== 'Caught'){
        //this is the wrong goal
        goals.goals[goalCounter].startEffect('Reminder');
        this.startEffect('Wrong');
      }
    }
    
  };
  this.startEffect = function(name){
    if(this.effect === 'Caught') return; //After it's caught we're done
    var length = this.effectLengths[name];
    if(length === undefined){ //Check if the effect exists
      alert("Effect "+name+" not implemented yet.");
      return;
    } 
    
    this.effect = name;
    this.effectTime = length;
  }
  
}