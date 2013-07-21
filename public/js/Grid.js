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

  this.viewport = [0,0,11,11];
  console.log(this.viewport);
}

Grid.prototype.setViewport = function(x1, y1, x2, y2){
  this.viewport = [x1, y1, x2, y2];
  this.draw.apply(this, this.viewport);
}

// Grid is a fraction of
Grid.prototype.update = function(gridSegment){
  var redraw = false;
  for(var tile in gridSegment){
    var coord = tile.split(',');
    coord[0] = parseInt(coord[0]);
    coord[1] = parseInt(coord[1]);
    console.log(coord);
    console.log(this.viewport);
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
  console.log("DRAWING!");
  for(var i = x1; i <= x2; i++)
    for(var j = y1; j <= y2; j++)
      this.drawTile(this.grid[i+','+j], i-x1, j-y1, x2-x1, y2-y1);
}

Grid.prototype.drawTile = function(tileInfo, relX, relY, tilesWide, tilesHigh){
  console.log(tilesWide);
  console.log(tilesHigh);

  var tileWidth = this.canvas.width / tilesWide
    , tileHeight = this.canvas.height / tilesHigh;

  console.log(tileWidth);

  this.ctx.lineWidth = 3;
  if(!tileInfo)
    this.ctx.strokeStyle = "#000";
  else if(tileInfo.type === "field")
    this.ctx.strokeStyle = "#0f0";
  else
    this.ctx.strokeStyle = "#f00";
  console.log('we made it so far');

  console.log(relX * tileWidth);
  console.log(this.canvas.height - (relY * tileHeight));
  console.log(tileWidth);
  console.log(tileHeight);

  this.ctx.strokeRect( // Remember origin is top-left so we must correct
    relX * tileWidth, this.canvas.height - (relY * tileHeight),
    tileWidth, -1*tileHeight);
}