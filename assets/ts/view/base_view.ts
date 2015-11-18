    export class BaseView<T> {
        private _model:T;
        constructor(){

        }
        set model(value:T){
            this._model = value;
            this.init();
        }
        get model():T{
            return this._model;
        }
        init():void{
            //null
        }
    }
