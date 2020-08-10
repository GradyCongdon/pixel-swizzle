const $ = (selector) => document.querySelector(selector);

const canvas = $('#main');
const ctx = canvas.getContext('2d');

const _canvas = {
  height: 550,
  width: 550
};

const _pallete = {
  height: 50,
  width: 50,
};

const run = () => {
  const image = $('#source');
  ctx.drawImage(image, 0, 0, _canvas.width, _canvas.height);
  const data = ctx.getImageData(0,0, _canvas.width, _canvas.height);
};

const getPostion = (canvas, event) => { 
  let rect = canvas.getBoundingClientRect(); 
  let x = event.clientX - rect.left; 
  let y = event.clientY - rect.top; 
  console.log(x,y);
  return {x,y};
};

const getCanvasPostion = getPostion.bind(null, canvas);

const red = (imageData, x,y) => {
  imageData.data[0] = 255;
  ctx.putImageData(imageData,x,y);
}

const getPixel = (x,y) => {
  const data = ctx.getImageData(x,y,1,1);
  return {
    x,y,
    data
  };
}

const pretty = (pixel) => {
  return {
    x: pixel.x,
    y: pixel.y,
    r: pixel.data.data[0],
    g: pixel.data.data[1],
    b: pixel.data.data[2],
    a: pixel.data.data[3],
  };
}

const getRgbaCss = (p) => {
  const {r,g,b,a} = pretty(p);
  return `rgba(${r},${g},${b},${a})`;
}

const setA = (pixel) => {
  ctx.fillStyle = getRgbaCss(pixel);
  ctx.fillRect(0, _canvas.height - _pallete.height, _pallete.width, _pallete.height);
  ctx.strokeStyle = "white";
  ctx.lineWidth  = 1;
  ctx.strokeRect(0, _canvas.height - _pallete.height, _pallete.width, _pallete.height);

}

const setB = (pixel) => {
  ctx.fillStyle = getRgbaCss(pixel);
  ctx.fillRect(_pallete.width, _canvas.height - _pallete.height, _pallete.width, _pallete.height);
  ctx.strokeStyle = "blue";
  ctx.lineWidth  = 1;
  ctx.strokeRect(_pallete.width, _canvas.height - _pallete.height, _pallete.width, _pallete.height);
}

const swapPixels = (a,b) => {
  console.log(pretty(a));
  console.log(pretty(b));
  ctx.putImageData(b.data, a.x, a.y);
  ctx.putImageData(a.data, b.x, b.y);
  setA(a);
  setB(b);
}

const swapPixelsCanvas = (e) => {
  const {x, y} = getCanvasPostion(e);
  const a = getPixel(x,y);
  const b = getPixel(x+30, y+30);
  swapPixels(a,b);
}

const viewPixelsCanvas = (e) => {
  const {x, y} = getCanvasPostion(e);
  const a = getPixel(x,y);
  const b = getPixel(x+30, y+30);
  setA(a);
  setB(b);
}


canvas.addEventListener("mousedown", swapPixelsCanvas);
canvas.addEventListener("mousemove", swapPixelsCanvas);

window.addEventListener('load', function() {
    console.log('All assets are loaded')
    run();
})
