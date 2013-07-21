/*
  Handles the various types of tiles on the grid
*/

var util = require('util')
  , tileConf = require('../conf/tiles');


module.exports = {
  WaterTile: WaterTile,
  GrainTile: GrainTile,
  FieldTile: FieldTile,
  randomTile: randomTile
}


function Tile(type, walkable){
  this.type = type;


  // Allow for override, then follow conf, then default to true
  this.walkable = walkable || tileConf[type].walkable;
}


function WaterTile(depth){
  Tile.call(this, "water");

  // If depth is not provided, make it up
  this.depth = depth || randomBetween(tileConf.water.minDepth, tileConf.water.maxDepth);
}

// Not strictly necessary but now they're both of type Tile
util.inherits(WaterTile, Tile);

function GrainTile(capacity){
  Tile.call(this, "grain");

  // If capacity is not provided, make it up
  this.capacity = capacity || 
    randomBetween(tileConf.grain.minCapacity, tileConf.grain.maxCapacity);
}

// Not strictly necessary but now they're both of type Tile
util.inherits(GrainTile, Tile);

function FieldTile(capacity){
  Tile.call(this, "field");
}

// Not strictly necessary but now they're both of type Tile
util.inherits(FieldTile, Tile);


// Returns a random tile
function randomTile(){
  var rand = Math.random()
    , sum = 0;
  for(var type in tileConf.random){
    sum += tileConf.random[type];
    if(rand < sum)
      return makeTileByType(type);
  }
}


// Used by randomTile to correlate type to constructor
function makeTileByType(type){
  var tile;
  switch(type){
    case "field":
      tile = new FieldTile();
      break;

    case "grain":
      tile = new GrainTile();
      break;

    case "water":
      tile = new WaterTile();
      break;
  }

  return tile;  
}

// Used for randomly generating tile attributes
function randomBetween(min, max){
  return Math.floor(Math.random() * (max - min + 1)) + min;
}