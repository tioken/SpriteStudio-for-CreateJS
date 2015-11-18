define(["require", "exports"], function (require, exports) {
    var BaseView = (function () {
        function BaseView() {
        }
        Object.defineProperty(BaseView.prototype, "model", {
            get: function () {
                return this._model;
            },
            set: function (value) {
                this._model = value;
                this.init();
            },
            enumerable: true,
            configurable: true
        });
        BaseView.prototype.init = function () {
        };
        return BaseView;
    })();
    exports.BaseView = BaseView;
});
