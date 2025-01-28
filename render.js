var coolcounter = 0;
var player = {x: 21, y:30*10, velx: 0, vely: 0};

function renderObjectAny(context, object) {
    switch (object.type)
    {
        case 0: //exit teleporter
        {
            context.drawImage(objectPNG,
                90, 150-30*object.state.activated,
                90, 30,
                object.x,object.y,
                90,30);
                
            break;
        }
        case 1:
        {
            context.drawImage(objectPNG,
                120,90,
                30,30,
                object.x,object.y,
                30,30);
            context.fillStyle = object.state.color;
            context.fillRect(object.x+11, object.y+11, 8, 8);

            break;
        }
    }
}

function render() {

    updateCollisions();

    for (var j = 0; j < 15; j++) {
        for (var i = 0; i < 20; i++)
        {
            ctx.drawImage(worldPNG,
                30*((level[j][i])%12),
                30*Math.floor((level[j][i])/12),
                30,30,
                30*i-camera.x, 30*j-camera.y,
                30,30);
        }
    }

    for (var i = 0; i < objects.length; i++)
    {
        var object = objects[i]
        renderObjectAny(ctx,object);
    }

    ctx.fillStyle = "black";

    ctx.fillRect(player.x,player.y,20,40);

    if (cursor.type == 2 && cursor.id != -1)
    {
        ctx.beginPath();
        ctx.rect(objects[i].x, objects[i].y, 30, 30);
        ctx.stroke();
    }

    playerPhysics();

    handleObjects();
}

setInterval(render, 25);