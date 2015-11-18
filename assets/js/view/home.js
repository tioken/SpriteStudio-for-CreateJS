///<reference path="../d.ts/jquery/jquery.d.ts" />
///<reference path="../d.ts/createjs/createjs.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./base_view"], function (require, exports, BV) {
    var HomeView = (function (_super) {
        __extends(HomeView, _super);
        function HomeView() {
            _super.call(this);
            this.init();
        }
        HomeView.prototype.init = function () {
            var canvas = $("#canvas").get(0);
            this.stage = new createjs.Stage(canvas);
        };
        return HomeView;
    })(BV.BaseView);
    exports.HomeView = HomeView;
});
