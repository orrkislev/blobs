let pencil = '#1B1B0F'


async function makeImage() {
    shape = new Path.Circle(new Point(width / 2, height / 2), 100);
    shape = shape.rebuild(4)

    for (let i = 0; i < 1000; i++) {
        diffGrow()
    }

    mainBlob = new Blob(shape)
    mainBlob.draw(pencil)
    mainBlob.path.fillColor = null
    mainBlob.path.waterColor('#52b788')
    mainBlob.shadows(0,'green')
    
}

function diffGrow() {
    shape.segments.forEach((seg, i) => {
        const prevSeg = i == 0 ? shape.lastSegment : shape.segments[i - 1]
        const nextSeg = shape.segments[(i + 1) % shape.segments.length]
        const middlePoint = nextSeg.point.add(prevSeg.point).divide(2)

        
        if (seg.point.getDistance(middlePoint) > 20) seg.point = seg.point.add(attract(seg.point, middlePoint),5)
        if (seg.point.getDistance(prevSeg.point) > 50) seg.point = seg.point.add(attract(seg.point, prevSeg.point),5)
        if (seg.point.getDistance(nextSeg.point) > 50) seg.point = seg.point.add(attract(seg.point, nextSeg.point),5)
        for (let j = 0; j < shape.segments.length; j++) {
            if (i != j) {
                if (seg.point.getDistance(shape.segments[j].point) < 50) seg.point = seg.point.add(repel(seg.point, shape.segments[j].point,5))
            }
        }
    })

    // if distance between two segments is large, divide between them
    for (let i = 0; i < shape.segments.length - 1; i++) {
        const seg = shape.segments[i]
        const nextSeg = shape.segments[(i + 1) % shape.segments.length]
        const distBetweenSegs = seg.point.getDistance(nextSeg.point)
        if (distBetweenSegs > 30) {
            shape.divideAt((nextSeg.location.offset + seg.location.offset) / 2)
            shape.smooth()
            i++
        }
    }

    if (random()<0.1) shape.divideAt(random(shape.length))
    // if (random()<0.02) shape.simplify()
}

function attract(p1, p2, forceMultipler = 1) {
    // force strength should be inversly proportional to distance, exponentially
    const forceStrength = forceMultipler / (p1.getDistance(p2) * p1.getDistance(p2))
    const force = p2.subtract(p1).multiply(forceStrength).multiply(0.1)
    return force
}

function repel(p1, p2, forceMultipler = 1) {
    return attract(p1, p2, forceMultipler).multiply(-1)
}