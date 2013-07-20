var Reginald = new Creature({name: "Reggie", stats:{}});

Reginald.on('ready', function(){
  this.look();
});

Reginald.on('updated', function(attr){
});

Reginald.on('attacked', function(){});

Reginald.on('see', function(grid){
});