var cursor = {x: 0, y: 0, oldx: 0, oldy: 0, type: -1, id: 0};

var latestConnectionName = 0;

document.getElementById("selectPalate").addEventListener('mousedown', function (event) {
    cursor.id = placeableObjects[Math.floor(event.offsetX/30)];
})

document.getElementById("tileSelect").addEventListener('mousedown', function (event) {
    cursor.id =    Math.floor((event.offsetX)/30);
    cursor.id+= 12*Math.floor((event.offsetY)/30);
})

var placeableObjects = [0,2,3,4,5,6];
document.getElementById("cursorPalate").addEventListener('mousedown', function (event) 
{
    cursor.type = Math.floor(event.offsetX/30);
    cursor.id = -1;

    var selectPalate = document.getElementById("selectPalate");
    var selectPalateCTX = selectPalate.getContext("2d");

    switch (cursor.type)
    {
        case 1: {
            selectPalate.width = 180;
            selectPalate.height= 30;
            selectPalateCTX.drawImage(objectPNG, 90,150,90,30, 0 , 0,30,30);
            selectPalateCTX.drawImage(objectPNG,  0,120,90,60, 30, 0,30,30);
            selectPalateCTX.drawImage(objectPNG, 90,  0,30,30, 60, 0,30,30);
            selectPalateCTX.drawImage(objectPNG,480,120,30,30, 90, 0,30,30);
            selectPalateCTX.drawImage(objectPNG,420,150,30,30,120, 0,30,30);
            selectPalateCTX.drawImage(objectPNG,510,120,60,90,150, 0,30,30);
        }
    }
    
    var divArray = ["tileSelect", "selectPalate", "objectEditDiv", "editLevelDimensionsDiv"];

    for (var i = 0; i < divArray.length; i++)
    {
        document.getElementById(divArray[i]).style = ((cursor.type == i)) ? "display: block": "display: none";
    }
})

document.getElementById("canvas").addEventListener('mousedown', function(e) {
    let y = Math.floor((camera.y+e.offsetY)/30);
    let x = Math.floor((camera.x+e.offsetX)/30);
    if (cursor.type == 0 && cursor.id != -1) //tiles/blocks
    {
        level[y][x] = cursor.id;
        cursor.oldx = cursor.x; cursor.oldy = cursor.y;
    } else if (cursor.type == 1) //placing entities
    {
        placeObject(30*Math.floor((camera.x+e.offsetX)/30),
            30*Math.floor((camera.y+e.offsetY)/30),
            cursor.id);
    } else if (cursor.type == 2) // editing/selecting entities
    {
        cursor.id = -1;
        for (var i = 0; i < objects.length; i++)
        {
            var object = objects[i];
            var cursorX = camera.x+e.offsetX;
            var cursorY = camera.y+e.offsetY;
            if ((object.x<cursorX) && ((object.x+30)>cursorX)
                && (object.y<cursorY) && ((object.y+30)>cursorY))
            {
                cursor.id = i;
                break;
            }
        }

        updateObjectEditArea(i);
    } else if (cursor.type == 4)
    {
        for (var i = 0; i < objects.length; i++)
        {
            var object = objects[i];
            var cursorX = camera.x+e.offsetX;
            var cursorY = camera.y+e.offsetY;
            if ((object.x<cursorX) && ((object.x+30)>cursorX)
                && (object.y<cursorY) && ((object.y+30)>cursorY))
            {
                if (cursor.id == -1)
                {
                    cursor.id = i;
                    break;
                } else {
                    if (!objects[cursor.id].name)
                    {
                        objects[cursor.id].name = latestConnectionName+1;
                        latestConnectionName++;
                    }
                    if (!object.name)
                    {
                        object.name = latestConnectionName+1;
                        latestConnectionName++;
                    }

                    connections.push({input: objects[cursor.id].name, output: object.name})
                    cursor.id = -1;
                    break;
                }
            }
        }
    }
})
document.getElementById("canvas").addEventListener('mousemove', function(e) {
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
})
document.getElementById("canvas").addEventListener('mouseup', function (e) {
    if (cursor.type == 0 && cursor.id != -1)
    {
        var x1 = Math.floor((cursor.oldx+camera.x)/30);
        var x2 = Math.floor((cursor.x   +camera.x)/30);
        var y1 = Math.floor((cursor.oldy+camera.y)/30);
        var y2 = Math.floor((cursor.y   +camera.y)/30);

        if (x2 < x1)
        {
            var u = x2;
            x2 = x1;
            x1 = u;
        }
        if (y2 < y1)
        {
            var u = y2;
            y2 = y1;
            y1 = u;
        }

        for (var j = y1; j <= y2; j++)
        {
            for (var i = x1; i <= x2; i++)
            {
                level[j][i] = cursor.id;
            }
        }
    }
})

document.getElementById("ModeButton").addEventListener('click', function(e) {
    levelEditing = !levelEditing;

    if (levelEditing) {
        document.getElementById("levelEditDiv").style = "display: block";
        

        var selectPalate = document.getElementById("selectPalate");
        var selectPalateCTX = selectPalate.getContext("2d");
        cursor.id = 0;
        selectPalate.width = worldPNG.width ;
        selectPalate.height= worldPNG.height;
        selectPalateCTX.drawImage(worldPNG, 0, 0);

        objects.splice(mainObjectCount);
    } else {
        cursor.id = -1;

        document.getElementById("levelEditDiv").style = "display: none";

        mainObjectCount = objects.length;
        initGameMode();
    }

})

function saveLevel(name)
{
    var name1;
    if (name) {
        name1 = name;
    } else {
        name1 = document.getElementById("levelName").value;
    }
    updateNameDropdown(name1);
    let data = [1, levelStats.width, levelStats.height, level, objects, connections];
    localStorage.setItem("FragOut_"+name1, JSON.stringify(data));
}

function loadLevel(name)
{
    var data;
    var name1;
    if (!name)
    {
        let dropdown = document.getElementById("levelSelectDropdown");
        name1 = dropdown.options[dropdown.selectedIndex].text;
        data = localStorage.getItem("FragOut_"+name1);
    } else {
        data = localStorage.getItem("FragOut_"+name);
        name1 = name;
    }

    data = JSON.parse(data);
    //data = convertFormat(data[0], 3, data);

    level = data[3];
    objects = data[4];
    connections = data[5];
    levelStats.height = data[2];
    levelStats.width  = data[1];
    updateNameDropdown();

    document.getElementById("inputLevel_height").value = levelStats.height;
    document.getElementById("inputLevel_width" ).value = levelStats.width ;

    latestConnectionName = 0;
    for (var i = 0; i < objects.length; i++)
    {
        if (objects[i].name > latestConnectionName)
        {
            latestConnectionName = objects[i].name;
        }
    }

    currentLevel = name;

    mainObjectCount = objects.length;

    if (!connections)
    {
        connections = [];
    }
}

function updateNameDropdown (name)
{
    if (name)
    {
        let hasName = false;
        let levelList = localStorage.getItem("FragOutLevelList");
        levelList = JSON.parse(levelList);
    
        // this section determines if the level
        // name is on the list for loading
        // if not, add it.
        for (var i = 0; i < levelList.length; i++)
        {
            if (levelList[i] == name)
            {
                hasName = true;
                break;
            }
        }

        if (!hasName) {
            levelList.push(name);
            levelList = JSON.stringify(levelList);
            localStorage.setItem("FragOutLevelList", levelList);
        }
    }

    let dropdown = document.getElementById("levelSelectDropdown");

    let arr = dropdown.children;
    for (var i = 0; i < arr.length; i++) {arr[i].remove();}

    let levelList = localStorage.getItem("FragOutLevelList");
    levelList = JSON.parse(levelList);

    levelList.sort();

    for (var i = 0; i < levelList.length; i++)
    {
        var option = document.createElement("option");
        option.value = levelList[i];
        option.text = levelList[i];
        dropdown.appendChild(option);
    }
}

function placeObject(x,y,type)
{
    var index = objects.length;
    var object = {x: x, y: y, type: type, state: {}};
    switch (type) {
        case 0: // exiobjectt tele
            {
                object.state = {activated: false, exit: "TestLevel0"};
                break;
            }
        case 1:
            {
                object.state = {velx: 0, vely: 0, sizeX: 30, sizeY: 30, color: "#FF0000", grabbable: true, colTimer: 0, type: 0};
                break;
            }
        case 2:
            {
                object.state = {cubeIndex: 0, color: "#FF0000", type: 0};
                break;
            }
        case 3:
            {
                object.state = {color: "#FF0000", range: 5};
                break;
            }
        case 4:
            {
                object.state = {activated: false, direction: 3};
                break;
            }
        case 5:
            {
                object.state = {on: false, direction: 1};
                break;
            }
        case 6:
            {
                object.state = {blewUp: false, primed: false};
            }
    }

    objects.push(object);

    updateCollisions();

    return index;

}

var objectSizes = [[90,30],[30,30],[90,60],[30,30],[30,30],[30,30],[60,90]];

updateNameDropdown();

function initPalate()
{
    var selectPalate = document.getElementById("selectPalate");
    var selectPalateCTX = selectPalate.getContext("2d");

    selectPalate.width = worldPNG.width ;
    selectPalate.height= worldPNG.height;
    selectPalateCTX.drawImage(worldPNG, 0, 0);
}

initPalate();

var lastSelectedObject = -1;
var selectedVar = 0;

function updateObjectEditArea()
{
    var oEDiv = document.getElementById("objectEditDiv");
    var oESelect = document.getElementById("objectEditMode");
    var oEInput = document.getElementById("objectEditInput");
    if (cursor.type == 2 && cursor.id != -1)
    {
        var object = objects[cursor.id];

        if (lastSelectedObject != cursor.id)
        {
            var children = oESelect.children;
            for (let i of children)
            {
                i.remove();
            }

            for (let i in object.state)
            {
                var renderVar = renderStateVar(i);
                if ( renderVar == 1 )
                {
                    lastSelectedObject = cursor.id;
                    var div = document.createElement("div")
                    div.style = "padding: 5px; border: 1px solid black";
                    var p = document.createElement("p");
                    p.innerText = i;
                    div.appendChild(p)
                    oESelect.appendChild(div);
                    selectStateVar(i);
                    

                    div.addEventListener('click', function (e) {
                        selectedVar = e.target.innerText;
                        selectStateVar(e.target.innerText);
                    })
                }
            }
        }

    } else {
        var children = oESelect.children;

        for (let i of children)
        {
            i.remove();
        }
    }
}

function selectStateVar (varName)
{
    var oESelect = document.getElementById("objectEditMode");
    var oEInput = document.getElementById("objectEditInput");

    var children = oESelect.children;

    oEInput.value = objects[lastSelectedObject].state[selectedVar];

    for (i of children)
    {
        if (i.innerText == varName)
        {
            i.style = "padding: 5px; border: 1px solid black; background-color: grey";
        } else {
            i.style = "padding: 5px; border: 1px solid black; background-color: white";
        }


    }
}

function renderStateVar (varName)
{
    switch(varName) {
        case "exit":
            return 1;
        case "color":
            return 1;
        case "velx":
            return 2;
        case "vely":
            return 2;
        case "sizeX":
            return 2;
        case "sizeY":
            return 2;
        case "grabbable":
            return 2;
        case "activated":
            return 1;
        case "cubeIndex":
            return 2;
        case "colTimer":
            return 2;
        case "range":
            return 1;
        case "on":
            return 2;
        case "direction":
            return 1;
        case "type":
            return 1;
        case "blewUp":
            return 2;
        case "primed":
            return 2;
        default: 
            console.log("NON DEFINED IN OBJECT EDIT MENU: " + varName)
            return 0;
    }
}

function submitObjectEditInput()
{
    objects[lastSelectedObject].state[selectedVar] = document.getElementById("objectEditInput").value;
}

function submitLevelStat(stat)
{
    levelStats[stat] = document.getElementById("inputLevel_"+stat).value;

    if (stat == "height" || stat == "width")
    {
        var newLevel = [];
        for (var j = 0; j < levelStats.height; j++)
        {
            var newArray = [];
            for (var i = 0; i < levelStats.width; i++)
            {
                newArray.push(level[j][i]);
            }

            newLevel.push(newArray);
        }

        level = newLevel;

        for (var i = 0; i < objects.length; i++)
        {
            if (objects[i].x > levelStats.width*30 && objects[i].y > levelStats.height*30)
            {
                objects.splice(i, 1);
                i--;
            }
        }
    }
}

loadLevel("MainLevel1");

function deleteObject()
{
    if (cursor.type == 2 && cursor.id != -1)
    {
        var object = objects[cursor.id];

        if (connections)
        {
            for (var i = 0; i < connections.length; i++)
            {
                var conn = connections[i];
                if (conn.input == object.name || conn.output == object.name)
                {
                    connections.splice(i, 1);
                    i--;
                }
            }
        }

        objects.splice(cursor.id, 1);

        cursor.id = -1;
    }
}