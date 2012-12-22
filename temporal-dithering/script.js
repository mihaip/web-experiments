function processImage(image) {
  var frameContainer = document.querySelector('#frame-container');
  frameContainer.style.width = image.width + 'px';
  frameContainer.style.height = image.height + 'px';

  var imageCanvas = document.createElement('canvas');
  imageCanvas.width = image.width;
  imageCanvas.height = image.height;
  var imageContext = imageCanvas.getContext('2d');
  imageContext.drawImage(image, 0, 0);

  var imageData = imageContext.getImageData(0, 0, image.width, image.height);
  var imagePixels = imageData.data;

  // TODO
  var displayCanvas = imageCanvas;

  var displayContext = displayCanvas.getContext('2d');
  var positiveData = displayContext.createImageData(image.width, image.height);
  var positivePixels = positiveData.data;
  var negativeData = displayContext.createImageData(image.width, image.height);
  var negativePixels = negativeData.data;

  var tileSigns = {};

  var tileSize = parseInt(document.querySelector('#tile-size').value, 10);
  document.querySelector('#tile-size-display').textContent = tileSize;
  var overflow = parseFloat(document.querySelector('#overflow').value);
  document.querySelector('#overflow-display').textContent = overflow;

  function generateOffset(value, x, y) {
      var maxDelta = Math.min(value, 255 - value);
      maxDelta *= overflow;
      var offset = maxDelta/2 + Math.random() * maxDelta/2;
      var tileIndex = Math.floor(y/tileSize) * Math.floor(image.width/tileSize) + Math.floor(x/tileSize);
      var tileSign;
      if (tileIndex in tileSigns) {
        tileSign = tileSigns[tileIndex];
      } else {
        tileSign = Math.random() < 0.5 ? 1 : -1;
        tileSigns[tileIndex] = tileSign;
      }

      if (tileSign == -1) {
        offset *= -1;
      }
      return offset;
  }

  for (var y = 0; y < image.height; y++) {
    for (var x = 0; x < image.width; x++) {
      var pixelOffset = (y * image.width + x) * 4;
      var red = imagePixels[pixelOffset];
      var green = imagePixels[pixelOffset + 1];
      var blue = imagePixels[pixelOffset + 2];

      var redOffset = generateOffset(red, x, y);
      var greenOffset = generateOffset(green, x, y);
      var blueOffset = generateOffset(blue, x, y);

      positivePixels[pixelOffset] = red + redOffset;
      positivePixels[pixelOffset + 1] = green + greenOffset;
      positivePixels[pixelOffset + 2] = blue + blueOffset;
      positivePixels[pixelOffset + 3] = 255;

      negativePixels[pixelOffset] = red - redOffset;
      negativePixels[pixelOffset + 1] = green - greenOffset;
      negativePixels[pixelOffset + 2] = blue - blueOffset;
      negativePixels[pixelOffset + 3] = 255;
    }
  }

  function renderFrame(data, frameImage, displayContainer) {
    displayContext.putImageData(data, 0, 0);

    var dataUrl = displayCanvas.toDataURL();

    frameImage.src = dataUrl;

    displayContainer.innerHTML = '';
    var displayImage = document.createElement('img');
    displayImage.src = dataUrl;
    displayContainer.appendChild(displayImage);
  }

  renderFrame(
    positiveData,
    document.querySelector('#positive-frame'),
    document.querySelector('#positive-display'));
  renderFrame(
    negativeData,
    document.querySelector('#negative-frame'),
    document.querySelector('#negative-display'));
}

function update() {
  processImage(document.querySelector('#source-display img'));
}

function updateSourceImage(sourceImageUrl) {
  var sourceDisplay = document.querySelector('#source-display');
  sourceDisplay.innerHTML = '';
  var sourceImage = document.createElement('img');
  sourceImage.src = sourceImageUrl;
  sourceImage.onload = function() {
    processImage(sourceImage);
  };
  sourceDisplay.appendChild(sourceImage);
}

function animate() {
  var raf =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    (function(callback) {setTimeout(callback, 0)});

  var negativeFrame = document.querySelector('#negative-frame');
  var zIndex = -1;

  raf(function frame() {
    negativeFrame.style.zIndex = zIndex;
    zIndex *= -1;
    raf(frame);
  });
}

onload = function() {
  document.querySelector('#mihai-source-image').onclick = function() {
    updateSourceImage('mihai.png');
  };
  document.querySelector('#lenna-source-image').onclick = function() {
    updateSourceImage('lenna.jpg');
  };
  document.querySelector('#file-source-image').onclick = function() {
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.onchange = function(e) {
      var reader = new FileReader();
      reader.onload = function(e) {
        updateSourceImage(e.target.result);
      }
      reader.readAsDataURL(fileInput.files[0]);
    }
    fileInput.click();
  };


  document.querySelector('#tile-size').onchange = update;
  document.querySelector('#overflow').onchange = update;
  updateSourceImage('mihai.png');
  animate();
};
