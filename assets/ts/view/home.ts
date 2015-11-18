///<reference path="../d.ts/jquery/jquery.d.ts" />
import  BV = require("./base_view");
import  HM = require("../model/home");
    export class HomeView extends BV.BaseView<HM.HomeModel>{
        constructor(){
            super();
        }
    }