(function(){
  var loader;


  window.addEventListener('load', function(){
    console.log("window loaded");
    var fileDrop = document.getElementById('file_drop');
    console.log(fileDrop);

    window.game = new BioGrid('grid');

    game.followCreature('Reggie');

    fileDrop.addEventListener('dragover', handleDragOver, false);
    fileDrop.addEventListener('drop', handleFileSelect, false);
  });

  // Shows special cursor on drag
  function handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    console.log("dragging...");
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }

  // Handles dropped file
  function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();

    loader = new CreatureLoader(evt.dataTransfer.files[0]);
    
    setFileDropText(loader.file.name);

    loader.onText = function(){
      console.log("Houson, we have liftoff");
    }
    return false;
  }

  function setFileDropText(text){
    document.getElementById('file_drop').innerText = text;
  }

})();