///<reference path="../d.ts/jquery/jquery.d.ts" />

export class SsJson{
    data:any;
    constructor(url){
        $.ajaxSetup({async: false});
        $.getJSON(url , (data) => {
            this.data = data;
        });
        $.ajaxSetup({async: true});
    }
    getAnimation(animation_id):any{
        if(animation_id) return this.data[animation_id].animation;
        return this.data.animation;
    }
    getImages(animation_id):any{
        if(animation_id) return this.data[animation_id].images;
        return this.data.images;
    }
}