///<reference path="../d.ts/jquery/jquery.d.ts" />
///<reference path="../d.ts/createjs/createjs.d.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports"], function (require, exports) {
    var SsPartState = (function () {
        function SsPartState(name) {
            this.name = name;
            this.partScaleX = 0.5;
            this.partScaleY = 0.5;
        }
        return SsPartState;
    })();
    exports.SsPartState = SsPartState;
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
    var SsAnimation = (function (_super) {
        __extends(SsAnimation, _super);
        function SsAnimation(ssaData, imageList) {
            _super.call(this);
            this.parts = [];
            this.zoom = 1;
            this.isCache = false;
            this.isStoped = false;
            this.getPartsMap = function () {
                return this.partsMap;
            };
            this.ssaData = ssaData;
            this.imageList = imageList;
            this.partsMap = new Array();
            var parts = ssaData.parts;
            var frameData = this.ssaData.ssa[0];
            for (var i = 0; i < parts.length; i++) {
                var partsFrameData = frameData[i];
                if (partsFrameData) {
                    this.partsMap[parts[i]] = i;
                    this.parts[i] = new createjs.Bitmap(this.imageList.getImage(partsFrameData[1]));
                    this.parts[i].sourceRect = new createjs.Rectangle(partsFrameData[2], partsFrameData[3], partsFrameData[4], partsFrameData[5]);
                    this.addChild(this.parts[i]);
                }
            }
        }
        SsAnimation.prototype.useCache = function (isCache, width, height) {
            if (width === void 0) { width = 0; }
            if (height === void 0) { height = 0; }
            this.isCache = isCache;
            if (this.isCache) {
                this.cache(0, 0, width, height);
            }
            else {
                this.uncache();
            }
        };
        SsAnimation.prototype.updateAnimation = function (ssaData, imageList) {
            this.removeAllChildren();
            this.ssaData = ssaData;
            this.imageList = imageList;
            this.partsMap = new Array();
            var parts = ssaData.parts;
            var frameData = this.ssaData.ssa[0];
            for (var i = 0; i < parts.length; i++) {
                var partsFrameData = frameData[i];
                if (partsFrameData) {
                    this.partsMap[parts[i]] = i;
                    this.parts[i] = new createjs.Bitmap(this.imageList.getImage(partsFrameData[1]));
                    this.parts[i].sourceRect = new createjs.Rectangle(partsFrameData[2], partsFrameData[3], partsFrameData[4], partsFrameData[5]);
                    this.addChild(this.parts[i]);
                }
            }
        };
        SsAnimation.prototype.getFPS = function () {
            return this.ssaData.fps;
        };
        SsAnimation.prototype.getFrameCount = function () {
            return this.ssaData.ssa.length;
        };
        SsAnimation.prototype.getParts = function () {
            return this.ssaData.parts;
        };
        SsAnimation.prototype.drawFunc = function (frameNum) {
            if (this.isStoped)
                return;
            var iPartNo = 0;
            var iImageNo = 1;
            var iSouX = 2;
            var iSouY = 3;
            var iSouW = 4;
            var iSouH = 5;
            var iDstX = 6;
            var iDstY = 7;
            var iDstAngle = 8;
            var iDstScaleX = 9;
            var iDstScaleY = 10;
            var iOrgX = 11;
            var iOrgY = 12;
            var iFlipH = 13;
            var iFlipV = 14;
            var iAlpha = 15;
            var iV0X = 16;
            var iV0Y = 17;
            var frameData = this.ssaData.ssa[frameNum];
            for (var refNo = 0; refNo < frameData.length; refNo++) {
                var partData = frameData[refNo];
                var partDataLen = partData.length;
                this.parts[refNo].x = partData[iDstX];
                this.parts[refNo].y = partData[iDstY];
                this.parts[refNo].rotation = -partData[iDstAngle] * 180 / Math.PI;
                this.parts[refNo].scaleX = partData[iDstScaleX];
                this.parts[refNo].scaleY = partData[iDstScaleY];
                var vdw = partData[iSouW];
                var vdh = partData[iSouH];
                if (partDataLen > iV0X) {
                    this.parts[refNo].x += partData[iV0X];
                    vdw -= partData[iV0X];
                }
                if (partDataLen > iV0Y) {
                    this.parts[refNo].y += partData[iV0Y];
                    vdh -= partData[iV0Y];
                }
                if (partDataLen > iOrgX) {
                    this.parts[refNo].regX = partData[iOrgX];
                }
                else {
                    this.parts[refNo].regX = 0;
                }
                if (partDataLen > iOrgY) {
                    this.parts[refNo].regY = partData[iOrgY];
                }
                else {
                    this.parts[refNo].regY = 0;
                }
                if (partDataLen > iFlipH) {
                    this.parts[refNo].scaleX *= partData[iFlipH] != 0 ? -1 : 1;
                }
                if (partDataLen > iFlipV) {
                    this.parts[refNo].scaleY *= partData[iFlipV] != 0 ? -1 : 1;
                }
                if ((partDataLen > iFlipH && partData[iFlipH] != 0) || (partDataLen > iFlipV && partData[iFlipV] != 0)) {
                    this.parts[refNo].regX = vdw / 2;
                    this.parts[refNo].regY = vdh / 2;
                }
                if (partData[iAlpha]) {
                    this.parts[refNo].alpha = partData[iAlpha];
                }
                else {
                    this.parts[refNo].alpha = 1;
                }
                if (this.isCache)
                    this.updateCache();
            }
        };
        return SsAnimation;
    })(createjs.Container);
    exports.SsAnimation = SsAnimation;
    var SsSprite = (function () {
        function SsSprite(animation) {
            this.x = 0;
            this.y = 0;
            this.flipH = false;
            this.flipV = false;
            this.scale = 1.0;
            this.inner = {
                animation: animation,
                playingFrame: 0,
                prevDrawnTime: 0,
                step: 1,
                loop: 0,
                loopCount: 0,
                endCallBack: null,
                partStates: null,
                initPartStates: function () {
                    this.partStates = null;
                    if (this.animation != null) {
                        var parts = this.animation.getParts();
                        var states = new Array();
                        for (var i = 0; i < parts.length; i++) {
                            states.push(new SsPartState(parts[i]));
                        }
                        this.partStates = states;
                    }
                }
            };
            this.inner.initPartStates();
        }
        SsSprite.prototype.setAnimation = function (animation) {
            this.inner.animation = animation;
            this.inner.initPartStates();
            this.inner.playingFrame = 0;
            this.inner.prevDrawnTime = 0;
            this.clearLoopCount();
        };
        SsSprite.prototype.getAnimation = function () {
            return this.inner.animation;
        };
        SsSprite.prototype.setFrameNo = function (frameNo) {
            this.inner.playingFrame = frameNo;
            this.inner.prevDrawnTime = 0;
        };
        SsSprite.prototype.getFrameNo = function () {
            return this.inner.playingFrame >> 0;
        };
        SsSprite.prototype.setStep = function (step) {
            this.inner.step = step;
        };
        SsSprite.prototype.getStep = function () {
            return this.inner.step;
        };
        SsSprite.prototype.setLoop = function (loop) {
            if (loop < 0)
                return;
            this.inner.loop = loop;
        };
        SsSprite.prototype.getLoop = function () {
            return this.inner.loop;
        };
        SsSprite.prototype.getLoopCount = function () {
            return this.inner.loopCount;
        };
        SsSprite.prototype.clearLoopCount = function () {
            this.inner.loopCount = 0;
        };
        SsSprite.prototype.setEndCallBack = function (func) {
            this.inner.endCallBack = func;
        };
        SsSprite.prototype.getPartState = function (name) {
            if (this.inner.partStates == null)
                return null;
            var partsMap = this.inner.animation.getPartsMap();
            var partNo = partsMap[name];
            if (partNo == null)
                return null;
            return this.inner.partStates[partNo];
        };
        SsSprite.prototype.draw = function (currentTime) {
            if (this.inner.animation == null)
                return;
            if (this.inner.loop == 0 || this.inner.loop > this.inner.loopCount) {
                if (this.inner.prevDrawnTime > 0) {
                    var s = (currentTime - this.inner.prevDrawnTime) / (1000 / this.inner.animation.getFPS());
                    this.inner.playingFrame += s * this.inner.step;
                    var c = (this.inner.playingFrame / this.inner.animation.getFrameCount()) >> 0;
                    if (this.inner.step >= 0) {
                        if (this.inner.playingFrame >= this.inner.animation.getFrameCount()) {
                            this.inner.loopCount += c;
                            if (this.inner.loop == 0 || this.inner.loopCount < this.inner.loop) {
                                this.inner.playingFrame %= this.inner.animation.getFrameCount();
                            }
                            else {
                                this.inner.playingFrame = this.inner.animation.getFrameCount() - 1;
                                if (this.inner.endCallBack != null) {
                                    this.inner.endCallBack();
                                }
                            }
                        }
                    }
                    else {
                        if (this.inner.playingFrame < 0) {
                            this.inner.loopCount += 1 + -c;
                            if (this.inner.loop == 0 || this.inner.loopCount < this.inner.loop) {
                                this.inner.playingFrame %= this.inner.animation.getFrameCount();
                                if (this.inner.playingFrame < 0)
                                    this.inner.playingFrame += this.inner.animation.getFrameCount();
                            }
                            else {
                                this.inner.playingFrame = 0;
                                if (this.inner.endCallBack != null) {
                                    this.inner.endCallBack();
                                }
                            }
                        }
                    }
                }
            }
            this.inner.prevDrawnTime = currentTime;
            this.inner.animation.drawFunc(this.getFrameNo());
        };
        return SsSprite;
    })();
    exports.SsSprite = SsSprite;
});
