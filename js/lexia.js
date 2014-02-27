
define(["game","sound","player","gamepad","gamepad2keyboard","tiled","buttons","messages"],"lexia",function(modules) {
    var game = modules.game, lexia = {};

    var maps = ['cave','grass','desert','snow'];

    var config = {
        id: "game",
        width: 1024,
        height: 720,
        gsize: 10,
        fps: 60,
        ups: 30,
        forwarded: 0,
        scale: 0.92,
        over: false,
        maps: maps.map(function(m){return 'assets/'+m+'.json'}),
        sounds:['assets/Skipping in the No Standing Zone.mp3','assets/Pilot_yelp1.wav','PK_swing2.wav'] 
    };

    var bgs = { };
    for(var i in maps) {
        bgs[maps[i]] = new Image();
        bgs[maps[i]].src = 'assets/bg_'+maps[i]+'.png';
    }

    bgs['intro'] = new Image();
    bgs['intro'].src = 'assets/intro.png';

    var items = new Image();
    items.src = 'assets/items_spritesheet.png';

    lexia.teleport = function(map,x,y) {
        game.clear();

        game.addEntity({
            draw: function(canvas,e,game) {
                canvas.drawImage(bgs[map],0,0,1024,512,0,0,canvas.width,canvas.height);
            }
        });

        game.tiled.loadMap(map);
        game.addEntity(game.player.player);

        game.player.player.dirty=true;

        game.layers[1].canvas.clearRect(game.config.forwarded * 2 * -1,0,(game.config.width + game.config.forwarded )* 4,game.config.height);

        var objs = game.tiled.map.objects.objects;
        for(var i =0;i<objs.length;i++) {
            if(objs[i].type == 'teleporter') {
                game.addEntity({
                    x: objs[i].x - 4,
                    y: objs[i].y + 72,
                    obj: objs[i],
                    layer: 1,
                    w: 72,
                    h: 72,
                    draw: function(canvas,e) {
                        canvas.drawImage(items,284,290,72,72,e.x * game.config.scale,e.y * game.config.scale,72 * game.config.scale,72 * game.config.scale);
                    },
                    update: function(evts,e) {
                        e.dirty = game.player.player.dirty;
                    }
                });
            } else if(objs[i].type == 'end') {
                game.addEntity({
                    x: objs[i].x - 4,
                    y: objs[i].y + 72,
                    obj: objs[i],
                    w: 72,
                    h: 72,
                    layer: 1,
                    draw: function(canvas,e) {
                        canvas.drawImage(items,212,360,e.w,e.h,e.x * game.config.scale,e.y * game.config.scale,e.w * game.config.scale,e.h * game.config.scale);
                    },
                    update: function(evts,e) {
                        e.dirty = game.player.player.dirty;
                        
                        if(evts.keypress) {
                            if(evts.keypress[32]) {
                                var p = game.player.player;
                                if(game.tiled.intersects(e.x,e.y,e.w,e.h,p.x,p.y,p.w,p.h)) {
                                    game.winGame();
                                }
                            }
                        }
                    }
                });
            }
        }
    };

    game.on("win",function(game){
        game.utils.showMessage("YOU WON! CONGRATZ!");
    });

    game.on("lost",function(game){
    });

    lexia.startGame = function(){
        game.player.makePlayer(200,500);
        lexia.teleport('grass',200,500);
        if(game.config.forwarded > 0) {
            game.config.forward = game.config.width/2 - game.player.player.w/2 - 200;
            game.config.forward = game.config.forwarded * game.config.scale - game.config.forward * game.config.scale ;
            game.layers[1].canvas.translate(game.config.forward,0);
            game.layers[2].canvas.translate(game.config.forward,0);
            game.config.forward = game.config.width/2 - game.player.player.w/2 - 200;
            game.config.forwarded = game.config.forward;
        } else {
            game.config.forward = game.config.width/2 - game.player.player.w/2 - 200;
            game.layers[1].canvas.translate(game.config.forward,0);
            game.layers[2].canvas.translate(game.config.forward,0);
            game.config.forwarded = game.config.forward;
        }
        game.tiled.redo();
        game.utils.showMessage("You win by reaching the flag!",6000);
        game.utils.showMessage("Play with WASD to move, M to mute and Space to teleport to a different scenary on a coin-block.",6000);
        game.utils.resetButtons();
    };

    game.on("afterRun",function(cfg,game) {
        game.addEntity({
            draw: function(canvas,e,game) {
                canvas.drawImage(bgs['intro'],0,0,1024,720,0,0,canvas.width,canvas.height);
            }
        });
        game.utils.addButton("Start Game",function(){
            game.sound.loop("assets/Skipping in the No Standing Zone.mp3",0.5);
            lexia.startGame();
            return true;
        });
    });

    game.on("afterUpdate",function(evts,game) {
        if(!game.player.player) return;
        var p = game.player.player;
        if(p.dirty && p.nX != p.x) { // tile move calcs
            game.config.forward = p.nX - p.x;
            game.config.forwarded += game.config.forward;
            game.tiled.redo();
        }
    });

    game.on("beforeDraw",function(){
        if(!game.player.player) return;
        var p = game.player.player;
        if(p.dirty && p.nX != p.x) { // tile move acts 
            game.layers[1].canvas.translate(( game.config.forward * -1 ) * game.config.scale,0);
            game.layers[2].canvas.translate(( game.config.forward * -1 ) * game.config.scale,0);
            game.layers[1].canvas.clearRect(game.config.forwarded * 2 * -1,0,( game.config.width + game.config.forwarded  )* 4,game.config.height);
        }
    });

    game.on("afterUpdate",function(evts,game) {
        if(!game.player.player) return;
        if(evts.keypress) {
            if(evts.keypress[32]) { // teleport
                var p = game.player.player;
                var o = game.tiled.objectAt(p.x,p.y,p.x+p.w,p.y+p.w);
                if(o) {
                    if(o.type == 'teleporter') {
                        game.sound.once("assets/Pilot_yelp1.wav",0.3);
                        lexia.teleport(o.properties.to,o.toX,o.toY);
                    }
                }
            }
        }
    });

    game.on("afterUpdate",function(evts,game) {
       if(evts.keypress) {
           if(evts.keypress[109]) { // mute
               game.sound.toggle();
           }
       }

    });

    game.on("afterUpdate",function(evts,game){
        if(!game.player.player)return;
        var p = game.player.player;
        if(evts.keypress){ // jump
            if(evts.keypress[119] && p.d.j==11) {
                game.sound.once("assets/PK_swing2.wav",0.3);
            }
        }
    });

    game.on("afterUpdate",function(evts,game){
        if(!game.player.player) return; 
        if(game.config.over) return;
        if(game.player.player.y >= game.config.height) { // death
            game.config.over  =true;
            game.utils.showMessage("You fell! Go back to start...");
            game.layers[2].canvas.clearRect(game.config.forwarded * 2 * -1,0,( game.config.width + game.config.forwarded  )* 4,game.config.height);
            game.utils.addButton("Respawn",function(){
                game.config.over = false;
                lexia.startGame();
            });
        }
    });

    lexia.start = function() {
        game.run(config);
    };

    return lexia;
});

