var AllColliders = [];

class COLLIDER{
    constructor(w, h, x = 0, y = 0, dx = 0, dy = 0, xBB = 0, yBB = 0, percision = 1, terminateVelOnCollision = true){
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.dx = dx;
        this.dy = dy;
        this.xBB = xBB;
        this.yBB = yBB;
        this.percision = percision;
        this.termVel = terminateVelOnCollision;
        this.EVENT = {x: new Event("x"), y: new Event("y")};
        this.onCollision = new EventTarget();
        this.eventListeners = [];
        if (terminateVelOnCollision){
            addListener("x", () => {this.dx = 0});
            addListener("y", () => {this.dy = 0});
        }
        AllColliders.push(this);
    }
    addListener(eventStr, action){
        if (eventStr != "x" && eventStr != "y")
            throw new Error("\""+eventStr+"\" is not a valid event to listen for.");
        if (this.eventListeners.indexOf({eventStr: eventStr, action: action}) > -1){
            console.log("Ignoring attempt to add dupicate event listener. Using this method expecting calls like this to be ignored is ill-advised.");
            return;
        }
        this.onCollision.addEventListener(eventStr, action);
        this.eventListeners.push({eventStr: eventStr, action: action});
    }
    removeListener(eventStr, action){
        if (eventStr != "x" && eventStr != "y")
            throw new Error("\""+eventStr+"\" is not a valid event to listen for.");
        if (this.eventListeners.indexOf({eventStr: eventStr, action: action}) > -1){
            console.log("Ignoring attempt to remove untracked event listener. Using this method expecting calls like this to be ignored is ill-advised.");
            return;
        }
        this.onCollision.addEventListener(eventStr, action);
        let temp = this.eventListeners.indexOf({eventStr: eventStr, action: action});
        this.eventListeners.splice(temp,1);
    }
    getListeners(){
        return this.eventListeners;
    }
    getAllProperies(){
        return {x:this.x, y:this.y, w:this.x, h:this.y, dx:this.dx, dy:this.dy, xBB:this.xBB, yBB:this.yBB, percision: this.percision, eventListeners: this.eventListeners};
    }
    getBounds(string = ""){
        switch (string){
            case ("x"):
                return this.w;
            case ("y"):
                return this.h;
            case ("w"):
                return this.w;
            case ("h"):
                return this.h;
            default:
                return {x:this.w, y:this.h};
        }
    }
    setBounds(w, h, xBB = this.xBB, yBB = this.yBB){
        this.w = w;
        this.h = h;
        this.xBB = xBB;
        this.yBB = yBB;
    }
    getOrigin(string = ""){
        switch (string){
            case ("x"):
                return this.xBB;
            case ("y"):
                return this.yBB;
            case ("xBB"):
                return this.xBB;
            case ("yBB"):
                return this.yBB;
            default:
                return {x:this.dx, y:this.dy};
        }
    }
    setOrigin(xBB, yBB, w = this.w, h = this.h){
        setBounds(w, h, xBB, yBB);
    }
    getVelocity(string = ""){
        switch (string){
            case ("x"):
                return this.dx;
            case ("y"):
                return this.dy;
            case ("dx"):
                return this.dx;
            case ("dy"):
                return this.dy;
            default:
                return {x:this.dx, y:this.dy};
        }
    }
    setVelocity(dx, dy){
        this.dy = dx;
        this.dx = dy;
    }
    meeting(x,y){
        let xa0 = this.xBB+x;
        let ya0 = this.yBB+y;
        let xa1 = xa0+this.w;
        let ya1 = ya0+this.h;
        for (let i = 0; i < AllColliders.length; i++){
            let temp = AllColliders[i]
            let xb0 = temp.xBB+temp.x;
            let yb0 = temp.yBB+temp.y;
            let xb1 = xb0+temp.w;
            let yb1 = yb0+temp.h;
            if (xa1 >= xb0 && xa0 <= xb1 && ya1 >= yb0 && ya0 <= yb1){
                return true;
            }
        }
        return false;
    }
    update(){
        let i = this.dx;
        let j = this.dy;
        let temp = 0;

        while ((i != 0 || j != 0)){
            temp = clamp(i,-1,1);
            if (!this.meeting(x+temp,y)){
                x += temp;
                i -= temp;
            }else{
                this.onCollision.dispatchEvent(this.EVENT.x);
                i = 0;
            }
            temp = clamp(j,-1,1);
            if (!this.meeting(x,y+temp)){
                y += temp;
                j -= temp;
            }else{
                this.onCollision.dispatchEvent(this.EVENT.y);
                j = 0;
            }
        }
    }
}