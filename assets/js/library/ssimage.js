///<reference path="../d.ts/createjs/createjs.d.ts" />
define(["require", "exports"], function (require, exports) {
    var SsImage = (function () {
        function SsImage(imageFiles, aFileRoot, loadImmediately, aOnLoad) {
            if (aOnLoad === void 0) { aOnLoad = null; }
            this.fileRoot = aFileRoot;
            this.imagePaths = new Array();
            this.images = new Array();
            this.onLoad = aOnLoad || function () { };
            for (var i = 0; i < imageFiles.length; i++) {
                var path = this.fileRoot + imageFiles[i];
                this.imagePaths.push(path);
                var image = new Image();
                if (loadImmediately) {
                    image.onload = this.onLoad_;
                    image.src = path;
                }
                this.images.push(image);
            }
        }
        SsImage.prototype.onLoad_ = function () {
            for (var i in this.images) {
                if (i != null && i.complete == false)
                    return;
                if (this.onLoad != null)
                    this.onLoad();
            }
        };
        SsImage.prototype.getImage = function (index) {
            if (index < 0 || index >= this.images.length)
                return null;
            return this.images[index];
        };
        SsImage.prototype.setImage = function (index, imagePath) {
            if (index < 0 || index >= this.images.length)
                return null;
            this.imagePaths[index] = this.fileRoot + imagePath;
            this.images[index].onload = this.onLoad_;
            this.images[index].src = this.imagePaths[index];
        };
        SsImage.prototype.setOnLoad = function (callback) {
            this.onLoad = callback;
        };
        return SsImage;
    })();
    exports.SsImage = SsImage;
});
