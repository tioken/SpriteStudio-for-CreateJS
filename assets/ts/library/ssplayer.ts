///<reference path="../d.ts/jquery/jquery.d.ts" />
///<reference path="../d.ts/createjs/createjs.d.ts" />

export class SsPartState{
    name:string;
    partScaleX:number;
    partScaleY:number;
    constructor(name){
        // パーツ名
        this.name = name;

        //スケール
        this.partScaleX = 0.5;
        this.partScaleY = 0.5;
    }
}

export class SsImage{
    fileRoot:any;
    imagePaths:any;
    images:any;
    onLoad:any;
    constructor (imageFiles, aFileRoot, loadImmediately, aOnLoad=null) {
        this.fileRoot = aFileRoot;
        this.imagePaths = new Array();
        this.images = new Array();
        this.onLoad = aOnLoad || function(){};	// ロード完了時に呼ばれるコールバック

        for (var i = 0; i < imageFiles.length; i++) {
            var path = this.fileRoot + imageFiles[i];
            this.imagePaths.push(path);
            var image = new Image();
            if (loadImmediately)
            {
                image.onload = this.onLoad_;
                image.src = path;
            }
            this.images.push(image);
        }
    }

    onLoad_():void {
        for (var i in this.images) {
            if (i != null && i.complete == false) return;
            this.onLoad();
        }
    }

    getImage(index):any {
        if (index < 0 || index >= this.images.length) return null;
        return this.images[index];
    }

    setImage(index, imagePath):void {
        if (index < 0 || index >= this.images.length) return null;
        this.imagePaths[index] = this.fileRoot + imagePath;
        this.images[index].onload = this.onLoad_;
        this.images[index].src = this.imagePaths[index];
    }
    setOnLoad(callback):void {
        this.onLoad = callback;
    }
}

export class SsAnimation extends createjs.Container{
    ssaData:any;
    imageList:SsImage;
    partsMap:any;
    parts:any = [];
    bitmap:createjs.Bitmap;
    zoom:number = 1;
    isCache:boolean = false;
    isStoped:boolean = false;

    constructor(ssaData, imageList) {
        super();

        this.ssaData = ssaData;
        this.imageList = imageList;

        this.partsMap = new Array();
        var parts = ssaData.parts;
        var frameData = this.ssaData.ssa[0];
        for (var i = 0; i < parts.length; i++) {
            var partsFrameData = frameData[i];
            if(partsFrameData) {
                this.partsMap[parts[i]] = i;
                this.parts[i] = new createjs.Bitmap(this.imageList.getImage(partsFrameData[1]));
                this.parts[i].sourceRect = new createjs.Rectangle(partsFrameData[2], partsFrameData[3], partsFrameData[4], partsFrameData[5]);
                this.addChild(this.parts[i]);
            }
        }
    }

    useCache(isCache:boolean, width:number = 0, height:number = 0):void{
        this.isCache = isCache;
        if(this.isCache){
            this.cache(0, 0, width, height);
        }else{
            this.uncache();
        }
    }

    updateAnimation(ssaData:any, imageList:any):void{
        this.removeAllChildren();

        this.ssaData = ssaData;
        this.imageList = imageList;

        this.partsMap = new Array();
        var parts = ssaData.parts;
        var frameData = this.ssaData.ssa[0];
        for (var i = 0; i < parts.length; i++) {
            var partsFrameData = frameData[i];
            if(partsFrameData) {
                this.partsMap[parts[i]] = i;
                this.parts[i] = new createjs.Bitmap(this.imageList.getImage(partsFrameData[1]));
                this.parts[i].sourceRect = new createjs.Rectangle(partsFrameData[2], partsFrameData[3], partsFrameData[4], partsFrameData[5]);
                this.addChild(this.parts[i]);
            }
        }
    }


    // このアニメーションのFPS
    getFPS():any {
        return this.ssaData.fps;
    }

    // トータルフレーム数を返す
    getFrameCount():any {
        return this.ssaData.ssa.length;
    }

    // パーツリストを返す
    getParts():any {
        return this.ssaData.parts;
    }

    // パーツ名からNoを取得するマップを返す
    getPartsMap = function () {
        return this.partsMap;
    }

    // 描画メソッド
    drawFunc(frameNum):void {

        if(this.isStoped) return;

        var iPartNo:number      = 0;
        var iImageNo:number     = 1;
        var iSouX:number        = 2;
        var iSouY:number        = 3;
        var iSouW:number        = 4;
        var iSouH:number        = 5;
        var iDstX:number        = 6;
        var iDstY:number        = 7;
        var iDstAngle:number    = 8;
        var iDstScaleX:number   = 9;
        var iDstScaleY:number   = 10;
        var iOrgX:number        = 11;
        var iOrgY:number        = 12;
        var iFlipH:number       = 13;
        var iFlipV:number       = 14;
        var iAlpha:number       = 15;
        var iV0X:number         = 16;
        var iV0Y:number         = 17;

        var frameData = this.ssaData.ssa[frameNum];

        for (var refNo = 0; refNo < frameData.length; refNo++) {

            var partData = frameData[refNo];
            var partDataLen = partData.length;

            //重なり順
            //p.setChildIndex(parts[i],positionData.y);

            this.parts[refNo].x=partData[iDstX];
            this.parts[refNo].y=partData[iDstY];
            this.parts[refNo].rotation=-partData[iDstAngle] * 180/Math.PI;
            this.parts[refNo].scaleX=partData[iDstScaleX];
            this.parts[refNo].scaleY=partData[iDstScaleY];

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

            if(partDataLen > iOrgX){
                this.parts[refNo].regX=partData[iOrgX];
            }else{
                this.parts[refNo].regX=0;
            }
            if(partDataLen > iOrgY){
                this.parts[refNo].regY=partData[iOrgY];
            }else{
                this.parts[refNo].regY=0;
            }

            if(partDataLen > iFlipH){
                this.parts[refNo].scaleX*=partData[iFlipH] != 0 ? -1 : 1;
            }
            if(partDataLen > iFlipV){
                this.parts[refNo].scaleY*=partData[iFlipV] != 0 ? -1 : 1;
            }

            //createJSだと上手くbitmapを反転できないのでとりあえずそれっぽくなるように
            if((partDataLen > iFlipH && partData[iFlipH] != 0) || (partDataLen > iFlipV && partData[iFlipV] != 0)){
                this.parts[refNo].regX = vdw/2;
                this.parts[refNo].regY = vdh/2;
            }


            if(partData[iAlpha]){
                this.parts[refNo].alpha=partData[iAlpha];
            }else{
                this.parts[refNo].alpha=1;
            }

            if(this.isCache) this.updateCache();
        }
    }
}

interface SsData{
    animation: SsAnimation;
    playingFrame: number;
    prevDrawnTime: number;
    step: number;
    loop: number;
    loopCount: number;
    endCallBack: any;
    partStates: any;
    initPartStates: any;
}

export class SsSprite{


    inner:SsData;
    x:number = 0;
    y:number = 0;
    flipH:boolean = false;  //未実装らしい
    flipV:boolean = false;  //未実装らしい
    scale:number = 1.0;


    constructor(animation){
        // プライベート変数
        this.inner = {
            animation: animation,
            playingFrame: 0,
            prevDrawnTime: 0,
            step: 1,
            loop: 0,
            loopCount: 0,
            endCallBack: null,    // draw end callback
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
    // アニメーションの設定
    setAnimation(animation):void {
        this.inner.animation = animation;
        this.inner.initPartStates();
        this.inner.playingFrame = 0;
        this.inner.prevDrawnTime = 0;
        this.clearLoopCount();
    }
    // アニメーションの取得
    getAnimation():SsAnimation {
        return this.inner.animation;
    }

    // 再生フレームNoを設定
    setFrameNo(frameNo):void {
        this.inner.playingFrame = frameNo;
        this.inner.prevDrawnTime = 0;
    }
    // 再生フレームNoを取得
    getFrameNo():number {
        return this.inner.playingFrame >> 0;
    }

    // 再生スピードを設定 (1:標準)
    setStep(step):void {
        this.inner.step = step;
    }
    // 再生スピードを取得
    getStep():number {
        return this.inner.step;
    }

    // ループ回数の設定 (0:無限)
    setLoop(loop):void {
        if (loop < 0) return;
        this.inner.loop = loop;
    }
    // ループ回数の設定を取得
    getLoop():number {
        return this.inner.loop;
    }

    // 現在の再生回数を取得
    getLoopCount():number{
        return this.inner.loopCount;
    }
    // 現在の再生回数をクリア
    clearLoopCount():void {
        this.inner.loopCount = 0;
    }

    setEndCallBack(func):void {
        this.inner.endCallBack = func;
    }

    // パーツの状態（現在のX,Y座標など）を取得
    getPartState(name):SsPartState {
        if (this.inner.partStates == null) return null;

        var partsMap = this.inner.animation.getPartsMap();
        var partNo = partsMap[name];
        if (partNo == null) return null;
        return this.inner.partStates[partNo];
    }

    // 描画実行
    draw(currentTime):void {

        if (this.inner.animation == null) return;

        if (this.inner.loop == 0 || this.inner.loop > this.inner.loopCount) {
            // フレームを進める
            if (this.inner.prevDrawnTime > 0) {

                var s = (currentTime - this.inner.prevDrawnTime) / (1000 / this.inner.animation.getFPS());
                this.inner.playingFrame += s * this.inner.step;

                var c = (this.inner.playingFrame / this.inner.animation.getFrameCount()) >> 0;

                if (this.inner.step >= 0) {
                    if (this.inner.playingFrame >= this.inner.animation.getFrameCount()) {
                        // ループ回数更新
                        this.inner.loopCount += c;
                        // endo add 20120702
                        if (this.inner.loop == 0 || this.inner.loopCount < this.inner.loop) {
                            // フレーム番号更新、再生を続ける
                            this.inner.playingFrame %= this.inner.animation.getFrameCount();
                        }
                        else {
                            // 再生停止、最終フレームへ
                            this.inner.playingFrame = this.inner.animation.getFrameCount() - 1;
                            // 停止時コールバック呼び出し
                            if (this.inner.endCallBack != null) {
                                this.inner.endCallBack();
                            }
                        }
                    }
                }
                else {
                    if (this.inner.playingFrame < 0) {
                        // ループ回数更新
                        this.inner.loopCount += 1 + -c;
                        if (this.inner.loop == 0 || this.inner.loopCount < this.inner.loop) {
                            // フレーム番号更新、再生を続ける
                            this.inner.playingFrame %= this.inner.animation.getFrameCount();
                            if (this.inner.playingFrame < 0) this.inner.playingFrame += this.inner.animation.getFrameCount();
                        }
                        else {
                            // 再生停止、先頭フレームへ
                            this.inner.playingFrame = 0;
                            // 停止時コールバック呼び出し
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
    }
}