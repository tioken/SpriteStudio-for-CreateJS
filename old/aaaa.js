var character_list = new Array();
var module = (function() {
    return {
        create_character: function (actor_id) {
            var image = new SsImageList(animation_images, "./", true);
            var animation = new SsAnimation(spear_anime_idol_animation, image);
            var sprite = new SsSprite(animation);
            sprite.setLoop(0);
            //アニメーションを表示するキャンバスを用意
            var canvas_dom = $('<canvas class="zoom025" width="1500" height="1000" style="margin-left:-750px;margin-top:-900px;position:absolute;"></canvas>');
            canvas_dom = canvas_dom.appendTo($("body")).get(0);
            var canvas = canvas_dom.getContext("2d");
            character_list[actor_id] = {
                image: image,
                animation: animation,
                sprite: sprite,
                canvas: canvas,
                canvas_dom: canvas_dom,
                move_jump: false,
            };
        },
        jump: function (actor_id) {
            var character =  character_list[actor_id];
            //ジャンプアニメーションを設定
            character.animeation = new SsAnimation(spear_anime_jump_animation, character.image);
            character.sprite.setLoop(1); //１回のみ
            character.move_jump = true;
            character.sprite.setEndCallBack(function () {
                //アイドル状態に戻す
                character.move_jump = false;
                character.sprite.setAnimation(character.animeation);
                character.sprite.setLoop(0);   //無限
            });
            character.sprite.setAnimation(character.animeation);
        }
    }
})();
$(function() {
    setInterval(function () {
        character_list.forEach(function (character, key) {
            character.canvas.save();
            character.canvas.clearRect(0, 0, 1500, 1000);

            //キャラクターの移動処理など

            character.data.draw(character.canvas, t);
            character.canvas.restore();
        });
    }, 16);
});