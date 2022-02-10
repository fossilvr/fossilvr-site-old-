
const canvas = document.getElementById("renderCanvas"); // Get the canvas element
const engine = new BABYLON.Engine(canvas, true); // Generate the BABYLON 3D engine

const createScene =  () => {
    const scene = new BABYLON.Scene(engine);
    scene.enablePhysics();
    scene.ambientColor = new BABYLON.Color3(1,1,1);
    scene.gravity = new BABYLON.Vector3(0, -.75, 0); 
    scene.collisionsEnabled = true;
    
    
    // Parameters : name, position, scene
    var camera = new BABYLON.UniversalCamera("UniversalCamera", new BABYLON.Vector3(0, 0, -10), scene);

    // // Targets the camera to a particular position. In this case the scene origin
    camera.setTarget(BABYLON.Vector3.Zero());

    // // Attach the camera to the canvas
    camera.applyGravity = true;
    camera.ellipsoid = new BABYLON.Vector3(.4, .8, .4);
    camera.checkCollisions = true;
    camera.attachControl(canvas, true); 

    // const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 3, new BABYLON.Vector3(0, 40,-120), scene);
    // camera.attachControl(canvas, true);

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(10, 50, 30));
    //var light2 = new BABYLON.SpotLight("spotLight", new BABYLON.Vector3(3, 2.5, 8), new BABYLON.Vector3(0, 0, -1), Math.PI / 3, 2, scene);

    //----GROUND-----
    const ground = BABYLON.MeshBuilder.CreateGround("ground", {width:100, height:100});
    const groundMat = new BABYLON.StandardMaterial("groundMat");
    groundMat.diffuseColor = new BABYLON.Color3(199/255, 119/255, 44/255);
    ground.material = groundMat; //Place the material property of the ground
    ground.checkCollisions= true;
    ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, restitution: 0.5, friction:0.1 }, scene);


    //----SKYBOX----
    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", { size: 1000.0 }, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/sky/tropical", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;

    var pickUpR1, pickUpR2, pickUpR3, pickUpR4, pickUpR5, pickUpR6;

    //Player

    const hero = BABYLON.Mesh.CreateBox('hero', 2.0, scene, false, BABYLON.Mesh.FRONTSIDE);
    hero.position.x = 0.0;
    hero.position.y = 1;
    hero.position.z = -14.0;
    hero.physicsImpostor = new BABYLON.PhysicsImpostor(hero, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0.0, friction: 0.1 }, scene);		
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

    //Mouse
	var isLocked = false;
	scene.onPointerDown = function (evt) {
		
		if (!isLocked) {
			canvas.requestPointerLock = canvas.requestPointerLock || canvas.msRequestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;
			if (canvas.requestPointerLock) {
				canvas.requestPointerLock();
			}
		}
	};
	
	var pointerlockchange = function () {
		var controlEnabled = document.mozPointerLockElement || document.webkitPointerLockElement || document.msPointerLockElement || document.pointerLockElement || null;
		
		// If the user is already locked
		if (!controlEnabled) {
			//camera.detachControl(canvas);
			isLocked = false;
		} else {
			//camera.attachControl(canvas);
			isLocked = true;
		}
	};
	
	// Attach events to the document
	document.addEventListener("pointerlockchange", pointerlockchange, false);
	document.addEventListener("mspointerlockchange", pointerlockchange, false);
	document.addEventListener("mozpointerlockchange", pointerlockchange, false);
	document.addEventListener("webkitpointerlockchange", pointerlockchange, false);


    // --------FLAG -------------
    BABYLON.SceneLoader.ImportMeshAsync("", "", "assets/1_flag.glb").then((result) => {
            result.meshes[0].position.x = 5;
            result.meshes[0].position.z = -15;   
            result.meshes[0].rotation.y = Math.PI/4;
    });


    //---------TENT--------------------

    BABYLON.SceneLoader.ImportMeshAsync("", "", "assets/3_tent.glb").then((result) => {
        result.meshes[0].position.z = 6;
        result.meshes[0].position.x = 5;
        result.meshes[0].scaling = new BABYLON.Vector3(2.5, 2.5, -2.5);

        result.meshes[0].rotationQuaternion = null;
        result.meshes[0].rotate.y =Math.PI/2;     
    });

    BABYLON.SceneLoader.ImportMeshAsync("", "", "assets/11_mammoth.glb").then((result) => {
        result.meshes[0].position.z = 6;
        result.meshes[0].position.x = -14;
        result.meshes[0].scaling = new BABYLON.Vector3(0.075, 0.075, 0.075);

            result.meshes[0].rotationQuaternion = null;
            result.meshes[0].rotate.y =-Math.PI/2;     
    });

     // ------ DESERT PLANTS --------
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
        const cactus02 = scene.getMeshByName("Cactuss_02_cactus02");
        const cactus03 = scene.getMeshByName("Cactus_03_cactus03");
        const aloe01 = scene.getMeshByName("Aloe._01_aloe.002");
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

        c11.position = new BABYLON.Vector3(15,0,-20);
        c12.position = new BABYLON.Vector3(-20,0,-14);
        c13.position = new BABYLON.Vector3(5,0,-10);

        const c21 = cactus02.createInstance("c21");
        const c22 = cactus02.createInstance("c22");
        const c23 = cactus02.createInstance("c23");

        c21.position = new BABYLON.Vector3(-13,0,-10);
        c22.position = new BABYLON.Vector3(-30,0,-14);
        c23.position = new BABYLON.Vector3(15,0,-21);

        const c31 = cactus03.createInstance("c31");
        const c32 = cactus03.createInstance("c32");
        const c33 = cactus03.createInstance("c33");

        c31.position = new BABYLON.Vector3(34,0,-21);
        c32.position = new BABYLON.Vector3(-21,0,-3);
        c33.position = new BABYLON.Vector3(-27,0,-19);

        const a31 = aloe01.createInstance("a31");
        const a32 = aloe01.createInstance("a32");
        const a33 = aloe01.createInstance("a33");

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
        

            result.meshes[0].rotationQuaternion = null;
            result.meshes[0].rotate.y =Math.PI/2;     
    });
    // ------ DESERT PLANTS --------
    BABYLON.SceneLoader.ImportMeshAsync("", "", "assets/pal.glb").then((result) => {
        result.meshes[0].scaling = new BABYLON.Vector3(0.7, 0.7, -0.6);
        result.meshes[0].position.x = 2;
        result.meshes[0].position.z = 4.85;
        result.meshes[0].position.y = 0.3;

        var fossil = scene.getMeshByName("13637_Triceratops_Skull_Fossil_v1_L2");
        fossil.position.x = 27.8;
        fossil.position.y = -0.5;
        fossil.position.z = -5.3;
        result.meshes[0].rotationQuaternion = null;
        result.meshes[0].rotate(BABYLON.Vector3.Up(),Math.PI/2);    
    });
    scene.debugLayer.show();
    return scene;
}



const scene = createScene(); 

    
        engine.runRenderLoop(function () {
                scene.render();
        });

    
        window.addEventListener("resize", function () {
                engine.resize();
        });
        