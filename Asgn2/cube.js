class Cube{
    constructor(){
        this.type = "cube";
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
    }
    render(){
      var rgba = this.color;

      gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

      gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
      drawTriangle3D([0.0,0.0,0.0,  1.0,1.0,0.0,  1.0,0.0,0.0]);
      drawTriangle3D([0.0,0.0,0.0,  0.0,1.0,0.0,  1.0,1.0,0.0]);

      gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);
      drawTriangle3D([0,1,0,  0,1,1,  1,1,1]);
      drawTriangle3D([0,1,0,  1,1,1,  1,1,0]);

      gl.uniform4f(u_FragColor, rgba[0]*.8, rgba[1]*.8, rgba[2]*.8, rgba[3]);
      drawTriangle3D([1,0,0,  1,0,1,  1,1,1]);
      drawTriangle3D([1,0,0,  1,1,0,  1,1,1]);

      gl.uniform4f(u_FragColor, rgba[0]*.6, rgba[1]*.6, rgba[2]*.6, rgba[3]);
      drawTriangle3D([0,0,0,  0,0,1,  0,1,1]);
      drawTriangle3D([0,0,0,  0,1,0,  0,1,1]);

      gl.uniform4f(u_FragColor, rgba[0]*.5, rgba[1]*.5, rgba[2]*.5, rgba[3]);
      drawTriangle3D([0,0,1,  1,0,1,  1,1,1]);
      drawTriangle3D([0,0,1,  0,1,1,  1,1,1]);

      gl.uniform4f(u_FragColor, rgba[0]*.4, rgba[1]*.4, rgba[2]*.4, rgba[3]);
      drawTriangle3D([0,0,0,  0,0,1,  1,0,1]);
      drawTriangle3D([0,0,0,  1,0,0,  1,0,1]);

      // Pass the size
      //gl.uniform1f(u_PointSize, size);

      //let vertices = [xy[0], xy[1]]; 

      //var d = size/200
      //let angleStep = 360/this.segments;
      //for(var angle = 0; angle <= 361; angle += angleStep){ //there is a rounding error for when number of segments == 7 (fixed by making less than 361 shouldnt be a problem as long as seg size > 360
      //  let offsetx = d*Math.cos(angle*Math.PI/180)
      //  let offsety = d*Math.sin(angle*Math.PI/180)
      //  vertices.push(xy[0]+offsetx, xy[1]+offsety);
      //}

    }
}