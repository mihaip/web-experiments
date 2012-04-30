var IMAGE_FILENAME_RE_ = new RegExp('\.(jpg|gif|jpeg)$', 'i');

function FrameSet() {
  this.frames = [];
  this.width = 0;
  this.height = 0;
}

FrameSet.isEligible = function(file) {
  return IMAGE_FILENAME_RE_.test(file.name);
}

FrameSet.prototype.addFrame = function(frame) {
  this.frames.push(frame);
};

FrameSet.prototype.load = function(callback) {
  frameCount = 0;
  var frameDoneCallback = function(frame) {
    if (frame.width > this.width) this.width = frame.width;
    if (frame.height > this.height) this.height = frame.height;

    frameCount--;
    if (!frameCount) {
      callback();
    }
  }
  this.frames.forEach(function(frame) {
    frameCount++;
    frame.populateFrameMetadata(frameDoneCallback.bind(this, frame));
  }, this);
}

function Frame(file) {
  this.file = file;
}

Frame.prototype.populateFrameMetadata = function(callback) {
  this.srcUrl = window.webkitURL.createObjectURL(this.file);

  var image = new Image();
  image.onload = (function() {
    this.width = image.width;
    this.height = image.height;

    callback();
  }).bind(this);
  image.src = this.srcUrl;
};

function main() {
  document.getElementById('image-directory-input').addEventListener(
      'change', handleImageDirectorySelection);
}

function handleImageDirectorySelection(event) {
  var fileList = event.target.files;
  var frameSet = new FrameSet();

  for (var i = 0; i < fileList.length; i++) {
    var file = fileList[i];
    if (FrameSet.isEligible(file)) {
      frameSet.addFrame(new Frame(fileList[i]));
    }
  }

  frameSet.load(displayFrameSet.bind(this, frameSet));
}

function displayFrameSet(frameSet) {
  var displayContainerNode = document.getElementById('display-container');
  var displayStyleSheet = document.getElementById('display-style').sheet;
  var displayFrameNode = document.getElementById('display-frame');

  var keyframeRuleText = '@-webkit-keyframes display-keyframes {';

  var frameCount = frameSet.frames.length;
  var keyframePercentIncrement = 100/(frameCount - 1);

  frameSet.frames.forEach(function(frame, index) {
    // Make sure that, even with rounding errors, we always end up at 100%
    if (index == frameCount - 1) {
      keyframeRuleText += '100%';
    } else {
      keyframeRuleText += (keyframePercentIncrement * index) + '%';
    }

    keyframeRuleText += ' {';
    keyframeRuleText += ' border: solid 1px red;';
    keyframeRuleText += 'background: url("' + frame.srcUrl + '");';
    keyframeRuleText += ' }\n';
  });

  keyframeRuleText += '}';

  console.log(keyframeRuleText);

  if (displayStyleSheet.cssRules.length) {
    displayStyleSheet.cssRules.deleteRule(0);
  }
  displayStyleSheet.insertRule(keyframeRuleText, 0);

  displayContainerNode.style.width = displayFrameNode.style.width =
      frameSet.width + 'px';
  displayContainerNode.style.height = displayFrameNode.style.height =
      frameSet.height + 'px';
  displayFrameNode.style.webkitAnimationName = 'display-keyframes';
}