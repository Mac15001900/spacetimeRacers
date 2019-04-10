Minimap = function(rect,goals, player) {
  this.rect = rect;
  this.diff = rect;
  this.x = rect.x;
  this.y = rect.y;
  this.width = rect.width;
  this.height = rect.height;
  
  this.goals = goals;
  this.points = [];
  this.player = player;
  console.log(this);
  console.log(rect);
  
  //Find boundaries
  var minX = goals.reduce((a,b)=>a<b.x ? a : b.x, goals[0].x);
  var maxX = goals.reduce((a,b)=>a>b.x ? a : b.x, goals[0].x);
  var minY = goals.reduce((a,b)=>a<b.y ? a : b.y, goals[0].y);
  var maxY = goals.reduce((a,b)=>a>b.y ? a : b.y, goals[0].y);
  var widthScale = 1 / (maxX-minX);
  var heightScale = 1 / (maxY-minY);
  
  //TODO preserve aspect ratio
  this.scale = function(point){
    //console.log(this);
    console.log("x: "+this.x);
    //console.log("width: "+this.width);
    return {x: point.x*this.width + this.x, y:point.y*this.height + this.y};
  }
  
  points = goals.
    map(g => {return {x: ((g.x - minX)*widthScale), y: (g.y - minY)*heightScale}}).
    map(point => {return {x: point.x*(this.width-10) + this.x + 5, y:point.y*(this.height-10) + this.y + 5}}); //TODO figure out 'this' inside map
  console.log(points);
  
  this.render = function(){
    camera.absoluteMode = true;
    printRectangle(rect,"black",1);
    printRectangle(rect,"white",1,5);
    for (var i = 1; i < points.length - 1; i++) {
      printLine(points[i-1].x,points[i-1].y,points[i].x,points[i].y,3,"green",0.9);
    }
    
    //player
    var scaled1 = {x:(player.x - minX)*widthScale, y: (player.y - minY)*heightScale}
    var circle = {x: scaled1.x*(this.width-10) + this.x + 5, y:scaled1.y*(this.height-10) + this.y + 5, radius: 4}; //TODO: refractor to a scale function
    if(keysDown[82]){
      console.log(circle);
    } 
    printCircle(circle,"aqua",false,1);
    
    camera.absoluteMode = false;
    
  }
  
  this.renderCircle = function(timer){
    $(".qd1").text(timer);
    camera.absoluteMode = true;
    
    var radius = this.width/2;
    var circle = {x:this.x + radius,y:this.y + radius,radius:radius};
    printCircle(circle,"black",false,1);
    printCircle(circle,"grey",false,1,5); //TODO add timer
    printArc(circle,0,timer * Math.PI*2,"white",1,5);
    var closeGoals = this.goals.filter(p => distance(p,player) < 5000);
    var printables = closeGoals.map(g => {return {x: ((g.x - this.player.x)/5000) * radius + circle.x, y: ((g.y - this.player.y)/5000) * radius + circle.y, id: g.id}});
    //console.log(printables);
    
    for (var i = 1; i < printables.length - 1; i++) {
      if(printables[i-1].id + 1 === printables[i].id)
        printLine(printables[i-1].x,printables[i-1].y,printables[i].x,printables[i].y,3,"green",0.9);
    }
    
    //Player
    printCircle({x:circle.x,y:circle.y,radius:4},"aqua",false,1);
    
    camera.absoluteMode = false;
    
  }
  
  this.update = function(delta, player){
    this.player = player;
    
  }
  
  
  
  
  
  
  
  
}