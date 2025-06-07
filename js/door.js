// Door class: blocks player until key is collected, then opens
class Door {
    constructor(p, x, y, imgClosed, imgUnlocked, imgOpen) {
        this.p = p;
        this.x = x;
        this.y = y;
        this.imgClosed = imgClosed;
        this.imgUnlocked = imgUnlocked;
        this.imgOpen = imgOpen;
        this.size = TILESIZE*2;
        this.state = "closed";
        this.halfTile = TILESIZE/2;
        this.col = new COLLIDER(TILESIZE, TILESIZE*2, x, y, 0, 0, this.halfTile);
        //range will need to be updated to share a position with the colision box if doors ever move
        //in that case this.range.setPosition(); should be fine this.range.update(); is probably unneeded
        this.range = new COLLIDER(TILESIZE*6, TILESIZE*6, x, y, 0, 0, -TILESIZE*2, -TILESIZE*2);
        this.range.setIsPhantom(true);
    }

    update() {
        if (this.state == "closed" && this.p.keysCollected >= this.p.totalKeys) {
            this.state = "unlocked";
            let temp = () => {
                this.p.score ++;
                this.p.reset();
            }
            this.col.addListener("x",temp);
            this.col.addListener("y",temp);
            this.col.setIsPhantom(true);
            temp = () => {
                this.state = "open"
            }
            this.range.addListener("x",temp);
            this.range.addListener("y",temp);
        }
        if (this.state != "closed")
            this.state = "unlocked";
    }

    draw() {
        if (this.state == "open"){
            this.p.noStroke();
            this.p.fill(`hsl(${this.p.frameCount%360}, 85%, 62%)`);
            this.p.rect(this.x+this.halfTile,this.y,TILESIZE, this.size);
            this.p.image(this.imgOpen, this.x, this.y, this.size, this.size);
        }else if (this.state == "closed")
            this.p.image(this.imgClosed, this.x, this.y, this.size, this.size);
        else
            this.p.image(this.imgUnlocked, this.x, this.y, this.size, this.size);
    }

    reset(){
        this.col.destroy();
        this.col = null;
    }
}

// Key class: handles drawing and overlapping logic for a single key
class Key {
    constructor(p, x, y, img) {
        this.p = p;
        this.x = x;
        this.y = y;
        this.img = img;
        this.collected = false;
        this.size = TILESIZE*2;
        this.col = new COLLIDER(TILESIZE,TILESIZE,x,y,0,0,TILESIZE/2,TILESIZE/2);
        let temp = () => {
            this.collected = true;
            this.p.keysCollected++;
            this.col.destroy();
            this.col = null;
        }
        this.col.addListener("x",temp);
        this.col.addListener("y",temp);
        this.col.setIsPhantom(true);
    }

    draw() {
        if (this.collected) return;
        this.p.image(this.img, this.x, this.y, this.size, this.size);
    }

    reset() {
        this.p.keysCollected = 0;
        this.p.keys = [];
    }
}