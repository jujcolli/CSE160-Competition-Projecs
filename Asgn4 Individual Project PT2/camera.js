class Camera{
    constructor(){
        this.chunkPos = [0, 0];
        this.curChunk = null;
        this.eye = new Vector3([1,15,1]);
        this.at = new Vector3([0,0,100]);
        this.up = new Vector3([0,1,0]);
        this.move_step = 0.2;
        this.cursor = null;
        this.placeblock = null;
    }
    forward(){
        let d = new Vector3();
        d.set(this.at);
        d.sub(this.eye); // equiv to at - eye
        d.normalize();
        d.mul(this.move_step);
        this.eye.add(d);
        this.at.add(d);
        this.updateChunkPos();
        this.checkForCheese();
    }
    backward(){
        let d = new Vector3();
        d.set(this.at);
        d.sub(this.eye); // equiv to at - eye
        d.normalize();
        d.mul(this.move_step);
        this.eye.sub(d);
        this.at.sub(d);
        this.updateChunkPos();
        this.checkForCheese();
    }
    right(){
        let d = new Vector3();
        d.set(this.at);
        d.sub(this.eye); // euiv to at - eye
        let right = Vector3.cross(d, this.up);
        right.normalize();
        right.mul(this.move_step);
        this.eye.add(right);
        this.at.add(right);
        this.updateChunkPos();
        this.checkForCheese();
    }
    left(){
        let d = new Vector3();
        d.set(this.at);
        d.sub(this.eye); // euiv to at - eye
        let left = Vector3.cross(d, this.up);
        left.normalize();
        left.mul(-1*this.move_step);
        this.eye.add(left);
        this.at.add(left);
        this.updateChunkPos();
        this.checkForCheese();
    }
    rotLeft(){
        let d = new Vector3();
        d.set(this.at);
        d.sub(this.eye); // euiv to at - eye
        let r = Math.sqrt(Math.pow(d.elements[0], 2) + Math.pow(d.elements[2], 2));
        let ang = calcAngle(d.elements[0], d.elements[2]);
        let newAng = ang - 5;
        let newCamX = r * Math.cos(newAng * (Math.PI/180));
        let newCamZ = r * Math.sin(newAng * (Math.PI/180));
        let newD = new Vector3([newCamX, 0, newCamZ]);  
        this.at.set(this.eye);
        this.at.add(newD);
    }
    rotRight(){
        let d = new Vector3();
        d.set(this.at);
        d.sub(this.eye); // euiv to at - eye
        let r = Math.sqrt(Math.pow(d.elements[0], 2) + Math.pow(d.elements[2], 2));
        let ang = calcAngle(d.elements[0], d.elements[2]);
        let newAng = ang + 5;
        let newCamX = r * Math.cos(newAng * (Math.PI/180));
        let newCamZ = r * Math.sin(newAng * (Math.PI/180));
        let newD = new Vector3([newCamX, 0, newCamZ]);  
        this.at.set(this.eye);
        this.at.add(newD);
    }

    updateCursorPos(){
        let d = new Vector3();
        d.set(this.at);
        d.sub(this.eye);
        d.normalize();
        //console.log("D",dir);
        //the block the ray is cast from is the block poistion the eye is in
        let block_before = new Vector3([Math.ceil(Math.abs(this.eye.elements[0])), Math.ceil(Math.abs(this.eye.elements[1])), Math.ceil(Math.abs(this.eye.elements[2]))]);
        for (var t = .1; t < 8.1; t += .1){
            let ray = new Vector3(); //this is the ray from the eye
            ray.set(d);
            ray.mul(t);
            ray.add(this.eye);
            let dirX = Math.sign(ray.elements[0]); let dirY = Math.sign(ray.elements[1]); let dirZ = Math.sign(ray.elements[2]);
            //console.log("RAY:",ray, "Eye", this.eye);
            let vox_x = dirX * Math.ceil(Math.abs(ray.elements[0]));
            let vox_y = dirY * Math.ceil(Math.abs(ray.elements[1])); // must be subtracted by 1 when looked up in the chunk. array index into chunk height is y-1
            let vox_z = dirZ * Math.ceil(Math.abs(ray.elements[2]));
            if(vox_x == 0){vox_x = 1;} if(vox_y == 0){vox_y = 1;} if(vox_z == 0){vox_z = 1;}
            //console.log("Ray", ray, "eye", g_camera.eye, vox_x, vox_y, vox_z);
            let r_chunkPos = [1, 1]; // xz coords of chunk ray is in
            chunkCoords(vox_x, vox_z, r_chunkPos);
            //console.log("Chunk", r_chunkPos);
            let r_chunk = this.curChunk;
            if(r_chunkPos[0] != this.chunkPos[0] || r_chunkPos[1] != this.chunkPos[1]){
                r_chunk = chunkLookup(r_chunkPos[0], r_chunkPos[1]);
            }
            //this.cursor = new Vector3([vox_x, vox_y, vox_z]);
            if(r_chunk.voxType(vox_x, vox_y, vox_z) > 0){
                let detectPos = new Vector3([vox_x, vox_y, vox_z]);
                // distance between the last empty block position the ray was in and the now solid block it has connected with. use this to determine if the ray has passed by a block it should have interacted with but didnt because of the step size (occurs when looking at the corner of a block)
                let dist = new Vector3();
                dist.set(block_before);
                dist.sub(detectPos);
                dist.normalize();
                if(dist.magnitude() > 1){
                    // the case below checks if the block before has nothing above or below and if so, doesnt move the cursor
                    if(!r_chunk.voxType(block_before.elements[0], block_before.elements[1]-1, block_before.elements[2]) && !r_chunk.voxType(block_before.elements[0], block_before.elements[1]+1, block_before.elements[2])){
                        this.cursor = new Vector3([vox_x, vox_y, vox_z]);
                        //console.log("entered");
                    }else if(Math.abs(dist.elements[0]) > 0){
                        this.cursor = new Vector3([block_before.elements[0], vox_y, vox_z]); //
                    }else if(Math.abs(dist.elements[2]) > 0){
                        this.cursor = new Vector3([vox_x, vox_y, block_before.elements[2]]);
                    }
                    this.placeblock = new Vector3([vox_x, block_before.elements[1], vox_z]);
                }else{
                    this.cursor = new Vector3([vox_x, vox_y, vox_z]);
                    this.placeblock = block_before;
                }
                //console.log(block_before, detectPos, this.cursor, this.placeblock);
                return;
            }
            block_before = new Vector3([vox_x, vox_y, vox_z]);
        }
        //console.log("no update");
        this.cursor = null;
        this.placeblock
    }
    
    breakBlock(){
        if(this.cursor === null){return;}
        let r_chunkPos = [1, 1]; // xz coords of chunk ray is in
        chunkCoords(this.cursor.elements[0], this.cursor.elements[2], r_chunkPos);
        let r_chunk = this.curChunk;
        if(r_chunkPos[0] != this.chunkPos[0] || r_chunkPos[1] != this.chunkPos[1]){
            r_chunk = chunkLookup(r_chunkPos[0], r_chunkPos[1]);
        }
        console.log("Block Broken!");
        r_chunk.removeVox(this.cursor.elements[0], this.cursor.elements[1], this.cursor.elements[2]);
        r_chunk.generateVertices();
        r_chunk.reloadBuffer();
    }

    placeBlock(){
        if(this.placeblock === null){return;}
        let r_chunkPos = [1, 1]; // xz coords of chunk ray is in
        chunkCoords(this.placeblock.elements[0], this.placeblock.elements[2], r_chunkPos);
        let r_chunk = this.curChunk;
        if(r_chunkPos[0] != this.chunkPos[0] || r_chunkPos[1] != this.chunkPos[1]){
            r_chunk = chunkLookup(r_chunkPos[0], r_chunkPos[1]);
        }
        console.log("Block Placed!");
        r_chunk.addVox(this.placeblock.elements[0], this.placeblock.elements[1], this.placeblock.elements[2]);
        r_chunk.generateVertices();
        r_chunk.reloadBuffer();
    }

    updateChunkPos(){
        let cam_x = this.eye.elements[0];
        let cam_z = this.eye.elements[2];
        let prev_chunkPos = this.chunkPos.slice();

        chunkCoords(cam_x, cam_z, this.chunkPos);
        
        if(prev_chunkPos[0] == g_camera.chunkPos[0] && prev_chunkPos[1] == g_camera.chunkPos[1]){
            return;
        }else{
            console.log(this.chunkPos[0], this.chunkPos[1]);
            console.log("Update Loaded Chunks!");
            updateLoadedChunks();
        }
    }
    
    checkForCheese(){
        if (!this.curChunk.cheese || this.curChunk.cheese_collected){
            return;
        }
        let dist = new Vector3();
        dist.set(this.eye);
        dist.sub(this.curChunk.cheese_location);
        //console.log(dist);
        if(Math.abs(dist.elements[0]) <= 1 && Math.abs(dist.elements[1]) <= 1 && Math.abs(dist.elements[2]) <= 1){
            this.curChunk.cheese_collected = true;
            g_cheese_count += 1;
            sendStatsHTML(g_cheese_count, "cheeseCnt");
        }
    }
}

function calcAngle(x, z){
    ang = 0;
    if(x == 0 && z > 0){
      ang = 90;
    }else if(x > 0){
      ang = Math.atan(z/x) * 180/Math.PI;
    }else if(x == 0 && z < 0){
      ang = -90;
    }else{ //need to do this when the angle -90 < ang
      ang = Math.atan(z/x) * 180/Math.PI;
      ang = -90 + (ang - 90);
    }
    return ang;
}

function chunkCoords(wrld_x, wrld_z, chunkPos){
    if(wrld_x == 0){
        chunkPos[0] = 1;
    }else{
        let xdir = Math.sign(wrld_x);
        chunkPos[0] = xdir * Math.ceil(Math.abs(wrld_x)/16);
    }
    if(wrld_z == 0){
        chunkPos[1] = 1
    }else{
        let zdir = Math.sign(wrld_z);
        chunkPos[1] = zdir * Math.ceil(Math.abs(wrld_z)/16);
    }
}