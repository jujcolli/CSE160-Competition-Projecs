class Triangle{
    constructor(){
        this.type = "triangle";
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.offsets = [-(Math.sqrt(3)/2), (-1/2), (Math.sqrt(3)/2), (-1/2), 0, 1]
        this.size = 10;
    }
    render(){
      var xy = this.position;
      var dxy = this.offsets;
      var rgba = this.color;
      var size = this.size;
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      // Pass the size
      gl.uniform1f(u_PointSize, size);
 
      var d = size/200
      drawTriangle([xy[0]+(d*dxy[0]), xy[1]+(d*dxy[1]), xy[0]+(d*dxy[2]), xy[1]+(d*dxy[3]), xy[0]+(d*dxy[4]), xy[1]+(d*dxy[5])]);
    }
}

function drawTriangle(vertices) {
    var vtxCnt = 3;
    // Create a buffer object
    vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }
  
    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  
    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, vtxCnt);

    gl.disableVertexAttribArray(a_Position);
  }

  function drawTriangle3D(vertices) {
    var vtxCnt = 3;
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW); //Note: I think that every time data is written to the buffer on the gpu the old Data is replaced

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);
  
    gl.drawArrays(gl.TRIANGLES, 0, vtxCnt);
  
    //gl.disableVertexAttribArray(a_Position);
  }