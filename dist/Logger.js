"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
var Logger = /** @class */ (function () {
    function Logger() {
    }
    Logger.init = function () {
        var _instrumentation_require = null;
        try {
            _instrumentation_require = require("./instrumentation");
        }
        catch (error) {
        }
        if (_instrumentation_require != null && Logger.instrumentation == null) {
            Logger.instrumentation = _instrumentation_require.instrumentation;
            Logger.instrumentation.init();
        }
        else {
        }
    };
    return Logger;
}());
exports.Logger = Logger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiTG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL0xvZ2dlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQTtJQUFBO0lBZUEsQ0FBQztJQWJpQixXQUFJLEdBQWxCO1FBQ0ksSUFBSSx3QkFBd0IsR0FBUSxJQUFJLENBQUM7UUFDekMsSUFBSTtZQUNBLHdCQUF3QixHQUFHLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDO1NBQzNEO1FBQUMsT0FBTyxLQUFLLEVBQUU7U0FDZjtRQUNELElBQUksd0JBQXdCLElBQUksSUFBSSxJQUFJLE1BQU0sQ0FBQyxlQUFlLElBQUksSUFBSSxFQUFFO1lBQ3BFLE1BQU0sQ0FBQyxlQUFlLEdBQUcsd0JBQXdCLENBQUMsZUFBZSxDQUFDO1lBQ2xFLE1BQU0sQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLENBQUM7U0FDakM7YUFBTTtTQUNOO0lBRUwsQ0FBQztJQUNMLGFBQUM7QUFBRCxDQUFDLEFBZkQsSUFlQztBQWZZLHdCQUFNIn0=