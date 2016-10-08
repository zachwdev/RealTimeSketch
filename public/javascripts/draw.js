/********** Controls **********/


var canvas = document.getElementById('mainCanvas'),
    btnClear = document.getElementById('btnClear'),
    btnSave = document.getElementById('btnSave'),
    btnLoad = document.getElementById('btnLoad'),
    colorInput = document.getElementById('colorInput'),
    sizeInput = document.getElementById('sizeInput'),
    outlineInput = document.getElementById('outlineInput'),
    middlePointInput = document.getElementById('middlePointInput'),
    brushCanvas1 = document.getElementById('brushCanvas1'),
    brushCanvas2 = document.getElementById('brushCanvas2'),
    brushCanvas3 = document.getElementById('brushCanvas3'),
    brushCanvas4 = document.getElementById('brushCanvas4'),
    btnUndo = document.getElementById('btnUndo'),
    btnRedo = document.getElementById('btnRedo'),
    blurSizeInput = document.getElementById('blurSizeInput');


var color = colorInput.value;
var size = sizeInput.value;
var blurSize = blurSizeInput.value * -1;
var outline = outlineInput.checked;
var middlePoint = middlePointInput.checked;
var brush = "brush1";
brushCanvas1.style.boxShadow = "10px 20px 30px -18px rgba(80, 80, 80, 1)";

btnClear.addEventListener("click", function () {
    canvas.width = canvas.width;
    socket.emit('test', "test string")
});

btnSave.addEventListener("click", function () {
    saveCanvas();
});

btnLoad.addEventListener("click", function () {
    loadCanvas();
});

btnUndo.addEventListener("click", function () {
    undoCanvasState();
});

btnRedo.addEventListener("click", function () {
    redoCanvasState();
});

colorInput.addEventListener("input", function () {
    color = colorInput.value;
    loadBrushCanvas();
});

sizeInput.addEventListener("input", function () {
    size = sizeInput.value;
    loadBrushCanvas();
});

blurSizeInput.addEventListener("input", function () {
    blurSize = blurSizeInput.value * -1;
    loadBrushCanvas();
})

outlineInput.addEventListener("click", function () {
    outline = outlineInput.checked;
    loadBrushCanvas();
});

middlePointInput.addEventListener("click", function () {
    middlePoint = middlePointInput.checked;
    loadBrushCanvas();
});

brushCanvas1.addEventListener("click", function () {
    brush = "brush1";
    brushCanvas1.style.boxShadow = "10px 20px 30px -18px rgba(80, 80, 80, 1)";
});

brushCanvas2.addEventListener("click", function () {
    //brush = "brush2"
});

brushCanvas3.addEventListener("click", function () {
    //brush = "brush3"
});

brushCanvas4.addEventListener("click", function () {
    //brush = "brush4"
});

function loadBrushCanvas() {
    brushCanvasCtx = brushCanvas1.getContext('2d');
    brushCanvas1.width = brushCanvas1.width;
    brushCanvasCtx.beginPath();
    brushCanvasCtx.lineWidth = size;
    brushCanvasCtx.shadowBlur = (size / blurSize);
    brushCanvasCtx.shadowColor = color;
    if (outline) {
        brushCanvasCtx.strokeStyle = '#FFFFFF';
    } else {
        brushCanvasCtx.strokeStyle = color;
    }
    brushCanvasCtx.lineJoin = brushCanvasCtx.lineCap = 'round';
    brushCanvasCtx.moveTo(10, 35);
    brushCanvasCtx.lineTo(290, 35);
    brushCanvasCtx.stroke();
    brushCanvasCtx.moveTo(10, 35);
    brushCanvasCtx.lineTo(29, 35);
    brushCanvasCtx.stroke();

    brushCanvasCtx = brushCanvas2.getContext('2d');

}

document.body.addEventListener("DOMContentLoaded", loadCanvas(), false);

/*********** Socket IO **********/
var socket = io.connect();
var dataUrl = canvas.toDataURL();

socket.on('loadCanvas', function(data){
    var img = new Image;
    img.src = data;
    img.onload = function () {
        canvas.width = canvas.width;
        ctx.drawImage(img, 0, 0);
    };
})

function saveCanvasToServer(){
    socket.emit('saveCanvas', canvas.toDataURL());
}

/********* Drawing Functionality **********/

var canvas = document.getElementById('mainCanvas'),
    ctx = canvas.getContext('2d'),
    pointsArray = [],
    drawing;

/** Brushes **/

/** undo redo **/
var canvasStateArray = [],
    canvasStateCount = -1;

function pushCanvasState() {
    canvasStateCount++;
    if (canvasStateCount < canvasStateArray.length) {
        canvasStateArray.length = canvasStateCount
    }
    canvasStateArray.push(canvas.toDataURL());
}

function undoCanvasState() {
    if (canvasStateCount > 0) {
        canvasStateCount--;
        var canvasSnap = new Image();
        canvasSnap.src = canvasStateArray[canvasStateCount];
        canvasSnap.onload = function () {
            canvas.width = canvas.width;
            ctx.drawImage(canvasSnap, 0, 0);
        }
    }
}

function redoCanvasState() {
    if (canvasStateCount < canvasStateArray.length - 1) {
        canvasStateCount++;
        var canvasSnap = new Image();
        canvasSnap.src = canvasStateArray[canvasStateCount];
        canvasSnap.onload = function () {
            ctx.drawImage(canvasSnap, 0, 0);
        }

    }
}

function getMousePos(canvas, e) {

    var rect = canvas.getBoundingClientRect();
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

canvas.addEventListener("mousedown", function (e) {
    canvas.style.cursor = "crosshair"
    var pos = getMousePos(this, e),
        x = pos.x,
        y = pos.y;
    pointsArray.push({
        x: x,
        y: y
    });
    if (canvasStateArray.length === 0) {
        pushCanvasState();
    }
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(x, y);

});

canvas.addEventListener("mousemove", function (e) {
    var pos = getMousePos(this, e),
        x = pos.x,
        y = pos.y;

    if (drawing) {

        pointsArray.push({
            x: x,
            y: y
        });

        ctx.beginPath();
        ctx.moveTo(pointsArray[0].x, pointsArray[0].y);
        for (var i = 1; i < pointsArray.length; i++) {
            ctx.lineTo(pointsArray[i].x, pointsArray[i].y);
        }

        switch (brush) {
        case "brush1":
            ctx.lineWidth = size;
            ctx.lineJoin = ctx.lineCap = 'round';
            if (outline) {
                ctx.strokeStyle = '#FFFFFF';
            } else {
                ctx.strokeStyle = color;
            }

            ctx.shadowBlur = (size / blurSize);
            ctx.shadowColor = color;
            break;
        case "brush2":

            break;
        case "brush3":

            break;
        }
        if (middlePoint) {
            ctx.closePath();
        }
        ctx.stroke();
    };
});

canvas.addEventListener("mouseup", function (e) {
    canvas.style.cursor = "inherit"
    drawing = false;
    ctx.closePath();
    pushCanvasState();
    pointsArray.length = 0;
    saveCanvasToServer();
});

canvas.addEventListener("mouseout", function (e) {
    if (drawing) {
        drawing = false;
        ctx.closePath();
        pushCanvasState();
        pointsArray.length = 0;
        saveCanvasToServer();
    }
});

/********** Mobile Implimentation **********/
canvas.addEventListener("touchstart", function (e) {
    var pos = getMousePos(this, e),
        x = pos.x,
        y = pos.y;

    drawing = true;
    ctx.beginPath();
    ctx.moveTo(x, y);

});

canvas.addEventListener("touchmove", function (e) {
    var pos = getMousePos(this, e),
        x = pos.x,
        y = pos.y;

    if (drawing) {
        marker(x, y);
    }
});

canvas.addEventListener("touchend", function (e) {
    drawing = false;
    ctx.closePath();
});

canvas.addEventListener("touchleave", function (e) {
    drawing = false;
    ctx.closePath();
})


/********** Local Storage **********/

function saveCanvas() {
    console.log(dataUrl);
    localStorage.setItem("canvas", dataUrl);

}

function loadCanvas() {
    var img = new Image;
    img.src = dataUrl;
    img.onload = function () {
        canvas.width = canvas.width;
        ctx.drawImage(img, 0, 0);
    };
    loadBrushCanvas();
}

/********** Main Loop **********/

function mainLoop(){
    if(drawing === true){
        saveCanvasToServer();
    }
    setTimeout(mainLoop, 5);
}

mainLoop();
