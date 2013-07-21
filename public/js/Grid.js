function Grid(canvas){
  this.grid = {};
  this.players = [];
  console.log(typeof canvas);

  // Use typeof rather than instanceof
  // for strings
  if(typeof canvas === "string")  // Allow canvas to be an id
    this.canvas = document.getElementById(canvas);
  
  else
    this.canvas = canvas;

  this.canvas.height = 500;
  this.ctx = this.canvas.getContext('2d');
  this.canvas.width = 500;

  this.tilesHigh = this.tilesWide = 11;

  this.viewport = [0,0,11,11];
  console.log(this.viewport);
}

Grid.prototype.setViewport = function(x1, y1, x2, y2){
  this.viewport = [x1, y1, x2, y2];
  console.log("Setting viewport");
  console.log(this.viewport);
  this.draw.apply(this, this.viewport);
}

// Grid is a fraction of
Grid.prototype.update = function(gridSegment){
  var redraw = false;
  for(var tile in gridSegment){
    var coord = tile.split(',');
    coord[0] = parseInt(coord[0]);
    coord[1] = parseInt(coord[1]);
    // If coord is in viewport, redraw
    if(coord[0] >= this.viewport[0] && coord[0] <= this.viewport[2]
      && coord[1] >= this.viewport[1] && coord[1] <= this.viewport[3])
      redraw = true;

    this.grid[tile] = gridSegment[tile];
  }

  if(redraw)
    this.redraw();
}

Grid.prototype.redraw = function(){
  this.draw.apply(this, this.viewport)
}

// Draws tiles for this section of the map
Grid.prototype.draw = function(x1, y1, x2, y2){
  this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  console.log("DRAWING!");
  for(var i = x1; i <= x2; i++)
    for(var j = y1; j <= y2; j++)
      this.drawTile(this.grid[i+','+j], i-x1, j-y1, x2-x1 + 1, y2-y1 + 1);
}

// Center the viewport on a specific square
Grid.prototype.centerOn = function(x, y){
  this.setViewport(
    x - Math.floor(this.tilesWide/2), y - Math.floor(this.tilesHigh/2),
    x + Math.floor(this.tilesWide/2), y + Math.floor(this.tilesHigh/2));
}


Grid.prototype.drawTile = function(tileInfo, relX, relY, tilesWide, tilesHigh){

  var tileWidth = this.canvas.width / tilesWide
    , tileHeight = this.canvas.height / tilesHigh;

  this.ctx.lineWidth = 2;

  this.ctx.strokeStyle = "#FFF";

  if(!tileInfo)
    this.ctx.fillStyle = "#000";
  else if(tileInfo.type === "field")
    this.ctx.fillStyle = "#0f0";
  else if(tileInfo.type === "water")
    this.ctx.fillStyle = "#00f";
  else
    this.ctx.fillStyle = "#f00";

 // Remember origin is top-left so we must correct
  var x = relX * tileWidth
    , y = this.canvas.height - (relY * tileHeight)
    , width = tileWidth
    , height = -1*tileHeight;

  this.ctx.strokeRect(x, y, width, height);
  this.ctx.fillRect(x, y, width, height);
}