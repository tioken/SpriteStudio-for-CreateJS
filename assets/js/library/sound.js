///<reference path="../d.ts/jquery/jquery.d.ts" />
///<reference path="../d.ts/createjs/createjs.d.ts" />
define(["require", "exports"], function (require, exports) {
    var Sound = (function () {
        function Sound() {
            this.sound = {};
            createjs.Sound.on("fileload", this.eventComplete, this);
        }
        Sound.prototype.load = function (id, url) {
            this.sound[id] = new SoundData();
            createjs.Sound.registerSound(url, id);
        };
        Sound.prototype.play = function (id, loop) {
            if (loop === void 0) { loop = -1; }
            if (!this.sound[id].is_loaded)
                return false;
            this.sound[id].sound_instance.play(id, { interrupt: createjs.Sound.INTERRUPT_ANY, loop: loop });
            console.log("sound-play");
            return true;
        };
        Sound.prototype.eventComplete = function (e) {
            this.sound[e.id].is_loaded = true;
            this.sound[e.id].sound_instance = createjs.Sound.createInstance(e.id);
        };
        return Sound;
    })();
    exports.Sound = Sound;
    var SoundData = (function () {
        function SoundData() {
            this.sound_instance = null;
            this.is_loaded = false;
        }
        return SoundData;
    })();
    exports.SoundData = SoundData;
});
