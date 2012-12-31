function Datasource(width, height) {
  this.width = width;
  this.height = height;  
}

Datasource.prototype = {
  fillTile: function(tile) {
    throw Error('Datasource implementations must implement fillTile');
  },
  
  start: function() {},
  stop: function() {}
};

function CheckerboardDatasource(width, height) {
  Datasource.call(this, width, height);
}

CheckerboardDatasource.prototype = {
  __proto__: Datasource.prototype,
  fillTile: function(tile) {
    tile.node.style.backgroundColor =
        (tile.xIndex % 2 + tile.yIndex) % 2 ? 'blue' : 'yellow';
  }
};

function ImageDatasource(url, width, height) {
  Datasource.call(this, width, height);
  this.url_ = url;
}

ImageDatasource.prototype = {
  __proto__: Datasource.prototype,
  start: function() {
    if (!this.image_) {    
      this.image_ = new Image();
      this.image_.onload = this.onload_.bind(this);
      this.image_.src = this.url_;
    }
  },
  
  onload_: function() {
    this.isLoaded_ = true;
  },
  
  fillTile: function(tile) {
    if (!this.isLoaded_) {
      setTimeout(this.fillTile.bind(this, tile), 50);
      return;
    }
    
    var height = tile.height;
    if (tile.y + height > this.height) {
      height = this.height - tile.y;
    }
    var width = tile.width;
    if (tile.x + width > this.width) {
      width = this.width - tile.x;
    }
      
    var tileCanvas = document.createElement('canvas');
    tileCanvas.width = width;
    tileCanvas.height = height;
    var tileContext = tileCanvas.getContext('2d');
    
    tileContext.drawImage(
        this.image_,
        tile.x, tile.y, width, height,
        0, 0, width, height);

    // When running locally Chrome considers the file:/// URL that the image was
    // read from to be a separate origin, so we instead just use the tile canvas
    // in the tile.
    try {
      tile.node.style.backgroundImage = 'url(' + tileCanvas.toDataURL() + ')';
    } catch (err) {
      tile.node.appendChild(tileCanvas);
    }
  }
};

function IframeDatasource(url, width, height) {
  Datasource.call(this, width, height);

  this.iframe_ = document.createElement('iframe');
  this.iframe_.width = width;
  this.iframe_.height = height;
  this.iframe_.src = url;
  this.iframe_.sandbox = '';
  this.iframe_.style.overflow = 'hidden';
  this.iframe_.style.position = 'absolute';
}

IframeDatasource.prototype = {
  __proto__: Datasource.prototype,
  fillTile : function(tile) {
    var tileIframe = this.iframe_.cloneNode(false);
    tileIframe.style.top = -tile.y + 'px';
    tileIframe.style.left = -tile.x + 'px';
    tile.node.style.overflow = 'hidden';
    tile.node.appendChild(tileIframe);
    
    // Add a "cover" to prevent the iframe from stealing mouse events (setting
    // -webkit-mouse-events: none on it does not help).
    var cover = document.createElement('div');
    cover.className = 'cover';
    tile.node.appendChild(cover);
  }
};

function VideoDatasource(url, width, height) {
  Datasource.call(this, width, height);
  this.url_ = url;
}

VideoDatasource.prototype = {
  __proto__: Datasource.prototype,
  start: function() {
    if (!this.video_) {
      this.video_ = document.createElement('video');
      this.video_.src = this.url_;
      this.video_.width = this.width;
      this.video_.height = this.height;
      this.video_.autoplay = false;
      this.video_.loop = true;
      
      this.frameCanvas_ = document.createElement('canvas');
      this.frameCanvas_.width = this.width;
      this.frameCanvas_.height = this.height;    
    }
  
    this.video_.play();
    this.frameInterval_ = setInterval(this.updateTiles_.bind(this), 30);
    this.tiles_ = [];
  },
  
  stop: function() {
    this.video_.pause();
    clearInterval(this.frameInterval_);
  },
  
  fillTile: function(tile) {
    this.tiles_.push(tile);
    var tileCanvas = document.createElement('canvas');
    tileCanvas.width = tile.width;
    tileCanvas.height = tile.height;
    tile.node.appendChild(tileCanvas);
  },
  
  updateTiles_: function() {
    this.frameCanvas_.getContext('2d').drawImage(this.video_, 0, 0);
    this.tiles_.forEach(function(tile) {
      var tileCanvas = tile.node.lastChild;
      var tileContext = tileCanvas.getContext('2d');
      var height = tile.height;
      if (tile.y + height > this.height) {
        height = this.height - tile.y;
      }
      var width = tile.width;
      if (tile.x + width > this.width) {
        width = this.width - tile.x;
      }

      tileContext.drawImage(
          this.frameCanvas_,
          tile.x, tile.y, width, height,
          0, 0, width, height);
    }, this);
  },
};