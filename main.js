var ctx = document.getElementById("canvas").getContext("2d");

var level = [];

var objects = [];

var levelStats = {width: 20, height: 15}

var camera = {x: 0, y: 0};

for (var j = 0; j < levelStats.height; j++) {
    level.push([]);
    if (j != 14) {
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

var keysDown = {rightArrow: false, leftArrow: false, upArrow: false};

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
    if (event.key == 'e')
    {
        pressE();
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
});