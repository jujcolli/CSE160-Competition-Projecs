class Sphere{
    constructor(){
        this.type = "cylinder";
        this.wireframe = false;
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.segments = 6;
        this.size = 1;
        this.matrix = new Matrix4();
        this.vertices = null;
        this.buffer = null;
        this.normals = null;
        this.normalbuffer = null;
        this.textureChoice = -2;
        this.specular = 1;
        this.normalCorrect = true;
    
    }

    generateVertices(){
      // Pass the size
      console.log("entered");
      let v = [];
      let n = [];

      var d = Math.PI/this.segments;
      var dd = Math.PI/this.segments;
      console.log(d, dd);
      
      for(var t=0; t<Math.PI; t+=d){
        for(var r=0; r < (2*Math.PI); r+=d){
          var p1 = [Math.sin(t)*Math.cos(r), Math.sin(t)*Math.sin(r), Math.cos(t)];
          var p2 = [Math.sin(t+dd)*Math.cos(r), Math.sin(t+dd)*Math.sin(r), Math.cos(t+dd)];
          var p3 = [Math.sin(t)*Math.cos(r+dd), Math.sin(t)*Math.sin(r+dd), Math.cos(t)];
          var p4 = [Math.sin(t+dd)*Math.cos(r+dd), Math.sin(t+dd)*Math.sin(r+dd), Math.cos(t+dd)];

          var uv1 = [t/Math.PI, r/(2*Math.PI)];
          var uv2 = [(t+dd)/Math.PI, r/(2*Math.PI)];
          var uv3 = [t/Math.PI, (r+dd)/(2*Math.PI)];
          var uv4 = [(t+dd)/Math.PI, (r+dd)/(2*Math.PI)];

          v.push(p1[0], p1[1], p1[2], uv1[0], uv1[1]);
          v.push(p2[0], p2[1], p2[2], uv2[0], uv2[1]);
          v.push(p4[0], p4[1], p4[2], uv4[0], uv4[1]);

          n.push(p1[0], p1[1], p1[2]); n.push(p2[0], p2[1], p2[2]); n.push(p4[0], p4[1], p4[2]);

          v.push(p1[0], p1[1], p1[2], uv1[0], uv1[1]);
          v.push(p4[0], p4[1], p4[2], uv4[0], uv4[1]);
          v.push(p3[0], p3[1], p3[2], uv3[0], uv3[1]);
          n.push(p1[0], p1[1], p1[2]); n.push(p4[0], p4[1], p4[2]); n.push(p3[0], p3[1], p3[2]);
        }
      }
      
      this.normals = new Float32Array(n);
      this.vertices = new Float32Array(v);
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