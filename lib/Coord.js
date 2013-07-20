/*
  A simple coordinate class that has a special toString function
  so that it can be used as a key in an object
*/

function Coord(x, y){
  this.x = x;
  this.y = y;
}

Coord.prototype.toString = function(){
  return this.x + ',' + this.y;
}

module.exports = Coord;