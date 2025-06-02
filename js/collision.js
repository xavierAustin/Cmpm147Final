var AllColliders = [];

function clamp(x, min, max){
    return Math.max(min, Math.min(max, x));
}

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
        this.eventListenersX = [];
        this.eventListenersY = [];
        if (terminateVelOnCollision){
            this.addListener("x", () => {this.dx = 0});
            this.addListener("y", () => {this.dy = 0});
        }
        AllColliders.push(this);
    }
    destroy(){
        for (let i = 0; i < AllColliders.length; i ++){
            if (AllColliders[i] == this)
                AllColliders.splice(i,1);
        }
    }
    addListener(eventStr, action){
        if (this.eventListenersX.indexOf(action) < -1 && this.eventListenersY.indexOf(action) < -1){
            console.log("Ignoring attempt to add dupicate event listener. Using this method expecting calls like this to be ignored is ill-advised.");
            return;
        }
        if (eventStr == "x")
            this.eventListenersX.push(action);
        else if (eventStr == "y")
            this.eventListenersY.push(action);
        else
            throw new Error("\""+eventStr+"\" is not a valid event to listen for.");
    }
    removeListener(eventStr, action){
        let temp = Math.max(this.eventListenersX.indexOf(action), this.eventListenersY.indexOf(action));
        if (temp == -1){
            console.log("Ignoring attempt to remove untracked event listener. Using this method expecting calls like this to be ignored is ill-advised.");
            return;
        }
        if (eventStr == "x")
            this.eventListenersX.splice(temp,1);
        else if (eventStr == "y")
            this.eventListenersY.splice(temp,1);
        else
            throw new Error("\""+eventStr+"\" is not a valid event to listen for.");
    }
    clearListeners(eventStr){
        if (eventStr == "x")
            this.eventListenersX.splice(0);
        else if (eventStr == "y")
            this.eventListenersY.splice(0);
        else
            throw new Error("\""+eventStr+"\" is not a valid event to listen for.");
    }
    getListeners(eventStr){
        if (eventStr == "x")
            return this.eventListenersX;
        else if (eventStr == "y")
            return this.eventListenersY;
        else
            throw new Error("\""+eventStr+"\" is not a valid event to listen for.");
    }
    getAllProperies(){
        return {x:this.x, y:this.y, w:this.x, h:this.y, dx:this.dx, dy:this.dy, xBB:this.xBB, yBB:this.yBB, percision: this.percision, eventListeners: this.eventListenersX, eventListenersY: this.eventListenersY};
    }
    getPosition(string = ""){
        switch (string){
            case ("x"):
                return this.x;
            case ("y"):
                return this.y;
            default:
                return {x:this.x, y:this.y};
        }
    }
    setPosition(x, y){
        this.x = x;
        this.y = y;
    }
    getBounds(string = ""){
        switch (string){
            case ("x"):
            case ("w"):
                return this.w;
            case ("h"):
            case ("y"):
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
            case ("xBB"):
                return this.xBB;
            case ("yBB"):
            case ("y"):
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
            case ("dx"):
                return this.dx;
            case ("y"):
            case ("dy"):
                return this.dy;
            default:
                return {x:this.dx, y:this.dy};
        }
    }
    setVelocity(dx, dy){
        this.dx = dx;
        this.dy = dy;
    }
    meeting(x,y){
        let xa0 = this.xBB+x;
        let ya0 = this.yBB+y;
        let xa1 = xa0+this.w;
        let ya1 = ya0+this.h;
        for (let i = 0; i < AllColliders.length; i++){
            if (this == AllColliders[i])
                continue;
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
        let _dx = this.dx;
        let _dy = this.dy;
        let temp = 0;

        while ((_dx != 0 || _dy != 0)){
            temp = clamp(_dx,-1,1);
            if (!this.meeting(this.x+temp,this.y)){
                this.x += temp;
            }else{
                for (let i = 0; i < this.eventListenersX.length; i++)
                    this.eventListenersX[i]();
            }
            _dx = (_dx - temp);
            temp = clamp(_dy,-1,1);
            if (!this.meeting(this.x,this.y+temp)){
                this.y += temp;
            }else{
                for (let i = 0; i < this.eventListenersY.length; i++)
                    this.eventListenersY[i]();
            }
            _dy = (_dy - temp);
        }
    }
}