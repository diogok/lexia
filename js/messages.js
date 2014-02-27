
define(["game"],"messages",function(modules) {
    var game = modules.game;

    game.messages = [];

    game.utils.showMessage = function(msg,timeout) {
        game.messages.push(msg);
        var time = timeout || 3000;
        setTimeout(function() {
            for(var i in game.messages) {
                if(game.messages[i] == msg) {
                    delete game.messages[i];
                }
            }
            game.messages = game.messages.filter(function(m) { return typeof m != 'undefined'});
        },time);
    };

    game.on("afterRun",function(){
        game.addEntity({layer:99});
    });

    game.on("afterDraw",function(layers){
        var canvas = layers[99].canvas;
        canvas.clearRect(0,0,canvas.width,canvas.height);
        for(var i=0;i<game.messages.length && i < 5;i++) {
            var w = canvas.width - 20 ;
            var h = 22;
            var x = 10 ;
            var y = canvas.height - (30 * ( i + 1 ));
            canvas.beginPath();
            canvas.rect(x,y,w,h);
            canvas.fillStyle = 'rgba(0,0,0,0.8)';
            canvas.fill();
            canvas.lineWidth = 1 ;
            canvas.strokeStyle = 'black';
            canvas.stroke();
            canvas.fillStyle = "green";
            canvas.font = "bold 16px sans-serif";
            canvas.fillText(game.messages[i], x + 4, y + 16 );
        }
    });

    return game.utils.showMessage;

});
