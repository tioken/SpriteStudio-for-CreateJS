///<reference path="../d.ts/createjs/createjs.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./base_controller", "../model/home", "../view/home", "../library/ssplayer", "../library/ssjson"], function (require, exports, BC, HM, HV, SP, SJ) {
    var HomeController = (function (_super) {
        __extends(HomeController, _super);
        function HomeController(data) {
            var _this = this;
            _super.call(this, new HM.HomeModel(data), new HV.HomeView());
            this.callbacks = [];
            this.animations = [];
            this.speed = 3;
            var json = new SJ.SsJson("/createjs_test/Comipo/datas/out.json");
            this.animation = json.getAnimation(1);
            this.animation2 = json.getAnimation(3);
            this.animation3 = json.getAnimation(4);
            this.animation_images = json.getImages(1);
            console.log(this.view.stage);
            this.animations[0] = this.createChara();
            this.animations[1] = this.createChara();
            this.animations[2] = this.createChara();
            this.animations[3] = this.createChara();
            this.animations[4] = this.createChara();
            this.animations[5] = this.createChara();
            this.animations[6] = this.createChara();
            this.animations[7] = this.createChara();
            this.animations[8] = this.createChara();
            this.animations[1].animation.regX = 175 / 2;
            this.animations[1].animation.regY = 200 / 2;
            this.animations[0].animation.x = 0;
            this.animations[2].animation.x = 50;
            this.animations[3].animation.x = 100;
            this.animations[4].animation.x = 150;
            this.animations[5].animation.x = 200;
            this.animations[6].animation.x = 250;
            this.animations[7].animation.x = 300;
            this.animations[1].animation.x = 400;
            this.animations[1].animation.zoom = 0.5;
            this.animations[1].animation.x = 800;
            this.animations[1].animation.y = 400;
            this.view.stage.addChild(this.animations[0].animation);
            this.view.stage.addChild(this.animations[1].animation);
            this.view.stage.addChild(this.animations[2].animation);
            this.view.stage.addChild(this.animations[3].animation);
            this.view.stage.addChild(this.animations[4].animation);
            this.view.stage.addChild(this.animations[5].animation);
            this.view.stage.addChild(this.animations[6].animation);
            this.view.stage.addChild(this.animations[7].animation);
            this.view.stage.addChild(this.animations[8].animation);
            this.view.stage.update();
            this.animations[8].animation.x = 550;
            this.animations[8].animation.useCache(true, 350, 400);
            this.animations[8].animation.filters = [new createjs.ColorFilter(0, 0, 0, 0.5, 156, 167, 226, 0)];
            $("#start").on("click", function () {
                setInterval(function () { _this.drawCall(); }, 1000 / 30);
            });
            setTimeout(function () { _this.animations[8].animation.isStoped = true; }, 10000);
        }
        HomeController.prototype.drawCall = function () {
            var _this = this;
            var time = new Date().getTime();
            for (var i = 0; i < this.animations.length; i++) {
                if ((this.animations[i].animation.y + this.speed) < this.animations[i].move.y) {
                    this.animations[i].animation.y += this.speed;
                }
                else if ((this.animations[i].animation.y - this.speed) > this.animations[i].move.y) {
                    this.animations[i].animation.y -= this.speed;
                }
                if (this.isLeft(this.animations[i].animation.x, this.animations[i].move.x)) {
                    this.animations[i].animation.x -= this.speed;
                    this.animationLeft(i);
                }
                else if (this.isRight(this.animations[i].animation.x, this.animations[i].move.x)) {
                    this.animations[i].animation.x += this.speed;
                    this.animationRight(i);
                }
                if (this.checkPosition(this.animations[i].animation.x, this.animations[i].animation.y, this.animations[i].move.x, this.animations[i].move.y)) {
                    if (this.animations[i].move.stop_x != this.animations[i].animation.x || this.animations[i].move.stop_y != this.animations[i].animation.y) {
                        this.animationEnd(i);
                        this.animations[i].move.stop_x = this.animations[i].animation.x;
                        this.animations[i].move.stop_y = this.animations[i].animation.y;
                        setTimeout(function (i) {
                            _this.animations[i].move.x = _this.getRandom(100, 800);
                            _this.animations[i].move.y = _this.getRandom(100, 800);
                        }, 2000, i);
                    }
                }
                this.animations[i].data.draw(time);
            }
            this.view.stage.update();
        };
        HomeController.prototype.createChara = function () {
            var image = new SP.SsImage(this.animation_images, "./Comipo/datas/", true);
            var animation = new SP.SsAnimation(this.animation, image);
            var data = new SP.SsSprite(animation);
            data.setLoop(0);
            return {
                image: image,
                animation: animation,
                data: data,
                move: {
                    x: this.getRandom(100, 800),
                    y: this.getRandom(100, 800),
                    stop_x: 0,
                    stop_y: 0,
                    left: false,
                    right: false,
                    top: false,
                    down: false
                }
            };
        };
        HomeController.prototype.getRandom = function (min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };
        HomeController.prototype.animationRight = function (position) {
            var character = this.animations[position];
            character.move.right = false;
            if (character.move.left == true)
                return false;
            character.animation.updateAnimation(this.animation2, character.image);
            character.move.left = true;
            character.animation.regX = 350 / 2;
            character.animation.regY = 400 / 2;
            character.animation.scaleX = -1 * character.animation.zoom;
            character.animation.scaleY = 1 * character.animation.zoom;
            return true;
        };
        HomeController.prototype.animationLeft = function (position) {
            var character = this.animations[position];
            character.move.left = false;
            if (character.move.right == true)
                return false;
            character.animation.regX = 350 / 2;
            character.animation.regY = 400 / 2;
            character.animation.updateAnimation(this.animation2, character.image);
            character.move.right = true;
            character.animation.scaleX = 1 * character.animation.zoom;
            character.animation.scaleY = 1 * character.animation.zoom;
            return true;
        };
        HomeController.prototype.animationEnd = function (position) {
            var character = this.animations[position];
            character.animation.updateAnimation(this.animation3, character.image);
            character.move.left = false;
            character.move.right = false;
        };
        HomeController.prototype.changeAnimation = function (i) {
            this.animations[i].animeation = new SP.SsAnimation(this.animation2, this.animations[i].image);
            this.animations[i].data.setAnimation(this.animations[i].animeation);
            this.animations[i].data.setLoop(0);
        };
        HomeController.prototype.isRight = function (now_x, target_x) {
            if (((now_x + this.speed) < target_x)) {
                return true;
            }
            else {
                return false;
            }
        };
        HomeController.prototype.isLeft = function (now_x, target_x) {
            if (((now_x - this.speed) > target_x)) {
                return true;
            }
            else {
                return false;
            }
        };
        HomeController.prototype.checkPosition = function (now_x, now_y, target_x, target_y) {
            if (((now_x + this.speed) >= target_x && (now_x - this.speed) <= target_x) && ((now_y + this.speed) >= target_y && (now_y - this.speed) <= target_y)) {
                return true;
            }
            else {
                return false;
            }
        };
        return HomeController;
    })(BC.BaseController);
    exports.HomeController = HomeController;
});
