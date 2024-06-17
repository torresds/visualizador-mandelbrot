const canva = document.getElementById("visualizer");
const slider = document.getElementById("iterations");
const sliderLabel = document.getElementById("iterations-label");
const ctx = canva.getContext("2d");
const width = canva.width;
const height = canva.height;

const colorPalette = [
  "#000000", "#1f1f1f", "#3f3f3f", "#5f5f5f", "#7f7f7f", "#9f9f9f", 
  "#bfbfbf", "#dfdfdf", "#ff0000", "#ff1f1f", "#ff3f3f", "#ff5f5f", 
  "#ff7f7f", "#ff9f9f", "#ffbfbf", "#ffdfdf", "#ffffff"
];


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

const getColor = m => {
  if (m === maxIterations) {
    return [0, 0, 0];
  }
  const colorIndex = Math.floor((m / maxIterations) * (colorPalette.length - 1));
  const hexCode = parseInt(colorPalette[colorIndex].slice(1), 16);
  const rgb = [(hexCode >> 16) & 255, (hexCode >> 8) & 255, hexCode & 255];
  return rgb;
}

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

      const color = getColor(m);
      const index = (x + y * width) * 4;
      [data[index], data[index + 1], data[index + 2], data[index + 3]] = [...color, 255];
    }
  }

  ctx.putImageData(imageData, 0, 0);
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
