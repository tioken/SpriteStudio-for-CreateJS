///<reference path="../d.ts/createjs/createjs.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./base_controller", "../model/test", "../view/test", "../library/ssplayer"], function (require, exports, BC, HM, HV, SS) {
    var TestController = (function (_super) {
        __extends(TestController, _super);
        function TestController(data) {
            _super.call(this, new HM.TestModel(data), new HV.TestView());
            this.callbacks = [];
            this.animation_images = ['01-0.png', '02.png'];
            console.log(this.model.stage);
            console.log(this.imageLoad());
            console.log(this.createChara());
        }
        TestController.prototype.imageLoad = function () {
            var image = new SS.SsImage(this.animation_images, "./old/", true);
            return image;
        };
        TestController.prototype.createChara = function () {
            var image = new SS.SsImage(this.animation_images, "./old/", true);
            var animation = new SS.SsAnimation(spear_anime_idol_animation, image);
            var data = new SS.SsSprite(animation);
            data.setLoop(0);
            return {
                image: image,
                animation: animation,
                data: data
            };
        };
        return TestController;
    })(BC.BaseController);
    exports.TestController = TestController;
});
