class Cube{
    constructor(){
        this.type = "cube";
        this.wireframe = false;
        this.color = [1.0, 1.0, 0.0, 1.0];
        this.matrix = new Matrix4();
        this.vertices = null;
        this.normals = null;
        this.buffer = null;
        this.normalbuffer = null;
        this.textureChoice = -2;
        this.specular = 0;
        this.normalCorrect = true;
    }

    generateVertices(){
      let n = [];
      let v = [];

      //front face
      v.push(0,0,0, 0,0,   1,1,0, 1,1,   1,0,0, 1,0); //with uv map
      n.push(0,0,-1,       0,0,-1,       0,0,-1);
      v.push(0,0,0, 0,0,   0,1,0, 0,1,   1,1,0, 1,1);
      n.push(0,0,-1,       0,0,-1,       0,0,-1);

      //top face
      //gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
      v.push(0,1,0, 0,0,   1,1,1, 1,1,   0,1,1, 1,0);
      n.push(0,1,0,        0,1,0,        0,1,0);
      v.push(0,1,0, 0,0,   1,1,0, 0,1,   1,1,1, 1,1);
      n.push(0,1,0,        0,1,0,        0,1,0);

      //right face
      //gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
      v.push(1,0,0, 0,0,   1,1,1, 1,1,   1,0,1, 1,0);
      n.push(1,0,0,        1,0,0,        1,0,0);
      v.push(1,0,0, 0,0,   1,1,0, 0,1,   1,1,1, 1,1);
      n.push(1,0,0,        1,0,0,        1,0,0);

      //left face
      //gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);
      v.push(0,0,0, 0,0,   0,1,1, 1,1,   0,0,1, 1,0);
      n.push(-1,0,0,        -1,0,0,        -1,0,0);
      v.push(0,0,0, 0,0,   0,1,0, 0,1,   0,1,1, 1,1);
      n.push(-1,0,0,        -1,0,0,        -1,0,0);

      //back face
      //gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.5, rgba[3]);
      v.push(0,0,1, 0,0,   1,1,1, 1,1,   1,0,1, 1,0);
      n.push(0,0,1,        0,0,1,        0,0,1);
      v.push(0,0,1, 0,0,   0,1,1, 0,1,   1,1,1, 1,1);
      n.push(0,0,1,        0,0,1,        0,0,1);

      //gl.uniform4f(u_FragColor, rgba[0]*.4, rgba[1]*.4, rgba[2]*.4, rgba[3]);
      v.push(0,0,0, 0,0,  1,0,1, 1,1,   0,0,1, 1,0);
      n.push(0,-1,0,      0,-1,0,       0,-1,0);
      v.push(0,0,0, 0,0,  1,0,0, 0,1,   1,0,1, 1,1);
      n.push(0,-1,0,      0,-1,0,       0,-1,0);
      this.vertices = new Float32Array(v);
      this.normals = new Float32Array(n);
      //console.log(this.vertices.length);
    }

    render(){
      var rgba = this.color;
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
      if(this.normalCorrect){
        let normalMatrix = new Matrix4();
        normalMatrix.setInverseOf(this.matrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
      }
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      gl.uniform1i(u_whichTexture, this.textureChoice);
      gl.uniform1i(u_specular, this.specular);

      if (this.vertices === null) {
        this.generateVertices();
      }

      if (this.buffer === null) {
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);
        if (!this.buffer) {
          console.log("Failed to create the buffer object");
          return -1;
        }
      }

      if (this.normalbuffer === null) {
        this.normalbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.DYNAMIC_DRAW);
        if (!this.normalbuffer) {
          console.log("Failed to create the buffer object");
          return -1;
        }
      }

      drawTrianglesN3DUV_Buff(this.vertices, this.buffer, this.normalbuffer, this.wireframe);
      //drawTriangles3DUV(this.vertices);
    }
}