"use strict";

sap.ui.define(["sap/ui/base/ManagedObject", "./odata/ODataV2", "./odata/ODataV4", "./Util", "./MessageHandler", "sap/base/Log", "./dialog/SpreadsheetUploadDialog", "../enums", "sap/ui/VersionInfo"], function (ManagedObject, __ODataV2, __ODataV4, __Util, __MessageHandler, Log, __SpreadsheetUploadDialog, ___enums, VersionInfo) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const ODataV2 = _interopRequireDefault(__ODataV2);
  const ODataV4 = _interopRequireDefault(__ODataV4);
  const Util = _interopRequireDefault(__Util);
  const MessageHandler = _interopRequireDefault(__MessageHandler);
  const SpreadsheetUploadDialog = _interopRequireDefault(__SpreadsheetUploadDialog);
  const CustomMessageTypes = ___enums["CustomMessageTypes"];
  /**
   * @namespace cc.spreadsheetimporter.v1_1_1
   */
  const SpreadsheetUpload = ManagedObject.extend("cc.spreadsheetimporter.v1_1_1.SpreadsheetUpload", {
    /**
     * Initializes SpreadsheetUpload instance.
     * @param {Component} component - The component to be used.
     * @param {ResourceModel} componentI18n - The i18n resource model for the component.
     */
    constructor: function _constructor(component, componentI18n) {
      ManagedObject.prototype.constructor.call(this);
      this.errorState = false;
      // @ts-ignore
      this.component = component;
      this.componentI18n = componentI18n;
      // enhance i18n model with data from the component config, custom i18n model will overwrite the default one but only the texts that are present in the custom i18n model
      //https://github.com/SAP/openui5/blob/85c3fc7d61b0886a1f53babd02100ef6bb96521b/src/sap.ui.core/src/sap/ui/model/resource/ResourceModel.js#L392-L426
      if (this.component.getI18nModel()) {
        try {
          // @ts-ignore
          this.componentI18n.enhance(this.component.getI18nModel().getResourceBundle());
        } catch (error) {
          Log.error("Error enhancing i18n model", error, "SpreadsheetUpload: SpreadsheetUpload", () => this.component.logger.returnObject({
            error: error
          }));
        }
      }
      this.util = new Util(componentI18n.getResourceBundle());
      this.messageHandler = new MessageHandler(this);
      this.spreadsheetUploadDialogHandler = new SpreadsheetUploadDialog(this, component, componentI18n, this.messageHandler);
      // check if "sap.ui.generic" is available, if false it is OpenUI5
      // @ts-ignore
      this.isOpenUI5 = sap.ui.generic ? true : false;
      // load version from UI5 2.0
      VersionInfo.load().catch(function (err) {
        Log.error("failed to load global version info", err);
      }).then(function (versionInfo) {
        const version = versionInfo.version;
        const text = "UI5 Version Info: " + versionInfo.name + " - " + versionInfo.version;
        Log.debug("constructor", undefined, "SpreadsheetUpload: SpreadsheetUpload", () => this.component.logger.returnObject({
          ui5version: version,
          isOpenUI5: this.isOpenUI5
        }));
      }.bind(this));
    },
    /**
     * Executes initial setup.
     * @returns {Promise<void>} A promise that resolves when the initial setup is complete.
     */
    initialSetup: async function _initialSetup() {
      await this.spreadsheetUploadDialogHandler.createSpreadsheetUploadDialog();
      if (!this.component.getStandalone()) {
        try {
          await this.setContext();
          this.errorState = false;
        } catch (error) {
          this.errorMessage = error;
          this.errorState = true;
          Log.error("Error setting 'setContext'", error, "SpreadsheetUpload: SpreadsheetUpload", () => this.component.logger.returnObject({
            error: error
          }));
        }
      }
    },
    /**
     * Sets context for the instance.
     */
    setContext: async function _setContext() {
      this.context = this.component.getContext();
      if (this.context.base) {
        this.context = this.context.base;
      }
      this.isODataV4 = this._checkIfODataIsV4();
      this.odataHandler = this.createODataHandler(this);
      this.view = this.odataHandler.getView(this.context);
      this.controller = this.view.getController();
      Log.debug("View", undefined, "SpreadsheetUpload: SpreadsheetUpload", () => this.component.logger.returnObject({
        view: this.view
      }));
      this.view.addDependent(this.spreadsheetUploadDialogHandler.getDialog());
      this.tableObject = await this.odataHandler.getTableObject(this.component.getTableId(), this.view, this);
      Log.debug("tableObject", undefined, "SpreadsheetUpload: SpreadsheetUpload", () => this.component.logger.returnObject({
        tableObject: this.tableObject
      }));
      this.component.setTableId(this.tableObject.getId());
      Log.debug("table Id", undefined, "SpreadsheetUpload: SpreadsheetUpload", () => this.component.logger.returnObject({
        tableID: this.tableObject.getId()
      }));
      this.binding = this.odataHandler.getBinding(this.tableObject);
      if (!this.binding) {
        throw new Error(this.util.geti18nText("spreadsheetimporter.bindingError"));
      }
      this._odataType = await this.odataHandler.getOdataType(this.binding, this.tableObject, this.component.getOdataType());
      Log.debug("odataType", undefined, "SpreadsheetUpload: SpreadsheetUpload", () => this.component.logger.returnObject({
        odataType: this._odataType
      }));
      this.odataKeyList = await this.odataHandler.getKeyList(this._odataType, this.tableObject);
      Log.debug("odataKeyList", undefined, "SpreadsheetUpload: SpreadsheetUpload", () => this.component.logger.returnObject({
        odataKeyList: this.odataKeyList
      }));
      this.typeLabelList = await this.odataHandler.getLabelList(this.component.getColumns(), this._odataType, this.component.getExcludeColumns(), this.tableObject);
      Log.debug("typeLabelList", undefined, "SpreadsheetUpload: SpreadsheetUpload", () => this.component.logger.returnObject({
        typeLabelList: this.typeLabelList
      }));
      this.model = this.tableObject.getModel();
      Log.debug("model", undefined, "SpreadsheetUpload: SpreadsheetUpload", () => this.component.logger.returnObject({
        model: this.model
      }));
      this.odataHandler.createCustomBinding(this.binding);
      try {
        // Load the DraftController asynchronously using the loadDraftController function
        // @ts-ignore
        const DraftController = await this._loadDraftController();
        // Create an instance of the DraftController
        this.odataHandler.draftController = new DraftController(this.model, undefined);
      } catch (error) {
        Log.error("Error setting the draft controller", error, "SpreadsheetUpload: SpreadsheetUpload");
      }
    },
    /**
     * Retrieves OData handler based on UI5 version.
     * @param {number} version - UI5 version number.
     * @returns {OData} OData handler instance.
     */
    createODataHandler: function _createODataHandler(spreadsheetUploadController) {
      if (this.isODataV4) {
        return new ODataV4(spreadsheetUploadController);
      } else {
        return new ODataV2(spreadsheetUploadController);
      }
    },
    /**
     * Opens the Spreadsheet upload dialog.
     * @param {object} options - all component options.
     */
    openSpreadsheetUploadDialog: async function _openSpreadsheetUploadDialog(options) {
      if (options) {
        // set options to component
        this.setComponentOptions(options);
        this.initialSetupPromise = this.initialSetup();
      } else {
        this.initialSetupPromise = this.initialSetup();
      }
      await this.initialSetupPromise;
      if (!this.errorState) {
        // ((this.spreadsheetUploadDialogHandler.getDialog().getContent()[0] as FlexBox).getItems()[1] as FileUploader).clear();
        this.spreadsheetUploadDialogHandler.openSpreadsheetUploadDialog();
      } else {
        Util.showError(this.errorMessage, "SpreadsheetUpload.ts", "initialSetup");
        Log.error("Error opening the dialog", undefined, "SpreadsheetUpload: SpreadsheetUpload");
      }
    },
    setComponentOptions: function _setComponentOptions(options) {
      if (options.hasOwnProperty("spreadsheetFileName")) {
        this.component.setSpreadsheetFileName(options.spreadsheetFileName);
      }
      if (options.hasOwnProperty("context")) {
        this.component.setContext(options.context);
      }
      if (options.hasOwnProperty("columns")) {
        this.component.setColumns(options.columns);
      }
      if (options.hasOwnProperty("excludeColumns")) {
        this.component.setExcludeColumns(options.excludeColumns);
      }
      if (options.hasOwnProperty("tableId")) {
        this.component.setTableId(options.tableId);
      }
      if (options.hasOwnProperty("odataType")) {
        this.component.setOdataType(options.odataType);
      }
      if (options.hasOwnProperty("mandatoryFields")) {
        this.component.setMandatoryFields(options.mandatoryFields);
      }
      if (options.hasOwnProperty("fieldMatchType")) {
        this.component.setFieldMatchType(options.fieldMatchType);
      }
      if (options.hasOwnProperty("activateDraft")) {
        this.component.setActivateDraft(options.activateDraft);
      }
      if (options.hasOwnProperty("batchSize")) {
        this.component.setBatchSize(options.batchSize);
      }
      if (options.hasOwnProperty("standalone")) {
        this.component.setStandalone(options.standalone);
      }
      if (options.hasOwnProperty("strict")) {
        this.component.setStrict(options.strict);
      }
      if (options.hasOwnProperty("decimalSeparator")) {
        this.component.setDecimalSeparator(options.decimalSeparator);
      }
      if (options.hasOwnProperty("hidePreview")) {
        this.component.setHidePreview(options.hidePreview);
      }
      if (options.hasOwnProperty("previewColumns")) {
        this.component.setPreviewColumns(options.previewColumns);
      }
      if (options.hasOwnProperty("skipMandatoryFieldCheck")) {
        this.component.setSkipMandatoryFieldCheck(options.skipMandatoryFieldCheck);
      }
      if (options.hasOwnProperty("skipColumnsCheck")) {
        this.component.setSkipColumnsCheck(options.skipColumnsCheck);
      }
      if (options.hasOwnProperty("skipColumnsCheck")) {
        this.component.setSkipColumnsCheck(options.useTableSelector);
      }
      if (options.hasOwnProperty("showBackendErrorMessages")) {
        this.component.setShowBackendErrorMessages(options.showBackendErrorMessages);
      }
      if (options.hasOwnProperty("showOptions")) {
        this.component.setShowOptions(options.showOptions);
      }
      if (options.hasOwnProperty("debug")) {
        this.component.setDebug(options.debug);
      }
      if (options.hasOwnProperty("availableOptions")) {
        this.component.setAvailableOptions(options.availableOptions);
      }
      if (options.hasOwnProperty("sampleData")) {
        this.component.setSampleData(options.sampleData);
      }
      if (options.hasOwnProperty("spreadsheetTemplateFile")) {
        this.component.setSpreadsheetTemplateFile(options.spreadsheetTemplateFile);
      }
      if (options.hasOwnProperty("hideSampleData")) {
        this.component.setHideSampleData(options.hideSampleData);
      }
      if (options.hasOwnProperty("spreadsheetRowPropertyName")) {
        this.component.setUseTableSelector(options.useTableSelector);
      }
      if (options.hasOwnProperty("readAllSheets")) {
        this.component.setReadAllSheets(options.readAllSheets);
      }
      if (options.hasOwnProperty("readSheet")) {
        this.component.setReadSheet(options.readSheet);
      }
      if (options.hasOwnProperty("continueOnError")) {
        this.component.setContinueOnError(options.continueOnError);
      }
      if (options.hasOwnProperty("createActiveEntity")) {
        this.component.setCreateActiveEntity(options.createActiveEntity);
      }
      if (options.hasOwnProperty("componentContainerData")) {
        this.component.setComponentContainerData(options.componentContainerData);
      }
      if (options.hasOwnProperty("i18nModel")) {
        this.component.setI18nModel(options.i18nModel);
      }

      // Special case for showOptions
      if (options.availableOptions && options.availableOptions.length > 0) {
        this.component.setShowOptions(true);
      }
    },
    _checkIfODataIsV4: function _checkIfODataIsV() {
      try {
        let model;
        // @ts-ignore
        if (this.component.getContext().base) {
          // @ts-ignore
          model = this.component.getContext().base.getModel();
        } else {
          // @ts-ignore
          model = this.component.getContext().getModel();
        }
        if (model.getODataVersion() === "4.0") {
          return true;
        } else {
          return false;
        }
      } catch (error) {
        return false;
      }
    },
    refreshBinding: function _refreshBinding(context, binding, id) {
      if (context._controller?.getExtensionAPI()) {
        // refresh binding in V4 FE context
        try {
          context._controller.getExtensionAPI().refresh(binding.getPath());
        } catch (error) {
          Log.error("Failed to refresh binding in V4 FE context: " + error);
        }
      } else if (context.extensionAPI) {
        // refresh binding in V2 FE context
        if (context.extensionAPI.refresh) {
          try {
            context.extensionAPI.refresh(binding.getPath(id));
          } catch (error) {
            Log.error("Failed to refresh binding in Object Page V2 FE context: " + error);
          }
        }
        if (context.extensionAPI.refreshTable) {
          try {
            context.extensionAPI.refreshTable(id);
          } catch (error) {
            Log.error("Failed to refresh binding in List Report V2 FE context: " + error);
          }
        }
      }
      // try refresh binding either way
      try {
        binding.refresh(true);
      } catch (error) {
        Log.error("Failed to refresh binding in other contexts: " + error);
      }
    },
    /**
     * Dynamically loads the `sap.ui.generic.app.transaction.DraftController` module.
     * @returns {Promise<sap.ui.generic.app.transaction.DraftController>} A Promise that resolves to an instance of the `DraftController` class.
     * @throws {Error} If the `DraftController` module cannot be loaded.
     */
    _loadDraftController: async function _loadDraftController() {
      return new Promise(function (resolve, reject) {
        sap.ui.require(["sap/ui/generic/app/transaction/DraftController"], function (DraftController) {
          resolve(DraftController);
        }, function (err) {
          reject(err);
        });
      });
    },
    resetContent: function _resetContent() {
      this.payloadArray = [];
      this.payload = [];
      this.odataHandler.resetContexts();
      this.spreadsheetUploadDialogHandler.resetContent();
    },
    /**
     * Returns messages from the MessageHandler.
     * @returns {Messages[]} - An array of messages.
     */
    getMessages: function _getMessages() {
      return this.messageHandler.getMessages();
    },
    /**
     * Adds messages to the MessageHandler's messages.
     * @param {Messages[]} messagesArray - An array of messages to add.
     */
    addToMessages: function _addToMessages(messagesArray) {
      messagesArray.forEach(message => {
        if (message.group) {
          message.type = CustomMessageTypes.CustomErrorGroup;
        } else {
          message.type = CustomMessageTypes.CustomError;
        }
        message.counter = 1;
      });
      this.messageHandler.addArrayToMessages(messagesArray);
    },
    getSpreadsheetUploadDialog: function _getSpreadsheetUploadDialog() {
      return this.spreadsheetUploadDialogHandler.getDialog();
    },
    getPayloadArray: function _getPayloadArray() {
      return this.payloadArray;
    },
    getODataHandler: function _getODataHandler() {
      return this.odataHandler;
    },
    get isODataV4() {
      return this._isODataV4;
    },
    set isODataV4(value) {
      this._isODataV4 = value;
    },
    get tableObject() {
      return this._tableObject;
    },
    set tableObject(value) {
      this._tableObject = value;
    },
    get binding() {
      return this._binding;
    },
    set binding(value) {
      this._binding = value;
    },
    get spreadsheetUploadDialogHandler() {
      return this._spreadsheetUploadDialogHandler;
    },
    set spreadsheetUploadDialogHandler(value) {
      this._spreadsheetUploadDialogHandler = value;
    },
    get controller() {
      return this._controller;
    },
    get view() {
      return this._view;
    },
    getOdataType: function _getOdataType() {
      return this._odataType;
    }
  });
  return SpreadsheetUpload;
});
