const COLLIDERDEBUG = false;

const KEYMMAP = {
    KeyS: 'down',
    ArrowDown: 'down',
    KeyA: 'left',
    ArrowLeft: 'left',
    KeyW: 'up',
    ArrowUp: 'up',
    KeyD: 'right',
    ArrowRight: 'right',
    KeyZ: 'jump',
    Space: 'jump',
    ShiftLeft: 'act',
    ShiftRight: 'act',
    KeyX: 'act'
};

inputs = {
    jump: {r:false,p:false,h:false},
    act: {r:false,p:false,h:false},
    up: {r:false,p:false,h:false},
    down: {r:false,p:false,h:false},
    left: {r:false,p:false,h:false},
    right: {r:false,p:false,h:false}
}

platformAreas = [
    [[1,1,1,1,1]], // Wide horizontal platform
    [[1,1,1]], // Shorter horizontal platform
    [[0,1,1,1,0]], // slightly staggered horizontal platform
    [[1,0,0,0,1]]
]

s = function(p){
    p.preload = function(){
        p.basePlatformTile = p.loadImage('./assets/BasePlatformTile.png')
        p.playerSprites = {
            idle: [p.loadImage('./assets/player/idle.png')],
            idleUp: [p.loadImage('./assets/player/idle_lookup.png')],
            idleDw: [p.loadImage('./assets/player/idle_lookdown.png')],
            run: [p.loadImage('./assets/player/run0.png'),p.loadImage('./assets/player/run1.png'),p.loadImage('./assets/player/run2.png')],
            runUp: [p.loadImage('./assets/player/run0_lookup.png'),p.loadImage('./assets/player/run1_lookup.png'),p.loadImage('./assets/player/run2_lookup.png')],
            runDw: [p.loadImage('./assets/player/run0_lookdown.png'),p.loadImage('./assets/player/run1_lookdown.png'),p.loadImage('./assets/player/run2_lookdown.png')],
            jump: [],
            jumpUp: [],
            jumpDw: [],
            fall: [],
            fallUp: [],
            fallDw: [],
            crouch: [p.loadImage('./assets/player/duck.png')],
            crawl: [p.loadImage('./assets/player/worm0.png'),p.loadImage('./assets/player/worm0.png'),p.loadImage('./assets/player/worm1.png'),p.loadImage('./assets/player/worm1.png'),p.loadImage('./assets/player/worm2.png'),p.loadImage('./assets/player/worm2.png'),p.loadImage('./assets/player/worm3.png'),p.loadImage('./assets/player/worm3.png')],
            sit: [p.loadImage('./assets/player/sit.png')],
            sleep: [p.loadImage('./assets/player/sleep.png')],
            grapple: p.loadImage('./assets/player/grapple.png')
        };
        //box sprite
        p.box = p.loadImage('./assets/box.png');
    }
    p.setup = function(){
        p.createCanvas(1080,810).parent("canvasContainer");
        //if we're using pixel art this'd be a good idea
        p.select("canvas").elt.getContext("2d").imageSmoothingEnabled = false;
        //remove some caret browsing features (if we use space as an input it wont forcibly shoot the user to the bottom of the page)
        window.addEventListener("keydown", function(e) { if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Tab"].indexOf(e.code) > -1) {e.preventDefault();}}, false);
        p.cameraOffset = 0;
        p.worldWidth = p.width * 2; // Set world width to 2x window width
        
        
        //stuff for placeholder images remove if an actual custom sprite or anim is made for jump/fall
        p.playerSprites.jump.push(p.playerSprites.run.at(-1));
        p.playerSprites.jumpUp.push(p.playerSprites.runUp.at(-1));
        p.playerSprites.jumpDw.push(p.playerSprites.runDw.at(-1));
        p.playerSprites.fall.push(p.playerSprites.run.at(0));
        p.playerSprites.fallUp.push(p.playerSprites.runUp.at(0));
        p.playerSprites.fallDw.push(p.playerSprites.runDw.at(0));
        //create player
        p.player = new PLAYER(p, p.playerSprites);

        //debug floor and platforms
        p.floor = new COLLIDER(p.worldWidth, 32, 0, p.height-32);
        p.randomSeed();
        p.platforms = [];
        p.tileSize = 40;
        p.generatePlatforms();

        let button = document.getElementById("randomizeBtn");
        button.addEventListener("click", () => {
            AllColliders = []; // clear colliders (dangerous!)
            p.generatePlatforms(); // regenerate platforms
            // reset player to ground
            p.player = new PLAYER(p, p.playerSprites); //respawn player
        });

    }
    p.draw = function(){
        p.background(125);

        // Update camera position to follow player
        let targetOffset = p.player.col.getPosition("x") - p.width/2;
        p.cameraOffset = p.lerp(p.cameraOffset, targetOffset, 0.1);
        
        // Clamp camera offset to world bounds
        p.cameraOffset = p.constrain(p.cameraOffset, 0, p.worldWidth - p.width);
        
        //move the camera around player position
        p.push();
        p.translate(-p.cameraOffset, 0);
        
        //update player
        p.player.update();
        //update stuff

        //debug colision draw
        for (let i = 0; i < COLLIDERDEBUG * AllColliders.length; i ++){
            p.rect(AllColliders[i].x+AllColliders[i].xBB,AllColliders[i].y+AllColliders[i].yBB,AllColliders[i].w,AllColliders[i].h)
        }
        //draw player
        p.player.draw();
        //draw stuff

        //update inputs such that pressed and released only occur for the frame they are pressed/released
        let keys = Object.getOwnPropertyNames(inputs);
        for (let i = 0; i < keys.length; i++){
            inputs[keys[i]].p = false;
            inputs[keys[i]].r = false;
        }
        p.rect(0,p.height-32, p.worldWidth,32) //floor
        for (let y = 0; y < p.height/p.tileSize; y++) {
            for (let x = 0; x < p.worldWidth/p.tileSize; x++) {
                if (p.platforms[y][x] == 1) {
                    p.image(p.basePlatformTile, x*p.tileSize, y*p.tileSize+18, p.tileSize, p.tileSize)
                }
            }
        }
        p.pop();
    }

    p.keyPressed = function(e) {
        const action = KEYMMAP[e.code];
        if (action) {
            inputs[action] = { r: false, p: true, h: true };
        }
    }

    p.keyReleased = function(e) {
        const action = KEYMMAP[e.code];
        if (action) {
            inputs[action] = { r: true, p: false, h: false };
        }
    }


    p.generatePlatforms = function() {
        for (let y = 0; y < p.height/p.tileSize; y++) {
            p.platforms[y] = []
        }
        for (let y = 0; y < p.height/p.tileSize; y++) {
            for (let x = 0; x < p.worldWidth/p.tileSize; x++) {
                if (x < 5) {
                    p.platforms[y][x] = -1
                } else if (p.random() < 0.01) {
                    p.generateSubArea(0,x,y)
                } else if (p.random() < 0.02) {
                    p.generateSubArea(1,x,y)
                } else if (p.platforms[y][x] == null) {
                    p.platforms[y][x] = 0
                }
            }
        }
        // Add walls at both ends of the level
        for (let y = 0; y < p.height/p.tileSize; y++) {
            // Left wall
            p.platforms[y][0] = 1;
            new COLLIDER(p.tileSize, p.tileSize, 0, y*p.tileSize+18);
            
            // Right wall
            p.platforms[y][p.worldWidth/p.tileSize - 1] = 1;
            new COLLIDER(p.tileSize, p.tileSize, (p.worldWidth/p.tileSize - 1)*p.tileSize, y*p.tileSize+18);
        }
        // Fill bottom row with solid tiles and colliders
        let bottomRow = Math.floor(p.height / p.tileSize) - 1;
        for (let x = 0; x < p.worldWidth / p.tileSize; x++) {
            p.platforms[bottomRow][x] = 1;
            new COLLIDER(
                p.tileSize,
                p.tileSize,
                x * p.tileSize,
                bottomRow * p.tileSize + 18
            );
        }

        console.log(p.platforms)
    }

    p.generateSubArea = function(subAreaNum, x, y) {
        console.log(platformAreas[subAreaNum])
        for (let j = 0; j < platformAreas[subAreaNum].length; j++) {
            for (let i = 0; i < platformAreas[subAreaNum][0].length; i++) {
                console.log(i,j,platformAreas[subAreaNum][j][i])
                if (p.platforms[y+j] != undefined && platformAreas[subAreaNum][j][i] != 0) {
                    p.platforms[y+j][x+i] = platformAreas[subAreaNum][j][i]
                    new COLLIDER(p.tileSize, p.tileSize,(x+i)*p.tileSize, (y+j)*p.tileSize+18);
                }
            }
        }
    }
}

var myp5_1 = new p5(s, "container");