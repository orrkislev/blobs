let pencil = '#444'
const pencilMultiplier = random(1,2.5)**2
const pencilThickness = random(1,1.5)

const colors = ['#914E72', '#0078BF', '#00A95C', '#3255A4', '#F15060', '#765BA7', '#00838A', '#FF665E', '#FFE800', '#FF6C2F', '#E45D50', '#FF7477', '#62A8E5', '#4982CF', '#19975D', '#00AA93', '#62C2B1', '#67B346', '#009DA5', '#169B62', '#9D7AD2', '#BB76CF', '#F65058', '#6C5D80', '#D2515E', '#B44B65', '#E3ED55', '#FFB511', '#FFAE3B', '#F6A04D', '#FF6F4C', '#F2CDCF', '#F984CA', '#FF8E91', '#5EC8E5', '#82D8D5', '#FF4C65']

const withBlackEyes = random() < 0.08
const withPupils = !withBlackEyes && random() < 0.65
const withLookAway = withPupils && random() < 0.3
const withSilkScreenOffset = random() < 0.5
const withMoss = random() < 0.5
const withHair = false
const numBalls = round_random(0, 3)
const withFloor = random() < 0.8
const withCrutches = withFloor
const numRocks = round_random(1, 10)
const withColor = true
const withShadow = withFloor && random() < 0.7
const withLips = random()<0.2

async function makeImage() {
    blobColor = choose(colors)
    blobShadow = choose(colors)
    blobShadow2 = choose(colors)
    blobHighlight = choose(colors)
    oppositeColor = choose(colors)
    ballsColor = 'white'
    rockColor = choose(colors)

    otherPaintPaths = new paper.Group()
    const bg = new paper.Path.Rectangle(0, 0, width, height)
    bg.fillColor = '#ddd'
    bg.sendToBack()

    const secondLayer = new paper.Layer();

    // ----------------------------------------------------------------------------

    floorHeight = height * .7
    floorBlob = new Blob(new Path.Rectangle(p(0, floorHeight), p(width, height)))
    centerPoint = p(width / 2, height * .5)
    lightSource = p(random(width), 0)

    makeMainBlob()
    makeBalls()

    balls.paint(ballsColor)
    mainBlob.paint(blobColor)
    mainBlob.shadows(-20, blobShadow)
    mainBlob.shadows(20, blobShadow)
    mainBlob.shadows(180, blobHighlight)
    mainBlob.doFoldShadows(blobShadow2)
    balls.dropShadowOn(mainBlob, blobShadow2)
    mainBlob.drawSpots()
    if (withHair) mainBlob.drawHair()
    
    drawFace()
    if (withMoss) makeMoss()
    drawRocks()

    if (withCrutches) crutches(mainBlob)

    floorBlob.path.remove()
    floorHeight += p(width/2,height/2).subtract(mainBlob.path.bounds.center).y
    secondLayer.translate(p(width/2,height/2).subtract(mainBlob.path.bounds.center))

    // -----------------------------------------------------------------------------


    canvas.elt.style.display = 'block';
    paperCanvas.style.display = 'none';

    paper.project.activeLayer.children.forEach(child => child.strokeColor = null)
    img = paper.project.activeLayer.rasterize()

    if (withShadow){
        shadowPath = new Path.Circle(p(mainBlob.path.bounds.center.x, floorHeight), mainBlob.path.bounds.width/2)
        shadowPath.scale(1,0.1)
        shadowPath.rebuild(10).wonky().smooth()
        fillPath(shadowPath, pencil)
        drawPath(shadowPath)
    }

    mainBlob.drawCurvesp5()

    balls.drawCurvesp5()
    rocks.drawCurvesp5()
    if (withCrutches) allCrutches.children.forEach(crutch => drawPath(crutch))
    if (withBlackEyes) {
        fillPath(eye1.path, pencil)
        fillPath(eye2.path, pencil)
        eyeLights.forEach(light => fillPath(light, 'white'))
    }
    eye2.drawCurvesp5()
    eye1.drawCurvesp5()
    drawPath(mouth)
    if (withLips) drawPath(lips)
    if (withPupils) {
        fillPath(pupil1, pencil)
        fillPath(pupil2, pencil)
        drawPath(pupil1)
        drawPath(pupil2)
    }
    if (withMoss) moss.drawCurvesp5()
    drawPath(faceContainer)

    linesImg = get()
    clear()

    const prevWidth = width
    resizeCanvas(min(windowWidth, windowHeight), min(windowWidth, windowHeight))
    const rescaleRatio = width/prevWidth
    background('#fee')
    
    if (withColor){
        const imageX = img.bounds.topLeft.x*rescaleRatio + (withSilkScreenOffset ? random(-5, 5) : 0)
        const imageY = img.bounds.topLeft.y*rescaleRatio + (withSilkScreenOffset ? random(-5, 5) : 0)
        image(img, imageX, imageY, img.bounds.width * rescaleRatio, img.bounds.height * rescaleRatio)
    }
    image(linesImg, 0, 0, width, height)

    loadPixels()
    for (let i = 0; i < pixels.length; i += 4) {
        const x = (i / 4) % width - width/2
        const y = Math.floor((i / 4) / width)
        const val = random(25 * pixelDensity()) - noise(x/500/pixelDensity(), y/500/pixelDensity())*10*pixelDensity()
        pixels[i] += val
        pixels[i + 1] += val
        pixels[i + 2] += val
    }

    updatePixels()
}

function makeMainBlob() {
    const withGidul =  random() < 0.2
    const numLumps = round_random(1, 10)
    const withFloating = withFloor && !withGidul && random() < .4

    const mainBlobSize = 160
    mainBlob = new Blob(new Path.Circle(centerPoint, mainBlobSize * random(.5, 1)).wonky().blocky(.5, 1))
    for (let i = 0; i < 5; i++) {
        const positionOffset = p(mainBlobSize * random(-1, 1), mainBlobSize * random(-1, 1))
        const size = mainBlobSize * random(.5, 1)
        const shape = new Path.Circle(centerPoint.add(positionOffset), size).wonky().blocky(.5, 1)
        const blob = new Blob(shape)
        mainBlob.join(blob)
        shape.remove()
    }

    if (withGidul){
        const pos = mainBlob.randomOnBorder().point
        const limb = Limb(pos,pos.add(pointFromAngle(random(360)).multiply(random(200,400))),random(20,40),random(10,20))
        if (random() < 0.5)
            for (let i=0;i<50;i++){
                limb.join(new Blob(new Path.Circle(limb.randomOnBorder().point, random(10,20)).wonky()))
            }
        mainBlob.join(limb)
    }

    if (withFloating){
        for (let i = 0; i < 5; i++) {
            const blob = new Blob(new Path.Circle(centerPoint.add(mainBlobSize * random(-1,1), mainBlobSize*random(-2,-1)), mainBlobSize * random(.25,.5)).wonky())
            mainBlob.join(blob)
            blob.path.remove()
        }
    }

    for (let i = 0; i < numLumps; i++) {
        const blob = new Blob(new Path.Circle(mainBlob.randomOnBorder().point, random(10, 20)).wonky())
        mainBlob.join(blob)
        blob.path.remove()
    }
    cutWithFloor(mainBlob)
    mainBlob.path.translate(0, -8)
}

function makeBalls() {
    balls = new Blob(new Path())
    for (let i = 0; i < numBalls; i++) {
        const blob = new Blob(new Path.Circle(mainBlob.randomOnBorder().point, random(20, 40)).wonky())
        balls.join(blob)
        blob.path.remove()
    }
    cutWithFloor(balls)
    mainBlob.cut(balls)
}


function drawRocks() {
    rocks = new Blob(new Path())
    for (let i = 0; i < numRocks; i++) {
        const pos = withFloor ? p(width * random(.3, .7), floorHeight) : centerPoint.add(pointFromAngle(random(360)).multiply(random(200, 400)))
        const blob = new Blob(new Path.Circle(pos, random(20, 60)).wonky().blocky())
        rocks.join(blob)
        blob.path.remove()
    }
    cutWithFloor(rocks)
    rocks.cut(faceContainer)
    rocks.paint(rockColor)
    rocks.path.bringToFront()
    // rocks.shadows(0, '#555')
}

function drawFace() {
    let locOnMain = mainBlob.randomOnBorder()
    faceContainer = new Path.Circle({ center: locOnMain.point.add(locOnMain.normal.multiply(random(-30, -80))), radius: 80 })
    while (!mainBlob.path.contains(faceContainer.position) || faceContainer.getIntersections(balls.path).length != 0) {
        locOnMain = mainBlob.randomOnBorder()
        faceContainer.position = locOnMain.point.add(locOnMain.normal.multiply(random(-30, -80)))
    }

    // Eyes
    eye1 = new Blob(new Path.Circle(faceContainer.position.add(30, -30), 20).wonky())
    eye2 = new Blob(eye1.path.clone())
    eye2.path.translate(-60, 0)
    eye2.path.scale(-1, 1)
    eye2.path.rotate(random(-40, 40))

    // Mouth
    const mouthPos = faceContainer.position.add(0, 0)
    const mouthWidth = random(6, 20)
    const mouthRotation = random(-60, 60)
    const seg1 = new paper.Segment(mouthPos.add(mouthWidth, 0), null, p(-1, 0).rotate(-mouthRotation).multiply(mouthWidth / 3))
    const seg2 = new paper.Segment(mouthPos.add(-mouthWidth, 0), p(1, 0).rotate(mouthRotation).multiply(mouthWidth / 3))
    mouth = new Path([seg1, seg2])

    faceGroup = new Group()
    faceGroup.addChildren([eye1.group, eye2.group, mouth])
    faceGroup.pivot = faceContainer.position
    faceGroup.rotate(0)

    mainBlob.folds.children.forEach(fold => {
        if (faceContainer.contains(fold.position)) {
            fold.remove()
        }
    })
    // faceContainer.remove()
    // faceContainer.fillColor = '#ff000055'
    faceContainer = new Blob(faceContainer)

    eye1.paint('white')
    eye2.paint('white')
    eye1.dropShadowOn(mainBlob, blobShadow)
    eye2.dropShadowOn(mainBlob, blobShadow)

    mainBlob.join(eye1)

    if (withPupils) {
        const pupilSize = random(5, 10)
        const pupilCommonOffset = withLookAway ? pointFromAngle(random(360)).multiply(random(pupilSize, pupilSize + 10)) : p(0, 0)
        pupil1 = new Path.Circle(eye1.path.position.add(pupilCommonOffset).add(pointFromAngle(random(360), random(6))), pupilSize * random(0.9, 1.1)).wonky(.9, 1.1).intersect(eye1.path)
        pupil2 = new Path.Circle(eye2.path.position.add(pupilCommonOffset).add(pointFromAngle(random(360), random(6))), pupilSize * random(0.9, 1.1)).wonky(.9, 1.1).intersect(eye2.path)
    }

    if (withBlackEyes) {
        const eyeLightOffset = random(6, 12)
        const lightLoc1 = eye1.path.getNearestLocation(lightSource)
        const lightLoc2 = eye2.path.getNearestLocation(lightSource)
        const lightPos1 = lightLoc1.point.subtract(lightLoc1.normal.multiply(eyeLightOffset))
        const lightPos2 = lightLoc2.point.add(lightLoc2.normal.multiply(eyeLightOffset))

        const lightShape_big1 = new Path.Circle(lightPos1, random(4, 6)).wonky()
        const lightShape_big2 = lightShape_big1.clone()
        lightShape_big2.position = lightPos2

        const lightShapeSmall1 = new Path.Circle(lightPos1.add(0, 10), random(2, 3)).wonky()
        const lightShapeSmall2 = lightShapeSmall1.clone()
        lightShapeSmall2.position = lightPos2.add(0, 10)


        eyeLights = [
            lightShape_big1,
            lightShape_big2,
            lightShapeSmall1,
            lightShapeSmall2
        ]
    }

    mouth.strokeColor = pencil
    mouth.translate(0, 15)
    if (withLips) lips = new Path.Circle(mouth.getPointAt(mouth.length/2), random(3,8)).wonky()
}

function crutches(blob, obstacles) {
    allCrutches = new Group()
    const paths = blob.getPaths()
    paths.forEach(path => {
        for (let posOffset = 0; posOffset < path.length; posOffset += 10) {
            const loc = path.getLocationAt(posOffset)
            if (floorHeight - loc.point.y < 30) continue
            const angle = positiveAngle(loc.tangent.angle)
            if ((angle > 240 && angle < 260) || (angle > 120 && angle < 140)) {
                const floorOffset = angle > 240 ? random(-20) : random(20)
                const pathToFloor = new Path([loc.point, p(loc.point.x + floorOffset, floorHeight)])
                const breakInPath = 2
                for (let i = 1; i < breakInPath; i++) pathToFloor.divideAt(pathToFloor.length * i / breakInPath)
                for (let i = 1; i < pathToFloor.segments.length - 1; i++) pathToFloor.segments[i].point = pathToFloor.segments[i].point.add(random(-5, 5), 0)
                drawCrutch(pathToFloor)
                posOffset += random(10, 25)
            }
        }
    })
    blob.group.addChild(allCrutches)
    return allCrutches
}

function drawCrutch(path) {
    const intersections = getOrderedIntersections(path)
    if (intersections.length > 0) {
        const rest = path.splitAt(intersections[0].offset)
        rest.remove()
        drawCrutch(path)
        return
    } else {
        for (let i = path.length * .33; i < path.length * .66; i += path.length / 10) {
            const hitTests = paper.project.activeLayer.hitTestAll(path.getPointAt(i))
            if (hitTests.length > 1) {
                path.remove()
                return
            }
        }
        path.smooth()
        path.strokeColor = pencil
        allCrutches.addChild(path)
        return
    }
}

function cutWithFloor(blob) {
    if (!withFloor) return
    blob.cut(floorBlob)
    blob.apply(crv => {
        for (let i = 0; i < crv.length; i += 30) {
            const pos = crv.getPointAt(i)
            if (abs(pos.y - floorHeight) < 5) {
                const seg = crv.divideAt(i)
                if (seg) {
                    seg.point.y += random(10)
                    seg.smooth()
                }
            }
        }
    })
}

function makeMoss() {
    moss = new Blob(new Path())
    for (let i = 0; i < 40; i++) {
        const outerPoint = mainBlob.path.bounds.topLeft.add(mainBlob.path.bounds.width * random(), 0)
        const loc = mainBlob.path.getNearestLocation(outerPoint)
        const pos = loc.path.getPointAt((loc.offset + random(-10, 10))%loc.path.length).add(0, 5)
        const blob = new Blob(new Path.Circle(pos, random(5, 15)))
        moss.join(blob)
        blob.path.remove()
    }
    for (let i = 0; i < 10; i++) {
        const blob = new Blob(new Path.Circle(moss.randomOnBorder(), random(5, 15)).wonky())
        moss.join(blob)
    }
    moss.cut(faceContainer)
    moss.paint(rockColor)
    moss.dropShadowOn(mainBlob, blobShadow)
}

function extra() {
    // const loc = mainBlob.randomOnBorder()
    // cutPath = new Path.Circle(loc.point, random(20, 40)).wonky()
    // ball = new Blob(cutPath)
    // mainBlob.cut(ball)

    // const orderedIntersections = getOrderedIntersections(mainBlob.path, [cutPath])
    // const firstOffset = orderedIntersections[0].offset
    // const lastOffset = orderedIntersections[orderedIntersections.length - 1].offset
    // const insidePath = new Path()
    // for (let i = firstOffset; i < lastOffset; i += 5) {
    //     const loc = orderedIntersections[0].path.getLocationAt(i)
    //     insidePath.add(loc.point)
    // }
    // insidePath.closePath()
    // const firstPoint = insidePath.firstSegment.point
    // const lastPoint = insidePath.lastSegment.point
    // insidePath.lastSegment.handleOut = firstPoint.subtract(lastPoint).multiply(.3).rotate(-random(20, 40))
    // insidePath.firstSegment.handleIn = lastPoint.subtract(firstPoint).multiply(.3).rotate(random(20, 40))
    // blob = new Blob(insidePath)
    // blob.paint('#000')
    // blob.spots()
    // blob.group.insertBelow(mainBlob.group)
}