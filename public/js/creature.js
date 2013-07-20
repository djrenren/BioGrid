(function(scope){


// Declares names and initial stats
// {
//   name: "Kreecher",
//   stats: {
//     health: 4,  Drained by starvation or combat. Creature dies on 0
//     metabolism: 6, Affects allowed APM, use resources faster, allow more actions
//     strength: 3 Determines damage inflicted on attack
//   }
// }
function Creature(config){
  var self = this;

  // Hide the socket attribute to avoid confusion.
  Object.defineProperty(this, "socket", hidden(io.connect('http://' + location.host)));

  // Prototypes aren't accessible until after instantiation
  Creature.prototype._attachListeners.call(this);

  this.socket.emit('identify', config);
}

// Create our descriptor for hidden, fixed properties
function hidden(func){
  return {
    enumerable: false,
    writable: false,
    configurable: false,
    value: func
  }
}


// We have to use this shenanigans to hide and protect internal functions
Object.defineProperties(Creature.prototype, {
  _attachListeners: hidden(function(){

    this.socket.on('set', this._set.bind(this))

  }),


  // Used when the server updates the local data (usually in this.state)
  _set: hidden(function(data){
    console.log(data);
    var attr = this
      , attrName = data.attr
      , dotIndex = 0;
    while((dotIndex = attrName.indexOf('.')) != -1){
      attr = attr[attrName.substr(0,dotIndex)]
      attrName = attrName.substr(dotIndex + 1);
    }
    attr[attrName] = data.val;
  })


});





Creature.prototype.ready = function(){
  console.log("I'M READY!!");
}



scope.Creature = Creature})(window);