///<reference path="../d.ts/jquery/jquery.d.ts" />
///<reference path="../d.ts/createjs/createjs.d.ts" />

export class Sound{
    queue:createjs.LoadQueue;
    sound:SoundInterface = {};

    constructor() {
        createjs.Sound.on("fileload", this.eventComplete, this);
    }


    load(id, url):void{
        this.sound[id] = new SoundData();
        createjs.Sound.registerSound(url, id);
    }

    play(id, loop = -1):boolean{
        if(!this.sound[id].is_loaded) return false;
        this.sound[id].sound_instance.play(id, {interrupt: createjs.Sound.INTERRUPT_ANY, loop:loop});
        console.log("sound-play");
        return true;
    }

    eventComplete(e):void {
        this.sound[e.id].is_loaded = true;
        this.sound[e.id].sound_instance = createjs.Sound.createInstance(e.id);
    }
}

interface SoundInterface{
    [index: string]:SoundData
}

export class SoundData{
    sound_instance:any = null;
    is_loaded:boolean = false;
}