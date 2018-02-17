/**RIGHTCLICK && LEFTCLICK TO CHANGE VIEWING
 * 
 * 
 * ok, listen up. so this is just a bot/algorithm contest concept that i just made... (on 1/3/18)
 * Ctrl+F : "@HERE" to go to the area with the algorithms
 * 
 * you can probably ignore it.
 * 
 * 
 *                                          ALL FORMS OF COMMUNITY INTERACTION ARE FORBIDDEN
 * 
  * 
  */ 
strokeCap(PROJECT);
rectMode(CENTER);
imageMode(CENTER);
textAlign(CENTER, CENTER);
textFont(createFont("Ruluko"));
smooth();

var camX = 0, camY = 0, camX2 = 0, camY2 = 0, camS = 1, camS2 = 0.3, camV = 7, camF = 3;

var entities = [];
var names = ["speed: stamina/20", "constant speed: MAX", "will rest", "full discharge only"];
var Turn = function(intensity, duration){
    this.amt = intensity;
    this.dur = duration;
};
var Entity = function(x, y, ID){
    this.x = x;
    this.y = y;
    this.a = 0;
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
    this.fatigue = 0;
    this.regen = 0;
    this.cd = 0;
    this.restart = 100;
};
Entity.prototype.look = function(){
    var out = [];
    for(var _ = 0; _ < entities.length; _ ++){
        var relativeAngle = atan2(this.y - entities[_].y, this.x - entities[_].x) - this.a;
        var distance = dist(this.x, this.y, entities[_].x, entities[_].y);
        if(relativeAngle < this.fov/2){
            out.push({a: relativeAngle, d: distance, ID: entities[_].ID});
        }
    }
    return out;
};
Entity.prototype.turn = function(angle){
    var av = abs(angle - this.a) > 40 ? (abs(angle - this.a)/10) : 4;
    this.temp.push(new Turn(angle/av, av));
};
Entity.prototype.turnTo = function(angle){
    this.turn(this.a - angle);
};
Entity.prototype.setSpeed = function(velocity){
    if(velocity <= 0){ return; }
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
            if(this.fatigue < 400){
                this.setSpeed(floor(this.stamina/20));
            }
            break;
        case 1: // faster bot?
            this.setSpeed(8);
            break;
        case 2: // will rest lol
            if(this.fatigue > 700){ this.cd = -100; return; }
            this.setSpeed(5);
            break;
        case 3: // FULL DISCHARGE
            if(this.RAM[0]){
                this.setSpeed(7);
                if(this.stamina < 5){
                    this.RAM[0] = false;
                }
            }else if(this.stamina > 950){
                this.RAM[0] = true;
            }
            break;
    }
};
Entity.prototype.process = function(){
    this.regen = min(1.01*this.regen + 0.01, 4);
    var relativeSpeed = constrain(constrain(this._v - this.v, -this.topSpeed, this.topSpeed), -this.acceleration, this.acceleration);
    if(this.stamina > 1 && this.cd > this.restart){
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
    this.fatigue = max(0, this.fatigue - max(0, this.regen/4-0.5));
    this.stamina = min(this.stamina + this.regen, this.max - this.fatigue);
    this.algorithm();
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
    fill(0, 0, 0, 1);
    for(var i = 1; i < 1000; i += ceil(1000-i)/2){
        arc(0, 0, i, i, -this.fov/2, this.fov/2);
    }
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

for(var i = 0; i <= 3; i ++){
    entities.push(new Entity(100, 200+i*50, i));
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
            entities[i].a += 180;
            entities[i].y += 25;
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
    text("Currently Viewing:\n" + ((camF === entities.length) ? "Map" : ((camF + 1) + " of " + entities.length + " entities")), 500, 550);
};
/**RIGHTCLICK && LEFTCLICK TO CHANGE VIEWING
 * 
 * 
 * ok, listen up. so this is just a bot/algorithm contest concept that i just made... (on 1/3/18)
 * Ctrl+F : "@HERE" to go to the area with the algorithms
 * 
 * you can probably ignore it.
 * 
 * 
 *                                          ALL FORMS OF COMMUNITY INTERACTION ARE FORBIDDEN
 * 
  * 
  */ 
strokeCap(PROJECT);
rectMode(CENTER);
imageMode(CENTER);
textAlign(CENTER, CENTER);
textFont(createFont("Ruluko"));
smooth();

var camX = 0, camY = 0, camX2 = 0, camY2 = 0, camS = 1, camS2 = 0.3, camV = 7, camF = 3;

var entities = [];
var names = ["speed: stamina/20", "constant speed: MAX", "will rest", "full discharge only"];
var Turn = function(intensity, duration){
    this.amt = intensity;
    this.dur = duration;
};
var Entity = function(x, y, ID){
    this.x = x;
    this.y = y;
    this.a = 0;
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
    this.fatigue = 0;
    this.regen = 0;
    this.cd = 0;
    this.restart = 100;
};
Entity.prototype.look = function(){
    var out = [];
    for(var _ = 0; _ < entities.length; _ ++){
        var relativeAngle = atan2(this.y - entities[_].y, this.x - entities[_].x) - this.a;
        var distance = dist(this.x, this.y, entities[_].x, entities[_].y);
        if(relativeAngle < this.fov/2){
            out.push({a: relativeAngle, d: distance, ID: entities[_].ID});
        }
    }
    return out;
};
Entity.prototype.turn = function(angle){
    var av = abs(angle - this.a) > 40 ? (abs(angle - this.a)/10) : 4;
    this.temp.push(new Turn(angle/av, av));
};
Entity.prototype.turnTo = function(angle){
    this.turn(this.a - angle);
};
Entity.prototype.setSpeed = function(velocity){
    if(velocity <= 0){ return; }
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
            if(this.fatigue < 400){
                this.setSpeed(floor(this.stamina/20));
            }
            break;
        case 1: // faster bot?
            this.setSpeed(8);
            break;
        case 2: // will rest lol
            if(this.fatigue > 700){ this.cd = -100; return; }
            this.setSpeed(5);
            break;
        case 3: // FULL DISCHARGE
            if(this.RAM[0]){
                this.setSpeed(7);
                if(this.stamina < 5){
                    this.RAM[0] = false;
                }
            }else if(this.stamina > 950){
                this.RAM[0] = true;
            }
            break;
    }
};
Entity.prototype.process = function(){
    this.regen = min(1.01*this.regen + 0.01, 4);
    var relativeSpeed = constrain(constrain(this._v - this.v, -this.topSpeed, this.topSpeed), -this.acceleration, this.acceleration);
    if(this.stamina > 1 && this.cd > this.restart){
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
    this.fatigue = max(0, this.fatigue - max(0, this.regen/4-0.5));
    this.stamina = min(this.stamina + this.regen, this.max - this.fatigue);
    this.algorithm();
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
    fill(0, 0, 0, 1);
    for(var i = 1; i < 1000; i += ceil(1000-i)/2){
        arc(0, 0, i, i, -this.fov/2, this.fov/2);
    }
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

for(var i = 0; i <= 3; i ++){
    entities.push(new Entity(100, 200+i*50, i));
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
            entities[i].a += 180;
            entities[i].y += 25;
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
    text("Currently Viewing:\n" + ((camF === entities.length) ? "Map" : ((camF + 1) + " of " + entities.length + " entities")), 500, 550);
};
