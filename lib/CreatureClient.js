/*
  A Class for handling all client creature interactions
*/

var util = require('util');


// {
//   name: "Kreecher",
//   stats: {
//     health: 4,  Drained by starvation or combat. Creature dies on 0
//     metabolism: 6, Affects allowed APM, use resources faster, allow more actions
//     strength: 3 Determines damage inflicted on attack
//   }
// }
function CreatureClient(socket, config){
  this.socket = socket;
  this.locked = false; // Used to limit action rate

  // Prototype Methods aren't accessible until after instantiation
  with(CreatureClient.prototype){
    set.call(this, 'name', config.name);
    set.call(this, 'stats', config.stats);
    attachSocketListeners.call(this);  
  }
}

/*
  Used by Game once creature has been added to the game
*/
CreatureClient.prototype.notifyReady = function(){
  this.attachSocketListeners();
  this.socket.emit('ready'); 
}

CreatureClient.prototype._ifReady = function(func){
  return function(){
    if(this.locked)
      this.warn("Too fast!");
    else
      func.apply(this, arguments);
  }
}

// Add socket events
CreatureClient.prototype.attachSocketListeners = function(){
  this.socket.on('move', this._ifReady(function(){
    console.log("moving...");
  }));
}

CreatureClient.prototype.set = function(attrName, val){
  this.socket.emit('set', {attr: attrName, val: val});

  var attr = this
    , dotIndex = 0;
  while((dotIndex = attrName.indexOf('.')) != -1){
    attr = attr[attrName.substr(0,dotIndex)]
    console.log(attrName);
    attrName = attrName.substr(dotIndex + 1);
  }
  attr[attrName] = val;
}


CreatureClient.prototype.warn = function(msg){
  this.socket.emit('warn', msg);
}

CreatureClient.prototype.error = function(msg){
  this.socket.emit('error', msg);
}

module.exports = CreatureClient;