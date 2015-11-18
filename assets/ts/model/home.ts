///<reference path="../d.ts/jquery/jquery.d.ts" />
///<reference path="../d.ts/createjs/createjs.d.ts" />

import  bm = require("../model/base_model");

    export class HomeModel extends bm.BaseModel{

        //引数の初期値
        url:any = {};

        constructor(data:any){
            super();
            this.loadParam(data);
        }
    }
