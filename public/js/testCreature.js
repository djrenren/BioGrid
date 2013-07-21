var Reginald = new Creature({name: "Reggie", stats:{
  metabolism: 50
}});

Reginald.on('ready', function(){
  this.look();
});

Reginald.on('updated', function(attr){
});

Reginald.on('attacked', function(){});

Reginald.on('see', function(grid){
});

Reginald.on('creatureMoved', function(ev){
  console.log(ev);
});

document.onkeydown = function(ev){
  console.log(ev);
  switch(ev.keyCode){
    case 37: // Left arrow key
      Reginald.move('left');
      break;

    case 38: // Up arrow key
      Reginald.move('up');
      break;

    case 39:
      Reginald.move('right');
      break;

    case 40:
      Reginald.move('down');
      break;
  }
};

console.log(document.onkeypress);