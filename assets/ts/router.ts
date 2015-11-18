declare var jupiter_config:any;
declare var require;

//これは必要無いけどコンパイル時にファイルが参照されるように
import  c1 = require("controller/home");

export class Router {
    static routeMap:any = {
        "/createjs_test" : function(param){
            require(['controller/home'], function(controller){
                return new controller.HomeController(param);
            });
        }
    }
    static getController(param:any){
        if(!Router.routeMap[location.pathname]) {
            if (Router.routeMap[location.pathname.slice(0, -1)]) {
                Router.routeMap[location.pathname.slice(0, -1)](param);
                return true;
            } else {
                return false;
            }
        }
        Router.routeMap[location.pathname](param);
        return true;
    }
}
var jupiter_config = jupiter_config || {};
Router.getController(jupiter_config);
