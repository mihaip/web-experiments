function FlipSet(width, height, nodes) {
  this.flips_ = [];
  this.currentIndex_ = 0;
  
  for (var i = 0, node; node = nodes[i]; i++) {
    this.flips_.push(new Flip(node, width, height, this));
  }
  
  this.containerNode_ = goog.dom.$dom('div', 'flip-set');
  this.containerNode_.style.width = width + 'px';
  this.containerNode_.style.height = height + 'px';
  this.containerNode_.style.marginLeft = -width/2 + 'px';
  this.containerNode_.style.marginTop = -height/2 + 'px';

  this.displayCurrentFlip_();
  document.body.appendChild(this.containerNode_);
} 

FlipSet.prototype.displayCurrentFlip_ = function() {
  goog.dom.removeChildren(this.containerNode_);
  this.containerNode_.appendChild(this.flips_[this.currentIndex_].originalNode_);
}

FlipSet.prototype.next = function() {
  if (this.isTransitioning_) return;
  
  this.isTransitioning_ = true;
  var currentFlip = this.flips_[this.currentIndex_]
  var nextFlip = this.flips_[this.currentIndex_ + 1];
  
  currentFlip.beginFlipFrom();
  nextFlip.beginFlipTo();
  
  var self = this;
  nextFlip.immediate(nextFlip.foldRight, function() {
    currentFlip.foldLeft();
    nextFlip.unfold();
    currentFlip.moveToBack();
    nextFlip.onTransitionEnd(function() {
      nextFlip.endFlipTo();
      currentFlip.endFlipFrom();
      self.isTransitioning_ = false;
    });
  });

  this.currentIndex_++;
};

FlipSet.prototype.previous = function() {
  if (this.isTransitioning_) return;
  
  this.isTransitioning_ = true;
  var currentFlip = this.flips_[this.currentIndex_]
  var previousFlip = this.flips_[this.currentIndex_ - 1];
  
  currentFlip.beginFlipFrom();
  previousFlip.beginFlipTo();
  
  var self = this;
  previousFlip.immediate(previousFlip.foldLeft, function() {
    currentFlip.foldRight();
    previousFlip.unfold();
    currentFlip.moveToBack();
    previousFlip.onTransitionEnd(function() {
      previousFlip.endFlipTo();
      currentFlip.endFlipFrom();
      self.isTransitioning_ = false;
    });
  });	  
  
  this.currentIndex_--;
};

FlipSet.prototype.canGoNext = function() {
  return this.currentIndex_ < this.flips_.length - 1;
};

FlipSet.prototype.canGoPrevious = function() {
  return this.currentIndex_ > 0;
};

function Flip(node, width, height, parentSet) {
  this.originalNode_ = node;
  this.parentSet_ = parentSet;
  this.init_(width, height);
}

Flip.prototype.init_ = function(width, height) {
  var node = this.originalNode_;
  
  var containerNode = goog.dom.$dom('div', 'flip-container');
  containerNode.style.width = width + 'px';
  containerNode.style.height = height + 'px';
  
  var leftContainerNode = goog.dom.$dom('div', 'flip-left-container flip-transitionable');
  leftContainerNode.appendChild(node.cloneNode(true));
  leftContainerNode.style.width = Math.floor(width/2) + 'px';
  leftContainerNode.style.height = height + 'px';

  var rightContainerNode = goog.dom.$dom('div', 'flip-right-container flip-transitionable');
  var rightInnerContainerNode = goog.dom.$dom('div', 'flip-right-inner-container');
  
  rightInnerContainerNode.appendChild(node.cloneNode(true));
  rightInnerContainerNode.style.width = width + 'px';

  rightContainerNode.appendChild(rightInnerContainerNode);
  rightContainerNode.style.width = Math.ceil(width/2) + 'px';
  rightContainerNode.style.height = rightInnerContainerNode.style.height =
      height + 'px';

  rightInnerContainerNode.style.left = -Math.floor(width/2) + 'px';
  
  containerNode.appendChild(leftContainerNode);
  containerNode.appendChild(rightContainerNode);
  
  this.containerNode_ = containerNode;
  this.leftContainerNode_ = leftContainerNode;
  this.rightContainerNode_ = rightContainerNode;
  this.rightInnerContainerNode_ = rightInnerContainerNode;
  
  var self = this;
  var onTransitionEnd = function() {
    if (self.onTransitionEnd_) {
      self.onTransitionEnd_();
      self.onTransitionEnd_ = null;
    }
  };
  
  try {
    goog.events.listen(
        this.containerNode_, 'webkitTransitionEnd', onTransitionEnd);
  } catch (err) {}
  
  try {
    // Should be mozTransitionEnd, but is transition end per 
    // https://developer.mozilla.org/en/CSS/CSS_transitions#Detecting_the_completion_of_a_transition
    goog.events.listen(
        this.containerNode_, 'transitionend', onTransitionEnd);
  } catch (err) {}
};

Flip.prototype.moveToFront = function() {
  this.containerNode_.style.zIndex = 1;
};

Flip.prototype.moveToBack = function() {
  this.containerNode_.style.zIndex = -1;
};

Flip.prototype.beginFlipFrom = function() {
  this.moveToFront();
  goog.dom.replaceNode(this.containerNode_, this.originalNode_);	  
};

Flip.prototype.beginFlipTo = function() {
  this.parentSet_.containerNode_.appendChild(this.containerNode_);	  
};

Flip.prototype.endFlipFrom = function() {
  goog.dom.removeNode(this.containerNode_);
  this.containerNode_.style.zIndex = 'auto';
};

Flip.prototype.endFlipTo = function() {
  goog.dom.replaceNode(this.originalNode_, this.containerNode_);
  this.containerNode_.style.zIndex = 'auto';
};

Flip.prototype.immediate = function(method, callback) {
  goog.dom.classes.remove(this.leftContainerNode_, 'flip-transitionable');
  goog.dom.classes.remove(this.rightContainerNode_, 'flip-transitionable');
  
  method.call(this);
  
  var self = this;
  window.setTimeout(function() {
    goog.dom.classes.add(self.leftContainerNode_, 'flip-transitionable');
    goog.dom.classes.add(self.rightContainerNode_, 'flip-transitionable');
    
    callback();
  });
};

Flip.prototype.foldLeft = function() {
  goog.dom.classes.add(this.containerNode_, 'folded-left');
};

Flip.prototype.foldRight = function(opt_immediate) {
  goog.dom.classes.add(this.containerNode_, 'folded-right');
}

Flip.prototype.unfold = function(opt_immediate) {
  goog.dom.classes.remove(this.containerNode_, 'folded-left');
  goog.dom.classes.remove(this.containerNode_, 'folded-right');
}

Flip.prototype.onTransitionEnd = function(callback) {
  this.onTransitionEnd_ =callback;
};
