const numRects = 13;

//canvas//
const canvasWidth = 1000;
const canvasHeight = 600;

const leftMargin = 20;

//rectangle//
const rectWidth = 200;
const rectSpacerHeight = 20;
const rectMultiplier = 1;

const rectSpacerHeightTotal = ((numRects - 1) * rectSpacerHeight);
const rectHeight = (canvasHeight - rectSpacerHeightTotal) / numRects;

const rectSpacerHalfHeight = rectSpacerHeight / 2;
const rectHalfWidth = rectWidth / 2;
const rectHalfHeight = rectHeight / 2;

//leftRect//
const leftRectHeight = rectHeight * 0.75;
const leftRectWidth = rectWidth * 0.50;
const leftRectWidthRemainder = rectWidth - leftRectWidth;
const leftRectMargin = rectWidth * 0.05;

//rightRect//
const rightRectHeight = rectHeight * 0.75;
const rightRectWidth = rectWidth * 0.30;
const rightRectWidthRemainder = rectWidth - rightRectWidth;
const rightRectMargin = rectWidth * 0.1;

//ellipse//
const ellipseDiameter = rectHeight * 0.5;
const ellipseRadius = ellipseDiameter / 2;
const ellipseSpacer = ellipseDiameter * 2;

//image//
const imageWidth = 312; //312
const imageHalfWidth = imageWidth / 2;
const imageHeight = 242; //242
const imageSpacer = imageWidth / 2 + 20;
let img;

//speeds//
const extendSpeed = 0.05;
const retractSpeed = 0.2;

//aesthetic//
const cornerRound = 2;

function Rectangle(initialX, initialY) {
  this.initialX = initialX;
  this.initialY = initialY;
  this.x = this.initialX;
  this.y = this.initialY;
  this.prevRect = null;
  this.nextRect = null;

  //comment up these calcs below
  this.leftRect = new SubRectangle(this.initialX - (leftRectWidth / 2) + leftRectMargin, this.initialY); //centers sub rectable in large one
  this.rightRect = new SubRectangle(this.initialX + (leftRectWidth / 2) - leftRectMargin + rightRectMargin, this.initialY); //centers sub rectable in large one
  this.rightAnchorLine = new Line(this);
  this.connectorLine = new Line(this);
}

Rectangle.prototype.rectHalfWidth = function(rectWidth) {
  this.initialX = leftMargin + rectWidth / 2;
}

function SubRectangle(initialX, initalY) {
  this.initialX = initialX; //definitely need this <- don't change
  this.initialY = initalY;
  this.x = this.initialX;
  this.y = this.initialY;
}

function Line(rectangle) {
  //Line class should have initialX and Y properties that are passed instead of the rectangle probably
  this.rectangle = rectangle;
}

Line.prototype.updateSelectedLinePos = function() {
  //right anchor to cursor line, subtract out ellipseRadius to make flush with left side of ellipse
  line(this.rectangle.x + rectHalfWidth, this.rectangle.y, mouseX - imageHalfWidth, mouseY);
}

Rectangle.prototype.updateSelectedRectPos = function() {
  //rectangle fly to mouse
  let rectMouseOffset = (rectWidth / 2) + imageSpacer;
  this.x = lerp(this.x, mouseX - rectMouseOffset, extendSpeed); //the second x position must be adusted to account for the size of the rectangle and image spacer
  this.y = lerp(this.y, mouseY, 1);
  //left rectangle fly to mouse
  let leftRectMouseOffset = ((rectWidth / 2) + imageSpacer + (leftRectWidth / 2) - leftRectMargin);
  this.leftRect.x = lerp(this.leftRect.x, mouseX - leftRectMouseOffset, extendSpeed);
  this.leftRect.y = lerp(this.leftRect.y, mouseY, 1);
  //right rectangle fly to mouse
  let rightRectMouseOffset = imageSpacer + //move this far to the left from mouseX
    (rightRectWidth / 2) + //gets right side of rightRect lined up with right side of container rectangle
    rectWidth - //right side of rightRect flush with left side of rect
    rightRectWidth - //left of leftRect flush with left side of rect
    leftRectMargin - //left of leftRect flush with left side of rightRect 
    leftRectWidth - //right side of leftRect flush with left side of rightRect
    rightRectMargin; //move to the right by this rightRectMargin
  this.rightRect.x = lerp(this.rightRect.x, mouseX - rightRectMouseOffset, extendSpeed); //probably need to subtract out stuff on mouseX
  this.rightRect.y = lerp(this.rightRect.y, mouseY, 1);

  lastToDraw = this;

  return lastToDraw;
}

Rectangle.prototype.updateDeselectedRectPos = function() {
  //retract rectangle to its starting position
  this.x = lerp(this.x, this.initialX, retractSpeed);
  this.y = lerp(this.y, this.initialY, retractSpeed);
  rect(this.x, this.y, rectWidth * rectMultiplier, rectHeight * rectMultiplier, cornerRound);

  //retract left rectangle to its starting position
  this.leftRect.x = lerp(this.leftRect.x, this.leftRect.initialX, retractSpeed);
  this.leftRect.y = lerp(this.leftRect.y, this.leftRect.initialY, retractSpeed);
  rect(this.leftRect.x, this.leftRect.y, leftRectWidth, leftRectHeight, cornerRound);

  //retract right rectangle to its starting position
  this.rightRect.x = lerp(this.rightRect.x, this.rightRect.initialX, retractSpeed);
  this.rightRect.y = lerp(this.rightRect.y, this.rightRect.initialY, retractSpeed);
  rect(this.rightRect.x, this.rightRect.y, rightRectWidth, rightRectHeight, cornerRound);
}

Rectangle.prototype.updatePopoutRectPos = function() {
  // handle the popout of adjacent rectangles
  if (this.prevRect) {
    this.prevRect.x = lerp(this.prevRect.x, rectWidth * 2, extendSpeed);
  }
  if (this.nextRect) {
    this.nextRect.x = lerp(this.nextRect.x, rectWidth * 2, extendSpeed);
  }
}

let rectArr = [];
for (let i = 0; i < numRects; i++) {
  let rectInitialX = leftMargin + rectWidth / 2; //margin to left of rect + half rect width to compensate for rect mode
  let rectInitialY = i * rectHeight + //start each rect this far down on the y-axis ie: 0, 200, 400, etc.
    rectHalfHeight + //push all rects down to compensate vertically for rectMode
    (i != 0 ? rectSpacerHeight * i : 0) //add in vertical spacer height
  let currRect = new Rectangle(rectInitialX, rectInitialY)
  rectArr.push(currRect);
  //sets the prevRect and nextRect of all Rectangles except the first and last which default to null.
  if (i > 0) {
    rectArr[i - 1].nextRect = currRect;
    currRect.prevRect = rectArr[i - 1];
  }
}

function setup() {
  let canvas = createCanvas(canvasWidth, canvasHeight);
  canvas.parent('canvas-container');
  img = createImg('https://assets.editor.p5js.org/5c3a7b27bb105c001f5a489c/f5f595d4-f0e5-486c-9e2d-94b0d385b269.png');
  img.hide();
}

function draw() {
  background(220, 220, 220);
   // Draw 1px black border
  stroke(0); // Set stroke color to black
  noFill(); // Don't fill the rectangle
  rect(500, 300, width  - 1, height - 1);
  
  noCursor();
  rectMode(CENTER);
  fill(220, 220, 220);
  let lastToDraw = null;
  line(canvasWidth / 2 + 200 - imageWidth/2,0,canvasWidth  / 2 + 200 - imageWidth/2,canvasHeight);

  for (let i = 0; i < rectArr.length; i++) {
    //updates the position of the rect based on where the mouse is at any given point in time
    const maxCursorRangeAboveRectCenterY = rectArr[i].initialY - rectHalfHeight - rectSpacerHalfHeight;
    const maxCursorRangeBelowRectCenterY = rectArr[i].initialY + rectHalfHeight + rectSpacerHalfHeight;

    //If cursor y position within this range, fly rectangle to cursor
    if (mouseY >= maxCursorRangeAboveRectCenterY && mouseY < maxCursorRangeBelowRectCenterY && mouseX < canvasWidth / 2 + 200 /*&& mouseIsPressed*/) {
      lastToDraw = rectArr[i].updateSelectedRectPos();
      rectArr[i].rightAnchorLine.updateSelectedLinePos();
    } else if (mouseY >= maxCursorRangeAboveRectCenterY && mouseY < maxCursorRangeBelowRectCenterY && mouseX < canvasWidth / 2 + 200 /*&& !mouseIsPressed*/) {
      	rectArr[i].updateDeselectedRectPos();           
    } else {
      rectArr[i].updateDeselectedRectPos();
    }
    //left anchor line, subtract out rectHalfWidth to make line flush with left side of rectangle
    line(0, rectArr[i].initialY, rectArr[i].x - rectHalfWidth, rectArr[i].y);
  }

  //drawing rectangle here ensure it stays "always on top" of the other rectangles
  if (lastToDraw) {
    lastToDraw.updateSelectedRectPos();
    rect(lastToDraw.x, lastToDraw.y, rectWidth * rectMultiplier, rectHeight * rectMultiplier, cornerRound);
    rect(lastToDraw.leftRect.x, lastToDraw.leftRect.y, leftRectWidth, leftRectHeight);
    rect(lastToDraw.rightRect.x, lastToDraw.rightRect.y, rightRectWidth, rightRectHeight);
  }

  strokeWeight(2);
  rect(mouseX, mouseY, imageWidth, imageHeight);
  strokeWeight(1);
  imageMode(CENTER);
  image(img, mouseX, mouseY, 300, 230);
}