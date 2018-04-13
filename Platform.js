/**RIGHTCLICK && LEFTCLICK TO CHANGE VIEWING
 * 
 * 
 * Ctrl+F : "@HERE" to go to the area with the algorithms
 * 
 * 

Algorithm Challenge: Capture the Flag

@RULES:
You are allowed to read from ALL properties of Entity.
You are allowed create any integer variables of reasonable amount.
You are allowed to use (call functions) ALL properties of Entity.
You are allowed set/modify ONLY the 'RAM' property of Entity and integer variables you have created.
You are allowed to use 'Math'.
You are NOT allowed to set/modify variables outside Entity.
You are NOT allowed to draw to canvas.
You are NOT allowed set/modify properties of Entity other than 'RAM'.
You are NOT allowed use functions other than 'Math' and properties of Entity.

Note: You can either create and use properties of Entity.RAM or create and use variables of your own.

@INSTRUCTIONS:
Design an algorithm

 */ 
strokeCap(PROJECT);
rectMode(CENTER);
imageMode(CENTER);
textAlign(CENTER, CENTER);
textFont(createFont("Ruluko"));
smooth();

var camX = 0, camY = 0, camX2 = 0, camY2 = 0, camS = 1, camS2 = 0.3, camV = 7, camF = 0;
var discrim = 0;

var M1 = 100; //speed of "sound" in px

var entities = [];
var names = ["rulebreaker", "follow", "will rest", "full discharge only", "initiator", "listener", "relay"];
var turnLeft = function(start, end, size){
    return min(abs(start-end+size-1), min(abs(start-end-1), abs(start-end-size-1))) < min(abs(start-end+size+1), min(abs(start-end+1), abs(start-end-size+1)));
};
var Entity = function(x, y, ID){
    this.x = x;
    this.y = y;
    this.a = 0;  // "actual" angle
	this.tA = 0; // target angle
    this.v = 0;
    this._v = 0;
    this.RAM = []; // limited to integers only i guess
    this.temp = []; // don't touch this :thinkban:
    this.fov = 120;
    this.acceleration = 0.05;
    this.topSpeed = 8;
    this.alignment = ID;
    this.max = 1000;
    this.stamina = 0.4*this.max;
    this.fatigue = 90;
    this.regen = 0;
    this.cd = 0;
    this.restart = 100;
	this.discrim = discrim++;
	this.ID = 0;
	this.msgCD = 0;
};
Entity.prototype.look = function(){
    var out = [];
    for(var _ = 0; _ < entities.length; _ ++){
		if(this.discrim === entities[_].discrim){ continue; }
        var relativeAngle = this.a - (atan2(this.y - entities[_].y, this.x - entities[_].x)) % 360 - 180;
        var distance = dist(this.x, this.y, entities[_].x, entities[_].y);
        if(abs(relativeAngle) < this.fov/2 && distance < 4000){
            stroke(255, 0, 0);
            line(this.x, this.y, entities[_].x, entities[_].y);
            out.push({a: relativeAngle, d: distance, ID: entities[_].ID});
        }
    }
    return out;
};
Entity.prototype.send = function(msg, vol){
    if(this.msgCD > 0 || this.temp.length){ return "Still on cooldown; " + this.temp.length+this.msgCD + "f remain"; }
    vol = !!vol ? constrain(vol, 2, 10) : 6;
    for(var t = 0; t < vol; t += M1/100){
        this.temp.push({x: this.x, y: this.y, msg: String(msg).substr(0, 4), range: t*200});
    }
    /*for(var _ = 0; _ < entities.length; _ ++){
        if(this.discrim === entities[_].discrim){ continue; }
        if(dist(this.x, this.y, entities[_].x, entities[_].y) < vol*100){
            //Sending dist
            entities[_].RAM.push(String(msg).substr(0, 4));
            //4 char limit
        }
    }*/
    /*fill(0, 0, 0, 50);
    ellipse(this.x-camX, this.y-camY, vol*200, vol*200);*/
    this.msgCD = vol ? pow(vol, 2) : 16; //Prevention of overuse
};
Entity.prototype.wait = function(frames){
    this.cd = this.restart - frames;
};
Entity.prototype.turn = function(angle){
    //var av = abs(angle - this.a) > 40 ? (abs(angle - this.a)/10) : 4;
    //this.temp.push(new Turn(angle/av, av));
    this.tA += angle;
};
Entity.prototype.turnTo = function(angle){
    this.turn(this.a - angle);
};
Entity.prototype.setSpeed = function(velocity){
    if(velocity < 0 || isNaN(velocity)){ return; }
    this._v = velocity;
};
Entity.prototype.algorithm = function(AI){
    
    /**
     * 
     * BOT ALGORITHMS @HERE
     * 
     */ 
    switch(AI === undefined ? this.alignment : AI){
        case 0: // testAI
            if(this.stamina > 100){
                this.setSpeed(floor(this.stamina/20));
            }else{
                this.wait(100);
                this.setSpeed(0);
            }
            this.turn(1);
            break;
        case 1: // follow
            var see = this.look();
            if(see[0]){
                this.setSpeed(~~(see[0].d / 100));
                this.turnTo(this.a + see[0].a);
            }else{
                this.setSpeed(0); //S T O P
                this.turn(4); // scan
            }
            break;
        case 2: // will rest lol
            if(this.fatigue > 700){ this.wait(300); return; }
            this.setSpeed(5);
            break;
        case 3: // FULL DISCHARGE
            if(this.RAM.move){
                this.setSpeed(7);
                if(this.stamina < 5){
                    this.RAM.move = false;
                }
            }else if(this.stamina > 950){
                this.RAM.move = true;
            }
            break;
        case 4: // initiator
            if(this.stamina > 950){
                if(!this.RAM.move){ this.send("**GO", 6); }
                this.RAM.move = true;
            }
            if(this.stamina < 50){
                if(this.RAM.move){ this.send("**NO", 6); }
                this.RAM.move = false;
            }
            this.turn(4);
            this.setSpeed(this.RAM.move*7);
            break;
        case 5: // listener
            switch(this.RAM[0]){
                case "GO":
                case "*GO":
                    this.setSpeed(7);
                    break;
                case "NO":
                case "*NO":
                    this.setSpeed(0);
                    break;
            }
            this.RAM = []; //clear memory
            break;
        case 6: // relay/repeater
            if(this.RAM[0]){
                var rmsg = String(this.RAM.splice(0, 1));
                if(rmsg.startsWith("*")){ //only send "issued" msgs
                    this.send(rmsg.replace("*", ""));
                }
            }
    }
};
Entity.prototype.process = function(){
    this.regen = min(1.01*this.regen + 0.01, 4);
    var relativeSpeed = constrain(constrain(this._v - this.v, -this.topSpeed, this.topSpeed), -this.acceleration, this.acceleration);
    if(this.stamina > 1 && this.cd > this.restart & this._v > 0){
        this.stamina -= abs(relativeSpeed) + abs(this.v/3);
        this.fatigue += (abs(relativeSpeed) + abs(this.v/3)) / 5;
        this.regen = max(0, this.regen - (abs(relativeSpeed) + abs(this.v/5)));
    }else{
        this.v /= 2;
        this._v /= 2;
        this.cd = this.stamina > 1 ? this.cd + 1 : 0;
    }
    this.v += relativeSpeed;
    this.x += cos(this.a) * this.v;
    this.y += sin(this.a) * this.v;
    
    this.a = (this.a + 360) % 360;
    this.tA = (this.tA + 360) % 360;
    
    /* "smart" turning, concept (and code) taken from here:*//** https://www.khanacademy.org/cs/a/6141374645600256 */
    this.a += (1 - 2*( turnLeft(this.a, this.tA, 360) )) * min(abs(this.a - this.tA), 4);
    // direction (left/right turn) * magnitude (dist, capped at 4)
    
    this.fatigue = max(0, this.fatigue - max(0, this.regen/4-0.5));
    this.stamina = min(this.stamina + this.regen, this.max - this.fatigue);
    this.msgCD --;
    if(this.temp.length){
        var obj = this.temp[0];
        pushStyle();
        noFill();
        strokeWeight(M1*2);
        stroke(0, 0, 0, 80 - obj.range/this.temp[this.temp.length-1].range*60);
        ellipse(obj.x, obj.y, obj.range, obj.range);
        strokeWeight(1);
        popStyle();
        for(var _ = 0; _ < entities.length; _ ++){
            if(this.discrim === entities[_].discrim){ continue; }
            if(abs(dist(this.x, this.y, entities[_].x, entities[_].y) - obj.range/2) < M1){
                entities[_].RAM.push(obj.msg);
            }
        }
        this.temp.splice(0, 1);
    }
    try{
        this.algorithm();
    }catch(err){
        println(err);
    }
};
Entity.prototype.draw = function() {
    pushMatrix();
    translate(this.x, this.y);
    ellipse(0, 0, 15, 15);
    fill(0, 0, 0);
    stroke(255, 0, 0, 100-this.stamina*2.55);
    text(this.alignment+1+"\n\n"+names[this.alignment], 0, 0);
    pushStyle();
    stroke(105, 255, 210);
    line(-15, -20, -15 + (this.stamina/this.max)*30, -20);
    stroke(122, 122, 122);
    line(-15 + (this.stamina/this.max)*30, -20, 15 - (this.fatigue/this.max)*30, -20);
    stroke(255, 140, 140);
    line(15 - (this.fatigue/this.max)*30, -20, 15, -20);
    stroke(216, 87, 255);
    line(-15, -18, -15 + min(this.cd/this.restart*50, 30), -18);
    rotate(this.a);
    noStroke();
    fill(0, 0, 0, 40);
    arc(0, 0, 10, 10, -this.fov/2, this.fov/2);
    popStyle();
    popMatrix();
};


var bkgd = createGraphics(400, 400, P2D);
bkgd.background(255, 255, 255);
bkgd.strokeWeight(2);
bkgd.stroke(0, 0, 0);
for(var i = 50; i < 400; i += 50){
    bkgd.line(i, 0, i, 400);
    bkgd.line(0, i, 400, i);
}
bkgd.strokeWeight(0.4);
for(var i = 25; i < 400; i += 50){
    bkgd.line(i, 0, i, 400);
    bkgd.line(0, i, 400, i);
}
var bg = bkgd.get();

entities.push(new Entity(1000, 1000, 4));
entities.push(new Entity(500, 1000, 6));
entities.push(new Entity(1000, 500, 6));
entities.push(new Entity(1500, 1000, 6));
entities.push(new Entity(1000, 1500, 6));
entities.push(new Entity(500, 500, 6));
entities.push(new Entity(1500, 500, 6));
entities.push(new Entity(1500, 1500, 6));
entities.push(new Entity(500, 1500, 6));

for(var i = 0; i < 9; i ++){
    entities.push(new Entity(100, 800+i*50, 5));
    entities.push(new Entity(1900, 800+i*50, 5));
    entities.push(new Entity(800+i*50, 100, 5));
    entities.push(new Entity(800+i*50, 1900, 5));
}

var mousePressed = function(){
    camF = (camF + 38-mouseButton) % (entities.length + 1);
    camF = camF === -1 ? camF = entities.length : camF;
};
var draw = function() {
    scale(camS);
    translate(camX, camY);
    camX += (camX2 - camX) / camV;
    camY += (camY2 - camY) / camV;
    camS += (camS2 - camS) / camV;
    fill(255, 0, 0);
    background(255, 255, 255);
    image(bg, 2000, 2000, 4000, 4000);
    textSize(12);
    for(var i = 0; i < entities.length; i ++){
        fill(noise(i/50)*255+100, noise(i/50, i/50)*255+100, 255);
        entities[i].process();
        entities[i].draw();
        if(entities[i].x > 1800 || entities[i].x < 100){
            entities[i].tA = 180 * (entities[i].x > 1800);
        }
        if(entities[i].y > 1800 || entities[i].y < 100){
            entities[i].tA = 90 + 180 * (entities[i].y > 1800);
        }
    }
    
    resetMatrix();
    if(camF === entities.length){
        camS2 = 0.3;
        camX2 = 0;
        camY2 = 0;
    }else{
        camS2 = 1;
        camX2 = (-entities[camF].x + 300*camS2) * camS2;
        camY2 = (-entities[camF].y + 300*camS2) * camS2;
    }
    fill(0, 0, 0);
    textSize(20);
    text("Currently Viewing:\n" + ((camF === entities.length) ? "Map" : ((camF + 1) + " of " + entities.length + " entities\n'" + names[entities[camF].alignment] + "'")), 500, 550);
    text(~~this.__frameRate + "FPS", 50, 550);
};
