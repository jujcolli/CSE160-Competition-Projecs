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
    
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);
  
    gl.drawArrays(gl.TRIANGLES, 0, vtxCnt);
    //gl.drawArrays(gl.LINE_LOOP, 0, vtxCnt);
    //gl.disableVertexAttribArray(a_Position);
  }

  function drawTriangles3DUV(vertices) {
    // Write date into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW); //Note: I think that every time data is written to the buffer on the gpu the old Data is replaced
    let FSIZE = vertices.BYTES_PER_ELEMENT;

    // Enable the assignment to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 5, 0)
    gl.enableVertexAttribArray(a_Position);

    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, FSIZE * 5, FSIZE * 3)
    gl.enableVertexAttribArray(a_UV);
  
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 5);
  
    //gl.disableVertexAttribArray(a_Position);
  }

  function drawTriangles3DUV_Buff(vertices, buffer) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    let FSIZE = vertices.BYTES_PER_ELEMENT;

    // Enable the assignment to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 5, 0)
    gl.enableVertexAttribArray(a_Position);

    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, FSIZE * 5, FSIZE * 3)
    gl.enableVertexAttribArray(a_UV);
  
    gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 5);
  
    //gl.disableVertexAttribArray(a_Position);
  }

  function drawTrianglesN3DUV_Buff(vertices, buffer, normalbuffer, wireframe) {
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    let FSIZE = vertices.BYTES_PER_ELEMENT;

    // Enable the assignment to a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 5, 0)
    gl.enableVertexAttribArray(a_Position);

    //enable assignment to a_UV
    gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, FSIZE * 5, FSIZE * 3)
    gl.enableVertexAttribArray(a_UV);

    gl.bindBuffer(gl.ARRAY_BUFFER, normalbuffer);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0)
    gl.enableVertexAttribArray(a_Normal);

    if(wireframe){
      gl.drawArrays(gl.LINE_LOOP, 0, vertices.length / 5);
    }
    else{
      gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 5);
    }
  
    //gl.disableVertexAttribArray(a_Position);
  }

