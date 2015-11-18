///<reference path="../d.ts/jquery/jquery.d.ts" />
///<reference path="../d.ts/createjs/createjs.d.ts" />

import  BV = require("./base_view");
import  HM = require("../model/home");
    export class HomeView extends BV.BaseView<HM.HomeModel>{
        stage:createjs.Stage;

        constructor(){
            super();
            this.init();
        }
        init():void{
            var canvas = $("#canvas").get(0);
            this.stage=new createjs.Stage(canvas);
        }

    }