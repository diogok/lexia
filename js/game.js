
Game = (function(){
    var game = {
        layers: [],
        updateInterval: null,
        drawRequest: null,
        events: {},
        entities: [],
        utils: {},
        plugins: {},
        config: {},
        listeners: {},
        done: false,
        drawInterval: 1000/61,
        updateInterval: 1000/31,
        lastDraw: 0,
        debug: {fps:0,lastDraw:0}
    };

    game.stop =function(){
        setTimeout(function(){
            clearInterval(game.updateInterval);
            game.updateInterval=null;
            window.cancelAnimationFrame(game.drawRequest);
            game.drawRequest=null;
        },1000);
    };

    game.winGame = function() {
        game.over("win",[]);
        game.stop();
    };

    game.gameOver = function() {
        game.over("lost",[])
        game.stop();
    };

    game.on = function(evt,fun){
        if(!fun) return game.listeners[evt] || [];
        if(!game.listeners[evt]) game.listeners[evt] = [fun]; 
        else game.listeners[evt].push(fun);
    };

    game.over = function(evt,args) {
        for(var i=0; i < game.on(evt).length; i++){
            game.on(evt)[i].apply(game,args.concat([game]));
        }
    };

    game.newCanvas = function(num) {
        game.layers[num] = {};
        game.layers[num].entities = [];
        game.layers[num].canvasEl = document.createElement('canvas');
        game.layers[num].canvasEl.style.position = 'absolute';
        game.layers[num].canvasEl.style.background = 'transparent';
        game.layers[num].canvasEl.style.zIndex = num ;
        game.canvasEl.appendChild(game.layers[num].canvasEl);
        game.layers[num].canvas = game.layers[num].canvasEl.getContext('2d');
        game.layers[num].canvas.width = game.config.width;
        game.layers[num].canvas.height = game.config.height;
        game.layers[num].canvasEl.setAttribute("width",game.config.width);
        game.layers[num].canvasEl.setAttribute("height",game.config.height);
        game.layers[num].canvasEl.addEventListener('click',function(evt) {
            game.events.click = {evt: evt};
            game.over('onClick',[game.events.click]);
        },false);
    };

    game.addEntity = function(entity) {
        entity.listeners = {}
        entity.on = function(evt,fun) {
            if(!fun) return entity.listeners[evt] || [];
            if(!entity.listeners[evt]) entity.listeners[evt] = [fun]; 
            else entity.listeners[evt].push(fun);
        };
        entity.over = function(evt,args) {
            for(var i=0; i < entity.on(evt).length; i++){
                entity.on(evt)[i].apply(entity,args);
            }
        };
        entity.game = game;
        if(typeof entity.dirty == 'undefined') entity.dirty = true;
        if(typeof entity.layer == 'undefined') entity.layer = 0;
        if(typeof game.layers[entity.layer] == 'undefined') game.newCanvas(entity.layer);
        game.over('beforeAddEntity',[entity]);
        game.entities.push(entity);
        game.layers[entity.layer].entities.push(entity);
        game.over('afterAddEntity',[entity]);
    };

    game.removeEntity = function(entity) {
        game.over('beforeRemoveEntity',[entity]);
        var entities = game.entities.slice();
        var max = entities.length;
        for(var i =0;i<max;i++) {
            if(entities[i].name == entity.name) {
                delete entities[i];
            }
        }
        game.entities = entities.filter(function(e) { return typeof e != 'undefined'}) ;
        game.over('afterRemoveEntity',[entity]);
    };

    game.getEntity = function(name) {
        var entities = game.entities.slice();
        var max = entities.length;
        for(var i =0;i<max;i++) {
            if(entities[i].name == name) {
                return entities[i];
            }
        }
    };

    game.clear = function(i) {
        if(typeof i != 'undefined') {
            if(game.layers[i].canvas.clearRect) {
                game.layers[i].canvas.clearRect(0,0,game.layers[i].canvas.width,game.layers[i].canvas.height);
                game.entities = [];
            }
        } else {
            for(var i in game.layers) {
                game.clear(i);
            }
        }
    };

    game.draw = function() {
        game.drawRequest = requestAnimationFrame(function(){
            game.draw()
        });
        //if((Date.now() - game.debug.lastDraw) < game.drawInterval) return;
        game.debug.fps = 1000 / (Date.now() - game.debug.lastDraw);
        game.debug.lastDraw = Date.now();
        game.over('beforeDraw',[game.layers]);
        var entities = game.entities.filter(function(e) { return e.dirty; });
        for(var i=0;i<entities.length;i++) {
            game.canvas = game.layers[entities[i].layer].canvas;
            entities[i].over('beforeDraw',[game.layers[entities[i].layer].canvas,entities[i],game]);
            if(entities[i].draw) {
                entities[i].draw(game.layers[entities[i].layer].canvas,entities[i],game);
            }
            game.entities[i].dirty = false;
            entities[i].over('afterDraw',[game.layers,entities[i],game]);
        }
        game.over('afterDraw',[game.layers]);
    };

    game.update = function() {
        game.over('beforeUpdate',[game.events]);
        game.debug.ups = 1000 / (Date.now() - game.debug.lastUpdate);
        game.debug.lastUpdate = Date.now();
        var entities = game.entities.slice();
        for(var i=0;i<entities.length;i++) {
            game.canvas = game.layers[entities[i].layer].canvas;
            entities[i].over('beforeUpdate',[game.events,entities[i],game]);
            if(!entities[i]) continue;
            if(entities[i].update){
                entities[i].update(game.events,entities[i],game);
            }
            if(!entities[i]) continue;
            entities[i].over('afterUpdate',[game.events,entities[i],game]);
        }
        game.over('afterUpdate',[game.events]);
        game.events = {};
    };

    game.bindEvents = function() {
        window.addEventListener('keydown',function(evt) {
            game.events.keydown = {evt:evt};
            game.events.keydown[evt.keyCode] = true;
            game.over('onKeyDown',[game.events.keydown]);
        });
        window.addEventListener('keypress',function(evt) {
            game.events.keypress = {evt:evt};
            game.events.keypress[evt.charCode] = true;
            game.over('onKeyPress',[game.events.keypress]);
        });
        window.addEventListener('keyup',function(evt) {
            game.events.keyup = {};
            game.events.keyup[evt.keyCode] = true;
            game.over('onKeyUp',[game.events.keyup]);
        });
    };

    game.run = function(config) {
        game.over('beforeRun',[config]);
        game.canvasEl = document.getElementById(config.id);
        game.canvasEl.setAttribute("width",config.width);
        game.canvasEl.setAttribute("height",config.height);
        game.canvasEl.style.width = config.width+"px";
        game.canvasEl.style.height = config.height+"px";
        if(config.entities) {
            for(var i in config.entities) {
                game.addEntity(config.entities[i]);
            }
        }
        game.bindEvents();
        game.config = config;
        game.config.game = game;
        game.over('afterRun',[config]);

        if(typeof config.fps != "undefined") game.drawInterval = 1000 / (config.fps + 2);
        if(typeof config.ups != "undefined") game.updateInterval = 1000 / (config.ups + 2);

        game.updateInterval = setInterval(function() {
            game.update();
        },game.updateInterval);
        game.drawRequest = requestAnimationFrame(function(){
            game.draw()
        });
        game.done =true;
    };

    return game;
})();

// Loader below

var _defined = {},_src = "";

var scripts = document.getElementsByTagName("script");
for(var i in scripts) {
    if(typeof scripts[i] == "object") {
        var src = scripts[i].getAttribute("src"), rel = scripts[i].getAttribute("rel");
        if(rel != null && src == rel + "game.js") {
            if(rel.lastIndexOf("/") != rel.length - 1) {
                rel += "/";
            }
            _src = rel;
        }
    }
}

function require(modules,fn,orig) {
    if(typeof orig != "object") orig = modules;
    if(modules.length == 0) {
        var ok = true;
        for(var i in orig) if(typeof _defined[orig[i]] == "undefined") ok=false;
        if(ok) fn(_defined); 
        else setTimeout(function(){ require([],fn,orig); },100);
        return;
    }
    var curr = modules[0];
    if(_defined[curr]) {
        require(modules.slice(1),fn,orig);
    } else {
        var script = document.createElement("script");
        script.setAttribute("src",_src+curr+".js");
        script.onload = function() { 
            require(modules.slice(1),fn,orig);
        };
        document.body.appendChild(script);
    }
};

function define(deps,name,fn) {
    require(deps,function(mods) {
        _defined[name] = fn(mods);
    });
};

define([],"game",function(){
    return Game;
});

