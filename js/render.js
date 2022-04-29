const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true,{ stencil: true }); // Generate the BABYLON 3D engine
var hannah, hannahTalking, hannahWaving; //Stores Hannah model
var playGame = false;
var muteScene0 = false;
var muteScene1 = false;
var globalVolumeScene0 = 0; //Volume scene 0
var globalVolumeScene1 = 0; //Volume scene 1
var journalVisible = false; //Show Journal?
var journalVisible1 = false;
var journalVisible2 = false;
var triceraResults = [];
var trexResults = [];
var ammoniteResults = [];
const createScene =  () => {
    
    //------------------SCENE VARIABLES-------------------------------
    var picked = false;
    var mapVisible = false;
    var flag2, flag3; //Holds flag copies
    var pin;

    var pickUpR1, pickUpR2, pickUpR3, pickUpR4, pickUpR5, pickUpR6,pickUpSkull, pickUpSkull2, pickUpSkull3;
    var aspectRatio = screen.width/screen.height;
    var playedIntro = false;
    var dialogueCounter = 0;
    var originalPlace = new BABYLON.Vector3(0,0,2);
    var xPressed = false;
    var yPressed = false;
    var zPressed = false;
    var cancelled = false;
    var showHint = false;
    muteScene1 = muteScene0;
    var pickedFossil1 = false;
    var pickedFossil2 = false;
    var pickedFossil3 = false;
    globalVolumeScene1 = BABYLON.Engine.audioEngine.getGlobalVolume(0);

    //-----------SCENE INITIALIZATIONS------------------------
    const scene = new BABYLON.Scene(engine);
    
    scene.enablePhysics();
    scene.ambientColor = new BABYLON.Color3(1,1,1);
    scene.gravity = new BABYLON.Vector3(0, -.75, 0); 
    scene.collisionsEnabled = true;
    


    //---------------CAMERAS----------------------------------
    var camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 0, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.attachControl(canvas, true);
    camera.inertia = 0.5;

    //Map Camera, looks at the scene from a birds eye view
    var camera2 = new BABYLON.ArcRotateCamera("Camera2", -Math.PI/2, 0.5, 110, BABYLON.Vector3.Zero(), scene);
    scene.activeCameras = [];
    scene.activeCameras.push(camera);

    //GLSL Shader
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

    //Apply post processing on the map
    var postProcess = new BABYLON.PostProcess("My custom post process", "custom", ["screenSize", "threshold"], null, 0.25, camera2);
    postProcess.onApply = function (effect) {
        effect.setFloat2("screenSize", postProcess.width, postProcess.height);
        effect.setFloat("threshold", 1.0);
    };
    camera2.layerMask = 0;

    //--------------------LIGHTS-----------------------------
    var lightScene1 = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(0, -0.8, 0.4), scene);
    lightScene1.position = new BABYLON.Vector3(0,20,10);
    lightScene1.intensity = 3;
    scene.createDefaultEnvironment({ createSkybox: false, createGround: false });

    //------------------SHADOWS----------------------------------------
    var shadowGenerator = new BABYLON.ShadowGenerator(2048, lightScene1);
    shadowGenerator.usePercentageCloserFiltering = true;
    shadowGenerator.filteringQuality = BABYLON.ShadowGenerator.QUALITY_MEDIUM;

    //-----------------GROUND----------------------------
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width:100, height:100});
    const groundMat = new BABYLON.PBRMaterial("groundMat");
    groundMat.albedoColor = new BABYLON.Color3(150/255, 110/255, 34/255);
    groundMat.metallic = 0.4;
    groundMat.roughness = 1;
    ground.material = groundMat;
    ground.checkCollisions= true;
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.PlaneImpostor, { mass: 0, restitution: 0.5, friction:0.1 }, scene);
    ground.receiveShadows = true;
    ground.layerMask = 1;

    
    //vrHelper.enableInteractions();
    //-----------------WALLS----------------------------
    //To prevent map fall off

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

    //--------------------MAP----------------------------------
    var rt2 = new BABYLON.RenderTargetTexture("depth", 1024, scene, true, true);
    scene.customRenderTargets.push(rt2);
	rt2.activeCamera = camera2;
    rt2.renderList = scene.meshes;

    
    var mon2 = BABYLON.Mesh.CreatePlane("MapPlane", 6, scene);
    mon2.position = new BABYLON.Vector3(0, 0, 10)
    var mon2mat = new BABYLON.StandardMaterial("mapTexturePlane", scene);
    mon2mat.diffuseColor = new BABYLON.Color3(0,1,1);
    mon2mat.diffuseTexture = rt2;
    mon2mat.specularColor = BABYLON.Color3.Black();
    mon2mat.ambientColor = new BABYLON.Color3(0.5,1,0);
    mon2mat.diffuseTexture.uScale = 1/aspectRatio; // zoom
    mon2mat.diffuseTexture.uOffset = 1.215;
    mon2mat.diffuseTexture.level = 1.2; // intensity
    mon2mat.emissiveColor = new BABYLON.Color3(1,1,1); // backlight
	mon2.material = mon2mat;
	mon2.parent = camera;
	mon2.parent = camera;
    mon2.renderingGroupId = 1;;	 
	mon2.edgesWidth = 5.0;
	mon2.edgesColor = new BABYLON.Color4(1, 1, 1, 1);
    mon2.isVisible = false;

    //------------------UI-------------------------------------

    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("MainGameUI");
    
    var button1 = BABYLON.GUI.Button.CreateImageWithCenterTextButton("HintButton","", "assets/ui/Button1.png");
    button1.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    button1.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    button1.width = 0.06;
    button1.height = 0.06*aspectRatio;
    button1.left = -canvas.width+canvas.width/1.05;
    button1.top = canvas.height - canvas.height/1.05;
    button1.thickness = 0; 


    var button2 = BABYLON.GUI.Button.CreateImageWithCenterTextButton("JournalButton","", "assets/ui/Button2.png");
    button2.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    button2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    button2.width = 0.06;
    button2.height = 0.06*aspectRatio;
    button2.left = -canvas.width+canvas.width/1.05;
    button2.top = canvas.height - canvas.height/1.2;
    button2.thickness = 0; 

    var button3 = BABYLON.GUI.Button.CreateImageWithCenterTextButton("MapButton","", "assets/ui/Group 53.png");
    button3.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    button3.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    button3.width = 0.06;
    button3.height = 0.06*aspectRatio;
    button3.left = -canvas.width+canvas.width/1.05;
    button3.top = canvas.height - canvas.height/1.4;
    button3.thickness = 0;
    
    button2.onPointerUpObservable.add(function() {
        console.log(journalVisible);
        if(journalVisible==false){
        journalVisible = true;
        
    }
        else{
        journalVisible = false;
    }
    });

    //Add Hint
    var advancedTextureHint = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("Hint");
    var hintImg = new BABYLON.GUI.Image("but", "assets/ui/paper-tag.png");
    hintImg.top = "-10%"
    hintImg.width = "50%";
    hintImg.height = "50%";
    var textHint = new BABYLON.GUI.TextBlock();
    textHint.text = "Use W, A, S, D to move Up, Down, Left and Right. \n Point towards an item with your cursor and \npress 'E' to interact. \n Press 'F' to replay Hannah's previous dialogue.";
    textHint.color = "black";
    textHint.fontSize = 20;
    textHint.top = "-10%";
    textHint.left = "4%";

    button1.onPointerUpObservable.add(function() {
        if(!showHint){
        console.log("IN");
        advancedTextureHint.addControl(hintImg);
        
        advancedTextureHint.addControl(textHint);
        showHint = true;
    }
        else{
        advancedTextureHint.removeControl(hintImg);
        advancedTextureHint.removeControl(textHint);
        showHint = false;
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

    var buttonMute = BABYLON.GUI.Button.CreateImageWithCenterTextButton("butMute","", "assets/ui/unmute.png");
    
    buttonMute.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    buttonMute.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    buttonMute.width = 0.06;
    buttonMute.height = 0.06*aspectRatio;
    buttonMute.top = canvas.height - canvas.height/1.1;
    buttonMute.thickness = 0;
    var advancedTextureChameleonPic = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("Chameleon");
    var chameleonImg = new BABYLON.GUI.Image("but", "assets/chameleon.png");
    var chameleonImgCircle = new BABYLON.GUI.Image("but", "assets/chameleon_spot.png");
    chameleonImg.top = "-10%"
    chameleonImg.width = "50%";
    chameleonImg.height = "50%";
    chameleonImgCircle.top = "-10%"
    chameleonImgCircle.width = "50%";
    chameleonImgCircle.height = "50%";
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
                    
                    advancedTextureChameleonPic.addControl(chameleonImg);
                    intro7.play();
                    dialogueCounter++;
                    break;
                    case 7: 
                    intro7.stop();
                    advancedTextureChameleonPic.removeControl(chameleonImg);
                    advancedTextureChameleonPic.addControl(chameleonImgCircle);
                    //advancedTextureChameleonPic.isVisible = false;
                    //advancedTextureChameleonPic.dispose();  
                    //chameleonImg.dispose();
                    dispBut.textBlock.text = "I observe that the chameleon skin is green with yellow spots. Now let’s make an inference about the chameleon. An inference is when you use clues and what you know to make a guess about something."
                    intro8.play();
                    dialogueCounter++;
                    break;
                    case 8: 
                    intro8.stop();
                    intro9.play();
                    dispBut.textBlock.text = "I think that the chameleon has green skin with yellow spots to help it blend in or camouflage with its surroundings. This is important, because its skin helps it to hide from animals that may try to harm it!"
                    dialogueCounter++;
                    
                    //advancedTextureChameleonPic.dispose();
                    
                    
                    break;
                    case 9:
                        advancedTextureChameleonPic.removeControl(chameleonImgCircle);
                        advancedTextureChameleonPic.isVisible = false;
                        advancedTexture.removeControl(button4);
                    advancedTexture.removeControl(dispBut);
                    advancedTexture.addControl(button1);
                    advancedTexture.addControl(button2);
                    advancedTexture.addControl(button3);
                    advancedTexture.removeControl(button5);
                    cancelled = true;
                    break;
                        

        }
    });


    button5.onPointerUpObservable.add(function(){
        console.log("In");
        dialogueCounter = 0;
        hannahWaving.setEnabled(true);
        hannahTalking.setEnabled(false);
        advancedTextureChameleonPic.removeControl(chameleonImgCircle);
        advancedTextureChameleonPic.removeControl(chameleonImg);
        advancedTexture.removeControl(button4);
        advancedTexture.removeControl(dispBut);
        advancedTexture.removeControl(button5);
        advancedTexture.addControl(button1);
        advancedTexture.addControl(button2);
        advancedTexture.addControl(button3);
        cancelled = true;
    });

    //---------------PLAYER----------------------------------
    const hero = BABYLON.Mesh.CreateBox('hero', 1.0, scene, false, BABYLON.Mesh.FRONTSIDE);
    hero.position.x = 0.0;
    hero.position.y = 1;
    hero.position.z = -25.0;
    hero.physicsImpostor = new BABYLON.PhysicsImpostor(hero, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0.0, friction: 0.1 }, scene);	
    hero.isPickable = false;	

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
            //var ray = new BABYLON.Ray(camera.position,forward,5);	
            var ray = scene.createPickingRay(scene.pointerX, scene.pointerY, BABYLON.Matrix.Identity(), camera);
            var hit = scene.pickWithRay(ray, function(mesh){
             if(mesh == pickUpR1 || mesh== pickUpR2 || mesh==pickUpR3 || mesh==pickUpR4 || mesh==pickUpR5 || mesh ==pickUpR6 || mesh==pickUpSkull || mesh ==pickUpR1a ||
                mesh ==pickUpR2a || mesh ==pickUpR3a || mesh ==pickUpR4a || mesh ==pickUpR5a || mesh ==pickUpR6a || mesh ==pickUpR1b || mesh ==pickUpR2b || mesh ==pickUpR3b
                || mesh ==pickUpR4b || mesh ==pickUpR5b || mesh ==pickUpR6b || mesh==pickUpSkull2 || mesh==pickUpSkull3 || mesh==hannahWaving) { 
                
                 return true;
                
             }
             return false;
         });
            if(hit.pickedMesh){
                if(hit.pickedMesh==pickUpSkull){
                    if(pickedFossil1){
                        journalVisible = true;
                    } 
                    else{
                    showInfoPanel("1","1");
                    pickedFossil1 = true;
                    pickedUp = false;
                    }
                } 
                else if(hit.pickedMesh==pickUpSkull2){ 
                    if(pickedFossil2){
                        journalVisible2 = true;
                    }
                    else{
                    showInfoPanel("2","2");
                    pickedFossil2 = true;
                    pickedUp = false;
                    }

                } 
                else if(hit.pickedMesh==pickUpSkull3){ 
                    if(pickedFossil3){
                        journalVisible1= true;
                    }
                    else{
                    showInfoPanel("3","3");
                    pickedUp = false;
                    pickedFossil3 = true;
                    } 
                }
                else if(hit.pickedMesh == hannahWaving){
                    console.log("Inside Hannah");
                    cancelled = false;
                }
                else {
                    hit.pickedMesh.physicsImpostor.sleep();
                    currMesh = hit.pickedMesh;
                    startingPoint = currMesh.position;
                    pickedUp = true;
                }
                console.log(hit.pickedMesh.name);
                //hl.addMesh(currMesh.subMeshes[0].getRenderingMesh(), BABYLON.Color3.Green());       
            }
        }

	};

    scene.onPointerMove = function(evt){
        if(currMesh){
        const cameraForwardRay = camera.getForwardRay();       
        var forward = cameraForwardRay.direction.normalize();
        forward = forward.scale(2.5);
        currMesh.position = camera.position.add(forward);
        startingPoint = currMesh.position;
        }
    };

    //------------- FOSSIL FOUND PANEL ----------------------------------
    
    var advancedTextureInfo = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI2");
    var mon3 = new BABYLON.GUI.Image("but", "assets/ui/Group68.png");
    mon3.width = "75%";
    mon3.height = "75%";
    
    function showInfoPanel(fosNum, mountNum){
    camera.detachControl();
    advancedTexture.removeControl(button1);
    advancedTexture.removeControl(button2);
    advancedTexture.removeControl(button3);
    console.log("Inside Info Panel",fosNum);
    mon3.isVisible = true;

    var text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Fossil ID:\tFossil " + fosNum + "\n\nLocation: \tAshara Desert, Mountain " + mountNum + "\n\nFound by: \t Jessica Roberts";
    text1.color = "black";
    text1.fontSize = 20;
    text1.top = "8%";
    text1.left = "19%";
    

    var buttonSend = BABYLON.GUI.Button.CreateImageWithCenterTextButton("but2","", "assets/ui/Group13.png");
    buttonSend.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    buttonSend.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    buttonSend.width = 0.23;
    buttonSend.height = 0.1;
    buttonSend.top = "28%";
    buttonSend.left="20%";
    buttonSend.thickness = 0;
    buttonSend.cornerRadius = 5;

    buttonSend.onPointerUpObservable.add(function() {
    advancedTexture.addControl(button1);
    advancedTexture.addControl(button2);
    advancedTexture.addControl(button3);
        camera.attachControl(canvas,true);
        text1.isVisible = false;
        buttonSend.isVisible = false;
        if(fosNum=="1")
        pickUpSkull.position = new BABYLON.Vector3(-23,1,7);
        if(fosNum=="2")
        pickUpSkull2.position = new BABYLON.Vector3(-19.7,1.25,7);
        if(fosNum=="3")
        pickUpSkull3.position = new BABYLON.Vector3(-23.5,0.95,5);
        advancedTextureInfo.removeControl(mon3);
        advancedTextureInfo.removeControl(text1);
        advancedTextureInfo.removeControl(buttonSend);
    });
    
    advancedTextureInfo.addControl(mon3);
    advancedTextureInfo.addControl(text1);
    advancedTextureInfo.addControl(buttonSend);
    
    }



    // -------------------------------FLAG -------------------------
    BABYLON.SceneLoader.ImportMeshAsync("", "", "assets/1_flag.glb").then((result) => {
            result.meshes[0].position.x = 5;
            result.meshes[0].position.z = -15;   
            result.meshes[0].rotation.y = Math.PI/4;
            result.meshes.forEach(function (mesh) {
                shadowGenerator.getShadowMap().renderList.push(mesh);
            });
            result.meshes[0].isPickable = true;
            flag2 = result.meshes[0].clone("flag2");
            flag2.setParent(null);
            flag3 = result.meshes[0].clone("flag3");
            flag3.setParent(null);
            flag2.position = new BABYLON.Vector3(-15.1,0,-20);
            flag3.position = new BABYLON.Vector3(18.1,0,-4.9);
    });




    //----------------------------TENT-----------------------------------

    BABYLON.SceneLoader.ImportMeshAsync("", "", "assets/3_tent.glb").then((result) => {
        result.meshes[0].position.z = 6;
        result.meshes[0].position.x = 5;
        result.meshes[0].scaling = new BABYLON.Vector3(2.5, 2.5, -2.5);

        result.meshes[0].rotationQuaternion = null;
        result.meshes[0].rotate.y =Math.PI/2;    
        result.meshes[0].getChildMeshes().forEach((m)=>{
            m.isPickable = false;
            shadowGenerator.getShadowMap().renderList.push(m);
        });
    });


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


        pickUpR1a = rock07.clone("pickUpR7");
        pickUpR1a.setParent(null);
        pickUpR2a = rock07.clone("pickUpR8");
        pickUpR2a.setParent(null);
        pickUpR3a = rock07.clone("pickUpR9");
        pickUpR3a.setParent(null);
        pickUpR4a = rock07.clone("pickUpR10");
        pickUpR4a.setParent(null);
        pickUpR5a = rock07.clone("pickUpR11");
        pickUpR5a.setParent(null);
        pickUpR6a = rock07.clone("pickUpR12");
        pickUpR6a.setParent(null);

        pickUpR1a.isVisible = true;
        pickUpR2a.isVisible = true;
        pickUpR3a.isVisible = true;
        pickUpR4a.isVisible = true;
        pickUpR5a.isVisible = true;
        pickUpR6a.isVisible = true;        

        pickUpR1a.applyGravity = true;
        pickUpR2a.applyGravity = true;
        pickUpR3a.applyGravity = true;
        pickUpR4a.applyGravity = true;
        pickUpR5a.applyGravity = true;
        pickUpR6a.applyGravity = true;

        pickUpR1a.scaling = new BABYLON.Vector3(0.3,0.5,0.15);
        pickUpR2a.scaling = new BABYLON.Vector3(0.25,0.6,0.17);
        pickUpR3a.scaling = new BABYLON.Vector3(0.42,0.42,0.1);
        pickUpR4a.scaling = new BABYLON.Vector3(0.44,0.5,0.15);
        pickUpR5a.scaling = new BABYLON.Vector3(0.39,0.4,0.13);
        pickUpR6a.scaling = new BABYLON.Vector3(0.4,0.5,0.19);

        pickUpR1a.position = new BABYLON.Vector3(-15,1,-20.1);
        pickUpR2a.position = new BABYLON.Vector3(-15.1,1,-19.6);
        pickUpR3a.position = new BABYLON.Vector3(-15.2,1,-20.4);
        pickUpR4a.position = new BABYLON.Vector3(-14.8,1,-19.5);
        pickUpR5a.position = new BABYLON.Vector3(-14.9,1,-20.6);
        pickUpR6a.position = new BABYLON.Vector3(-15.4,1,-19.8);

        pickUpR1a.physicsImpostor = new BABYLON.PhysicsImpostor(pickUpR1a, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 1, restitution: 0, friction: 0.1 }, scene);	
        pickUpR2a.physicsImpostor = new BABYLON.PhysicsImpostor(pickUpR2a, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 1, restitution: 0, friction: 0.1 }, scene);	
        pickUpR3a.physicsImpostor = new BABYLON.PhysicsImpostor(pickUpR3a, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 1, restitution: 0, friction: 0.1 }, scene);	
        pickUpR4a.physicsImpostor = new BABYLON.PhysicsImpostor(pickUpR4a, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 1, restitution: 0, friction: 0.1 }, scene);	
        pickUpR5a.physicsImpostor = new BABYLON.PhysicsImpostor(pickUpR5a, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 1, restitution: 0, friction: 0.1 }, scene);	
        pickUpR6a.physicsImpostor = new BABYLON.PhysicsImpostor(pickUpR6a, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 1, restitution: 0, friction: 0.1 }, scene);	

        pickUpR1b = rock07.clone("pickUpR7");
        pickUpR1b.setParent(null);
        pickUpR2b = rock07.clone("pickUpR8");
        pickUpR2b.setParent(null);
        pickUpR3b = rock07.clone("pickUpR9");
        pickUpR3b.setParent(null);
        pickUpR4b = rock07.clone("pickUpR10");
        pickUpR4b.setParent(null);
        pickUpR5b = rock07.clone("pickUpR11");
        pickUpR5b.setParent(null);
        pickUpR6b = rock07.clone("pickUpR12");
        pickUpR6b.setParent(null);

        pickUpR1b.isVisible = true;
        pickUpR2b.isVisible = true;
        pickUpR3b.isVisible = true;
        pickUpR4b.isVisible = true;
        pickUpR5b.isVisible = true;
        pickUpR6b.isVisible = true;        

        pickUpR1b.applyGravity = true;
        pickUpR2b.applyGravity = true;
        pickUpR3b.applyGravity = true;
        pickUpR4b.applyGravity = true;
        pickUpR5b.applyGravity = true;
        pickUpR6b.applyGravity = true;

        pickUpR1b.scaling = new BABYLON.Vector3(0.3,0.5,0.15);
        pickUpR2b.scaling = new BABYLON.Vector3(0.25,0.6,0.17);
        pickUpR3b.scaling = new BABYLON.Vector3(0.42,0.42,0.1);
        pickUpR4b.scaling = new BABYLON.Vector3(0.44,0.5,0.15);
        pickUpR5b.scaling = new BABYLON.Vector3(0.39,0.4,0.13);
        pickUpR6b.scaling = new BABYLON.Vector3(0.4,0.5,0.19);

        pickUpR1b.position = new BABYLON.Vector3(18.2,1,-5.1);
        pickUpR2b.position = new BABYLON.Vector3(18,1,-5.3);
        pickUpR3b.position = new BABYLON.Vector3(17.8,1,-5.0);
        pickUpR4b.position = new BABYLON.Vector3(18.3,1,-4.8);
        pickUpR5b.position = new BABYLON.Vector3(18.4,1,-4.6);
        pickUpR6b.position = new BABYLON.Vector3(18.1,1,-4.3);

        pickUpR1b.physicsImpostor = new BABYLON.PhysicsImpostor(pickUpR1b, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 1, restitution: 0, friction: 0.1 }, scene);	
        pickUpR2b.physicsImpostor = new BABYLON.PhysicsImpostor(pickUpR2b, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 1, restitution: 0, friction: 0.1 }, scene);	
        pickUpR3b.physicsImpostor = new BABYLON.PhysicsImpostor(pickUpR3b, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 1, restitution: 0, friction: 0.1 }, scene);	
        pickUpR4b.physicsImpostor = new BABYLON.PhysicsImpostor(pickUpR4b, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 1, restitution: 0, friction: 0.1 }, scene);	
        pickUpR5b.physicsImpostor = new BABYLON.PhysicsImpostor(pickUpR5b, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 1, restitution: 0, friction: 0.1 }, scene);	
        pickUpR6b.physicsImpostor = new BABYLON.PhysicsImpostor(pickUpR6b, BABYLON.PhysicsImpostor.MeshImpostor, { mass: 1, restitution: 0, friction: 0.1 }, scene);	



    });

     //-----HANNAH WAVING ----
     BABYLON.SceneLoader.ImportMeshAsync("", "", "assets/ui/waving.glb").then((result) => {
        result.meshes[0].position.z = 4;
        result.meshes[0].position.x = 7;
        result.meshes[0].isPickable = false;

        result.meshes[0].rotationQuaternion = null;
        result.meshes[0].rotate.y =Math.PI/2;   
        hannah = result.meshes[0].position; 
        //result.setEnabled = false;
        hannahWaving = scene.getTransformNodeByName("Kira");
        hannahWaving.name = "KiraWAving";
        console.log(hannahWaving);
        hannahWaving.setEnabled(true);
    });

    BABYLON.SceneLoader.ImportMeshAsync("", "", "assets/ui/talking.glb").then((result) => {
        result.meshes[0].position.z = 4;
        result.meshes[0].position.x = 7;
        result.meshes[0].isPickable = false;

        result.meshes[0].rotationQuaternion = null;
        result.meshes[0].rotate.y =Math.PI/2;   
        hannahTalking = scene.getTransformNodeByName("Kira");
        hannahTalking.name = "KiraTalking";
        console.log(hannahTalking);
        hannahTalking.setEnabled(false);
        //hannahTalking.setEnabled = false; 
    });

    // ------ DESERT PLANTS --------
    BABYLON.SceneLoader.ImportMeshAsync("", "", "assets/pal.glb").then((result) => {
        result.meshes[0].scaling = new BABYLON.Vector3(0.7, 0.7, -0.6);
        result.meshes[0].position.x = 2;
        result.meshes[0].position.z = 4.85;
        result.meshes[0].position.y = 0.3;
        result.meshes[0].isPickable = false;
        var fossil = scene.getMeshByName("13637_Triceratops_Skull_Fossil_v1_L2");
        var fossil1 = scene.getMeshByName("13634_AmmoniteFossil_v1_l2");
        var fossil2 = scene.getMeshByName("13638_Tyrannosaurus_Rex_Skull_Fossil_v1_L1");
        fossil.checkCollisions = true;

        fossil.position.x = 27.8;
        fossil.position.y = -0.5;
        fossil.position.z = -5.3;
        pickUpSkull = fossil;
        pickUpSkull.setParent(null);
        pickUpSkull.position = new BABYLON.Vector3(5.2,0,-15)
        pickUpSkull.applyGravity = true;

        pickUpSkull2 = fossil1;
        pickUpSkull2.setParent(null);
        pickUpSkull2.position = new BABYLON.Vector3(-15.2,0.3,-20)
        pickUpSkull2.applyGravity = true;

        pickUpSkull3 = fossil2;
        pickUpSkull3.setParent(null);
        pickUpSkull3.position = new BABYLON.Vector3(18.2,0,-5)
        pickUpSkull2.rotation = new BABYLON.Vector3(1.7,0, 1.7);
        pickUpSkull3.applyGravity = true;
        
        result.meshes[0].rotationQuaternion = null;
        result.meshes[0].rotate(BABYLON.Vector3.Up(),Math.PI/2);    
    });
    
    journalInputs = [];
    scene.onBeforeRenderObservable.add(function () {
        diff = 11.5;
		if(!cancelled && hannah && BABYLON.Vector3.Distance(new BABYLON.Vector3(7,0,4),camera.position)<10){
            //Add talking hannah model here
            hannahWaving.setEnabled(false);
            hannahTalking.setEnabled(true);
            advancedTexture.removeControl(button1);
            advancedTexture.removeControl(button2);
            advancedTexture.removeControl(button3);
            
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
        
        if(cancelled){
            dialogueCounter = 0;
            advancedTexture.removeControl(button4);
            advancedTexture.removeControl(dispBut);
            hannahWaving.setEnabled(true);
            hannahTalking.setEnabled(false);
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
                case "f":
                case "F":
                cancelled = false;                
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

    buttonMute.onPointerUpObservable.add(function(){
        if(!muteScene1){
        console.log("In");
        globalVolumeScene1 = BABYLON.Engine.audioEngine.getGlobalVolume();
        buttonMute.children[0].source = "assets/ui/mute.png";
        BABYLON.Engine.audioEngine.setGlobalVolume(0);
        muteScene1 = true;
        }
        else{
          
            BABYLON.Engine.audioEngine.setGlobalVolume(1);
            buttonMute.children[0].source = "assets/ui/unmute.png";
            muteScene1 = false;
        }
    });

    advancedTexture.addControl(button1); 
    advancedTexture.addControl(button2); 
    advancedTexture.addControl(button3);
    advancedTexture.addControl(buttonMute);

    return scene;
}

const createScene1 = () => {
    
    //Inititalize scene with lights and camera (also change cursor)
    const scene1 = new BABYLON.Scene(engine);
    var camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 0, -10), scene1);
    camera.setTarget(BABYLON.Vector3.Zero());
    camera.inertia = 0.5;
    var aspectRatio = screen.width/screen.height;
    var light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), scene1);
    light.intensity = 2.4;
    document.getElementById('canvas_div_no_cursor').style.cursor = "url(\"assets/cc.svg\"), auto";

    //Add plane to use as the background
    const plane = BABYLON.MeshBuilder.CreatePlane("plane", {height:10, width: 20},scene1);
    var material = new BABYLON.StandardMaterial("texture1", scene1);
    material.diffuseTexture = new BABYLON.Texture("assets/BackgroundStart.png ", scene1);
    material.diffuseTexture.uScale = 1.0;
    material.diffuseTexture.vScale = 1.0;
    plane.material = material;
    
    
    //Add button
    var advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("StartScreenUI");

    //Start button
    var button1 = BABYLON.GUI.Button.CreateImageWithCenterTextButton("StartButton","", "assets/ui/StartButton.png");
    button1.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_CENTER;
    button1.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    button1.width = 0.12;
    button1.height = 0.08;
    button1.top = canvas.height - canvas.height/1.2;
    button1.thickness = 0;
    button1.cornerRadius = 5;

    //Settings Button
    var button2 = BABYLON.GUI.Button.CreateImageWithCenterTextButton("Settings","", "assets/ui/Button1.png");
    button2.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_RIGHT;
    button2.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    button2.width = 0.06;
    button2.height = 0.06*aspectRatio;
    button2.left = -canvas.width+canvas.width/1.05;
    button2.top = canvas.height - canvas.height/1.1;
    button2.thickness = 0;
    
    //Mute button
    var buttonMute1 = BABYLON.GUI.Button.CreateImageWithCenterTextButton("MuteButton","", "assets/ui/unmute.png");
    
    buttonMute1.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    buttonMute1.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_TOP;
    buttonMute1.width = 0.06;
    buttonMute1.height = 0.06*aspectRatio;
    buttonMute1.top = canvas.height - canvas.height/1.1;
    buttonMute1.thickness = 0;

    //Add buttons to texture
    advancedTexture.addControl(button1); 
    advancedTexture.addControl(buttonMute1);

    //Start button observable
    button1.onPointerUpObservable.add(function() {
        playGame = true;
        engine.displayLoadingUI();

    setTimeout(function(){
        engine.hideLoadingUI();
    },5000);
    });

    //Mute button observable
    buttonMute1.onPointerUpObservable.add(function(){
        if(!muteScene0){
            globalVolumeScene0 = BABYLON.Engine.audioEngine.getGlobalVolume(0);
            BABYLON.Engine.audioEngine.setGlobalVolume(0);
            buttonMute1.children[0].source = "assets/ui/mute.png";
            muteScene0 = true;
        }
        else{
            BABYLON.Engine.audioEngine.setGlobalVolume(globalVolumeScene0);
            buttonMute1.children[0].source = "assets/ui/unmute.png";
            muteScene0 = false;
        }
    });

    return scene1;
}

const createSceneJournal = function() {
    
    //Scene variables - self explanatory
    var lineSpacingInputs = 12;
    var pointsOfInterest = [];
    var pinMeshInfo = [];
    var meshLen = 0;
    var triceraSkull;
    var observations = [];
    var inferences = [];
    var keys = [];

    //Initialize scene lights and camera
	var scene = new BABYLON.Scene(engine);
    //var vrHelper = scene.createDefaultVRExperience({createDeviceOrientationCamera:false, useXR: true});
    scene.clearColor = new BABYLON.Color3(0.96, 0.76, 0.23);
	var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 3, new BABYLON.Vector3(3,0,4), scene);
	camera.attachControl(canvas, true);
    camera.setTarget(new BABYLON.Vector3.Zero());
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    camera.lowerRadiusLimit = 0.1;
    camera.wheelPrecision = 15;
    light.intensity = 0.7;

    BABYLON.SceneLoader.ImportMeshAsync("", "", "assets/tricera.glb").then((result) => {});


    window.addEventListener('dblclick', function() { 
        var pickResult = scene.pick(scene.pointerX, scene.pointerY);        
                //Put null check maybe?
                if(pickResult.pickedMesh.name=="13637_Triceratops_Skull_Fossil_v1_L2"){
                var mat = new BABYLON.StandardMaterial('mat1', scene);
                mat.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());

                var sphere = BABYLON.MeshBuilder.CreateSphere(
                'sphere1',
                { diameter: 2, segments: 16 },
                scene
                );
                sphere.material = mat;
                sphere.position.y = 3;

                var cube = BABYLON.MeshBuilder.CreateBox(
                'cube',
                { size: 0.5, height: 3 },
                scene
                );
                cube.position = new BABYLON.Vector3(0, 1.5, 0);
                cube.material = mat;

                var mesh = BABYLON.Mesh.MergeMeshes([sphere, cube]);
                mesh.scaling = new BABYLON.Vector3(0.05,0.05,0.05);       
                pointsOfInterest.push(mat.diffuseColor);
                mesh.position = pickResult.pickedPoint;
                                
                var axis1 = pickResult.getNormal();							        		
                var axis2 = BABYLON.Vector3.Up();
                var axis3 = BABYLON.Vector3.Up();
                var start = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, 0);				

                BABYLON.Vector3.CrossToRef(start, axis1, axis2);
                BABYLON.Vector3.CrossToRef(axis2, axis1, axis3);
                var tmpVec = BABYLON.Vector3.RotationFromAxis(axis3.negate(), axis1, axis2);
                var quat = BABYLON.Quaternion.RotationYawPitchRoll(tmpVec.y, tmpVec.x, tmpVec.z);
                if (pickResult.pickedMesh.rotationQuaternion)
                            mesh.rotationQuaternion = pickResult.pickedMesh.rotationQuaternion.multiply(quat);
                        else
                            mesh.rotationQuaternion = quat;
                //mesh.rotationQuaternion = quat;
                pinMeshInfo.push(mesh);
                console.log(pinMeshInfo);
                //Stores pin count
                meshLen++;

                var checkbox = new BABYLON.GUI.Checkbox();
                checkbox.top = ""+lineSpacingInputs+ "%";
                checkbox.left ="-7.5%";
                checkbox.width = "20px";
                checkbox.height = "20px";
                checkbox.isChecked = true;
                checkbox.color = pointsOfInterest[meshLen-1].toHexString();

                var input32 = new BABYLON.GUI.InputText();
                input32.width = 0.18;
                input32.maxWidth = 0.18;
                input32.height = "28px";
                input32.top = ""+lineSpacingInputs+ "%";
                input32.left = "3.7%";
                input32.text = "";
                input32.color = "white";
                input32.background = "#e8b172";
                input32.thickness = 2;
                input32.isVisible = true;
                
                var input3 = new BABYLON.GUI.InputText();
                input3.width = 0.18;
                input3.maxWidth = 0.18;
                input3.height = "28px";
                input3.top = ""+lineSpacingInputs+ "%";
                input3.left = "22.25%";
                input3.text = "";
                input3.color = "white";
                input3.background = "#e8b172";
                input3.thickness = 2;
                input3.isVisible = true;
                lineSpacingInputs+=5;

                observations.push(input32);
                inferences.push(input3);
                keys.push(checkbox);

                advancedTextureJournal.addControl(input3);
                advancedTextureJournal.addControl(input32);
                advancedTextureJournal.addControl(checkbox);
                }
    });
    scene.onPointerObservable.add((pointerInfo) => {      		
        

        switch (pointerInfo.type) {

			case BABYLON.PointerEventTypes.POINTERDOWN:
                //pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh != ground
				if(pointerInfo.event.button == 2) {
                    var pickResult = scene.pick(scene.pointerX, scene.pointerY); 
                    console.log(pickResult.pickedMesh.uniqueId);
                    for(let i=0;i<pinMeshInfo.length;i++){
                        console.log(pinMeshInfo[i].uniqueId + " " + pickResult.pickedMesh.uniqueId);
                        if(pinMeshInfo[i].uniqueId==pickResult.pickedMesh.uniqueId){
                            for(let i =0;i<pointsOfInterest.length;i++){
                                console.log("First loop run:" + i);
                                advancedTextureJournal.removeControl(observations[i]);
                                advancedTextureJournal.removeControl(inferences[i]);
                                advancedTextureJournal.removeControl(keys[i]);
                            }
                            pinMeshInfo[i].dispose();
                            lineSpacingInputs = 12;
                            pinMeshInfo.splice(i,1);
                            //console.log(observations.length);
                            pointsOfInterest.splice(i,1);
                            keys.splice(i,1);
                            observations.splice(i,1);
                            inferences.splice(i,1);
                            meshLen=0;
                            console.log(pointsOfInterest.length);
                            observations = [];
                            inferences = [];
                            keys = [];
                            for(let i =0;i<pointsOfInterest.length;i++){
                                console.log("Second Loop run:" + i);
                                var checkbox = new BABYLON.GUI.Checkbox();
                                checkbox.top = ""+lineSpacingInputs+ "%";
                                checkbox.left ="-7.5%";
                                checkbox.width = "20px";
                                checkbox.height = "20px";
                                checkbox.isChecked = true;
                                checkbox.color = pointsOfInterest[i].toHexString();

                                var input32 = new BABYLON.GUI.InputText();
                                input32.width = 0.18;
                                input32.maxWidth = 0.18;
                                input32.height = "28px";
                                input32.top = ""+lineSpacingInputs+ "%";
                                input32.left = "3.7%";
                                input32.text = "";
                                input32.color = "white";
                                input32.background = "#e8b172";
                                input32.thickness = 2;
                                input32.isVisible = true;
                                
                                var input3 = new BABYLON.GUI.InputText();
                                input3.width = 0.18;
                                input3.maxWidth = 0.18;
                                input3.height = "28px";
                                input3.top = ""+lineSpacingInputs+ "%";
                                input3.left = "22.25%";
                                input3.text = "";
                                input3.color = "white";
                                input3.background = "#e8b172";
                                input3.thickness = 2;
                                input3.isVisible = true;
                                lineSpacingInputs+=5;
                                observations.push(input32);
                                inferences.push(input3);
                                keys.push(checkbox);
                                meshLen++;

                                advancedTextureJournal.addControl(input3);
                                advancedTextureJournal.addControl(input32);
                                advancedTextureJournal.addControl(checkbox);
                            }
                            
                        }
                    }
                   
                }
				break;
        }
    });

    
    var layer = new BABYLON.Layer('','assets/ui/Group137.png', scene, true);
    var advancedTextureJournal = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UIJ",scene);

    var textHint = new BABYLON.GUI.TextBlock();
    textHint.text = "Double click on a point of interest to add a pin. \n Drag using left mouse button to rotate. \n Scroll to zoom in and out.";
    textHint.color = "black";
    textHint.fontSize = "2.5%";
    textHint.top = "-26%";
    textHint.left = "20%";
    
    var text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Fossil ID:\tFossil " + 1 + "\n\nLocation: \tAshara Desert, Mountain " + 1 + "\n\nFound by: \t Jessica Roberts";
    text1.color = "black";
    text1.fontSize = "1%";
    text1.top = "-7%";
    text1.left = "25%";

    var button1 = BABYLON.GUI.Button.CreateImageWithCenterTextButton("but","", "assets/ui/DoneButton.png");
    button1.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    button1.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    button1.width = 0.15;
    button1.height = 0.08;
    button1.left = "18%";
    button1.top = "35%";
    button1.thickness = 0; 

    var buttonUp = BABYLON.GUI.Button.CreateImageWithCenterTextButton("but","", "assets/ui/buttonUp.png");
    buttonUp.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    buttonUp.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    buttonUp.width = 0.02;
    buttonUp.height = 0.08;
    buttonUp.left = "24%";
    buttonUp.top = "12%";
    buttonUp.thickness = 0; 

    var buttonDown = BABYLON.GUI.Button.CreateImageWithCenterTextButton("but","", "assets/ui/buttonDown.png");
    buttonDown.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    buttonDown.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    buttonDown.width = 0.02;
    buttonDown.height = 0.08;
    buttonDown.left = "24%";
    buttonDown.top = "22%";
    buttonDown.thickness = 0;

    //Goes back to the previous scene
    button1.onPointerUpObservable.add(function(){
        journalVisible = false;
        console.log("j:" + journalVisible + "j1:" + journalVisible1 + "j2:" + journalVisible2);
        // for(let i = 0; i < pointsOfInterest.length; i++) {
        //     triceraResults.push({
        //        observations: observations[i],
        //        inferences: inferences[i],
        //        keys: keys[i]
        //     });

        //  }
        triceraResults.push(
            {
                observations: observations,
                inferences: inferences,
                keys:keys,
                pinMeshInfo: pinMeshInfo
            }
        );
         console.log(triceraResults);
        //  var jsonData = JSON.stringify(observations, function(key, val) {
        //     if (val != null && typeof val == "object") {
        //          if (seen.indexOf(val) >= 0) {
        //              return;
        //          }
        //          seen.push(val);
        //      }
        //      return val;
        //  });
        //  var a = document.createElement('a');
        //  a.setAttribute('href', 'data:text/plain;charset=utf-8,'+encodeURIComponent(jsonData));
        //  a.setAttribute('download', "download.txt");
        //  a.click()
        //SAVE JSON ON FILE^
    });

    

    buttonUp.onPointerUpObservable.add(function(){
        console.log("Journal1");
            journalVisible2 = true;
            journalVisible = false;
    });

    buttonDown.onPointerUpObservable.add(function(){
        console.log("Journal1");
            journalVisible1 = true;
            journalVisible = false;
        
    });

    advancedTextureJournal.addControl(button1);
    advancedTextureJournal.addControl(textHint);
    advancedTextureJournal.addControl(text1);
    advancedTextureJournal.addControl(buttonUp);
    advancedTextureJournal.addControl(buttonDown);
	return scene;
};

const createSceneJournal1 = function() {
    
    //Scene variables - self explanatory
    var lineSpacingInputs = 12;
    var pointsOfInterest = [];
    var pinMeshInfo = [];
    var meshLen = 0;
    var triceraSkull;
    var observations = [];
    var inferences = [];
    var keys = [];

    //Initialize scene lights and camera
	var scene = new BABYLON.Scene(engine);
    //var vrHelper = scene.createDefaultVRExperience({createDeviceOrientationCamera:false, useXR: true});
    scene.clearColor = new BABYLON.Color3(0.96, 0.76, 0.23);
	var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 3, new BABYLON.Vector3(3,0,4), scene);
	camera.attachControl(canvas, true);
    camera.setTarget(new BABYLON.Vector3.Zero());
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    camera.lowerRadiusLimit = 0.1;
    camera.wheelPrecision = 15;
    light.intensity = 0.7;

    BABYLON.SceneLoader.ImportMeshAsync("", "", "assets/trex.glb").then((result) => {});

    window.addEventListener('dblclick', function() { 
        var pickResult = scene.pick(scene.pointerX, scene.pointerY);        
                //Put null check maybe?
                if(pickResult.pickedMesh.name=="13638_Tyrannosaurus_Rex_Skull_Fossil_v1_L1"){
                var mat = new BABYLON.StandardMaterial('mat1', scene);
                mat.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());

                var sphere = BABYLON.MeshBuilder.CreateSphere(
                'sphere1',
                { diameter: 2, segments: 16 },
                scene
                );
                sphere.material = mat;
                sphere.position.y = 3;

                var cube = BABYLON.MeshBuilder.CreateBox(
                'cube',
                { size: 0.5, height: 3 },
                scene
                );
                cube.position = new BABYLON.Vector3(0, 1.5, 0);
                cube.material = mat;

                var mesh = BABYLON.Mesh.MergeMeshes([sphere, cube]);
                mesh.scaling = new BABYLON.Vector3(0.05,0.05,0.05);       
                pointsOfInterest.push(mat.diffuseColor);
                mesh.position = pickResult.pickedPoint;
                                
                var axis1 = pickResult.getNormal();							        		
                var axis2 = BABYLON.Vector3.Up();
                var axis3 = BABYLON.Vector3.Up();
                var start = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, 0);				

                BABYLON.Vector3.CrossToRef(start, axis1, axis2);
                BABYLON.Vector3.CrossToRef(axis2, axis1, axis3);
                var tmpVec = BABYLON.Vector3.RotationFromAxis(axis3.negate(), axis1, axis2);
                var quat = BABYLON.Quaternion.RotationYawPitchRoll(tmpVec.y, tmpVec.x, tmpVec.z);
                if (pickResult.pickedMesh.rotationQuaternion)
                            mesh.rotationQuaternion = pickResult.pickedMesh.rotationQuaternion.multiply(quat);
                        else
                            mesh.rotationQuaternion = quat;
                //mesh.rotationQuaternion = quat;
                pinMeshInfo.push(mesh);
                console.log(pinMeshInfo);
                //Stores pin count
                meshLen++;

                var checkbox = new BABYLON.GUI.Checkbox();
                checkbox.top = ""+lineSpacingInputs+ "%";
                checkbox.left ="-7.5%";
                checkbox.width = "20px";
                checkbox.height = "20px";
                checkbox.isChecked = true;
                checkbox.color = pointsOfInterest[meshLen-1].toHexString();

                var input32 = new BABYLON.GUI.InputText();
                input32.width = 0.18;
                input32.maxWidth = 0.18;
                input32.height = "28px";
                input32.top = ""+lineSpacingInputs+ "%";
                input32.left = "3.7%";
                input32.text = "";
                input32.color = "white";
                input32.background = "#e8b172";
                input32.thickness = 2;
                input32.isVisible = true;
                
                var input3 = new BABYLON.GUI.InputText();
                input3.width = 0.18;
                input3.maxWidth = 0.18;
                input3.height = "28px";
                input3.top = ""+lineSpacingInputs+ "%";
                input3.left = "22.25%";
                input3.text = "";
                input3.color = "white";
                input3.background = "#e8b172";
                input3.thickness = 2;
                input3.isVisible = true;
                lineSpacingInputs+=4.5;

                observations.push(input32);
                inferences.push(input3);
                keys.push(checkbox);

                advancedTextureJournal1.addControl(input3);
                advancedTextureJournal1.addControl(input32);
                advancedTextureJournal1.addControl(checkbox);
                }
    });

    scene.onPointerObservable.add((pointerInfo) => {      		
        

        switch (pointerInfo.type) {

			case BABYLON.PointerEventTypes.POINTERDOWN:
                //pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh != ground
				if(pointerInfo.event.button == 2) {
                    var pickResult = scene.pick(scene.pointerX, scene.pointerY); 
                    console.log(pickResult.pickedMesh.uniqueId);
                    for(let i=0;i<pinMeshInfo.length;i++){
                        console.log(pinMeshInfo[i].uniqueId + " " + pickResult.pickedMesh.uniqueId);
                        if(pinMeshInfo[i].uniqueId==pickResult.pickedMesh.uniqueId){
                            for(let i =0;i<pointsOfInterest.length;i++){
                                console.log("First loop run:" + i);
                                advancedTextureJournal1.removeControl(observations[i]);
                                advancedTextureJournal1.removeControl(inferences[i]);
                                advancedTextureJournal1.removeControl(keys[i]);
                            }
                            pinMeshInfo[i].dispose();
                            lineSpacingInputs = 12
                            pinMeshInfo.splice(i,1);
                            //console.log(observations.length);
                            pointsOfInterest.splice(i,1);
                            keys.splice(i,1);
                            observations.splice(i,1);
                            inferences.splice(i,1);
                            meshLen=0;
                            console.log(pointsOfInterest.length);
                            observations = [];
                            inferences = [];
                            keys = [];
                            for(let i =0;i<pointsOfInterest.length;i++){
                                console.log("Second Loop run:" + i);
                                var checkbox = new BABYLON.GUI.Checkbox();
                                checkbox.top = ""+lineSpacingInputs+ "%";
                                checkbox.left ="-7.5%";
                                checkbox.width = "20px";
                                checkbox.height = "20px";
                                checkbox.isChecked = true;
                                checkbox.color = pointsOfInterest[i].toHexString();

                                var input32 = new BABYLON.GUI.InputText();
                                input32.width = 0.18;
                                input32.maxWidth = 0.18;
                                input32.height = "28px";
                                input32.top = ""+lineSpacingInputs+ "%";
                                input32.left = "3.7%";
                                input32.text = "";
                                input32.color = "white";
                                input32.background = "#e8b172";
                                input32.thickness = 2;
                                input32.isVisible = true;
                                
                                var input3 = new BABYLON.GUI.InputText();
                                input3.width = 0.18;
                                input3.maxWidth = 0.18;
                                input3.height = "28px";
                                input3.top = ""+lineSpacingInputs+ "%";
                                input3.left = "22.25%";
                                input3.text = "";
                                input3.color = "white";
                                input3.background = "#e8b172";
                                input3.thickness = 2;
                                input3.isVisible = true;
                                lineSpacingInputs+=5;
                                observations.push(input32);
                                inferences.push(input3);
                                keys.push(checkbox);
                                meshLen++;

                                advancedTextureJournal1.addControl(input3);
                                advancedTextureJournal1.addControl(input32);
                                advancedTextureJournal1.addControl(checkbox);
                            }
                            
                        }
                    }
                   
                }
				break;
        }
    });

    
    var layer = new BABYLON.Layer('','assets/ui/Group137.png', scene, true);
    var advancedTextureJournal1 = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UIJ",scene);

    var textHint = new BABYLON.GUI.TextBlock();
    textHint.text = "Double click on a point of interest to add a pin. \n Drag using left mouse button to rotate. \n Scroll to zoom in and out.";
    textHint.color = "black";
    textHint.fontSize = "2.5%";
    textHint.top = "-26%";
    textHint.left = "20%";
    
    var text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Fossil ID:\tFossil " + 3 + "\n\nLocation: \tAshara Desert, Mountain " + 3 + "\n\nFound by: \t Jessica Roberts";
    text1.color = "black";
    text1.fontSize = "1%";
    text1.top = "-7%";
    text1.left = "25%";

    var button1 = BABYLON.GUI.Button.CreateImageWithCenterTextButton("but","", "assets/ui/DoneButton.png");
    button1.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    button1.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    button1.width = 0.15;
    button1.height = 0.08;
    button1.left = "18%";
    button1.top = "35%";
    button1.thickness = 0; 

    var buttonUp = BABYLON.GUI.Button.CreateImageWithCenterTextButton("but","", "assets/ui/buttonUp.png");
    buttonUp.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    buttonUp.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    buttonUp.width = 0.02;
    buttonUp.height = 0.08;
    buttonUp.left = "24%";
    buttonUp.top = "12%";
    buttonUp.thickness = 0; 

    var buttonDown = BABYLON.GUI.Button.CreateImageWithCenterTextButton("but","", "assets/ui/buttonDown.png");
    buttonDown.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    buttonDown.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    buttonDown.width = 0.02;
    buttonDown.height = 0.08;
    buttonDown.left = "24%";
    buttonDown.top = "22%";
    buttonDown.thickness = 0;

    //Goes back to the previous scene
    button1.onPointerUpObservable.add(function(){
        journalVisible1 = false;
        // for(let i = 0; i < pointsOfInterest.length; i++) {
        //     triceraResults.push({
        //        observations: observations[i],
        //        inferences: inferences[i],
        //        keys: keys[i]
        //     });

        //  }
        triceraResults.push(
            {
                observations: observations,
                inferences: inferences,
                keys:keys,
                pinMeshInfo: pinMeshInfo
            }
        );
         console.log(triceraResults);
        //  var jsonData = JSON.stringify(observations, function(key, val) {
        //     if (val != null && typeof val == "object") {
        //          if (seen.indexOf(val) >= 0) {
        //              return;
        //          }
        //          seen.push(val);
        //      }
        //      return val;
        //  });
        //  var a = document.createElement('a');
        //  a.setAttribute('href', 'data:text/plain;charset=utf-8,'+encodeURIComponent(jsonData));
        //  a.setAttribute('download', "download.txt");
        //  a.click()
        //SAVE JSON ON FILE^
    });

    buttonUp.onPointerUpObservable.add(function(){
            journalVisible = true;
            journalVisible1 = false;
        //AdvancedDynamicTextureJournal1.dispose();
    });

    buttonDown.onPointerUpObservable.add(function(){
        console.log("Inside b");
            journalVisible2 = true;
            journalVisible1 = false;
    });

    advancedTextureJournal1.addControl(button1);
    advancedTextureJournal1.addControl(textHint);
    advancedTextureJournal1.addControl(text1);
    advancedTextureJournal1.addControl(buttonUp);
    advancedTextureJournal1.addControl(buttonDown);
	return scene;
};

const createSceneJournal2 = function() {
    
    //Scene variables - self explanatory
    var lineSpacingInputs = 12;
    var pointsOfInterest = [];
    var pinMeshInfo = [];
    var meshLen = 0;
    var triceraSkull;
    var observations = [];
    var inferences = [];
    var keys = [];

    //Initialize scene lights and camera
	var scene = new BABYLON.Scene(engine);
    //var vrHelper = scene.createDefaultVRExperience({createDeviceOrientationCamera:false, useXR: true});
    scene.clearColor = new BABYLON.Color3(0.96, 0.76, 0.23);
	var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI / 2, Math.PI / 2, 3, new BABYLON.Vector3(3,0,4), scene);
	camera.attachControl(canvas, true);
    camera.setTarget(new BABYLON.Vector3.Zero());
    var light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    camera.lowerRadiusLimit = 0.1;
    camera.wheelPrecision = 15;
    light.intensity = 0.7;

    BABYLON.SceneLoader.ImportMeshAsync("", "", "assets/ammonite.glb").then((result) => {
        result.meshes[0].position = new BABYLON.Vector3(0,0.5,0);
    });
    
    window.addEventListener('dblclick', function() { 
        var pickResult = scene.pick(scene.pointerX, scene.pointerY);        
        //Put null check maybe?
        if(pickResult.pickedMesh.name=="13634_AmmoniteFossil_v1_l2"){
        var mat = new BABYLON.StandardMaterial('mat1', scene);
        mat.diffuseColor = new BABYLON.Color3(Math.random(), Math.random(), Math.random());

        var sphere = BABYLON.MeshBuilder.CreateSphere(
        'sphere1',
        { diameter: 2, segments: 16 },
        scene
        );
        sphere.material = mat;
        sphere.position.y = 3;

        var cube = BABYLON.MeshBuilder.CreateBox(
        'cube',
        { size: 0.5, height: 3 },
        scene
        );
        cube.position = new BABYLON.Vector3(0, 1.5, 0);
        cube.material = mat;

        var mesh = BABYLON.Mesh.MergeMeshes([sphere, cube]);
        mesh.scaling = new BABYLON.Vector3(0.05,0.05,0.05);       
        pointsOfInterest.push(mat.diffuseColor);
        mesh.position = pickResult.pickedPoint;
                        
        var axis1 = pickResult.getNormal();							        		
        var axis2 = BABYLON.Vector3.Up();
        var axis3 = BABYLON.Vector3.Up();
        var start = new BABYLON.Vector3(Math.PI / 2, Math.PI / 2, 0);				

        BABYLON.Vector3.CrossToRef(start, axis1, axis2);
        BABYLON.Vector3.CrossToRef(axis2, axis1, axis3);
        var tmpVec = BABYLON.Vector3.RotationFromAxis(axis3.negate(), axis1, axis2);
        var quat = BABYLON.Quaternion.RotationYawPitchRoll(tmpVec.y, tmpVec.x, tmpVec.z);
        if (pickResult.pickedMesh.rotationQuaternion)
                    mesh.rotationQuaternion = pickResult.pickedMesh.rotationQuaternion.multiply(quat);
                else
                    mesh.rotationQuaternion = quat;
        //mesh.rotationQuaternion = quat;
        pinMeshInfo.push(mesh);
        console.log(pinMeshInfo);
        //Stores pin count
        meshLen++;

        var checkbox = new BABYLON.GUI.Checkbox();
        checkbox.top = ""+lineSpacingInputs+ "%";
        checkbox.left ="-7.5%";
        checkbox.width = "20px";
        checkbox.height = "20px";
        checkbox.isChecked = true;
        checkbox.color = pointsOfInterest[meshLen-1].toHexString();

        var input32 = new BABYLON.GUI.InputText();
        input32.width = 0.18;
        input32.maxWidth = 0.18;
        input32.height = "28px";
        input32.top = ""+lineSpacingInputs+ "%";
        input32.left = "3.7%";
        input32.text = "";
        input32.color = "white";
        input32.background = "#e8b172";
        input32.thickness = 2;
        input32.isVisible = true;
        
        var input3 = new BABYLON.GUI.InputText();
        input3.width = 0.18;
        input3.maxWidth = 0.18;
        input3.height = "28px";
        input3.top = ""+lineSpacingInputs+ "%";
        input3.left = "22.25%";
        input3.text = "";
        input3.color = "white";
        input3.background = "#e8b172";
        input3.thickness = 2;
        input3.isVisible = true;
        lineSpacingInputs+=5;

        observations.push(input32);
        inferences.push(input3);
        keys.push(checkbox);

        advancedTextureJournal2.addControl(input3);
        advancedTextureJournal2.addControl(input32);
        advancedTextureJournal2.addControl(checkbox);
        }
    });

    scene.onPointerObservable.add((pointerInfo) => {      		
        

        switch (pointerInfo.type) {

			case BABYLON.PointerEventTypes.POINTERDOWN:
                //pointerInfo.pickInfo.hit && pointerInfo.pickInfo.pickedMesh != ground
				if(pointerInfo.event.button == 2) {
                    var pickResult = scene.pick(scene.pointerX, scene.pointerY); 
                    console.log(pickResult.pickedMesh.uniqueId);
                    for(let i=0;i<pinMeshInfo.length;i++){
                        console.log(pinMeshInfo[i].uniqueId + " " + pickResult.pickedMesh.uniqueId);
                        if(pinMeshInfo[i].uniqueId==pickResult.pickedMesh.uniqueId){
                            for(let i =0;i<pointsOfInterest.length;i++){
                                console.log("First loop run:" + i);
                                advancedTextureJournal2.removeControl(observations[i]);
                                advancedTextureJournal2.removeControl(inferences[i]);
                                advancedTextureJournal2.removeControl(keys[i]);
                            }
                            pinMeshInfo[i].dispose();
                            lineSpacingInputs = 12;
                            pinMeshInfo.splice(i,1);
                            //console.log(observations.length);
                            pointsOfInterest.splice(i,1);
                            keys.splice(i,1);
                            observations.splice(i,1);
                            inferences.splice(i,1);
                            meshLen=0;
                            console.log(pointsOfInterest.length);
                            observations = [];
                            inferences = [];
                            keys = [];
                            for(let i =0;i<pointsOfInterest.length;i++){
                                console.log("Second Loop run:" + i);
                                var checkbox = new BABYLON.GUI.Checkbox();
                                checkbox.top = ""+lineSpacingInputs+ "%";
                                checkbox.left ="-7.5%";
                                checkbox.width = "20px";
                                checkbox.height = "20px";
                                checkbox.isChecked = true;
                                checkbox.color = pointsOfInterest[i].toHexString();

                                var input32 = new BABYLON.GUI.InputText();
                                input32.width = 0.18;
                                input32.maxWidth = 0.18;
                                input32.height = "28px";
                                input32.top = ""+lineSpacingInputs+ "%";
                                input32.left = "3.7%";
                                input32.text = "";
                                input32.color = "white";
                                input32.background = "#e8b172";
                                input32.thickness = 2;
                                input32.isVisible = true;
                                
                                var input3 = new BABYLON.GUI.InputText();
                                input3.width = 0.18;
                                input3.maxWidth = 0.18;
                                input3.height = "28px";
                                input3.top = ""+lineSpacingInputs+ "%";
                                input3.left = "22.25%";
                                input3.text = "";
                                input3.color = "white";
                                input3.background = "#e8b172";
                                input3.thickness = 2;
                                input3.isVisible = true;
                                lineSpacingInputs+=5;
                                observations.push(input32);
                                inferences.push(input3);
                                keys.push(checkbox);
                                meshLen++;

                                advancedTextureJournal2.addControl(input3);
                                advancedTextureJournal2.addControl(input32);
                                advancedTextureJournal2.addControl(checkbox);
                            }
                            
                        }
                    }
                   
                }
				break;
        }
    });

    
    var layer = new BABYLON.Layer('','assets/ui/Group137.png', scene, true);
    var advancedTextureJournal2 = BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UIJ",scene);

    var textHint = new BABYLON.GUI.TextBlock();
    textHint.text = "Double click on a point of interest to add a pin. \n Drag using left mouse button to rotate. \n Scroll to zoom in and out.";
    textHint.color = "black";
    textHint.fontSize = "2.5%";
    textHint.top = "-26%";
    textHint.left = "20%";
    
    var text1 = new BABYLON.GUI.TextBlock();
    text1.text = "Fossil ID:\tFossil " + 2 + "\n\nLocation: \tAshara Desert, Mountain " + 2 + "\n\nFound by: \t Jessica Roberts";
    text1.color = "black";
    text1.fontSize = "1%";
    text1.top = "-7%";
    text1.left = "25%";

    var button1 = BABYLON.GUI.Button.CreateImageWithCenterTextButton("but","", "assets/ui/DoneButton.png");
    button1.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    button1.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    button1.width = 0.15;
    button1.height = 0.08;
    button1.left = "18%";
    button1.top = "35%";
    button1.thickness = 0; 

    var buttonUp = BABYLON.GUI.Button.CreateImageWithCenterTextButton("but","", "assets/ui/buttonUp.png");
    buttonUp.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    buttonUp.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    buttonUp.width = 0.02;
    buttonUp.height = 0.08;
    buttonUp.left = "24%";
    buttonUp.top = "12%";
    buttonUp.thickness = 0; 

    var buttonDown = BABYLON.GUI.Button.CreateImageWithCenterTextButton("but","", "assets/ui/buttonDown.png");
    buttonDown.horizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    buttonDown.verticalAlignment = BABYLON.GUI.Control.VERTICAL_ALIGNMENT_CENTER;
    buttonDown.width = 0.02;
    buttonDown.height = 0.08;
    buttonDown.left = "24%";
    buttonDown.top = "22%";
    buttonDown.thickness = 0;

    //Goes back to the previous scene
    button1.onPointerUpObservable.add(function(){
        journalVisible2 = false;
        console.log("j:" + journalVisible + "j1:" + journalVisible1 + "j2:" + journalVisible2);

        // for(let i = 0; i < pointsOfInterest.length; i++) {
        //     triceraResults.push({
        //        observations: observations[i],
        //        inferences: inferences[i],
        //        keys: keys[i]
        //     });

        //  }
        triceraResults.push(
            {
                observations: observations,
                inferences: inferences,
                keys:keys,
                pinMeshInfo: pinMeshInfo
            }
        );
         console.log(triceraResults);
        //  var jsonData = JSON.stringify(observations, function(key, val) {
        //     if (val != null && typeof val == "object") {
        //          if (seen.indexOf(val) >= 0) {
        //              return;
        //          }
        //          seen.push(val);
        //      }
        //      return val;
        //  });
        //  var a = document.createElement('a');
        //  a.setAttribute('href', 'data:text/plain;charset=utf-8,'+encodeURIComponent(jsonData));
        //  a.setAttribute('download', "download.txt");
        //  a.click()
        //SAVE JSON ON FILE^
    });

    buttonUp.onPointerUpObservable.add(function(){
            journalVisible1 = true;
            journalVisible2 = false;
        console.log("Journal 2:" + journalVisible + " " + journalVisible1 + " " + journalVisible2);
    });

    buttonDown.onPointerUpObservable.add(function(){
        journalVisible = true;
        journalVisible2 = false;
        
    });

    advancedTextureJournal2.addControl(button1);
    advancedTextureJournal2.addControl(textHint);
    advancedTextureJournal2.addControl(text1);
    advancedTextureJournal2.addControl(buttonUp);
    advancedTextureJournal2.addControl(buttonDown);
	return scene;
};


const scene = createScene(); 
const scene1 = createScene1();
const sceneJournal = createSceneJournal(); //Tricera
const sceneJournal2 = createSceneJournal2(); //Ammonite
const sceneJournal1 = createSceneJournal1(); //Trex
    
        engine.runRenderLoop(function () {
            if(playGame && journalVisible){
                //scene1.detachControl();
                //scene.detachControl();
                sceneJournal2.detachControl();
                sceneJournal1.detachControl();
                //scene.dispose();
                sceneJournal.attachControl();
                sceneJournal.render();
            }
            else if(playGame && journalVisible1){
                //scene1.dispose();
                //scene.detachControl();
                //scene1.detachControl();
                sceneJournal.detachControl();
                sceneJournal2.detachControl();
                sceneJournal1.attachControl();
                sceneJournal1.render();
            }
            else if(playGame && journalVisible2){
                //scene.dispose();
                //scene.detachControl();
                //scene1.detachControl();
                sceneJournal.detachControl();
                sceneJournal1.detachControl();
                sceneJournal2.attachControl();
                sceneJournal2.render();
            }
            else if(playGame && !journalVisible){
                
                //scene1.dispose();
                //sceneJournal.detachControl();
                //sceneJournal1.detachControl();
                //sceneJournal2.detachControl();
                scene.render();   
            }
 
            else{
                sceneJournal.detachControl();
                sceneJournal1.detachControl();
                sceneJournal2.detachControl();
                scene1.render();

            }
            //sceneJournal.render();
        });

    
        window.addEventListener("resize", function () {
                engine.resize();
        });
        