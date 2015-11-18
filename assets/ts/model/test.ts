///<reference path="../d.ts/jquery/jquery.d.ts" />
///<reference path="../d.ts/createjs/createjs.d.ts" />

import  bm = require("../model/base_model");

    export class TestModel extends bm.BaseModel{

        //引数の初期値
        url:any = {};
        stage:createjs.Stage;

        constructor(data:any){
            super();
            this.loadParam(data);
            this.initModel();
        }

        initModel():void{
            var canvas = $("#canvas").get(0);
            this.stage=new createjs.Stage(canvas);
        }

    }
