function BioGrid(canvas, host){
  this.host = host || location.host;

  this.observer = io.connect('http://' + this.host + '/observer');

  this.grid = new Grid(canvas);

  this.script = null;

  this.observer.on('see', this.grid.update.bind(this.grid));
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