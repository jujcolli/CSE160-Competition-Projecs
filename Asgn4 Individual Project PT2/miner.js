//CONSTS
class Miner{
    constructor(){
        this.upperLegRotL = 0;
        this.lowerLegRotL = 0;
        this.footRotL = 0;

        this.upperLegRotR = 0;
        this.lowerLegRotR = 0;
        this.footRotR = 0;

        this.upperArmRotZL = 25;
        this.upperArmRotXL = 0;
        this.midArmRotZL = 35;
        this.midArmRotYL = 0;
        this.midArmRotXL = 0;
        this.lowArmRotL = 75;
        this.handRot = 0;

        this.upperArmRotZR = 25;
        this.upperArmRotXR = 0;
        this.midArmRotZR = 35;
        this.midArmRotYR = 0;
        this.midArmRotXR = 0;
        this.lowArmRotR = 75;
        this.sawRot = 0;

        this.animChoice = STILL;
        this.specialAnim = false;

        this.transfMatrix = new Matrix4();
    }

    render(){
        //BODY CONSTRUCTION -------------------------------------------------------------------------------------------------
        var windshield = new Sphere();
        windshield.segments = 8;
        windshield.color = [1, 215 / 255, 0, 1.0];
        windshield.matrix = new Matrix4(this.transfMatrix);
        windshield.matrix.scale(0.2, 0.2, 0.25);
        windshield.render();

        var chassis = new Cube();
        chassis.color = [80 / 255, 80 / 255, 80 / 255, 1];
        chassis.matrix = new Matrix4(this.transfMatrix);
        chassis.matrix.translate(-.2, -.2, 0);
        chassis.matrix.scale(0.4, 0.4, 0.25);
        chassis.render();

        var chassis2 = new Cube();
        chassis2.color = [100 / 255, 100 / 255, 100 / 255, 1];
        chassis2.matrix = new Matrix4(this.transfMatrix);
        chassis2.matrix.translate(0, 0, .2);
        //chassis2.matrix.rotate(45, 0, 1, 0);
        chassis2.matrix.rotate(45, 1, 0, 0);
        chassis2.matrix.translate(-.15, -.15, -.15);
        chassis2.matrix.scale(0.3, 0.3, 0.3);
        chassis2.render();

        var bodySideL = new Cube();
        bodySideL.color = [101 / 255, 101 / 255, 101 / 255, 1];
        bodySideL.matrix = new Matrix4(this.transfMatrix);
        bodySideL.matrix.translate(0.15, -0.15, -0.05);
        bodySideL.matrix.rotate(45, 0, 0, 1);
        bodySideL.matrix.translate(-.1, -.05, 0);
        bodySideL.matrix.scale(0.2, 0.1, 0.15);
        bodySideL.render();

        var bodySideR = new Cube();
        bodySideR.matrix = new Matrix4(this.transfMatrix);
        bodySideR.color = [101 / 255, 101 / 255, 101 / 255, 1];
        bodySideR.matrix.translate(-0.15, -0.15, -0.05);
        bodySideR.matrix.rotate(-45, 0, 0, 1);
        bodySideR.matrix.translate(-.1, -.05, 0);
        bodySideR.matrix.scale(0.2, 0.1, 0.15);
        bodySideR.render();

        var bodyUnder = new Cube();
        bodyUnder.color = [101 / 255, 101 / 255, 101 / 255, 1];
        bodyUnder.matrix = new Matrix4(this.transfMatrix);
        bodyUnder.matrix.translate(0, -0.2, -0.15);
        bodyUnder.matrix.translate(-.05, -.05, 0);
        bodyUnder.matrix.scale(0.1, 0.1, 0.2);
        bodyUnder.render();

        var bodyCanisterL = new Cylinder();
        bodyCanisterL.segments = 6
        bodyCanisterL.color = [150 / 255, 150 / 255, 150 / 255, 1];
        bodyCanisterL.matrix = new Matrix4(this.transfMatrix);
        bodyCanisterL.matrix.translate(0.15, -0.13, 0.18);
        bodyCanisterL.matrix.rotate(180, 1, 0, 0);
        bodyCanisterL.matrix.scale(0.25, 0.25, 0.2);
        bodyCanisterL.render();

        var bodyCanisterR = new Cylinder();
        bodyCanisterR.segments = 6;
        bodyCanisterR.color = [150 / 255, 150 / 255, 150 / 255, 1];
        bodyCanisterR.matrix = new Matrix4(this.transfMatrix);
        bodyCanisterR.matrix.translate(-0.15, -0.13, 0.18);
        bodyCanisterR.matrix.rotate(180, 1, 0, 0);
        bodyCanisterR.matrix.scale(0.25, 0.25, 0.2);
        bodyCanisterR.render();

        var visorsideL = new Cube();
        visorsideL.color = [120 / 255, 120 / 255, 120 / 255, 1];
        visorsideL.matrix = new Matrix4(this.transfMatrix);
        visorsideL.matrix.translate(0.16, 0.1, 0);
        visorsideL.matrix.rotate(-70, 0, 0, 1);
        visorsideL.matrix.translate(-.15, -.05, -.1);
        visorsideL.matrix.scale(0.3, 0.1, 0.2);
        visorsideL.render();

        var visorsideR = new Cube();
        visorsideR.color = [120 / 255, 120 / 255, 120 / 255, 1];
        visorsideR.matrix = new Matrix4(this.transfMatrix);
        visorsideR.matrix.translate(-0.16, 0.1, 0);
        visorsideR.matrix.rotate(70, 0, 0, 1);
        visorsideR.matrix.translate(-.15, -.05, -.1);
        visorsideR.matrix.scale(0.3, 0.1, 0.2);
        visorsideR.render();

        var visorTop1 = new Cube();
        visorTop1.color = [150 / 255, 150 / 255, 150 / 255, 1];
        visorTop1.matrix = new Matrix4(this.transfMatrix);
        visorTop1.matrix.translate(0, 0.18, 0);
        visorTop1.matrix.translate(-.15, -.05, 0);
        visorTop1.matrix.scale(0.3, 0.1, 0.2);
        visorTop1.render();

        var visorTop2 = new Cube();
        visorTop2.color = [120 / 255, 120 / 255, 120 / 255, 1];
        visorTop2.matrix = new Matrix4(this.transfMatrix);
        visorTop2.matrix.translate(0, 0.2, -0.1);
        visorTop2.matrix.translate(-.05, -.05, 0);
        visorTop2.matrix.scale(0.1, 0.1, 0.2);
        visorTop2.render();

        //END OF BODY CONSTRUCTION -------------------------------------------------------------------------------------------------------

        //MIDSECTION CONSTRUCTION ------------------------------------------------------------------------------------------------
        var midsection = new Cube();
        midsection.color = [120 / 255, 120 / 255, 120 / 255, 1];
        midsection.matrix = new Matrix4(this.transfMatrix);
        midsection.matrix.translate(0, -0.2, 0);
        midsection.matrix.translate(-.1, -.1, 0);
        midsection.matrix.scale(0.2, 0.2, 0.2);
        midsection.render();

        var torsoAxil = new Cylinder();
        torsoAxil.segments = 6
        torsoAxil.color = [150 / 255, 150 / 255, 150 / 255, 1];
        torsoAxil.matrix = new Matrix4(this.transfMatrix);
        torsoAxil.matrix.scale(4, 1, 1);
        torsoAxil.matrix.translate(0, -0.31, .05);
        torsoAxil.matrix.rotate(90, 0, 1, 0);
        torsoAxil.matrix.translate(0, 0, -.0625);
        torsoAxil.matrix.scale(0.125, 0.125, 0.125);
        torsoAxil.render();

        var hipL = new Cube();
        hipL.color = [150 / 255, 150 / 255, 150 / 255, 1];
        hipL.matrix = new Matrix4(this.transfMatrix);
        hipL.matrix.translate(.1, -.315, -.025);
        hipL.matrix.translate(-.075, -.075, 0);
        hipL.matrix.scale(0.15, 0.15, 0.15);
        hipL.render();

        var hipR = new Cube();
        hipR.color = [150 / 255, 150 / 255, 150 / 255, 1];
        hipR.matrix = new Matrix4(this.transfMatrix);
        hipR.matrix.translate(-.1, -.315, -.025);
        hipR.matrix.translate(-.075, -.075, 0);
        hipR.matrix.scale(0.15, 0.15, 0.15);
        hipR.render();
        //END OF MIDSECTION CONSTRUCTION-----------------------------------------------------------------

        //LEFT LEG CONSTRUCTION-------------------------------------------------------------------
        var thighL = new Cube();
        thighL.color = [120 / 255, 120 / 255, 120 / 255, 1];
        thighL.matrix = new Matrix4(this.transfMatrix);
        thighL.matrix.translate(-.275, -0.31, .05);
        thighL.matrix.rotate(this.upperLegRotL, 1, 0, 0);
        var upLegCoordMatL = new Matrix4(thighL.matrix);
        thighL.matrix.rotate(-180, 1, 0, 0);
        thighL.matrix.rotate(180, 0, 1, 0);
        thighL.matrix.translate(-.075, -.075, -.075);
        thighL.matrix.scale(0.15, 0.3, 0.15);
        thighL.render();

        var kneeL = new Cylinder();
        kneeL.segments = 6
        kneeL.color = [150 / 255, 150 / 255, 150 / 255, 1];
        kneeL.matrix = new Matrix4(upLegCoordMatL);
        kneeL.matrix.translate(.001, -.25, 0);
        kneeL.matrix.rotate(90, 0, 1, 0);
        kneeL.matrix.translate(0, 0, -.075);
        kneeL.matrix.scale(0.15, 0.15, 0.15);
        kneeL.render();

        var calfL = new Cube();
        calfL.color = [120 / 255, 120 / 255, 120 / 255, 1];
        calfL.matrix = new Matrix4(upLegCoordMatL);
        calfL.matrix.translate(.001, -.25, 0);
        calfL.matrix.rotate(this.lowerLegRotL, 1, 0, 0);
        var lowLegCoordMatL = new Matrix4(calfL.matrix);
        calfL.matrix.rotate(-180, 1, 0, 0);
        calfL.matrix.rotate(180, 0, 1, 0);
        calfL.matrix.translate(-.05, -.05, -.05);
        calfL.matrix.scale(0.1, 0.3, 0.1);
        calfL.render();

        var foot1L = new Cube();
        foot1L.color = [90 / 255, 90 / 255, 90 / 255, 1];
        foot1L.matrix = new Matrix4(lowLegCoordMatL);
        foot1L.matrix.translate(-.025, -.225, -.05);
        foot1L.matrix.rotate(this.footRotL, 1, 0, 0)
        foot1L.matrix.rotate(45, 0, 1, 0)
        foot1L.matrix.translate(-.025, -.0249, -.075);
        foot1L.matrix.scale(0.05, 0.05, 0.1);
        foot1L.render();

        var foot2L = new Cube();
        foot2L.color = [90 / 255, 90 / 255, 90 / 255, 1];
        foot2L.matrix = new Matrix4(lowLegCoordMatL);
        foot2L.matrix.translate(.025, -.224, -.05);
        foot2L.matrix.rotate(this.footRotL, 1, 0, 0)
        foot2L.matrix.rotate(-45, 0, 1, 0)
        foot2L.matrix.translate(-.025, -.0249, -.075);
        foot2L.matrix.scale(0.05, 0.05, 0.1);
        foot2L.render();

        //END OF LEFT LEG CONSTRUCTION -------------------------------------------------------------------------

        //RIGHT LEG CONSTRUCTION-------------------------------------------------------------------
        var thighR = new Cube();
        thighR.color = [120 / 255, 120 / 255, 120 / 255, 1];
        thighR.matrix = new Matrix4(this.transfMatrix);
        thighR.matrix.translate(.275, -0.31, .05);
        thighR.matrix.rotate(this.upperLegRotR, 1, 0, 0);
        var upLegCoordMatR = new Matrix4(thighR.matrix);
        thighR.matrix.rotate(-180, 1, 0, 0);
        thighR.matrix.rotate(180, 0, 1, 0);
        thighR.matrix.translate(-.075, -.075, -.075);
        thighR.matrix.scale(0.15, 0.3, 0.15);
        thighR.render();

        var kneeR = new Cylinder();
        kneeR.segments = 6
        kneeR.color = [150 / 255, 150 / 255, 150 / 255, 1];
        kneeR.matrix = new Matrix4(upLegCoordMatR);
        kneeR.matrix.translate(.001, -.25, 0);
        kneeR.matrix.rotate(90, 0, 1, 0);
        kneeR.matrix.translate(0, 0, -.075);
        kneeR.matrix.scale(0.15, 0.15, 0.15);
        kneeR.render();

        var calfR = new Cube();
        calfR.color = [120 / 255, 120 / 255, 120 / 255, 1];
        calfR.matrix = new Matrix4(upLegCoordMatR);
        calfR.matrix.translate(.001, -.25, 0);
        calfR.matrix.rotate(this.lowerLegRotR, 1, 0, 0);
        var lowLegCoordMatR = new Matrix4(calfR.matrix);
        calfR.matrix.rotate(-180, 1, 0, 0);
        calfR.matrix.rotate(180, 0, 1, 0);
        calfR.matrix.translate(-.05, -.05, -.05);
        calfR.matrix.scale(0.1, 0.3, 0.1);
        calfR.render();

        var foot1R = new Cube();
        foot1R.color = [90 / 255, 90 / 255, 90 / 255, 1];
        foot1R.matrix = new Matrix4(lowLegCoordMatR);
        foot1R.matrix.translate(-.025, -.225, -.05);
        foot1R.matrix.rotate(this.footRotR, 1, 0, 0)
        foot1R.matrix.rotate(45, 0, 1, 0)
        foot1R.matrix.translate(-.025, -.0249, -.075);
        foot1R.matrix.scale(0.05, 0.05, 0.1);
        foot1R.render();

        var foot2R = new Cube();
        foot2R.color = [90 / 255, 90 / 255, 90 / 255, 1];
        foot2R.matrix = new Matrix4(lowLegCoordMatR);
        foot2R.matrix.translate(.025, -.224, -.05);
        foot2R.matrix.rotate(this.footRotR, 1, 0, 0)
        foot2R.matrix.rotate(-45, 0, 1, 0)
        foot2R.matrix.translate(-.025, -.0249, -.075);
        foot2R.matrix.scale(0.05, 0.05, 0.1);
        foot2R.render();

        //END OF RIGHT LEG CONSTRUCTION -------------------------------------------------------------------------

        //START OF LEFT ARM -----------------------------------------------------------------------------------

        var shoulderL = new Cube();
        shoulderL.color = [90 / 255, 90 / 255, 90 / 255, 1];
        shoulderL.matrix = new Matrix4(this.transfMatrix);
        shoulderL.matrix.translate(.2, .1, .1);
        shoulderL.matrix.translate(-.1, -.1, -.1);
        shoulderL.matrix.scale(0.2, 0.2, 0.2);
        shoulderL.render();

        var upperarmL = new Cube();
        upperarmL.color = [120 / 255, 120 / 255, 120 / 255, 1];
        upperarmL.matrix = new Matrix4(this.transfMatrix);
        upperarmL.matrix.translate(.249, .15, .1);
        upperarmL.matrix.rotate(-this.upperArmRotZL, 0, 0, 1);
        upperarmL.matrix.rotate(this.upperArmRotXL, 1, 0, 0);
        var upArmCoordMatL = new Matrix4(upperarmL.matrix);
        //upperarmL.matrix.rotate(-180, 1, 0, 0);
        //upperarmL.matrix.rotate(180, 0, 1, 0);
        upperarmL.matrix.translate(-.05, -.05, -.05);
        upperarmL.matrix.scale(0.1, 0.3, 0.1);
        upperarmL.render();

        var elbowL = new Sphere();
        elbowL.segments = 4
        elbowL.color = [150 / 255, 150 / 255, 150 / 255, 1];
        elbowL.matrix = new Matrix4(upArmCoordMatL);
        elbowL.matrix.translate(.001, .275, 0);
        elbowL.matrix.rotate(45, 0, 1, 0);
        elbowL.matrix.translate(0, 0, 0);
        elbowL.matrix.scale(0.09, 0.09, 0.09);
        elbowL.render();

        var midarmL = new Cube();
        midarmL.color = [120 / 255, 120 / 255, 120 / 255, 1];
        midarmL.matrix = new Matrix4(upArmCoordMatL);
        midarmL.matrix.translate(.001, .275, 0);
        midarmL.matrix.rotate(this.midArmRotZL, 0, 0, 1);
        midarmL.matrix.rotate(this.midArmRotYL, 0, 1, 0);
        midarmL.matrix.rotate(this.midArmRotXL, 1, 0, 0);
        var midArmCoordMatL = new Matrix4(midarmL.matrix);
        midarmL.matrix.rotate(-180, 1, 0, 0);
        midarmL.matrix.rotate(180, 0, 1, 0);
        midarmL.matrix.translate(-.05, -.05, -.05);
        midarmL.matrix.scale(0.1, 0.4, 0.1);
        midarmL.render();

        var forearmL = new Cube();
        forearmL.color = [120 / 255, 120 / 255, 120 / 255, 1];
        forearmL.matrix = new Matrix4(midArmCoordMatL);
        forearmL.matrix.translate(.001, -.385, 0);
        forearmL.matrix.rotate(this.lowArmRotL, 1, 0, 0);
        var forearmCoordMatL = new Matrix4(forearmL.matrix);
        forearmL.matrix.rotate(-180, 1, 0, 0);
        forearmL.matrix.rotate(180, 0, 1, 0);
        forearmL.matrix.translate(-.075, -.075, -.075);
        forearmL.matrix.scale(0.15, 0.3, 0.15);
        forearmL.render();

        var handL = new Cube();
        handL.color = [100 / 255, 100 / 255, 100 / 255, 1];
        handL.matrix = new Matrix4(forearmCoordMatL);
        handL.matrix.translate(0, -0.25, 0);
        handL.matrix.rotate(this.handRot, 0, 0, 1);
        var handCoordMatL = new Matrix4(handL.matrix);
        handL.matrix.rotate(90, 0, 1, 0);
        handL.matrix.translate(-.1, -.0375, -.05);
        handL.matrix.scale(.2, .075, .1);
        handL.render();

        var gun1 = new Cylinder
        gun1.color = [100 / 255, 100 / 255, 100 / 255, 1];
        gun1.matrix = new Matrix4(handCoordMatL);
        gun1.matrix.translate(0, 0, -.03);
        gun1.matrix.rotate(180, 0, 1, 0);
        gun1.matrix.rotate(90, 1, 0, 0);
        gun1.matrix.translate(0, 0, -.05);
        gun1.matrix.scale(.1, .1, .25);
        gun1.render();

        //END OF LEFT ARM ------------------------------------------------------------------------------------------------------

        //START OF RIGHT ARM CONSTRUCTION --------------------------------------------------------------------------------------
        var shoulderR = new Cube();
        shoulderR.color = [90 / 255, 90 / 255, 90 / 255, 1];
        shoulderR.matrix = new Matrix4(this.transfMatrix);
        shoulderR.matrix.translate(-.2, .1, .1);
        shoulderR.matrix.translate(-.1, -.1, -.1);
        shoulderR.matrix.scale(0.2, 0.2, 0.2);
        shoulderR.render();

        var upperarmR = new Cube();
        upperarmR.color = [120 / 255, 120 / 255, 120 / 255, 1];
        upperarmR.matrix = new Matrix4(this.transfMatrix);
        upperarmR.matrix.translate(-.249, .15, .1);
        upperarmR.matrix.rotate(this.upperArmRotZR, 0, 0, 1);
        upperarmR.matrix.rotate(this.upperArmRotXR, 1, 0, 0);
        var upArmCoordMatR = new Matrix4(upperarmR.matrix);
        //upperarmL.matrix.rotate(-180, 1, 0, 0);
        //upperarmL.matrix.rotate(180, 0, 1, 0);
        upperarmR.matrix.translate(-.05, -.05, -.05);
        upperarmR.matrix.scale(0.1, 0.3, 0.1);
        upperarmR.render();

        var elbowR = new Sphere();
        elbowR.segments = 4
        elbowR.color = [150 / 255, 150 / 255, 150 / 255, 1];
        elbowR.matrix = new Matrix4(upArmCoordMatR);
        elbowR.matrix.translate(.001, .275, 0);
        elbowR.matrix.rotate(45, 0, 1, 0);
        elbowR.matrix.translate(0, 0, 0);
        elbowR.matrix.scale(0.09, 0.09, 0.09);
        elbowR.render();

        var midarmR = new Cube();
        midarmR.color = [120 / 255, 120 / 255, 120 / 255, 1];
        midarmR.matrix = new Matrix4(upArmCoordMatR);
        midarmR.matrix.translate(.001, .275, 0);
        midarmR.matrix.rotate(-this.midArmRotZR, 0, 0, 1);
        midarmR.matrix.rotate(this.midArmRotYR, 0, 1, 0);
        midarmR.matrix.rotate(this.midArmRotXR, 1, 0, 0);
        var midArmCoordMatR = new Matrix4(midarmR.matrix);
        midarmR.matrix.rotate(-180, 1, 0, 0);
        midarmR.matrix.rotate(180, 0, 1, 0);
        midarmR.matrix.translate(-.05, -.05, -.05);
        midarmR.matrix.scale(0.1, 0.4, 0.1);
        midarmR.render();

        var forearmR = new Cube();
        forearmR.color = [120 / 255, 120 / 255, 120 / 255, 1];
        forearmR.matrix = midArmCoordMatR;
        forearmR.matrix.translate(.001, -.385, 0);
        forearmR.matrix.rotate(this.lowArmRotR, 1, 0, 0);
        var forearmCoordMatR = new Matrix4(forearmR.matrix);
        forearmR.matrix.rotate(-180, 1, 0, 0);
        forearmR.matrix.rotate(180, 0, 1, 0);
        forearmR.matrix.translate(-.075, -.075, -.075);
        forearmR.matrix.scale(0.15, 0.3, 0.15);
        forearmR.render();

        var handR = new Cube();
        handR.color = [100 / 255, 100 / 255, 100 / 255, 1];
        handR.matrix = new Matrix4(forearmCoordMatR);
        handR.matrix.translate(0, -0.25, 0);
        handR.matrix.rotate(90, 0, 1, 0);
        handR.matrix.translate(-.1, -.0375, -.05);
        handR.matrix.scale(.2, .075, .1);
        handR.render();

        var saw1 = new Cylinder();
        saw1.color = [100 / 255, 100 / 255, 100 / 255, 1];
        saw1.matrix = new Matrix4(forearmCoordMatR);
        saw1.matrix.translate(0, -0.4, 0);
        saw1.matrix.rotate(this.sawRot, 1, 0, 0);
        var sawCoordMat = new Matrix4(saw1.matrix);
        saw1.matrix.rotate(90, 0, 1, 0);
        saw1.matrix.translate(0, 0, -.025);
        saw1.matrix.scale(.25, .25, .05);
        saw1.render();

        var spike1 = new Cone();
        spike1.segments = 4;
        spike1.color = [247 / 255, 230 / 255, 50 / 255, 1];
        spike1.matrix = new Matrix4(sawCoordMat);
        spike1.matrix.translate(0, -.124, 0);
        spike1.matrix.rotate(90, 1, 0, 0);
        spike1.matrix.scale(.05, .05, 0.05);
        spike1.render();

        var spike2 = new Cone();
        spike2.segments = 4;
        spike2.color = [247 / 255, 230 / 255, 50 / 255, 1];
        spike2.matrix = new Matrix4(sawCoordMat);
        spike2.matrix.translate(0, 0, .124);
        spike2.matrix.scale(.05, .05, 0.05);
        spike2.render();

        var spike3 = new Cone();
        spike3.segments = 4;
        spike3.color = [247 / 255, 230 / 255, 50 / 255, 1];
        spike3.matrix = new Matrix4(sawCoordMat);
        spike3.matrix.translate(0, 0, -.124);
        spike3.matrix.rotate(180, 1, 0, 0);
        spike3.matrix.scale(.05, .05, 0.05);
        spike3.render();

        var spike4 = new Cone();
        spike3.segments = 4;
        spike3.color = [247 / 255, 230 / 255, 50 / 255, 1];
        spike3.matrix = new Matrix4(sawCoordMat);
        spike3.matrix.translate(0, .124, 0);
        spike3.matrix.rotate(270, 1, 0, 0);
        spike3.matrix.scale(.05, .05, 0.05);
        spike3.render();

        var spike5 = new Cone();
        spike5.segments = 4;
        spike5.color = [247 / 255, 230 / 255, 50 / 255, 1];
        spike5.matrix = new Matrix4(sawCoordMat);
        spike5.matrix.translate(0, -.088, -.088);
        spike5.matrix.rotate(135, 1, 0, 0);
        spike5.matrix.scale(.05, .05, 0.05);
        spike5.render();

        var spike6 = new Cone();
        spike6.segments = 4;
        spike6.color = [247 / 255, 230 / 255, 50 / 255, 1];
        spike6.matrix = new Matrix4(sawCoordMat);
        spike6.matrix.translate(0, .088, .088);
        spike6.matrix.rotate(-45, 1, 0, 0);
        spike6.matrix.scale(.05, .05, 0.05);
        spike6.render();

        var spike7 = new Cone();
        spike7.segments = 4;
        spike7.color = [247 / 255, 230 / 255, 50 / 255, 1];
        spike7.matrix = new Matrix4(sawCoordMat);
        spike7.matrix.translate(0, .088, -.088);
        spike7.matrix.rotate(225, 1, 0, 0);
        spike7.matrix.scale(.05, .05, 0.05);
        spike7.render();

        var spike8 = new Cone();
        spike8.segments = 4;
        spike8.color = [247 / 255, 230 / 255, 50 / 255, 1];
        spike8.matrix = new Matrix4(sawCoordMat);
        spike8.matrix.translate(0, -.088, .088);
        spike8.matrix.rotate(45, 1, 0, 0);
        spike8.matrix.scale(.05, .05, 0.05);
        spike8.render();

        //END OF RIGHT ARM ---------------------------------------------------------------------------------------------------------------------------------
    }

    animStep(){
        var now = performance.now()/1000;
        var elapsed = now - g_last;
        g_last = now;
      
        //arm animation angles
        if(this.animChoice == SWING){
          //LEFT LEG
          this.upperLegRotL = (75*Math.sin(g_last*3));
          if(this.upperLegRotL > 0){
            this.lowerLegRotL = (-60*Math.sin(g_last*3));
          }else{
            this.lowerLegRotL = (100*Math.sin(g_last*3)); 
          }
          //RIGHT LEG
          this.upperLegRotR = (-75*Math.sin(g_last*3));
          if(this.upperLegRotR > 0){
            this.lowerLegRotR = (60*Math.sin(g_last*3));
          }else{
            this.lowerLegRotR = (-100*Math.sin(g_last*3)); 
          }
      
          //LEFT ARM
          this.upperArmRotXL = (5*Math.sin(g_last*3));
          this.midArmRotXL = (-45*Math.sin(g_last*3));
      
          //RIGHT ARM
          this.upperArmRotXR = (-5*Math.sin(g_last*3));
          this.midArmRotXR = (45*Math.sin(g_last*3));
        }
        if(this.specialAnim){
          this.sawRot += (360 * elapsed* 3);
          if(this.sawRot >= 360){
            this.sawRot -= 360; 
          }
        }
      }
}