/*
  A Class for handling all client creature interactions
*/

var util = require('util')
  , EventEmitter = require('events').EventEmitter
  , Coord = require('./Coord');


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
  this.lastAction = 0; // Used to limit action rate

  // Prototype Methods aren't accessible until after instantiation
  with(CreatureClient.prototype){
    set.call(this, 'name', config.name);
    set.call(this, 'stats', config.stats);
  }
}

// We want CreatureClient to emit its own events
// So that Game doesn't fiddle with CreatureClient's
// socket connection directly
util.inherits(CreatureClient, EventEmitter);

/*
  Used by Game once creature has been added to the game
*/
CreatureClient.prototype.notifyReady = function(){
  this.attachSocketListeners();
  this.socket.emit('ready'); 
}


/*
  Used to tell creatures about external events such as moves
*/
CreatureClient.prototype.notify = function(ev, data){
  this.socket.emit(ev, data);
}

CreatureClient.prototype._ifReady = function(func){
  return (function(){
    if(Date.now() - this.lastAction < this.stats.metabolism)
      this.warn("Too fast!");
    else {
      func.apply(this, arguments);
      if(this.stats.metabolism > 0) {
        this.lock();
      }
    }
  }).bind(this);
}



// Separated into own function in case this gets more complicated
CreatureClient.prototype.lock = function(){
  this.lastAction = Date.now();
}

// Separated into own function in case this gets more complicated
CreatureClient.prototype.unlock = function(){
  this.locked = false;
}

// Add socket events
CreatureClient.prototype.attachSocketListeners = function(){
  var self = this;

  this.socket.on('move', this._ifReady(function(direction){
    self.move(direction);
  }));

  this.socket.on('look', function(){
    self.emit('look');
  });

}

// Move creature in a direction.
// Up, down, left, right or north, south, east, west
// Case is irrelevant
CreatureClient.prototype.move = function(direction){
  var coords = new Coord(this.state.pos.x, this.state.pos.y);
  switch( direction.toLowerCase() ){
    case 'up':
    case 'north':
      coords.y += 1;
      break;

    case 'down':
    case 'south':
      coords.y -= 1;
      break;

    case 'left':
    case 'west':
      coords.x -= 1;
      break;

    case 'right':
    case 'east':
      coords.x += 1;
      break;
  }

  this.emit('move', coords);
}


// Pass what is seen through the socket
CreatureClient.prototype.see = function(grid){
  this.socket.emit('see', grid);
}


CreatureClient.prototype.set = function(attrName, val){
  this.socket.emit('set', {attr: attrName, val: val});
  var attr = this
    , dotIndex = 0;
  while((dotIndex = attrName.indexOf('.')) != -1){
    attr = attr[attrName.substr(0,dotIndex)]
    attrName = attrName.substr(dotIndex + 1);
  }
  attr[attrName] = val;
}

CreatureClient.prototype.die = function(details){

  // Check if the socket is not open, if so we have
  // nothing to do here.
  if(this.socket.id in this.socket.manager.closed)
    return;
  this.socket.emit('die', details);

  this.socket.disconnect();
}


CreatureClient.prototype.warn = function(msg){
  this.socket.emit('warn', msg);
}

CreatureClient.prototype.error = function(msg){
  this.socket.emit('error', msg);
}



module.exports = CreatureClient;