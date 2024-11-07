class Chunk{
    constructor(x,z){
        this.coords = [x,z]; // multiply by 16 to get block coords of corner most block
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.wireframe = false;
        this.textureChoice = 1;
        this.specular = 0;
        this.init = false;
        this.data = [];
        this.block_types = 2;
        this.height_default = 10;
        this.cheese = false;
        this.cheese_collected = false;
        this.cheese_location = null;
        this.vertices = null;
        this.normal = null;
        this.buffer = null
        this.normalbuffer = null;
        this.matrix = new Matrix4();

        //generate the matrix
    
        if(x > 0){
            this.matrix.translate((x-1)*16, 0, 0);
        }else{
            this.matrix.translate((x+1)*16, 0, 0);
        }
        if(z > 0){
            this.matrix.translate(0, 0, (z-1)*16);
        }else{
            this.matrix.translate(0, 0, (z+1)*16);
        }
        
        if(x < 0 && z > 0){
            this.matrix.scale(-1,1,1);
        }else if(x < 0 && z < 0){
            this.matrix.scale(-1,1,-1);
        }else if (x > 0 && z < 0){
            this.matrix.scale(1,1,-1);
        }
    }
    generateFlat(){
        if(this.init){
            console.log("Already Initialized");
            return;
        }
        this.init = true;
        for (var i = 0; i < 256; i++){ // 256 is number of blocks in xz plane.
            this.data.push([1]);
        }
        this.generateVertices();
    }
    generatePerlin(){
        if(this.init){
            console.log("Already Initialized");
            return;
        }
        this.init = true;
        for(var i = 0; i < 256; i++){
            this.data.push([]);
            let vox_x = convertVoxelCoordsX(i, this);
            let vox_z = convertVoxelCoordsZ(i, this);

            let displace = perlin.get(vox_x/16, vox_z/16) * (this.height_default-1);
            let terrain_height = Math.floor(this.height_default + displace);
            for(var j = 0; j < this.height_default * 2; j++){
                if (j < terrain_height){
                    this.data[i].push(1);
                }else{
                    this.data[i].push(0);
                }
            }
        }
        if((Math.floor(Math.random() * 16)) == 8){
            this.cheese = true;
            let i = Math.floor(Math.random() * 256);
            let vox_y = 1; // max height of terrain at given block position + 1 (that is the height of the cheese)
            for(var j = 1; j < this.height_default * 2; j++){
                if(this.data[i][j] > 0){
                    vox_y = j+1;
                }
            }
            //----------------------------
            let vox_x = convertVoxelCoordsX(i, this);
            let vox_z = convertVoxelCoordsZ(i, this);
            this.cheese_location = new Vector3([vox_x, vox_y, vox_z]);
        }
        this.generateVertices();
    }

    generateVertices(){
        let v = [];
        let n = [];
        for(var i = 0; i < 256; i++){
            for(var j = 0; j < this.height_default * 2; j++){ // could be simplified alot but i am super lazy
                let xrow = Math.floor(i/16);
                let zcol = (i % 16);    
                if(this.data[i][j] == 0){
                    continue;
                }
                //NOTE: first case of each if clause is for chunk borders
                if(j+1 == this.height_Default*2){ // for top faces
                    v.push(xrow, j+1, zcol, 0,0,   xrow+1, j+1, zcol+1, 1,1,   xrow, j+1, zcol+1, 1,0);
                    n.push(0,1,0,        0,1,0,        0,1,0);
                    v.push(xrow, j+1, zcol, 0,0,   xrow+1, j+1, zcol, 0,1,   xrow+1, j+1, zcol+1, 1,1);
                    n.push(0,1,0,        0,1,0,        0,1,0);
                } else if(this.data[i][j+1] == 0){
                    v.push(xrow, j+1, zcol, 0,0,   xrow+1, j+1, zcol+1, 1,1,   xrow, j+1, zcol+1, 1,0);
                    n.push(0,1,0,        0,1,0,        0,1,0);
                    v.push(xrow, j+1, zcol, 0,0,   xrow+1, j+1, zcol, 0,1,   xrow+1, j+1, zcol+1, 1,1);
                    n.push(0,1,0,        0,1,0,        0,1,0);
                }

                if(j-1 < 0){ // for bottom faces
                    v.push(xrow, j, zcol, 0,0,   xrow+1, j, zcol+1, 1,1,   xrow, j, zcol+1, 1,0);
                    n.push(0,-1,0,      0,-1,0,       0,-1,0);
                    v.push(xrow, j, zcol, 0,0,   xrow+1, j, zcol, 0,1,   xrow+1, j, zcol+1, 1,1);
                    n.push(0,-1,0,      0,-1,0,       0,-1,0);
                } else if(this.data[i][j-1] == 0){
                    v.push(xrow, j, zcol, 0,0,   xrow+1, j, zcol+1, 1,1,   xrow, j, zcol+1, 1,0);
                    n.push(0,-1,0,      0,-1,0,       0,-1,0);
                    v.push(xrow, j, zcol, 0,0,   xrow+1, j, zcol, 0,1,   xrow+1, j, zcol+1, 1,1);
                    n.push(0,-1,0,      0,-1,0,       0,-1,0);
                }

                let r = ((xrow - 1)*16) + zcol; // idx block to the right of this one
                if(xrow == 0){ // for left faces 
                    v.push(xrow, j, zcol, 0,0,   xrow, j+1, zcol+1, 1,1,   xrow, j, zcol+1, 1,0);
                    n.push(-1,0,0,        -1,0,0,        -1,0,0);
                    v.push(xrow, j, zcol, 0,0,   xrow, j+1, zcol, 0,1,   xrow, j+1, zcol+1, 1,1);
                    n.push(-1,0,0,        -1,0,0,        -1,0,0);
                }else if(this.data[r][j] == 0){
                    v.push(xrow, j, zcol, 0,0,   xrow, j+1, zcol+1, 1,1,   xrow, j, zcol+1, 1,0);
                    n.push(-1,0,0,        -1,0,0,        -1,0,0);
                    v.push(xrow, j, zcol, 0,0,   xrow, j+1, zcol, 0,1,   xrow, j+1, zcol+1, 1,1);
                    n.push(-1,0,0,        -1,0,0,        -1,0,0);
                }

                let l = ((xrow + 1)*16) + zcol;
                if(xrow == 15){ //for right faces
                    v.push(xrow+1, j, zcol, 0,0,   xrow+1, j+1, zcol+1, 1,1,   xrow+1, j, zcol+1, 1,0);
                    n.push(1,0,0,        1,0,0,        1,0,0);
                    v.push(xrow+1, j, zcol, 0,0,   xrow+1, j+1, zcol, 0,1,   xrow+1, j+1, zcol+1, 1,1);
                    n.push(1,0,0,        1,0,0,        1,0,0);
                }else if(this.data[l][j] == 0){
                    v.push(xrow+1, j, zcol, 0,0,   xrow+1, j+1, zcol+1, 1,1,   xrow+1, j, zcol+1, 1,0);
                    n.push(1,0,0,        1,0,0,        1,0,0);
                    v.push(xrow+1, j, zcol, 0,0,   xrow+1, j+1, zcol, 0,1,   xrow+1, j+1, zcol+1, 1,1);
                    n.push(1,0,0,        1,0,0,        1,0,0);
                }

                let f = i - 1;
                if(zcol == 0){ //for right faces
                    v.push(xrow, j, zcol, 0,0,   xrow+1, j+1, zcol, 1,1,   xrow+1, j, zcol, 1,0); //with uv map
                    n.push(0,0,-1,       0,0,-1,       0,0,-1);
                    v.push(xrow, j, zcol, 0,0,   xrow, j+1, zcol, 0,1,   xrow+1, j+1, zcol, 1,1);
                    n.push(0,0,-1,       0,0,-1,       0,0,-1);
                }else if(this.data[f][j] == 0){
                    v.push(xrow, j, zcol, 0,0,   xrow+1, j+1, zcol, 1,1,   xrow+1, j, zcol, 1,0); //with uv map
                    n.push(0,0,-1,       0,0,-1,       0,0,-1);
                    v.push(xrow, j, zcol, 0,0,   xrow, j+1, zcol, 0,1,   xrow+1, j+1, zcol, 1,1);
                    n.push(0,0,-1,       0,0,-1,       0,0,-1);
                }

                let b = i + 1;
                if(zcol == 15){ //for right faces
                    v.push(xrow, j, zcol+1, 0,0,   xrow+1, j+1, zcol+1, 1,1,   xrow+1, j, zcol+1, 1,0);
                    n.push(0,0,1,        0,0,1,        0,0,1);
                    v.push(xrow, j, zcol+1, 0,0,   xrow, j+1, zcol+1, 0,1,   xrow+1, j+1, zcol+1, 1,1);
                    n.push(0,0,1,        0,0,1,        0,0,1);
                }else if(this.data[b][j] == 0){
                    v.push(xrow, j, zcol+1, 0,0,   xrow+1, j+1, zcol+1, 1,1,   xrow+1, j, zcol+1, 1,0);
                    n.push(0,0,1,        0,0,1,        0,0,1);
                    v.push(xrow, j, zcol+1, 0,0,   xrow, j+1, zcol+1, 0,1,   xrow+1, j+1, zcol+1, 1,1);
                    n.push(0,0,1,        0,0,1,        0,0,1);
                }
            }
        }
        this.vertices = new Float32Array(v);
        this.normals = new Float32Array(n);    
    }

    reloadBuffer(){
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices, gl.DYNAMIC_DRAW);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalbuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.normals, gl.DYNAMIC_DRAW);
    }

    voxType(vox_x, vox_y, vox_z){ // must make sure that vox_x and vox_y are voxels in the chunk
        if(vox_y < 0 || vox_y >= this.height_default * 2){
            return 0;
        }
        let voxChunk = [0,0];
        let chunk = this;
        chunkCoords(vox_x, vox_z, voxChunk);
        if(voxChunk[0] != this.coords[0] || voxChunk[1] != this.coords[1]){
            console.log("Supposed to be in chunk", voxChunk, "instead checking in chunk", this.coords);
            chunk = chunkLookup(voxChunk[0], voxChunk[1]);
        }
        let i = convertChunkCoords(vox_x, vox_z, chunk);
        //console.log(vox_x, vox_y, vox_z, i);
        //console.log("Supposed to be in chunk", voxChunk, "instead checking in chunk", this.coords);
        return this.data[i][vox_y-1]; //vox_y -1 bc we need to index into an array 
    }

    voxSurrounded(vox_x, vox_y, vox_z){ // need to be corrected for chunk borders
        if(this.voxType(vox_x-1, vox_y, vox_z) && this.voxType(vox_x+1, vox_y, vox_z) && this.voxType(vox_x, vox_y-1, vox_z) && this.voxType(vox_x, vox_y+1, vox_z)
          && this.voxType(vox_x, vox_y, vox_z-1) && this.voxType(vox_x+1, vox_y, vox_z+1)){return true;}
        else{return false;}
    }

    removeVox(vox_x, vox_y, vox_z){
        if(vox_y < 1 || vox_y >= this.height_default * 2){
            return;
        }
        let i = convertChunkCoords(vox_x, vox_z, this);
        this.data[i][vox_y-1] = 0; //vox_y -1 bc we need to index into an array again
    }

    addVox(vox_x, vox_y, vox_z){
        if(vox_y < 1 || vox_y >= this.height_default * 2){
            console.log("at height limmit");
            return;
        }
        let i = convertChunkCoords(vox_x, vox_z, this);
        this.data[i][vox_y-1] = 1; //vox_y -1 bc we need to index into an array again
    }

    render(){
        if(!this.init){
            console.log("trying to render uninitialized chunk");
            return;
        }
        var rgba = this.color;
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        let normalMatrix = new Matrix4();
        normalMatrix.setInverseOf(this.matrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
        
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

        if(this.cheese && !this.cheese_collected){
            let vox_x = this.cheese_location.elements[0];
            let vox_y = this.cheese_location.elements[1];
            let vox_z = this.cheese_location.elements[2];
            g_cheese.render(vox_x, vox_y+1, vox_z);
        }
    }
}


//need to implement this correctly to simplify code. notice that there is a lot of copy pasted code above that is redundant and could be condensed into a function (I AM JUST LAZY)
function convertVoxelCoordsX(i, chunk){ // converts chunk data index to a voxel coordinate
    let xrow = Math.floor(i/16) + 1;
    let x = chunk.coords[0] * 16;
    let xdir = Math.sign(x);
    let vox_x = xdir * xrow + (x - xdir*16);
    return vox_x;
}

function convertChunkCoords(vox_x, vox_z, chunk){ // converts chunk data index to a voxel coordinate
    let x = chunk.coords[0] * 16;
    let xdir = Math.sign(x);
    let xrow = ((vox_x - (x - xdir*16)) * xdir) - 1;

    let z = chunk.coords[1] * 16;
    let zdir = Math.sign(z);
    let zcol = ((vox_z - (z - zdir*16)) * zdir) - 1;
    let i = (xrow * 16) + zcol;
    
    return i;
}

function convertVoxelCoordsZ(i, chunk){
    let zcol = (i % 16) + 1;
    let z = chunk.coords[1] * 16;
    let zdir = Math.sign(z);
    let vox_z = zdir * zcol + (z - zdir*16);
    return vox_z;
}


// CHUNK GENERATION DRIVER FUNCTIONS ---------------------------------------------------------------------------------------------------------------------------------------------------------------

function updateLoadedChunks(){
    let new_loaded_chunks = [];
    let x = g_camera.chunkPos[0];
    let z = g_camera.chunkPos[1];
    for(var j = -g_render_dist; j <= g_render_dist; j++){ //for z
      //let debug = [];
      for(var i = -g_render_dist; i <= g_render_dist; i++){ //for x
        let x_chunk = fixChunkCoord(x, i);
        let z_chunk = fixChunkCoord(z, j);
        //debug.push([x_chunk, z_chunk]);
        let tempChunk = chunkLookup(x_chunk, z_chunk);
        if(!tempChunk.init){
          //tempChunk.generateFlat();
          tempChunk.generatePerlin();
          chunks.push(tempChunk);
        }
        if(i == 0 & j == 0){
          g_camera.curChunk = tempChunk;
        }
        new_loaded_chunks.push(tempChunk);
      }
      //console.log(debug);
    }
    loaded_chunks = new_loaded_chunks;
}
  
function fixChunkCoord(c, offset){ // stands for c = coordinate and offset
    if(offset == 0){
      //console.log("case 1");
      return c;
    }else if(Math.sign(c) > Math.sign(offset) && Math.abs(c) <= Math.abs(offset)){
      //console.log("case 2");
      return (c + offset - 1);
    }else if(Math.sign(c) < Math.sign(offset) && Math.abs(c) <= Math.abs(offset)){
      //console.log("case 3");
      return (c + offset + 1);
    }else{
      //console.log("case 4");
      return (c + offset);
    }
}
  
function chunkLookup(x, z){
    for(var i = 0; i < loaded_chunks.length; i++){
      let chnk_x = loaded_chunks[i].coords[0];
      let chnk_z = loaded_chunks[i].coords[1];
      if(chnk_x == x && chnk_z == z){
        return loaded_chunks[i];
        //return true;
      }
    }
    for(var i = 0; i < chunks.length; i++){
      let chnk_x = chunks[i].coords[0];
      let chnk_z = chunks[i].coords[1];
      if(chnk_x == x && chnk_z == z){
        return chunks[i];
        //return true;
      }
    }
    let chunk = new Chunk(x,z);
    return chunk;
    //return false;
}
  
function renderLoadedChunks(){
    for(var i = 0; i < loaded_chunks.length; i++){
      loaded_chunks[i].render();
    }
}