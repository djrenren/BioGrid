/*
  Contains all Game logic
*/

var CreatureClient = require('./CreatureClient')
  , GameEvents = require('./GameEvents')
  , gameConf = require('../conf/game')
  , Tiles = require('./Tiles')
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

  // Respond to the move event from the creature
  creature.on('move', function(coords) {
    self.moveCreature(creature, coords);
  });

  // Respond to the see event
  creature.on('see', function(){
    creature.see(self.getVisibleFor(creature));
  });

  creature.notifyReady();
}

Game.prototype.register = function(client) {
  this.creatures.push(client);
}

// Return visible section of the grid for creature
Game.prototype.getVisibleFor = function(creature){
  return this.describeCoords(Coord.getBufferedBox(creature.state.pos, gameConf.sightline));
}

// Get info for a list of coordinates.
// @returns an object keyed by coord and valued with Tile instances
// and creature names
Game.prototype.describeCoords = function(coords){
  var self = this // Kept for closures
    , info = {};  // Will hold our output
  coords.forEach(function(c){
    info[c] = self.getOrCreateTile(c);
    if(c in self.creatures)
      info[c].creature = self.creatures[c].name;
  });
  return info;
}

// Returns Tile at coord in grid. If no Tile is found
// (on first observance) generate new tile and return
Game.prototype.getOrCreateTile = function(coord){
  if(!(coord in this.grid))
    this.grid[coord] = Tiles.randomTile();
  return this.grid[coord];
}

// Validate and perform move actions
// @param creature - CreatureClient instance to move
// @coord - Coord instance of new location (must be 1 cardinal dir. away)
Game.prototype.moveCreature = function(creature, coord){
  var origin = creature.state.pos;

  if(origin === coord) // No sense in doing any logic if they're not moving
    return;

  // Ensure the move is adjacent. Technically unnecessary because we use
  // directional instructions but better safe than sorry.
  if(Math.sqrt( Math.pow(creature.state.pos.x - coord.x, 2) + Math.pow(creature.state.pos.y - coord.y, 2)) != 1)
    return creature.warn("Invalid move, too far");
  else if(this.creatures[coord] != null)
    return creature.warn("Space is occupied");

  delete this.creatures[creature.state.pos];
  this.creatures[coord] = creature;

  creature.set("state.pos", coord)

  this.boardChanged(new GameEvents.CreatureMoved(creature, origin, coord));
}

// Notify the proper creatures that something near them has changed
Game.prototype.boardChanged = function(ev){
  var self = this; // Keep a reference for closures

  // Notify all creatures in range of event
  Coord.getBufferedBox(ev.locs, gameConf.sightline).forEach(function(coord){
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