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
        this.p.image(img, this.x, this.y, this.tileSize*2, this.tileSize*2);
    }
}

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
        this.p.image(this.img, this.x, this.y, this.w*2, this.h*2);
    }
}