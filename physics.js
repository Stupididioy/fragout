var hitBoxes = [];

//types of collision

// 0: wall/floor/basic whatever
// 1: hurt
// 2: TBD

var playerGrabbedObject = -1;
function updateCollisions() {
    hitBoxes = [];
    for (var j = 0; j < levelStats.height; j++)
    {
        for (var i = 0; i < levelStats.width; i++)
        {
            var tile = level[j][i];
            if (((Math.floor(tile/6)) % 2)) {
                hitBoxes.push({x1:i*30,x2:i*30+30,y1:j*30,y2:j*30+30,type:-1});
                continue;
            }
            continue;
        }
    }

    for (var i = 0; i < objects.length; i++)
    {
        var object = objects[i];
        
        if (i == playerGrabbedObject) { continue; }

        switch (object.type)
        {
            case 0: // exit teleporter
                {
                    hitBoxes.push({x1:object.x+8, x2:object.x+82, y1: object.y+23, y2: object.y+30, type: i})
                    break;
                }
            case 1: // cube
                {
                    hitBoxes.push({x1:object.x, x2:object.x+30, y1: object.y, y2: object.y+30, type: i})
                    break;
                }
            case 2: // cube dropper
                {
                    hitBoxes.push({x1: object.x, x2: object.x+90, y1: object.y, y2: object.y+60, type: i});
                    break;
                }
            case 3: // cube scanner
                {
                    hitBoxes.push({x1: object.x, x2: object.x+30, y1: object.y, y2: object.y+12, type: i});
                    break;
                }
            case 4: // laser catcher & reciever
            case 5: // SWITCH CASE FALLTHROUGH FTW!!!
                {
                    hitBoxes.push({
                        x1: object.x + (object.state.direction == 1)*20,
                        x2: object.x + 30 - (object.state.direction == 3)*20,
                        y1: object.y + 20*(object.state.direction == 2),
                        y2: object.y + 30 - 20*(object.state.direction == 0),
                        type: i
                    });
                    break;
                }
            case 6: // big bomb
                {
                    if (!object.state.blewUp)
                    {
                        hitBoxes.push({
                            x1: object.x, x2: object.x+60,
                            y1: object.y+15, y2: object.y+90,type: i
                        });
                    }
                    break;
                }
            case 7: // door
                {
                    hitBoxes.push({x1: object.x+10, x2: object.x + 20, y1: object.y, y2: object.y+90-object.state.meter, type: i});
                    break;
                }
                // bouncy goo has no collisions
            case 9: // goo pipe
                {
                    hitBoxes.push({x1: object.x, x2: object.x+90, y1: object.y, y2: object.y+30, type: i});
                    break;
                }
        }
    }
}

function testCollision(a, b) {

    let p1 = a.x1 < b.x2;
    let p2 = a.x2 > b.x1;
    let p3 = a.y1 < b.y2;
    let p4 = a.y2 > b.y1;

    return (p1 && p2 && p3 && p4);
}

function touchingGround(a) {
    let collisions = [];

    for (var i = 0; i < hitBoxes.length; i++) {
        let b = hitBoxes[i];
        if (testCollision(a,b)) {
            collisions.push(i);
        }
    }
    return collisions;
}

function playerPhysics() {
    let tri = 5*(keysDown.rightArrow-keysDown.leftArrow);

    player.velx = tri-Math.sign(tri)*(player.velx-tri)/2;

    player.velx = Math.min(30,Math.max(player.velx,-30))
    player.vely = Math.min(30,Math.max(player.vely,-30))

    player.vely++;

    player.x+=player.velx;
    if (touchingGround(getPlayerCollision()).length) {
        player.x-=player.velx;
        player.velx = 0;
    }

    player.y+=player.vely;
    var bounce = 0;
    for (var i = 0; i < objects.length; i++)
    {
        var object = objects[i];
        if (object.type == 8 && player.vely > 5)
        {
            if (((object.x-15) < player.x) && ((object.x+105-20) > player.x) &&
                ((object.y-41-player.vely < player.y)) && (object.y > player.y))
            {
                player.vely*=-1;
                bounce = 1;
            }

        }
    }
    if (touchingGround(getPlayerCollision()).length) {
        player.y-=(player.vely)*(1-2*bounce);
        player.vely = 0;
    }

    if (touchingGround({x1: player.x, x2: player.x+20, y1: player.y+35, y2: player.y+45}).length && keysDown.upArrow)
    {
        player.vely = -10;
    }

    if (playerGrabbedObject != -1) {
        var disVec = {x: cursor.x - player.x - 10 + camera.x, y: cursor.y - player.y - 20 + camera.y};
    
        var disLength = Math.sqrt(Math.pow(disVec.x,2)+Math.pow(disVec.y,2)); //disVec modulus
    
        disVec.x = disVec.x/disLength*64;
        disVec.y = disVec.y/disLength*64;
        var targetVec = {x: player.x+10+disVec.x, y: player.y+8+disVec.y};

        var object = objects[playerGrabbedObject];

        object.state.velx = (targetVec.x-object.x)/2;
        object.state.vely = (targetVec.y-object.y)/2;
    }

    if (player.y > 30*levelStats.height)
    {
        loadLevel(currentLevel);
        console.log(mainObjectCount);
        initGameMode();
    }
}

function getPlayerCollision() {
    return {x1: player.x, x2: player.x+20, y1: player.y, y2:player.y+40};
}

var explodableWalls = [34];
var explosionResult = {34: 24};
function handleObjects()
{
    for (var i = 0; i < objects.length; i++) // pre processing loop cause laser catchers are evil
    {
        var object = objects[i];
        switch (object.type)
        {
            case 5: // laser catcher
            {
                object.state.on = false; // it's OFF!!
            }
        }
    }
    for (var i = 0; i < objects.length; i++)
    {
        var object = objects[i];

        switch (object.type)
        {
            case 0: // teleporter
                {
                    if (object.state.activated && 
                        testCollision(getPlayerCollision(),
                            {x1:object.x+8,x2:object.x+82,y1:object.y,y2:object.y+30}))
                    {
                
                        loadLevel(object.state.exit);
                        initGameMode();

                        player = {x: 35, y:-50, velx: 0, vely: 0};
                    }

                    if (testCollision(getPlayerCollision(),
                        {x1:object.x+2, x2:object.x+88,y1:object.y+25,y2:object.y+30}))
                    {
                        player.y = object.y + 23 - 40;
                        player.vely = 0;
                    }

                    break;
                }
            case 1: // cube
                {
                    if (object.state.colTimer <= 0)
                    {
                        handleObjFalling(object, i);
                        object.state.grabbable = true;
                    } else {
                        object.state.colTimer--;
                        object.state.grabbable = false;

                        object.state.vely++;
                        object.y += object.state.vely;
                    }
                    break;
                }
            case 2: // cube spawner
                {
                    var cube = objects[object.state.cubeIndex];
                    if (cube.y > levelStats.height*30+30) // cube is below map
                    {
                        cube.x = object.x+30;
                        cube.y = object.y+29;
                        cube.state.velx = 0;
                        cube.state.vely = -12;
                        cube.state.colTimer = 13;
                    }
                }
            case 3: // cube scanner
                {
                    var col = {x1: object.x+10, x2: object.x + 20, y1: object.y, y2: object.y + 30 * object.state.range};
                    object.state.on = false;
                    for (var j = 0; j < objects.length; j++)
                    {
                        var object1 = objects[j];
                        if ((object1.type == 1) && (object.state.color == object1.state.color))
                        {
                            if (testCollision(col, {x1: object1.x, x2: object1.x+30, y1: object1.y, y2: object1.y+30}))
                            {
                                object.state.on = true;
                            }
                        }
                    }
                }
            case 4: // laser shooter
                {
                    if (object.state.activated)
                    {
                        handleLaser(object);
                    }
                    break;
                }
                //laser receiver doesnt do anything lol
            case 6: // big bomb
                {
                    if (object.state.primed)
                    {
                        var baseX = object.x + 30;
                        var baseY = object.y + 45;
                        for (var j = 0; j < levelStats.height; j++)
                        {
                            for (var i = 0; i < levelStats.width; i++)
                            {
                                if (explodableWalls.includes(level[j][i]))
                                {
                                    if (Math.sqrt(
                                    Math.pow(i*30+15-baseX, 2) + 
                                    Math.pow(j*30+15-baseY, 2)) < 70)
                                    {
                                        level[j][i] = explosionResult[level[j][i]];
                                    }
                                }
                            }
                        }
                        object.state.primed = false;
                        object.state.blewUp = true;

                        for (var i = 0; i < 20; i++)
                        {
                            var degree = Math.random();
                            var dx = 5*Math.cos(degree*2*3.14159)*(1-Math.pow(Math.random(),2));
                            var dy = 5*Math.sin(degree*2*3.14159)*(1-Math.pow(Math.random(),2));

                            var px = object.x+30;
                            var py = object.y+45;
                            
                            object.state.particles[i] = {dx: dx, dy: dy, x: px, y: py, timer: 30};
                        }

                        object.state.particlesDone = false;
                        object.x = object.y = -100;
                    }

                    if (!object.state.particlesDone)
                    {
                        handleBombParticles(object);
                        // for (var i = 0; i < 20; i++)
                    }

                    break;
                }
            case 7: // door
                {
                    var x = object.state.meter;
                    object.state.meter = x + 5*Math.sign(90*object.state.activated - x);
                    break;
                }
                // bouncy goo dont do nothin'
            case 9: // goo pipe
                {
                    if (object.state.activated && object.state.timer == 0)
                    {
                        object.state.timer = 6;

                        object.state.goo[object.state.goo.length] = {x: object.x, y: object.y+30};
                    }

                    object.state.timer -= (object.state.timer) ? 1 : 0;

                    if (object.state.goo.length)
                    {
                        for (var i = 0; i < object.state.goo.length; i++)
                        {
                            var goo = object.state.goo[i];
                            goo.y+=5;

                            var gooCol = {x1: goo.x+15, x2: goo.x+90-15, y1: goo.y, y2: goo.y+30};
                            if (goo.y > 30 * levelStats.height || touchingGround(gooCol).length)
                            {
                                object.state.goo.splice(i,1);
                                i--;
                                continue;
                            }

                            if (testCollision(gooCol, getPlayerCollision()))
                            {
                                loadLevel(currentLevel);
                                console.log(mainObjectCount);
                                initGameMode(); 
                            }
                        }
                        console.log(object.state.goo);
                    }
                    break;
                }
        }
    }
}

function handleObjFalling(object, i) //object.state must have velx, vely, 
                                       // and sizeX, sizeY variables
                                       // i is index of this object in objects array
{
    let getCollision = function (object)
    { return {
        x1: object.x,
        x2: object.x+object.state.sizeX,
        y1: object.y,
        y2: object.y+object.state.sizeY} };

    object.state.velx = Math.min(15,Math.max(object.state.velx,-15))
    object.state.vely = Math.min(15,Math.max(object.state.vely,-15))
    object.state.vely++;

    var collisionThreshold = (playerGrabbedObject != i) ? 1 : 0
    
    function colliding() {
        if (collisionThreshold)
        {
            return (touchingGround(getCollision(object)).length>collisionThreshold) || testCollision(getCollision(object), getPlayerCollision());
        }
        else {
            return (touchingGround(getCollision(object)).length>collisionThreshold);
        }
    }
    object.x+=object.state.velx;
    if (colliding())
    {
        object.x-=object.state.velx;
        object.state.velx = 0;
    }

    object.y+=object.state.vely;
    if (colliding())
    {
        object.y-=object.state.vely;
        object.state.vely = 0;
    }

    var collision1 = {x1: object.x+1, x2: object.x+object.state.sizeX-1,
        y1: object.y+object.state.sizeY-1, y2: object.y+object.state.sizeY+1};

    if (touchingGround(collision1).length)
    {
        object.state.velx /= 2;
    }
}

function pressE() 
{
    if (playerGrabbedObject != -1) {
        playerGrabbedObject = -1;
        return;
    }
    // above code says, if player holding object, drop it

    var disVec = {x: cursor.x - player.x - 10 + camera.x, y: cursor.y - player.y - 20 + camera.y};

    var disLength = Math.sqrt(Math.pow(disVec.x,2)+Math.pow(disVec.y,2)); //disVec modulus

    disVec.x = disVec.x/disLength*3;
    disVec.y = disVec.y/disLength*3;

    var loopDone = false;
    var d = 0;
    for (; ((d < 64) && !loopDone); d++)
    {
        var curCheckLocation = {x: player.x+10+d*disVec.x, y: player.y+20+d*disVec.y};

        if (touchingGround({x1: curCheckLocation, x2: curCheckLocation+1, y1: curCheckLocation, y2: curCheckLocation+1}).length)
        {
            break;
        } // if touch wall, stop now before grabbing stuff through walls is allowed!!!!! (i hope)

        for (var i = 0; i < objects.length; i++)
        {
            var object = objects[i];

            if (
                (object.x+objectSizes[object.type][0] > curCheckLocation.x) && (object.x < curCheckLocation.x) &&
                (object.y+objectSizes[object.type][1] > curCheckLocation.y) && (object.y < curCheckLocation.y)
            ) {
                if (1 == object.type) {
                    if (object.state.grabbable) {
                        playerGrabbedObject = i;
                        loopDone = true;
                        break;
                    } else {
                        loopDone = true;
                        break;
                    }
                } else {
                    loopDone = true;
                    break;
                }
            }
        }
    }
}

function tickConnections()
{
    var objectConnectionAmounts = [];
    var objectConnectionThresholds = [];
    var objectSortedByName = [];
    for (var i = 0; i < objects.length; i++)
    {
        objectConnectionAmounts.push(0);
        objectConnectionThresholds.push(0);
        if (objects[i].name)
        {
            objectSortedByName[objects[i].name] = i;
        }
    }


    for (var i = 0; i < connections.length; i++)
    {
        var conn = connections[i]; //conn = connection but abbr.
        var input  = objects[objectSortedByName[conn.input]];

        if (input.state.on)
        {
            objectConnectionAmounts[objectSortedByName[conn.output]] += input.state.on;
        }

        objectConnectionThresholds[objectSortedByName[conn.output]] += 1;
    }

    for (var i = 0; i < objects.length; i++)
    {
        if (objectConnectionThresholds[i])
        {
            objects[i].state.activated = (objectConnectionAmounts[i] == objectConnectionThresholds[i])
                ? true : false;
        }
    }
}

function handleLaser(object)
{
    ctx.fillStyle = "#FF0000"
    var laser = {x: object.x+15, y: object.y+15, dir: object.state.direction};
    var dx = -Math.sin(Math.PI*laser.dir/2)*2;
    var dy = Math.cos(Math.PI*laser.dir/2)*2;

    var length = 0;
    var done = false;
    while ((length < 1500) && !done)
    {
        ctx.fillRect(laser.x-camera.x, laser.y-camera.y, 2, 2);

        laser.x += dx;
        laser.y += dy;

        var colList = touchingGround ({x1: laser.x, x2: laser.x + 2,
            y1: laser.y, y2: laser.y + 2});
        for (var j = 0; j < colList.length; j++)
        {
            var col = hitBoxes[colList[j]];
            var object2 = objects[col.type];

            if (col.type == -1) // if touching a wall or w/e
            {
                done = true;
                break;
            }

            if (object2.type == 5) // got caught by laser catcher
            {
                done = true;
                object2.state.on = true;
                break;
            } else if (object2.type == 1) {  //touched any cube
                var x = laser.dir;
                switch (Number(object2.state.type))
                {
                    case 0:
                        done = true;
                        break;
                    case 1:
                        laser.dir = (1-x)%4;
                        dx = -Math.sin(Math.PI*laser.dir/2)*2;
                        dy = Math.cos(Math.PI*laser.dir/2)*2;
                        laser.x = 8*dx+15+object2.x;
                        laser.y = 8*dy+15+object2.y;
                        break;
                    case 2:
                        laser.dir = 3-x;
                        dx = -Math.sin(Math.PI*laser.dir/2)*2;
                        dy = Math.cos(Math.PI*laser.dir/2)*2;
                        laser.x = 8*dx+15+object2.x;
                        laser.y = 8*dy+15+object2.y;
                        break;
                }
            } else if (object2.type == 6) //lighting a bomb!!!
            {
                object2.state.primed = true;
            }
            else {  // touched any other object type
                done = true;
                break;
            }
        }

        if (laser.x > levelStats.width * 30 && laser.x < 0 && laser.y > levelStats.height * 30 && laser.y < 0) // if touching a wall or w/e
        {
            done = true;
            break;
        }
        length++;
    }

}

function handleBombParticles(object)
{
    for (var i = 0; i < 20; i++)
    {
        if (object.state.particles) {
            var p = object.state.particles[i];
    
            p.dx *= 15/16;
            p.dy *= 15/16;
    
            p.timer--;
    
            if (p.timer == 0)
            {
                object.state.particlesDone = true;
                break;
            }
    
            //var orange = 20-Math.pow(p.timer, 5)/160000;

            var yellowMult = (30-p.timer)/30;
            ctx.strokeStyle = "rgb(" + 255 + "," + 255*yellowMult + ",0)";
            ctx.fillStyle =   "rgb(" + 255 + "," + 255*yellowMult + ",0)";
            ctx.lineWidth = 3;
    
            ctx.beginPath();
    
            ctx.moveTo(p.x - camera.x, p.y - camera.y);
    
            p.x += p.dx;
            p.y += p.dy;
    
            ctx.arc(p.x-camera.x, p.y-camera.y, 1, 0, 2*Math.PI);
    
            ctx.stroke();
        }
    }
}