"use strict";

sap.ui.define(["sap/ui/base/ManagedObject", "../dialog/ODataMessageHandler", "sap/base/Log", "../TableSelector", "sap/ui/model/json/JSONModel", "sap/ui/core/Fragment", "../Util"], function (ManagedObject, __ODataMessageHandler, Log, __TableSelector, JSONModel, Fragment, __Util) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const ODataMessageHandler = _interopRequireDefault(__ODataMessageHandler);
  const TableSelector = _interopRequireDefault(__TableSelector);
  const Util = _interopRequireDefault(__Util);
  /**
   * @namespace cc.spreadsheetimporter.v1_1_1
   */
  const OData = ManagedObject.extend("cc.spreadsheetimporter.v1_1_1.OData", {
    constructor: function _constructor(spreadsheetUploadController) {
      ManagedObject.prototype.constructor.call(this);
      this._tables = [];
      this.odataMessageHandler = new ODataMessageHandler(spreadsheetUploadController);
      this.spreadsheetUploadController = spreadsheetUploadController;
    },
    /**
     * Helper method to call OData service.
     * @param {*} fnResolve - The resolve function for the Promise.
     * @param {*} fnReject - The reject function for the Promise.
     */
    callOdata: async function _callOdata(fnResolve, fnReject, spreadsheetUploadController) {
      const component = spreadsheetUploadController.component;
      const tableObject = spreadsheetUploadController.tableObject;
      const payloadArray = spreadsheetUploadController.payloadArray;
      const binding = spreadsheetUploadController.binding;
      const context = spreadsheetUploadController.context;
      spreadsheetUploadController.errorsFound = false;

      // intializing the message manager for displaying the odata response messages
      try {
        // get binding of table to create rows
        const model = tableObject.getModel();
        await this.createBusyDialog(spreadsheetUploadController);

        // Slice the array into chunks of 'batchSize' if necessary
        const slicedPayloadArray = this.processPayloadArray(component.getBatchSize(), payloadArray);
        this.busyDialog.getModel("busyModel").setProperty("/progressText", `0/${payloadArray.length}`);
        let currentProgressPercent = 0;
        let currentProgressValue = 0;

        // Loop over the sliced array
        for (const batch of slicedPayloadArray) {
          // loop over data from spreadsheet file
          try {
            for (let payload of batch) {
              let fireEventAsyncReturn;
              // skip draft and directly create
              if (component.getCreateActiveEntity()) {
                payload.IsActiveEntity = true;
              }
              // Extension method to manipulate payload
              try {
                fireEventAsyncReturn = await Util.fireEventAsync("changeBeforeCreate", {
                  payload: payload
                }, component);
              } catch (error) {
                Log.error("Error while calling the changeBeforeCreate event", error, "SpreadsheetUpload: callOdata");
              }
              if (fireEventAsyncReturn.returnValue) {
                payload = fireEventAsyncReturn.returnValue;
              }
              this.createAsync(model, binding, payload);
            }
            // wait for all drafts to be created
            await this.submitChanges(model);
            let errorsFoundLocal = await this.checkForErrors(model, binding, component.getShowBackendErrorMessages());
            if (errorsFoundLocal) {
              Log.error("Error while calling the odata service", "SpreadsheetUpload: callOdata");
              if (!component.getContinueOnError()) {
                this.busyDialog.close();
                spreadsheetUploadController.errorsFound = true;
                this.resetContexts();
                fnReject("Error while calling the odata service");
                break;
              }
            } else {
              await this.waitForCreation();
            }

            // check for and activate all drafts and wait for all draft to be created
            // only if createActiveEntity is false and IsActiveEntity is not used in the payload
            if (!component.getCreateActiveEntity() && component.getActivateDraft() && !errorsFoundLocal) {
              await this.waitForDraft();
            }
            this.resetContexts();
            currentProgressPercent = currentProgressPercent + batch.length / payloadArray.length * 100;
            currentProgressValue = currentProgressValue + batch.length;
            this.busyDialog.getModel("busyModel").setProperty("/progressPercent", currentProgressPercent);
            this.busyDialog.getModel("busyModel").setProperty("/progressText", `${currentProgressValue} / ${payloadArray.length}`);
          } catch (error) {
            if (component.getContinueOnError()) {
              Log.error("Error while calling the odata service", error, "SpreadsheetUpload: callOdata");
            } else {
              // throw error to stop processing
              throw error;
            }
          }
        }
        spreadsheetUploadController.refreshBinding(context, binding, tableObject.getId());
        this.busyDialog.close();
        fnResolve();
      } catch (error) {
        this.busyDialog.close();
        this.resetContexts();
        Log.error("Error while calling the odata service", error, "SpreadsheetUpload: callOdata");
        await this.checkForODataErrors(component.getShowBackendErrorMessages());
        fnReject(error);
      }
    },
    getBinding: function _getBinding(tableObject) {
      if (tableObject.getMetadata().getName() === "sap.m.Table" || tableObject.getMetadata().getName() === "sap.m.List") {
        return tableObject.getBinding("items");
      }
      if (tableObject.getMetadata().getName() === "sap.ui.table.Table") {
        return tableObject.getBinding("rows");
      }
    },
    _getActionName: function _getActionName(context, sOperation) {
      var model = context.getModel(),
        metaModel = model.getMetaModel(),
        entitySetPath = metaModel.getMetaPath(context.getPath());
      return metaModel.getObject("".concat(entitySetPath, "@com.sap.vocabularies.Common.v1.DraftRoot/").concat(sOperation));
    },
    // Slice the array into chunks of 'batchSize' if necessary
    processPayloadArray: function _processPayloadArray(batchSize, payloadArray) {
      if (batchSize > 0) {
        let slicedPayloadArray = [];
        const numOfSlices = Math.ceil(payloadArray.length / batchSize);
        const equalSize = Math.ceil(payloadArray.length / numOfSlices);
        for (let i = 0; i < payloadArray.length; i += equalSize) {
          slicedPayloadArray.push(payloadArray.slice(i, i + equalSize));
        }
        return slicedPayloadArray;
      } else {
        return [payloadArray];
      }
    },
    getTableObject: async function _getTableObject(tableId, view, spreadsheetUploadController) {
      // try get object page table
      if (!tableId) {
        this.tables = view.findAggregatedObjects(true, function (object) {
          return object.isA("sap.m.Table") || object.isA("sap.ui.table.Table");
        });
        if (this.tables.length > 1 && !spreadsheetUploadController.component.getUseTableSelector()) {
          throw new Error("Found more than one table on Object Page.\n Please specify table in option 'tableId'");
        } else if (this.tables.length > 1 && spreadsheetUploadController.component.getUseTableSelector()) {
          const tableSelector = new TableSelector(view);
          let selectedTable;
          try {
            selectedTable = await tableSelector.chooseTable();
          } catch (error) {
            // user canceled or no table found
            throw new Error(spreadsheetUploadController.util.geti18nText("spreadsheetimporter.tableSelectorDialogCancel"));
          }
          return selectedTable;
        } else if (this.tables.length === 0) {
          throw new Error("Found more than one table on Object Page.\n Please specify table in option 'tableId'");
        } else {
          return this.tables[0];
        }
      } else {
        return view.byId(tableId);
      }
    },
    createBusyDialog: async function _createBusyDialog(spreadsheetUploadController) {
      const busyModel = new JSONModel({
        progressPercent: 0,
        progressText: "0"
      });
      if (!this.busyDialog) {
        this.busyDialog = await Fragment.load({
          name: "cc.spreadsheetimporter.v1_1_1.fragment.BusyDialogProgress",
          controller: this
        });
      }
      this.busyDialog.setModel(busyModel, "busyModel");
      this.busyDialog.setModel(spreadsheetUploadController.component.getModel("device"), "device");
      this.busyDialog.setModel(spreadsheetUploadController.component.getModel("i18n"), "i18n");
      this.busyDialog.open();
    },
    checkForODataErrors: async function _checkForODataErrors(showBackendErrorMessages) {
      if (showBackendErrorMessages) {
        try {
          // sap.ui.core.Messaging is only available in UI5 version 1.118 and above, prefer this over sap.ui.getCore().getMessageManager()saging = Util.loadUI5RessourceAsync("sap/ui/core/Messaging");
          const Messaging = await Util.loadUI5RessourceAsync("sap/ui/core/Messaging");
          const messages = Messaging.getMessageModel().getData();
          if (messages.length > 0) {
            this.odataMessageHandler.displayMessages(messages);
          }
          return;
        } catch (error) {
          Log.debug("sap/ui/core/Messaging not found", undefined, "SpreadsheetUpload: checkForODataErrors");
        }
        // fallback for UI5 versions below 1.118
        const messages = sap.ui.getCore().getMessageManager().getMessageModel().getData();
        if (messages.length > 0) {
          this.odataMessageHandler.displayMessages(messages);
        }
      }
    },
    get tables() {
      return this._tables;
    },
    set tables(value) {
      this._tables = value;
    }
  });
  return OData;
});
