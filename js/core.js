const COLLIDERDEBUG = true;

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
    [[0,1,1,1,0]] // slightly staggered horizontal platform
]

s = function(p){
    // Key class: handles drawing and overlapping logic for a single key
    class Key {
        constructor(p, x, y, img, tileSize) {
            this.p = p;
            this.x = x;
            this.y = y;
            this.img = img;
            this.tileSize = tileSize;
            this.collected = false;
            this.w = tileSize;
            this.h = tileSize;
        }

        update() {
            if (this.collected) return;
            const playerCol = this.p.player.col;
            const px0 = playerCol.x + playerCol.xBB;
            const py0 = playerCol.y + playerCol.yBB;
            const pw  = playerCol.w;
            const ph  = playerCol.h;

            const kx0 = this.x;
            const ky0 = this.y;
            const kw  = this.w;
            const kh  = this.h;

            // If player overlaps the key, mark collected and increment
            if (
                px0 < kx0 + kw &&
                px0 + pw > kx0 &&
                py0 < ky0 + kh &&
                py0 + ph > ky0
            ) {
                this.collected = true;
                this.p.keysCollected++;
            }
        }

        draw() {
            if (this.collected) return;
            this.p.image(this.img, this.x, this.y, this.w, this.h);
        }
    }

    // Door class: blocks player until key is collected, then opens
    class Door {
        constructor(p, x, y, imgClosed, imgOpen, tileSize) {
            this.p = p;
            this.x = x;
            this.y = y;
            this.imgClosed = imgClosed;
            this.imgOpen = imgOpen;
            this.tileSize = tileSize;
            this.open = false;
            this.col = new COLLIDER(tileSize, tileSize, x, y);
        }

        update() {
            if (!this.open && this.p.keysCollected >= this.p.totalKeys) {
                this.col.destroy();
                this.open = true;
            }
        }

        draw() {
            const img = this.open ? this.imgOpen : this.imgClosed;
            this.p.image(img, this.x, this.y, this.tileSize, this.tileSize);
        }
    }

    p.preload = function(){
        
    }

    // Remove any platform or collider at the door column (floor and one above)
    p.clearDoorArea = function() {
        const doorCol = Math.floor(p.worldWidth / p.tileSize) - 2;
        const bottomRow = Math.floor(p.height / p.tileSize) - 1;

        // Clear platform grid cells
        if (p.platforms[bottomRow]) {
            p.platforms[bottomRow][doorCol] = 0;
        }
        if (p.platforms[bottomRow - 1]) {
            p.platforms[bottomRow - 1][doorCol] = 0;
        }

        // Pixel coordinates for possible colliders
        const px = doorCol * p.tileSize;
        const pyFloor = bottomRow * p.tileSize + 18;
        const pyAbove = (bottomRow - 1) * p.tileSize + 18;

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

    // Place exactly one key on a valid surface tile
    p.spawnKeys = function() {
        const rows = Math.floor(p.height / p.tileSize);
        const cols = Math.floor(p.worldWidth / p.tileSize);

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
        const keyPx = tx * p.tileSize;
        const keyPy = ty * p.tileSize + 18 - p.tileSize;
        const newKey = new Key(p, keyPx, keyPy, p.keyImage, p.tileSize);
        p.keys.push(newKey);
    }

    p.setup = function(){
        p.createCanvas(1080,810).parent("canvasContainer");
        //if we're using pixel art this'd be a good idea
        p.select("canvas").elt.getContext("2d").imageSmoothingEnabled = false;
        //remove some caret browsing features (if we use space as an input it wont forcibly shoot the user to the bottom of the page)
        window.addEventListener("keydown", function(e) { if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Tab"].indexOf(e.code) > -1) {e.preventDefault();}}, false);
        p.cameraOffset = 0;
        p.worldWidth = p.width * 2; // Set world width to 2x window width
        p.player = new PLAYER(p, {
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
        });
        //stuff for placeholder images remove if an actual custom sprite or anim is made for jump/fall
        p.player.anim.jump.push(p.player.anim.run.at(-1));
        p.player.anim.jumpUp.push(p.player.anim.runUp.at(-1));
        p.player.anim.jumpDw.push(p.player.anim.runDw.at(-1));
        p.player.anim.fall.push(p.player.anim.run.at(0));
        p.player.anim.fallUp.push(p.player.anim.runUp.at(0));
        p.player.anim.fallDw.push(p.player.anim.runDw.at(0));

        //debug floor and platforms
        p.floor = new COLLIDER(p.worldWidth, 32, 0, p.height-32);
        p.randomSeed()
        p.platforms = [];
        p.tileSize = 40;
        p.generatePlatforms();
        p.generatePlatforms();

        // Ensure no platform spawns on or above the door column
        p.clearDoorArea();

        // Set up one key
        p.totalKeys = 1;
        p.keysCollected = 0;
        p.keys = [];
        p.keyImage = p.loadImage('./assets/key.png');
        p.spawnKeys();

        // Set up the door one tile left of far-right
        p.doorClosedImg = p.loadImage('./assets/closed_door.png');
        p.doorOpenImg = p.loadImage('./assets/open_door.png');
        const bottomRow = Math.floor(p.height / p.tileSize) - 1;
        const doorX = p.worldWidth - 2 * p.tileSize;
        const doorY = bottomRow * p.tileSize + 18 - p.tileSize;
        p.door = new Door(p, doorX, doorY, p.doorClosedImg, p.doorOpenImg, p.tileSize);

        p.gameWon = false;

        let button = document.getElementById("randomizeBtn");
        button.addEventListener("click", () => {
            AllColliders = []; // clear colliders
            p.generatePlatforms(); // regenerate platforms

            // Clear any platform under/above door again
            p.clearDoorArea();

            // reset player to ground
            p.player.col.setPosition(0,10); // Adjust X/Y as needed
            p.player.col.setVelocity(0,0); // Stop any falling motion
            p.player.state = "idle"; // Reset state so animations work as expected

            // reset keys
            p.keysCollected = 0;
            p.keys = [];
            p.spawnKeys();

            // reset door
            if (p.door && p.door.col) {
                try { p.door.col.destroy(); } catch(e) {}
            }
            const br = Math.floor(p.height / p.tileSize) - 1;
            const dX = p.worldWidth - 2 * p.tileSize;
            const dY = br * p.tileSize + 18 - p.tileSize;
            p.door = new Door(p, dX, dY, p.doorClosedImg, p.doorOpenImg, p.tileSize);

            p.gameWon = false;
        });

    }

    p.draw = function(){
        p.background(125);

        // If game is won, display win screen
        if (p.gameWon) {
            p.push();
            p.fill(0, 200);
            p.rect(0, 0, p.width, p.height);
            p.fill(255);
            p.textSize(48);
            p.textAlign(p.CENTER, p.CENTER);
            p.text("You Win!", p.width/2, p.height/2);
            p.pop();
            return;
        }
        
        // Update camera position to follow player
        let targetOffset = p.player.col.getPosition("x") - p.width/2;
        p.cameraOffset = p.lerp(p.cameraOffset, targetOffset, 0.1);
        
        // Clamp camera offset to world bounds
        p.cameraOffset = p.constrain(p.cameraOffset, 0, p.worldWidth - p.width);
        
        p.push();
        p.translate(-p.cameraOffset, 0);
        
        //update player
        p.player.update();

        //update key
        for (let k of p.keys) {
            k.update();
        }

        //update door (open when key collected)
        p.door.update();

        //check for win: if door is open and player overlaps it
        if (p.door.open) {
            const playerCol = p.player.col;
            const px0 = playerCol.x + playerCol.xBB;
            const py0 = playerCol.y + playerCol.yBB;
            const pw  = playerCol.w;
            const ph  = playerCol.h;

            const dx0 = p.door.x;
            const dy0 = p.door.y;
            const dw  = p.tileSize;
            const dh  = p.tileSize;

            if (
                px0 < dx0 + dw &&
                px0 + pw > dx0 &&
                py0 < dy0 + dh &&
                py0 + ph > dy0
            ) {
                p.gameWon = true;
            }
        }

        //debug colision draw
        for (let i = 0; i < COLLIDERDEBUG * AllColliders.length; i ++){
            p.rect(AllColliders[i].x+AllColliders[i].xBB,AllColliders[i].y+AllColliders[i].yBB,AllColliders[i].w,AllColliders[i].h)
        }
        //draw player
        p.player.draw();

        //draw key
        for (let k of p.keys) {
            k.draw();
        }

        //draw door
        p.door.draw();

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
                    p.rect(x*p.tileSize, y*p.tileSize+18, p.tileSize, p.tileSize)
                }
            }
        }
        p.pop();

        // Draw HUD: always at top-left of canvas
        p.push();
        p.noStroke();
        p.fill(255);
        p.textSize(24);
        p.text(`Keys: ${p.keysCollected} / ${p.totalKeys}`, 20, 30);
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
