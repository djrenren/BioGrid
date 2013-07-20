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


// Get all coordinates in a bounding box (inclusive)
Coord.getBox = function(x1, y1, x2, y2){
  var coords = [];
  for(var i = x1; i <= x2; i++)
    for(var j = y1; j <= y2; j++)
      coords.push(new Coord(i,j));
  return coords;
}

module.exports = Coord;