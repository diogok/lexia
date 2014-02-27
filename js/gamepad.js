define(['game'],'gamepad',function(modules) {
    var game = modules.game;

    var getPads = (navigator.webki)

    game.gamepads = [];

    game.padButtonMapping = {
        '17': [
            'a', 'b','x','y','lb','rb','lt','rt',
            'start','xbox','rs','select',
            'up','down','left','right','ls'
        ],
        '11': [
            'a', 'b','x','y','lb','rb',
            'start','xbox','ls','rs','select'
        ]
    }
    ;

    game.on("gamepadConnected",function(pad,game){
        if(typeof pad.timestamp != 'undefined') pad.last = pad.timestamp ;
        game.gamepads[pad.index] = pad;
    });

    game.on("gamepadDisconnected",function(pad,game){
        delete game.gamepads[pad.index];
    });

    game.on("beforeUpdate",function(events,game) {
        events.gamepads = game.gamepads;
        for(var i in events.gamepads) {
            var pad = events.gamepads[i];
            if(typeof pad.timestamp != 'undefined') {
                pad.last = pad.timestamp;
                pad = navigator.webkitGetGamepads()[i];
            }
            pad.pressed = {};
            for(var i in pad.buttons) {
                pad.pressed[game.padButtonMapping[pad.buttons.length][i]] = pad.buttons[i] == 1;
            }
            if(typeof pad.axes != 'undefined') {
                if(pad.axes.length == 4) {
                    pad.leftStick = {
                        'left': pad.axes[0] < 0,
                        'right': pad.axes[0] > 0,
                        'up': pad.axes[1] < 0,
                        'down': pad.axes[1] > 0,
                        'x': pad.axes[0],
                        'y': pad.axes[1]
                    }
                    pad.rightStick = {
                        'left': pad.axes[2] < 0,
                        'right': pad.axes[2] > 0,
                        'up': pad.axes[3] < 0,
                        'down': pad.axes[3] > 0,
                        'x': pad.axes[2],
                        'y': pad.axes[3]
                    }
                    pad.leftTrigger = (pad.pressed.lt?1:-1);
                    pad.rightTrigger = (pad.pressed.rt?1:-1);
                } else if(pad.axes.length == 8) {
                    pad.leftStick = {
                        'left': pad.axes[0] < 0,
                        'right': pad.axes[0] > 0,
                        'up': pad.axes[1] < 0,
                        'down': pad.axes[1] > 0,
                        'x': pad.axes[0],
                        'y': pad.axes[1]
                    }
                    pad.rightStick = {
                        'left': pad.axes[3] < 0,
                        'right': pad.axes[3] > 0,
                        'up': pad.axes[4] < 0,
                        'down': pad.axes[4] > 0,
                        'x': pad.axes[3],
                        'y': pad.axes[4]
                    }
                    pad.leftTrigger = pad.axes[2];
                    pad.pressed.lt = pad.leftTrigger > 0;
                    pad.rightTrigger = pad.axes[5];
                    pad.pressed.rt = pad.rightTrigger > 0;
                    pad.pressed.left = pad.axes[6] < 0;
                    pad.pressed.right = pad.axes[6] > 0;
                    pad.pressed.up = pad.axes[7] < 0;
                    pad.pressed.down = pad.axes[7] > 0;
                }
            }
        }
    });

    window.addEventListener("gamepadconnected", function(e) {
        game.over("gamepadConnected",[e.gamepad]);
    });

    window.addEventListener("gamepaddisconnected", function(e) {
        game.over("gamepadDisconnected",[e.gamepad]);
    });

    game.on("afterRun",function(){
        setInterval(function(){
            var gamepads = [];
            if(navigator.getGamepads) {
                gamepads = navigator.getGamepads();
            } else if(navigator.mozGetGamepads) {
                gamepads = navigator.mozGetGamepads();
            } else if(navigator.webkitGetGamepads) {
                gamepads = navigator.webkitGetGamepads();
            } 

            for (var i = 0; i < gamepads.length; i++) {
                if(typeof gamepads[i] == 'undefined') continue;
                var pad = gamepads[i];
                if(typeof game.gamepads[pad.index] == "undefined") {
                    game.over("gamepadConnected",[pad]);
                }
            }

            for(var idx in game.gamepads) {
                var got =false;
                for (var i = 0; i < gamepads.length; i++) {
                    if(typeof gamepads[i] == 'undefined') continue;
                    if(gamepads[i].index == idx) got=true;
                }
                if(!got) {
                    game.over("gamepadDisconnected",[pad]);
                }
            }
        },1000);
    });

    return game.gamepads;

});

