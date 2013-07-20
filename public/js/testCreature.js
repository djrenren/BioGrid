var Reginald = new Creature({name: "Reggie", stats:{}});

Reginald.ready = function(){
  console.log("Reginald is ready");
  console.log(this);
}

Reginald.move = function(){
  console.log(this);
}