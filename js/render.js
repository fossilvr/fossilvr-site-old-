/*TODO: 
1. Selecting mesh for the second time, display journal.
2. Journal renders the model.
3. Pins can be picked.


*/
const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true,{ stencil: true }); // Generate the BABYLON 3D engine
var hannah;
var playGame = false;
const createScene =  () => {
    //-------VARIABLES-------------------------------
    var picked = false;
    var mapVisible = false;
    var journalVisible = false;
    var pickUpR1, pickUpR2, pickUpR3, pickUpR4, pickUpR5, pickUpR6,pickUpSkull;
    var aspectRatio = screen.width/screen.height;
    var playedIntro = false;
    var dialogueCounter = 0;
    var originalPlace = new BABYLON.Vector3(0,0,2);
    var xPressed = false;
    var yPressed = false;
    var zPressed = false;
    var cancelled = false;

    //-----------SCENE INITIALIZATIONS------------------------
    const scene = new BABYLON.Scene(engine);
    scene.enablePhysics();
    scene.ambientColor = new BABYLON.Color3(1,1,1);
    scene.gravity = new BABYLON.Vector3(0, -.75, 0); 
    scene.collisionsEnabled = true;
    


    //---------------CAMERAS----------------------------------
    var camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 0, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    
    // camera.ellipsoid = new BABYLON.Vector3(.4, .8, .4);
    // camera.checkCollisions = true;
    camera.attachControl(canvas, true);
    // camera.speed = 5;
    // camera.layerMask = 1;
    camera.inertia = 0.5;

    var camera2 = new BABYLON.ArcRotateCamera("Camera2", -Math.PI/2, 0.5, 110, BABYLON.Vector3.Zero(), scene);
    scene.activeCameras = [];
    scene.activeCameras.push(camera);
    BABYLON.Effect.ShadersStore["customFragmentShader"] = `
    #ifdef GL_ES
        precision highp float;
    #endif

    // Samplers
    varying vec2 vUV;
    uniform sampler2D textureSampler;

    // Parameters
    uniform vec2 screenSize;
    uniform float threshold;

    void main(void) 
    {
        vec2 texelSize = vec2(1.0 / screenSize.x, 1.0 / screenSize.y);
        vec4 baseColor = texture2D(textureSampler, vUV);


        if (baseColor.g < threshold) {
            gl_FragColor = baseColor;
        } else {
            gl_FragColor = vec4(0);
        }
    }
    `;

    var postProcess = new BABYLON.PostProcess("My custom post process", "custom", ["screenSize", "threshold"], null, 0.25, camera2);
    postProcess.onApply = function (effect) {
        effect.setFloat2("screenSize", postProcess.width, postProcess.height);
        effect.setFloat("threshold", 1.0);
    };
    camera2.layerMask = 0;

    //--------------------LIGHTS-----------------------------
    //Hemispherical light can't cast shadows
    //const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0));
    //light.intensity = 0.05;
    var light2 = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(0, -0.8, 0.4), scene);
    light2.position = new BABYLON.Vector3(0,20,10);
    light2.intensity = 3;
    scene.createDefaultEnvironment({ createSkybox: false, createGround: false });
    //var light2 = new BABYLON.SpotLight("spotLight", new BABYLON.Vector3(3, 2.5, 8), new BABYLON.Vector3(0, 0, -1), Math.PI / 3, 2, scene);

    //------------------SHADOWS----------------------------------------
    var shadowGenerator = new BABYLON.ShadowGenerator(2048, light2);
    shadowGenerator.usePercentageCloserFiltering = true;
    shadowGenerator.filteringQuality = BABYLON.ShadowGenerator.QUALITY_MEDIUM;

    //-----------------GROUND----------------------------
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width:100, height:100});
    const groundMat = new BABYLON.PBRMaterial("groundMat");
    groundMat.albedoColor = new BABYLON.Color3(150/255, 110/255, 34/255);
    groundMat.metallic = 0.4;
    groundMat.roughness = 1;
    //groundMat.diffuseTexture = new BABYLON.Texture("assets/stone_ground.jpg");
    ground.material = groundMat; //Place the material property of the ground
    ground.checkCollisions= true;
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.PlaneImpostor, { mass: 0, restitution: 0.5, friction:0.1 }, scene);
    ground.receiveShadows = true;
    ground.layerMask = 1;

    //-----------------WALLS----------------------------

    const wall1 = BABYLON.MeshBuilder.CreatePlane("Wall1", {width: 200, height: 200} );
    wall1.position = new BABYLON.Vector3(0,0,-30);
    wall1.rotation = new BABYLON.Vector3(0,Math.PI,0);
    wall1.checkCollisions= true;
    wall1.physicsImpostor = new BABYLON.PhysicsImpostor(wall1, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.5, friction:0.1 }, scene);

    const wall2 = BABYLON.MeshBuilder.CreatePlane("Wall2", {width: 200, height: 200} );
    wall2.position = new BABYLON.Vector3(0,0,33);
    wall2.rotation = new BABYLON.Vector3(0,0,0);
    wall2.checkCollisions= true;
    wall2.physicsImpostor = new BABYLON.PhysicsImpostor(wall2, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.5, friction:0.1 }, scene);

    const wall3 = BABYLON.MeshBuilder.CreatePlane("wall3", {width: 200, height: 200} );
    wall3.position = new BABYLON.Vector3(30,0,33);
    wall3.rotation = new BABYLON.Vector3(0,Math.PI/2,0);
    wall3.checkCollisions= true;
    wall3.physicsImpostor = new BABYLON.PhysicsImpostor(wall3, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.5, friction:0.1 }, scene);

    const wall4 = BABYLON.MeshBuilder.CreatePlane("wall4", {width: 200, height: 200} );
    wall4.position = new BABYLON.Vector3(-30,0,33);
    wall4.rotation = new BABYLON.Vector3(0,-Math.PI/2,0);
    wall4.checkCollisions= true;
    wall4.physicsImpostor = new BABYLON.PhysicsImpostor(wall4, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.5, friction:0.1 }, scene);
    wall1.isVisible = false;
    wall2.isVisible = false;
    wall3.isVisible = false;
    wall4.isVisible = false;


    //-----------------SKYBOX----------------------------
    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/sky/tropical", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;

    //-------------------MUSIC-------------------------------

    var music = new BABYLON.Sound("Music", "assets/sounds/Ashara Ambience.ogg", scene, null, {
        loop: true,
        autoplay: true,
        volume: 0.1
      });

    
    var intro2 = new BABYLON.Sound("intro2", "assets/sounds/Introduction2.ogg", scene);
    var intro3 = new BABYLON.Sound("intro3", "assets/sounds/Introduction3.ogg", scene);
    var intro4 = new BABYLON.Sound("intro4", "assets/sounds/Introduction4.ogg", scene);
    var intro5 = new BABYLON.Sound("intro5", "assets/sounds/Introduction5.ogg", scene);
    var intro6 = new BABYLON.Sound("intro6", "assets/sounds/Introduction6.ogg", scene);
    var intro7 = new BABYLON.Sound("intro7", "assets/sounds/Introduction7.ogg", scene);
    var intro8 = new BABYLON.Sound("intro8", "assets/sounds/Introduction8.ogg", scene);
    var intro9 = new BABYLON.Sound("intro9", "assets/sounds/Introduction9.ogg", scene);

    //-----------------HIGHLIGHT LAYER----------------------------
    var hl = new BABYLON.HighlightLayer("hl1", scene);
    
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

    //Pointer stuff, make sure it isnt moving around on loading the journal
    var journalPlane = new BABYLON.GUI.Image("but", "assets/ui/Journal1.png");
    journalPlane.width = "100%";
    journalPlane.height = "100%";
    journalPlane.verticalAlignment = 1;
    advancedTexture.addControl(journalPlane);   
    journalPlane.isVisible = false; 



    //--------------------MAP----------------------------------
    var rt2 = new BABYLON.RenderTargetTexture("depth", 1024, scene, true, true);
    scene.customRenderTargets.push(rt2);
	rt2.activeCamera = camera2;
    rt2.renderList = scene.meshes;

    
    var mon2 = BABYLON.Mesh.CreatePlane("plane", 6, scene);
    // mon2.position = new BABYLON.Vector3(canvas.width/640, canvas.height/480, 20)
    mon2.position = new BABYLON.Vector3(0, 0, 10)
    var mon2mat = new BABYLON.StandardMaterial("texturePlane", scene);
    mon2mat.diffuseColor = new BABYLON.Color3(0,1,1);
    mon2mat.diffuseTexture = rt2;
    mon2mat.specularColor = BABYLON.Color3.Black();
    mon2mat.ambientColor = new BABYLON.Color3(0.5,1,0);

     mon2mat.diffuseTexture.uScale = 1/aspectRatio; // zoom
     //mon2mat.diffuseTexture.vScale = 1;
    mon2mat.diffuseTexture.uOffset = 1.215;
     mon2mat.diffuseTexture.level = 1.2; // intensity

    mon2mat.emissiveColor = new BABYLON.Color3(1,1,1); // backlight
	mon2.material = mon2mat;
	mon2.parent = camera;
	mon2.parent = camera;
    mon2.renderingGroupId = 1;
	//mon2.layerMask = 1;

	// mon2.enableEdgesRendering(epsilon);	 
	mon2.edgesWidth = 5.0;
	mon2.edgesColor = new BABYLON.Color4(1, 1, 1, 1);
    mon2.isVisible = false;

    //------------------UI-------------------------------------

    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI");
    
    var button1 = BABYLON.GUI.Button.CreateImageWithCenterTextButton("but","", "assets/ui/Button1.png");
    button1.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    button1.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    button1.width = 0.06;
    button1.height = 0.06*aspectRatio;
    button1.left = -canvas.width+canvas.width/1.05;
    button1.top = canvas.height - canvas.height/1.05;
    button1.thickness = 0; 


    var button2 = BABYLON.GUI.Button.CreateImageWithCenterTextButton("but2","", "assets/ui/Button2.png");
    button2.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    button2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    button2.width = 0.06;
    button2.height = 0.06*aspectRatio;
    button2.left = -canvas.width+canvas.width/1.05;
    button2.top = canvas.height - canvas.height/1.2;
    button2.thickness = 0; 

    var button3 = BABYLON.GUI.Button.CreateImageWithCenterTextButton("but2","", "assets/ui/Group 53.png");
    button3.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    button3.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    button3.width = 0.06;
    button3.height = 0.06*aspectRatio;
    button3.left = -canvas.width+canvas.width/1.05;
    button3.top = canvas.height - canvas.height/1.4;
    button3.thickness = 0;

    var input = new BABYLON.GUI.InputText();
    input.width = 0.3;
    input.maxWidth = 0.05;
    input.height = "40px";
    input.top = canvas.height/2-canvas.height/2.15;
    input.left = canvas.width/2 - canvas.width/3.4;
    input.text = "";
    input.color = "white";
    input.background = "black";
    input.thickness = 2;
    input.isVisible = false;

    var input2 = new BABYLON.GUI.InputText();
    input2.width = 0.3;
    input2.maxWidth = 0.05;
    input2.height = "40px";
    input2.top = canvas.height/2-canvas.height/4.4;
    input2.left = canvas.width/2 - canvas.width/3.4;
    input2.text = "";
    input2.color = "white";
    input2.background = "black";
    input2.isVisible = false;
    

    button2.onPointerUpObservable.add(function() {
        if(!journalVisible){
        // journalPlane.isVisible = true;
        // input.isVisible = true;
        // input2.isVisible = true;
        journalVisible = !journalVisible;
        showJournal();
        
    }
        else{
        input.isVisible = false;
        journalPlane.isVisible = false;
        input2.isVisible = false;
        journalVisible = false;
        journalVisible = !journalVisible;
    }
    });

    button3.onPointerUpObservable.add(function() {
        if(!mapVisible){
        mon2.isVisible = true;
        mapVisible = true;
    }
        else{
        mon2.isVisible = false;
        mapVisible = false;
    }
    });

    var button4 = BABYLON.GUI.Button.CreateSimpleButton("button", "Next");
    button4.top = "35%";
    button4.left = "40%";
    button4.width = "150px";
    button4.height = "50px";
    button4.cornerRadius = 20;
    button4.thickness = 4;
    button4.children[0].color = "#DFF9FB";
    button4.children[0].fontSize = 24;
    button4.color = "#FF7979";
    button4.background = "#EB4D4B";

    var dispBut = BABYLON.GUI.Button.CreateSimpleButton("button", "Hello, I'm Hannah and I'm a paleontologist.");
    dispBut.top = "35%";
    dispBut.left = "0%";
    dispBut.width = "60%";
    dispBut.height = "20%";
    dispBut.cornerRadius = 20;
    dispBut.thickness = 4;
    dispBut.children[0].color = "#DFF9FB";
    dispBut.children[0].fontSize = 24;
    dispBut.color = "#000000";
    dispBut.background = "#303236";

    var button5 = BABYLON.GUI.Button.CreateSimpleButton("button", "X");
    button5.top = "20%";
    button5.left = "30%";
    button5.width = "50px";
    button5.height = "50px";
    button5.cornerRadius = 20;
    button5.thickness = 4;
    button5.children[0].color = "#DFF9FB";
    button5.children[0].fontSize = 24;
    button5.color = "#FF7979";
    button5.background = "#EB4D4B";

    button4.onPointerUpObservable.add(function() {
        switch(dialogueCounter){

                    case 1: 
                    dispBut.textBlock.text = "Welcome to the Ashara Desert. We are here to find fossils.";
                    intro2.play();
                    dialogueCounter++;
                    break;
                    case 2: 
                    intro2.stop();
                    dispBut.textBlock.text = "A paleontologist is someone who studies plants and animals that lived millions of years ago. I look at fossils to help me learn what life was like when that plant or animal was alive.";
                    intro3.play();
                    dialogueCounter++;
                    break;
                    case 3: 
                    intro3.stop();
                    dispBut.textBlock.text = "I spend a lot of time out in the field looking for fossils. I find them all over the world. That is why I need your help!";
                    intro4.play();
                    dialogueCounter++;
                    break;
                    case 4: 
                    intro4.stop();
                    dispBut.textBlock.text = "Many new fossils have been found in the Ashara Desert, and I need you to help me find them and learn from them."
                    intro5.play();
                    dialogueCounter++;
                    break;
                    case 5: 
                    intro5.stop();
                    dispBut.textBlock.text = "I make observations and inferences about the fossils I find. Observations are things that we can notice with our five senses! Let me show you an example from an animal that is still alive today!"
                    intro6.play();
                    dialogueCounter++;
                    break;
                    case 6: 
                    intro6.stop();
                    dispBut.textBlock.text = "Look at this chameleon’s skin! What do you observe or notice about it?"
                    intro7.play();
                    dialogueCounter++;
                    break;
                    case 7: 
                    intro7.stop();
                    dispBut.textBlock.text = "I observe that the chameleon skin is green with yellow spots. Now let’s make an inference about the chameleon. An inference is when you use clues and what you know to make a guess about something."
                    intro8.play();
                    dialogueCounter++;
                    break;
                    case 8: 
                    intro8.stop();
                    intro9.play();
                    dispBut.textBlock.text = "I think that the chameleon has green skin with yellow spots to help it blend in or camouflage with its surroundings. This is important, because its skin helps it to hide from animals that may try to harm it!"
                    dialogueCounter++;
                    advancedTexture.removeControl(button4);
                    advancedTexture.removeControl(dispBut);
                    //document.getElementById('canvas_div_no_cursor').style.cursor = "none";
                    break;

        }
    });

    button5.onPointerUpObservable.add(function(){
        console.log("In");
        dialogueCounter = 0;
        advancedTexture.removeControl(button4);
        advancedTexture.removeControl(dispBut);
        advancedTexture.removeControl(button5);
        cancelled = true;
    });

    

    advancedTexture.addControl(button1); 
    advancedTexture.addControl(button2); 
    advancedTexture.addControl(button3);
    advancedTexture.addControl(input);
    advancedTexture.addControl(input2);

    
    

    //---------------PLAYER----------------------------------
    const hero = BABYLON.Mesh.CreateBox('hero', 1.0, scene, false, BABYLON.Mesh.FRONTSIDE);
    hero.position.x = 0.0;
    hero.position.y = 1;
    hero.position.z = -25.0;
    hero.physicsImpostor = new BABYLON.PhysicsImpostor(hero, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0.0, friction: 0.1 }, scene);	
    hero.isPickable = false;	
    //hero.physicsImpostor.physicsBody.fixedRotation = true;
    // hero.physicsImpostor.physicsBody.updateMassProperties();

    // pointer
    var pointer = BABYLON.Mesh.CreateSphere("Sphere", 16.0, 0.01, scene, false, BABYLON.Mesh.DOUBLESIDE);
    pointer.position.x = 0.0;
    pointer.position.y = 0.0;
    pointer.position.z = 0.0;
    pointer.isPickable = false;

    var moveForward = false;
    var moveBackward = false;
    var moveRight = false;
    var moveLeft = false;
    var currMesh;
    var startingPoint;
    var onKeyDown = function (event) {
        switch (event.keyCode) {
            case 38: // up
            case 87: // w
                moveForward = true;
                break;

            case 37: // left
            case 65: // a
                moveLeft = true; break;

            case 40: // down
            case 83: // s
                moveBackward = true;
                break;

            case 39: // right
            case 68: // d
                moveRight = true;
                break;

            case 32: // space
                break;
        }
    };

    var onKeyUp = function (event) {
        switch (event.keyCode) {
            case 38: // up
            case 87: // w
                moveForward = false;
                break;

            case 37: // left
            case 65: // a
                moveLeft = false;
                break;

            case 40: // down
            case 83: // a
                moveBackward = false;
                break;

            case 39: // right
            case 68: // d
                moveRight = false;
                break;
        }
    };

    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
    
    
    scene.registerBeforeRender(function () {  
        

        camera.position.x = hero.position.x;
        camera.position.y = hero.position.y + 0.5;
        camera.position.z = hero.position.z;
        pointer.position = camera.getTarget();
        
        var forward = camera.getTarget().subtract(camera.position).normalize();
        forward.y = 0;
        var right = BABYLON.Vector3.Cross(forward, camera.upVector).normalize();
        right.y = 0;
        
        var SPEED = 5;
        let f_speed = 0;
        var s_speed = 0;
        var u_speed = 0;			

        if (moveForward) {
            f_speed = SPEED;
        }
        if (moveBackward) {
            f_speed = -SPEED;
        }

        if (moveRight) {
            s_speed = SPEED;
        }

        if (moveLeft) {
            s_speed = -SPEED;
        }
        
        var move = (forward.scale(f_speed)).subtract((right.scale(s_speed))).subtract(camera.upVector.scale(u_speed));
        //hero.physicsImpostor.setLinearVelocity(new BABYLON.Vector3(move.x,move.y,move.z));
         hero.physicsImpostor.physicsBody.velocity.x = move.x;
         hero.physicsImpostor.physicsBody.velocity.z = move.z;
         hero.physicsImpostor.physicsBody.velocity.y = move.y;
        
    });

    /*//WASD
    camera.keysUp.push(87); 
    camera.keysDown.push(83);            
    camera.keysRight.push(68);
    camera.keysLeft.push(65);
    */

    
    //Jump
   /* function jump(){
      hero.physicsImpostor.applyImpulse(new BABYLON.Vector3(1, 20, -1), hero.getAbsolutePosition());
    }

    document.body.onkeyup = function(e){
      if(e.keyCode == 32){
        your code
        console.log("jump");
        setTimeout(jump(), 10000); 

      }
    }*/

    //------------MESH PICKING--------------------------
    
    var pickedUp = false;

	function manipMesh() {
        console.log(pickedUp);

        //If already picked up, wake the physics imposter so that it falls to the ground, remove it from the highlight layer
		if(pickedUp){
            currMesh.physicsImpostor.wakeUp();
            //hl.removeMesh(currMesh);
            currMesh = null;
            console.log(currMesh);
            pickedUp = false;   
        }
        else{

        //Raycast towards the front of the camera, if it hits a particular set of meshes, pick them up
            var pos = {x:camera.position.x + 1.1, y:camera.position.y, z:camera.position.z};
            var forward = camera.getTarget().subtract(camera.position).normalize();
            var ray = new BABYLON.Ray(camera.position,forward,5);	
            var hit = scene.pickWithRay(ray, function(mesh){
             if(mesh == pickUpR1 || mesh== pickUpR2 || mesh==pickUpR3 || mesh==pickUpR4 || mesh==pickUpR5 || mesh ==pickUpR6 || mesh==pickUpSkull) { 
                if(mesh==pickUpSkull){ 
                showInfoPanel();
                } 
                 return true;
                
             }
             return false;
         });
         //
            if(hit.pickedMesh){
                hit.pickedMesh.physicsImpostor.sleep();
                currMesh = hit.pickedMesh;
                startingPoint = currMesh.position;
                pickedUp = true;

                //hl.addMesh(currMesh.subMeshes[0].getRenderingMesh(), BABYLON.Color3.Green());       
            }
        }

	};
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI2");

    
    function showInfoPanel(){
    //camera.detachControl();
    var mon3 = BABYLON.MeshBuilder.CreatePlane("plane1", {width:9,height:5},scene);
    mon3.isPickable = false;
    mon3.position = new BABYLON.Vector3(0, 0, 7)
    var mon3mat = new BABYLON.StandardMaterial("texturePlane1", scene);
    mon3mat.alpha = 1;
    var t = new BABYLON.Texture("assets/ui/Group68.png ", scene);
    t.hasAlpha = true;
   
    mon3mat.diffuseTexture = t;
    //mon3mat.ambientTexture = groundTexture;
    mon3mat.useAlphaFromDiffuseTexture = true; 
	mon3.material = mon3mat;
	mon3.parent = camera;
    mon3.renderingGroupId = 1;
    mon3.isVisible = true;


    var text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Fossil ID:\tFossil #3\n\nLocation: \tAshara Desert, Mountain #3\n\nFound by: \t Jessica Roberts";
    text1.color = "black";
    text1.fontSize = 20;
    text1.top = "8%";
    text1.left = "19%";
    advancedTexture.addControl(text1);
    advancedTexture.renderingGroupId = 1;

    var buttonSend = BABYLON.GUI.Button.CreateImageWithCenterTextButton("but2","", "assets/ui/Group13.png");
    buttonSend.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    buttonSend.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    buttonSend.width = 0.23;
    buttonSend.height = 0.08;
    //button1.left = -canvas.width+canvas.width/1.05;
    buttonSend.top = "28%";
    buttonSend.left="20%";
    buttonSend.thickness = 0;
    buttonSend.cornerRadius = 5;

    buttonSend.onPointerUpObservable.add(function() {
        camera.attachControl(canvas,true);
        text1.isVisible = false;
        buttonSend.isVisible = false;
        pickUpSkull.position = new BABYLON.Vector3(-23,1,7);
        mon3.isVisible = false;
        currMesh = null;
    });
    advancedTexture.addControl(buttonSend);
    // var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI1");
    // var button1 = BABYLON.GUI.Button.CreateImageWithCenterTextButton("but2","", "assets/ui/StartButton.png");
    // button1.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    // button1.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    // button1.width = 0.15;
    // button1.height = 0.1;
    // //button1.left = -canvas.width+canvas.width/1.05;
    // button1.top = canvas.height - canvas.height/1.2;
    // button1.thickness = 0;
    // button1.cornerRadius = 5;
    
    }
    var fossilJournal;
    
    
    function showJournal(){
        camera.detachControl();
    var mon4 = BABYLON.MeshBuilder.CreatePlane("plane4", {width:9,height:5},scene);
    mon4.isPickable = false;
    mon4.position = new BABYLON.Vector3(0, 0, 7)
    var mon4mat = new BABYLON.StandardMaterial("texturePlane1", scene);
    mon4mat.alpha = 1;
    var t = new BABYLON.Texture("assets/ui/Group137.png ", scene);
    t.hasAlpha = true;
    fossilJournal = pickUpSkull.createInstance("ASDASD");
    mon4mat.diffuseTexture = t;
    //mon3mat.ambientTexture = groundTexture;
    mon4mat.useAlphaFromDiffuseTexture = true; 
	mon4.material = mon4mat;
	mon4.parent = camera;
    mon4.renderingGroupId = 1;
    mon4.isVisible = false;
    //fossilJournal.forEach((m) => m.renderingGroupId = 1);
    fossilJournal.position = new BABYLON.Vector3(0,0,2);
    fossilJournal.parent = camera;
    fossilJournal.renderingGroupId =2;
    }
      
    scene.onPointerMove = function(evt){
        if(currMesh){
        const cameraForwardRay = camera.getForwardRay();       
        var forward = cameraForwardRay.direction.normalize();
        forward = forward.scale(2.5);
        currMesh.position = camera.position.add(forward);
        startingPoint = currMesh.position;
        }
    };

     var currentPosition = { x: 0, y: 0 };
     var clicked = false;
    canvas.addEventListener("pointerdown", function (evt) {
        currentPosition.x = evt.clientX;
        currentPosition.y = evt.clientY;
        clicked = true;
    });
    
    canvas.addEventListener("pointermove", function (evt) {
        if (!clicked) {
            return;
        }

        var dx = evt.clientX - currentPosition.x;
        var dy = evt.clientY - currentPosition.y;

        var angleX = dy * 0.01;
        var angleY = -dx * 0.01;

        var worldMat = fossilJournal.getWorldMatrix();




        var rotXMat = BABYLON.Matrix.RotationZ(angleX);
        var rotYMat = BABYLON.Matrix.RotationY(angleY);

        // worldMat.multiply(rotXMat);
        // worldMat.multiply(rotYMat);

       worldMat = worldMat.invert()

        var axis = new BABYLON.Vector3(worldMat.getRow(0).x, worldMat.getRow(1).x, worldMat.getRow(2).x);

        console.log('axis1: ' + axis);

        fossilJournal.rotate(axis, -angleX, BABYLON.Space.LOCAL);

        var axis2 = new BABYLON.Vector3(worldMat.getRow(0).y, worldMat.getRow(1).y, worldMat.getRow(2).y);
        fossilJournal.rotate(axis2, -angleY, BABYLON.Space.LOCAL);

        console.log('axis2: ' + axis2);

         //boxMesh.rotation.y -= angleY;
        // boxMesh.rotation.x -= angleX;

         // console.log(worldMat.toArray());

        currentPosition.x = evt.clientX;
        currentPosition.y = evt.clientY;
    });
    
    canvas.addEventListener("pointerup", function (evt) {
        clicked = false;
    });



    //Why isnt this working?
    // var debugShow = false;
    // scene.onKeyboardObservable.add((kbInfo) => {
	// 	switch (kbInfo.type) {
	// 		case BABYLON.KeyboardEventTypes.KEYDOWN:
	// 			switch (kbInfo.event.key) {
    //                 case "m":
    //                 case "M":
    //                     if(debugShow==false)
    //                     scene.debugLayer.show();
    //                     else
    //                     scene.debugLayer.hide();
    //                 break;
    //                 case "n":
    //                 case "N":
    //                     scene.debugLayer.hide();
    //                 break;
    //             }
	// 		break;
	// 	}
	// });
      

	
	// var pointerlockchange = function () {
	// 	var controlEnabled = document.mozPointerLockElement || document.webkitPointerLockElement || document.msPointerLockElement || document.pointerLockElement || null;
		
	// 	// If the user is already locked
	// 	if (!controlEnabled) {
	// 		//camera.detachControl(canvas);
	// 		isLocked = false;
	// 	} else {
	// 		//camera.attachControl(canvas);
	// 		isLocked = true;
	// 	}
	// };

    // var canvasPtrDown = function(evt){
    // var forward = camera.getTarget().subtract(camera.position).normalize();
    // var ray = new BABYLON.Ray(camera.position,forward,100);	
    // var hit = scene.pickWithRay(ray);
	// var rayHelper = new BABYLON.RayHelper(ray);	
    //  rayHelper.show(scene);
    //     console.log(rayHelper, BABYLON.Color3(0,0,0));
    //     if(hit.pickedMesh){
    //         currMesh = hit.pickedMesh;
    //         startingPoint = hit.pickedPoint;
    //     }
    //     currMesh.position.x = startingPoint.x;
    //     currMesh.position.y = startingPoint.y;
    //     currMesh.position.z = startingPoint.z;
    //     startingPoint = currMesh.position;
    // }
	
	// Attach events to the document
	// document.addEventListener("pointerlockchange", pointerlockchange, false);
	// document.addEventListener("mspointerlockchange", pointerlockchange, false);
	// document.addEventListener("mozpointerlockchange", pointerlockchange, false);
	// document.addEventListener("webkitpointerlockchange", pointerlockchange, false);

    //canvas.addEventListener("pointermove", canvasPtrDown, false);
    


    // -------------------------------FLAG -------------------------
    BABYLON.SceneLoader.ImportMeshAsync("", "", "assets/1_flag.glb").then((result) => {
            result.meshes[0].position.x = 5;
            result.meshes[0].position.z = -15;   
            result.meshes[0].rotation.y = Math.PI/4;
            result.meshes.forEach(function (mesh) {
                shadowGenerator.getShadowMap().renderList.push(mesh);
            });
            result.meshes[0].isPickable = true;
    });


    //----------------------------TENT-----------------------------------

    BABYLON.SceneLoader.ImportMeshAsync("", "", "assets/3_tent.glb").then((result) => {
        result.meshes[0].position.z = 6;
        result.meshes[0].position.x = 5;
        result.meshes[0].scaling = new BABYLON.Vector3(2.5, 2.5, -2.5);

        result.meshes[0].rotationQuaternion = null;
        result.meshes[0].rotate.y =Math.PI/2;    
        //shadowGenerator.addShadowCaster(result.meshes[0]);
        result.meshes[0].getChildMeshes().forEach((m)=>{
            m.isPickable = false;
            shadowGenerator.getShadowMap().renderList.push(m);
        });
    });


    //----------------------------MAMMOTH-----------------------------------
    // BABYLON.SceneLoader.ImportMeshAsync("", "", "assets/11_mammoth.glb").then((result) => {
    //     result.meshes[0].position.z = 6;
    //     result.meshes[0].position.x = -14;
    //     result.meshes[0].scaling = new BABYLON.Vector3(0.075, 0.075, 0.075);
    //     result.meshes[0].isPickable = false;
    //         result.meshes[0].rotationQuaternion = null;
    //         result.meshes[0].rotate.y =-Math.PI/2;
    //         result.meshes[0].getChildMeshes().forEach((m)=>{
    //             m.isPickable = false;
    //             shadowGenerator.getShadowMap().renderList.push(m);
    //         });     
    // });

     //----------------------------DESERT PLANTS-----------------------------------
     BABYLON.SceneLoader.ImportMeshAsync("", "", "assets/6_desertplants.glb").then((result) => {
        result.meshes[0].position.z = 6;
        result.meshes[0].position.x = 15;
        const rock01 = scene.getMeshByName("rock_01_rock01");
        const rock02 = scene.getMeshByName("rock_02_rock02");
        const rock03 = scene.getMeshByName("rock_03_rock03");
        const rock07 = scene.getMeshByName("rock_07");
        rock01.isVisible = false;
        rock02.isVisible = false;
        rock03.isVisible = false;
        rock07.isVisible = false;
        const cactus01 = scene.getMeshByName("Cactus_01_cactus01");
        shadowGenerator.getShadowMap().renderList.push(cactus01);
        const cactus02 = scene.getMeshByName("Cactuss_02_cactus02");
        shadowGenerator.getShadowMap().renderList.push(cactus02);
        const cactus03 = scene.getMeshByName("Cactus_03_cactus03");
        shadowGenerator.getShadowMap().renderList.push(cactus03);
        const aloe01 = scene.getMeshByName("Aloe._01_aloe.002");
        shadowGenerator.getShadowMap().renderList.push(aloe01);
        // cactus01.isVisible = false;
        // cactus02.isVisible = false;
        // cactus03.isVisible = false;
        // aloe01.isVisible = false;

        rock01.scaling = new BABYLON.Vector3(7,7,7);
        rock02.scaling = new BABYLON.Vector3(7,7,7);
        rock03.scaling = new BABYLON.Vector3(7,7,7);
        rock07.scaling = new BABYLON.Vector3(7,7,7);

        const c11 = cactus01.createInstance("c11");
        const c12 = cactus01.createInstance("c12");
        const c13 = cactus01.createInstance("c13");
        shadowGenerator.getShadowMap().renderList.push(c11);
        shadowGenerator.getShadowMap().renderList.push(c12);
        shadowGenerator.getShadowMap().renderList.push(c13);

        c11.position = new BABYLON.Vector3(15,0,-20);
        c12.position = new BABYLON.Vector3(-20,0,-14);
        c13.position = new BABYLON.Vector3(5,0,-10);

        const c21 = cactus02.createInstance("c21");
        const c22 = cactus02.createInstance("c22");
        const c23 = cactus02.createInstance("c23");
        shadowGenerator.getShadowMap().renderList.push(c21);
        shadowGenerator.getShadowMap().renderList.push(c22);
        shadowGenerator.getShadowMap().renderList.push(c23);

        c21.position = new BABYLON.Vector3(-13,0,-10);
        c22.position = new BABYLON.Vector3(-30,0,-14);
        c23.position = new BABYLON.Vector3(15,0,-21);

        const c31 = cactus03.createInstance("c31");
        const c32 = cactus03.createInstance("c32");
        const c33 = cactus03.createInstance("c33");
        shadowGenerator.getShadowMap().renderList.push(c31);
        shadowGenerator.getShadowMap().renderList.push(c32);
        shadowGenerator.getShadowMap().renderList.push(c33);

        c31.position = new BABYLON.Vector3(34,0,-21);
        c32.position = new BABYLON.Vector3(-21,0,-3);
        c33.position = new BABYLON.Vector3(-27,0,-19);

        const a31 = aloe01.createInstance("a31");
        const a32 = aloe01.createInstance("a32");
        const a33 = aloe01.createInstance("a33");
        shadowGenerator.getShadowMap().renderList.push(a31);
        shadowGenerator.getShadowMap().renderList.push(a32);
        shadowGenerator.getShadowMap().renderList.push(a33);

        a31.position = new BABYLON.Vector3(15,0,-21);
        a32.position = new BABYLON.Vector3(-20,0,-3);
        a33.position = new BABYLON.Vector3(5,0,-19);

        const r11 = rock01.createInstance("r11");
        const r12 = rock01.createInstance("r12");
        const r13 = rock01.createInstance("r13");
        const r14 = rock01.createInstance("r14");
        const r15 = rock01.createInstance("r15");
        const r16 = rock01.createInstance("r16"); 

        const r21 = rock02.createInstance("r21");
        const r22 = rock02.createInstance("r22");
        const r23 = rock02.createInstance("r23");
        const r24 = rock02.createInstance("r24");
        const r25 = rock02.createInstance("r25"); 
        const r26 = rock02.createInstance("r26");

        const r31 = rock03.createInstance("r31");
        const r32 = rock03.createInstance("r32");
        const r33 = rock03.createInstance("r33");
        const r34 = rock03.createInstance("r34"); 
        const r35 = rock03.createInstance("r35");
        const r36 = rock03.createInstance("r36");


        const r41 = rock07.createInstance("r41");
        const r42 = rock07.createInstance("r42");
        const r43 = rock07.createInstance("r43");
        const r44 = rock07.createInstance("r44"); 
        const r45 = rock07.createInstance("r45");
        const r46 = rock07.createInstance("r46");

        result.meshes[0].rotationQuaternion = null;
            result.meshes[0].rotate.y =Math.PI/2;    
        
        r11.position = new BABYLON.Vector3(-40,-5,40);
        r21.position = new BABYLON.Vector3(-25,0,40);
        r31.position = new BABYLON.Vector3(-15,0,40);
        r41.position = new BABYLON.Vector3(5,0,40);
        r15.position = new BABYLON.Vector3(20,0,40);
        r25.position = new BABYLON.Vector3(40,0,40);
        //r32.position = new BABYLON.Vector3(20,0,40);
        //r12.position = new BABYLON.Vector3(40,0,40);

        r12.position = new BABYLON.Vector3(-40,-5,-40);
        r22.position = new BABYLON.Vector3(-40,0,-25);
        r32.position = new BABYLON.Vector3(-40,0,-15);
        r42.position = new BABYLON.Vector3(-40,0,5);
        r35.position = new BABYLON.Vector3(-40,0,20);
        r45.position = new BABYLON.Vector3(-40,0,40);

        r13.position = new BABYLON.Vector3(40,-5,-40);
        r23.position = new BABYLON.Vector3(40,0,-25);
        r33.position = new BABYLON.Vector3(40,0,-15);
        r43.position = new BABYLON.Vector3(40,0,5);
        r16.position = new BABYLON.Vector3(40,0,20);
        r26.position = new BABYLON.Vector3(40,0,40);
        

        r14.position = new BABYLON.Vector3(-40,-5,-40);
        r24.position = new BABYLON.Vector3(-25,0,-40);
        r34.position = new BABYLON.Vector3(-15,0,-40);
        r44.position = new BABYLON.Vector3(5,0,-40);
        r36.position = new BABYLON.Vector3(20,0,-40);
        r46.position = new BABYLON.Vector3(40,0,-40);

        // pickUpR1 = rock07.createInstance("pickUpR1");
        // pickUpR2 = rock07.createInstance("pickUpR2");
        // pickUpR3 = rock07.createInstance("pickUpR3");
        // pickUpR4 = rock07.createInstance("pickUpR4");
        // pickUpR5 = rock07.createInstance("pickUpR5");
        // pickUpR6 = rock07.createInstance("pickUpR6");

        pickUpR1 = rock07.clone("pickUpR1");
        pickUpR1.setParent(null);
        pickUpR2 = rock07.clone("pickUpR2");
        pickUpR2.setParent(null);
        pickUpR3 = rock07.clone("pickUpR3");
        pickUpR3.setParent(null);
        pickUpR4 = rock07.clone("pickUpR4");
        pickUpR4.setParent(null);
        pickUpR5 = rock07.clone("pickUpR5");
        pickUpR5.setParent(null);
        pickUpR6 = rock07.clone("pickUpR6");
        pickUpR6.setParent(null);

        pickUpR1.isVisible = true;
        pickUpR2.isVisible = true;
        pickUpR3.isVisible = true;
        pickUpR4.isVisible = true;
        pickUpR5.isVisible = true;
        pickUpR6.isVisible = true;        

        pickUpR1.applyGravity = true;
        pickUpR2.applyGravity = true;
        pickUpR3.applyGravity = true;
        pickUpR4.applyGravity = true;
        pickUpR5.applyGravity = true;
        pickUpR6.applyGravity = true;

        pickUpR1.scaling = new BABYLON.Vector3(0.3,0.5,0.15);
        pickUpR2.scaling = new BABYLON.Vector3(0.25,0.6,0.17);
        pickUpR3.scaling = new BABYLON.Vector3(0.42,0.42,0.1);
        pickUpR4.scaling = new BABYLON.Vector3(0.44,0.5,0.15);
        pickUpR5.scaling = new BABYLON.Vector3(0.39,0.4,0.13);
        pickUpR6.scaling = new BABYLON.Vector3(0.4,0.5,0.19);

        pickUpR1.position = new BABYLON.Vector3(5,1,-14);
        pickUpR2.position = new BABYLON.Vector3(5.3,1,-14.3);
        pickUpR3.position = new BABYLON.Vector3(5.1,1,-15);
        pickUpR4.position = new BABYLON.Vector3(5.2,1,-15.2);
        pickUpR5.position = new BABYLON.Vector3(4.9,1,-14.6);
        pickUpR6.position = new BABYLON.Vector3(5.2,1,-14.2);

        pickUpR1.physicsImpostor = new BABYLON.PhysicsImpostor(pickUpR1, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 1, restitution: 0, friction: 0.1 }, scene);	
        pickUpR2.physicsImpostor = new BABYLON.PhysicsImpostor(pickUpR2, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 1, restitution: 0, friction: 0.1 }, scene);	
        pickUpR3.physicsImpostor = new BABYLON.PhysicsImpostor(pickUpR3, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 1, restitution: 0, friction: 0.1 }, scene);	
        pickUpR4.physicsImpostor = new BABYLON.PhysicsImpostor(pickUpR4, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 1, restitution: 0, friction: 0.1 }, scene);	
        pickUpR5.physicsImpostor = new BABYLON.PhysicsImpostor(pickUpR5, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 1, restitution: 0, friction: 0.1 }, scene);	
        pickUpR6.physicsImpostor = new BABYLON.PhysicsImpostor(pickUpR6, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 1, restitution: 0, friction: 0.1 }, scene);	
        var sixDofDragBehavior = new BABYLON.SixDofDragBehavior()
        pickUpR1.addBehavior(sixDofDragBehavior)
        var multiPointerScaleBehavior = new BABYLON.MultiPointerScaleBehavior()
        pickUpR1.addBehavior(multiPointerScaleBehavior)

    });

     //-----HANNAH----
     BABYLON.SceneLoader.ImportMeshAsync("", "", "assets/10_hannah_waving.glb").then((result) => {
        result.meshes[0].position.z = 4;
        result.meshes[0].position.x = 7;
        result.meshes[0].isPickable = false;

            result.meshes[0].rotationQuaternion = null;
            result.meshes[0].rotate.y =Math.PI/2;   
        hannah = result.meshes[0].position; 
    });
    // ------ DESERT PLANTS --------
    BABYLON.SceneLoader.ImportMeshAsync("", "", "assets/pal.glb").then((result) => {
        result.meshes[0].scaling = new BABYLON.Vector3(0.7, 0.7, -0.6);
        result.meshes[0].position.x = 2;
        result.meshes[0].position.z = 4.85;
        result.meshes[0].position.y = 0.3;
        result.meshes[0].isPickable = false;
        var fossil = scene.getMeshByName("13637_Triceratops_Skull_Fossil_v1_L2");
        fossil.checkCollisions = true;
        
        //Under rock coordinates
        fossil.position.x = 27.8;
        fossil.position.y = -0.5;
        fossil.position.z = -5.3;
        pickUpSkull = fossil;
        pickUpSkull.setParent(null);
        pickUpSkull.position = new BABYLON.Vector3(5.2,0,-15)
        pickUpSkull.physicsImpostor = new BABYLON.PhysicsImpostor(pickUpR1, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 1, restitution: 0, friction: 0.1 }, scene);
        pickUpSkull.applyGravity = true;
        
        //Outside rocks, for testing purposes

        result.meshes[0].rotationQuaternion = null;
        result.meshes[0].rotate(BABYLON.Vector3.Up(),Math.PI/2);    
    });

    //----------------- CROSSHAIR ------------------------
    function addCrosshair(scene){
        let w = 128

        let texture = new BABYLON.DynamicTexture('reticule', w, scene, false)
        texture.hasAlpha = true

        let ctx = texture.getContext()
        let reticule

        const createNavigate = () => {
        ctx.fillStyle = 'transparent'
        ctx.clearRect(0, 0, w, w)

        ctx.strokeStyle = 'rgba(170, 255, 0, 0.9)'
        ctx.lineWidth = 3.5
        ctx.beginPath()
        ctx.arc(w*0.5, w*0.5, 20, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(0, 255, 0, 0.4)";
        ctx.fill();
        ctx.stroke();
        

        texture.update()
        }

        createNavigate()

        let material = new BABYLON.StandardMaterial('reticule', scene)
        material.diffuseTexture = texture
        material.opacityTexture = texture
        material.emissiveColor.set(1, 1, 1)
        material.disableLighting = true

        let plane = BABYLON.MeshBuilder.CreatePlane('reticule', { size: 0.04 }, scene)
        plane.material = material
        plane.position.set(0, 0, 1.1)
        plane.isPickable = false
        plane.rotation.z = Math.PI / 4

        reticule = plane
        reticule.parent = camera
        return reticule;
    }

    let crosshair = addCrosshair(scene);

    // console.log(BABYLON.Vector3.Distance(camera.position, originalPlace));
    // console.log(camera.position);
    
    console.log(camera.position);
    //console.log(hero.getAbsolutePosition())
    scene.onBeforeRenderObservable.add(function () {
		if(!cancelled && hannah && BABYLON.Vector3.Distance(new BABYLON.Vector3(7,0,4),camera.position)<10){
            
            advancedTexture.addControl(button4);
            advancedTexture.addControl(button5);
            advancedTexture.addControl(dispBut);
            if(!playedIntro){
                document.getElementById('canvas_div_no_cursor').style.cursor = "url(\"assets/cc.svg\"), auto;";
                playedIntro = true;
                var intro1 = new BABYLON.Sound("intro1", "assets/sounds/Introduction1.ogg", scene,function() {
                    // Sound has been downloaded & decoded
                    intro1.play();
                    dialogueCounter++;
                  });
                }
        }
        
        if(dialogueCounter>8){
            advancedTexture.removeControl(button4);
            advancedTexture.removeControl(dispBut);
        }

        if (xPressed) {
            if(currMesh){
                currMesh.rotate(BABYLON.Axis.X, 0.1);
                console.log(currMesh.rotation.z);
            }                
        } 
        if (yPressed) {
            if(currMesh){
                currMesh.rotate(BABYLON.Axis.Z, 0.1);
                console.log(currMesh.rotation.z);
            }                
        }
        if (zPressed) {
            if(currMesh){
                currMesh.rotate(BABYLON.Axis.Y, 0.1);
                console.log(currMesh.rotation.z);
            }                
        }
	});
    
//----------DEBUGGER-------------------
var debugShow = false;
scene.onKeyboardObservable.add((kbInfo) => {
    switch (kbInfo.type) {
        case BABYLON.KeyboardEventTypes.KEYDOWN:
            switch (kbInfo.event.key) {
                case "e":
                case "E":
                manipMesh();
                    keyPressedE = true;
                    break;
                case "m":
                case "M":
                    if(debugShow==false)
                    scene.debugLayer.show();
                    else
                    scene.debugLayer.hide();
                break;
                case "n":
                case "N":
                    scene.debugLayer.hide();
                break;
                case "x":
                case "X":
                    xPressed = true;
                break;
                case "y":
                case "Y":
                    yPressed = true;
                break;
                case "z":
                case "Z":
                    zPressed = true;
                break;
            }
        break;
        case BABYLON.KeyboardEventTypes.KEYUP:
            switch (kbInfo.event.key) {   
            case "e":
            case "E":
                keyPressedE = false;
                break;
                case "x":
                case "X":
                     xPressed = false;
                break;
                case "y":
                case "Y":
                     yPressed = false;
                break;
                case "z":
                case "Z":
                     zPressed = false;
                break;
            }                
        }
    });

    return scene;
}

const createScene1 = () => {
    const scene1 = new BABYLON.Scene(engine);
    var camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 0, -10), scene1);
    camera.setTarget(BABYLON.Vector3.Zero());
    
    // camera.ellipsoid = new BABYLON.Vector3(.4, .8, .4);
    // camera.checkCollisions = true;
    // camera.speed = 5;
    // camera.layerMask = 1;
    camera.inertia = 0.5;
    var aspectRatio = screen.width/screen.height;

    const plane = BABYLON.MeshBuilder.CreatePlane("plane", {height:10, width: 20},scene1);
    var material = new BABYLON.StandardMaterial("texture1", scene1);
    material.diffuseTexture = new BABYLON.Texture("assets/BackgroundStart.png ", scene1);
    material.diffuseTexture.uScale = 1.0;
    material.diffuseTexture.vScale = 1.0;
    plane.material = material;
    var light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), scene1);
    light.intensity = 2.4;
    document.getElementById('canvas_div_no_cursor').style.cursor = "url(\"assets/cc.svg\"), auto";

    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("myUI1");
    var button1 = BABYLON.GUI.Button.CreateImageWithCenterTextButton("but2","", "assets/ui/StartButton.png");
    button1.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    button1.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    button1.width = 0.15;
    button1.height = 0.1;
    //button1.left = -canvas.width+canvas.width/1.05;
    button1.top = canvas.height - canvas.height/1.2;
    button1.thickness = 0;
    button1.cornerRadius = 5;


    var button2 = BABYLON.GUI.Button.CreateImageWithCenterTextButton("but2","", "assets/ui/Button1.png");
    button2.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    button2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    button2.width = 0.06;
    button2.height = 0.06*aspectRatio;
    button2.left = -canvas.width+canvas.width/1.05;
    button2.top = canvas.height - canvas.height/1.1;
    button2.thickness = 0; 
    advancedTexture.addControl(button1); 
    advancedTexture.addControl(button2); 

    button1.onPointerUpObservable.add(function() {
        playGame = true;
    });
    return scene1;
}


const scene = createScene(); 
const scene1 = createScene1();
    
        engine.runRenderLoop(function () {
            if(playGame)
                scene.render();
            else
                scene1.render();
        });

    
        window.addEventListener("resize", function () {
                engine.resize();
        });
        