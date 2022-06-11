let pencil = '#1B1B0F'


async function makeImage() {
    const bg = new paper.Path.Rectangle(0, 0, width, height)
    bg.fillColor = 'beige'
    bg.sendToBack()
    const secondLayer = new paper.Layer();

    otherPaintPaths = new Group()

    floorHeight = height * .6
    floorPath = new Blob(new Path.Rectangle(p(0, floorHeight), p(width, height)))
    centerPoint = p(width / 2, height / 2)

    makeMainBlob()
    makeBalls()

    cutBlob.draw('orange')
    mainBlob.paint('#52b788')
    mainBlob.shadows(0, '#2d6a4f')
    mainBlob.shadows(180, 'white')
    mainBlob.doFoldShadows('#081c15')
    cutBlob.dropShadowOn(mainBlob, '#2d6a4f')

    drawFace()
    drawRocks()

    crutches(mainBlob)
}

function makeSpine(v1, v2,startDir, sumPoints = 10) {
    const targetDir = v2.subtract(v1).normalize()
    const distance = v1.getDistance(v2)
    const dir = pointFromAngle(startDir).multiply(distance/sumPoints)
    const startPoint = v1.clone()
    const path = new Path()
    for (let i = 0; i <= sumPoints; i++) {
        const p = startPoint.clone()
        const p2 = p.add(dir.multiply(random(-50, 50)))
        path.add(p2)
    }
    path.smooth()
    return path
}

function Limb(p1,p2,r1,r2){
    const crv = makeSpine(p1,p2,10)
    blob = new Blob(new Path())
    for (let i=0;i<crv.length;i+=crv.length/20){
        const loc = crv.getLocationAt(i)
        const currR = lerp(r1, r2, i/crv.length)
        const p1 =  loc.point.add(loc.normal.multiply(currR))
        const c = new Path.Circle(p1, currR)
        blob.join(new Blob(c))
    }
    blob.apply(crv=>crv.simplify(30))
    blob.apply(crv=>crv.wonky().blocky())
    crv.remove()
    return blob
}

function makeMainBlob(){
    mainBlob = new Blob(new Path.Circle(centerPoint, random(40, 80)).wonky().blocky())
    for (let i = 0; i < 5; i++) {
        const positionOffset = p(random(-80, 80), random(-80, 80))
        const size = random(40, 80)
        const shape = new Path.Circle(centerPoint.add(positionOffset), size).wonky().blocky()
        const blob = new Blob(shape)
        mainBlob.join(blob)
    }

    // for (let i=0;i<5;i++){
        mainBlob.join(Limb(centerPoint,centerPoint.add(p(0,-400)),35,10))
    // }
    // for (let i=0;i<10;i++){
    //     mainBlob.join(new Blob(new Path.Circle(mainBlob.randomOnBorder().point, random(10,20)).wonky()))
    // }
    // for (let i=0;i<mainBlob.path.length;i+=50){
    //     mainBlob.join(new Blob(new Path.Circle(mainBlob.path.getPointAt(i), random(10,20)).wonky()))
    // }
    mainBlob.cut(floorPath)
}

function makeBalls(){
    cutBlob = new Blob(new Path.Circle(mainBlob.randomOnBorder().point, random(20, 40)).wonky())
    // cutBlob.join(new Blob(new Path.Circle(mainBlob.randomOnBorder().point, random(20, 40)).wonky()))
    cutBlob.cut(floorPath)
    mainBlob.cut(cutBlob)
}


function drawRocks(){
    rocks = new Blob(new Path())
    for (let i = 0; i < 4; i++) {
        rocks.join(new Blob(new Path.Circle(p(width * random(.4, .6), floorHeight), random(10, 30)).wonky().blocky()))
    }
    rocks.cut(floorPath)
    rocks.paint('#52b788')
    rocks.shadows(0, '#95d5b2')
}



function drawFace() {
    let faceContainer = new Path.Circle({ center: p(0, 0), radius: 40 })
    while (!mainBlob.path.contains(faceContainer.position) || faceContainer.getIntersections(cutBlob.path).length != 0) {
        const loc = mainBlob.randomOnBorder()
        faceContainer.position = loc.point.add(loc.normal.multiply(-40))
    }

    // Eyes
    eye1 = new Blob(new Path.Circle(faceContainer.position.add(15, -15), 10).wonky())
    eye2 = new Blob(eye1.path.clone())
    eye2.path.translate(-30, 0)
    eye2.path.scale(-1, 1)
    eye2.path.rotate(random(-20, 20))
    eye1.draw('white')
    eye2.draw('white')
    // const corner = p(width,0)
    // const loc1 = eye1.path.getNearestLocation(corner)
    // const loc2 = eye2.path.getNearestLocation(corner)
    // const eyeLightPosition = loc1.point.add(loc1.normal.multiply(-5))
    // const eyeLightPosition2 = loc2.point.add(loc2.normal.multiply(5))
    // const eyeLight = new Path.Circle(eyeLightPosition, 3)
    // const eyeLight2 = new Path.Circle(eyeLightPosition2, 3)
    // eyeLight.scale(1,1.5)
    // eyeLight2.scale(1,1.5)
    // eyeLight.wonky()
    // eyeLight2.wonky()
    // eyeLight.fillColor = 'white'
    // eyeLight2.fillColor = 'white'
    // eyeLight1_1 = eyeLight.clone()
    // eyeLight1_1.scale(.5,.5)
    // eyeLight1_1.translate(0, 10)
    // eyeLight2_1 = eyeLight2.clone()
    // eyeLight2_1.scale(.5,.5)
    // eyeLight2_1.translate(0, 10)

    eye1.dropShadowOn(mainBlob, 'darkgreen')
    eye2.dropShadowOn(mainBlob, 'darkgreen')

    // Mouth

    const mouthPos = faceContainer.position.add(0, random(-15,-5))
    const mouthWidth = random(3, 10)
    const mouthRotation = random(-30, 30)
    const seg1 = new paper.Segment(mouthPos.add(mouthWidth, 0), null, p(-1, 0).rotate(-mouthRotation).multiply(mouthWidth / 3))
    const seg2 = new paper.Segment(mouthPos.add(-mouthWidth, 0), p(1, 0).rotate(mouthRotation).multiply(mouthWidth / 3))
    mouth = new Path([seg1, seg2])
    mouth.strokeColor = pencil
    mouth.translate(0, 15)
}

function crutches(blob) {
    let allCrutches = new Group()
    const paths = blob.getPaths()
    paths.forEach(path => {
        for (let posOffset = 0; posOffset < path.length; posOffset += 10) {
            const loc = path.getLocationAt(posOffset)
            if (floorHeight - loc.point.y < 10) continue
            const angle = positiveAngle(loc.tangent.angle)
            if ((angle > 220 && angle < 270) || (angle > 90 && angle < 140)) {
                const forkSize = random(2,min(floorHeight - loc.point.y,20))
                if (path.contains(loc.point.add(0,forkSize))) continue
                const pathToFloor = new Path([loc.point, p(loc.point.x + random(-20, 20), floorHeight)])
                pathToFloor.firstSegment.point = pathToFloor.firstSegment.point.add(0,forkSize)
                const breakInPath = 2
                for (let i = 1; i < breakInPath; i++) pathToFloor.divideAt(pathToFloor.length * i / breakInPath)
                for (let i = 1; i < pathToFloor.segments.length - 1; i++) pathToFloor.segments[i].point = pathToFloor.segments[i].point.add(random(-5, 5), 0)
                // const intersections = pathToFloor.getIntersections(blob.path, intersection => intersection.offset > 3 && intersection.offset < pathToFloor.length - 3)
                const intersections = getOrderedIntersections(pathToFloor, [mainBlob.path, cutBlob.path, rocks.path])
                if (intersections.length > 0) pathToFloor.splitAt(intersections[0].offset)
                // if (intersections.length == 0 && !mainBlob.contains(pathToFloor.getPointAt(pathToFloor.length / 2))) {
                    pathToFloor.strokeColor = pencil
                    const forkPath = new Path([path.getPointAt((loc.offset + random(forkSize)) % path.length), pathToFloor.firstSegment.point, path.getPointAt((loc.offset - random(forkSize) + path.length) % path.length)])
                    forkPath.strokeColor = pencil
                    allCrutches.addChild(forkPath)
                    allCrutches.addChild(pathToFloor)
                    posOffset += 15
                // } else pathToFloor.remove()
            }
        }
    })
    blob.group.addChild(allCrutches)
    // allCrutches.sendToBack()
    return allCrutches
}

function getOrderedIntersections(path,paths){
    let intersections = []
    paths.forEach(p => {
        if (p instanceof Path || p instanceof CompoundPath)
            intersections.push(path.getIntersections(p, intersection => intersection.offset > 3 && intersection.offset < path.length - 3))
    })
    intersections = intersections.flat()
    intersections.sort((a, b) => a.offset - b.offset)
    return intersections
}


