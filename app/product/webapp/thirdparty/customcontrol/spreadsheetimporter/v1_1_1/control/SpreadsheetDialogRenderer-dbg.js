"use strict";

sap.ui.define(["sap/m/DialogRenderer"], function (DialogRenderer) {
  "use strict";

  /**
   * @name cc.spreadsheetimporter.v1_1_1.SpreadsheetDialog
   */
  var __exports = {
    // can´t use apiVersion: 2, because of support for 1.71, remove when out of support
    //apiVersion: 2,
    render: function (rm, control) {
      // @ts-ignore
      DialogRenderer.render.apply(this, arguments);
    }
  };
  return __exports;
});
