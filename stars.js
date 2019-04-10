function Sector(rect,amount,maxZ) {
  this.rect = rect;
  this.stars = [];
  this.ready=false;
  this.amount=amount;
  this.visible = function(){

    if(this.rect.y+this.rect.height<camera.y - camera.height) return false;
    if(this.rect.y>camera.y+camera.height*2) return false;
    if(this.rect.x+this.rect.width<camera.x- camera.width) return false;
    if(this.rect.x>camera.x+camera.width*2) return false;
    return true;
  };
  this.render = function() {
    if(!this.visible()){
      //printRectangle(this.rect,"red",10);
      return;
    } 
    sectorCounter++;
    if(!this.ready) this.generate();
    this.stars.forEach(star => star.render());
    //printRectangle(this.rect,"green",10);
  };
  this.generate = function(){
    for(var i=0;i<this.amount;i++){
      var x = this.rect.x + (Math.random()) * this.rect.width;
      var y = this.rect.y + (Math.random()) * this.rect.height;
      var z = 10+Math.random()*20;
      var r = 1+Math.random()*3;
      this.stars[i] = new Circle(x,y,z,r,"white");
    }
    this.ready = true;
  }
  
  
}


/*if(this.rect.y+this.rect.height<camera.y) return false;
    if(this.rect.y>camera.y+camera.height) return false;
    if(this.rect.x+this.rect.width<camera.x) return false;
    if(this.rect.x>camera.x+camera.width) return false;*/