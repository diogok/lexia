
define(["game"],"tiled",function(modules){
    var game = modules.game;
    game.tiled={maps:{},images:{}};

    game.on("afterRun",function(cfg,game){
        if(typeof cfg.maps == 'undefined') return;
        for(var i  in cfg.maps) {
            var base = cfg.maps[i].substring(0,cfg.maps[i].lastIndexOf('/') + 1);
            xhttp = new XMLHttpRequest();
            xhttp.overrideMimeType('text/json');
            xhttp.open("GET", cfg.maps[i], false);
            xhttp.send(null);
            map = JSON.parse(xhttp.responseText);
            game.tiled.maps[cfg.maps[i].substring(base.length,cfg.maps[i].lastIndexOf("."))] = map;
            for(var i in map.tilesets) {
                var img = new Image();
                img.src = base+map.tilesets[i].image;
                game.tiled.images[map.tilesets[i].image] = img;
            }
        }
    });

    game.tiled.loadMap = function(name,mX) {
        if(typeof mX == 'undefined') mX = 0;
        var map = game.tiled.maps[name], tiles, objects;

        for(var i in map.layers) {
            if(map.layers[i].type == 'tilelayer') {
                tiles = map.layers[i];
            } else if(map.layers[i].type == 'objectgroup') {
                object = map.layers[i];
            }
        }

        map.entities = [];
        var r = 0;
        for(var i =0;i<tiles.data.length;i++) {
            if((i % tiles.width)==0) r++;
            if(tiles.data[i] != 0) {
                var size = map.tilewidth;
                var set = game.tiled.maps[name].tilesets[0];
                var img = game.tiled.images[set.image];
                var idx = tiles.data[i];
                var ws  =  set.imagewidth / size ;
                img_x = ~~(( idx -1 ) % ~~ws)* size;
                img_y = ~~(( idx -1 ) / ~~ws) * size;
                x = (i % tiles.width)  * size;
                y = r * size;
                var ent = {
                    ix: img_x,
                    iy: img_y,
                    iw: set.tilewidth - 3,
                    ih: set.tileheight - 3,
                    x: x,
                    y: y,
                    w: map.tilewidth,
                    h: map.tileheight,
                    img: img,
                    i: idx,
                    layer: 1,
                    s: size,
                    mX: mX,
                    mY: 0,
                    draw: function(canvas,e,game){
                        if(e.mX != 0) {
                            e.x += e.mX * - 1; 
                            e.mX = 0;
                        }
                        canvas.drawImage(e.img,e.ix,e.iy,e.iw,e.ih,e.x * game.config.scale,e.y * game.config.scale,e.w * game.config.scale,e.h * game.config.scale);
                    },
                    update: function(evts,e,game) {
                        if(e.mX != 0) {
                            e.dirty = true;
                        }
                    }

                }
                map.entities.push(ent);
                game.addEntity(ent);
            }
        }

        map.tiles = tiles;
        map.objects = object;

        for(var i=0; i< map.objects.objects.length;i++) {
            map.objects.objects[i].toX = map.objects.objects[i].x;
            map.objects.objects[i].toY = map.objects.objects[i].y;
            map.objects.objects[i].x -= mX;
        }

        game.tiled.map = map;

        return map;
    };

    game.on("beforeDraw",function(layers){
        /*
        if(game.tiled.map && game.tiled.map.entities.filter(function(e){ return e.dirty}).length >= 1) {
            layers[1].canvas.clearRect(0,0,layers[1].canvas.width,layers[1].canvas.height);
        }
        */
    });

    game.tiled.redo = function(x) {
        for(var i=0;i<game.tiled.map.entities.length;i++) {
            game.tiled.map.entities[i].dirty = true; 
        }
    };

    game.tiled.center = function(x) {
        for(var i=0;i<game.tiled.map.entities.length;i++) {
            game.tiled.map.entities[i].mX = x; 
        }
        for(var i=0;i<game.tiled.map.objects.objects.length;i++) {
            game.tiled.map.objects.objects[i].x -= x/2  ;
        }
    };

    game.tiled.intersects = function(x1, y1, w1, h1, x2, y2, w2, h2) {
        if (w2 !== Infinity && w1 !== Infinity) {
            w2 += x2;
            w1 += x1;
            if (isNaN(w1) || isNaN(w2) || x2 > w1 || x1 > w2) return false;
        }
        if (y2 !== Infinity && h1 !== Infinity) {
            h2 += y2;
            h1 += y1;
            if (isNaN(h1) || isNaN(y2) || y2 > h1 || y1 > h2) return false;
        }
        return true;
    };

    game.tiled.getObj = function(name) {
        for(var i in game.tiled.map.objects.objects) {
            if(game.tiled.map.objects.objects[i].name == name) return game.tiled.map.objects.objects[i];
        }
    };

    game.tiled.getObjsByType = function(type) {
    };

    game.tiled.objectAt = function(x,y,X,Y) {
        for(var i=0;i<game.tiled.map.objects.objects.length;i++) {
            var o = game.tiled.map.objects.objects[i];
            var s = game.tiled.map.tilewidth;
            if(game.tiled.intersects(x,y,X-x,Y-y,o.x,o.y,s,s)) {
                return o;
            }
        }
        return false;
    };

    game.tiled.tileAt = function(x,y,X,Y) {
        for(var i=0;i<game.tiled.map.entities.length;i++) {
            var e = game.tiled.map.entities[i];
            if(game.tiled.intersects(x,y,X-x,Y-y,e.x,e.y,e.s,e.s)) {
                return e;
            }
        }
        return false;
    };

    return  game.tiled;
});

