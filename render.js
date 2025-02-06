var coolcounter = 0;
var player = {x: 21, y:30*10, velx: 0, vely: 0};

function renderObjectAny(context, object) {

    var objectRenderX = object.x-camera.x;
    var objectRenderY = object.y-camera.y;
    switch (object.type)
    {
        case 0: //exit teleporter
        {
            context.drawImage(objectPNG,
                90, 150-30*object.state.activated,
                90, 30,
                objectRenderX,objectRenderY,
                90,30);
                
            break;
        }
        case 1:
        {
            context.drawImage(objectPNG,
                120,90,
                30,30,
                objectRenderX,objectRenderY,
                30,30);
            context.fillStyle = object.state.color;
            context.fillRect(objectRenderX+11, objectRenderY+11, 8, 8);

            break;
        }
        case 2:
        {
            context.drawImage(objectPNG,
                0,120,
                90,60,
                objectRenderX,objectRenderY,
                90,60);
            context.fillStyle = object.state.color;
            context.fillRect(objectRenderX+4, objectRenderY+24, 82, 5);

            break;
        }
        case 3:
        {
            context.drawImage(objectPNG,
                90+30*object.state.on,0,
                30,30,
                objectRenderX,objectRenderY,
                30,30);
            context.fillStyle = object.state.color;
            context.fillRect(objectRenderX+11, objectRenderY+2, 8, 4);

            break;
        }
    }
}

function updateCamera() {
    camera.x = Math.max(0,Math.min(player.x+10-300,levelStats.width* 30-600));
    camera.y = Math.max(0,Math.min(player.y+20-225,levelStats.height*30-450));
}

function editorCameraControls()
{
    var down = 5*keysDown.downArrow -  5*keysDown.upArrow;
    var right= 5*keysDown.rightArrow - 5*keysDown.leftArrow;

    camera.x+=right;
    camera.y+=down ;
}

function renderConnections(context)
{
    for (var i = 0; i < connections.length; i++)
    {
        var conn = connections[i];

        var input; var output;

        for (var j = 0; j < objects.length; j++)
        {
            if (objects[j].name == conn.input)
            {
                input = objects[j];
            }

            if (objects[j].name == conn.output)
            {
                output = objects[j];
            }
        }

        //console.assert(input); console.assert(output);
        //console.log(input.x + "," + input.y + ",::::G," + output.x + "," + output.y);

        var inputx = input.x-camera.x
        var inputy = input.y-camera.y
        var outputx=output.x-camera.x
        var outputy=output.y-camera.y

        ctx.strokeStyle = "#FF0000";

        ctx.beginPath();
        ctx.moveTo(inputx,  inputy );
        ctx.quadraticCurveTo(
            (inputx+outputx)/2, Math.max(inputy, outputy)+1,
            outputx,outputy);
        //ctx.lineTo(outputx, outputy);
        ctx.stroke();
    }
}

function render() {

    updateCollisions();

    ctx.clearRect(0, 0, 800, 600);

    if (!levelEditing) {
        updateCamera();
    } else {
        editorCameraControls();
    }

    for (var j = 0; j < levelStats.height; j++) {
        for (var i = 0; i < levelStats.width; i++)
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
        var object = objects[i];
        renderObjectAny(ctx,object);
    }

    ctx.fillStyle = "black";
    
    if (!levelEditing) {
        ctx.fillRect(player.x-camera.x,player.y-camera.y,20,40);
    
        playerPhysics();

        tickConnections();
        
        handleObjects();
    } else {
    
        if ((cursor.type == 2 || cursor.type == 4) && cursor.id >= objects.length)
        {
            cursor.id = -1;
        }

        if ((cursor.type == 2 || cursor.type == 4) && cursor.id != -1)
        {
            var object = objects[cursor.id];
            ctx.strokeStyle = "red";
            ctx.beginPath();
            ctx.rect(object.x-camera.x, object.y-camera.y, objectSizes[object.type][0], objectSizes[object.type][1]);
            ctx.stroke();
        }
    }

    renderConnections(ctx);

}


setInterval(render, 25);

initGameMode();

function testConnections(a, b)
{
    objects[0].name = a;
    objects[1].name = b;

    connections.push({input: a, output: b});
}