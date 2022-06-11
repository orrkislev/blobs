class Blob {
    constructor(path) {
        this.path = path
        this.group = new Group([this.path])
        this.paintPaths = new Group()
        this.group.addChild(this.paintPaths)
    }

    apply(func){
        this.getPaths().forEach(path => func(path) )
    }

    getPaths() {
        if (this.path.children) return this.path.children
        return [this.path]
    }

    initDraw(){
        this.bg = this.path.clone()
        this.bg.fillColor = 'white'
        this.group.addChild(this.bg)
        this.bg.sendToBack()
        this.path.strokeColor = pencil
        this.drawFolds(this.path)
    }

    draw(fillColor) {
        this.initDraw()
        this.path.fillColor = fillColor
    }

    paint(fillColor) {
        this.initDraw()
        this.path.waterColor(fillColor, this)
    }

    shadows(angleOffset, clr) {
        this.shadowPaths = new Group()
        this.group.addChild(this.shadowPaths)
        this.getPaths().forEach(path => {
            let groups = []
            let points = []
            let offset = 0
            for (let i = 0; i < path.length; i += 10) {
                const loc = path.getLocationAt(i)
                const rotatedNormal = loc.normal.rotate(-angleOffset)
                const newOffset = abs(rotatedNormal.angle) - 90
                offset = offset + (newOffset - offset) / 10
                if (offset < 0) {
                    if (points.length == 0) points.push(i)
                    points.push(loc.point.add(loc.normal.multiply(offset)))
                } else if (points.length > 0) {
                    points.push(i)
                    groups.push([...points])
                    points = []
                }
            }
            groups.forEach(group => {
                points = []
                const start = group.shift()
                const end = group.pop()
                for (let i = start; i < end; i += 2) {
                    points.push(path.getPointAt(i))
                }
                points.reverse()
                group = group.filter(p => path.contains(p))
                const paintPath = new Path([...group, ...points])
                paintPath.simplify(5)
                paintPath.waterColor(clr, this)
                this.shadowPaths.addChild(paintPath)
            })
        })
    }

    doFoldShadows(clr) {
        this.foldShadows = new Group()
        this.group.addChild(this.foldShadows)
        this.getPaths().forEach(path => {
            this.folds.children.forEach(fold => {
                const loc = path.getNearestLocation(fold.firstSegment.point)
                if (loc.point.getDistance(fold.firstSegment.point) > 3) return
                let startOffset = loc.offset - 30
                if (startOffset < 0) startOffset = path.length + startOffset
                const points = []
                for (let i = startOffset; i < startOffset + 60; i += 5) {
                    points.push(path.getPointAt(i % path.length))
                }
                const pathToDraw = new Path(points)
                const tangentStength = random(10, 20)
                pathToDraw.add(new Segment(
                    fold.lastSegment.point, 
                    fold.lastSegment.location.tangent.multiply(-tangentStength), 
                    fold.lastSegment.location.tangent.multiply(-tangentStength)))
                pathToDraw.closePath()
                pathToDraw.waterColor(clr, this)
                this.foldShadows.addChild(pathToDraw)
            })
        })
    }

    drawFolds() {
        this.folds = this.folds || new Group()
        this.group.addChild(this.folds)

        this.getPaths().forEach(path => {
            path.segments.forEach((seg, i) => {
                if (this.folds.children.length > 0) {
                    const minDistance = this.folds.children.map(a => a.getNearestPoint(seg.point).getDistance(seg.point)).reduce((a, b) => a < b ? a : b)
                    if (minDistance < 30) return
                }

                if (seg.handleIn.rotate(180).angle != seg.handleOut.angle) {
                    // if inner corner
                    if (path.contains(seg.point.add(seg.handleIn)) && path.contains(seg.point.add(seg.handleOut))) {
                        if (random() < 0.5) return
                        const loc1 = seg.location
                        const locationOffset = random(10, 25)
                        const loc2 = path.getLocationAt((seg.location.offset + locationOffset) % path.length)
                        const offset = -random(15)
                        const offsetPosition1 = loc1.point.add(loc1.normal.multiply(offset))
                        const offsetPosition2 = loc2.point.add(loc2.normal.multiply(offset))
                        const seg1 = new Segment(offsetPosition1, loc1.tangent.multiply(-locationOffset))
                        const seg2 = new Segment(offsetPosition2, loc2.tangent.multiply(-locationOffset))
                        const fold = new Path([seg1, seg2])
                        this.folds.addChild(fold)
                    } else {
                        const largeHandle = seg.handleIn.length > seg.handleOut.length ? seg.handleIn.clone() : seg.handleOut.clone()
                        largeHandle.angle -= 180
                        largeHandle.length = random(10, 40)

                        if (path.contains(seg.point.add(largeHandle))) {
                            const seg1 = new Segment(seg.point, null, largeHandle)
                            largeHandle.angle -= 10
                            const seg2 = new Segment(seg.point.add(largeHandle))
                            const fold = new Path([seg1, seg2])
                            this.folds.addChild(fold)
                        }
                    }
                }
            })
            path.segments.forEach((seg, i) => {
                const handlePos1 = seg.point.add(seg.handleIn)
                const handlePos2 = seg.point.add(seg.handleOut)
                if (path.contains(handlePos1) && path.contains(handlePos2)) {
                    const seg1 = new Segment(seg.point, null, seg.location.normal.multiply(-10).rotate(random(-30,30)))
                    const seg2 = new Segment(seg.point.add(seg.location.normal.multiply(-random(5,10    ))))
                    const fold = new Path([seg1, seg2])
                    this.folds.addChild(fold)
                }
            })
        })


        this.folds.strokeColor = pencil
    }

    join(blob) {
        this.path = this.path.unite(blob.path)
        return this
    }

    cut(blob) {
        this.path = this.path.subtract(blob.path)
        if (this.path.segments) {
            for (let i = 0; i < this.path.segments.length; i++) {
                const seg = this.path.segments[i]
                if (blob.path.contains(seg.point)) {
                    this.path.divideAt(seg.location.offset - 5)
                    this.path.divideAt(seg.location.offset + 5)
                    this.path.removeSegment(i + 1)
                    i++
                }
            }
        }
        return this
    }

    randomOnBorder() {
        const borderPath = choose(this.getPaths())
        return borderPath.getLocationAt(random(borderPath.length))
    }

    contains(point) {
        return this.path.contains(point)
    }

    dropShadowOn(blob, clr) {
        this.getPaths().forEach(path => {
            const b = path.clone().wonky(1.5, 2)
            b.waterColor(clr, blob)
            b.remove()
        })
    }
}
