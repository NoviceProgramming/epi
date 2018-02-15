// Attempt the First, 14 Feb 12018

var Hebbian = function(clearRate, input, stimuli){
    this.recent = [];
    this.stimuli = stimuli;
    this.outputs = input;
    this.refresh = clearRate;
    this.connections = [];
    while(this.connections.length < input.length){
        this.connections.push([]);
    }
};
Hebbian.prototype.do = function(input, stimuli){
    for(var i in input){
        if(input[i][1]){
            this.recent[this.recent.length-1].push({data: i, id: 1});
        }
    }
    for(var i in stimuli){
        if(stimuli[i][1]){
            this.recent[this.recent.length-1].push({data: i, id: 2});
        }
    }
    var Set = this.recent[this.recent.length-1];
    if(Set.length > 1){
        for(var i = 0; i < Set.length; i ++){
            if(Set[i].id === 1){
                //this.connections
            }
        }
    }
    if(frameCount % this.refresh === 0){
        this.recent.splice(0, 1);
    }
};
