/*
  Contains all Game logic
*/

var CreatureClient = require('./CreatureClient')
  , GameEvents = require('./GameEvents')
  , gameConf = require('../conf/game')
  , Tiles = require('./Tiles')
  , Coord = require('./Coord');

function Game(){
  this.observers = []; // Holds socket connections for global observers
  this.creatures = {};
  this.grid = {}; // Use an object rather than array to allow negative indices
}

Game.prototype.identify = function(socket, clientConfig){
  var self = this;

  // TODO: Add validation logic
  var creature = new CreatureClient(socket, clientConfig);

  socket.on('disconnect', function(){
    self.killCreature(creature, {cause: 'disconnect'});
  });

  var initialState = this.getInitialState(creature);

  this.creatures[initialState.pos] = creature;

  creature.set('state', initialState);

  // Respond to the move event from the creature
  creature.on('move', function(coords) {
    self.moveCreature(creature, coords);
  });

  // Respond to the look event
  creature.on('look', function(){
    creature.see(self.getVisibleFor(creature));
  });

  creature.notifyReady();
}

// Used to subscribe a socket to all game updates
Game.prototype.registerObserver = function(socket){
  socket.emit('see', this.grid); // Send the full grid
  this.observers.push(socket);
}


// Used to notify observers of actions
Game.prototype.broadcast = function(ev, data){
  this.observers.forEach(function(o){
    o.emit(ev, data);
  });
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
  if(!(coord in this.grid)){
    this.grid[coord] = Tiles.randomTile();
    var seen = {};
    seen[coord] = this.grid[coord];
    this.broadcast('see', seen);
  }
  return this.grid[coord];
}

// Validate and perform move actions
// Activates creature.see for new tiles
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

  // Grab all the newly visible tiles to the player
  var newTiles;
  if(origin.x < coord.x) // Moving in positive X Direction
    newTiles = Coord.getBox(
      coord.x + gameConf.sightline, coord.y - gameConf.sightline,
      coord.x + gameConf.sightline, coord.y + gameConf.sightline)
  else if(origin.x > coord.x) // Negative x direction
    newTiles = Coord.getBox(
      coord.x - gameConf.sightline, coord.y - gameConf.sightline,
      coord.x - gameConf.sightline, coord.y + gameConf.sightline)
  else if(origin.y < coord.y) // Positive Y direction
    newTiles = Coord.getBox(
      coord.x - gameConf.sightline, coord.y + gameConf.sightline,
      coord.x + gameConf.sightline, coord.y + gameConf.sightline)
  else if(origin.y > coord.y) // Negative Y direction
    newTiles = Coord.getBox(
      coord.x - gameConf.sightline, coord.y - gameConf.sightline,
      coord.x + gameConf.sightline, coord.y - gameConf.sightline)

  // Show the players the new tiles
  creature.see(this.describeCoords(newTiles));

  // Tell they player they've moved
  creature.set("state.pos", coord)

  // Notify everyone in the area about the move
  this.boardChanged(new GameEvents.CreatureMoved(creature, origin, coord));
}

Game.prototype.killCreature = function(creature, details){
  creature.die();

  delete this.creatures[creature.state.pos];

  // Notify that the creature as died
  this.boardChanged(new GameEvents.CreatureDied(creature, details));

}


// Notify the proper creatures that something near them has changed
Game.prototype.boardChanged = function(ev){
  var self = this; // Keep a reference for closures

  this.broadcast('notify', ev);

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