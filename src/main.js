import { Application, Graphics, Assets } from 'pixi.js'

const showInfo = (text) => {
  document.getElementById('infoBox').innerText = text
}

async function init() {
  const app = new Application()
  await app.init({
    width: window.innerWidth,
    height: window.innerHeight,
    background: '#f4f4f4',
    antialias: true,
    resolution: window.devicePixelRatio || 1,
  })

  document.body.appendChild(app.canvas)

  const shapesRes = await fetch('data/shapes.json')
  const shapesData = await shapesRes.json()

  const texturePaths = ['textures/stone.jpg', 'textures/marble.jpg']
  const loadedTextures = await Assets.load(texturePaths)

  const shapes = []
  let hoveredGroup = null

  function getScreenPoints(normPoints) {
    const baseSize = Math.min(app.screen.width, app.screen.height)
    const offsetX = (app.screen.width - baseSize) / 2
    const offsetY = (app.screen.height - baseSize) / 2
    return normPoints.map(([nx, ny]) => [
      nx * baseSize + offsetX,
      ny * baseSize + offsetY,
    ]).flat()
  }

  // Create polygons
  shapesData.shapes.forEach((s) => {
    const texture = loadedTextures[s.texture]
    const points = getScreenPoints(s.points)
    const poly = new Graphics()

    // Pixi v8 drawing syntax
    poly
      .poly(points)
      .fill({ texture })
      .closePath()

    poly.shapeId = s.id
    poly.shapeGroup = s.group
    poly.shapePoints = s.points
    poly.interactive = true
    poly.cursor = 'pointer'

    poly.on('pointerover', () => {
      hoveredGroup = s.group
      highlightGroup()
    })
    poly.on('pointerout', () => {
      hoveredGroup = null
      highlightGroup()
    })
    poly.on('pointerdown', () => {
      console.log(`Clicked shape: id=${s.id}, group=${s.group}`)
      showInfo(`Group: ${s.group} | ID: ${s.id}`)
    })

    shapes.push(poly)
    app.stage.addChild(poly)
  })

  function highlightGroup() {
    const baseSize = Math.min(app.screen.width, app.screen.height)
    const outlineThickness = Math.max(2, Math.min(8, Math.round(baseSize * 0.005)))
    const outlineColor = 0xff6347 // tomato

    shapes.forEach((poly) => {
      const texture = loadedTextures[
        poly.shapeGroup === 'A' ? 'textures/stone.jpg' : 'textures/marble.jpg'
      ]
      const points = getScreenPoints(poly.shapePoints)
      poly.clear()

      // Pixi v8 API again for fill + optional stroke
      const g = poly
        .poly(points)
        .fill({ texture })

      if (hoveredGroup && poly.shapeGroup === hoveredGroup) {
        g.stroke({ color: outlineColor, width: outlineThickness })
      }

      g.closePath()
    })
  }

  window.addEventListener('resize', () => {
    app.renderer.resize(window.innerWidth, window.innerHeight)
    highlightGroup()
  })
}

init()
