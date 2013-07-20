var Reginald = new Creature({name: "Reggie", stats:{}});

Reginald.on('ready', function(){
  console.log("I'm Ready!");
});

Reginald.on('updated', function(attr){
  console.log(attr + " attribute updated!");
});

Reginald.on('attacked', function(){});

Reginald.move('up');
Reginald.move('down');
Reginald.move('left');
Reginald.move('right');