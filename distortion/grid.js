// Once transformed, there are seams between tiles, so we make them overlap by
// this many pixels.
var TILE_OVERLAP = 1;

function Point(xIndex, yIndex, x, y, containerNode) {
  this.xIndex_ = xIndex;
  this.yIndex_ = yIndex;
  this.x_ = x;
  this.y_ = y;
  this.associatedTiles_ = [];

  this.node_ = document.createElement('div');
  this.node_.className = 'point';
  this.updateDisplay_();
  this.node_.point_ = this;
  containerNode.appendChild(this.node_);
}

Point.prototype = {
  get xIndex() {
    return this.xIndex_;
  },

  get yIndex() {
    return this.yIndex_;
  },
  
  get x() {
    return this.x_;
  },
  
  get y() {
    return this.y_;
  },  
 
  get associatedTiles() {
    return this.associatedTiles_;
  },
  
  moveBy: function(deltaX, deltaY) {
    this.x_ += deltaX;
    this.y_ += deltaY;
    
    var makesPointsConcave = false;
    for (var i = 0, tile; tile = this.associatedTiles_[i]; i++) {
      if (tile.isConcave) {
        makesPointsConcave = true;
        break;
      }
    }
    
    if (makesPointsConcave) {
      this.x_ -= deltaX;
      this.y_ -= deltaY;
      return false;
    }
  
    this.updateDisplay_();
    
    return true;
  },

  updateDisplay_: function() {
    this.node_.style.top = Math.round(this.y_) + 'px';
    this.node_.style.left = Math.round(this.x_) + 'px';
  }
};

function Tile(points, containerNode) {
  points.forEach(function(point) {
    point.associatedTiles.push(this);
  }, this);
  
  this.points_ = points;
  this.source_ = [
      {x: points[0].x, y: points[0].y},
      {x: points[1].x, y: points[1].y},
      {x: points[2].x, y: points[2].y},
      {x: points[3].x, y: points[3].y}
  ];
  
  this.id = points[0].xIndex + '-' + points[0].yIndex;

  this.node_ = document.createElement('div');
  this.node_.className = 'tile';
  this.node_.style.left = this.x + 'px';
  this.node_.style.top = this.y + 'px';
  this.node_.style.width = this.width + 'px';
  this.node_.style.height = this.height + 'px';
  containerNode.appendChild(this.node_);  
}

Tile.prototype = {
  recomputeMatrix: function() {
    // Compute perspective transform, based on the JavaScript port of OpenCV's 
    // cvGetPerspectiveTransform done by
    // http://www.is-real.net/experiments/css3/wonder-webkit/
    var src = this.source_;
    var dst = this.points_;
    var offsetX = src[0].x;
    var offsetY = src[0].y;
    var a = [
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0]
    ];
    var b = [0, 0, 0, 0, 0, 0, 0, 0];
    for (var i = 0; i < 4; i++) {
      a[i] = [];
      a[i][0] = a[i+4][3] = src[i].x - offsetX;
      a[i][1] = a[i+4][4] = src[i].y - offsetY;
      a[i][2] = a[i+4][5] = 1;
      a[i][3] = a[i][4] = a[i][5] =
      a[i+4][0] = a[i+4][1] = a[i+4][2] = 0;
      a[i][6] = -(src[i].x - offsetX) * (dst[i].x - offsetX);
      a[i][7] = -(src[i].y - offsetY) * (dst[i].x - offsetX);
      a[i + 4][6] = -(src[i].x - offsetX) * (dst[i].y - offsetY);
      a[i + 4][7] = -(src[i].y - offsetY) * (dst[i].y - offsetY);
      
      b[i] = dst[i].x - offsetX;
      b[i + 4] = dst[i].y - offsetY;
    }
    
    var bM = [];
    for(var i = 0; i < b.length; i++) {
      bM[i] = [b[i]];
    }  
    
    var A = Matrix.create(a);
    var B = Matrix.create(bM);
    var X = Matrix.solve(A, B);
  
    var cssMatrix = new WebKitCSSMatrix();
    cssMatrix.m11 = X.mat[0][0];
    cssMatrix.m12 = X.mat[3][0];
    cssMatrix.m13 = 0;
    cssMatrix.m14 = X.mat[6][0];
    
    cssMatrix.m21 = X.mat[1][0];
    cssMatrix.m22 = X.mat[4][0];
    cssMatrix.m23 = 0;
    cssMatrix.m24 = X.mat[7][0];
    
    cssMatrix.m31 = 0;
    cssMatrix.m32 = 0;
    cssMatrix.m33 = 1;
    cssMatrix.m34 = 0;
    
    cssMatrix.m41 = X.mat[2][0];
    cssMatrix.m42 = X.mat[5][0];
    cssMatrix.m43 = 0;
    cssMatrix.m44 = 1;
    
    this.node_.style.webkitTransform = cssMatrix;
  },
  
  get isConcave() {
    // Based on the "right turn" check from
    // http://en.wikipedia.org/wiki/Graham_scan
    for (var i = 0; i < 4; i++) {
      var p1 = this.points_[(i - 1 + 4) % 4];
      var p2 = this.points_[i];
      var p3 = this.points_[(i + 1) % 4];
      
      if ((p2.x - p1.x) * (p3.y - p1.y) - (p2.y - p1.y) * (p3.x - p1.x) <= 0) {
        return true;
      }
    }
    
    return false;
  },

  get node() {
    return this.node_;
  },
  
  get x() {
    return this.source_[0].x;
  },

  get y() {
    return this.source_[0].y;
  },
  
  get width() {
    return this.source_[1].x - this.source_[0].x + TILE_OVERLAP;
  },

  get height() {
    return this.source_[3].y - this.source_[0].y + TILE_OVERLAP;
  },
  
  get xIndex() {
    return this.points_[0].xIndex;
  },
  
  get yIndex() {
    return this.points_[0].yIndex;
  }
};

function Grid(containerNode, gridSize, datasource) {
  datasource.start();
  this.datasource_ = datasource;

  containerNode.innerHTML = '';
  containerNode.style.width = datasource.width + 'px';
  containerNode.style.height = datasource.height + 'px';
  containerNode.style.marginLeft = -datasource.width/2 + 'px';
  containerNode.style.marginTop = -datasource.height/2 + 'px';
  this.gridCanvas_ = document.createElement('canvas');
  this.gridCanvas_.id = 'grid-canvas';
  this.gridCanvas_.width = datasource.width;
  this.gridCanvas_.height = datasource.height;
  containerNode.appendChild(this.gridCanvas_);
  
  this.width_ = datasource.width;
  this.height_ = datasource.height;
  
  this.xPointCount_ = this.width_/gridSize + 1;
  this.yPointCount_ = this.height_/gridSize + 1;
  this.points_ = [];
  for (var i = 0; i < this.xPointCount_; i++) {
    this.points_.push([]);
    for (var j = 0; j < this.yPointCount_; j++) {
      x = i * gridSize;
      if (x > this.width_) x = this.width_;
      y = j * gridSize;
      if (y > this.height_) y = this.height_;
      this.points_[i][j] = new Point(i, j, x, y, containerNode);
    }
  }
  for (var i = 0; i < this.xPointCount_ - 1; i++) {
    for (var j = 0; j < this.yPointCount_ - 1; j++) {
      var tile = new Tile([
            this.points_[i][j],
            this.points_[i + 1][j],
            this.points_[i + 1][j + 1],
            this.points_[i][j + 1]
          ],
          containerNode);
      datasource.fillTile(tile);
      tile.recomputeMatrix();
    }
  }
  
  this.boundHandleMouseDown_ = this.handleMouseDown_.bind(this);
  this.boundHandleMouseMove_ = this.handleMouseMove_.bind(this);
  this.boundHandleMouseUp_ = this.handleMouseUp_.bind(this);

  if ('ontouchmove' in document) {
    document.addEventListener('touchstart', this.boundHandleMouseDown_, false);
    document.addEventListener('touchmove', this.boundHandleMouseMove_, false);
    document.addEventListener('touchend', this.boundHandleMouseUp_, false);
  } else {  
    document.addEventListener('mousedown', this.boundHandleMouseDown_, false);
    document.addEventListener('mousemove', this.boundHandleMouseMove_, false);
    document.addEventListener('mouseup', this.boundHandleMouseUp_, false);
  }
      
  this.repaintGrid_();
}

Grid.prototype = {
  dispose: function() {
    if ('ontouchmove' in document) {
      document.removeEventListener('touchstart', this.boundHandleMouseDown_, false);
      document.removeEventListener('touchmove', this.boundHandleMouseMove_, false);
      document.removeEventListener('touchend', this.boundHandleMouseUp_, false);
    } else {  
      document.removeEventListener('mousedown', this.boundHandleMouseDown_, false);
      document.removeEventListener('mousemove', this.boundHandleMouseMove_, false);
      document.removeEventListener('mouseup', this.boundHandleMouseUp_, false);
    }
    
    this.datasource_.stop();
  },
  
  getEventCoordinates_: function(event) {
    if (event.touches) {
      return {x: event.touches[0].pageX, y: event.touches[0].pageY};      
    } else {
      return {x: event.screenX, y: event.screenY};
    }
  },
  
  handleMouseDown_: function(event) {
    var point = event.target.point_;
    if (!point) return;
    
    this.currentPoint_ = point;
    this.moveNeighborsWithDecay_ = event.altKey;
    this.moveAllPointsWithScale_ = event.shiftKey;
    this.lastEventCoordinates_ = this.getEventCoordinates_(event);
  },

  handleMouseMove_: function(event) {
    // Mainly necessary to prevent scrolling when using touch events.
    event.preventDefault();
    
    var dirtyTilesById = {};
    function markPointAsDirty(point) {
      point.associatedTiles.forEach(function(tile) {
        dirtyTilesById[tile.id] = tile;
      });
    }
  
    if (!this.currentPoint_) return;
    
    var currentEventCoordinates = this.getEventCoordinates_(event);
    var deltaX = currentEventCoordinates.x - this.lastEventCoordinates_.x;
    var deltaY = currentEventCoordinates.y - this.lastEventCoordinates_.y;
    
    if (!this.currentPoint_.moveBy(deltaX, deltaY)) {
      return;
    }
    markPointAsDirty(this.currentPoint_);
    
    if (this.moveNeighborsWithDecay_) {
      for (var i = 0; i < this.xPointCount_; i++) {
        for (var j = 0; j < this.yPointCount_; j++) {
          var point = this.points_[i][j];
          if (point == this.currentPoint_) continue;
          var pointDX = Math.abs(point.xIndex - this.currentPoint_.xIndex);
          var pointDY = Math.abs(point.yIndex - this.currentPoint_.yIndex);
          var decay = 1.0/Math.pow(1.3, pointDX + pointDY) - 0.05;
          if (decay <= 0) continue;
          point.moveBy(deltaX * decay, deltaY * decay);
          markPointAsDirty(point);
        }
      }
    } else if (this.moveAllPointsWithScale_) {
      // Constraints:
      // - The current point always moves by the specified delta.
      // - Points on the edges don't move (unless they're in the same row/column
      //   as the current point)
      // - Points "after" (below/to the right) and "before" the current point
      //   (above/to the left) move such to stay evenly spread out.
      var xPointsBefore = this.currentPoint_.xIndex;
      var xPointsAfter = this.xPointCount_ - this.currentPoint_.xIndex - 1;
      var yPointsBefore = this.currentPoint_.yIndex;
      var yPointsAfter = this.yPointCount_ - this.currentPoint_.yIndex - 1;
      
      for (var i = 0; i < this.xPointCount_; i++) {
        var xFactor;
        if (i == this.currentPoint_.xIndex) {
          xFactor = 1;
        } else if (i == 0 || i == this.xPointCount_ - 1) {
          xFactor = 0;
        } else if (i < this.currentPoint_.xIndex) {
          xFactor = 1.0 - (this.currentPoint_.xIndex - i)/xPointsBefore;
        } else {
          xFactor = 1.0 - (i - this.currentPoint_.xIndex)/xPointsAfter;
        }
  
        for (var j = 0; j < this.yPointCount_; j++) {
          var point = this.points_[i][j];
          if (point == this.currentPoint_) continue;        
          var yFactor;
          if (j == this.currentPoint_.yIndex) {
            yFactor = 1;
          } else if (j == 0 || j == this.yPointCount_ - 1) {
            yFactor = 0;
          } else if (j < this.currentPoint_.yIndex) {
            yFactor = 1.0 - (this.currentPoint_.yIndex - j)/yPointsBefore;
          } else {
            yFactor = 1.0 - (j - this.currentPoint_.yIndex)/yPointsAfter;
          }
          
          if (xFactor == 0 && yFactor == 0) continue;
          
          point.moveBy(deltaX * xFactor, deltaY * yFactor);
          markPointAsDirty(point);
        }
      }
    }
    
    this.repaintGrid_();
    for (var id in dirtyTilesById) {
      dirtyTilesById[id].recomputeMatrix();
    }
    
    this.lastEventCoordinates_ = currentEventCoordinates;
  },

  handleMouseUp_: function(event) {
    this.currentPoint_ = null;
  },

  repaintGrid_: function() {
    var minX = Number.MAX_VALUE;
    var maxX = -Number.MAX_VALUE;
    var minY = Number.MAX_VALUE;
    var maxY = -Number.MAX_VALUE;
    
    for (var i = 0; i < this.xPointCount_; i++) {
      for (var j = 0; j < this.yPointCount_; j++) {
        var point = this.points_[i][j];
        if (point.x < minX) minX = point.x;
        if (point.x > maxX) maxX = point.x;
        if (point.y < minY) minY = point.y;
        if (point.y > maxY) maxY = point.y;
      }
    }
    
    // Leave an extra pixel of room on all sides so that the 2 pixel wide stroke
    // doesn't get clipped when on the edge.
    minX = Math.floor(minX - 1);
    maxX = Math.ceil(maxX + 1);
    minY = Math.floor(minY - 1);
    maxY = Math.ceil(maxY + 1);
    
    var canvasWidth = maxX - minX;
    var canvasHeight = maxY - minY;
    
    if (canvasWidth > this.gridCanvas_.width ||
        canvasHeight > this.gridCanvas_.height) {
      var gridCanvas = document.createElement('canvas');
      gridCanvas.id = 'grid-canvas';
      gridCanvas.width = Math.round(canvasWidth * 1.25);
      gridCanvas.height = Math.round(canvasHeight * 1.25);
      this.gridCanvas_.parentNode.replaceChild(
          gridCanvas, this.gridCanvas_);
      this.gridCanvas_ = gridCanvas;
    }
    
    this.gridCanvas_.style.left = minX + 'px';
    this.gridCanvas_.style.top = minY + 'px';
    
    var context = this.gridCanvas_.getContext('2d');
    context.lineWidth = 2;
    context.strokeStyle = 'rgba(255, 0, 0, 0.5)';
    context.clearRect(0, 0, this.gridCanvas_.width, this.gridCanvas_.height);
    
    for (var i = 0; i < this.xPointCount_; i++) {
      for (var j = 0; j < this.yPointCount_; j++) {
        var point = this.points_[i][j];
        var pointAbove = j > 0 ? this.points_[i][j - 1] : point;
        var pointLeft = i >  0 ? this.points_[i - 1][j] : point;
        
        context.beginPath();
        context.moveTo(pointAbove.x - minX, pointAbove.y - minY);
        context.lineTo(point.x - minX, point.y - minY);
        context.lineTo(pointLeft.x - minX, pointLeft.y - minY);
        context.stroke();
      }
    }
  }
};
