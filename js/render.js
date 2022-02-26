
const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true,{ stencil: true }); // Generate the BABYLON 3D engine

const createScene =  () => {
    //-------VARIABLES-------------------------------
    var picked = false;
    var mapVisible = false;
    var journalVisible = false;
    var pickUpR1, pickUpR2, pickUpR3, pickUpR4, pickUpR5, pickUpR6;
    var aspectRatio = screen.width/screen.height;

    //-----------SCENE INITIALIZATIONS------------------------
    const scene = new BABYLON.Scene(engine);
    scene.enablePhysics();
    scene.ambientColor = new BABYLON.Color3(1,1,1);
    scene.gravity = new BABYLON.Vector3(0, -.75, 0); 
    scene.collisionsEnabled = true;
    


    //---------------CAMERAS----------------------------------
    var camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 0, -10), scene);
    camera.setTarget(BABYLON.Vector3.Zero());
    //camera.applyGravity = true;
    camera.ellipsoid = new BABYLON.Vector3(.4, .8, .4);
    camera.checkCollisions = true;
    camera.attachControl(canvas, true);
    camera.speed = 5;
    camera.layerMask = 1;

    var camera2 = new BABYLON.ArcRotateCamera("Camera2", -Math.PI/2, 0.5, 150, BABYLON.Vector3.Zero(), scene);
    scene.activeCameras = [];
    scene.activeCameras.push(camera);
    //camera2.layerMask = 0;

    //--------------------LIGHTS-----------------------------
    //Hemispherical light can't cast shadows
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0));
    light.intensity = 0.05;
    var light2 = new BABYLON.DirectionalLight("DirectionalLight", new BABYLON.Vector3(0, -2, 1), scene);
    light2.position = new BABYLON.Vector3(100,50,0);
    light2.intensity = 2.0;
    //var light2 = new BABYLON.SpotLight("spotLight", new BABYLON.Vector3(3, 2.5, 8), new BABYLON.Vector3(0, 0, -1), Math.PI / 3, 2, scene);

    //------------------SHADOWS----------------------------------------
    var shadowGenerator = new BABYLON.ShadowGenerator(1024, light2);
    shadowGenerator.usePercentageCloserFiltering = true;
    shadowGenerator.filteringQuality = BABYLON.ShadowGenerator.QUALITY_MEDIUM;

    //-----------------GROUND----------------------------
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width:100, height:100});
    const groundMat = new BABYLON.StandardMaterial("groundMat");
    groundMat.diffuseColor = new BABYLON.Color3(199/255, 119/255, 44/255);
    ground.material = groundMat; //Place the material property of the ground
    ground.checkCollisions= true;
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.5, friction:0.1 }, scene);
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
	mon2.layerMask = 1;

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
        journalPlane.isVisible = true;
        input.isVisible = true;
        input2.isVisible = true;
        journalVisible = true;
        
    }
        else{
        input.isVisible = false;
        journalPlane.isVisible = false;
        input2.isVisible = false;
        journalVisible = false;
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

    //------------MOUSE AND KEYBOARD---------------------------
	var isLocked = false;
    
    var pickedUp = false;
    //TODO: MAKE OTHER MESHES UNPICKABLE; HIGHLIGHT PICKED MESH
	scene.onPointerDown = function (evt) {
        console.log(pickedUp);
		if(pickedUp){
            hl.removeMesh(currMesh);
            currMesh = null;
            console.log(currMesh);
            pickedUp = false;
            
        }
        else{
            var pos = {x:camera.position.x + 1.1, y:camera.position.y, z:camera.position.z};
            var forward = camera.getTarget().subtract(camera.position).normalize();
            var ray = new BABYLON.Ray(camera.position,forward,5);	
            var hit = scene.pickWithRay(ray, function(mesh){
             if(mesh == pickUpR1 || mesh== pickUpR2 || mesh==pickUpR3 || mesh==pickUpR4 || mesh==pickUpR5 || mesh ==pickUpR6) return true;
             return false;
         });
            if(hit.pickedMesh){
                currMesh = hit.pickedMesh;
                //currMesh.makeGeometryUnique();
                startingPoint = hit.pickedPoint;
                pickedUp = true;

                hl.addMesh(currMesh.subMeshes[0].getRenderingMesh(), BABYLON.Color3.Green());
               
            }
        }

		// if (!isLocked) {
		// 	canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
		// 	if (canvas.requestPointerLock) {
		// 		canvas.requestPointerLock();
		// 	}
		// }
        
        
        
	};

    //Why isnt this working?
    var debugShow = false;
    scene.onKeyboardObservable.add((kbInfo) => {
		switch (kbInfo.type) {
			case BABYLON.KeyboardEventTypes.KEYDOWN:
				switch (kbInfo.event.key) {
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
                }
			break;
		}
	});
      
    scene.onPointerMove = function(evt){
        var forward = camera.getTarget().subtract(camera.position).normalize();
        if(currMesh){
        currMesh.position = camera.position + camera.cameraDirection *1.5;
        const cameraForwardRay = camera.getForwardRay();
        
        currMesh.position = camera.position.add(cameraForwardRay.direction);
        }
    };
	
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
    BABYLON.SceneLoader.ImportMeshAsync("", "", "assets/11_mammoth.glb").then((result) => {
        result.meshes[0].position.z = 6;
        result.meshes[0].position.x = -14;
        result.meshes[0].scaling = new BABYLON.Vector3(0.075, 0.075, 0.075);
        result.meshes[0].isPickable = false;
            result.meshes[0].rotationQuaternion = null;
            result.meshes[0].rotate.y =-Math.PI/2;
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

        pickUpR1 = rock07.createInstance("pickUpR1");
        pickUpR2 = rock07.createInstance("pickUpR2");
        pickUpR3 = rock07.createInstance("pickUpR3");
        pickUpR4 = rock07.createInstance("pickUpR4");
        pickUpR5 = rock07.createInstance("pickUpR5");
        pickUpR6 = rock07.createInstance("pickUpR6");

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

        pickUpR1.position = new BABYLON.Vector3(5,0,-14);
        pickUpR2.position = new BABYLON.Vector3(5.3,0,-14.3);
        pickUpR3.position = new BABYLON.Vector3(5.1,0,-15);
        pickUpR4.position = new BABYLON.Vector3(5.2,0,-15.2);
        pickUpR5.position = new BABYLON.Vector3(4.9,0,-14.6);
        pickUpR6.position = new BABYLON.Vector3(5.2,0,-14.2);
        var sixDofDragBehavior = new BABYLON.SixDofDragBehavior()
        pickUpR1.addBehavior(sixDofDragBehavior)
        var multiPointerScaleBehavior = new BABYLON.MultiPointerScaleBehavior()
        pickUpR1.addBehavior(multiPointerScaleBehavior)
        //USE THIS TO ITERATIVELY PLACE ROCKS WHEN YOU FIGURE OUT THE COORDINATES
        //const rocks =[];E
            // const x1 = -40;
        // for(let i =0;i<8;i+=4){
        //     rocks[i] = rock01.createInstance("rock01" + i);
        //     rocks[i+1] = rock02.createInstance("rock02" + i);
        //     rocks[i+2] = rock03.createInstance("rock03" + i);
        //     rocks[i+3] = rock07.createInstance("rock07" + i);

        //     rocks[i].position = new BABYLON.Vector3(x1 + i* 20,0,-40.0);
        //     rocks[i+1].position = new BABYLON.Vector3();
        // }
    });

     //-----HANNAH----
     BABYLON.SceneLoader.ImportMeshAsync("", "", "assets/10_hannah_waving.glb").then((result) => {
        result.meshes[0].position.z = 4;
        result.meshes[0].position.x = 7;
        result.meshes[0].isPickable = false;

            result.meshes[0].rotationQuaternion = null;
            result.meshes[0].rotate.y =Math.PI/2;     
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

        const createOutline = () => {
        let c = 2

        ctx.moveTo(c, w * 0.25)
        ctx.lineTo(c, c)
        ctx.lineTo(w * 0.25, c)

        ctx.moveTo(w * 0.75, c)
        ctx.lineTo(w - c, c)
        ctx.lineTo(w - c, w * 0.25)

        ctx.moveTo(w - c, w * 0.75)
        ctx.lineTo(w - c, w - c)
        ctx.lineTo(w * 0.75, w - c)

        ctx.moveTo(w * 0.25, w - c)
        ctx.lineTo(c, w - c)
        ctx.lineTo(c, w * 0.75)

        ctx.lineWidth = 1.5
        ctx.strokeStyle = 'rgba(128, 128, 128, 0.5)'
        ctx.stroke()
        }

        const createNavigate = () => {
        ctx.fillStyle = 'transparent'
        ctx.clearRect(0, 0, w, w)
        createOutline()

        ctx.strokeStyle = 'rgba(170, 255, 0, 0.9)'
        ctx.lineWidth = 3.5
        ctx.moveTo(w * 0.5, w * 0.25)
        ctx.lineTo(w * 0.5, w * 0.75)

        ctx.moveTo(w * 0.25, w * 0.5)
        ctx.lineTo(w * 0.75, w * 0.5)
        ctx.stroke()
        ctx.beginPath()

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

    let reticule = addCrosshair(scene);
    
    return scene;
}



const scene = createScene(); 

    
        engine.runRenderLoop(function () {
                scene.render();
        });

    
        window.addEventListener("resize", function () {
                engine.resize();
        });
        