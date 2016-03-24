/*
Source file name : game.ts
Author : Eunmi Han(300790610)
Date last Modified : Mar 11, 2016
Program Description : Main controls 
Revision History : 1.01 - Initial Setup(3.11) by E
                   1.02 - Add mouse controls(3.17) by E
                   1.03 - Add items and texture(3.18)
                   1.04 - Remove gui.dat, project adjustment(3.21)
                   1.05 - Add death collision, score board(3.23)
                   1.06 - Add point light, play again alert and finish line, update items coordinate(3.24)
                                      
Last Modified by Eunmi Han
*/
/// <reference path="_reference.ts"/>

// MAIN GAME FILE

// THREEJS Aliases
import Scene = Physijs.Scene;
import Renderer = THREE.WebGLRenderer;
import PerspectiveCamera = THREE.PerspectiveCamera;
import BoxGeometry = THREE.BoxGeometry;
import CubeGeometry = THREE.CubeGeometry;
import PlaneGeometry = THREE.PlaneGeometry;
import SphereGeometry = THREE.SphereGeometry;
import Geometry = THREE.Geometry;
import AxisHelper = THREE.AxisHelper;
import LambertMaterial = THREE.MeshLambertMaterial;
import MeshBasicMaterial = THREE.MeshBasicMaterial;
import LineBasicMaterial = THREE.LineBasicMaterial;
import Material = THREE.Material;
import Mesh = THREE.Mesh;
import Line = THREE.Line;
import Object3D = THREE.Object3D;
import SpotLight = THREE.SpotLight;
import PointLight = THREE.PointLight;
import AmbientLight = THREE.AmbientLight;
import Color = THREE.Color;
import Vector3 = THREE.Vector3;
import Face3 = THREE.Face3;
import CScreen = config.Screen;
import Clock = THREE.Clock;
import PhongMaterial = THREE.MeshPhongMaterial;
import Texture = THREE.Texture;
import CylinderGeometry = THREE.CylinderGeometry;


// Setup a Web Worker for Physijs
Physijs.scripts.worker = "/Scripts/lib/Physijs/physijs_worker.js";
Physijs.scripts.ammo = "/Scripts/lib/Physijs/examples/js/ammo.js";


// setup an IIFE structure (Immediately Invoked Function Expression)
var game = (() => {

    // declare game objects
    var havePointerLock: boolean;
    var element: any;
    var scene: Scene = new Scene(); // Instantiate Scene Object
    var renderer: Renderer;
    var camera: PerspectiveCamera;
    var stats: Stats;
    var blocker: HTMLElement;
    var instructions: HTMLElement;
    var spotLight: SpotLight;
    var spotLight2: SpotLight;
    var spotLight3: SpotLight;
    var groundGeometry: CubeGeometry;
    var groundMaterial: PhongMaterial;
    var ground: Physijs.Mesh;
    var groundTexture: Texture;
    var groundPhysicsMaterial: Physijs.Material;
    var clock: Clock;
    var playerGeometry: CubeGeometry;
    var playerMaterial: Physijs.Material;
    var player: Physijs.Mesh;

    var keyboardControls: objects.KeyboardControls;
    var mouseControls: objects.MouseControls;
    var isGrounded: boolean;
    var isDied: boolean;
    var velocity: Vector3 = new Vector3(0, 0, 0);
    var prevTime: number = 0;
    var directionLineMaterial: LineBasicMaterial;
    var directionLineGeometry: Geometry;
    var directionLine: Line;
    var trackGeometry: CubeGeometry;
    var trackMaterial: Physijs.Material;
    var track: Physijs.Mesh;


    //Item Variables
    var firstAidGeometry: CubeGeometry;
    var firstAidMaterial: PhongMaterial;
    var firstAid: Physijs.ConcaveMesh[];
    var firstAidTexture: Texture;

    var cokeGeometry: CylinderGeometry;
    var cokeMaterial: PhongMaterial;
    var coke: Physijs.ConcaveMesh[];
    var cokeTexture: Texture;

    var stoneGeometry: SphereGeometry;
    var stoneMaterial: PhongMaterial;
    var stoneTexture: Texture;
    var stone: Physijs.ConcaveMesh[];

    var respawnGeometry: CubeGeometry;
    var respawnMaterial: PhongMaterial;
    var respawn: Physijs.Mesh;
    var respawnTexture: Texture;
    var respawnPhysicsMaterial: Physijs.Material;

    var fenceGeometry: CubeGeometry;
    var fenceMaterial: Physijs.Material;
    var fence: Physijs.Mesh;

    var finishGeometry: CubeGeometry;
    var finishMaterial: Physijs.Material;
    var finish: Physijs.Mesh;
    var isFinish: boolean;
    var isDied: boolean;


    // CreateJS Related Variables
    var assets: createjs.LoadQueue;
    var canvas: HTMLElement;
    var stage: createjs.Stage;
    var scoreLabel: createjs.Text;
    var livesLabel: createjs.Text;
    var scoreValue: number;
    var livesValue: number;


    var manifest = [
        { id: "land", src: "../../Assets/audio/Land.wav" }
    ];

    function preload(): void {
        assets = new createjs.LoadQueue();
        assets.installPlugin(createjs.Sound);
        assets.on("complete", init, this);
        assets.loadManifest(manifest);
    }


    function setupCanvas(): void {
        canvas = document.getElementById("canvas");
        canvas.setAttribute("width", config.Screen.WIDTH.toString());
        canvas.setAttribute("height", (config.Screen.HEIGHT * 0.1).toString());
        canvas.style.backgroundColor = "#000000";
        stage = new createjs.Stage(canvas);
    }

    function setupScoreboard(): void {
        // initialize  score and lives values
        scoreValue = 0;
        livesValue = 5;

        // Add Lives Label
        livesLabel = new createjs.Text(
            "LIVES: " + livesValue,
            "40px Mouse Memoirs",
            "#ffffff"
        );
        livesLabel.x = config.Screen.WIDTH * 0.1;
        livesLabel.y = (config.Screen.HEIGHT * 0.15) * 0.20;
        stage.addChild(livesLabel);
        console.log("Added Lives Label to stage");

        // Add Score Label
        scoreLabel = new createjs.Text(
            "SCORE: " + scoreValue,
            "40px Mouse Memoirs",
            "#ffffff"
        );
        scoreLabel.x = config.Screen.WIDTH * 0.8;
        scoreLabel.y = (config.Screen.HEIGHT * 0.15) * 0.20;
        stage.addChild(scoreLabel);
        console.log("Added Score Label to stage");
    }

    function init(): void {
        // Create to HTMLElements
        blocker = document.getElementById("blocker");
        instructions = document.getElementById("instructions");

        // Set Up CreateJS Canvas and Stage
        setupCanvas();

        // Set Up Scoreboard
        setupScoreboard();

        //check to see if pointerlock is supported
        havePointerLock = 'pointerLockElement' in document ||
            'mozPointerLockElement' in document ||
            'webkitPointerLockElement' in document;

        // Instantiate Game Controls
        keyboardControls = new objects.KeyboardControls();
        mouseControls = new objects.MouseControls();

        if (havePointerLock) {

            element = document.body;

            instructions.addEventListener('click', () => {

                // Ask the user for pointer lock
                console.log("Requesting PointerLock");

                element.requestPointerLock = element.requestPointerLock ||
                    element.mozRequestPointerLock ||
                    element.webkitRequestPointerLock;

                element.requestPointerLock();
            });

            document.addEventListener('pointerlockchange', pointerLockChange);
            document.addEventListener('mozpointerlockchange', pointerLockChange);
            document.addEventListener('webkitpointerlockchange', pointerLockChange);
            document.addEventListener('pointerlockerror', pointerLockError);
            document.addEventListener('mozpointerlockerror', pointerLockError);
            document.addEventListener('webkitpointerlockerror', pointerLockError);
        }

        // Scene changes for Physijs
        scene.name = "Main";
        scene.fog = new THREE.Fog(0xffffff, 0, 750);
        scene.setGravity(new THREE.Vector3(0, -10, 0));

        scene.addEventListener('update', () => {
            scene.simulate(undefined, 2);
        });

        // setup a THREE.JS Clock object
        clock = new Clock();

        setupRenderer(); // setup the default renderer

        setupCamera(); // setup the camera


        // Spot Light
        spotLight = new SpotLight(0xffffff);
        spotLight.position.set(20, 40, -15);
        spotLight.castShadow = true;
        spotLight.intensity = 2;
        spotLight.lookAt(new Vector3(0, 0, 0));
        spotLight.shadowCameraNear = 2;
        spotLight.shadowCameraFar = 200;
        spotLight.shadowCameraLeft = -5;
        spotLight.shadowCameraRight = 5;
        spotLight.shadowCameraTop = 5;
        spotLight.shadowCameraBottom = -5;
        spotLight.shadowMapWidth = 2048;
        spotLight.shadowMapHeight = 2048;
        spotLight.shadowDarkness = 0.5;
        spotLight.name = "Spot Light";
        scene.add(spotLight);

        spotLight2 = new SpotLight(0xffffff);
        spotLight2.position.set(20, 40, -115);
        spotLight2.castShadow = true;
        spotLight2.intensity = 2;
        spotLight2.lookAt(new Vector3(0, 0, -100));
        spotLight2.shadowCameraNear = 2;
        spotLight2.shadowCameraFar = 200;
        spotLight2.shadowCameraLeft = -5;
        spotLight2.shadowCameraRight = 5;
        spotLight2.shadowCameraTop = 5;
        spotLight2.shadowCameraBottom = -5;
        spotLight2.shadowMapWidth = 2048;
        spotLight2.shadowMapHeight = 2048;
        spotLight2.shadowDarkness = 0.5;
        spotLight2.name = "Spot Light";
        scene.add(spotLight2);

        spotLight3 = new SpotLight(0xffffff);
        spotLight3.position.set(20, 40, -215);
        spotLight3.castShadow = true;
        spotLight3.intensity = 2;
        spotLight3.lookAt(new Vector3(0, 0, -200));
        spotLight3.shadowCameraNear = 2;
        spotLight3.shadowCameraFar = 200;
        spotLight3.shadowCameraLeft = -5;
        spotLight3.shadowCameraRight = 5;
        spotLight3.shadowCameraTop = 5;
        spotLight3.shadowCameraBottom = -5;
        spotLight3.shadowMapWidth = 2048;
        spotLight3.shadowMapHeight = 2048;
        spotLight3.shadowDarkness = 0.5;
        spotLight3.name = "Spot Light";
        scene.add(spotLight3);


        console.log("Added spotLight to scene");

        //Set a respawn
        respawnTexture = new THREE.TextureLoader().load('../../Assets/images/lava.png');
        respawnTexture.wrapS = THREE.RepeatWrapping;
        respawnTexture.wrapT = THREE.RepeatWrapping;
        respawnTexture.repeat.set(8, 8);

        respawnMaterial = new PhongMaterial();
        respawnMaterial.map = respawnTexture;

        respawnGeometry = new BoxGeometry(310, 0.5, 310);
        respawnPhysicsMaterial = Physijs.createMaterial(respawnMaterial, 0, 0);
        respawn = new Physijs.ConvexMesh(respawnGeometry, respawnPhysicsMaterial, 0);
        respawn.position.set(0, -10, 0);
        respawn.name = "Respawn";

        scene.add(respawn);
        console.log("Added Death point to scene");

        // Long Track
        groundTexture = new THREE.TextureLoader().load('../../Assets/images/track.png');
        groundTexture.wrapS = THREE.RepeatWrapping;
        groundTexture.wrapT = THREE.RepeatWrapping;
        groundTexture.repeat.set(8, 8);

        groundMaterial = new PhongMaterial();
        groundMaterial.map = groundTexture;

        groundGeometry = new BoxGeometry(20, 1, 40);
        groundPhysicsMaterial = Physijs.createMaterial(groundMaterial, 0, 0);
        ground = new Physijs.ConvexMesh(groundGeometry, groundPhysicsMaterial, 0);
        ground.receiveShadow = true;
        ground.name = "Ground";
        scene.add(ground);
        console.log("Added runing track to scene");

        ground = new Physijs.ConvexMesh(groundGeometry, groundPhysicsMaterial, 0);
        ground.receiveShadow = true;
        ground.position.set(0, 1, -104);
        ground.name = "Ground";
        scene.add(ground);
        console.log("Added runing track to scene");

        //Finish Line
        finishGeometry = new BoxGeometry(20, 1, 1);
        finishMaterial = Physijs.createMaterial(new LambertMaterial({ color: 0xffffff }), 0.4, 0);
        finish = new Physijs.ConvexMesh(finishGeometry, finishMaterial, 0);
        finish.receiveShadow = true;
        finish.position.set(0, 3, -120);
        finish.name = "FinishLine";
        scene.add(finish);
        console.log("Added Finish Line to scene");

        // fence
        fenceGeometry = new BoxGeometry(1, 5, 40);
        fenceMaterial = Physijs.createMaterial(new LambertMaterial({ color: 0x000000 }), 0.4, 0);
        fence = new Physijs.ConvexMesh(fenceGeometry, fenceMaterial, 0);
        fence.receiveShadow = true;
        fence.position.set(10, 3, 0);
        fence.name = "Fence";
        scene.add(fence);

        fence = new Physijs.ConvexMesh(fenceGeometry, fenceMaterial, 0);
        fence.receiveShadow = true;
        fence.position.set(-10, 3, 0);
        fence.name = "Fence";
        scene.add(fence);
        console.log("Added fence to scene");

        // Small track
        trackGeometry = new CubeGeometry(20, 1, 15);
        trackMaterial = Physijs.createMaterial(groundMaterial, 0, 0);
        track = new Physijs.ConvexMesh(trackGeometry, trackMaterial, 0);
        track.receiveShadow = true;
        track.position.set(0, 1, -34);
        track.name = "Ground";
        scene.add(track);
        console.log("Added small track to scene");

        track = new Physijs.ConvexMesh(trackGeometry, trackMaterial, 0);
        track.receiveShadow = true;
        track.position.set(0, 0, -53);
        track.name = "StoneGround";
        scene.add(track);
        console.log("Added small track to scene");

        track = new Physijs.ConvexMesh(trackGeometry, trackMaterial, 0);
        track.receiveShadow = true;
        track.position.set(0, 1, -70);
        track.name = "Ground";
        scene.add(track);
        console.log("Added small track to scene");



        // Player Object
        playerGeometry = new BoxGeometry(2, 3, 2);
        playerMaterial = Physijs.createMaterial(new LambertMaterial({ color: 0x00ff00 }), 0.4, 0);

        player = new Physijs.BoxMesh(playerGeometry, playerMaterial, 1);
        player.position.set(0, 20, 0);
        player.receiveShadow = true;
        player.castShadow = true;
        player.name = "Player";

        scene.add(player);
        console.log("Added Player to Scene");


        addFirstAidItem();
        addCokeItem();

        //collision check
        player.addEventListener('collision', (eventObject) => {
            if (eventObject.name === "Ground") {
                isGrounded = true;
            }

            if (eventObject.name === "Respawn") {
                livesValue--;
                livesLabel.text = "LIVES: " + livesValue;
                if (livesValue < 1) {
                    isDied = true;
                } else {
                    scene.remove(player);
                    player.position.set(0, 30, 10);
                    scene.add(player);
                }

            }

            if (eventObject.name === "Coke") {
                scene.remove(eventObject);
                setCokePosition(eventObject);
                scoreValue += 50;
                scoreLabel.text = "SCORE: " + scoreValue;
            }

            if (eventObject.name === "FirstAid") {
                scene.remove(eventObject);
                setFirstAidPosition(eventObject);
                scoreValue += 20;
                scoreLabel.text = "SCORE: " + scoreValue;
            }

            if (eventObject.name === "StoneGround") {
                isGrounded = true;
                addStoneItem();
            }

            if (eventObject.name === "Stone") {
                livesValue--;
                livesLabel.text = "LIVES: " + livesValue;

                if (livesValue < 1) {
                    isDied = true;
                } else {
                    scene.remove(eventObject);
                    setFirstAidPosition(eventObject);
                }
            }

            if (eventObject.name === "FinishLine") {
                isFinish = true;
                scoreValue += 1000;
                scoreLabel.text = "SCORE: " + scoreValue;
                playAgain();
            }

        });
        
        //Collision check between items and death line
        respawn.addEventListener('collision', (eventObject) => {
            
            if (eventObject.name === "Coke") {
                scene.remove(eventObject);
                setCokePosition(eventObject);                
            }

            if (eventObject.name === "FirstAid") {
                scene.remove(eventObject);
                setFirstAidPosition(eventObject);                
            }

            if (eventObject.name === "Stone") {
                scene.remove(eventObject);
                setFirstAidPosition(eventObject);                
            }
        });


        // Add DirectionLine
        directionLineMaterial = new LineBasicMaterial({ color: 0xffff00 });
        directionLineGeometry = new Geometry();
        directionLineGeometry.vertices.push(new Vector3(0, 0, 0)); // line origin
        directionLineGeometry.vertices.push(new Vector3(0, 0, -50)); // end of the line
        directionLine = new Line(directionLineGeometry, directionLineMaterial);
        player.add(directionLine);
        console.log("Added DirectionLine to the Player");

        //create parent-child relationship 
        player.add(camera);
        camera.position.set(0, 1, 0);


        // Add framerate stats
        addStatsObject();
        console.log("Added Stats to scene...");

        document.body.appendChild(renderer.domElement);
        gameLoop(); // render the scene	
        scene.simulate();

        window.addEventListener('resize', onWindowResize, false);
    }

    function playAgain(): void {
        var x;
        if (isFinish) {
            x = "You won!!!!\n Your score : " + scoreValue + "\n Do you want to play again?";
            isFinish = false;
        } else {
            x = "Do you want to play again?";
        }

        if (confirm(x) == true) {
            livesValue = 5;
            livesLabel.text = "LIVES: " + livesValue;
            scoreValue = 0;
            scoreLabel.text = "SCORE: " + scoreValue;
            scene.remove(player);
            player.position.set(0, 30, 10);
            scene.add(player);
        } else {
            scene.remove(player);
        }
    }

    // Add the FirstAid to the scene
    function addFirstAidItem(): void {
        //FirstAidKit        
        firstAid = new Array<Physijs.ConvexMesh>();
        firstAidTexture = new THREE.TextureLoader().load('../../Assets/images/firstaid1.png');
        firstAidTexture.wrapS = THREE.RepeatWrapping;
        firstAidTexture.wrapT = THREE.RepeatWrapping;
        firstAidTexture.repeat.set(1, 1);

        firstAidGeometry = new BoxGeometry(2, 1, 2);
        firstAidMaterial = new PhongMaterial({ map: firstAidTexture });

        for (var count: number = 0; count < 5; count++) {
            firstAid[count] = new Physijs.BoxMesh(firstAidGeometry, firstAidMaterial, 1);
            firstAid[count].receiveShadow = true;
            firstAid[count].castShadow = true;
            firstAid[count].name = "FirstAid";
            setFirstAidPosition(firstAid[count]);

        }

        console.log("Added FirstAid item to scene");
    }

    // Set FirstAid Position
    function setFirstAidPosition(firstAid: Physijs.ConvexMesh): void {
        var randomPointX: number = Math.floor(Math.random() * 20) - 10;
        var randomPointZ: number = Math.floor(Math.random() * 5) - 70;
        firstAid.position.set(randomPointX, 10, randomPointZ);
        scene.add(firstAid);
    }

    // Add the Coke to the scene
    function addCokeItem(): void {
        //Coke
        coke = new Array<Physijs.ConvexMesh>();
        cokeTexture = new THREE.TextureLoader().load('../../Assets/images/coke.png');
        cokeTexture.wrapS = THREE.RepeatWrapping;
        cokeTexture.wrapT = THREE.RepeatWrapping;
        cokeTexture.repeat.set(1, 1);

        cokeGeometry = new CylinderGeometry(0.2, 0.2, 0.5, 29);
        cokeMaterial = new PhongMaterial({ map: cokeTexture });

        for (var count: number = 0; count < 6; count++) {
            coke[count] = new Physijs.BoxMesh(cokeGeometry, cokeMaterial, 1);
            coke[count].receiveShadow = true;
            coke[count].castShadow = true;
            coke[count].name = "Coke";
            setCokePosition(coke[count]);

        }

        console.log("Added Coke item to scene");
    }

    // Set Coke Position
    function setCokePosition(coke: Physijs.ConvexMesh): void {
        var randomPointX: number = Math.floor(Math.random() * 20) - 10;
        var randomPointZ: number = Math.floor(Math.random() * 5) - 33;
        coke.position.set(randomPointX, 3, randomPointZ);
        scene.add(coke);
    }

    // Add the Stone to the scene
    function addStoneItem(): void {
        // Stone       
        stone = new Array<Physijs.ConvexMesh>();
        stoneTexture = new THREE.TextureLoader().load('../../Assets/images/stone.jpg');
        stoneTexture.wrapS = THREE.RepeatWrapping;
        stoneTexture.wrapT = THREE.RepeatWrapping;
        stoneTexture.repeat.set(1, 1);

        stoneGeometry = new SphereGeometry(0.5, 5, 5);
        stoneMaterial = new PhongMaterial({ map: stoneTexture });

        for (var count: number = 0; count < 10; count++) {
            stone[count] = new Physijs.BoxMesh(stoneGeometry, stoneMaterial, 1);
            stone[count].receiveShadow = true;
            stone[count].castShadow = true;
            stone[count].name = "Stone";
            setStonePosition(stone[count]);

        }

        console.log("Added Stone item to the scene");
    }

    // Set Stone Position
    function setStonePosition(stone: Physijs.ConvexMesh): void {
        var randomPointX: number = Math.floor(Math.random() * 20) - 10;
        var randomPointZ: number = Math.floor(Math.random() * 5) - 55;
        stone.position.set(randomPointX, 3, randomPointZ);
        scene.add(stone);
    }


    //PointerLockChange Event Handler
    function pointerLockChange(event): void {
        if (document.pointerLockElement === element) {
            // enable our mouse and keyboard controls
            keyboardControls.enabled = true;
            mouseControls.enabled = true;
            blocker.style.display = 'none';
        } else {
            // disable our mouse and keyboard controls
            keyboardControls.enabled = false;
            mouseControls.enabled = false;
            blocker.style.display = '-webkit-box';
            blocker.style.display = '-moz-box';
            blocker.style.display = 'box';
            instructions.style.display = '';
            console.log("PointerLock disabled");
        }
    }

    //PointerLockError Event Handler
    function pointerLockError(event): void {
        instructions.style.display = '';
        console.log("PointerLock Error Detected!!");
    }

    // Window Resize Event Handler
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);

        canvas.style.width = "100%";
        livesLabel.x = config.Screen.WIDTH * 0.1;
        livesLabel.y = (config.Screen.HEIGHT * 0.15) * 0.20;
        scoreLabel.x = config.Screen.WIDTH * 0.8;
        scoreLabel.y = (config.Screen.HEIGHT * 0.15) * 0.20;
        stage.update();
    }



    // Add Frame Rate Stats to the Scene
    function addStatsObject() {
        stats = new Stats();
        stats.setMode(0);
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.left = '0px';
        stats.domElement.style.top = '0px';
        document.body.appendChild(stats.domElement);
    }


    // Setup main game loop
    function gameLoop(): void {
        stats.update();

        checkControls();

        stage.update();


        if (isDied) {
            playAgain();
            isDied = false;            
        }

        // render using requestAnimationFrame
        requestAnimationFrame(gameLoop);

        // render the scene
        renderer.render(scene, camera);


    }



    function checkControls(): void {

        if (keyboardControls.enabled) {
            velocity = new Vector3();

            var time: number = performance.now();
            var delta: number = (time - prevTime) / 1000;

            if (isGrounded) {
                var direction = new Vector3(0, 0, 0);
                if (keyboardControls.moveForward) {
                    velocity.z -= 500.0 * delta;
                }
                if (keyboardControls.moveLeft) {
                    velocity.x -= 500.0 * delta;
                }
                if (keyboardControls.moveBackward) {
                    velocity.z += 500.0 * delta;
                }
                if (keyboardControls.moveRight) {
                    velocity.x += 500.0 * delta;
                }
                if (keyboardControls.jump) {
                    velocity.y += 4000.0 * delta;

                    if (player.position.y > 4) {
                        isGrounded = false;
                    }
                }
                player.setDamping(0.7, 0.1);
                //changing player's rotation
                player.setAngularVelocity(new Vector3(0, mouseControls.yaw, 0));
                direction.addVectors(direction, velocity);
                direction.applyQuaternion(player.quaternion);
                if (Math.abs(player.getLinearVelocity().x) < 20 && Math.abs(player.getLinearVelocity().y) < 10) {
                    player.applyCentralForce(direction);
                }
                cameraLook();
            }//isGrounded ends

            //reset pitch and yaw
            mouseControls.pitch = 0;
            mouseControls.yaw = 0;

            prevTime = time;
        }//controls enabled ends
        else {
            player.setAngularVelocity(new Vector3(0, 0, 0));
        }
        
    }

    //Camera look function 
    function cameraLook(): void {
        var zenith: number = THREE.Math.degToRad(90);
        var nadir: number = THREE.Math.degToRad(-90);

        var cameraPitch: number = camera.rotation.x + mouseControls.pitch;

        //constrain the camera pitch
        camera.rotation.x = THREE.Math.clamp(cameraPitch, nadir, zenith);

    }

    // Setup default renderer
    function setupRenderer(): void {
        renderer = new Renderer({ antialias: true });
        renderer.setClearColor(0x404040, 1.0);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(CScreen.WIDTH, CScreen.HEIGHT);
        renderer.shadowMap.enabled = true;
        console.log("Finished setting up Renderer...");
    }

    // Setup main camera for the scene
    function setupCamera(): void {
        camera = new PerspectiveCamera(35, config.Screen.RATIO, 0.1, 100);
        //camera.position.set(0, 10, 30);
        //camera.lookAt(new Vector3(0, 0, 0));
        console.log("Finished setting up Camera...");
    }

    window.onload = preload;

    return {
        scene: scene
    }

})();

