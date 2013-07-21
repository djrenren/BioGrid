(function(scope){

function CreatureLoader( file ){
  this.file = file;
  this.reader = new FileReader();

  this.reader.onload = function(e){
    self._onRefreshed(e.target.result);
  }
}

CreatureLoader.prototype.refresh = function() {
  this.reader.readAsText(this.file);
}

CreatureLoader.prototype.onText = function(text){
  console.log("text loaded");
}

scope.CreatureLoader = CreatureLoader;

})(window);