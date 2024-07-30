"use strict";

sap.ui.define(["sap/ui/base/ManagedObject", "sap/ui/core/Fragment", "sap/m/MessageToast", "../Preview", "../Util", "cc/spreadsheetimporter/v1_1_1/thirdparty/xlsx", "./OptionsDialog", "sap/base/Log", "../SheetHandler", "../Parser", "sap/m/Button", "sap/ui/model/json/JSONModel", "sap/m/Dialog", "sap/m/Select", "sap/ui/core/Item"], function (ManagedObject, Fragment, MessageToast, __Preview, __Util, XLSX, __OptionsDialog, Log, __SheetHandler, __Parser, Button, JSONModel, Dialog, Select, Item) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const Preview = _interopRequireDefault(__Preview);
  const Util = _interopRequireDefault(__Util);
  const OptionsDialog = _interopRequireDefault(__OptionsDialog);
  const SheetHandler = _interopRequireDefault(__SheetHandler);
  const Parser = _interopRequireDefault(__Parser);
  /**
   * @namespace cc.spreadsheetimporter.v1_1_1
   */
  const SpreadsheetUploadDialog = ManagedObject.extend("cc.spreadsheetimporter.v1_1_1.SpreadsheetUploadDialog", {
    constructor: function _constructor(spreadsheetUploadController, component, componentI18n, messageHandler) {
      ManagedObject.prototype.constructor.call(this);
      this.spreadsheetUploadController = spreadsheetUploadController;
      this.component = component;
      this.componentI18n = componentI18n;
      this.util = new Util(componentI18n.getResourceBundle());
      this.previewHandler = new Preview(this.util);
      this.optionsHandler = new OptionsDialog(spreadsheetUploadController);
      this.messageHandler = messageHandler;
    },
    createSpreadsheetUploadDialog: async function _createSpreadsheetUploadDialog() {
      if (!this.spreadsheetUploadDialog) {
        this.spreadsheetOptionsModel = new JSONModel({
          dataRows: 0,
          strict: this.component.getStrict(),
          hidePreview: this.component.getHidePreview(),
          showOptions: this.component.getShowOptions(),
          hideGenerateTemplateButton: false,
          fileUploadValue: "",
          densityClass: this.component._densityClass
        });
        this.spreadsheetUploadDialog = await Fragment.load({
          name: "cc.spreadsheetimporter.v1_1_1.fragment.SpreadsheetUpload",
          type: "XML",
          controller: this
        });
        this.spreadsheetUploadDialog.setComponent(this.component);
        this.spreadsheetUploadDialog.setBusyIndicatorDelay(0);
        this.spreadsheetUploadDialog.setModel(this.componentI18n, "i18n");
        this.spreadsheetUploadDialog.setModel(this.spreadsheetOptionsModel, "info");
        this.spreadsheetUploadDialog.setModel(this.component.getModel("device"), "device");
        this.spreadsheetUploadDialog.attachDecimalSeparatorChanged(this.onDecimalSeparatorChanged.bind(this));
        this.spreadsheetUploadDialog.attachAvailableOptionsChanged(this.onAvailableOptionsChanged.bind(this));
        this.spreadsheetUploadDialog.attachFileDrop(this.onFileDrop.bind(this));
      }
      if (this.component.getStandalone() && this.component.getColumns().length === 0) {
        this.spreadsheetOptionsModel.setProperty("/hideGenerateTemplateButton", true);
      }
    },
    onFileDrop: function _onFileDrop(event) {
      const files = event.getParameter("files");
      const file = files[0];
      this.spreadsheetUploadDialog.getModel("info").setProperty("/fileUploadValue", file.name);
      this.handleFile(file);
    },
    /**
     * Handles file upload event.
     * @param {Event} event - The file upload event
     */
    onFileUpload: async function _onFileUpload(event) {
      this.messageHandler.setMessages([]);
      const file = event.getParameter("files")[0];
      this.handleFile(file);
    },
    handleFile: async function _handleFile(file) {
      try {
        this.messageHandler.setMessages([]);
        const workbook = await this._readWorkbook(file);
        const isStandalone = this.component.getStandalone();
        const readAllSheets = this.component.getReadAllSheets();
        let spreadsheetSheetsData = [];
        let columnNames = [];
        if (isStandalone && readAllSheets) {
          // Loop over the sheet names in the workbook
          for (const sheetName of Object.keys(workbook.Sheets)) {
            let currSheetData = SheetHandler.sheet_to_json(workbook.Sheets[sheetName]);
            for (const dataVal of currSheetData) {
              Object.keys(dataVal).forEach(key => {
                dataVal[key].sheetName = sheetName;
              });
            }
            spreadsheetSheetsData = spreadsheetSheetsData.concat(currSheetData);
            columnNames = columnNames.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
              header: 1
            })[0]);
          }
        } else {
          const sheetOption = this.spreadsheetUploadController.component.getReadSheet();
          let sheetName;
          try {
            sheetName = await this._getSheetName(workbook, sheetOption);
          } catch (error) {
            this.resetContent();
            return;
          }
          spreadsheetSheetsData = SheetHandler.sheet_to_json(workbook.Sheets[sheetName]);
          columnNames = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
            header: 1
          })[0];
        }
        if (!spreadsheetSheetsData || spreadsheetSheetsData.length === 0) {
          throw new Error(this.util.geti18nText("spreadsheetimporter.emptySheet"));
        }

        //remove empty spaces before and after every value
        for (const object of spreadsheetSheetsData) {
          for (const key in object) {
            object[key].rawValue = typeof object[key].rawValue === "string" ? object[key].rawValue.trim() : object[key].rawValue;
          }
        }
        if (!isStandalone) {
          this.messageHandler.checkFormat(spreadsheetSheetsData);
          this.messageHandler.checkMandatoryColumns(spreadsheetSheetsData, columnNames, this.spreadsheetUploadController.odataKeyList, this.component.getMandatoryFields(), this.spreadsheetUploadController.typeLabelList);
          this.messageHandler.checkDuplicateColumns(columnNames);
          if (!this.component.getSkipMaxLengthCheck()) {
            this.messageHandler.checkMaxLength(spreadsheetSheetsData, this.spreadsheetUploadController.typeLabelList, this.component.getFieldMatchType());
          }
          if (!this.component.getSkipColumnsCheck()) {
            this.messageHandler.checkColumnNames(columnNames, this.component.getFieldMatchType(), this.spreadsheetUploadController.typeLabelList);
          }
        }
        this.spreadsheetUploadController.payload = spreadsheetSheetsData;
        this.spreadsheetUploadController.payloadArray = isStandalone ? this.spreadsheetUploadController.payload : Parser.parseSpreadsheetData(this.spreadsheetUploadController.payload, this.spreadsheetUploadController.typeLabelList, this.component, this.messageHandler, this.util, this.spreadsheetUploadController.isODataV4);
        this.getDialog().setBusy(true);
        try {
          await Util.fireEventAsync("checkBeforeRead", {
            sheetData: spreadsheetSheetsData,
            parsedData: this.spreadsheetUploadController.payloadArray
          }, this.component);
        } catch (error) {
          Log.error("Error while calling the checkBeforeRead event", error, "SpreadsheetUpload: onFileUpload");
        }
        this.getDialog().setBusy(false);
        if (this.messageHandler.areMessagesPresent()) {
          // show error dialog
          this.messageHandler.displayMessages();
          return;
        }
        this.setDataRows(this.spreadsheetUploadController.payloadArray.length);
      } catch (error) {
        Util.showError(error, "SpreadsheetUpload.ts", "onFileUpload");
        this.resetContent();
      }
    },
    /**
     * Sending extracted data to backend
     * @param {*} event
     */
    onUploadSet: async function _onUploadSet(event) {
      const source = event.getSource();
      this.getDialog().setBusy(true);
      let fireEventAsyncReturn;
      let isDefaultPrevented;
      try {
        fireEventAsyncReturn = await Util.fireEventAsync("uploadButtonPress", {
          payload: this.spreadsheetUploadController.payloadArray,
          rawData: this._extractRawValues(this.spreadsheetUploadController.payloadArray),
          parsedData: this._extractParsedValues(this.spreadsheetUploadController.payloadArray)
        }, this.component);
        isDefaultPrevented = fireEventAsyncReturn.bPreventDefault;
      } catch (error) {}
      this.getDialog().setBusy(false);
      if (isDefaultPrevented || this.component.getStandalone()) {
        this.onCloseDialog();
        if (this.messageHandler.areMessagesPresent()) {
          this.messageHandler.displayMessages(true);
        }
        return;
      }
      // checking if spreadsheet file contains data or not
      if (!this.spreadsheetUploadController.payloadArray.length) {
        MessageToast.show(this.util.geti18nText("spreadsheetimporter.selectFileUpload"));
        return;
      }
      var that = this;
      const sourceParent = source.getParent();
      sourceParent.setBusyIndicatorDelay(0);
      sourceParent.setBusy(true);
      await Util.sleep(50);

      // creating a promise as the extension api accepts odata call in form of promise only
      var fnAddMessage = function () {
        return new Promise((fnResolve, fnReject) => {
          that.spreadsheetUploadController.getODataHandler().callOdata(fnResolve, fnReject, that.spreadsheetUploadController);
        });
      };
      var mParameters = {
        busy: {
          set: true,
          check: false
        },
        dataloss: {
          popup: false,
          navigation: false
        },
        sActionLabel: this.util.geti18nText("spreadsheetimporter.uploadingFile")
      };

      // calling the OData service using extension api
      if (this.spreadsheetUploadController.isODataV4) {
        try {
          await this.spreadsheetUploadController.context.editFlow.securedExecution(fnAddMessage, mParameters);
        } catch (error) {
          Log.error("Error while calling the odata service", error, "SpreadsheetUpload: onUploadSet");
        }
      } else {
        try {
          if (this.spreadsheetUploadController.context.extensionAPI) {
            await this.spreadsheetUploadController.context.extensionAPI.securedExecution(fnAddMessage, mParameters);
          } else {
            await fnAddMessage();
          }
        } catch (error) {
          Log.error("Error while calling the odata service", error, "SpreadsheetUpload: onUploadSet");
          this.spreadsheetUploadController.errorsFound = true;
          this.resetContent();
        }
      }
      sourceParent.setBusy(false);
      this.getDialog().setBusy(true);
      try {
        await Util.fireEventAsync("requestCompleted", {
          success: !this.spreadsheetUploadController.errorsFound
        }, this.component);
      } catch (error) {
        Log.error("Error while calling the requestCompleted event", error, "SpreadsheetUpload: onUploadSet");
      }
      this.getDialog().setBusy(false);
      this.onCloseDialog();
    },
    openSpreadsheetUploadDialog: function _openSpreadsheetUploadDialog() {
      this.spreadsheetUploadDialog.open();
    },
    /**
     * Closes the Spreadsheet upload dialog.
     */
    onCloseDialog: function _onCloseDialog() {
      this.component.fireRequestCompleted();
      this.resetContent();
      this.spreadsheetUploadDialog.close();
    },
    onDecimalSeparatorChanged: function _onDecimalSeparatorChanged(event) {
      this.component.setDecimalSeparator(event.getParameter("decimalSeparator"));
    },
    onAvailableOptionsChanged: function _onAvailableOptionsChanged(event) {
      const availableOptions = event.getParameter("availableOptions");
      if (availableOptions.length > 0) {
        this.component.setShowOptions(true);
        this.spreadsheetOptionsModel.setProperty("/showOptions", true);
      } else {
        this.component.setShowOptions(false);
        this.spreadsheetOptionsModel.setProperty("/showOptions", true);
      }
      this.component.setAvailableOptions(availableOptions);
    },
    resetContent: function _resetContent() {
      this.spreadsheetUploadDialog.getModel("info").setProperty("/dataRows", 0);
      var fileUploader = this.spreadsheetUploadDialog.getContent()[0].getItems()[1];
      fileUploader.setValue();
    },
    setDataRows: function _setDataRows(length) {
      this.spreadsheetUploadDialog.getModel("info").setProperty("/dataRows", length);
    },
    getDialog: function _getDialog() {
      return this.spreadsheetUploadDialog;
    },
    showPreview: async function _showPreview() {
      this.previewHandler.showPreview(this.spreadsheetUploadController.getPayloadArray(), this.spreadsheetUploadController.typeLabelList, this.component.getPreviewColumns());
    },
    onTempDownload: async function _onTempDownload() {
      // check if custom template is provided, otherwise generate it
      if (this.component.getSpreadsheetTemplateFile() !== "") {
        try {
          const templateFile = this.component.getSpreadsheetTemplateFile();
          let arrayBuffer;
          let fileName;
          if (typeof templateFile === "string") {
            // Check if the string is a HTTP/HTTPS address
            if (templateFile.startsWith("http://") || templateFile.startsWith("https://")) {
              const response = await fetch(templateFile);
              if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
              }
              fileName = templateFile.split("/").pop();
              arrayBuffer = await response.arrayBuffer();
            }
            // Assume the string is a local file path
            else {
              const sPath = sap.ui.require.toUrl(templateFile);
              const response = await fetch(sPath);
              if (!response.ok) {
                throw new Error("Network response was not ok " + response.statusText);
              }
              fileName = templateFile.split("/").pop();
              arrayBuffer = await response.arrayBuffer();
            }
          } else if (templateFile instanceof ArrayBuffer) {
            // If the input is already an ArrayBuffer, use it directly
            arrayBuffer = templateFile;
          } else {
            throw new Error("Unsupported type for templateFile");
          }

          // spreadsheet file name wll overwrite the template file name
          if (this.component.getSpreadsheetFileName() !== "Template.xlsx" || fileName === undefined) {
            fileName = this.component.getSpreadsheetFileName();
          }
          Util.downloadSpreadsheetFile(arrayBuffer, fileName);

          // You can now use arrayBuffer to do whatever you need
        } catch (error) {}
      } else {
        // create spreadsheet column list
        let fieldMatchType = this.component.getFieldMatchType();
        var worksheet = {};
        let colWidths = []; // array to store column widths
        let sampleData = this.component.getSampleData();
        let sampleDataDefined = true;
        // if sampledata is empty add one row of empty data
        if (!sampleData || sampleData.length === 0) {
          sampleDataDefined = false;
          sampleData = [{}];
        }
        const colWidthDefault = 15;
        const colWidthDate = 20;
        let col = 0;
        let rows = 1;
        if (this.component.getStandalone()) {
          // loop over this.component.getColumns
          for (let column of this.component.getColumns()) {
            worksheet[XLSX.utils.encode_cell({
              c: col,
              r: 0
            })] = {
              v: column,
              t: "s"
            };
            col++;
          }
          col = 0;
          for (let column of this.component.getColumns()) {
            for (const [index, data] of sampleData.entries()) {
              let sampleDataValue;
              rows = index + 1;
              if (data[column]) {
                sampleDataValue = data[column];
                worksheet[XLSX.utils.encode_cell({
                  c: col,
                  r: 1
                })] = {
                  v: sampleDataValue,
                  t: "s"
                };
              }
            }
            col++;
          }
        } else {
          for (let [key, value] of this.spreadsheetUploadController.typeLabelList.entries()) {
            let cell = {
              v: "",
              t: "s"
            };
            let label = "";
            if (fieldMatchType === "label") {
              label = value.label;
            }
            if (fieldMatchType === "labelTypeBrackets") {
              label = `${value.label}[${key}]`;
            }
            worksheet[XLSX.utils.encode_cell({
              c: col,
              r: 0
            })] = {
              v: label,
              t: "s"
            };
            for (const [index, data] of sampleData.entries()) {
              let sampleDataValue;
              rows = index + 1;
              if (data[key]) {
                sampleDataValue = data[key];
              }
              if (value.type === "Edm.Boolean") {
                // Set default value for sampleDataValue based on sampleDataDefined flag
                let defaultValue = sampleDataDefined ? "" : "true";
                // Assign sampleDataValue only if sampleDataValue is not undefined
                sampleDataValue = sampleDataValue ? sampleDataValue.toString() : defaultValue;
                cell = {
                  v: sampleDataValue,
                  t: "b"
                };
                colWidths.push({
                  wch: colWidthDefault
                });
              } else if (value.type === "Edm.String") {
                let newStr;
                if (value.maxLength) {
                  newStr = sampleDataValue ? sampleDataValue : "test string".substring(0, value.maxLength);
                } else {
                  newStr = sampleDataValue ? sampleDataValue : "test string";
                }
                // Set default value for sampleDataValue based on sampleDataDefined flag
                let defaultValue = sampleDataDefined ? "" : newStr;
                // Assign sampleDataValue only if sampleDataValue is not undefined
                sampleDataValue = sampleDataValue ? sampleDataValue : defaultValue;
                cell = {
                  v: sampleDataValue,
                  t: "s"
                };
                colWidths.push({
                  wch: colWidthDefault
                });
              } else if (value.type === "Edm.DateTimeOffset" || value.type === "Edm.DateTime") {
                let format;
                const currentLang = await this.getLanguage();
                if (currentLang.startsWith("en")) {
                  format = "mm/dd/yyyy hh:mm AM/PM";
                } else {
                  format = "dd.mm.yyyy hh:mm";
                }

                // Set default value for sampleDataValue based on sampleDataDefined flag
                let defaultValue = sampleDataDefined ? "" : new Date();
                // Assign sampleDataValue only if sampleDataValue is not undefined
                sampleDataValue = sampleDataValue ? sampleDataValue : defaultValue;
                // if sampleDataValue is empty and cellFormat is "d", Excel Generation fails
                let cellFormat = sampleDataValue ? "d" : "s";
                cell = {
                  v: sampleDataValue,
                  t: cellFormat,
                  z: format
                };
                colWidths.push({
                  wch: colWidthDate
                }); // set column width to 20 for this column
              } else if (value.type === "Edm.Date") {
                // Set default value for sampleDataValue based on sampleDataDefined flag
                let defaultValue = sampleDataDefined ? "" : new Date();
                // Assign sampleDataValue only if sampleDataValue is not undefined
                sampleDataValue = sampleDataValue ? sampleDataValue.toString() : defaultValue;
                // if sampleDataValue is empty and cellFormat is "d", Excel Generation fails
                let cellFormat = sampleDataValue ? "d" : "s";
                cell = {
                  v: sampleDataValue,
                  t: cellFormat
                };
                colWidths.push({
                  wch: colWidthDefault
                });
              } else if (value.type === "Edm.TimeOfDay" || value.type === "Edm.Time") {
                // Set default value for sampleDataValue based on sampleDataDefined flag
                let defaultValue = sampleDataDefined ? "" : new Date();
                // Assign sampleDataValue only if sampleDataValue is not undefined
                sampleDataValue = sampleDataValue ? sampleDataValue : defaultValue;
                // if sampleDataValue is empty and cellFormat is "d", Excel Generation fails
                let cellFormat = sampleDataValue ? "d" : "s";
                cell = {
                  v: sampleDataValue,
                  t: cellFormat,
                  z: "hh:mm"
                };
                colWidths.push({
                  wch: colWidthDefault
                });
              } else if (value.type === "Edm.UInt8" || value.type === "Edm.Int16" || value.type === "Edm.Int32" || value.type === "Edm.Integer" || value.type === "Edm.Int64" || value.type === "Edm.Integer64") {
                // Set default value for sampleDataValue based on sampleDataDefined flag
                let defaultValue = sampleDataDefined ? "" : 85;
                // Assign sampleDataValue only if sampleDataValue is not undefined
                sampleDataValue = sampleDataValue ? sampleDataValue : defaultValue;
                cell = {
                  v: sampleDataValue,
                  t: "n"
                };
                colWidths.push({
                  wch: colWidthDefault
                });
              } else if (value.type === "Edm.Double" || value.type === "Edm.Decimal") {
                const decimalSeparator = this.component.getDecimalSeparator();
                // Set default value for sampleDataValue based on sampleDataDefined flag
                let defaultValue = sampleDataDefined ? "" : `123${decimalSeparator}4`;
                // Assign sampleDataValue only if sampleDataValue is not undefined
                sampleDataValue = sampleDataValue ? sampleDataValue.toString() : defaultValue;
                cell = {
                  v: sampleDataValue,
                  t: "n"
                };
                colWidths.push({
                  wch: colWidthDefault
                });
              }
              if (!this.component.getHideSampleData()) {
                worksheet[XLSX.utils.encode_cell({
                  c: col,
                  r: rows
                })] = cell;
              }
            }
            col++;
          }
        }
        worksheet["!ref"] = XLSX.utils.encode_range({
          s: {
            c: 0,
            r: 0
          },
          e: {
            c: col,
            r: sampleData.length
          }
        });
        worksheet["!cols"] = colWidths; // assign the column widths to the worksheet

        // creating the new spreadsheet work book
        const wb = XLSX.utils.book_new();
        // set the file value
        XLSX.utils.book_append_sheet(wb, worksheet, "Tabelle1");
        // download the created spreadsheet file
        XLSX.writeFile(wb, this.component.getSpreadsheetFileName());
        MessageToast.show(this.util.geti18nText("spreadsheetimporter.downloadingTemplate"));
      }
    },
    onOpenOptionsDialog: function _onOpenOptionsDialog() {
      this.optionsHandler.openOptionsDialog();
    },
    /**
     * Read the uploaded workbook from the file.
     * @param {File} file - The uploaded file.
     * @returns {Promise} - Promise object representing the workbook.
     */
    _readWorkbook: async function _readWorkbook(file) {
      return new Promise(async (resolve, reject) => {
        try {
          const data = await this.buffer_RS(file.stream());
          let workbook = XLSX.read(data, {
            cellNF: true,
            cellDates: true,
            cellText: true,
            cellFormula: true
          });
          resolve(workbook);
        } catch (error) {
          Log.error("Error while reading the uploaded workbook", error, "SpreadsheetUpload: _readWorkbook");
          reject(error);
        }
      });
    },
    buffer_RS: async function _buffer_RS(stream) {
      /* collect data */
      const buffers = [];
      const reader = stream.getReader();
      for (;;) {
        const res = await reader.read();
        if (res.value) buffers.push(res.value);
        if (res.done) break;
      }

      /* concat */
      const out = new Uint8Array(buffers.reduce((acc, v) => acc + v.length, 0));
      let off = 0;
      for (const u8 of buffers) {
        out.set(u8, off);
        off += u8.length;
      }
      return out;
    },
    _extractRawValues: function _extractRawValues(data) {
      return data.map(item => {
        const newObj = {};
        for (const key in item) {
          if (item[key].hasOwnProperty("rawValue")) {
            newObj[key] = item[key].rawValue;
          }
        }
        return newObj;
      });
    },
    _extractParsedValues: function _extractParsedValues(data) {
      return data.map(item => {
        const newObj = {};
        for (const key in item) {
          if (item[key].hasOwnProperty("formattedValue")) {
            newObj[key] = item[key].formattedValue;
          }
        }
        return newObj;
      });
    },
    _getSheetName: async function _getSheetName(workbook, sheetOption) {
      let sheetName;
      // Check if sheetOption is a number
      if (typeof sheetOption === "number") {
        if (sheetOption >= 0 && sheetOption < workbook.SheetNames.length) {
          sheetName = workbook.SheetNames[sheetOption];
        } else {
          Log.error("Invalid sheet index, defaulting to first Sheet", "SpreadsheetUpload: _getSheetName");
          sheetName = workbook.SheetNames[0];
        }
      }
      // Check if sheetOption is "XXSelectorXX"
      else if (sheetOption === "XXSelectorXX") {
        if (workbook.SheetNames.length === 1) {
          sheetName = workbook.SheetNames[0];
          Log.debug("Only one sheet in workbook, defaulting to first Sheet", "SpreadsheetUpload: _getSheetName");
        } else {
          // Display a selector dialog and get the selected sheet name
          sheetName = await this._displaySheetSelectorDialog(workbook.SheetNames);
        }
      }
      // Check if sheetOption is a string and exists in workbook.SheetNames
      else if (workbook.SheetNames.includes(sheetOption)) {
        sheetName = sheetOption;
      } else {
        Log.error("Invalid sheet name, defaulting to first Sheet", "SpreadsheetUpload: _getSheetName");
        sheetName = workbook.SheetNames[0];
      }
      return sheetName;
    },
    _displaySheetSelectorDialog: function _displaySheetSelectorDialog(sheetNames) {
      // Display a selector dialog and get the selected sheet name
      // Assuming you have a function called displaySelectorDialog that returns the selected sheet name
      return new Promise((resolve, reject) => {
        const select = new Select();
        sheetNames.forEach(sheetName => {
          select.addItem(new Item({
            key: sheetName,
            text: sheetName
          }));
        });
        const i18n = this.componentI18n.getResourceBundle();
        const dialog = new Dialog({
          title: i18n.getText("spreadsheetimporter.sheetSelectorDialogTitle"),
          type: "Message",
          content: [select],
          beginButton: new Button({
            text: i18n.getText("spreadsheetimporter.ok"),
            press: () => {
              const selectedKey = select.getSelectedKey();
              resolve(selectedKey);
              dialog.close();
            }
          }),
          afterClose: () => dialog.destroy(),
          endButton: new Button({
            text: i18n.getText("close"),
            press: () => {
              reject(new Error(i18n.getText("close")));
              dialog.close();
            }
          })
        });
        dialog.open();
      });
    },
    getLanguage: async function _getLanguage() {
      try {
        // getCore is not available in UI5 version 2.0 and above, prefer this over sap.ui.getCore().getConfiguration().getLanguage()
        const Localization = await Util.loadUI5RessourceAsync("sap/base/i18n/Localization");
        return Localization.getLanguage();
      } catch (error) {
        Log.debug("sap/base/i18n/Localization not found", undefined, "SpreadsheetUpload: checkForODataErrors");
      }
      // fallback for UI5 versions below 2.0
      return sap.ui.getCore().getConfiguration().getLanguage();
    }
  });
  return SpreadsheetUploadDialog;
});
