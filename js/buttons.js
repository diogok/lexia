
define(["game"],"buttons",function(modules) {
    var game = modules.game;
    var c = 0;

    game.utils.resetButtons = function() {
        c=0;
    };

    game.utils.addButton = function(text,fun) {
        var i = c + 1;
        c++;
        var button = {
            'name':text,
            'type':'button',
            "i": i + 0,
            'layer': 80,
            'draw':function(canvas,e,g) {
                var w=400,h=50,x=canvas.width/2 - 200,y=(65*e.i);
                canvas.beginPath();
                canvas.rect(x,y,w,h);
                canvas.fillStyle = 'grey';
                canvas.fill();
                canvas.strokeStyle = 'black';
                canvas.lineWidth = 3 ;
                canvas.stroke();
                canvas.fillStyle = "green";
                canvas.font = "bold 24px sans-serif";
                canvas.fillText(text, x + 25,y + 35);
            },
            'update': function(events,e,g) {
                if(events.click) {
                    var x = events.click.evt.layerX, y = events.click.evt.layerY;
                    if(   x > (g.canvas.width/2) - 200
                       && x < (g.canvas.width/2) - 200 + 400
                       && y > 65  * e.i
                       && y < 50 + (65 * e.i )) {
                       if(fun() != false){
                           g.removeEntity(e);
                       }
                   }
                }
            }
        };
        game.addEntity(button);
    }

    return game.utils.addButton;
})
