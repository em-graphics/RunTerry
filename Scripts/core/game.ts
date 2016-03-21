/*
Source file name : game.ts
Author : Eunmi Han(300790610)
Date last Modified : Mar 11, 2016
Program Description : Main controls 
Revision History : 1.01 - Initial Setup(3.11) by E
                   1.02 - Add mouse controls(3.17) by E
                   1.03 - Add items and texture(3.18)
                                      
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

//Custom Game Objects
import gameObject = objects.gameObject;

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
    var groundGeometry: CubeGeometry;
    var groundMaterial: PhongMaterial;
    var ground: Physijs.Mesh;
    var groundTexture: Texture;
    var groundPhysicsMaterial: Physijs.Material;
    var clock: Clock;
    var playerGeometry: CubeGeometry;
    var playerMaterial: Physijs.Material;
    var player: Physijs.Mesh;
    var fenceGeometry: CubeGeometry;
    var fenceMaterial: Physijs.Material;
    var fence: Physijs.Mesh;
    var stoneGeometry: SphereGeometry;
    var stoneMaterial: PhongMaterial;
    var stoneTexture: Texture;
    var stone: Physijs.Mesh;
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
    var respawnGeometry: CubeGeometry;
    var respawnMaterial: Physijs.Material;
    var respawn: Physijs.Mesh;
    
    var firstAidGeometry: CubeGeometry;
    var firstAidMaterial: PhongMaterial;
    var firstAid: Physijs.Mesh;
    var firstAidTexture: Texture;
  
    
    var cokeGeometry: CylinderGeometry;
    var cokeMaterial: PhongMaterial;
    var coke: Physijs.Mesh;
    var cokeTexture: Texture;
    
    var isPassed:boolean;

    function init() {
        // Create to HTMLElements
        blocker = document.getElementById("blocker");
        instructions = document.getElementById("instructions");

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
        respawnGeometry = new BoxGeometry(300,0.5,300);
        respawnMaterial = Physijs.createMaterial(new LambertMaterial({ color: 0x000000 }), 0.4, 0);
        respawn = new Physijs.ConvexMesh(respawnGeometry, respawnMaterial, 0);
        respawn.position.set(0,-10,0);
        respawn.name="Respawn";
        
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
        ground.position.set(21,0,-96);
        ground.rotation.y = -0.2;
        ground.name = "Ground";
        scene.add(ground);
        console.log("Added runing track to scene");
        
        
        // fence
        fenceGeometry = new BoxGeometry(1, 5, 40);
        fenceMaterial = Physijs.createMaterial(new LambertMaterial({ color: 0x000000 }), 0.4, 0);
        fence = new Physijs.ConvexMesh(fenceGeometry, fenceMaterial, 0);
        fence.receiveShadow = true;
        fence.position.set(10,3,0);
        fence.name = "Fence";
        scene.add(fence);
        
        fence = new Physijs.ConvexMesh(fenceGeometry, fenceMaterial, 0);
        fence.receiveShadow = true;
        fence.position.set(-10,3,0);
        fence.name = "Fence";
        scene.add(fence);
        console.log("Added fence to scene");
        
        
        // Small track
        trackGeometry = new CubeGeometry(20, 1, 15);
        trackMaterial = Physijs.createMaterial(groundMaterial, 0, 0);
        track = new Physijs.ConvexMesh(trackGeometry, trackMaterial, 0);
        track.receiveShadow = true;
        track.position.set(0.5,0,-32);
        track.rotation.y = -0.2;
        track.name = "StoneGround";
        scene.add(track);
        console.log("Added small track to scene");        
        
        track = new Physijs.ConvexMesh(trackGeometry, trackMaterial, 0);
        track.receiveShadow = true;
        track.position.set(7,0,-49);
        track.rotation.y = -0.2;
        track.name = "SmallGround";
        scene.add(track);
        console.log("Added small track to scene");
        
        track = new Physijs.ConvexMesh(trackGeometry, trackMaterial, 0);
        track.receiveShadow = true;
        track.position.set(14,0,-66);
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
        firstAidMaterial = new PhongMaterial( {map: firstAidTexture});
        firstAid = new Physijs.BoxMesh(firstAidGeometry,firstAidMaterial,1);
        firstAid.receiveShadow = true;
        firstAid.position.set(1,10,-35);
        firstAid.name = "FirstAid";
        scene.add(firstAid);
        console.log("Added FirstAid item to scene");
        
        //Coke
        cokeTexture = new THREE.TextureLoader().load('../../Assets/images/coke.png');
        cokeTexture.wrapS = THREE.RepeatWrapping;
        cokeTexture.wrapT = THREE.RepeatWrapping;
        cokeTexture.repeat.set(1, 1);
        
        cokeGeometry = new CylinderGeometry(0.2,0.2,0.5,29);
        cokeMaterial = new PhongMaterial({map:cokeTexture});
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
        player.addEventListener('collision', (event) => {
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
    
    function respawnPoint():void{
         player.position.set(0,15,0);
     }

    // Setup main game loop
    function gameLoop(): void {
        stats.update();

        checkControls();
        
             
        
        // render using requestAnimationFrame
        requestAnimationFrame(gameLoop);

        // render the scene
        renderer.render(scene, camera);
        
        
    }
    
    
    
    function checkControls():void {
        
        if (keyboardControls.enabled) {
            velocity = new Vector3();
            
            var time: number = performance.now();
            var delta: number = (time - prevTime) / 1000;

            if (isGrounded) {
                var direction = new Vector3(0,0,0);
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
             
                    if(player.position.y > 4){
                        isGrounded = false;
                    }
                }
                player.setDamping(0.7, 0.1);
                //changing player's rotation
                player.setAngularVelocity(new Vector3(0, mouseControls.yaw,0));
                direction.addVectors(direction, velocity);
                direction.applyQuaternion(player.quaternion);
                if(Math.abs(player.getLinearVelocity().x) < 20 && Math.abs(player.getLinearVelocity().y) < 10) {
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
            player.setAngularVelocity(new Vector3(0,0,0));
        }
    }
    
    //Camera look function 
    function cameraLook():void{
        var zenith:number = THREE.Math.degToRad(90);
        var nadir:number = THREE.Math.degToRad(-90);
        
        var cameraPitch:number = camera.rotation.x + mouseControls.pitch;
         
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

    window.onload = init;

    return {
        scene: scene
    }

})();

