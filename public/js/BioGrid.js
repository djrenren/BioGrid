function BioGrid(canvas, host){
  this.host = host || location.host;
  this.observer = io.connect('http://' + this.host + '/observer');
  this.grid = new Grid(canvas);
  this.script = null;
  this.following = null;

  this.observer.on('see', this.grid.update.bind(this.grid));

  var self = this;


  this.observer.on('creatureMoved', function(ev){
    console.log(ev.creature);
    console.log(this.following);
    if(ev.creature === self.following){
      console.log('CENTERING!');
      console.log(ev.locs[1]);
      self.grid.centerOn(ev.locs[1].x, ev.locs[1].y);
    }
  });

}

BioGrid.prototype.followCreature = function(creatureName){
  this.following = creatureName;
  console.log("Time to start following: " + creatureName);
  // TODO center on creature here
}

BioGrid.prototype.runCreatureScript = function(){
  if(!this.script)
    console.error('You must add a script file');
  else
    this.reloadScript(eval);
}

BioGrid.prototype.setCreatureScript = function(file) {
  this.script = file;
  this.reloadScript();
}

BioGrid.prototype.loadScript = function(cb) {
  var reader = new FileReader();
  reader.onload = function(e){
    cb(e.target.result);
  }

  reader.readAsText(this.script);
}

BioGrid.prototype.follow = function(name){
  this.following = name;
}

BioGrid.prototype.draw = function(){
  this.grid.draw.apply(this.grid, arguments);
}