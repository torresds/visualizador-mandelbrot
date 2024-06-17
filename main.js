const canva = document.getElementById("visualizer");
const slider = document.getElementById("iterations");
const sliderLabel = document.getElementById("iterations-label");
const ctx = canva.getContext("2d");
const width = canva.width;
const height = canva.height;

let maxIterations = parseInt(slider.value, 10);
let currentZoom = 200;
let currentPanX = 0;
let currentPanY = 0;
let startX;
let startY;
let isDragging = false;
let initialPinchDistance = null;

sliderLabel.innerText = `Iterações (${maxIterations})`;

const mandelbrot = c => {
  let x = 0, y = 0, iteration = 0;
  while (x * x + y * y <= 4 && iteration < maxIterations) {
    const xTemp = x * x - y * y + c.x;
    y = 2 * x * y + c.y;
    x = xTemp;
    iteration++;
  }
  return iteration;
};

const draw = (zoom, panX, panY) => {
  const imageData = ctx.createImageData(width, height);
  const data = imageData.data;

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const c = {
        x: (x - width / 2) / zoom + panX,
        y: (y - height / 2) / zoom + panY
      };
      const m = mandelbrot(c);

      const color = m === maxIterations ? [0, 0, 0] : hslToRgb(Math.log(m) / Math.log(maxIterations) * 360 / 360, 1, 0.5);
      const index = (x + y * width) * 4;
      [data[index], data[index + 1], data[index + 2], data[index + 3]] = [...color, 255];
    }
  }

  ctx.putImageData(imageData, 0, 0);
};

const hslToRgb = (h, s, l) => {
  if (s === 0) return [l, l, l].map(v => Math.round(v * 255));

  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [hue2rgb(p, q, h + 1 / 3), hue2rgb(p, q, h), hue2rgb(p, q, h - 1 / 3)].map(v => Math.round(v * 255));
};

const animate = () => {
  draw(currentZoom, currentPanX, currentPanY);
  requestAnimationFrame(animate);
};

const updateIterations = () => {
  maxIterations = parseInt(slider.value, 10);
  sliderLabel.innerText = `Iterações (${maxIterations})`;
  draw(currentZoom, currentPanX, currentPanY);
};

const handleWheel = event => {
  currentZoom *= event.deltaY > 0 ? 1.1 : 1 / 1.1;
  draw(currentZoom, currentPanX, currentPanY);
};

const startDragging = event => {
  startX = event.pageX;
  startY = event.pageY;
  isDragging = true;
};

const stopDragging = () => {
  isDragging = false;
};

const drag = event => {
  if (isDragging) {
    const diffX = (event.pageX - startX) / currentZoom;
    const diffY = (event.pageY - startY) / currentZoom;
    currentPanX -= diffX;
    currentPanY -= diffY;
    startX = event.pageX;
    startY = event.pageY;
    draw(currentZoom, currentPanX, currentPanY);
  }
};

const handleTouchStart = event => {
  event.preventDefault();
  if (event.touches.length === 1) {
    startX = event.touches[0].pageX;
    startY = event.touches[0].pageY;
    isDragging = true;
  } else if (event.touches.length === 2) {
    initialPinchDistance = Math.hypot(
      event.touches[0].pageX - event.touches[1].pageX,
      event.touches[0].pageY - event.touches[1].pageY
    );
  }
};

const handleTouchMove = event => {
  event.preventDefault();
  if (isDragging && event.touches.length === 1) {
    const diffX = (event.touches[0].pageX - startX) / currentZoom;
    const diffY = (event.touches[0].pageY - startY) / currentZoom;
    currentPanX -= diffX;
    currentPanY -= diffY;
    startX = event.touches[0].pageX;
    startY = event.touches[0].pageY;
    draw(currentZoom, currentPanX, currentPanY);
  } else if (event.touches.length === 2) {
    const newPinchDistance = Math.hypot(
      event.touches[0].pageX - event.touches[1].pageX,
      event.touches[0].pageY - event.touches[1].pageY
    );
    currentZoom *= newPinchDistance / initialPinchDistance;
    initialPinchDistance = newPinchDistance;
    draw(currentZoom, currentPanX, currentPanY);
  }
};

const handleTouchEnd = event => {
  event.preventDefault();
  isDragging = false;
  initialPinchDistance = null;
};

window.onload = animate;
window.addEventListener("wheel", handleWheel);
slider.oninput = updateIterations;
canva.addEventListener("mousedown", startDragging);
canva.addEventListener("mousemove", drag);
canva.addEventListener("mouseup", stopDragging);
canva.addEventListener("mouseout", stopDragging);
canva.addEventListener("touchstart", handleTouchStart);
canva.addEventListener("touchmove", handleTouchMove);
canva.addEventListener("touchend", handleTouchEnd);
