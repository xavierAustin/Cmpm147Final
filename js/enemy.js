class ENEMY {
    constructor(p, x, y, size = 40) {
        this.p = p;
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = this.p.color(255, 0, 0);
    }
    update() {
        // For now, enemy is static. You could add movement here later.
    }
    draw() {
        this.p.push();
        this.p.fill(this.color);
        this.p.noStroke();
        this.p.rect(this.x, this.y, this.size, this.size);
        this.p.pop();
    }
    getBounds() {
        return {x: this.x, y: this.y, w: this.size, h: this.size};
    }
}

