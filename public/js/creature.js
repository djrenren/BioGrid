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
  console.log(location.host);
  Object.defineProperty(this, "socket", hidden(io.connect('http://' + location.host)));

  Object.defineProperty(this, "events", {
    enumerable: false,  // hide it
    writable: false,    // no complete overwrites
    configurable: true, // allow modifications
    value: {}
  });

  // Prototypes aren't accessible until after instantiation
  Creature.prototype._attachListeners.call(this);

  // Tell the server who we are
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
    var self = this;
    this.socket.on('set', this._set.bind(this));

    this.socket.on('ready', function(){
      console.log("Ready event Received");
      self.emit('ready');
    });

    this.socket.on('notify', function(ev){
      console.log("I'm notifying you of a change");
      console.log(ev);
    });

    // We bind this to console because some browser get
    // picky about safety if it's not bound.
    this.socket.on('warn', console.warn.bind(console));

  }),

  // Used when the server updates the local data (usually in this.state)
  _set: hidden(function(data){
    var attr = this
      , attrName = data.attr
      , dotIndex = 0;
    while((dotIndex = attrName.indexOf('.')) != -1){
      attr = attr[attrName.substr(0,dotIndex)]
      attrName = attrName.substr(dotIndex + 1);
    }
    attr[attrName] = data.val;
    this.emit('updated', data.attr);
  }),

  emit: hidden(function(ev, anyNumberOfArgs){
    var self = this  // keep a reference for inside closures
      , args = Array.prototype.slice.call(arguments, 1);
    if(ev in this.events)
      this.events[ev].forEach(function(action){
        setTimeout(function(){      // Use setTimeout for faux-concurrency
          action.apply(self, args);
        }, 0);
      });  
  })
});

Creature.prototype.move = function(dir){
  console.log("Creature says move!");

  this.socket.emit('move', dir);
}

// Some event flavored action
Creature.prototype.on = function(ev, func){
  if(ev in this.events)
    this.events[ev].push(func);
  else
    this.events[ev] = [func];
}

scope.Creature = Creature})(window);