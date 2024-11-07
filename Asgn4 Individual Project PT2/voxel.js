class Voxel{
    constructor(BlockChoice){
        this.type = BlockChoice;
        this.geometry = new Cube();
        this.geometry.textureChoice = BlockChoice;
        this.geometry.matrix.translate(-0.5, 0, -0.5);
        this.defMatrix = new Matrix4();
        this.defMatrix.translate(-0.5, 0, -0.5); //centering the cube at the origin so transformations are easier.
    }
    render(x,y,z){
        if(x == 0 && z == 0){
            console.log("cant render at x,z = 0,0");
            return
        }
        this.geometry.matrix.translate(x - (Math.sign(x)*.5), y-1, z - (Math.sign(z)*.5));
        this.geometry.render();
        this.geometry.matrix = new Matrix4(this.defMatrix);
    }
}