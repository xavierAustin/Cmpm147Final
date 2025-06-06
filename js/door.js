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
        this.range = new COLLIDER(TILESIZE*4, TILESIZE*4, x-TILESIZE, y-TILESIZE);
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
        }
    }

    draw() {
        if (this.state == "open"){
            this.p.image(this.imgOpen, this.x, this.y, this.size, this.size);
            this.p.noStroke();
            this.p.fill("hsl(265°, 69%, 94%)");
            this.p.rect(this.x+this.halfTile,this.y,TILESIZE, TILESIZE*2);
        }else if (this.state == "closed")
            this.p.image(this.imgClosed, this.x, this.y, this.size, this.size);
        else
            this.p.image(this.imgUnlocked, this.x, this.y, this.size, this.size);
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
        this.col = new COLLIDER(TILESIZE*2,TILESIZE*2,x,y);
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
}