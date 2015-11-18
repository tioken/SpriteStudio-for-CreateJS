define(["require", "exports"], function (require, exports) {
    var BaseController = (function () {
        function BaseController(param, view) {
            this.model = param;
            this.view = view;
            this.view["model"] = (param);
            this.init();
        }
        BaseController.prototype.init = function () {
        };
        BaseController.prototype.exec = function () {
        };
        return BaseController;
    })();
    exports.BaseController = BaseController;
});
