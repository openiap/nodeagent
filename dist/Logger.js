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
        }
    };
    return Logger;
}());
exports.Logger = Logger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL0xvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQTtJQUFBO0lBaUJBLENBQUM7SUFmaUIsV0FBSSxHQUFsQjtRQUNJLElBQUksd0JBQXdCLEdBQVEsSUFBSSxDQUFDO1FBQ3pDLElBQUk7WUFDQSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLElBQUksSUFBSSxJQUFJLE9BQU8sQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLElBQUksT0FBTyxFQUFFO2FBQ2xHO2lCQUFNO2dCQUNILHdCQUF3QixHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO2FBQzNEO1NBQ0o7UUFBQyxPQUFPLEtBQUssRUFBRTtTQUNmO1FBQ0QsSUFBSSx3QkFBd0IsSUFBSSxJQUFJLElBQUksTUFBTSxDQUFDLGVBQWUsSUFBSSxJQUFJLEVBQUU7WUFDcEUsTUFBTSxDQUFDLGVBQWUsR0FBRyx3QkFBd0IsQ0FBQyxlQUFlLENBQUM7U0FDckU7YUFBTTtTQUNOO0lBRUwsQ0FBQztJQUNMLGFBQUM7QUFBRCxDQUFDLEFBakJELElBaUJDO0FBakJZLHdCQUFNIn0=