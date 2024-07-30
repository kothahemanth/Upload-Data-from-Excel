"use strict";

sap.ui.define(["sap/ui/base/ManagedObject", "sap/m/Button", "sap/m/Column", "sap/m/ColumnListItem", "sap/m/Dialog", "sap/m/Table", "sap/ui/model/json/JSONModel", "sap/m/Text", "./Util"], function (ManagedObject, Button, Column, ColumnListItem, Dialog, Table, JSONModel, Text, __Util) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const Util = _interopRequireDefault(__Util);
  /**
   * @namespace cc.spreadsheetimporter.v1_1_1
   */
  const Preview = ManagedObject.extend("cc.spreadsheetimporter.v1_1_1.Preview", {
    constructor: function _constructor(util) {
      ManagedObject.prototype.constructor.call(this);
      this.util = util;
    },
    showPreview: function _showPreview(payload, typeLabelList, previewColumns) {
      const table = this.createDynamicTable(payload, typeLabelList, previewColumns);
      if (typeof table === "undefined") {
        return;
      }
      this.dialog = new Dialog({
        title: this.util.geti18nText("spreadsheetimporter.previewTableName"),
        content: [table],
        buttons: [new Button({
          text: this.util.geti18nText("spreadsheetimporter.messageDialogButtonClose"),
          press: () => {
            this.dialog.close();
          }
        })],
        afterClose: () => {
          this.dialog.destroy();
        }
      });
      this.dialog.open();
    },
    createDynamicTable: function _createDynamicTable(data, typeLabelList, previewColumns) {
      const table = new Table();

      // Create table columns and cells based on the first object's keys
      if (typeof data !== "undefined" && data !== null && data.length > 0) {
        const firstObject = data[0];
        const aColumns = Object.keys(firstObject);
        aColumns.forEach(column => {
          // check if column is in previewColumns
          if (previewColumns && previewColumns.length > 0 && previewColumns.indexOf(column) === -1) {
            return;
          }
          const type = typeLabelList.get(column);
          const label = type && type.label ? type.label : column;
          const sapMColumn = new Column({
            header: new Text({
              text: label
            })
          });
          table.addColumn(sapMColumn);
        });

        // Create a template for table rows
        const template = new ColumnListItem();
        aColumns.forEach(column => {
          let oCell;
          if (typeof firstObject[column] === "object" && firstObject[column] instanceof Date) {
            // show date in the format dd.mm.yyyy
            oCell = new Text({
              text: `{path: '${column}', type: 'sap.ui.model.type.Date'}`
            });
          } else {
            oCell = new Text({
              text: "{" + column + "}"
            });
          }
          template.addCell(oCell);
        });

        // Bind the data to the table
        const model = new JSONModel();
        model.setData(data);
        table.setModel(model);
        table.bindItems({
          path: "/",
          template: template
        });
        return table;
      } else {
        // No data
        Util.showError(new Error(this.util.geti18nText("spreadsheetimporter.noDataPreview")), "Preview.ts", "createDynamicTable");
        return undefined;
      }
    }
  });
  return Preview;
});
