
define(["game"],"sound",function(modules) {
    var game = modules.game;

    game.sound = {muted:false};

    game.sound.currLoop = null;

    game.sound.mute = function() {
        if(game.sound.currLoop) {
            game.sound.currLoop.origVolume = game.sound.currLoop.volume ;
            game.sound.currLoop.volume = 0;
        }
        game.sound.muted = true;
    };

    game.sound.unmute = function() {
        if(game.sound.currLoop) {
            game.sound.currLoop.volume = game.sound.currLoop.origVolume ;
        }
        game.sound.muted = false;
    };

    game.sound.toggle = function() {
        if(game.sound.muted) game.sound.unmute();
        else game.sound.mute();
    }

    game.sound.once= function(src,vol) {
        if(typeof vol == 'undefined') vol = 0.8;
        var sound = document.createElement("audio");
        sound.setAttribute("src",src);
        sound.setAttribute("controls",false);
        sound.setAttribute("autoplay",true);
        sound.style.display = 'none';
        sound.volume = (game.sound.muted?0:vol);
        sound.onended = function(evt) {
            document.body.removeChild(evt.target);
        }
        document.body.appendChild(sound);
    };

    game.sound.loop= function(src,vol) {
        if(typeof vol == 'undefined') vol = 0.8;
        if(game.sound.currLoop != null) {
            document.body.removeChild(game.sound.currLoop);
        }
        var sound = document.createElement("audio");
        sound.setAttribute("src",src);
        sound.setAttribute("controls",false);
        sound.setAttribute("autoplay",true);
        sound.setAttribute("loop",true);
        sound.volume = (game.sound.muted?0:vol);
        sound.origVolume=vol;
        sound.style.display = 'none';
        document.body.appendChild(sound);
        sound.remove = function() {
            document.body.removeChild(game.sound.currLoop);
            game.sound.currLoop = null;
        }
        game.sound.currLoop =  sound;
    };

    game.on("win",function(){
        if(game.sound.currLoop != null) {
            document.body.removeChild(game.sound.currLoop);
        }
    });

    game.on("lost",function(){
        if(game.sound.currLoop != null) {
            document.body.removeChild(game.sound.currLoop);
        }
    });

    game.on("afterRun",function(cfg,game){
        if(typeof cfg.sounds != "undefined") {
            for(var i=0;i<cfg.sounds.length;i++){
                game.sound.once(cfg.sounds[i],0);
            }
        }
    });


    return game.sound;
});
