/*
  Utility events to describe changes on the grid
*/

var util = require('util');

// Grid Events have a location or several locations
// These locations are used to intelligently notify
// creatures within the vicinity
//
// Allows any number of locations or an array
function GridEvent(c1, c2){
  this.locs = [];
  if(c1 instanceof Array)
    this.locs = c1;
  else
    for(var i = 0; i < arguments.length; i++){
      this.locs.push(arguments[i]);
    }
}


// Used for notifying when a creature moves on the grid
function CreatureMoved(creature, c1, c2){

  // Call the superconstructor
  GridEvent.call(this, c1, c2);

  console.log(this.locs);

  this.type = 'CreatureMoved'; 
  this.creature = creature.name;
}

util.inherits(CreatureMoved, GridEvent);
exports.CreatureMoved = CreatureMoved;

