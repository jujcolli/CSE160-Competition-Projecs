class Cone{
    constructor(){
        this.type = "cylinder";
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.segments = 10;
        this.size = .5;
        this.matrix = new Matrix4();
        this.vertices = null;
        this.buffer = null;
        this.textureChoice = -2;
    }

    generateVertices(){
      let v = [];
      let orig = [0, 0]; 

      var s = this.size;
      let angleStep = 360/this.segments;
      for(var angle = 0; angle < 360; angle += angleStep){ //there is a rounding error for when number of segments == 7 (fixed by making less than 361 shouldnt be a problem as long as seg size > 360
        let angle1 = angle;
        let angle2 = angle + angleStep;
        let vtx1 = [Math.cos(angle1*Math.PI/180)*s, Math.sin(angle1*Math.PI/180)*s];
        let vtx2 = [Math.cos(angle2*Math.PI/180)*s, Math.sin(angle2*Math.PI/180)*s];

        v.push(vtx1[0],vtx1[1],0, 0,0,    vtx2[0],vtx2[1],0, 0,0,   0,0,1, 0,0);

        v.push(orig[0],orig[1],0, 0,0,    vtx1[0],vtx1[1],0, 0,0,    vtx2[0],vtx2[1],0, 0,0);
      }
      this.vertices = new Float32Array(v);
    }

    render(){
      var rgba = this.color;
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      gl.uniform1i(u_whichTexture, this.textureChoice);

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

      drawTriangles3DUV_Buff(this.vertices, this.buffer)
      //drawTriangles3DUV(this.vertices);
    }
}