export class BaseController<T, U>{
    model:T;
    view:U;
    constructor(param:T, view:U){
        this.model = param;
        this.view = view;
        this.view["model"] = (param);
        this.init();
    }
    init():void {
        //null
    }
    exec():void {
        //null
    }
}
