define(["require", "exports"], function (require, exports) {
    var Router = (function () {
        function Router() {
        }
        Router.getController = function (param) {
            if (!Router.routeMap[location.pathname]) {
                if (Router.routeMap[location.pathname.slice(0, -1)]) {
                    Router.routeMap[location.pathname.slice(0, -1)](param);
                    return true;
                }
                else {
                    return false;
                }
            }
            Router.routeMap[location.pathname](param);
            return true;
        };
        Router.routeMap = {
            "/createjs_test": function (param) {
                require(['controller/home'], function (controller) {
                    return new controller.HomeController(param);
                });
            }
        };
        return Router;
    })();
    exports.Router = Router;
    var jupiter_config = jupiter_config || {};
    Router.getController(jupiter_config);
});
