function setup(){
    canvas = createCanvas(1000, 1000)
    paperCanvas = document.getElementById('paperCanvas');
    paperCanvas.width = width;
    paperCanvas.height = height
    pixelSize = 1
    canvas.elt.style.display = 'none';
    // paperCanvas.style.display = 'none';
    paper.setup(paperCanvas);

    CORNERS = {
        TOP_LEFT: p(-width*0.2, -height*0.2),
        TOP_RIGHT: p(width*1.2, -height*0.2),
        BOTTOM_LEFT: p(-width*0.2, height*1.2),
        BOTTOM_RIGHT: p(width*1.2, height*1.2)
    }

    noiseSeed(round_random(100000))

    noLoop()
    makeImage()
}
