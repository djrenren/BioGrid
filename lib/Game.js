/*
  Contains all Game logic
*/

var CreatureClient = require('./CreatureClient')
  , GameEvents = require('./GameEvents')
  , gameConf = require('../conf/game')
  , Coord = require('./Coord');

function Game(){
  this.creatures = {};
  this.grid = {}; // Use an object rather than array to allow negative indices
}

Game.prototype.identify = function(socket, clientConfig){
  var self = this;

  // TODO: Add validation logic
  var creature = new CreatureClient(socket, clientConfig);

  var initialState = this.getInitialState(creature);

  this.creatures[initialState.pos] = creature;

  creature.set('state', initialState);

  creature.on('move', function(coords) {
    self.moveCreature(creature, coords);
  });

  creature.notifyReady();
}

Game.prototype.register = function(client) {
  this.creatures.push(client);
}

Game.prototype.moveCreature = function(creature, coords){
  var origin = creature.state.pos;

  if(origin === coords) // No sense in doing any logic if they're not moving
    return;

  // Ensure the move is adjacent. Technically unnecessary because we use
  // directional instructions but better safe than sorry.
  if(Math.sqrt( Math.pow(creature.state.pos.x - coords.x, 2) + Math.pow(creature.state.pos.y - coords.y, 2)) != 1)
    return creature.warn("Invalid move, too far");
  else if(this.creatures[coords] != null)
    return creature.warn("Space is occupied");

  delete this.creatures[creature.state.pos];
  this.creatures[coords] = creature;

  creature.set("state.pos", coords)

  this.boardChanged(new GameEvents.CreatureMoved(creature, origin, coords));
}

// Notify the proper creatures that something near them has changed
Game.prototype.boardChanged = function(ev){
  var self = this; // Keep a reference for closures

  // Sort to get mins and maxes
  //
  // Using .concat() copies the array so the order is maintained
  // Order is important on some events such as Player Moved
  var xDesc = ev.locs.concat().sort(function(a, b){ return a.x < b.x })
    , x1 = xDesc[xDesc.length -1].x - gameConf.sightline
    , x2 = xDesc[0].x + gameConf.sightline;

  // Re-sort xDesc rather than .concat() to save memory
  var yDesc = xDesc.sort(function(a, b){ return a.y < b.y })
    , y1 = yDesc[yDesc.length -1].y - gameConf.sightline
    , y2 = yDesc[0].y + gameConf.sightline;


  // Provide the largest bounding box necessary
  Coord.getBox(x1, y1, x2, y2).forEach(function(coord){
    if(coord in self.creatures)
      self.creatures[coord].notify(ev);
  });
}

Game.prototype.getInitialState = function(creature){
  return {
    food: 30,
    health: creature.stats.health,
    pos: new Coord(0, 0) // TODO: Fix this to avoid placement conflicts
  }
}



module.exports = Game;