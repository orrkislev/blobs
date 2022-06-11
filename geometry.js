const Path = paper.Path
const Point = paper.Point
const Segment = paper.Segment
const Group = paper.Group
const CompoundPath = paper.CompoundPath
const CurveLocation = paper.CurveLocation

const DIRS = { UP: new Point(0, -1), DOWN: new Point(0, 1), LEFT: new Point(-1, 0), RIGHT: new Point(1, 0) }
const p = (x, y) => new Point(x, y)
const randomPoint = () => new Point(random(-1, 1), random(-1, 1)).normalize()
const pointFromAngle = (angle) => new Point(1, 0).rotate(angle)
const positiveAngle = (angle) => angle > 0 ? angle : angle + 360

paper.Path.prototype.getSection = function (from, to) {
    if (typeof from === 'number') from = this.getPointAt(from)
    else if (from instanceof Point) from = this.getNearestPoint(from)
    else if (from instanceof CurveLocation) from = this.getNearestPoint(from.point)
    if (!from) from = from = this.getPointAt(0)

    if (typeof to === 'number') to = this.getPointAt(to)
    else if (to instanceof Point) to = this.getNearestPoint(to)
    else if (to instanceof CurveLocation) to = this.getNearestPoint(to.point)
    if (!to) to = this.getPointAt(this.length)

    if (from.equals(to)) return

    const newPath = this.clone()
    const newPath2 = newPath.splitAt(newPath.getNearestLocation(from).offset)
    const keepPath = pointOnWhichPath(to, newPath, newPath2)
    const keepPath2 = keepPath.splitAt(keepPath.getNearestLocation(to).offset)
    const result = pointOnWhichPath(from, keepPath, keepPath2).clone()
    if (newPath) newPath.remove()
    if (newPath2) newPath2.remove()
    if (keepPath) keepPath.remove()
    if (keepPath2) keepPath2.remove()
    return result
}

function pointOnWhichPath(point,path1,path2){
    if (!path1) return path2
    if (!path2) return path1
    if (path1.getLocationOf(point)) return path1
    if (path2.getLocationOf(point)) return path2
    const pointOnPath1 = path1.getNearestPoint(point)
    const pointOnPath2 = path2.getNearestPoint(point)
    return pointOnPath1.getDistance(point) < pointOnPath2.getDistance(point) ? path1 : path2
}


paper.Path.prototype.offset = function (offset) {
    const res = new Path()
    this.segments.forEach(seg => {
        const newSeg = seg.clone()
        newSeg.point = newSeg.point.add(seg.location.normal.multiply(offset))
        res.add(newSeg)
    })
    if (this.closed) res.closePath()
    return res
}






paper.Path.prototype.wonky = function (minVal = 0.8, maxVal = 1.2) {
    this.simplify()
    const pos = this.position.clone()
    this.translate(-pos.x, -pos.y)
    this.segments.forEach(p => {
        p.point = p.point.multiply(random(minVal, maxVal))
    })
    this.translate(pos.x, pos.y)
    return this
}
paper.Path.prototype.blocky = function () {
    for (let i = 0; i < this.length; i += random(20, 100)) {
        this.divideAt(i)
    }
    this.segments.forEach(p => p.handleIn = p.handleIn.multiply(random(.3, 1)))
    this.segments.forEach(p => p.handleOut = p.handleOut.multiply(random(.3, 1)))
    return this
}


paper.CompoundPath.prototype.waterColor = function (clr, parentPath) {
    for (let i = 0; i < this.children.length; i++) this.children[i].waterColor(clr,parentPath)
}

paper.Path.prototype.waterColor = function (clr, blob) {
    const waterColorClr = new paper.Color(clr)
    waterColorClr.alpha = 0.04

    const thisWidth = this.bounds.width
    const thisHeight = this.bounds.height

    const base = this.clone()
    base.fillColor = null
    base.strokeColor = null

    for (let i = 0; i < 30; i++) {
        let newShape = base.rebuild(10).deform(2)
        if (blob) {
            const newnewShape = newShape.intersect(blob.path)
            newShape.remove()
            newShape = newnewShape
        }
        const otherColor = new paper.Color(clr)
        otherColor.alpha = 0.03
        otherColor.brightness = otherColor.brightness + .4
        otherColor.saturation = otherColor.saturation - .5
        const origin = p(this.bounds.topLeft).add(random(thisWidth), random(thisHeight))
        newShape.fillColor = {
            gradient: {
                stops: [[waterColorClr, random(.6, .8)], [otherColor, 1]],
                radial: true
            },
            origin,
            destination: origin.add(random(thisWidth*2), random(thisHeight*2))
        }
        const myGroup = blob ? blob.paintPaths : otherPaintPaths
        myGroup.insertChild(round_random(myGroup.children.length), newShape)
    }
    base.remove()
}

paper.Path.prototype.rebuild = function (numPoints) {
    numPoints = max(numPoints, this.segments.length)
    const newPath = new paper.Path()
    newPath.strokeColor = this.strokeColor
    newPath.strokeWidth = this.strokeWidth
    newPath.strokeCap = this.strokeCap
    newPath.strokeJoin = this.strokeJoin
    newPath.closed = this.closed
    newPath.fillColor = this.fillColor
    for (let i = 0; i < numPoints; i++) {
        const point = this.getPointAt(i / numPoints * this.length)
        newPath.add(point)
    }
    newPath.smooth()
    return newPath
}

paper.Path.prototype.deform = function (numTimes = 1) {
    const deformed = this.clone()
    for (let deformTimes = 0; deformTimes < numTimes; deformTimes++) {
        for (let i = 0; i < deformed.segments.length; i++) {
            const seg1 = deformed.segments[i]
            const seg2 = deformed.segments[(i + 1) % deformed.segments.length]
            const dist = seg1.point.getDistance(seg2.point)
            if (dist < 1) continue
            const offset1 = seg1.location.offset
            const offset2 = seg2.location.offset
            const middleOffset = offset2 > offset1 ? (offset1 + offset2) / 2 : ((offset2 + deformed.length + offset1) / 2) % deformed.length
            const newSeg = deformed.divideAt(middleOffset)
            if (newSeg) {
                const noiseVal = noise(newSeg.point.x / 200, newSeg.point.y / 200) * 8
                const moveOffset = p(0, 1).rotate(random(360)).multiply(dist / noiseVal)
                newSeg.point = newSeg.point.add(moveOffset)
            }
            i++
        }
    }
    return deformed
}