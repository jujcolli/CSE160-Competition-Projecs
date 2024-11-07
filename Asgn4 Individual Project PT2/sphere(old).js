class Sphere{
    constructor(){
        this.type = "cylinder";
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.segments = 6;
        this.size = 1;
        this.matrix = new Matrix4();
        this.vertices = null;
        this.buffer = null;
        this.normals = null;
        this.normalbuffer = null;
        this.textureChoice = -2;
    
    }

    generateVertices(){
      // Pass the size

      let v = [];
      let n = [];

      let angleStep = 180/this.segments;
      var sphereSegments = []; // radius and height of sphere cross sections 
      for(var angle = -90; angle <= 90; angle += angleStep){ //get all sphere cross sections
        let circ = [Math.cos(angle*Math.PI/180), Math.sin(angle*Math.PI/180)];
        sphereSegments.push(circ);
      }
      for(var seg = 0; seg < this.segments; seg += 1){ //seg refers to segment of sphere
        let seg1 = sphereSegments[seg];
        let seg2 = sphereSegments[seg + 1];
        for(var angle = 0; angle < 360; angle += angleStep){ //there is a rounding error for when number of segments == 7 (fixed by making less than 361 shouldnt be a problem as long as seg size > 360
          let angle1 = angle;
          let angle2 = angle + angleStep;
          let s1v1 = [Math.cos(angle1*Math.PI/180)*seg1[0], seg1[1], Math.sin(angle1*Math.PI/180)*seg1[0]];
          let s1v2 = [Math.cos(angle2*Math.PI/180)*seg1[0], seg1[1], Math.sin(angle2*Math.PI/180)*seg1[0]];
          let s2v1 = [Math.cos(angle1*Math.PI/180)*seg2[0], seg2[1], Math.sin(angle1*Math.PI/180)*seg2[0]];
          let s2v2 = [Math.cos(angle2*Math.PI/180)*seg2[0], seg2[1], Math.sin(angle2*Math.PI/180)*seg2[0]];

          if(seg1[0] == 0){
            v.push(s1v1[0],s1v1[1],s1v1[2], 0,0,    s2v1[0],s2v1[1],s2v1[2], 0,0,    s2v2[0],s2v2[1],s2v2[2], 0,0);
            n.push(s1v1[0],s1v1[1],s1v1[2], 0,0,    s2v1[0],s2v1[1],s2v1[2], 0,0,    s2v2[0],s2v2[1],s2v2[2], 0,0);
          } else if(seg2[0] == 0){
            v.push(s2v2[0],s2v2[1],s2v2[2], 0,0,    s1v2[0],s1v2[1],s1v2[2], 0,0,    s1v1[0],s1v1[1],s1v1[2], 0,0);
            n.push(s2v2[0],s2v2[1],s2v2[2], 0,0,    s1v2[0],s1v2[1],s1v2[2], 0,0,    s1v1[0],s1v1[1],s1v1[2], 0,0);
          }else {
            v.push(s1v1[0],s1v1[1],s1v1[2], 0,0,    s2v1[0],s2v1[1],s2v1[2], 0,0,    s2v2[0],s2v2[1],s2v2[2], 0,0);
            n.push(s1v1[0],s1v1[1],s1v1[2], 0,0,    s2v1[0],s2v1[1],s2v1[2], 0,0,    s2v2[0],s2v2[1],s2v2[2], 0,0);
            v.push(s2v2[0],s2v2[1],s2v2[2], 0,0,    s1v2[0],s1v2[1],s1v2[2], 0,0,    s1v1[0],s1v1[1],s1v1[2], 0,0);
            n.push(s2v2[0],s2v2[1],s2v2[2], 0,0,    s1v2[0],s1v2[1],s1v2[2], 0,0,    s1v1[0],s1v1[1],s1v1[2], 0,0);
          }
        }
      }
      this.vertices = new Float32Array(v);
      this.normals = new Float32Array(n);
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

      if (this.normalbuffer === null) {
        this.normalbuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.DYNAMIC_DRAW);
        if (!this.normalbuffer) {
          console.log("Failed to create the buffer object");
          return -1;
        }
      }

      drawTrianglesN3DUV_Buff(this.vertices, this.buffer, this.normalbuffer);
      //drawTriangles3DUV(this.vertices);
    }
}