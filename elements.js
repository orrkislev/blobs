
function makeMainBlob() {
    const withGidul =  random() < 0.2
    const numLumps = round_random(1, 10)
    const withFloating = withFloor && !withGidul && random() < .4

    const mainBlobSize = 160
    mainBlob = new Blob(new Path.Circle(centerPoint, mainBlobSize * random(.5, 1)).wonky().blocky(.5, 1))
    const sumMainLumps = round_random(2,5)
    for (let i = 0; i < sumMainLumps; i++) {
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
    if (withFace) rocks.cut(faceContainer)
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
    if (withFace) moss.cut(faceContainer)
    moss.paint(rockColor)
    moss.dropShadowOn(mainBlob, blobShadow)
}