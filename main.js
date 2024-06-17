const canva = document.getElementById("visualizer");
const slider = document.getElementById("iterations");
const sliderLabel = document.getElementById("iterations-label");
const ctx = canva.getContext("2d");
const width = canva.width;
const height = canva.height;

let maxIterations = parseInt(slider.value, 10);
sliderLabel.innerText = `Iterações (${maxIterations})`;
let currentZoom = 200;
let currentPanX = 0;
let currentPanY = 0;
let startX;
let startY;
let isDragging = false;
let initialPinchDistance = null;

const mandelbrot = c => {
  let x = 0, y = 0, iteration = 0;
  while (x * x + y * y <= 4 && iteration < maxIterations) {
    let xTemp = x * x - y * y + c.x;
    y = 2 * x * y + c.y;
    x = xTemp;
    iteration++;
  }
  return iteration;
};

const draw = (zoom, panX, panY) => {
  const renderWidth = width;
  const renderHeight = height;
  const imageData = ctx.createImageData(renderWidth, renderHeight);
  const data = imageData.data;

  for (let x = 0; x < renderWidth; x++) {
    for (let y = 0; y < renderHeight; y++) {
      const c = {
        x: (x - renderWidth / 2) / zoom + panX,
        y: (y - renderHeight / 2) / zoom + panY
      };
      const m = mandelbrot(c);

      let color;
      if (m === maxIterations) {
        color = [0, 0, 0]; 
      } else {
        const hue = Math.log(m) / Math.log(maxIterations) * 360;
        color = hslToRgb(hue / 360, 1, 0.5); 
      }

      const index = (x + y * renderWidth) * 4;
      data[index] = color[0];
      data[index + 1] = color[1];
      data[index + 2] = color[2];
      data[index + 3] = 255; 
    }
  }

  const offscreenCanvas = document.createElement('canvas');
  offscreenCanvas.width = renderWidth;
  offscreenCanvas.height = renderHeight;
  const offscreenCtx = offscreenCanvas.getContext('2d');
  offscreenCtx.putImageData(imageData, 0, 0);

  ctx.clearRect(0, 0, width, height);
  ctx.drawImage(offscreenCanvas, 0, 0, width, height);
};

const hslToRgb = (h, s, l) => {
  let r, g, b;
  if (s === 0) {
    r = g = b = l; 
  } else {
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
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
};

const animate = () => {
  draw(currentZoom, currentPanX, currentPanY);
  requestAnimationFrame(animate);
};

window.onload = () => {
  animate();
};

window.addEventListener("wheel", event => {
  event.deltaY > 0 ? currentZoom *= 1.1 : currentZoom /= 1.1;
  draw(currentZoom, currentPanX, currentPanY);
});

canva.addEventListener('mousedown', function (event) {
  startX = event.pageX;
  startY = event.pageY;
  isDragging = true;
});

canva.addEventListener('mousemove', function (event) {
  if (isDragging) {
    const diffX = (event.pageX - startX) / currentZoom;
    const diffY = (event.pageY - startY) / currentZoom;
    currentPanX -= diffX;
    currentPanY -= diffY;
    startX = event.pageX;
    startY = event.pageY;
    draw(currentZoom, currentPanX, currentPanY);
  }
});

canva.addEventListener('mouseup', function () {
  isDragging = false;
});

canva.addEventListener('mouseout', function () {
  isDragging = false;
});

canva.addEventListener('touchstart', function (event) {
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
});

canva.addEventListener('touchmove', function (event) {
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
    const pinchRatio = newPinchDistance / initialPinchDistance;
    currentZoom *= pinchRatio;
    initialPinchDistance = newPinchDistance;
    draw(currentZoom, currentPanX, currentPanY);
  }
});

canva.addEventListener('touchend', function (event) {
  event.preventDefault();
  isDragging = false;
  initialPinchDistance = null;
});

slider.oninput = function () {
  maxIterations = parseInt(slider.value, 10);
  sliderLabel.innerText = `Iterações (${maxIterations})`;
  draw(currentZoom, currentPanX, currentPanY);
};
