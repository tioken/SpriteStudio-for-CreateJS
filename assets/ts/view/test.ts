///<reference path="../d.ts/jquery/jquery.d.ts" />
import  BV = require("./base_view");
import  HM = require("../model/test");
export class TestView extends BV.BaseView<HM.TestModel>{
    constructor(){
        super();
    }
}