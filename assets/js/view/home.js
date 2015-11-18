var __extends = this.__extends || function (d, b) {
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
        }
        return HomeView;
    })(BV.BaseView);
    exports.HomeView = HomeView;
});
