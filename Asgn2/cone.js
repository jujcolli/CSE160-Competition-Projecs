class Cone{
    constructor(){
        this.type = "cylinder";
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.segments = 10;
        this.size = .5;
        this.matrix = new Matrix4();
    }
    render(){
      var rgba = this.color;
      // Pass the size
      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      let orig = [0, 0]; 

      var s = this.size;
      let angleStep = 360/this.segments;
      for(var angle = 0; angle < 360; angle += angleStep){ //there is a rounding error for when number of segments == 7 (fixed by making less than 361 shouldnt be a problem as long as seg size > 360
        let angle1 = angle;
        let angle2 = angle + angleStep;
        let vtx1 = [Math.cos(angle1*Math.PI/180)*s, Math.sin(angle1*Math.PI/180)*s];
        let vtx2 = [Math.cos(angle2*Math.PI/180)*s, Math.sin(angle2*Math.PI/180)*s];

        let shade = .6 + .4 * (angle/360);
        gl.uniform4f(u_FragColor, rgba[0]*shade, rgba[1]*shade, rgba[2]*shade, rgba[3]);
        drawTriangle3D([vtx1[0], vtx1[1], 0,    vtx2[0], vtx2[1], 0,   0, 0, 1]);

        gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);
        drawTriangle3D([orig[0], orig[1], 0,    vtx1[0], vtx1[1], 0,    vtx2[0], vtx2[1], 0]);
      }
    }
}