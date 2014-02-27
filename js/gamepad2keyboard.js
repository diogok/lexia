
define(["game","gamepad"],"gamepad2keyboard",function(modules){
    var game = modules.game;

    game.gamepad2keyboard = {
        'up':87,
        'left':65,
        'right':68,
        'a':32
    };

    game.on("beforeUpdate",function(evts,game) {
        if(evts.gamepads) {
            if(evts.gamepads[0]) {
                var pad = evts.gamepads[0];
                if(typeof evts.keydown == 'undefined') evts.keydown = {};
                if(typeof evts.keyup == 'undefined') evts.keyup = {};
                if(typeof evts.keypress == 'undefined') evts.keypress = {};
                for(var p in game.gamepad2keyboard) {
                    var k = game.gamepad2keyboard[p];
                    if(pad.pressed[p]) {
                        evts.keydown[k] = true;
                        evts.keypress[k] = true;
                    } else {
                        evts.keyup[k] = true;
                    }
                }
            }
        }
    });

    return game.gamepad2keyboard;
});

