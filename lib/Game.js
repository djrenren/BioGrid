/*
  Contains all Game logic
*/

var CreatureClient = require('./CreatureClient')
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
  console.log(creature.state.pos);
  console.log(coords);
  console.log(Object.keys(this.creatures));
  if(Math.sqrt( Math.pow(creature.state.pos.x - coords.x, 2) + Math.pow(creature.state.pos.y - coords.y, 2)) != 1)
    return creature.warn("Invalid move, too far");
  else if(this.creatures[coords] != null)
    return creature.warn("Space is occupied");

  delete this.creatures[creature.state.pos];
  this.creatures[coords] = creature;

  creature.set("state.pos", coords)

  this.boardChanged();
}

Game.prototype.boardChanged = function(){
  // Used to notify changes via socket connections
}

Game.prototype.getInitialState = function(creature){
  return {
    food: 30,
    health: creature.stats.health,
    pos: new Coord(0, 0) // TODO: Fix this to avoid placement conflicts
  }
}



module.exports = Game;