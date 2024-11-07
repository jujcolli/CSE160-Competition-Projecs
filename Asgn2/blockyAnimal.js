// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program

var VSHADER_SOURCE = `
   uniform mat4 u_ModelMatrix;
   uniform mat4 u_GlobalRotateMatrix;
   uniform float u_PointSize;
   attribute vec4 a_Position;
   void main() {
     gl_Position =  u_GlobalRotateMatrix*u_ModelMatrix * a_Position;
     gl_PointSize = u_PointSize;
   }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`;

//CONSTS
const STILL = 0;
const SWING = 1;
const JUMP = 2;
//Global Variables
var canvas;
var gl;
var a_Position;
var u_FragColor;
var u_PointSize;
var u_ModelMatrix;
var u_GlobalRotateMatrix;
var vertexBuffer;

//UI Variables:
var g_camAngleY = 0;
var g_camAngleX = 0;
//trackball
var lastDownX;
var lastDownY;

var g_upperLegRotL = 0;
var g_lowerLegRotL = 0;
var g_footRotL = 0;

var g_upperLegRotR = 0;
var g_lowerLegRotR = 0;
var g_footRotR = 0;

var g_upperArmRotZL = 25;
var g_upperArmRotXL = 0;
var g_midArmRotZL = 35;
var g_midArmRotYL = 0;
var g_midArmRotXL = 0;
var g_lowArmRotL = 75;
var g_handRot = 0;

var g_upperArmRotZR = 25;
var g_upperArmRotXR = 0;
var g_midArmRotZR = 35;
var g_midArmRotYR = 0;
var g_midArmRotXR = 0;
var g_lowArmRotR = 75;
var g_sawRot = 0;

var g_animChoice = STILL;
var g_specialAnim = false;

var g_angleStep = 45;
var g_animStep = 1;
var g_animStepStatus = true; // means that ready to move onto the next step or not
var g_speed = 3;

function reset(){
  g_upperLegRotL = 0; g_lowerLegRotL = 0; g_footRotL = 0; g_upperLegRotR = 0; g_lowerLegRotR = 0; g_footRotR = 0; 
  g_upperArmRotZL = 25; g_upperArmRotXL = 0; g_midArmRotZL = 35; g_midArmRotYL = 0;
  g_midArmRotXL = 0; g_lowArmRotL = 75; g_handRot = 0; g_upperArmRotZR = 25; g_upperArmRotXR = 0; g_midArmRotZR = 35;
  g_midArmRotYR = 0; g_midArmRotXR = 0; g_lowArmRotR = 75; g_sawRot = 0; g_animChoice = STILL;
}

//Ngon Var:
let ngon;

function inputActionUI(){
  document.getElementById("swing").onclick = function() {g_animChoice = SWING;};
  document.getElementById("jump").onclick = function() {reset(); g_animChoice = JUMP; g_animStep = 1;};
  document.getElementById("still").onclick = function() {g_animChoice = STILL;};
  document.getElementById("speed").addEventListener('mousemove', function() {g_speed = this.value;});
  document.getElementById("reset").onclick = function() {reset(); g_specialAnim = false};
  document.getElementById("angleY").addEventListener('mousemove', function() {g_camAngleY = this.value;});
  document.getElementById("angleX").addEventListener('mousemove', function() {g_camAngleX = this.value;});

  document.getElementById("upperlegR").addEventListener('mousemove', function() {if (g_animChoice != JUMP){g_upperLegRotR = this.value;}});
  document.getElementById("lowerlegR").addEventListener('mousemove', function() {if (g_animChoice != JUMP){g_lowerLegRotR = this.value;}});
  document.getElementById("footR").addEventListener('mousemove', function() {if (g_animChoice != JUMP){g_footRotR = this.value;}});

  document.getElementById("upperlegL").addEventListener('mousemove', function() {if (g_animChoice != JUMP){g_upperLegRotL = this.value;}});
  document.getElementById("lowerlegL").addEventListener('mousemove', function() {if (g_animChoice != JUMP){g_lowerLegRotL = this.value;}});
  document.getElementById("footL").addEventListener('mousemove', function() {if (g_animChoice != JUMP){g_footRotL = this.value;}});

  document.getElementById("upperarmzL").addEventListener('mousemove', function() {if (g_animChoice != JUMP){g_upperArmRotZL = this.value;}});
  document.getElementById("upperarmxL").addEventListener('mousemove', function() {g_upperArmRotXL = this.value;});
  document.getElementById("midarmzL").addEventListener('mousemove', function() {g_midArmRotZL = this.value;});
  document.getElementById("midarmyL").addEventListener('mousemove', function() {g_midArmRotYL = this.value;});
  document.getElementById("midarmxL").addEventListener('mousemove', function() {g_midArmRotXL = this.value;});
  document.getElementById("lowarmL").addEventListener('mousemove', function() {g_lowArmRotL = this.value;});
  document.getElementById("hand").addEventListener('mousemove', function() {g_handRot = this.value;});

  document.getElementById("upperarmzR").addEventListener('mousemove', function() {if (g_animChoice != JUMP){g_upperArmRotZR = this.value;}});
  document.getElementById("upperarmxR").addEventListener('mousemove', function() {g_upperArmRotXR = this.value;});
  document.getElementById("midarmzR").addEventListener('mousemove', function() {g_midArmRotZR = this.value;});
  document.getElementById("midarmyR").addEventListener('mousemove', function() {g_midArmRotYR = this.value;});
  document.getElementById("midarmxR").addEventListener('mousemove', function() {g_midArmRotXR = this.value;});
  document.getElementById("lowarmR").addEventListener('mousemove', function() {g_lowArmRotR = this.value;});
  //document.getElementById("saw").addEventListener('mousemove', function() {if(!g_specialAnim){g_sawRot = this.value;}});
}

function main() {
  // Retrieve <canvas> element
  setupWebGL();
  connectVariablesToGLSL();
  setupBuffer();

  inputActionUI();
  // Specify the color for clearing <canvas>
  canvas.onmousedown = function (ev) {
    [x, y] = coordConvCanvGL(ev);
    lastDownX = x;
    lastDownY = y;
    click(ev); 
  };
  canvas.onmousemove = function (ev) {if(ev.buttons == 1 && !ev.shiftKey){ click(ev); }};
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  requestAnimationFrame(tick);
}

function click(ev){
  if(ev.shiftKey && !g_specialAnim){
    g_specialAnim = true;
    return;
  } else if(ev.shiftKey && g_specialAnim){
    g_specialAnim = false;
    return;
  }
  let [newX, newY] = coordConvCanvGL(ev);

  var dX = newX - lastDownX;
  //console.log("newx: " + newX +" lastDownX: " + lastDownX + " dX: " + dX);
  g_camAngleY += 360 * dX;
  g_camAngleY =  g_camAngleY % 360;
  if (g_camAngleY < 0){
    g_camAngleY += 360;
  }

  var dY = newY - lastDownY; 
  g_camAngleX += 360 * dY; 
  g_camAngleX =  g_camAngleX % 360;
  if (g_camAngleX < 0){
    g_camAngleY += 360;
  }

  lastDownX = newX
  lastDownY = newY;
}

function coordConvCanvGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();
  
  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);
  
  return([x,y]);
}

function tick() {
  //console.log(performance.now());
  updateAnimation();
  // draw our shapes
  renderAllShapes();
  //tell browser to update when requested
  requestAnimationFrame(tick);
}

function setupBuffer(){
  vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }
  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Assign the buffer object to a_Position variable
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
}

function setupWebGL() {
  canvas = document.getElementById('webgl');
  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
// Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if(!u_ModelMatrix){
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }
  var identityMat = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityMat.elements);

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if(!u_GlobalRotateMatrix){
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  u_PointSize = gl.getUniformLocation(gl.program, 'u_PointSize');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_PointSize');
    return;
  }
}

function renderAllShapes(){
  var startTime = performance.now();

  var globalRotMatrix = new Matrix4();
  globalRotMatrix.rotate(g_camAngleY, 0, 1, 0);
  globalRotMatrix.rotate(g_camAngleX, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMatrix.elements);

  //gl.clear(gl.COLOR_BUFFER_BIT);
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //BODY CONSTRUCTION -------------------------------------------------------------------------------------------------
  var windshield = new Sphere();
  windshield.segments = 8;
  windshield.color = [1, 215/255, 0, 1.0];
  windshield.matrix.scale(0.2, 0.2, 0.25);
  windshield.render();
  
  var chassis = new Cube();
  chassis.color = [80/255, 80/255, 80/255, 1];
  chassis.matrix.setTranslate(-.2, -.2, 0);
  chassis.matrix.scale(0.4,0.4,0.25);
  chassis.render();

  var chassis2 = new Cube();
  chassis2.color = [100/255, 100/255, 100/255, 1];
  chassis2.matrix.setTranslate(0, 0, .2);
  //chassis2.matrix.rotate(45, 0, 1, 0);
  chassis2.matrix.rotate(45, 1, 0, 0);
  chassis2.matrix.translate(-.15, -.15, -.15);
  chassis2.matrix.scale(0.3,0.3,0.3);
  chassis2.render();

  var bodySideL = new Cube();
  bodySideL.color = [101/255, 101/255, 101/255, 1];
  bodySideL.matrix.translate(0.15,-0.15,-0.05);
  bodySideL.matrix.rotate(45, 0, 0, 1);
  bodySideL.matrix.translate(-.1, -.05, 0);
  bodySideL.matrix.scale(0.2,0.1,0.15);
  bodySideL.render();

  var bodySideR = new Cube();
  bodySideR.color = [101/255, 101/255, 101/255, 1];
  bodySideR.matrix.translate(-0.15,-0.15,-0.05);
  bodySideR.matrix.rotate(-45, 0, 0, 1);
  bodySideR.matrix.translate(-.1, -.05, 0);
  bodySideR.matrix.scale(0.2,0.1,0.15);
  bodySideR.render();

  var bodyUnder = new Cube();
  bodyUnder.color = [101/255, 101/255, 101/255, 1];
  bodyUnder.matrix.translate(0,-0.2,-0.15);
  bodyUnder.matrix.translate(-.05, -.05, 0);
  bodyUnder.matrix.scale(0.1,0.1,0.2);
  bodyUnder.render();

  var bodyCanisterL = new Cylinder();
  bodyCanisterL.segments = 6
  bodyCanisterL.color = [150/255, 150/255, 150/255, 1];
  bodyCanisterL.matrix.translate(0.15,-0.13,0.18);
  bodyCanisterL.matrix.rotate(180, 1, 0, 0);
  bodyCanisterL.matrix.scale(0.25, 0.25, 0.2);
  bodyCanisterL.render();

  var bodyCanisterR = new Cylinder();
  bodyCanisterR.segments = 6;
  bodyCanisterR.color = [150/255, 150/255, 150/255, 1];
  bodyCanisterR.matrix.translate(-0.15,-0.13,0.18);
  bodyCanisterR.matrix.rotate(180, 1, 0, 0);
  bodyCanisterR.matrix.scale(0.25, 0.25, 0.2);
  bodyCanisterR.render();

  var visorsideL = new Cube();
  visorsideL.color = [120/255, 120/255, 120/255, 1];
  visorsideL.matrix.translate(0.16,0.1,0);
  visorsideL.matrix.rotate(-70, 0, 0, 1);
  visorsideL.matrix.translate(-.15, -.05, -.1);
  visorsideL.matrix.scale(0.3,0.1,0.2);
  visorsideL.render();

  var visorsideL = new Cube();
  visorsideL.color = [120/255, 120/255, 120/255, 1];
  visorsideL.matrix.translate(-0.16,0.1,0);
  visorsideL.matrix.rotate(70, 0, 0, 1);
  visorsideL.matrix.translate(-.15, -.05, -.1);
  visorsideL.matrix.scale(0.3,0.1,0.2);
  visorsideL.render();

  var visorTop1 = new Cube();
  visorTop1.color = [150/255, 150/255, 150/255, 1];
  visorTop1.matrix.translate(0, 0.18, 0);
  visorTop1.matrix.translate(-.15, -.05, 0);
  visorTop1.matrix.scale(0.3,0.1,0.2);
  visorTop1.render();

  var visorTop2 = new Cube();
  visorTop2.color = [120/255, 120/255, 120/255, 1];
  visorTop2.matrix.translate(0,0.2,-0.1);
  visorTop2.matrix.translate(-.05, -.05, 0);
  visorTop2.matrix.scale(0.1,0.1,0.2);
  visorTop2.render();

  //END OF BODY CONSTRUCTION -------------------------------------------------------------------------------------------------------

  //MIDSECTION CONSTRUCTION ------------------------------------------------------------------------------------------------
  var midsection = new Cube();
  midsection.color = [120/255, 120/255, 120/255, 1];
  midsection.matrix.translate(0,-0.2, 0);
  midsection.matrix.translate(-.1, -.1, 0);
  midsection.matrix.scale(0.2,0.2,0.2);
  midsection.render();
  
  var torsoAxil = new Cylinder();
  torsoAxil.segments = 6
  torsoAxil.color = [150/255, 150/255, 150/255, 1];
  torsoAxil.matrix.scale(4, 1, 1);
  torsoAxil.matrix.translate(0,-0.31,.05);
  torsoAxil.matrix.rotate(90, 0, 1, 0);
  torsoAxil.matrix.translate(0,0,-.0625);
  torsoAxil.matrix.scale(0.125, 0.125, 0.125);
  torsoAxil.render();

  var hipL = new Cube();
  hipL.color = [150/255, 150/255, 150/255, 1];
  hipL.matrix.translate(.1,-.315,-.025);
  hipL.matrix.translate(-.075, -.075, 0);
  hipL.matrix.scale(0.15,0.15,0.15);
  hipL.render();

  var hipR = new Cube();
  hipR.color = [150/255, 150/255, 150/255, 1];
  hipR.matrix.translate(-.1,-.315,-.025);
  hipR.matrix.translate(-.075, -.075, 0);
  hipR.matrix.scale(0.15,0.15,0.15);
  hipR.render();
  //END OF MIDSECTION CONSTRUCTION-----------------------------------------------------------------

  //LEFT LEG CONSTRUCTION-------------------------------------------------------------------
  var thighL = new Cube();
  thighL.color = [120/255, 120/255, 120/255, 1];
  thighL.matrix.translate(-.275,-0.31, .05);
  thighL.matrix.rotate(g_upperLegRotL, 1, 0, 0);
  var upLegCoordMatL = new Matrix4(thighL.matrix);
  thighL.matrix.rotate(-180, 1, 0, 0);
  thighL.matrix.rotate(180, 0, 1, 0);
  thighL.matrix.translate(-.075, -.075, -.075);
  thighL.matrix.scale(0.15,0.3,0.15);
  thighL.render();

  var kneeL = new Cylinder();
  kneeL.segments = 6
  kneeL.color = [150/255, 150/255, 150/255, 1];
  kneeL.matrix = new Matrix4(upLegCoordMatL);
  kneeL.matrix.translate(.001, -.25, 0);
  kneeL.matrix.rotate(90, 0, 1, 0);
  kneeL.matrix.translate(0,0,-.075);
  kneeL.matrix.scale(0.15, 0.15, 0.15);
  kneeL.render();

  var calfL = new Cube();
  calfL.color = [120/255, 120/255, 120/255, 1];
  calfL.matrix = new Matrix4(upLegCoordMatL);
  calfL.matrix.translate(.001, -.25, 0);
  calfL.matrix.rotate(g_lowerLegRotL, 1, 0, 0);
  var lowLegCoordMatL = new Matrix4(calfL.matrix);
  calfL.matrix.rotate(-180, 1, 0, 0);
  calfL.matrix.rotate(180, 0, 1, 0);
  calfL.matrix.translate(-.05, -.05, -.05);
  calfL.matrix.scale(0.1,0.3,0.1);
  calfL.render();

  var foot1L = new Cube();
  foot1L.color = [90/255, 90/255, 90/255, 1];
  foot1L.matrix = new Matrix4(lowLegCoordMatL);
  foot1L.matrix.translate(-.025, -.225, -.05);
  foot1L.matrix.rotate(g_footRotL, 1,0,0)
  foot1L.matrix.rotate(45, 0,1,0)
  foot1L.matrix.translate(-.025, -.0249, -.075);
  foot1L.matrix.scale(0.05,0.05,0.1);
  foot1L.render();

  var foot2L = new Cube();
  foot2L.color = [90/255, 90/255, 90/255, 1];
  foot2L.matrix = new Matrix4(lowLegCoordMatL);
  foot2L.matrix.translate(.025, -.224, -.05);
  foot2L.matrix.rotate(g_footRotL, 1,0,0)
  foot2L.matrix.rotate(-45, 0,1,0)
  foot2L.matrix.translate(-.025, -.0249, -.075);
  foot2L.matrix.scale(0.05,0.05,0.1);
  foot2L.render();

  //END OF LEFT LEG CONSTRUCTION -------------------------------------------------------------------------

  //RIGHT LEG CONSTRUCTION-------------------------------------------------------------------
  var thighR = new Cube();
  thighR.color = [120/255, 120/255, 120/255, 1];
  thighR.matrix.translate(.275,-0.31, .05);
  thighR.matrix.rotate(g_upperLegRotR, 1, 0, 0);
  var upLegCoordMatR = new Matrix4(thighR.matrix);
  thighR.matrix.rotate(-180, 1, 0, 0);
  thighR.matrix.rotate(180, 0, 1, 0);
  thighR.matrix.translate(-.075, -.075, -.075);
  thighR.matrix.scale(0.15,0.3,0.15);
  thighR.render();

  var kneeR = new Cylinder();
  kneeR.segments = 6
  kneeR.color = [150/255, 150/255, 150/255, 1];
  kneeR.matrix = new Matrix4(upLegCoordMatR);
  kneeR.matrix.translate(.001, -.25, 0);
  kneeR.matrix.rotate(90, 0, 1, 0);
  kneeR.matrix.translate(0,0,-.075);
  kneeR.matrix.scale(0.15, 0.15, 0.15);
  kneeR.render();

  var calfR = new Cube();
  calfR.color = [120/255, 120/255, 120/255, 1];
  calfR.matrix = new Matrix4(upLegCoordMatR);
  calfR.matrix.translate(.001, -.25, 0);
  calfR.matrix.rotate(g_lowerLegRotR, 1, 0, 0);
  var lowLegCoordMatR = new Matrix4(calfR.matrix);
  calfR.matrix.rotate(-180, 1, 0, 0);
  calfR.matrix.rotate(180, 0, 1, 0);
  calfR.matrix.translate(-.05, -.05, -.05);
  calfR.matrix.scale(0.1,0.3,0.1);
  calfR.render();

  var foot1R = new Cube();
  foot1R.color = [90/255, 90/255, 90/255, 1];
  foot1R.matrix = new Matrix4(lowLegCoordMatR);
  foot1R.matrix.translate(-.025, -.225, -.05);
  foot1R.matrix.rotate(g_footRotR, 1,0,0)
  foot1R.matrix.rotate(45, 0,1,0)
  foot1R.matrix.translate(-.025, -.0249, -.075);
  foot1R.matrix.scale(0.05,0.05,0.1);
  foot1R.render();

  var foot2R = new Cube();
  foot2R.color = [90/255, 90/255, 90/255, 1];
  foot2R.matrix = new Matrix4(lowLegCoordMatR);
  foot2R.matrix.translate(.025, -.224, -.05);
  foot2R.matrix.rotate(g_footRotR, 1,0,0)
  foot2R.matrix.rotate(-45, 0,1,0)
  foot2R.matrix.translate(-.025, -.0249, -.075);
  foot2R.matrix.scale(0.05,0.05,0.1);
  foot2R.render();

  //END OF RIGHT LEG CONSTRUCTION -------------------------------------------------------------------------

  //START OF LEFT ARM -----------------------------------------------------------------------------------

  var shoulderL = new Cube();
  shoulderL.color = [90/255, 90/255, 90/255, 1];
  shoulderL.matrix.translate(.2,.1,.1);
  shoulderL.matrix.translate(-.1, -.1, -.1);
  shoulderL.matrix.scale(0.2, 0.2, 0.2);
  shoulderL.render();

  var upperarmL = new Cube();
  upperarmL.color = [120/255, 120/255, 120/255, 1];
  upperarmL.matrix.translate(.249,.15,.1);
  upperarmL.matrix.rotate(-g_upperArmRotZL, 0, 0, 1);
  upperarmL.matrix.rotate(g_upperArmRotXL, 1, 0, 0);
  var upArmCoordMatL = new Matrix4(upperarmL.matrix);
  //upperarmL.matrix.rotate(-180, 1, 0, 0);
  //upperarmL.matrix.rotate(180, 0, 1, 0);
  upperarmL.matrix.translate(-.05, -.05, -.05);
  upperarmL.matrix.scale(0.1, 0.3, 0.1);
  upperarmL.render();

  var elbowL = new Sphere();
  elbowL.segments = 4
  elbowL.color = [150/255, 150/255, 150/255, 1];
  elbowL.matrix = new Matrix4(upArmCoordMatL);
  elbowL.matrix.translate(.001, .275, 0);
  elbowL.matrix.rotate(45,0,1,0);
  elbowL.matrix.translate(0,0,0);
  elbowL.matrix.scale(0.09, 0.09, 0.09);
  elbowL.render();

  var midarmL = new Cube();
  midarmL.color = [120/255, 120/255, 120/255, 1];
  midarmL.matrix = new Matrix4(upArmCoordMatL);
  midarmL.matrix.translate(.001, .275, 0);
  midarmL.matrix.rotate(g_midArmRotZL, 0, 0, 1);
  midarmL.matrix.rotate(g_midArmRotYL, 0, 1, 0);
  midarmL.matrix.rotate(g_midArmRotXL, 1, 0, 0);
  var midArmCoordMatL = new Matrix4(midarmL.matrix);
  midarmL.matrix.rotate(-180, 1, 0, 0);
  midarmL.matrix.rotate(180, 0, 1, 0);
  midarmL.matrix.translate(-.05, -.05, -.05);
  midarmL.matrix.scale(0.1,0.4,0.1);
  midarmL.render();

  var forearmL = new Cube();
  forearmL.color = [120/255, 120/255, 120/255, 1];
  forearmL.matrix = midArmCoordMatL;
  forearmL.matrix.translate(.001, -.385, 0);
  forearmL.matrix.rotate(g_lowArmRotL, 1, 0, 0);
  var forearmCoordMatL = new Matrix4(forearmL.matrix);
  forearmL.matrix.rotate(-180, 1, 0, 0);
  forearmL.matrix.rotate(180, 0, 1, 0);
  forearmL.matrix.translate(-.075, -.075, -.075);
  forearmL.matrix.scale(0.15,0.3,0.15);
  forearmL.render();

  var handL = new Cube();
  handL.color = [100/255,100/255,100/255,1];
  handL.matrix = new Matrix4(forearmCoordMatL);
  handL.matrix.translate(0, -0.25, 0);
  handL.matrix.rotate(g_handRot, 0, 0, 1);
  var handCoordMatL = new Matrix4(handL.matrix);
  handL.matrix.rotate(90, 0, 1, 0);
  handL.matrix.translate(-.1, -.0375, -.05);
  handL.matrix.scale(.2, .075, .1);
  handL.render();

  var gun1 = new Cylinder
  gun1.color = [100/255,100/255,100/255,1];
  gun1.matrix = new Matrix4(handCoordMatL);
  gun1.matrix.translate(0, 0, -.03);
  gun1.matrix.rotate(180, 0, 1, 0);
  gun1.matrix.rotate(90, 1, 0, 0);
  gun1.matrix.translate(0, 0, -.05);
  gun1.matrix.scale(.1, .1, .25);
  gun1.render();

  //END OF LEFT ARM ------------------------------------------------------------------------------------------------------

  //START OF RIGHT ARM CONSTRUCTION --------------------------------------------------------------------------------------
  var shoulderR = new Cube();
  shoulderR.color = [90/255, 90/255, 90/255, 1];
  shoulderR.matrix.translate(-.2,.1,.1);
  shoulderR.matrix.translate(-.1, -.1, -.1);
  shoulderR.matrix.scale(0.2, 0.2, 0.2);
  shoulderR.render();

  var upperarmR = new Cube();
  upperarmR.color = [120/255, 120/255, 120/255, 1];
  upperarmR.matrix.translate(-.249,.15,.1);
  upperarmR.matrix.rotate(g_upperArmRotZR, 0, 0, 1);
  upperarmR.matrix.rotate(g_upperArmRotXR, 1, 0, 0);
  var upArmCoordMatR = new Matrix4(upperarmR.matrix);
  //upperarmL.matrix.rotate(-180, 1, 0, 0);
  //upperarmL.matrix.rotate(180, 0, 1, 0);
  upperarmR.matrix.translate(-.05, -.05, -.05);
  upperarmR.matrix.scale(0.1, 0.3, 0.1);
  upperarmR.render();

  var elbowR = new Sphere();
  elbowR.segments = 4
  elbowR.color = [150/255, 150/255, 150/255, 1];
  elbowR.matrix = new Matrix4(upArmCoordMatR);
  elbowR.matrix.translate(.001, .275, 0);
  elbowR.matrix.rotate(45,0,1,0);
  elbowR.matrix.translate(0,0,0);
  elbowR.matrix.scale(0.09, 0.09, 0.09);
  elbowR.render();

  var midarmR = new Cube();
  midarmR.color = [120/255, 120/255, 120/255, 1];
  midarmR.matrix = new Matrix4(upArmCoordMatR);
  midarmR.matrix.translate(.001, .275, 0);
  midarmR.matrix.rotate(-g_midArmRotZR, 0, 0, 1);
  midarmR.matrix.rotate(g_midArmRotYR, 0, 1, 0);
  midarmR.matrix.rotate(g_midArmRotXR, 1, 0, 0);
  var midArmCoordMatR = new Matrix4(midarmR.matrix);
  midarmR.matrix.rotate(-180, 1, 0, 0);
  midarmR.matrix.rotate(180, 0, 1, 0);
  midarmR.matrix.translate(-.05, -.05, -.05);
  midarmR.matrix.scale(0.1,0.4,0.1);
  midarmR.render();

  var forearmR = new Cube();
  forearmR.color = [120/255, 120/255, 120/255, 1];
  forearmR.matrix = midArmCoordMatR;
  forearmR.matrix.translate(.001, -.385, 0);
  forearmR.matrix.rotate(g_lowArmRotR, 1, 0, 0);
  var forearmCoordMatR = new Matrix4(forearmR.matrix);
  forearmR.matrix.rotate(-180, 1, 0, 0);
  forearmR.matrix.rotate(180, 0, 1, 0);
  forearmR.matrix.translate(-.075, -.075, -.075);
  forearmR.matrix.scale(0.15,0.3,0.15);
  forearmR.render();

  var handR = new Cube();
  handR.color = [100/255,100/255,100/255,1];
  handR.matrix = new Matrix4(forearmCoordMatR);
  handR.matrix.translate(0, -0.25, 0);
  handR.matrix.rotate(90, 0, 1, 0);
  handR.matrix.translate(-.1, -.0375, -.05);
  handR.matrix.scale(.2, .075, .1);
  handR.render();

  var saw1 = new Cylinder();
  saw1.color = [100/255,100/255,100/255,1];
  saw1.matrix = new Matrix4(forearmCoordMatR);
  saw1.matrix.translate(0, -0.4, 0);
  saw1.matrix.rotate(g_sawRot, 1, 0, 0);
  var sawCoordMat = new Matrix4(saw1.matrix);
  saw1.matrix.rotate(90, 0, 1, 0);
  saw1.matrix.translate(0, 0, -.025);
  saw1.matrix.scale(.25, .25, .05);
  saw1.render();

  var spike1 = new Cone();
  spike1.segments = 4;
  spike1.color = [247/255, 230/255, 50/255, 1];
  spike1.matrix = new Matrix4(sawCoordMat);
  spike1.matrix.translate(0,-.124,0);
  spike1.matrix.rotate(90, 1, 0, 0);
  spike1.matrix.scale(.05, .05, 0.05);
  spike1.render();

  var spike2 = new Cone();
  spike2.segments = 4;
  spike2.color = [247/255, 230/255, 50/255, 1];
  spike2.matrix = new Matrix4(sawCoordMat);
  spike2.matrix.translate(0,0,.124);
  spike2.matrix.scale(.05, .05, 0.05);
  spike2.render();

  var spike3 = new Cone();
  spike3.segments = 4;
  spike3.color = [247/255, 230/255, 50/255, 1];
  spike3.matrix = new Matrix4(sawCoordMat);
  spike3.matrix.translate(0,0,-.124);
  spike3.matrix.rotate(180, 1, 0, 0);
  spike3.matrix.scale(.05, .05, 0.05);
  spike3.render();

  var spike4 = new Cone();
  spike3.segments = 4;
  spike3.color = [247/255, 230/255, 50/255, 1];
  spike3.matrix = new Matrix4(sawCoordMat);
  spike3.matrix.translate(0,.124,0);
  spike3.matrix.rotate(270, 1, 0, 0);
  spike3.matrix.scale(.05, .05, 0.05);
  spike3.render();

  var spike5 = new Cone();
  spike5.segments = 4;
  spike5.color = [247/255, 230/255, 50/255, 1];
  spike5.matrix = new Matrix4(sawCoordMat);
  spike5.matrix.translate(0,-.088,-.088);
  spike5.matrix.rotate(135, 1, 0, 0);
  spike5.matrix.scale(.05, .05, 0.05);
  spike5.render();

  var spike6 = new Cone();
  spike6.segments = 4;
  spike6.color = [247/255, 230/255, 50/255, 1];
  spike6.matrix = new Matrix4(sawCoordMat);
  spike6.matrix.translate(0,.088,.088);
  spike6.matrix.rotate(-45, 1, 0, 0);
  spike6.matrix.scale(.05, .05, 0.05);
  spike6.render();

  var spike7 = new Cone();
  spike7.segments = 4;
  spike7.color = [247/255, 230/255, 50/255, 1];
  spike7.matrix = new Matrix4(sawCoordMat);
  spike7.matrix.translate(0,.088,-.088);
  spike7.matrix.rotate(225, 1, 0, 0);
  spike7.matrix.scale(.05, .05, 0.05);
  spike7.render();

  var spike8 = new Cone();
  spike8.segments = 4;
  spike8.color = [247/255, 230/255, 50/255, 1];
  spike8.matrix = new Matrix4(sawCoordMat);
  spike8.matrix.translate(0,-.088,.088);
  spike8.matrix.rotate(45, 1, 0, 0);
  spike8.matrix.scale(.05, .05, 0.05);
  spike8.render();

  //END OF RIGHT ARM ---------------------------------------------------------------------------------------------------------------------------------

  var duration = performance.now() - startTime;
  let msg = "time(ms):" + Math.floor(duration) + " fps:" + Math.floor(10000/duration)/10;
  sendStatsHTML(msg, "stats")
}

//Animation Vars:
var g_start = performance.now()/1000;
var g_last = performance.now()/1000;

function updateAnimation(){
  var now = performance.now()/1000;
  var elapsed = now - g_last;
  g_last = now;

  //arm animation angles
  if(g_animChoice == SWING){
    //LEFT LEG
    g_upperLegRotL = (75*Math.sin(g_last*g_speed));// 3 is the speed i chose
    if(g_upperLegRotL > 0){
      g_lowerLegRotL = (-60*Math.sin(g_last*g_speed));
    }else{
      g_lowerLegRotL = (100*Math.sin(g_last*g_speed)); 
    }
    //RIGHT LEG
    g_upperLegRotR = (-75*Math.sin(g_last*g_speed));
    if(g_upperLegRotR > 0){
      g_lowerLegRotR = (60*Math.sin(g_last*g_speed));
    }else{
      g_lowerLegRotR = (-100*Math.sin(g_last*g_speed)); 
    }

    //LEFT ARM
    g_upperArmRotXL = (5*Math.sin(g_last*g_speed));
    g_midArmRotXL = (-45*Math.sin(g_last*g_speed));

    //RIGHT ARM
    g_upperArmRotXR = (-5*Math.sin(g_last*g_speed));
    g_midArmRotXR = (45*Math.sin(g_last*g_speed));

  }else if(g_animChoice == JUMP){
    if(g_animStep == 1){
      g_animStepStatus = true;
      // ie 58 degree rotation per second for the upper right leg.
      let speed = g_speed * 2;
      g_upperLegRotR = rotPosStep(g_upperLegRotR, 80, elapsed, speed);
      // ie 53 degree rotation per second for the upper left leg.
      g_upperLegRotL = rotPosStep(g_upperLegRotL, 73, elapsed, speed);
      // ie -90 degree rotation per second for the upper left leg.
      speed = g_speed * 3;
      g_lowerLegRotR = rotNegStep(g_lowerLegRotR, -160, elapsed, speed);
      g_lowerLegRotL = rotNegStep(g_lowerLegRotL, -150, elapsed, speed);
      speed = g_speed;
      g_upperArmRotZR = rotPosStep(g_upperArmRotZR, 49, elapsed, speed);
      g_upperArmRotZL = rotPosStep(g_upperArmRotZL, 51, elapsed, speed);
      if(g_animStepStatus){ //all the animations must finish before moving onto the next step.
        g_animStep = 2;
      }
    }else if(g_animStep == 2){
      g_animStepStatus = true;
      let speed = g_speed * 2;
      g_upperLegRotR = rotNegStep(g_upperLegRotR,0, elapsed, speed);
      g_upperLegRotL = rotNegStep(g_upperLegRotL,0, elapsed, speed);
      speed =  g_speed * 3;
      g_lowerLegRotR = rotPosStep(g_lowerLegRotR, 0, elapsed, speed);
      g_lowerLegRotL = rotPosStep(g_lowerLegRotL, 0, elapsed, speed);
      speed =  g_speed;
      g_upperArmRotZR = rotNegStep(g_upperArmRotZR, 15, elapsed, speed);
      g_upperArmRotZL = rotNegStep(g_upperArmRotZL, 15, elapsed, speed);
      if(g_animStepStatus){ //all the animations must finish before moving onto the next step.
        g_animStep = 1;
        reset();
      }
    }
  }
  if(g_specialAnim){
    g_sawRot += (360 * elapsed* 3);
    if(g_sawRot >= 360){
      g_sawRot -= 360; 
    }
  }
}

function rotPosStep(prevAngle, desiredAngle, elapsed, speed){
  if(prevAngle == desiredAngle){
    return prevAngle;
  }
  let newAngle = prevAngle + (g_angleStep * speed * elapsed);
  condition2 = desiredAngle < 0 && newAngle <= desiredAngle;
  if(newAngle >= desiredAngle){
    newAngle = desiredAngle;
    g_animStepStatus = g_animStepStatus && true;
  }else {
    g_animStepStatus = g_animStepStatus && false;
  }
  return newAngle;
}

function rotNegStep(prevAngle, desiredAngle, elapsed, speed){
  if(prevAngle == desiredAngle){
    return prevAngle;
  }
  let newAngle = prevAngle + (-1 * g_angleStep * speed * elapsed);
  if(newAngle <= desiredAngle){
    newAngle = desiredAngle;
    g_animStepStatus = g_animStepStatus && true;
  }else {
    g_animStepStatus = g_animStepStatus && false;
  }
  return newAngle;
}

function sendStatsHTML(msg, htmlID){
  var htmlStats = document.getElementById(htmlID);
  if(!htmlStats){
    console.log("Failed to get " + htmlID + "from HTML");
    return;
  }
  htmlStats.innerHTML = msg;
}
