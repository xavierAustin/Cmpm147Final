class DECORE {
    constructor(p, x, y, img) {
        this.p = p;
        this.x = x;
        this.y = y;
        this.img = img
    }
    swapImage(img){
        this.img = img;
    }
    draw() {
        this.p.image(this.img, this.x, this.y, this.img.width * 4, this.img.height * 4);
    }
}