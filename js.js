const $ = (selector) => document.querySelector(selector);

const canvas = $('#canvas');
const ctx = canvas.getContext('2d');

let active = true;
const toggleActive = (e) => {
  active = !active;
}

const _canvas = {
  height: 550,
  width: 550
};


const psize = 50;
const _pallete = {
  height: psize,
  width: psize,
  border: 1,
  borderOffset: 0,
  cellGap: 2,
};

const getPalleteSize = (pallete, rows, columns) => {
  const cellHeight = (pallete.height / columns);
  const cellWidth = (pallete.width / rows);
  const cellMargins = (pallete.border + pallete.cellGap - 0.5);
  const height = (cellHeight + cellMargins) * columns;
  const width = (cellWidth + cellMargins) * rows;
  return {
    height,
    width
  };
}


const _pixel = {
  x: 15,
  y: 15,
};

const run = () => {
  const image = $('#source');
  ctx.drawImage(image, 0, 0, _canvas.width, _canvas.height);
  const data = ctx.getImageData(0,0, _canvas.width, _canvas.height);
};

const red = (pixel) => {
  const { x, y, image} = pixel
  image.data[0] = 255;
  ctx.putImageData(image, x,y);
}

const getClientPosition = (event) => {
  if (event.touches && event.touches[0]) {
    return {
      clientX: event.touches[0].clientX,
      clientY: event.touches[0].clientY,
    };
  }
  return {
    clientX: event.clientX,
    clientY: event.clientY
  }
};

const getPostion = (canvas, event) => { 
  let rect = canvas.getBoundingClientRect(); 
  const { clientX, clientY } = getClientPosition(event);
  let x = clientX - rect.left; 
  let y = clientY - rect.top; 
  // console.log({ clientX, x, clientY, y });
  return {x,y};
};

const getCanvasPostion = getPostion.bind(null, canvas);

const getPixel = (x,y) => {
  const image = ctx.getImageData(x,y,1,1);
  return {
    x,y,
    image
  };
}

const pretty = (pixel) => {
  return {
    x: pixel.x,
    y: pixel.y,
    r: pixel.image.data[0],
    g: pixel.image.data[1],
    b: pixel.image.data[2],
    a: pixel.image.data[3],
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
  ctx.lineWidth = _pallete.border;
  ctx.strokeRect(0, _canvas.height - _pallete.height, _pallete.width, _pallete.height);

}

const setB = (pixel) => {
  ctx.fillStyle = getRgbaCss(pixel);
  ctx.fillRect(_pallete.width, _canvas.height - _pallete.height, _pallete.width, _pallete.height);
  ctx.strokeStyle = "blue";
  ctx.lineWidth = _pallete.border;
  ctx.strokeRect(_pallete.width, _canvas.height - _pallete.height, _pallete.width, _pallete.height);
}

const drawPallete = (change) => {
  const rows = 3;
  const columns = 3;
  const { width, height } = getPalleteSize(_pallete, rows, columns);

  const bottom = _canvas.height - height;
  const drawDebugBefore = drawDebug(rows, 0, columns, bottom, 'white');
  change.before.forEach(drawDebugBefore);

  const afterGap = 1;
  const drawDebugAfter = drawDebug(rows, width + afterGap, columns, bottom, 'black');
  change.after.forEach(drawDebugAfter);
}

const drawDebug = (rows, offsetX, columns, offsetY, color) => {
  const width = _pallete.width / rows;
  const height = _pallete.height / columns;

  return function(pixel, i) {
    const border2x = (_pallete.border * 2) 
    const row = ~~(i / rows);
    const column = i % columns;

    const cellWidth = (_pallete.cellGap + _pallete.width / rows);
    const x = offsetX + border2x + cellWidth * column;

    const cellHeight = (_pallete.cellGap + _pallete.height / columns);
    const y = offsetY + border2x + cellHeight * row;

    // console.log({ i, row, column, x, y, cellWidth, cellHeight, }); 
    
    ctx.fillStyle = getRgbaCss(pixel);
    ctx.fillRect(x, y, width,height);

    ctx.lineWidth  = _pallete.border;
    ctx.strokeStyle = color
    // draw on half for 1 px borders
    ctx.fillRect(x + _pallete.borderOffset, y + _pallete.borderOffset, width,height);
  }
}


const swapPixels = (a,b) => {
  ctx.putImageData(b.image, a.x, a.y);
  ctx.putImageData(a.image, b.x, b.y);
}

const getAB = (e) => {
  const {x, y} = getCanvasPostion(e);
  const a = getPixel(x,y);
  const b = getPixel(x+_pixel.x, y + _pixel.y);
  return {a,b};
}

const swapCross = (event) => {
  const {x, y} = getCanvasPostion(event);

  // abc
  // def
  // ghi
  const a = getPixel(x-1,y-1);
  const b = getPixel(x,y-1);
  const c = getPixel(x+1,y-1);
  const d = getPixel(x-1,y);
  const e = getPixel(x,y);
  const f = getPixel(x+1,y);
  const g = getPixel(x-1,y+1);
  const h = getPixel(x,y+1);
  const i = getPixel(x+1,y+1);

  const before = [a,b,c,d,e,f,g,h,i];

  swapPixels(a,i);
  swapPixels(c,g);
  swapPixels(b,h);
  swapPixels(d,f);

  const after = [i,h,g,f,e,d,c,b,a];
  return {
    before, after
  };

}


let touchCount = 0;
let mouseCount = 0;
const $touches = $('#touches');
const $mouses = $('#mouses');
const $debug = $('#debug');

const swapPixelsCanvas = (e) => {
  const { a, b } = getAB(e);
  swapPixels(a,b);
  setA(a);
  setB(b);
}

const viewPixelsCanvas = (e) => {
  const { a, b } = getAB(e);
  setA(a);
  setB(b);
}

const swapCrossCanvas = (e) => {
  if (!active) {
    return;
  }

  const change = swapCross(e);
  drawPallete(change);
}

const touchMove = (e) => {
  $touches.innerText = touchCount++;
  swizzle(e);
}

const mouseMove = (e) => {
  $mouses.innerText = mouseCount++;
  swizzle(e);
}

/*
const swizzle = (e) => {
  const {x, y} = getCanvasPostion(e);
  const a = getPixel(x,y);
  red(a);
}
*/

const swizzle = swapCrossCanvas;

canvas.addEventListener("mousedown", toggleActive);
canvas.addEventListener("mousemove", mouseMove);

canvas.addEventListener("touchmove", touchMove);

window.addEventListener('load', function() {
    console.log('loaded')
    run();
})
