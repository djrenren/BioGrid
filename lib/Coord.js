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

// Get a box that surrounds all points with a buffer
// @param coords - Array of coordinates or single coordinate to surround
// @param buffer - Number of units to buffer (inclusive)
Coord.getBufferedBox = function(coords, buffer){
  // Turn coords into an array if it's singular
  if(coords instanceof Coord)
    coords = [coords];

  // Sort to get mins and maxes
  //
  // Using .concat() copies the array so the order is maintained
  // Order is important on some events such as Player Moved
  var xDesc = coords.concat().sort(function(a, b){ return a.x < b.x })
    , x1 = xDesc[xDesc.length -1].x - buffer
    , x2 = xDesc[0].x + buffer;

  // Re-sort xDesc rather than .concat() to save memory
  var yDesc = xDesc.sort(function(a, b){ return a.y < b.y })
    , y1 = yDesc[yDesc.length -1].y - buffer
    , y2 = yDesc[0].y + buffer;


  // Provide the largest bounding box necessary
  return Coord.getBox(x1, y1, x2, y2);
}

module.exports = Coord;