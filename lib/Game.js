/*
  Contains all Game logic
*/

var CreatureClient = require('./CreatureClient');

function Game(){
  this.creatures = [];
}

Game.prototype.identify = function(socket, clientConfig){
  // TODO: Add validation logic
  var creature = new CreatureClient(socket, clientConfig);

  creature.set('state', this.getInitialState(creature));
}

Game.prototype.register = function(client) {
  this.creatures.push(client);
}

Game.prototype.getInitialState = function(creature){
  return {
    food: 30,
    health: creature.stats.health
  }
}



module.exports = Game;