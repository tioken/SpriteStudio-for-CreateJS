///<reference path="../d.ts/jquery/jquery.d.ts" />
define(["require", "exports"], function (require, exports) {
    var SsJson = (function () {
        function SsJson(url) {
            var _this = this;
            $.ajaxSetup({ async: false });
            $.getJSON(url, function (data) {
                _this.data = data;
            });
            $.ajaxSetup({ async: true });
        }
        SsJson.prototype.getAnimation = function (animation_id) {
            if (animation_id)
                return this.data[animation_id].animation;
            return this.data.animation;
        };
        SsJson.prototype.getImages = function (animation_id) {
            if (animation_id)
                return this.data[animation_id].images;
            return this.data.images;
        };
        return SsJson;
    })();
    exports.SsJson = SsJson;
});
