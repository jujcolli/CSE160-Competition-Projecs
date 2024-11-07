// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
   uniform mat4 u_ModelMatrix;
   uniform mat4 u_NormalMatrix;
   uniform mat4 u_GlobalRotateMatrix;
   uniform mat4 u_ViewMatrix;
   uniform mat4 u_ProjectionMatrix;
   attribute vec2 a_UV;
   attribute vec4 a_Position;
   attribute vec3 a_Normal;
   varying vec2 v_UV;
   varying vec3 v_Normal;
   varying vec4 v_VertPos; //global position of a vertex
   void main() {
     gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
     v_UV = a_UV;
     v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal,1)));
     v_VertPos = u_ModelMatrix * a_Position;
   }`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform vec3 u_LightPos;
  uniform vec3 u_LightColor;
  uniform vec3 u_CameraPos;
  uniform vec3 u_SpotlightAt; // also the at for the camera position since making a flashlight
  uniform float u_SpotlightAngle;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform sampler2D u_Sampler4;
  uniform int u_normalDebug;  //this should be a bool
  uniform int u_whichTexture;
  uniform int u_specular; //this should be a bool
  uniform int u_lightMode;
  uniform bool u_Spotlight;
  void main() {
    if(u_normalDebug > 0){
      gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0);
    } else if(u_whichTexture == -2){
      gl_FragColor = u_FragColor;
    } else if (u_whichTexture == -1){
      gl_FragColor = vec4(v_UV,1.0,1.0);
    } else if (u_whichTexture == 0){
      gl_FragColor = texture2D(u_Sampler0, v_UV);
    } else if (u_whichTexture == 1){
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else if (u_whichTexture == 2){
      gl_FragColor = texture2D(u_Sampler2, v_UV);
    } else if (u_whichTexture == 3){
      gl_FragColor = texture2D(u_Sampler3, v_UV);
    } else if (u_whichTexture == 4){
      gl_FragColor = texture2D(u_Sampler4, v_UV); 
    } else{
      gl_FragColor = vec4(1,.2,.2,1);
    }

    vec3 lightVector = u_LightPos-vec3(v_VertPos);
    float r=length(lightVector);
    
    // N dot L -- angle between normal and light
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N,L), 0.0);

    //Reflection (L is negative bc reflect function takes a vector from light to vertex not vertex to light)
    vec3 R = reflect(-L, N);

    //eye
    vec3 E = normalize(u_CameraPos-vec3(v_VertPos));

    //Specular
    vec3 specular = u_LightColor * pow(max(dot(E,R), 0.0),40.0);

    //diffuse and ambient
    vec3 diffuse = u_LightColor * vec3(gl_FragColor) * nDotL;
    vec3 ambient = u_LightColor * vec3(gl_FragColor) * 0.3; //ambient coeficient of .3

    vec3 direction = u_SpotlightAt - u_LightPos;
    vec3 D = normalize(direction);
    float LDotd = dot(-L,D);

    //result
    if (u_Spotlight){
      if(LDotd < cos(u_SpotlightAngle)){
        gl_FragColor = vec4(ambient, 1.0);
      } else if (u_specular > 0){
        gl_FragColor = vec4(specular+diffuse+ambient, 1.0);
      } else {
        gl_FragColor = vec4(diffuse+ambient, 1.0);
      }
    } else if(u_lightMode == 1){
      if (u_specular > 0){
        gl_FragColor = vec4(specular+diffuse+ambient, 1.0);
      } else {
        gl_FragColor = vec4(diffuse+ambient, 1.0);
      }
    } else if(u_lightMode == -1){
      if (r<5.0){
        gl_FragColor = vec4(1,0,0,1);
      } else if (r<10.0){
        gl_FragColor = vec4(0,1,0,1);
      }
    }

  }`;

//CONSTS
STILL = 0;
SWING = 1;

//Global Variables
var canvas;
var gl;
var a_Position;
var a_UV;
var a_Normal;
var u_FragColor;
var u_ModelMatrix;
var u_NormalMatrix;
var u_GlobalRotateMatrix;
var u_ViewMatrix;
var u_ProjectionMatrix;

//Texture objects
var u_Sampler0;
var u_Sampler1;
var u_Sampler2;
var u_Sampler3;
var u_Sampler4;
var u_whichTexture;

//lighting obj
var u_normalDebug;
var u_LightPos;
var u_LightColor;
var u_CameraPos;
var u_specular;
var u_lightMode;
var u_SpotlightAt;
var u_SpotlightAngle;
var u_Spotlight;

var g_lightColor = [255, 255, 255]; 
var g_lightPos; //this is relative to the player
var g_lightBox;
var g_lightBoxMat;
var g_SpotlightAngle = 35 * (Math.PI/180);

var g_staticLight = false;
var g_statLightPos;

var g_DayNight = false;
var g_Spotlight = false;
var g_lightMode = 1;

//Object Vars
var g_objAnimate = true;
var g_sphere;
var g_obama;
var g_cursor;
var g_moonsand;
var g_cheese;
var g_skybox;
var g_skyboxMat;

//Game Vars
var g_cheese_count = 0;

//Chunks
var chunks = [];
var loaded_chunks = [];
var g_render_dist = 1;

//Camera
var g_camera;

var g_camAngleY = 0;
var g_camAngleX = 0;

//camera rotation
var lastDownX;
var lastDownY;

//Key Presses
g_forward = false;
g_backward = false;
g_right = false;
g_left = false;
g_panLeft = false;
g_panRight = false;

//End of Camera

function inputActionUI(){
  document.getElementById("lightX").addEventListener('mousemove', function(ev){if(ev.buttons == 1 && !g_DayNight && !g_Spotlight){g_lightPos.elements[0] = this.value;}});
  document.getElementById("lightY").addEventListener('mousemove', function(ev){if(ev.buttons == 1 && !g_DayNight && !g_Spotlight){g_lightPos.elements[1] = this.value;}});
  document.getElementById("lightZ").addEventListener('mousemove', function(ev){if(ev.buttons == 1 && !g_DayNight && !g_Spotlight){g_lightPos.elements[2] = this.value;}});
  document.getElementById("reset").onclick = function() {g_lightPos = new Vector3([0, 45, 0]); g_Spotlight = false; g_DayNight = false;};
  document.getElementById("DayNight").onclick = function() {g_lightPos = new Vector3([0, 45, 0]); g_Spotlight = false; g_DayNight = !g_DayNight;};
  document.getElementById("spotlight").onclick = function() {g_DayNight = false; if(!g_Spotlight){g_Spotlight = true; g_lightPos = new Vector3([0, 0, 0]);}else{g_Spotlight = false; g_lightPos = new Vector3([0, 45, 0]);}};
  document.getElementById("spotAngle").addEventListener('mousemove', function(ev){if(ev.buttons == 1 && g_Spotlight){g_SpotlightAngle = this.value * (Math.PI/180);}});

  document.getElementById("lightR").addEventListener('mousemove', function(ev){if(ev.buttons == 1){g_lightColor[0] = this.value;}});
  document.getElementById("lightG").addEventListener('mousemove', function(ev){if(ev.buttons == 1){g_lightColor[1] = this.value;}});
  document.getElementById("lightB").addEventListener('mousemove', function(ev){if(ev.buttons == 1){g_lightColor[2] = this.value;}});

  document.getElementById("lightMode").addEventListener('mousemove', function(ev){if(ev.buttons == 1 && !g_Spotlight){g_lightMode = this.value;}});
  document.getElementById("static").onclick = function() {g_staticLight = !g_staticLight;};
  document.getElementById("animate").onclick = function() {g_objAnimate = !g_objAnimate;};

  document.getElementById("normalsDebugOn").onclick = function() {gl.uniform1i(u_normalDebug, 1);};
  document.getElementById("normalsDebugOff").onclick = function() {gl.uniform1i(u_normalDebug, 0);};
  document.getElementById("renderDist").onclick = function() {g_render_dist = this.value;};
}

function initCamera() {
  g_camera = new Camera();
}

function initTextures() {

  var image0 = new Image();  // Create the image object
  var image1 = new Image();
  var image2 = new Image();
  var image3 = new Image();
  var image4 = new Image();

  if (!image0) {
    console.log('Failed to create the image0 object');
    return false;
  }
  if (!image1) {
    console.log('Failed to create the image1 object');
    return false;
  }
  if (!image2) {
    console.log('Failed to create the image2 object');
    return false;
  }
  if (!image3) {
    console.log('Failed to create the image3 object');
    return false;
  }
  if (!image4) {
    console.log('Failed to create the image4 object');
    return false;
  }

  // Register the event handler to be called on loading an image
  image0.onload = function(){sendTextureToGLSL(image0, 0, u_Sampler0); };
  image1.onload = function(){sendTextureToGLSL(image1, 1, u_Sampler1); };
  image2.onload = function(){sendTextureToGLSL(image2, 2, u_Sampler2); };
  image3.onload = function(){sendTextureToGLSL(image3, 3, u_Sampler3); };
  image4.onload = function(){sendTextureToGLSL(image4, 4, u_Sampler4); };
  // Tell the browser to load an image
  image0.src = 'sky.jpg';
  image1.src = 'moon.jpg';
  image2.src = 'cheese.jpg';
  image3.src = 'map.jpg';
  image4.src = 'obamna.jpg';

  return true;
}

function initObjs(){
  g_sphere = new Sphere();
  g_sphere.segments = 25;
  g_sphere.textureChoice = 3;
  g_sphere.matrix.translate(0, 25, 0);
  g_sphere.matrix.rotate(90, 1, 0, 0);
  g_sphere.matrix.scale(5, 5, 5);

  g_obama = new Cube();
  g_obama.textureChoice = 4;
  g_obama.specular = 1;
  g_obama.matrix.translate(20, 25, 20);
  g_obama.matrix.scale(5, 5, 5);
  g_obama.matrix.translate(-.5, -.5, -.5);

  g_cursor = new Voxel(-2);
  g_cursor.geometry.color = [1.0, 0, 0, 1];
  g_cursor.geometry.wireframe = true;
  g_moonsand = new Voxel(1);
  g_cheese = new Voxel(2);

  g_lightPos = new Vector3([0,45,0]); // setting up the light position vector
  g_lightBox = new Cube();
  g_lightBox.color = [1.0, 1.0, 0.0, 1.0];
  g_lightBox.normalCorrect = false;
  g_lightBoxMat = new Matrix4();
  g_lightBoxMat.scale(-1, -1, -1);
  g_lightBoxMat.translate(-.5, -.5, -.5);

  g_skybox = new Cube();
  g_skybox.textureChoice = 0;
  g_skybox.normalCorrect = false;
  g_skyboxMat = new Matrix4();
  g_skyboxMat.scale(-500, -500, -500);
  g_skyboxMat.translate(-.5, -.5, -.5)
}

function sendTextureToGLSL(image, tex_unit, sampler) {
  let texture = gl.createTexture();   // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  if(tex_unit == 0){
    gl.activeTexture(gl.TEXTURE0);
  }else if(tex_unit == 1){
    gl.activeTexture(gl.TEXTURE1);
  }else if(tex_unit == 2){
    gl.activeTexture(gl.TEXTURE2);
  }else if(tex_unit == 3){
    gl.activeTexture(gl.TEXTURE3);
  }else if(tex_unit == 4){
    gl.activeTexture(gl.TEXTURE4);
  }
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit # to the sampler #
  gl.uniform1i(sampler, tex_unit);
  
}


function main() {
  // Retrieve <canvas> element
  setupWebGL();
  connectVariablesToGLSL();
  initCamera();
  initObjs();

  chunkInit() // REMOVE LATER

  inputActionUI();
  // Specify the color for clearing <canvas>
  canvas.onmousedown = function (ev) {
    [x, y] = coordConvCanvGL(ev);
    lastDownX = x;
    lastDownY = y;
    click(ev); 
  };
  
  document.onkeydown = keydown;
  document.onkeyup = keyup;

  canvas.onmousemove = function (ev) {if(ev.buttons == 1 && !ev.shiftKey){ click(ev); }};
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  requestAnimationFrame(tick);
}

function keydown(ev){
  //forward and back
  if(ev.keyCode == 38){
    g_forward = true;
  }else if(ev.keyCode == 40){
    g_backward = true;
  }

  if(ev.keyCode == 66){
    //console.log("HERE");
    g_camera.breakBlock();
    return;
  }

  if(ev.keyCode == 80){
    //console.log("HERE");
    g_camera.placeBlock();
    return;
  }
  
  
  //right and left
  if(ev.keyCode == 39){
    g_right = true;
  }else if(ev.keyCode == 37){
    g_left = true;
  }
  
  if(ev.keyCode == 81){
    g_panLeft = true;
  }else if(ev.keyCode == 69){
    g_panRight = true;
  }
//  console.log(ev.keyCode);
}

function keyup(ev){
  //forward and back
  if(ev.keyCode == 38){
    g_forward = false;
  }else if(ev.keyCode == 40){
    g_backward = false;
  }
  
  //right and left
  if(ev.keyCode == 39){
    g_right = false;
  }else if(ev.keyCode == 37){
    g_left = false;
  }
  
  if(ev.keyCode == 81){
    g_panLeft = false;
  }else if(ev.keyCode == 69){
    g_panRight = false;
  }
//  console.log(ev.keyCode);
}

function updateCamera() {
  if(g_forward){
    g_camera.forward();
  }else if(g_backward){
    g_camera.backward();
  }
  
  //right and left
  if(g_right){
    g_camera.right();
  }else if(g_left){
    g_camera.left();
  }
  
  if(g_panLeft){
    g_camera.rotLeft()
  }else if(g_panRight){
    g_camera.rotRight()
  }

  g_camera.updateCursorPos()
}

function click(ev){
  let [newX, newY] = coordConvCanvGL(ev);

  var dX = newX - lastDownX;
  var dY = newY - lastDownY;
  let d = new Vector3();
  d.set(g_camera.at);
  d.sub(g_camera.eye); // euiv to at - eye
  let p = d.magnitude();
  let r = Math.sqrt(Math.pow(d.elements[0], 2) + Math.pow(d.elements[2], 2));
  let theta = calcAngle(d.elements[0], d.elements[2]);
  let newTheta = theta + (90 * dX);
  let y = d.elements[1];
  let phi = calcAngle(r, y);
  newPhi = phi + (90 * dY);
  //console.log(newPhi);
  if(newPhi >= 90){
    newPhi = 89;
    //console.log("case1");
  }else if(newPhi <= -90){
    newPhi = -89;
    //console.log("case2");
  }
  let newR = p * Math.cos(newPhi * (Math.PI/180));
  let newCamX = newR * Math.cos(newTheta * (Math.PI/180));
  let newCamZ = newR * Math.sin(newTheta * (Math.PI/180));

  let newCamY = p * Math.sin(newPhi * (Math.PI/180));
  let newD = new Vector3([newCamX, newCamY, newCamZ]);  
  g_camera.at.set(g_camera.eye);
  g_camera.at.add(newD);

  g_camera.updateCursorPos()

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
  updateCamera();
  updateAnimation();
  // draw our shapes
  renderAllShapes();
  //tell browser to update when requested
  requestAnimationFrame(tick);
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
  //gl.enable(gl.CULL_FACE);
  //gl.cullFace(gl.BACK);
}

function connectVariablesToGLSL() {
// Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }
  //vertex information
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
    return;
  }

  //texture details
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of u_Sampler
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return false;
  }

  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return false;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return false;
  }

  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if (!u_Sampler3) {
    console.log('Failed to get the storage location of u_Sampler3');
    return false;
  }

  u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
  if (!u_Sampler4) {
    console.log('Failed to get the storage location of u_Sampler4');
    return false;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return false;
  }
  initTextures();

  //lighting
  u_normalDebug = gl.getUniformLocation(gl.program, 'u_normalDebug');
  if (!u_normalDebug) {
    console.log('Failed to get the storage location of u_normalDebug');
    return false;
  }
  gl.uniform1i(u_normalDebug, 0);

  u_LightPos = gl.getUniformLocation(gl.program, 'u_LightPos');
  if (!u_LightPos) {
    console.log('Failed to get the storage location of u_LightPos');
    return false;
  }

  u_CameraPos = gl.getUniformLocation(gl.program, 'u_CameraPos');
  if (!u_CameraPos) {
    console.log('Failed to get the storage location of u_CameraPos');
    return false;
  }

  u_specular = gl.getUniformLocation(gl.program, 'u_specular');
  if (!u_specular) {
    console.log('Failed to get the storage location of u_specular');
    return false;
  }

  u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  if (!u_LightColor) {
    console.log('Failed to get the storage location of u_LightColor');
    return false;
  }

  u_lightMode = gl.getUniformLocation(gl.program, 'u_lightMode');
  if (!u_lightMode) {
    console.log('Failed to get the storage location of u_lightMode');
    return false;
  }

  u_SpotlightAt = gl.getUniformLocation(gl.program, 'u_SpotlightAt');
  if (!u_SpotlightAt) {
    console.log('Failed to get the storage location of u_SpotlightAt');
    return false;
  }

  u_SpotlightAngle = gl.getUniformLocation(gl.program, 'u_SpotlightAngle');
  if (!u_SpotlightAngle) {
    console.log('Failed to get the storage location of u_SpotlightAngle');
    return false;
  }
  
  u_Spotlight = gl.getUniformLocation(gl.program, 'u_Spotlight');
  if (!u_Spotlight) {
    console.log('Failed to get the storage location of u_Spotlight');
    return false;
  }

  //matricies
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if(!u_ModelMatrix){
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }
  var identityMat = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityMat.elements);
  
  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if(!u_NormalMatrix){
    console.log('Failed to get the storage location of u_NormalMatrix');
    return;
  }

  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if(!u_GlobalRotateMatrix){
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if(!u_ViewMatrix){
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if(!u_ProjectionMatrix){
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  //u_PointSize = gl.getUniformLocation(gl.program, 'u_PointSize');
  //if (!u_FragColor) {
  //  console.log('Failed to get the storage location of u_PointSize');
  //  return;
  //}
}

function chunkInit(){
  let chunk1 = new Chunk(1, 1);
  chunk1.generatePerlin();
  let chunk2 = new Chunk(-1, 1);
  chunk2.generatePerlin();
  let chunk3 = new Chunk(1, -1);
  chunk3.generatePerlin();
  let chunk4 = new Chunk(-1, -1);
  chunk4.generatePerlin();

  chunks.push(chunk1, chunk2, chunk3, chunk4);
  loaded_chunks.push(chunk1, chunk2, chunk3, chunk4);

  g_camera.curChunk = chunk1;

  //let sphere_height = chunk1.data[119] + 1.25;
}

function renderLight(){
  g_lightBox.matrix = new Matrix4();
  gl.uniform3f(u_CameraPos, g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
  gl.uniform3f(u_LightColor, g_lightColor[0]/255, g_lightColor[1]/255, g_lightColor[2]/255);
  if(!g_staticLight){
    let xPos = g_camera.eye.elements[0] + g_lightPos.elements[0];
    let yPos = g_camera.eye.elements[1] + g_lightPos.elements[1];
    let zPos = g_camera.eye.elements[2] + g_lightPos.elements[2];
    gl.uniform1i(u_lightMode, g_lightMode);
    gl.uniform1i(u_Spotlight, g_Spotlight);
    gl.uniform3f(u_LightPos, xPos , yPos, zPos);
    //spotlight stuff
    gl.uniform3f(u_SpotlightAt, g_camera.at.elements[0], g_camera.at.elements[1], g_camera.at.elements[2]);
    gl.uniform1f(u_SpotlightAngle, g_SpotlightAngle);
    if(!g_Spotlight){
      g_lightBox.matrix.translate(xPos , yPos, zPos);
      g_lightBox.matrix.multiply(g_lightBoxMat);
      g_lightBox.render();
    }
    g_statLightPos = new Vector3([xPos, yPos, zPos]);
  }else{
    g_lightBox.matrix.translate(g_statLightPos.elements[0] , g_statLightPos.elements[1], g_statLightPos.elements[2]);
    g_lightBox.matrix.multiply(g_lightBoxMat);
    g_lightBox.render();}
}

function renderSkybox(){
  g_skybox.matrix = new Matrix4();
  g_skybox.matrix.translate(g_camera.eye.elements[0], g_camera.eye.elements[1], g_camera.eye.elements[2]);
  g_skybox.matrix.multiply(g_skyboxMat);
  g_skybox.render();
}

function renderAllShapes(){
  var startTime = performance.now();

  var projMatrix = new Matrix4();
  projMatrix.setPerspective(90, canvas.width/canvas.height, .1, 1000); //put in the camera class
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMatrix.elements);

  var viewMatrix = new Matrix4();
  viewMatrix.setLookAt(g_camera.eye.elements[0],g_camera.eye.elements[1],g_camera.eye.elements[2],  //put in the camera class
                       g_camera.at.elements[0],g_camera.at.elements[1],g_camera.at.elements[2],  
                       g_camera.up.elements[0],g_camera.up.elements[1],g_camera.up.elements[2]);
  //viewMatrix.setLookAt(0,0,-1.5,  0,0,100,  0,1,0) //(eye, at, up)
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMatrix.elements);

  var globalRotMatrix = new Matrix4();
  globalRotMatrix.rotate(g_camAngleY, 0, 1, 0);
  globalRotMatrix.rotate(g_camAngleX, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMatrix.elements);

  //gl.clear(gl.COLOR_BUFFER_BIT);
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  //updateLoadedChunks();
  renderLight();
  renderSkybox(); 
  g_sphere.render();
  g_obama.render();
  if(g_camera.cursor !== null){
    g_cursor.render(g_camera.cursor.elements[0], g_camera.cursor.elements[1], g_camera.cursor.elements[2]);
  }
  //g_lightBox.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  renderLoadedChunks();
  
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

  if (g_objAnimate){
    g_sphere.matrix.rotate((25 * elapsed), 0, 0, 1);
    g_obama.matrix.rotate((45 * elapsed), 0, 1, 0);
    //g_obama2.matrix.rotate((45 * elapsed), 0, 1, 0);
  }

  if (g_DayNight){
    let r = Math.sqrt(Math.pow(g_lightPos.elements[2], 2) + Math.pow(g_lightPos.elements[1], 2));
    let ang = calcAngle(g_lightPos.elements[2], g_lightPos.elements[1]);
    let newAng = ang + (5 * elapsed);
    let newLPosZ = r * Math.cos(newAng * (Math.PI/180));
    let newLPosY = r * Math.sin(newAng * (Math.PI/180));
    g_lightPos = new Vector3([0, newLPosY, newLPosZ]);  
  }
}

function sendStatsHTML(msg, htmlID){
  var htmlStats = document.getElementById(htmlID);
  if(!htmlStats){
    console.log("Failed to get " + htmlID + "from HTML");
    return;
  }
  htmlStats.innerHTML = msg;
}
