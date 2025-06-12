const COLLIDERDEBUG = false;
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
    p.preload = function(){
        p.font = p.loadFont('./assets/fonts/DotGothic16-Regular.ttf');

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
        
        //door sprites
        p.doorClosedImg = p.loadImage('./assets/closed_door.png');
        p.doorOpenImg = p.loadImage('./assets/openopen_door.png');
        p.doorUnlockedImg = p.loadImage('./assets/open_door.png');
        p.usedDoorImg = p.loadImage('./assets/used_door.png');

        //Sound effects
        p.jumpSound = new Audio('./assets/jump1.ogg');
        p.stepSound = new Audio('./assets/step.ogg');
        p.keySound = new Audio('./assets/powerUp2.ogg');
        p.overSound = new Audio('./assets/powerUp1.ogg');
    }

    p.setup = function(){
        p.createCanvas(1080,810).parent("canvasContainer");
        p.select("canvas").elt.getContext("2d").imageSmoothingEnabled = false;
        //remove some caret browsing features (if we use space as an input it wont forcibly shoot the user to the bottom of the page)
        window.addEventListener("keydown", function(e) { if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Tab"].indexOf(e.code) > -1) {e.preventDefault();}}, false);
        p.cameraOffset = {x:0,y:0};
        p.worldWidth = 100 * TILESIZE; // Set world width to 100 tiles (modified by LEVEL)
        
        //stuff for placeholder images remove if an actual custom sprite or anim is made for jump/fall
        p.playerSprites.jump.push(p.playerSprites.run.at(-1));
        p.playerSprites.jumpUp.push(p.playerSprites.runUp.at(-1));
        p.playerSprites.jumpDw.push(p.playerSprites.runDw.at(-1));
        p.playerSprites.fall.push(p.playerSprites.run.at(0));
        p.playerSprites.fallUp.push(p.playerSprites.runUp.at(0));
        p.playerSprites.fallDw.push(p.playerSprites.runDw.at(0));

        let button = document.getElementById("randomizeBtn");
        button.addEventListener("click", p.reset);

        let input = document.getElementById("seedInput");
        input.addEventListener("keypress", p.setSeed);

        button = document.getElementById("doubleJmpBtn");
        button.addEventListener("click", p.toggleDoubleJump);

        //generate level (creates player, doors, keys, etc.)
        p.randomSeed();
        p.level = new LEVEL(p,p.tiles);
        p.reset(0,false);
        p.widthHalf = p.width/2;
        p.heightHalf = p.height/2;
        p.canDoubleJump = false;

        p.dropShadow = (blur, y, color = p.color(0,0,0,64)) =>{
            if (Array.isArray(color)){
                color = p.color(color);
            }
            p.drawingContext.shadowColor = color;
            p.drawingContext.shadowBlur = blur;
            p.drawingContext.shadowOffsetY = y;
        }
        p.clearDropShadow = () =>{
            p.drawingContext.shadowColor = p.color(0,0,0,0);
            p.drawingContext.shadowBlur = 0;
            p.drawingContext.shadowOffsetY = 0; 
        }
        p.textFont(p.font);
        p.stepSound.loop = true;
    }

    p.setSeed = function(ev){
        //console.log(ev)
        if (ev.code == "Enter"){
            p.randomSeed(parseInt(document.getElementById("seedInput").value,36));
            p.reset();
        }
    }

    p.reset = function(score = 0, doTransition = true){
        if (doTransition === true)
            p.transitionOut = 36;
        p.level = new LEVEL(p,p.tiles);
        p.score = Number.isInteger(score) ? score : 0;
    }

    p.toggleDoubleJump = function(){
        p.canDoubleJump = !p.canDoubleJump;
        document.getElementById("doubleJmpBtn").innerHTML = "More Movement Mode (Currently "+(p.canDoubleJump? "On" : "Off")+")";
        p.reset();
    }

    p.draw = function(){
        if (p.transitionOut){
            p.overSound.play();
            p.push();
            p.fill(0,0,0,255)
            let t = 36 - p.transitionOut;
            p.rect(0,      0, t*p.width/36,p.height);
            p.rect(p.width,0,-t*p.width/36,p.height);
            p.rect(0,0,       p.width, t*p.height/36);
            p.rect(0,p.height,p.width,-t*p.height/36);
            p.transitionOut -= 1 * (p.transitionOut > 0);
            p.transitionIn = 36 + (p.score != 0) * 60;
            p.pop();
            //let t = (p.frameCount - p.transitionOut)/5;
            //p.translate(p.width/2, p.height/2);
            //p.rotate(t);
            //p.ellipse(0, t*t/2, t*t/2, t*t);
            //p.transitionOut = p.transitionOut * (t < 36);
            return;
        }
        // Update camera position to follow player
        let targetOffset = {
            x: p.player.col.getPosition("x") - p.widthHalf + p.player.facing * TILESIZE + p.player.col.getBounds("w"),
            y: p.player.col.getPosition("y") - p.heightHalf + p.player.aim * TILESIZE*4 + TILESIZE
        } ;
        p.cameraOffset.x = p.lerp(p.cameraOffset.x, targetOffset.x, 0.1);
        p.cameraOffset.y = p.lerp(p.cameraOffset.y, targetOffset.y, 0.1);
        
        // Clamp camera offset to world bounds
        p.cameraOffset.x = p.constrain(p.cameraOffset.x, 0, p.worldWidth - p.width);
        p.cameraOffset.y = Math.min(p.cameraOffset.y, 0);

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
        
        //if the death barier or door calls p.reset this stops the next frame from drawing
        if (p.transitionOut)
            return;

        //draw background
        //p.image(p.backgroundImage,0,0,p.width,p.height)
        parallaxBackground(p);
        //p.image(p.bigPlatformTile,0,0,TILESIZE*2,TILESIZE*2)

        //move the camera around player position
        p.push();
        p.translate(-p.cameraOffset.x, -p.cameraOffset.y);

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
        p.dropShadow(4, 4, [0,0,0,255]);
        p.text(`Keys: ${p.keysCollected} / ${p.totalKeys}\nScore: ${p.score}`, 20, 30);
        //text visibility issues? just draw it twice :5head:
        p.text(`Keys: ${p.keysCollected} / ${p.totalKeys}\nScore: ${p.score}`, 20, 30);
        p.pop();
        //console.log(p.deltaTime)
        
        if (p.transitionIn){
            p.push();
            p.fill(0,0,0,255)
            let t = p.transitionIn;
            p.rect(0,      0, t*p.width/36,p.height);
            p.rect(p.width,0,-t*p.width/36,p.height);
            p.rect(0,0,       p.width, t*p.height/36);
            p.rect(0,p.height,p.width,-t*p.height/36);
            p.transitionIn -= 1 * (p.transitionIn > 0);
            p.fill(255,255,255,255);
            p.textSize(80);
            p.textAlign(p.CENTER,p.CENTER);
            p.text((p.transitionIn > 36)? `Well Done!\nScore: ${p.score}`:"", p.width/2, p.height/2);
            p.pop();
        }
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
        p.stepSound.pause();
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
