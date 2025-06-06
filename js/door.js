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