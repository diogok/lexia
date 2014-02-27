
define(["game"],"player",function(modules) {

    var game = modules.game;
    game.player = {player:null};

    var sprite = new Image();
    sprite.src = 'assets/p3_spritesheet.png';

    game.player.makePlayer = function(x,y) {
        game.player.player = null;
        if(game.layers[2]) {
            game.layers[2].entities = [];
            game.layers[2].canvas.clearRect(0,0,1024,720);
        }
        var player = {
            x: x,
            y: y,
            nX: x,
            nY: y,
            h: 96,
            w: 72.5,
            d: {x:0,y:0,j:0},
            dd:0,
            ddd:0,
            layer: 2,
            sprite: sprite,
            draw: function(canvas,player) {
                canvas.clearRect(player.x  * game.config.scale - 20,0,player.nX * game.config.scale + 40,game.config.height);

                canvas.drawImage(player.sprite,player.ix,player.iy,player.w,player.h,player.nX * game.config.scale,player.nY * game.config.scale,player.w * game.config.scale,player.h * game.config.scale);

                player.x = player.nX;
                player.y = player.nY;
            },
            update: function(evts,player,game) {
                if(player.y > game.config.height) {
                    return;
                }
                player.nX = player.x;
                player.nY = player.y;

                if(evts.keydown) {
                    if(evts.keydown[68]) {
                        player.d.x = 10;
                    } else if(evts.keydown[65]) {
                        player.d.x = -10;
                    }
                    if(evts.keydown[87] && game.tiled.tileAt(player.x,player.y+player.h,player.x+player.w,player.y+100)) {
                        player.d.j = 12;
                    }
                }

                if(evts.keyup) {
                    if(player.d.x > 0 && evts.keyup[68]) {
                        player.d.x = 0;
                    }
                    if(player.d.x < 0 && evts.keyup[65]) {
                        player.d.x = 0;
                    }
                }

                if(player.d.j > 0) {
                    player.d.j -= 1;
                    player.d.y = -10;
                } else if(player.d.j == 0) {
                    player.d.y = 0 ;
                } 

                if(player.d.y == 0) {  // "gravity"
                    player.d.y = 10;
                }

                var nX = player.x + player.d.x,nY = player.y + player.d.y;
                while(game.tiled.tileAt(nX,player.y,nX+player.w,player.y+player.h) && nX != player.x) {
                    nX += (player.d.x>0)?-1:1;
                }
                while(game.tiled.tileAt(player.x,nY,player.x+player.w,nY+player.h) && nY != player.y) {
                    nY += (player.d.y>0)?-1:1;
                }

                if(nX != player.x) {
                    player.nX = nX;
                    player.dd = 2;
                }
                if(nY != player.y) {
                    player.nY = nY;
                    player.dd = 2;
                }


                var ix=0;
                var iy=2;
                if(player.nX == player.x) {
                    if(player.nY < player.y) {
                        ix = 6;
                        iy = 1;
                    } else if(player.nY > player.y) {
                        ix = 6;
                        iy = 0;
                    } else {
                        ix = 0;
                        iy = 2;
                    }
                } else if(player.nX > player.x) {
                    if(player.nY < player.y) {
                        ix = 6;
                        iy = 1;
                    } else if(player.nY > player.y) {
                        ix = 6;
                        iy = 0;
                    } else {
                        if(player.ddd==0) {
                            ix = 1;
                            iy = 1;
                            player.ddd=1;
                        } else if(player.ddd==1) {
                            ix = 0;
                            iy = 1;
                            player.ddd=0;
                        }
                    }
                } else if(player.nX < player.x) {
                    if(player.nY < player.y) {
                        ix = 0;
                        iy = 4;
                    } else if(player.nY > player.y) {
                        ix = 0;
                        iy = 3;
                    } else {
                        if(player.ddd==0) {
                            ix = 5;
                            iy = 4;
                            player.ddd=1;
                        } else if(player.ddd==1) {
                            ix = 6;
                            iy = 4;
                            player.ddd=0;
                        }
                    }
                }
                player.ix = ix * player.w;
                player.iy = iy * player.h;

                if(player.dd > 0) {
                    player.dirty=true;
                    player.dd--;
                } else {
                    player.dirty=false;
                }

            }
        };


        game.player.player = player;
        return player;
    };

    return game.player;
});
