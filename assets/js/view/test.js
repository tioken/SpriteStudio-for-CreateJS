var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports", "./base_view"], function (require, exports, BV) {
    var TestView = (function (_super) {
        __extends(TestView, _super);
        function TestView() {
            _super.call(this);
        }
        return TestView;
    })(BV.BaseView);
    exports.TestView = TestView;
});
