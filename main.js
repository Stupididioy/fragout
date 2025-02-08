var ctx = document.getElementById("canvas").getContext("2d");

var level = [];

var currentLevel = "";

var objects = [];

var connections = [];

var levelStats = {width: 40, height: 40}

var levelEditing = false;

var camera = {x: 0, y: 0};

for (var j = 0; j < levelStats.height; j++) {
    level.push([]);
    if (j != (levelStats.height - 1)) {
        for (var i = 0; i < levelStats.width; i++) {
            level[j][i] = 1;
        }
    } else {
        for (var i = 0; i < levelStats.width; i++) { level[j][i]=7;}
    }
}

var worldPNG = new Image(360,300);
worldPNG.src = "world.png";
var objectPNG = new Image(1,1);
objectPNG.src = "objects.png";

var keysDown = {rightArrow: false, leftArrow: false, upArrow: false, downArrow: false};

document.addEventListener('keydown', function(event) {
    if (event.key == 'd')
    {
        keysDown.rightArrow = true;
    }
    if (event.key == 'a')
    {
        keysDown.leftArrow = true;
    }
    if (event.key == 'w')
    {
        keysDown.upArrow = true;
    }
    if (event.key == 's')
    {
        keysDown.downArrow = true;
    }
    if (event.key == 'e')
    {
        pressE();
    }
    if ((event.key == 'Delete'))
    {
        if ((cursor.type == 2) && (cursor.id != -1))
        {
            deleteObject();
        }
    }
});

document.addEventListener('keyup',   function(event) {
    if (event.key == 'd')
    {
        keysDown.rightArrow = false;
    }
    if (event.key == 'a')
    {
        keysDown.leftArrow = false;
    }
    if (event.key == 'w')
    {
        keysDown.upArrow = false;
    }
    if (event.key == 's')
    {
        keysDown.downArrow = false;
    }
});

var mainObjectCount = 0;

function initGameMode()
{
    for (var i = 0; i < mainObjectCount; i++)
    {
        var object = objects[i];

        switch (object.type)
        {
            case 2: // if object is a cube spawner
            {
                object.state.cubeIndex = objects.length;
                var cube = placeObject(object.x+30, object.y-30, 1);
                objects[cube].state.color = object.state.color;
                objects[cube].state.type  = object.state.type;
            }
        }
    }

    player = {x: 35, y:-50, velx: 0, vely: 0};
}