///<reference path="../d.ts/jquery/jquery.d.ts" />
///<reference path="../d.ts/createjs/createjs.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "../model/base_model"], function (require, exports, bm) {
    var TestModel = (function (_super) {
        __extends(TestModel, _super);
        function TestModel(data) {
            _super.call(this);
            this.url = {};
            this.loadParam(data);
            this.initModel();
        }
        TestModel.prototype.initModel = function () {
            var canvas = $("#canvas").get(0);
            this.stage = new createjs.Stage(canvas);
        };
        return TestModel;
    })(bm.BaseModel);
    exports.TestModel = TestModel;
});
