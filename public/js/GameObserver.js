/*
  Watches the game and updates the UI as things change
*/

(function(scope){


// Why use a class? We may eventually have several games running
function GameObserver(){ 
  // We connect to the 'observer' room so we get all game updates
  this.socket = io.connect('http://' + location.host + '/observer');

  with(GameObserver.prototype){
    this.socket.on('see', see.bind(this));
  }
}

// Called whenever a tile is created
GameObserver.prototype.see = function(grid){
  console.log("seeing...");
  console.log(grid);
}

scope.GameObserver = GameObserver;

})(window);