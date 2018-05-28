/*
RIGHTCLICK && LEFTCLICK TO CHANGE FOCUS
MIDDLECLICK TO TOGGLE PERSPECTIVE
SCROLL TO ZOOM IN/OUT

 * Ctrl+F : "@HERE" to go to the area with the algorithms
*//**Algorithm Challenge: Capture the Flag

@RULES:
You are allowed to read from ALL properties of Entity.
You are allowed create any integer variables of reasonable amount.
You are allowed to use (call functions) ALL properties of (this) Entity.
You are allowed set/modify ONLY the 'RAM' property of Entity and integer variables you have created.
You are allowed to use 'Math'.
You are NOT allowed to set/modify variables outside (this) Entity.
You are NOT allowed to draw to canvas.
You are NOT allowed set/modify properties of Entity other than 'RAM'.
You are NOT allowed use functions other than 'Math' and properties of (this) Entity.

Note: You can either create and use properties of Entity.RAM or create and use variables of your own.

@INSTRUCTIONS:
Design an algorithm that multiple entities (a team) will operate under to capture the opponent's flag.

 */ 
strokeCap(PROJECT);
rectMode(CENTER);
imageMode(CENTER);
textAlign(CENTER, CENTER);
textFont(createFont("Ruluko"));
smooth();

var camX = 0, camY = 0, camX2 = 0, camY2 = 0, camS = 1, camS2 = 0.3, camV = 7, camF = 0;
var discrim = 0;

var M1 = 10; //speed of "sound" in px
var fhr = 120; //flag house radius

var entities = [];
var names = ["red", "blue", "green", "gray", "yellow", "purple", "orange"];
var pts = [0, 0];
var flagID = [];

var teamAid = 0;
var teamBid = 1;
var fElapsed = 0;

var colors = [color(255, 158, 158), color(173, 185, 255), color(169, 255, 158), color(181, 181, 181), color(254, 255, 168), color(252, 154, 239), color(255, 219, 173)];
var turnLeft = function(start, end, size){
    return min(abs(start-end+size-1), min(abs(start-end-1), abs(start-end-size-1))) < min(abs(start-end+size+1), min(abs(start-end+1), abs(start-end-size+1)));
};
var eID = 0;
var Entity = function(x, y, ID, flag){
    this.x = x;
    this.y = y;
    this.a = 0;  // "actual" angle
	this.tA = 0; // target angle
    this.v = 0;
    this._v = 0;
    this.RAM = [];
    this.temp = [];
    this.fov = 120;
    this.acceleration = 0.05;
    this.topSpeed = 3;
    this.alignment = ID;
    this.max = 1000;
    this.stamina = 0.4*this.max;
    this.fatigue = 90;
    this.regen = 0;
    this.cd = 0;
    this.restart = 100;
	this.discrim = discrim++;
	this.fC = 0; // flag color & id (if holding one)
	this.msgCD = 0;
	this.lookCD = 0;
	this.flag = !!flag;
	this.hasFlag = false;
	this.dead = false;
	this.ID = eID++;
	if(!!flag){
	    //println(ID + "::" + entities.length); // Array.length gets updated after constructor is run :thinking:
	    flagID[ID] = flagID[ID] === undefined ? [] : flagID[ID];
	    flagID[ID].push(entities.length);
	}
};
Entity.prototype.safe = function(){
    return ~~(this.y/2000) === ~~(entities[flagID[this.alignment][0]].y/2000);
};
Entity.prototype.look = function(){
    if(this.lookCD > 0){ return []; }
    var out = [];
    for(var _ = 0; _ < entities.length; _ ++){
		if(this.discrim === entities[_].discrim || entities[_].dead){ continue; }
        var relativeAngle = this.a - (atan2(this.y - entities[_].y, this.x - entities[_].x)) % 360 - 180;
        var distance = dist(this.x, this.y, entities[_].x, entities[_].y);
        if(abs(relativeAngle) < this.fov/2 && distance < 4000){
            /*for(var g = 0; g < 5; g ++){
                stroke(255, 100, 100, 40*g+50);
                line(this.x + (entities[_].x - this.x) * g*0.2, this.y + (entities[_].y - this.y) * g*0.2, this.x + (entities[_].x - this.x) * (g*0.2+0.2), this.y + (entities[_].y - this.y) * (g*0.2+0.2));
            }*/
            out.push({
                a: relativeAngle, 
                dist: distance, 
                alignment: entities[_].alignment, 
                isFlag: entities[_].flag, 
                hasFlag: entities[_].hasFlag, 
                dead: entities[_].dead, 
                friendly: this.alignment === entities[_].alignment});
        }
    }
    this.lookCD = 1;
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
    this.msgCD = 5 + 2.85*pow(vol, 1.5); //Prevention of overuse
};
Entity.prototype.wait = function(frames){
    this.cd = this.restart - frames;
};
Entity.prototype.turn = function(angle){
    //var av = abs(angle - this.a) > 40 ? (abs(angle - this.a)/10) : 4;
    //this.temp.push(new Turn(angle/av, av));
    this.tA = -(-(  (this.tA+angle)   % 360) % 360);
};
Entity.prototype.turnTo = function(angle){
    this.tA = angle;
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
        case 0:
            if(this.fatigue > 700 || (this.stamina < 500 && !this.hasFlag)){ this.wait(300); return; }
            if(this.hasFlag){
                this.turnTo(-90);
                this.setSpeed(4);
                return;
            }
            var see = this.look();
            var v = this.RAM;
            if(see !== [] || v.m === undefined){
                v.m = see;
            }
            see = v.m;
            for(v.i = 0; v.i < see.length; v.i ++){
                if(see[v.i].isFlag && !see[v.i].friendly){
                    this.setSpeed(~~(see[v.i].dist / 100) + 2);
                    this.turnTo(this.a - see[v.i].a);
                    return;
                }
            }
            this.setSpeed(0); //S T O P
            this.turn(4); // scan
            break;
        case 1:
            if(this.hasFlag || !this.safe()){
                this.turnTo(90);
                this.setSpeed(4);
                return;
            }
            if(this.fatigue > 700){ this.wait(300); return; }
            var see = this.look();
            var v = this.RAM;
            for(v.i = 0; v.i < see.length; v.i ++){
                if((see[v.i].hasFlag || this.ID%2) && !see[v.i].friendly && this.safe()){
                    this.setSpeed(~~(see[v.i].dist / 100) + 2);
                    this.turnTo(this.a - see[v.i].a);
                    return;
                }
            }
            this.setSpeed(0); //S T O P
            this.turn(4); // scan
            break;
        // the following commented area have examples
        /*case 0: // testAI
            if(this.stamina > 100){
                this.setSpeed(floor(this.stamina/20));
            }else{
                this.wait(100);
                this.setSpeed(0);
            }
            this.turn(1);
            break;
        case 1: // follow the one with the flag
            var see = this.look();
            var v = this.RAM;
            for(v.i = 0; v.i < see.length; v.i ++){
                if(see[v.i].hasFlag){
                    this.setSpeed(~~(see[v.i].d / 100));
                    this.turnTo(this.a - see[v.i].a);
                    return;
                }
            }
            this.setSpeed(0); //S T O P
            this.turn(4); // scan
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
            }*/
    }
};
Entity.prototype.kill = function(){
    if(this.hasFlag){
        for(var i = 0; i < entities.length; i ++){
            if(entities[i].flag === null && entities[i].alignment !== this.alignment){
                entities[i].flag = true;
                break;
            }
        }
    }
    this.hasFlag = false;
    this.dead = true;
};
Entity.prototype.process = function(){
    if(this.flag){
        for(var $ = 0; $ < entities.length; $ ++){
            if(this.alignment !== entities[$].alignment && !entities[$].dead){
                //(this.y > 2000 && entities[$].y > 2000) || (this.y < 2000 && entities[$].y < 2000)
                if(this.safe()){
                    if(dist(this.x, this.y, entities[$].x, entities[$].y) < 24){
                        entities[$].hasFlag = true;
                        entities[$].fC = this.ID; // Keep track of which flag was taken.
                        this.flag = null;
                        break;
                    }
                }
            }
        }
        return;
    }
    if(this.flag === null){ return; }
    if(this.safe()){
        if(this.hasFlag){
            this.hasFlag = false;
            pts[this.alignment] ++;
            entities[this.fC].flag = true;
        }
    }else{
        for(var $ = 0; $ < entities.length; $ ++){
            if(this.alignment !== entities[$].alignment && entities[$].flag === false){
                if(dist(this.x, this.y, entities[$].x, entities[$].y) < 16){
                    this.kill();
                }
            }
        }
    }
    this.regen = min(1.01*this.regen + 0.01, 4);
    var relativeSpeed = constrain(constrain(this._v - this.v, -this.topSpeed, this.topSpeed), -this.acceleration, this.acceleration);
    if(this.stamina > 1 && this.cd > this.restart & this._v > 0){
        this.stamina -= abs(relativeSpeed) + abs(this.v/3);
        this.fatigue += (abs(relativeSpeed) + abs(this.v/3)) / 5;
        this.regen = max(0, this.regen - (abs(relativeSpeed) + abs(this.v/5)));
    }else{
        this.v = max(this.v - 0.6, 0);
        this._v = max(this.v - 0.6, 0);
        this.cd = this.stamina > 1 ? this.cd + 1 : 0;
    }
    this.v += relativeSpeed * (this.hasFlag ? 0.85 : 1);
    this.px = this.x;
    this.py = this.y;
    this.x += cos(this.a) * this.v;
    this.y += sin(this.a) * this.v;
    for(var f = 0; f < flagID[this.alignment].length; f ++){
        var fh = entities[flagID[this.alignment][f]];
        if(abs(this.x - fh.x) < fhr && abs(this.y - fh.y) < fhr && fh.flag){
            var a = atan2(this.y - fh.y, this.x - fh.x);
            this.x = fh.x + constrain(cos(a) * fhr * 1.42, -fhr*1.1, fhr*1.1); //1.42 > sqrt(2)
            this.y = fh.y + constrain(sin(a) * fhr * 1.42, -fhr*1.1, fhr*1.1);
        }
    }
    
    /* "smart" turning, concept (and code) taken from here:*//** https://www.khanacademy.org/cs/a/6141374645600256 */
    this.a += (1 - 2*( turnLeft(this.a, this.tA, 360) )) * min(abs(this.a - this.tA), 4);
    // direction (left/right turn) * magnitude (dist, capped at 4)
    
    this.fatigue = max(0, this.fatigue - max(0, this.regen/4-0.5));
    this.stamina = min(this.stamina + this.regen, this.max - this.fatigue);
    
    if(this.dead){
        //this.x += constrain(2000 - this.x, -1.4, 1.4);
        //this.y += constrain((750 + (this.y>2000)*2500) - this.y, -1.4, 1.4);
        this.tA = atan2((750 + (this.y>2000)*2500) - this.y, 2000 - this.x);
        this._v = 2;
        return;
    }
    
    this.msgCD --;
    this.lookCD --;
    if(this.temp.length){
        var obj = this.temp[0];
        pushStyle();
        noFill();
        strokeWeight(M1*2);
        stroke(0, 0, (obj.msg.replace("*", "ffffff").length>4)*255, 60 - obj.range/this.temp[this.temp.length-1].range*60);
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
    if(this.flag !== false){
        stroke(colors[this.alignment]);
        fill(0, 0, 0, 10+25*this.flag);
        rect(-fhr, -fhr, fhr*2, fhr*2);
        noStroke();
        fill(255, 255, 255, 80);
        rect(-fhr/4, -fhr/4, fhr/2, fhr/2);
        pushStyle();
        scale(2.5);
        strokeWeight(3);
        stroke(179, 113, 0, this.flag*180+70);
        line(-7, -8, -7, 8);
        noStroke();
        fill(this.flag ? colors[this.alignment] : color(180, 180, 180, 70));
        triangle(-6, -8, -6, 2, 8, -3);
        strokeWeight(1);
        popMatrix();
        popStyle();
        return;
    }
    fill(colors[this.alignment]);
    ellipse(0, 0, 15, 15);
    fill(0, 0, 0);
    stroke(255, 0, 0, 100-this.stamina*2.55);
    text("\n\n" + names[this.alignment], 0, 0);
    pushStyle();
    stroke(216, 87, 255);
    //line(-15, -18, -15 + constrain(this.cd/this.restart*50, 0, 30), -18);
    line(0, 0, 10*cos(this.a), 10*sin(this.a));
    stroke(0, 0, 0);
    line(0, 0, 10*cos(this.tA), 10*sin(this.tA));
    line(0, 0, 4*cos(0), 4*sin(0));
    
    noStroke();
    fill(0, 0, 0, 40);
    arc(0, 0, 10, 10, this.a -this.fov/2, this.a + this.fov/2);
    
    strokeWeight(3);
    stroke(105, 255, 210, 100);
    line(-15, -20, -15 + (this.stamina/this.max)*30, -20);
    stroke(122, 122, 122, 100);
    line(-15 + (this.stamina/this.max)*30, -20, 15 - (this.fatigue/this.max)*30, -20);
    stroke(255, 140, 140, 100);
    line(15 - (this.fatigue/this.max)*30, -20, 15, -20);
    
    if(this.hasFlag){
        stroke(179, 113, 0);
        line(-7, -8, -7, 8);
        noStroke();
        fill(colors[entities[this.fC].alignment]);
        triangle(-6, -8, -6, 2, 8, -3);
    }
    if(this.dead){
        stroke(255, 0, 0);
        line(-8, -8, 8, 8);
        line(8, -8, -8, 8);
    }
    strokeWeight(1);
    popStyle();
    popMatrix();
};


var bkgd = createGraphics(250, 400, P2D);
bkgd.background(255, 255, 255);
bkgd.strokeWeight(0.4);
bkgd.stroke(0, 0, 0);
for(var i = 25; i < 400; i += 50){
    bkgd.line(i, 0, i, 400);
    bkgd.line(0, i, 400, i);
}
bkgd.strokeWeight(0.3);
for(var i = 0; i <= 400; i += 50){
    bkgd.line(i, 0, i, 400);
    bkgd.line(0, i, 400, i);
}
bkgd.strokeWeight(2);
for(var i = 0; i <= 400; i += 50){
    bkgd.line(i+20, 200, i + 5, 200);
    bkgd.line(i+45, 200, i + 30, 200);
}

    
var bg = bkgd.get();

/*entities.push(new Entity(1000, 1000, 4));
entities[0].hasFlag = true;
var j = 1;
var k = 5;
for(var i = 0; i < 9; i ++){
    var id = j + (k-j)*(i%2);
    entities.push(new Entity(100, 800+i*50, id));
    entities.push(new Entity(1900, 800+i*50, id));
    entities.push(new Entity(800+i*50, 100, id));
    entities.push(new Entity(800+i*50, 1900, id));
}*/


entities.push(new Entity(500, 500, teamAid, true));
entities.push(new Entity(1500, 500, teamAid, true));
entities.push(new Entity(500, 3500, teamBid, true));
entities.push(new Entity(1500, 3500, teamBid, true));

for(var i = 0; i < 30; i ++){
    entities.push(new Entity(65*i, 1000, 0));
}
for(var i = 0; i < 30; i ++){
    entities.push(new Entity(65*i, 3000, 1));
}


var iso = function(){
    this.xz = 45;
    this.y = 45;
    this.t = 1;
    this.active = false;
};
iso.prototype.apply = function(){
    translate(300 * this.t, 100 * this.t);
    scale(1, this.y/90);
    scale(1 + 0.2*this.t);
    rotate(this.xz);
    
    this.xz += (this.active*45 - this.xz) / 24;
    this.y += ((90 - this.active*45) - this.y) / 24;
    this.t += (this.active - this.t) / 17;
};
var spaceISO = new iso();

var mouseScrolled = function() {
    //jshint noarg: false
    arguments.callee.caller.arguments[0].preventDefault();
    /*camS = */camS2 = constrain(camS2 + mouseScroll*0.05, 0.15, 1.2);
};
var mousePressed = function(){
    if(mouseButton === 3){
        spaceISO.active = !spaceISO.active;
        return;
    }
    camF = (camF + 38-mouseButton) % (entities.length + 1);
    camF = camF === -1 ? camF = entities.length : camF;
    if(camF === entities.length){
        camS2 = 0.3;
        camX2 = mouseX/600 * -600 + 300;
        camY2 = mouseY/600 * -2500 + 250;
    }else{
        camS2 = 1;
        camX2 = (-entities[camF].x + 300*camS2) * camS2;
        camY2 = (-entities[camF].y + 300*camS2) * camS2;
    }
    camS2 = camF === entities.length ? 0.3 : 1;
};
var draw = function() {
    spaceISO.apply();
    
    translate(-camX*camS, -camY*camS);
    translate(300, 300);
    scale(camS);
    camX += (camX2 - camX) / camV;
    camY += (camY2 - camY) / camV;
    camS += (camS2 - camS) / camV * 2;
    fill(255, 0, 0);
    background(255, 255, 255);
    image(bg, 1250, 2000, 2500, 4000);
    textSize(12);
    for(var i = 0; i < entities.length; i ++){
        fill(noise(i/50)*255+100, noise(i/50, i/50)*255+100, 255);
        entities[i].process();
        entities[i].draw();
        if(abs(entities[i].x - 1250) > 2500 || abs(entities[i].y - 2000) > 2000){
            entities[i].kill();
        }
    }
    noStroke();
    resetMatrix();
    if(camF === entities.length){
        camX2 = mouseX/600 * 2500;
        camY2 = mouseY/600 * 4000;
    }else{
        camX2 = entities[camF].x;
        camY2 = entities[camF].y;
    }
    fill(217, 217, 217, 100);
    rect(200, 25, 200, 80);
    fill(0, 0, 0);
    textSize(20);
    text("Currently Viewing:\n" + ((camF === entities.length) ? "Map" : ((camF + 1) + " of " + entities.length + " entities\n'" + names[entities[camF].alignment] + "'")), 500, 550);
    text(~~this.__frameRate + "FPS", 50, 550);
    text((fElapsed/1000).toFixed(1) + "kf", 300, 80);
    textSize(40);
    text("-", 300, 50);
    fill(colors[teamAid]);
    text(pts[teamAid], 250, 50);
    fill(colors[teamBid]);
    text(pts[teamBid], 350, 50);
    fElapsed ++;
};
