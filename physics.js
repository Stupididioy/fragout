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
            if (tile > 5) {
                hitBoxes.push({x1:i*30,x2:i*30+30,y1:j*30,y2:j*30+30,type:0});
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
            case 0:
                {
                    hitBoxes.push({x1:object.x+8, x2:object.x+82, y1: object.y+23, y2: object.y+30, type: 0})
                    break;
                }
            case 1:
                {
                    hitBoxes.push({x1:object.x, x2:object.x+30, y1: object.y, y2: object.y+30, type: 0})
                    break;
                }
            case 2:
                {
                    hitBoxes.push({x1: object.x, x2: object.x+90, y1: object.y, y2: object.y+60, type: 0});
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
    if (touchingGround(getPlayerCollision()).length) {
        player.y-=player.vely;
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
}

function getPlayerCollision() {
    return {x1: player.x, x2: player.x+20, y1: player.y, y2:player.y+40};
}

function handleObjects()
{
    for (var i = 0; i < objects.length; i++)
    {
        var object = objects[i];

        switch (object.type)
        {
            case 0:
                {
                    if (object.state.activated && 
                        testCollision(getPlayerCollision(),
                            {x1:object.x+8,x2:object.x+82,y1:object.y,y2:object.y+30}))
                    {
                
                        loadLevel(object.state.exit);
                    }

                    if (testCollision(getPlayerCollision(),
                        {x1:object.x+2, x2:object.x+88,y1:object.y+25,y2:object.y+30}))
                    {
                        player.y = object.y + 23 - 40;
                        player.vely = 0;
                    }

                    break;
                }
            case 1:
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
            case 2:
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
    
    object.x+=object.state.velx;
    if (touchingGround(getCollision(object)).length>collisionThreshold)
    {
        object.x-=object.state.velx;
        object.state.velx = 0;
    }

    object.y+=object.state.vely;
    if (touchingGround(getCollision(object)).length>collisionThreshold)
    {
        object.y-=object.state.vely;
        object.state.vely = 0;
    }

    var collision1 = {x1: object.x+1, x2: object.x+object.state.sizeX-1,
        y1: object.y+object.state.sizeY-1, y2: object.y+object.state.sizeY+10};

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

    // dis means displacement, not "this" in a new york accent!!!

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
                if ([1,2,3].includes(object.type)) {
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

    if (d >= 64)
    {
    }
}