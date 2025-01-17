"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
var Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger.init = function () {
        var _instrumentation_require = null;
        try {
            if (process.env.enable_analytics != null && process.env.enable_analytics.toLowerCase() == "false") {
            }
            else {
                _instrumentation_require = require("./instrumentation");
            }
        }
        catch (error) {
        }
        if (_instrumentation_require != null && Logger.instrumentation == null) {
            Logger.instrumentation = _instrumentation_require.instrumentation;
        }
        else {
            Logger.instrumentation = {
                init: function (client) { },
                addMeterURL: function (url) { },
                addTraceURL: function (url) { },
                error: function (error) { return console.error(error); },
                info: function (message) { return console.log(message); },
                setparent: function (traceId, spanId, traceFlags) { return null; }
            };
        }
    };
    return Logger;
}());
exports.Logger = Logger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL0xvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQTtJQUFBO0lBeUJBLENBQUM7SUF2QmlCLFdBQUksR0FBbEI7UUFDSSxJQUFJLHdCQUF3QixHQUFRLElBQUksQ0FBQztRQUN6QyxJQUFJO1lBQ0EsSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixJQUFJLElBQUksSUFBSSxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLFdBQVcsRUFBRSxJQUFJLE9BQU8sRUFBRTthQUNsRztpQkFBTTtnQkFDSCx3QkFBd0IsR0FBRyxPQUFPLENBQUMsbUJBQW1CLENBQUMsQ0FBQzthQUMzRDtTQUNKO1FBQUMsT0FBTyxLQUFLLEVBQUU7U0FDZjtRQUNELElBQUksd0JBQXdCLElBQUksSUFBSSxJQUFJLE1BQU0sQ0FBQyxlQUFlLElBQUksSUFBSSxFQUFFO1lBQ3BFLE1BQU0sQ0FBQyxlQUFlLEdBQUcsd0JBQXdCLENBQUMsZUFBZSxDQUFDO1NBQ3JFO2FBQU07WUFDSCxNQUFNLENBQUMsZUFBZSxHQUFHO2dCQUNyQixJQUFJLEVBQUUsVUFBQyxNQUFjLElBQU8sQ0FBQztnQkFDN0IsV0FBVyxFQUFFLFVBQUMsR0FBVyxJQUFNLENBQUM7Z0JBQ2hDLFdBQVcsRUFBRSxVQUFDLEdBQVcsSUFBTSxDQUFDO2dCQUNoQyxLQUFLLEVBQUUsVUFBQyxLQUFVLElBQUssT0FBQSxPQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxFQUFwQixDQUFvQjtnQkFDM0MsSUFBSSxFQUFFLFVBQUMsT0FBZSxJQUFLLE9BQUEsT0FBTyxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBcEIsQ0FBb0I7Z0JBQy9DLFNBQVMsRUFBRSxVQUFDLE9BQWUsRUFBRSxNQUFjLEVBQUUsVUFBc0IsSUFBSyxPQUFBLElBQUksRUFBSixDQUFJO2FBQy9FLENBQUE7U0FDSjtJQUVMLENBQUM7SUFDTCxhQUFDO0FBQUQsQ0FBQyxBQXpCRCxJQXlCQztBQXpCWSx3QkFBTSJ9