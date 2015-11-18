
    export class BaseModel {
        constructor(){

        }
        loadParam(data:any){
            for(var prop in data){
                this[prop] = data[prop];
            }
        }
    }
