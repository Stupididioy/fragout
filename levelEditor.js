var cursor = {x: 0, y: 0, type: 0, id: 0};
document.getElementById("selectPalate").addEventListener('mousedown', function (event) {
    switch (cursor.type)
    {
        case 0:
            {
                cursor.id =    Math.floor((camera.x+event.offsetX)/30);
                cursor.id+= 12*Math.floor((camera.y+event.offsetY)/30);
                break;
            }
        case 1:
            {
                
            }
    }
})

document.getElementById("cursorPalate").addEventListener('mousedown', function (event) 
{
    cursor.type = Math.floor(event.offsetX/30);
    cursor.id = -1;

    var selectPalate = document.getElementById("selectPalate");
    var selectPalateCTX = selectPalate.getContext("2d");

    switch (cursor.type)
    {
        case 0: {
            selectPalate.width = worldPNG.width ;
            selectPalate.height= worldPNG.height;
            selectPalateCTX.drawImage(worldPNG, 0, 0);
            break;
        }

        case 1: {
            selectPalate.width = 120;
            selectPalate.height= 30;
            renderObjectAny(selectPalateCTX, 
                {x: 0, y: 0, type: 0, state: {activated: false, exit: "0"}}
            );
            renderObjectAny(selectPalateCTX, 
                {x: 90, y: 0, type: 1, state: {color: "FF0000"}}
            );
        }
    }
})

document.getElementById("canvas").addEventListener('mousedown', function(e) {
    let y = Math.floor((camera.y+e.offsetY)/30);
    let x = Math.floor((camera.x+e.offsetX)/30);
    if (cursor.type == 0 && cursor.id != -1) //tiles/blocks
    {
        level[y][x] = cursor.id;
        //console.log ("Changed tile at "+x+", "+y+" to "+cursor.id);
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
    }
})

document.getElementById("canvas").addEventListener('mousemove', function(e) {
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
})

function saveLevel()
{
    let name = document.getElementById("levelName").value;
    updateNameDropdown(name);
    localStorage.setItem("FragOut_"+name, JSON.stringify(level));
}

function loadLevel(name)
{
    var data;
    if (!name)
    {
        let dropdown = document.getElementById("levelSelectDropdown");
        let levelName = dropdown.options[dropdown.selectedIndex].text;
        data = localStorage.getItem("FragOut_"+levelName);
    } else {
        data = localStorage.getItem("FragOut_"+name);
    }
    level = JSON.parse(data);
    updateNameDropdown();
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
        case 0: // exit tele
            {
                object.state = {activated: false, exit: "TestLevel0"};
                break;
            }
        case 1:
            {
                object.state = {velx: 0, vely: 0, sizeX: 30, sizeY: 30, color: "FF0000", grabbable: true};
                break;
            }
    }

    objects.push(object);

    updateCollisions();

    return index;

}

var objectSizes = [[90,30],[30,30]]

updateNameDropdown();

objects[placeObject(180,13*30,0)].state.activated = true;

objects[placeObject(180,10*30,1)].state.color = "#0000FF";

function initPalate()
{
    var selectPalate = document.getElementById("selectPalate");
    var selectPalateCTX = selectPalate.getContext("2d");

    selectPalate.width = worldPNG.width ;
    selectPalate.height= worldPNG.height;
    selectPalateCTX.drawImage(worldPNG, 0, 0);
}

initPalate();