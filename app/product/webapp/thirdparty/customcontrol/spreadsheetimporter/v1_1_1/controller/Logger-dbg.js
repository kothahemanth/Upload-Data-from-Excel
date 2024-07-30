"use strict";

sap.ui.define(["sap/ui/base/ManagedObject"], function (ManagedObject) {
  "use strict";

  /**
   * @namespace cc.spreadsheetimporter.v1_1_1
   */
  const Logger = ManagedObject.extend("cc.spreadsheetimporter.v1_1_1.Logger", {
    returnObject: function _returnObject(object) {
      return object;
    }
  });
  return Logger;
});
