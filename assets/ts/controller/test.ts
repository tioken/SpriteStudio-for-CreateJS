///<reference path="../d.ts/createjs/createjs.d.ts" />

import  BC = require("./base_controller");
import  HM = require("../model/test");
import  HV = require("../view/test");
import  SS = require("../library/ssplayer");

declare var spear_anime_idol_animation;

export class TestController extends BC.BaseController<HM.TestModel, HV.TestView>{
    callbacks:any = [];
    animation_images = ['01-0.png','02.png'];

    constructor(data:any){
        super(new HM.TestModel(data), new HV.TestView());

        console.log(this.model.stage);

        console.log(this.imageLoad());
        console.log(this.createChara());
    }

    imageLoad():any {
        var image = new SS.SsImage(this.animation_images, "./old/", true);
        return image;
    }

    createChara():any{
        var image = new SS.SsImage(this.animation_images, "./old/", true);
        var animation = new SS.SsAnimation(spear_anime_idol_animation, image);
        var data = new SS.SsSprite(animation);
        data.setLoop(0);
        return {
            image: image,
            animation: animation,
            data: data
        };
    }
}