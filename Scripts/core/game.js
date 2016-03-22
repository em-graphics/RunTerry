/*
Source file name : game.ts
Author : Eunmi Han(300790610)
Date last Modified : Mar 11, 2016
Program Description : Main controls
Revision History : 1.01 - Initial Setup(3.11) by E
                   1.02 - Add mouse controls(3.17) by E
                   1.03 - Add items and texture(3.18)
                   1.04 - Remove gui.dat, project adjustment(3.21)
                                      
Last Modified by Eunmi Han
*/
/// <reference path="_reference.ts"/>
// MAIN GAME FILE
// THREEJS Aliases
var Scene = Physijs.Scene;
var Renderer = THREE.WebGLRenderer;
var PerspectiveCamera = THREE.PerspectiveCamera;
var BoxGeometry = THREE.BoxGeometry;
var CubeGeometry = THREE.CubeGeometry;
var PlaneGeometry = THREE.PlaneGeometry;
var SphereGeometry = THREE.SphereGeometry;
var Geometry = THREE.Geometry;
var AxisHelper = THREE.AxisHelper;
var LambertMaterial = THREE.MeshLambertMaterial;
var MeshBasicMaterial = THREE.MeshBasicMaterial;
var LineBasicMaterial = THREE.LineBasicMaterial;
var Material = THREE.Material;
var Mesh = THREE.Mesh;
var Line = THREE.Line;
var Object3D = THREE.Object3D;
var SpotLight = THREE.SpotLight;
var PointLight = THREE.PointLight;
var AmbientLight = THREE.AmbientLight;
var Color = THREE.Color;
var Vector3 = THREE.Vector3;
var Face3 = THREE.Face3;
var CScreen = config.Screen;
var Clock = THREE.Clock;
var PhongMaterial = THREE.MeshPhongMaterial;
var Texture = THREE.Texture;
var CylinderGeometry = THREE.CylinderGeometry;
// Setup a Web Worker for Physijs
Physijs.scripts.worker = "/Scripts/lib/Physijs/physijs_worker.js";
Physijs.scripts.ammo = "/Scripts/lib/Physijs/examples/js/ammo.js";
// setup an IIFE structure (Immediately Invoked Function Expression)
var game = (function () {
    // declare game objects
    var havePointerLock;
    var element;
    var scene = new Scene(); // Instantiate Scene Object
    var renderer;
    var camera;
    var stats;
    var blocker;
    var instructions;
    var spotLight;
    var groundGeometry;
    var groundMaterial;
    var ground;
    var groundTexture;
    var groundPhysicsMaterial;
    var clock;
    var playerGeometry;
    var playerMaterial;
    var player;
    var fenceGeometry;
    var fenceMaterial;
    var fence;
    var stoneGeometry;
    var stoneMaterial;
    var stoneTexture;
    var stone;
    var keyboardControls;
    var mouseControls;
    var isGrounded;
    var isDied;
    var velocity = new Vector3(0, 0, 0);
    var prevTime = 0;
    var directionLineMaterial;
    var directionLineGeometry;
    var directionLine;
    var trackGeometry;
    var trackMaterial;
    var track;
    var respawnGeometry;
    var respawnMaterial;
    var respawn;
    var firstAidGeometry;
    var firstAidMaterial;
    var firstAid;
    var firstAidTexture;
    var cokeGeometry;
    var cokeMaterial;
    var coke;
    var cokeTexture;
    var isPassed;
    // CreateJS Related Variables
    var assets;
    var canvas;
    var stage;
    var scoreLabel;
    var livesLabel;
    var scoreValue;
    var livesValue;
    var manifest = [
        { id: "land", src: "../../Assets/audio/Land.wav" }
    ];
    function preload() {
        assets = new createjs.LoadQueue();
        assets.installPlugin(createjs.Sound);
        assets.on("complete", init, this);
        assets.loadManifest(manifest);
    }
    function setupCanvas() {
        canvas = document.getElementById("canvas");
        canvas.setAttribute("width", config.Screen.WIDTH.toString());
        canvas.setAttribute("height", (config.Screen.HEIGHT * 0.1).toString());
        canvas.style.backgroundColor = "#000000";
        stage = new createjs.Stage(canvas);
    }
    function setupScoreboard() {
        // initialize  score and lives values
        scoreValue = 0;
        livesValue = 5;
        // Add Lives Label
        livesLabel = new createjs.Text("LIVES: " + livesValue, "40px Consolas", "#ffffff");
        livesLabel.x = config.Screen.WIDTH * 0.1;
        livesLabel.y = (config.Screen.HEIGHT * 0.15) * 0.20;
        stage.addChild(livesLabel);
        console.log("Added Lives Label to stage");
        // Add Score Label
        scoreLabel = new createjs.Text("SCORE: " + scoreValue, "40px Consolas", "#ffffff");
        scoreLabel.x = config.Screen.WIDTH * 0.8;
        scoreLabel.y = (config.Screen.HEIGHT * 0.15) * 0.20;
        stage.addChild(scoreLabel);
        console.log("Added Score Label to stage");
    }
    function init() {
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
            instructions.addEventListener('click', function () {
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
        scene.addEventListener('update', function () {
            scene.simulate(undefined, 2);
        });
        // setup a THREE.JS Clock object
        clock = new Clock();
        setupRenderer(); // setup the default renderer
        setupCamera(); // setup the camera
        // Spot Light
        spotLight = new SpotLight(0xffffff);
        //spotLight.position.set(20, 40, -15);
        spotLight.castShadow = true;
        spotLight.intensity = 2;
        //spotLight.lookAt(new Vector3(0, 0, 0));
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
        //scene.add(spotLight);
        console.log("Added spotLight to scene");
        //Set a respawn(test)
        respawnGeometry = new BoxGeometry(300, 0.5, 300);
        respawnMaterial = Physijs.createMaterial(new LambertMaterial({ color: 0x000000 }), 0.4, 0);
        respawn = new Physijs.ConvexMesh(respawnGeometry, respawnMaterial, 0);
        respawn.position.set(0, -10, 0);
        respawn.name = "Respawn";
        scene.add(respawn);
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
        ground.position.set(21, 0, -96);
        ground.rotation.y = -0.2;
        ground.name = "Ground";
        scene.add(ground);
        console.log("Added runing track to scene");
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
        track.position.set(0.5, 0, -32);
        track.rotation.y = -0.2;
        track.name = "StoneGround";
        scene.add(track);
        console.log("Added small track to scene");
        track = new Physijs.ConvexMesh(trackGeometry, trackMaterial, 0);
        track.receiveShadow = true;
        track.position.set(7, 0, -49);
        track.rotation.y = -0.2;
        track.name = "SmallGround";
        scene.add(track);
        console.log("Added small track to scene");
        track = new Physijs.ConvexMesh(trackGeometry, trackMaterial, 0);
        track.receiveShadow = true;
        track.position.set(14, 0, -66);
        track.rotation.y = -0.2;
        track.name = "SmallGroud";
        scene.add(track);
        console.log("Added small track to scene");
        //FirstAidKit
        firstAidTexture = new THREE.TextureLoader().load('../../Assets/images/firstaid1.png');
        firstAidTexture.wrapS = THREE.RepeatWrapping;
        firstAidTexture.wrapT = THREE.RepeatWrapping;
        firstAidTexture.repeat.set(1, 1);
        firstAidGeometry = new BoxGeometry(2, 1, 2);
        firstAidMaterial = new PhongMaterial({ map: firstAidTexture });
        firstAid = new Physijs.BoxMesh(firstAidGeometry, firstAidMaterial, 1);
        firstAid.receiveShadow = true;
        firstAid.position.set(1, 10, -35);
        firstAid.name = "FirstAid";
        scene.add(firstAid);
        console.log("Added FirstAid item to scene");
        //Coke
        cokeTexture = new THREE.TextureLoader().load('../../Assets/images/coke.png');
        cokeTexture.wrapS = THREE.RepeatWrapping;
        cokeTexture.wrapT = THREE.RepeatWrapping;
        cokeTexture.repeat.set(1, 1);
        cokeGeometry = new CylinderGeometry(0.2, 0.2, 0.5, 29);
        cokeMaterial = new PhongMaterial({ map: cokeTexture });
        coke = new Physijs.CylinderMesh(cokeGeometry, cokeMaterial, 1);
        coke.receiveShadow = true;
        coke.position.set(3, 4, -15);
        coke.name = "Coke";
        scene.add(coke);
        console.log("Added Coke item to scene");
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
        //collision check
        player.addEventListener('collision', function (event) {
            if (event.name === "Ground") {
                console.log("player hit the ground");
                isGrounded = true;
            }
            if (event.name === "Respawn") {
                isDied = true;
                console.log("player died");
            }
            if (event.name === "Coke") {
                isDied = true;
                console.log("Pick up coke item");
            }
            if (event.name === "FirstAid") {
                isDied = true;
                console.log("Pick up FirstAid item");
            }
            if (event.name === "StoneGround") {
                isPassed = true;
                console.log("test");
            }
            if (event.name === "Stone") {
                isPassed = true;
                console.log("Stone");
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
        player.add(spotLight);
        spotLight.position.set(10, 30, -25);
        // Stone Object(Test)
        /*
        stoneTexture = new THREE.TextureLoader().load('../../Assets/images/stone.jpg');
        stoneTexture.wrapS = THREE.RepeatWrapping;
        stoneTexture.wrapT = THREE.RepeatWrapping;
        stoneTexture.repeat.set(1, 1);
                
        stoneGeometry = new SphereGeometry(0.5,5,5);
        stoneMaterial = new PhongMaterial({map : stoneTexture});
        stone = new Physijs.SphereMesh(stoneGeometry, stoneMaterial, 1);
        stone.position.set(4, 60, 10);
        stone.position.set(Math.random()*18-10, 14, Math.random()*5-49);
        stone.receiveShadow = true;
        stone.castShadow = true;
        stone.name = "Stone";
        scene.add(stone);
        console.log("Added Stone to the scene : "+stone.position.z);
        */
        // Add framerate stats
        addStatsObject();
        console.log("Added Stats to scene...");
        document.body.appendChild(renderer.domElement);
        gameLoop(); // render the scene	
        scene.simulate();
        window.addEventListener('resize', onWindowResize, false);
    }
    //PointerLockChange Event Handler
    function pointerLockChange(event) {
        if (document.pointerLockElement === element) {
            // enable our mouse and keyboard controls
            keyboardControls.enabled = true;
            mouseControls.enabled = true;
            blocker.style.display = 'none';
        }
        else {
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
    function pointerLockError(event) {
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
    function gameLoop() {
        stats.update();
        checkControls();
        stage.update();
        // render using requestAnimationFrame
        requestAnimationFrame(gameLoop);
        // render the scene
        renderer.render(scene, camera);
    }
    function checkControls() {
        if (keyboardControls.enabled) {
            velocity = new Vector3();
            var time = performance.now();
            var delta = (time - prevTime) / 1000;
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
            } //isGrounded ends
            //reset pitch and yaw
            mouseControls.pitch = 0;
            mouseControls.yaw = 0;
            prevTime = time;
        } //controls enabled ends
        else {
            player.setAngularVelocity(new Vector3(0, 0, 0));
        }
    }
    //Camera look function 
    function cameraLook() {
        var zenith = THREE.Math.degToRad(90);
        var nadir = THREE.Math.degToRad(-90);
        var cameraPitch = camera.rotation.x + mouseControls.pitch;
        //constrain the camera pitch
        camera.rotation.x = THREE.Math.clamp(cameraPitch, nadir, zenith);
    }
    // Setup default renderer
    function setupRenderer() {
        renderer = new Renderer({ antialias: true });
        renderer.setClearColor(0x404040, 1.0);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(CScreen.WIDTH, CScreen.HEIGHT);
        renderer.shadowMap.enabled = true;
        console.log("Finished setting up Renderer...");
    }
    // Setup main camera for the scene
    function setupCamera() {
        camera = new PerspectiveCamera(35, config.Screen.RATIO, 0.1, 100);
        //camera.position.set(0, 10, 30);
        //camera.lookAt(new Vector3(0, 0, 0));
        console.log("Finished setting up Camera...");
    }
    window.onload = preload;
    return {
        scene: scene
    };
})();

//# sourceMappingURL=game.js.map
