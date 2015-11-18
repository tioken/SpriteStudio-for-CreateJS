
////////////////////////////////////////////////////////////
// SsImageList
////////////////////////////////////////////////////////////

function SsImageList(imageFiles, aFileRoot, loadImmediately, aOnLoad) {

	this.fileRoot = aFileRoot;
	this.imagePaths = new Array();
	this.images = new Array();

	// ���[�h�������ɌĂ΂��R�[���o�b�N
	// Callback that is called when the load is finished.
	this.onLoad = aOnLoad;

	// �S���ǂݍ��܂ꂽ�ꍇ�̂݃��[�U�[���ݒ肵���R�[���o�b�N���Ă�
	// Only when it is all loaded, is called a callback set by the user.
	this.onLoad_ = function () {
		for (var i in this.images)
			if (i != null && i.complete == false)
				return;
		if (this.onLoad != null)
			this.onLoad();
	}

	for (var i = 0; i < imageFiles.length; i++) {
		var path = this.fileRoot + imageFiles[i];
//        console.log(path);
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

// �w�肵���C���f�b�N�X��Image��Ԃ�
// Get image at specified index.
SsImageList.prototype.getImage = function (index) {
	if (index < 0 || index >= this.images.length) return null;
	return this.images[index];
}

// �w�肵���C���f�b�N�X�̉摜��imagePath�ō����ւ���B
// Replace image of specified index at imagePath.
SsImageList.prototype.setImage = function (index, imagePath) {
	if (index < 0 || index >= this.images.length) return null;
	this.imagePaths[index] = this.fileRoot + imagePath;
	this.images[index].onload = this.onLoad_;
	this.images[index].src = this.imagePaths[index];
}

// ���[�h�������R�[���o�b�N��ݒ肷��
// Set a callback when load is finished.
SsImageList.prototype.setOnLoad = function (cb) {
	this.onLoad = cb;
}


////////////////////////////////////////////////////////////
// SsPartState
////////////////////////////////////////////////////////////

function SsPartState(name) {

	// �p�[�c��
	// Parts name.
	this.name = name;
	// ���݂̕`��X�|�W�V����
	// Current x position at drawing.
	this.x = 0;
	// ���݂̕`��Y�|�W�V����
	// Current x position at drawing.
	this.y = 0;
}


////////////////////////////////////////////////////////////
// SsAnimation
////////////////////////////////////////////////////////////

function SsAnimation(ssaData, imageList) {

	this.ssaData = ssaData;
	this.imageList = imageList;

	this.partsMap = new Array();
	this.parts = ssaData.parts;
	for (var i = 0; i < this.parts.length; i++) {
		this.partsMap[this.parts[i]] = i;
	}
}

// ���̃A�j���[�V������FPS
// This animation FPS.
SsAnimation.prototype.getFPS = function () {
	return this.ssaData.fps;
}

// �g�[�^���t���[������Ԃ�
// Get total frame count.
SsAnimation.prototype.getFrameCount = function () {
	return this.ssaData.ssa.length;
}

// �p�[�c���X�g��Ԃ�
// Get parts list.
SsAnimation.prototype.getParts = function () {
	return this.ssaData.parts;
}

// �p�[�c������No���擾����}�b�v��Ԃ�
// Return the map, to get the parts from number.
SsAnimation.prototype.getPartsMap = function () {
	return this.partsMap;
}

// �`�惁�\�b�h
// Draw method.
SsAnimation.prototype.drawFunc = function (ctx, frameNo, x, y, flipH, flipV, partStates, scale) {

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

	var frameData = this.ssaData.ssa[frameNo];
	for (var refNo = 0; refNo < frameData.length; refNo++) {

		var partData = frameData[refNo];
		var partDataLen = partData.length;

		var partNo = partData[iPartNo];
		var img = this.imageList.getImage(partData[iImageNo]);
		var sx = partData[iSouX];
		var sy = partData[iSouY];
		var sw = partData[iSouW];
		var sh = partData[iSouH];
		var dx = partData[iDstX];
		var dy = partData[iDstY];

		var vdw = sw;
		var vdh = sh;

		// ����̒��_�ό`�̂ݔ��f
		// Reflect only changes in the upper-left vertex deformation.
		if (partDataLen > iV0X) {
			dx += partData[iV0X];
			vdw -= partData[iV0X];
		}
		if (partDataLen > iV0Y) {
			dy += partData[iV0Y];
			vdh -= partData[iV0Y];
		}

		dx += x;
		dy += y;

		if (sw > 0 && sh > 0) {

			var dang = partData[iDstAngle];
			var scaleX = partData[iDstScaleX];
			var scaleY = partData[iDstScaleY];

			var ox = (partDataLen > iOrgX) ? partData[iOrgX] : 0;
			var oy = (partDataLen > iOrgY) ? partData[iOrgY] : 0;
			//var fh = (partDataLen > iFlipH) ? (partData[iFlipH] != 0 ? -1 : 1) : (1);
			var fh=1;
			//var fv = (partDataLen > iFlipV) ? (partData[iFlipV] != 0 ? -1 : 1) : (1);
			var fv=1;
			var alpha = (partDataLen > iAlpha) ? partData[iAlpha] : 1.0;

			ctx.globalAlpha = alpha;
			//ctx.setTransform(1, 0, 0, 1, dx, dy); 		// �ŏI�I�ȕ\���ʒu��. To display the final position.
			ctx.setTransform(1 * scale, 0, 0, 1 * scale, dx * scale, dy * scale); 	// �ŏI�I�ȕ\���ʒu��. To display the final position.
			ctx.rotate(-dang);
			ctx.scale(scaleX, scaleY);
			ctx.translate(-ox + vdw / 2, -oy + vdh / 2); 	// �p�[�c�̌��_��. To the origin of the parts.
			ctx.scale(fh, fv); 						    	// �p�[�c�̒��S�_�Ńt���b�v. Flip at the center point of the parts.

			// check
			//
			//      console.log(sx, sy, sw, sh);
			//      sw = (sx + sw < img.width) ? sw : img.width - sx;
			//      sh = (sy + sh < img.height) ? sh : img.height - sy;
			//      sw = (sw < 0) ? 0 : sw;
			//      sh = (sh < 0) ? 0 : sh;
			//      sx = (sx < 0) ? 0 : sx;
			//      sy = (sy < 0) ? 0 : sy;
			//      console.log(sx, sy, sw, sh);

			ctx.drawImage(img, sx, sy, sw, sh, -vdw / 2, -vdh / 2, vdw, vdh);
		}

		var state = partStates[partNo];
		state.x = dx;
		state.y = dy;
	}
}


////////////////////////////////////////////////////////////
// SsSprite
////////////////////////////////////////////////////////////

function SsSprite(animation) {

	// �v���C�x�[�g�ϐ�
	// Private variables.
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

// �`��X�|�W�V����
// X position at drawing.
SsSprite.prototype.x = 0;

// �`��Y�|�W�V����
// Y position at drawing
SsSprite.prototype.y = 0;

// ��������
// *Not implemented.
SsSprite.prototype.flipH = false;
SsSprite.prototype.flipV = false;

// scale
SsSprite.prototype.scale = 1.0;

// �A�j���[�V�����̐ݒ�
// Set animation.
SsSprite.prototype.setAnimation = function (animation) {
	this.inner.animation = animation;
	this.inner.initPartStates();
	this.inner.playingFrame = 0;
	this.inner.prevDrawnTime = 0;
	this.clearLoopCount();
}

// �A�j���[�V�����̎擾
// Get animation.
SsSprite.prototype.getAnimation = function () {
	return this.inner.animation;
}

// �Đ��t���[��No��ݒ�
// Set frame no of playing.
SsSprite.prototype.setFrameNo = function (frameNo) {
	this.inner.playingFrame = frameNo;
	this.inner.prevDrawnTime = 0;
}

// �Đ��t���[��No���擾
// Get frame no of playing.
SsSprite.prototype.getFrameNo = function () {
	return this.inner.playingFrame >> 0;
}

// �Đ��X�s�[�h��ݒ� (1:�W��)
// Set speed to play. (1:normal speed)
SsSprite.prototype.setStep = function (step) {
	this.inner.step = step;
}

// �Đ��X�s�[�h���擾
// Get speed to play. (1:normal speed)
SsSprite.prototype.getStep = function () {
	return this.inner.step;
}

// ���[�v�񐔂̐ݒ� (0:����)
// Set a playback loop count.  (0:infinite)
SsSprite.prototype.setLoop = function (loop) {
	if (loop < 0) return;
	this.inner.loop = loop;
}

// ���[�v�񐔂̐ݒ���擾
// Get a playback loop count of specified. (0:infinite)
SsSprite.prototype.getLoop = function () {
	return this.inner.loop;
}

// ���݂̍Đ��񐔂��擾
// Get repeat count a playback.
SsSprite.prototype.getLoopCount = function () {
	return this.inner.loopCount;
}

// ���݂̍Đ��񐔂��N���A
// Clear repeat count a playback.
SsSprite.prototype.clearLoopCount = function () {
	this.inner.loopCount = 0;
}

// �A�j���[�V�����I�����̃R�[���o�b�N��ݒ�
// Set the call back at the end of animation.
SsSprite.prototype.setEndCallBack = function (func) {
	this.inner.endCallBack = func;
}

// �p�[�c�̏�ԁi���݂�X,Y���W�Ȃǁj���擾
// Gets the state of the parts. (Current x and y positions)
SsSprite.prototype.getPartState = function (name) {
	if (this.inner.partStates == null) return null;

	var partsMap = this.inner.animation.getPartsMap();
	var partNo = partsMap[name];
	if (partNo == null) return null;
	return this.inner.partStates[partNo];
}

// �`����s
// Drawing method.
SsSprite.prototype.draw = function (ctx, currentTime) {

	if (this.inner.animation == null) return;

	if (this.inner.loop == 0 || this.inner.loop > this.inner.loopCount) {
		// �t���[����i�߂�
		// To next frame.
		if (this.inner.prevDrawnTime > 0) {

			var s = (currentTime - this.inner.prevDrawnTime) / (1000 / this.inner.animation.getFPS());
			this.inner.playingFrame += s * this.inner.step;

			var c = (this.inner.playingFrame / this.inner.animation.getFrameCount()) >> 0;

			if (this.inner.step >= 0) {
				if (this.inner.playingFrame >= this.inner.animation.getFrameCount()) {
					// ���[�v�񐔍X�V
					// Update repeat count.
					this.inner.loopCount += c;
					if (this.inner.loop == 0 || this.inner.loopCount < this.inner.loop) {
						// �t���[���ԍ��X�V�A�Đ��𑱂���
						// Update frame no, and playing.
						this.inner.playingFrame %= this.inner.animation.getFrameCount();
					}
					else {
						// �Đ���~�A�ŏI�t���[����
						// Stop animation, to last frame.
						this.inner.playingFrame = this.inner.animation.getFrameCount() - 1;
						// ��~���R�[���o�b�N�Ăяo��
						// Call finished callback.
						if (this.inner.endCallBack != null) {
							this.inner.endCallBack();
						}
					}
				}
			}
			else {
				if (this.inner.playingFrame < 0) {
					// ���[�v�񐔍X�V
					// Update repeat count.
					this.inner.loopCount += 1 + -c;
					if (this.inner.loop == 0 || this.inner.loopCount < this.inner.loop) {
						// �t���[���ԍ��X�V�A�Đ��𑱂���
						// Update frame no, and playing.
						this.inner.playingFrame %= this.inner.animation.getFrameCount();
						if (this.inner.playingFrame < 0) this.inner.playingFrame += this.inner.animation.getFrameCount();
					}
					else {
						// �Đ���~�A�擪�t���[����
						// Stop animation, to first frame.
						this.inner.playingFrame = 0;
						// ��~���R�[���o�b�N�Ăяo��
						// Call finished callback.
						if (this.inner.endCallBack != null) {
							this.inner.endCallBack();
						}
					}
				}
			}

		}
	}
	//else {
	//	// �Đ���~
	//	// Stop animation.
	//	this.inner.playingFrame = 0;
	//}

	this.inner.prevDrawnTime = currentTime;

	this.inner.animation.drawFunc(ctx, this.getFrameNo(), this.x, this.y, this.flipH, this.flipV, this.inner.partStates, this.scale);
}

