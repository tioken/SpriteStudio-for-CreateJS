define(["require", "exports"], function (require, exports) {
    ///<reference path="../d.ts/createjs/createjs.d.ts" />
    var Json = (function () {
        function Json(url) {
            var _this = this;
            $.ajaxSetup({ async: false });
            $.getJSON(url, function (data) {
                _this.data = data;
            });
            $.ajaxSetup({ async: true });
        }
        return Json;
    })();
    exports.Json = Json;
});
