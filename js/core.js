const COLLIDERDEBUG = true;
const TILESIZE = 64;

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

s = function(p){

    // Remove any platform or collider at the door column (floor and one above)
    p.clearDoorArea = function() {
        const doorCol = Math.floor(p.worldWidth / TILESIZE) - 2;
        const bottomRow = Math.floor(p.height / TILESIZE) - 1;

        // Clear platform grid cells
        if (p.platforms[bottomRow]) {
            p.platforms[bottomRow][doorCol] = 0;
        }
        if (p.platforms[bottomRow - 1]) {
            p.platforms[bottomRow - 1][doorCol] = 0;
        }

        // Pixel coordinates for possible colliders
        const px = doorCol * TILESIZE;
        const pyFloor = bottomRow * TILESIZE + 18;
        const pyAbove = (bottomRow - 1) * TILESIZE + 18;

        // Destroy any colliders at those positions
        for (let c of [...AllColliders]) {
            if (
                (c.x === px && c.y === pyFloor) ||
                (c.x === px && c.y === pyAbove)
            ) {
                c.destroy();
            }
        }
    }

    p.preload = function(){
        p.tiles = {
            sml:[p.loadImage('./assets/baseplatformtilesmall.png'),p.loadImage('./assets/platformtilesmallrocky.png'),p.loadImage('./assets/DirtTile2.png')],
            big:[p.loadImage('./assets/BasePlatformTile.png'),p.loadImage('./assets/DirtTile.png')]
        };
        p.bigPlatformTile = p.loadImage('./assets/BasePlatformTile.png');
        p.forestBackground1 = p.loadImage('./assets/forestBackground1.png')
        p.forestBackground2 = p.loadImage('./assets/forestBackground2.png')
        p.hillsBackground = p.loadImage('./assets/hillsBackground1.png')
        p.mountainBackground1 = p.loadImage('./assets/mountainBackground1.png')
        p.mountainBackground2 = p.loadImage('./assets/mountainBackground2.png')
        p.cloudsBackground = p.loadImage('./assets/cloudsBackground.png')

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
        p.keyImage = p.loadImage('./assets/key.png');

        //box sprite
        p.box = p.loadImage('./assets/box.png');
        p.doorClosedImg = p.loadImage('./assets/closed_door.png');
        p.doorOpenImg = p.loadImage('./assets/openopen_door.png');
        p.doorUnlockedImg = p.loadImage('./assets/open_door.png');
    }

    p.setup = function(){
        p.createCanvas(1080,810).parent("canvasContainer");
        p.select("canvas").elt.getContext("2d").imageSmoothingEnabled = false;
        //remove some caret browsing features (if we use space as an input it wont forcibly shoot the user to the bottom of the page)
        window.addEventListener("keydown", function(e) { if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Tab"].indexOf(e.code) > -1) {e.preventDefault();}}, false);
        p.cameraOffset = 0;
        p.worldWidth = p.width * 3; // Set world width to 3x window width
        
        //stuff for placeholder images remove if an actual custom sprite or anim is made for jump/fall
        p.playerSprites.jump.push(p.playerSprites.run.at(-1));
        p.playerSprites.jumpUp.push(p.playerSprites.runUp.at(-1));
        p.playerSprites.jumpDw.push(p.playerSprites.runDw.at(-1));
        p.playerSprites.fall.push(p.playerSprites.run.at(0));
        p.playerSprites.fallUp.push(p.playerSprites.runUp.at(0));
        p.playerSprites.fallDw.push(p.playerSprites.runDw.at(0));

        let button = document.getElementById("randomizeBtn");
        button.addEventListener("click", p.reset);

        //create player
        //p.player = new PLAYER(p, p.playerSprites);
        p.level = new LEVEL(p,p.tiles);

        //debug floor and platforms
        p.floor = new COLLIDER(p.worldWidth, 32, 0, p.height-32);
        p.randomSeed();
        //p.platforms = [];
        //p.generatePlatforms();

        // Ensure no platform spawns on or above the door column
        //p.clearDoorArea();

        // Set up one key
        p.totalKeys = 1;
        p.keysCollected = 0;
        p.keys = [];
        p.spawnKeys();
        p.score = 0;

        // Set up the door one tile left of far-right
        const bottomRow = Math.floor(p.height / TILESIZE) - 1;
        const doorX = p.worldWidth - 3 * TILESIZE;
        const doorY = bottomRow * TILESIZE + 18 - TILESIZE * 2;
        p.door = new Door(p, doorX, doorY, p.doorClosedImg, p.doorUnlockedImg, p.doorOpenImg);

        /*
        //
        forest1Layer = p.createGraphics(p.width, p.height);
        forest1Layer.noSmooth()
        forest1Layer.image(forestBackground1, 0, 0, p.width/backgroundShrinkage, p.height/backgroundShrinkage);

        forest2Layer = p.createGraphics(p.width/backgroundShrinkage, p.height/backgroundShrinkage);
        forest2Layer.noSmooth()
        forest2Layer.image(forestBackground2, 0, 0, p.width/backgroundShrinkage, p.height/backgroundShrinkage);

        hillsLayer = p.createGraphics(p.width/backgroundShrinkage, p.height/backgroundShrinkage);
        hillsLayer.noSmooth()
        hillsLayer.image(hillsBackground, 0, 0, p.width/backgroundShrinkage, p.height/backgroundShrinkage);

        mountain1Layer = p.createGraphics(p.width/backgroundShrinkage, p.height/backgroundShrinkage);
        mountain1Layer.noSmooth()
        mountain1Layer.image(mountainBackground1, 0, 0, p.width/backgroundShrinkage, p.height/backgroundShrinkage);

        mountain2Layer = p.createGraphics(p.width/backgroundShrinkage, p.height/backgroundShrinkage);
        mountain2Layer.noSmooth()
        mountain2Layer.image(mountainBackground2, 0, 0, p.width/backgroundShrinkage, p.height/backgroundShrinkage);

        cloudsLayer = p.createGraphics(p.width/backgroundShrinkage, p.height/backgroundShrinkage);
        cloudsLayer.noSmooth()
        cloudsLayer.image(cloudsBackground, 0, 0, p.width, p.height);
        */
    }

    p.spawnKeys = function() {
        /*const rows = Math.floor(p.height / TILESIZE);
        const cols = Math.floor(p.worldWidth / TILESIZE);

        const candidates = [];
        for (let ty = 1; ty < rows; ty++) {
            for (let tx = 0; tx < cols; tx++) {
                if (p.platforms[ty][tx] === 1) {
                    const above = p.platforms[ty - 1][tx];
                    if (above === 0 || above === null) {
                        candidates.push({ tx, ty });
                    }
                }
            }
        }

        if (candidates.length < p.totalKeys) {
            console.warn("Not enough surface tiles to place keys.");
            return;
        }

        const idx = Math.floor(p.random(0, candidates.length));
        const { tx, ty } = candidates[idx];
        const keyPx = tx * TILESIZE;
        const keyPy = ty * TILESIZE + 18 - TILESIZE*2;
        const newKey = new Key(p, keyPx, keyPy, p.keyImage, TILESIZE);
        p.keys.push(newKey);*/
    }

    p.reset = function(){
        p.level = new LEVEL(p,p.tiles);
        //AllColliders = []; // clear colliders
        //p.generatePlatforms(); // regenerate platforms

        // Clear any platform under/above door again
        //p.clearDoorArea();

        // reset player to ground
        //p.player = new PLAYER(p, p.playerSprites); //respawn player
        // reset keys
        //p.spawnKeys();

        // reset door
        //if (p.door) 
        //    p.door.reset();
        //const br = Math.floor(p.height / TILESIZE) - 1;
        //const dX = p.worldWidth - 3 * TILESIZE;
        //const dY = br * TILESIZE + 18 - TILESIZE * 2;
        //p.door = new Door(p, dX, dY, p.doorClosedImg, p.doorUnlockedImg, p.doorOpenImg);
    }

    p.draw = function(){
        // Update camera position to follow player
        let targetOffset = p.player.col.getPosition("x") - p.width/2;
        p.cameraOffset = p.lerp(p.cameraOffset, targetOffset, 0.1);
        
        // Clamp camera offset to world bounds
        p.cameraOffset = p.constrain(p.cameraOffset, 0, p.worldWidth - p.width);

        //update door (open when key collected)
        p.door.update();

        //update player
        p.player.update();

        //update inputs such that pressed and released only occur for the frame they are pressed/released
        let keys = Object.getOwnPropertyNames(inputs);
        for (let i = 0; i < keys.length; i++){
            inputs[keys[i]].p = false;
            inputs[keys[i]].r = false;
        }

        //draw background
        //p.image(p.backgroundImage,0,0,p.width,p.height)
        parallaxBackground(p)
        //p.image(p.bigPlatformTile,0,0,TILESIZE*2,TILESIZE*2)

        //move the camera around player position
        p.push();
        p.translate(-p.cameraOffset, 0);

        //debug colision draw
        p.push();
        p.fill(255,255,255,50)
        for (let i = 0; i < COLLIDERDEBUG * AllColliders.length; i ++){
            p.rect(AllColliders[i].x+AllColliders[i].xBB,AllColliders[i].y+AllColliders[i].yBB,AllColliders[i].w,AllColliders[i].h)
        }
        p.pop();

        //draw stuff in the level (player, doors, keys, tiles, etc)
        p.level.draw();

        //revert from moving based on the camera position
        p.pop();

        // Draw HUD: always at top-left of canvas
        p.push();
        p.noStroke();
        p.fill(255);
        p.textSize(24);
        p.text(`Keys: ${p.keysCollected} / ${p.totalKeys}\nScore: ${p.score}`, 20, 30);
        p.pop();
        //console.log(p.deltaTime)
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
        for (let y = 0; y < p.height/TILESIZE; y++) {
            p.platforms[y] = []
        }
        for (let y = 0; y < p.height/TILESIZE; y++) {
            for (let x = 0; x < p.worldWidth/TILESIZE; x++) {
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
        for (let y = 0; y < p.height/TILESIZE; y++) {
            // Left wall
            p.platforms[y][0] = 1;
            new COLLIDER(TILESIZE, TILESIZE, 0, y*TILESIZE+18);
            
            // Right wall
            p.platforms[y][p.worldWidth/TILESIZE - 1] = 1;
            new COLLIDER(TILESIZE, TILESIZE, (p.worldWidth/TILESIZE - 1)*TILESIZE, y*TILESIZE+18);
        }
        // Fill bottom row with solid tiles and colliders
        let bottomRow = Math.floor(p.height / TILESIZE) - 1;
        for (let x = 0; x < p.worldWidth / TILESIZE; x++) {
            p.platforms[bottomRow][x] = 2;
            new COLLIDER(
                TILESIZE,
                TILESIZE,
                x * TILESIZE,
                bottomRow * TILESIZE + 18
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
                    new COLLIDER(TILESIZE, TILESIZE,(x+i)*TILESIZE, (y+j)*TILESIZE+18);
                }
            }
        }
    }
}

var myp5_1 = new p5(s, "container");
