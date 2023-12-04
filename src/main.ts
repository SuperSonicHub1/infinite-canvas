// TODO: Good optimization, but def premature ATM:
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas#use_multiple_layered_canvases_for_complex_scenes

const TWO_PI = 2 * Math.PI

function circle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number
) {
  ctx.beginPath()
  ctx.arc(x, y, r, 0, TWO_PI)
  ctx.fill()
}

const canvas = document.getElementById("canvas") as HTMLCanvasElement

function resize() {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}
window.addEventListener("resize", resize)
resize()

const ctx = canvas.getContext("2d") as CanvasRenderingContext2D

const SPACING = 30
const CIRC_RADIUS = 3

// i-hat, j-hat are positive
const cameraCoords = { x: 0, y: 0 }

// relative to client's window
let cursorCoords = { x: 0, y: 0 }
canvas.addEventListener("mousemove", e => {
  cursorCoords = { x: e.clientX, y: e.clientY }
})


// Dragging
let dragging = false

canvas.addEventListener("mousedown", (e) => {
  if (e.button === 0) {
    e.preventDefault()
    dragging = true
  }
})

canvas.addEventListener("mouseup", (e) => {
  if (e.button === 0) {
    e.preventDefault()
    dragging = false
  }
})

canvas.addEventListener("mousemove", (e) => {
  if (dragging) {
    // Move less as you zoom in more
    cameraCoords.x -= e.movementX * 1/scale
    cameraCoords.y -= e.movementY * 1/scale
    e.preventDefault()
  }
})

canvas.addEventListener("mouseleave", () => {
  dragging = false
})

// Zooming
// https://developer.mozilla.org/en-US/docs/Web/API/Element/wheel_event
let scale = 1
canvas.addEventListener("wheel", (e) => {
  scale = Math.max(0.4, scale + e.deltaY * -0.001)
  console.log(e.deltaMode)
  e.preventDefault()
})

function draw() {
  
  ctx.save()

  // Background
  ctx.fillStyle = "lightgrey"
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save()      // TODO: Fix pop-in on x-axis

  
  // Zoom effect
  // TODO: Zoom in/out from cursor pos
  ctx.scale(scale, scale);

  // Base background

  // Circles
  ctx.fillStyle = "silver"
  // Draw just offscreen to stop pop-in
  for (let x = 0; x <= canvas.width * (1 / scale + 0.2); x += SPACING) {
    for (let y = 0; y <= canvas.height * (1 / scale + 0.2); y += SPACING) {
      circle(ctx, x + (-cameraCoords.x % SPACING) , y + (-cameraCoords.y % SPACING), CIRC_RADIUS)
    }
  }

  // Draw circle at canvas origin
  ctx.fillStyle = "black"
  ctx.save()
  ctx.translate(canvas.width / 2, canvas.height / 2)
  circle(ctx, -cameraCoords.x, -cameraCoords.y, CIRC_RADIUS * 2)
  ctx.restore()

  ctx.restore()

  // Debug text
  ctx.fillStyle = "black"
  ctx.font = "2em sans-serif";
  ctx.fillText(`Camera Coords: (${cameraCoords.x}, ${cameraCoords.y})`, 10, 50)
  ctx.fillText(`Cursor Coords: (${cursorCoords.x}, ${cursorCoords.y})`, 10, 100)
  ctx.fillText(`Scale: ${scale}`, 10, 150)
  
  ctx.restore()

  // Do it all again
  requestAnimationFrame(draw)
}

requestAnimationFrame(draw)
