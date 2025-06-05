// Door class: blocks player until key is collected, then opens
class Door {
    constructor(p, x, y, imgClosed, imgOpen, tileSize) {
        this.p = p;
        this.x = x;
        this.y = y;
        this.imgClosed = imgClosed;
        this.imgOpen = imgOpen;
        this.size = tileSize*2;
        this.open = false;
        this.col = new COLLIDER(tileSize*2, tileSize*2, x, y);
    }

    update() {
        if (!this.open && this.p.keysCollected >= this.p.totalKeys) {
            this.open = true;
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
        const img = this.open ? this.imgOpen : this.imgClosed;
        this.p.image(img, this.x, this.y, this.size, this.size);
    }
}

// Key class: handles drawing and overlapping logic for a single key
class Key {
    constructor(p, x, y, img, tileSize) {
        this.p = p;
        this.x = x;
        this.y = y;
        this.img = img;
        this.collected = false;
        this.size = tileSize*2;
        this.col = new COLLIDER(tileSize*2,tileSize*2,x,y);
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