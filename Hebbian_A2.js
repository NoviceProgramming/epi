var STIMULUS = 1;
var INPUT = 2;
var Connection = function(name, type){
    this.name = name;
    this.type = type;
    this.active = 0;
    this.failed = 0;
};
var Node = function(name, type){
    this.name = name;
    this.type = type;
    this.connections = [];
};
Node.prototype.connect = function(name, type){
    for(var i = 0; i < this.connections.length; i ++){
        if(this.connections.name === name && this.connections.type === type){
            this.connections[i].active ++;
            return;
        }
    }
    this.connections.push(new Connection(name, type));
};
var Hebbian = function(stimuli, inputs, rate){
    this.stimuli = [];
    this.inputs = [];
    this.recent = [];
    this.rate = rate;
    for(var i = 0; i < stimuli.length; i ++){
        this.stimuli.push(new Node(stimuli[i], STIMULUS));
    }
    for(var i = 0; i < inputs.length; i ++){
        this.inputs.push(new Node(inputs[i], INPUT));
    }
};
Hebbian.prototype.learn = function(stimuli, inputs){
    for(var i in stimuli){
        if(stimuli[i]){
            this.recent.push({type: STIMULUS, id: i});
        }
    }
    for(var i in inputs){
        if(inputs[i]){
            this.recent.push({type: INPUT, id: i});
        }
    }
    for(var i = 0; i < this.recent.length; i ++){
        if(this.recent[i].type === INPUT){
            for(var j = 0; j < this.recent.length; j ++){
                if(this.recent[j].type === STIMULUS){
                    this.inputs[i].connect(this.stimuli[this.recent[j].id].name, STIMULUS);
                    println("Connected " + this.inputs[i].name + " to " + this.stimuli[this.recent[j].id].name);
                    break;
                }
            }
        }
    }
    this.recent = [];
};
Hebbian.prototype.do = function(stimuli){
    var out = [];
    for(var i in stimuli){
        if(stimuli[i]){
            for(var j = 0; j < this.inputs.length; j ++){
                for(var k = 0; k < this.inputs[j].connections.length; k ++){
                    if(this.inputs[j].connections[k].name === this.stimuli[i].name){
                        out[this.inputs[j].name] = true;
                    }
                }
            }
        }
    }
    return out;
};
