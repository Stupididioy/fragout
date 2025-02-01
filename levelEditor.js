var cursor = {x: 0, y: 0, type: -1, id: 0};
document.getElementById("selectPalate").addEventListener('mousedown', function (event) {
    switch (cursor.type)
    {
        case 0:
            {
                cursor.id =    Math.floor((event.offsetX)/30);
                cursor.id+= 12*Math.floor((event.offsetY)/30);
                break;
            }
        case 1:
            {
                cursor.id = placeableObjects[Math.floor(event.offsetX/30)];
            }
    }
})

var placeableObjects = [0,2];

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
            selectPalateCTX.drawImage(objectPNG,90,150,90,30,0,0,30,30);
        }
    }
    
    document.getElementById("selectPalate" ).style = ((cursor.type == 2) ? "display: none" : "display: block");
    document.getElementById("objectEditDiv").style = ((cursor.type == 2) ? "display: block" : "display: none");
})

document.getElementById("canvas").addEventListener('mousedown', function(e) {
    let y = Math.floor((camera.y+e.offsetY)/30);
    let x = Math.floor((camera.x+e.offsetX)/30);
    if (cursor.type == 0 && cursor.id != -1) //tiles/blocks
    {
        level[y][x] = cursor.id;
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
    }
})
document.getElementById("canvas").addEventListener('mousemove', function(e) {
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
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
    let data = [1, levelStats.width, levelStats.height, level, objects];
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

    if (data[0] == 1) {
        level = data[3];
        objects = data[4];
        levelStats.height = data[2];
        levelStats.width  = data[1];
    } else {
        levelStats.width = data[0].length;
        levelStats.height = data.length;
        level = data;
        objects = [];
        saveLevel(name1);
    }
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
                object.state = {velx: 0, vely: 0, sizeX: 30, sizeY: 30, color: "FF0000", grabbable: true, colTimer: 0};
                break;
            }
        case 2:
            {
                object.state = {cubeIndex: 0, color: "FF0000"};
                break;
            }
    }

    objects.push(object);

    updateCollisions();

    return index;

}

var objectSizes = [[90,30],[30,30],[90,60]]

updateNameDropdown();

objects[placeObject(180,36*30,0)].state.activated = true;

objects[placeObject(150,10*30,1)].state.color = "#0000FF";

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
    console.log("----------");
    console.log(varName);
    var oESelect = document.getElementById("objectEditMode");
    var oEInput = document.getElementById("objectEditInput");

    var children = oESelect.children;
    console.log(children);

    oEInput.value = objects[lastSelectedObject].state[selectedVar];

    for (i of children)
    {
        console.log("-----");
        console.log(i.innerText);
        console.log(varName);
        console.log(varName == i.innerText);
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
        default: 
            console.log("NON DEFINED IN OBJECT EDIT MENU: " + varName)
            return 0;
    }
}

function submitObjectEditInput()
{
    objects[lastSelectedObject].state[selectedVar] = document.getElementById("objectEditInput").value;
}