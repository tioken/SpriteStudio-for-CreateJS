define(["require", "exports"], function (require, exports) {
    var BaseModel = (function () {
        function BaseModel() {
        }
        BaseModel.prototype.loadParam = function (data) {
            for (var prop in data) {
                this[prop] = data[prop];
            }
        };
        return BaseModel;
    })();
    exports.BaseModel = BaseModel;
});
