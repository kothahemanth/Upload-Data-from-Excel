"use strict";sap.ui.define(["sap/ui/base/ManagedObject","./odata/ODataV2","./odata/ODataV4","./Util","./MessageHandler","sap/base/Log","./dialog/SpreadsheetUploadDialog","../enums","sap/ui/VersionInfo"],function(e,t,a,n,o,s,i,r,h){"use strict";function d(e){return e&&e.__esModule&&typeof e.default!=="undefined"?e.default:e}const l=d(t);const p=d(a);const c=d(n);const u=d(o);const g=d(i);const m=r["CustomMessageTypes"];const f=e.extend("cc.spreadsheetimporter.v1_1_1.SpreadsheetUpload",{constructor:function t(a,n){e.prototype.constructor.call(this);this.errorState=false;this.component=a;this.componentI18n=n;if(this.component.getI18nModel()){try{this.componentI18n.enhance(this.component.getI18nModel().getResourceBundle())}catch(e){s.error("Error enhancing i18n model",e,"SpreadsheetUpload: SpreadsheetUpload",()=>this.component.logger.returnObject({error:e}))}}this.util=new c(n.getResourceBundle());this.messageHandler=new u(this);this.spreadsheetUploadDialogHandler=new g(this,a,n,this.messageHandler);this.isOpenUI5=sap.ui.generic?true:false;h.load().catch(function(e){s.error("failed to load global version info",e)}).then(function(e){const t=e.version;const a="UI5 Version Info: "+e.name+" - "+e.version;s.debug("constructor",undefined,"SpreadsheetUpload: SpreadsheetUpload",()=>this.component.logger.returnObject({ui5version:t,isOpenUI5:this.isOpenUI5}))}.bind(this))},initialSetup:async function e(){await this.spreadsheetUploadDialogHandler.createSpreadsheetUploadDialog();if(!this.component.getStandalone()){try{await this.setContext();this.errorState=false}catch(e){this.errorMessage=e;this.errorState=true;s.error("Error setting 'setContext'",e,"SpreadsheetUpload: SpreadsheetUpload",()=>this.component.logger.returnObject({error:e}))}}},setContext:async function e(){this.context=this.component.getContext();if(this.context.base){this.context=this.context.base}this.isODataV4=this._checkIfODataIsV4();this.odataHandler=this.createODataHandler(this);this.view=this.odataHandler.getView(this.context);this.controller=this.view.getController();s.debug("View",undefined,"SpreadsheetUpload: SpreadsheetUpload",()=>this.component.logger.returnObject({view:this.view}));this.view.addDependent(this.spreadsheetUploadDialogHandler.getDialog());this.tableObject=await this.odataHandler.getTableObject(this.component.getTableId(),this.view,this);s.debug("tableObject",undefined,"SpreadsheetUpload: SpreadsheetUpload",()=>this.component.logger.returnObject({tableObject:this.tableObject}));this.component.setTableId(this.tableObject.getId());s.debug("table Id",undefined,"SpreadsheetUpload: SpreadsheetUpload",()=>this.component.logger.returnObject({tableID:this.tableObject.getId()}));this.binding=this.odataHandler.getBinding(this.tableObject);if(!this.binding){throw new Error(this.util.geti18nText("spreadsheetimporter.bindingError"))}this._odataType=await this.odataHandler.getOdataType(this.binding,this.tableObject,this.component.getOdataType());s.debug("odataType",undefined,"SpreadsheetUpload: SpreadsheetUpload",()=>this.component.logger.returnObject({odataType:this._odataType}));this.odataKeyList=await this.odataHandler.getKeyList(this._odataType,this.tableObject);s.debug("odataKeyList",undefined,"SpreadsheetUpload: SpreadsheetUpload",()=>this.component.logger.returnObject({odataKeyList:this.odataKeyList}));this.typeLabelList=await this.odataHandler.getLabelList(this.component.getColumns(),this._odataType,this.component.getExcludeColumns(),this.tableObject);s.debug("typeLabelList",undefined,"SpreadsheetUpload: SpreadsheetUpload",()=>this.component.logger.returnObject({typeLabelList:this.typeLabelList}));this.model=this.tableObject.getModel();s.debug("model",undefined,"SpreadsheetUpload: SpreadsheetUpload",()=>this.component.logger.returnObject({model:this.model}));this.odataHandler.createCustomBinding(this.binding);try{const e=await this._loadDraftController();this.odataHandler.draftController=new e(this.model,undefined)}catch(e){s.error("Error setting the draft controller",e,"SpreadsheetUpload: SpreadsheetUpload")}},createODataHandler:function e(t){if(this.isODataV4){return new p(t)}else{return new l(t)}},openSpreadsheetUploadDialog:async function e(t){if(t){this.setComponentOptions(t);this.initialSetupPromise=this.initialSetup()}else{this.initialSetupPromise=this.initialSetup()}await this.initialSetupPromise;if(!this.errorState){this.spreadsheetUploadDialogHandler.openSpreadsheetUploadDialog()}else{c.showError(this.errorMessage,"SpreadsheetUpload.ts","initialSetup");s.error("Error opening the dialog",undefined,"SpreadsheetUpload: SpreadsheetUpload")}},setComponentOptions:function e(t){if(t.hasOwnProperty("spreadsheetFileName")){this.component.setSpreadsheetFileName(t.spreadsheetFileName)}if(t.hasOwnProperty("context")){this.component.setContext(t.context)}if(t.hasOwnProperty("columns")){this.component.setColumns(t.columns)}if(t.hasOwnProperty("excludeColumns")){this.component.setExcludeColumns(t.excludeColumns)}if(t.hasOwnProperty("tableId")){this.component.setTableId(t.tableId)}if(t.hasOwnProperty("odataType")){this.component.setOdataType(t.odataType)}if(t.hasOwnProperty("mandatoryFields")){this.component.setMandatoryFields(t.mandatoryFields)}if(t.hasOwnProperty("fieldMatchType")){this.component.setFieldMatchType(t.fieldMatchType)}if(t.hasOwnProperty("activateDraft")){this.component.setActivateDraft(t.activateDraft)}if(t.hasOwnProperty("batchSize")){this.component.setBatchSize(t.batchSize)}if(t.hasOwnProperty("standalone")){this.component.setStandalone(t.standalone)}if(t.hasOwnProperty("strict")){this.component.setStrict(t.strict)}if(t.hasOwnProperty("decimalSeparator")){this.component.setDecimalSeparator(t.decimalSeparator)}if(t.hasOwnProperty("hidePreview")){this.component.setHidePreview(t.hidePreview)}if(t.hasOwnProperty("previewColumns")){this.component.setPreviewColumns(t.previewColumns)}if(t.hasOwnProperty("skipMandatoryFieldCheck")){this.component.setSkipMandatoryFieldCheck(t.skipMandatoryFieldCheck)}if(t.hasOwnProperty("skipColumnsCheck")){this.component.setSkipColumnsCheck(t.skipColumnsCheck)}if(t.hasOwnProperty("skipColumnsCheck")){this.component.setSkipColumnsCheck(t.useTableSelector)}if(t.hasOwnProperty("showBackendErrorMessages")){this.component.setShowBackendErrorMessages(t.showBackendErrorMessages)}if(t.hasOwnProperty("showOptions")){this.component.setShowOptions(t.showOptions)}if(t.hasOwnProperty("debug")){this.component.setDebug(t.debug)}if(t.hasOwnProperty("availableOptions")){this.component.setAvailableOptions(t.availableOptions)}if(t.hasOwnProperty("sampleData")){this.component.setSampleData(t.sampleData)}if(t.hasOwnProperty("spreadsheetTemplateFile")){this.component.setSpreadsheetTemplateFile(t.spreadsheetTemplateFile)}if(t.hasOwnProperty("hideSampleData")){this.component.setHideSampleData(t.hideSampleData)}if(t.hasOwnProperty("spreadsheetRowPropertyName")){this.component.setUseTableSelector(t.useTableSelector)}if(t.hasOwnProperty("readAllSheets")){this.component.setReadAllSheets(t.readAllSheets)}if(t.hasOwnProperty("readSheet")){this.component.setReadSheet(t.readSheet)}if(t.hasOwnProperty("continueOnError")){this.component.setContinueOnError(t.continueOnError)}if(t.hasOwnProperty("createActiveEntity")){this.component.setCreateActiveEntity(t.createActiveEntity)}if(t.hasOwnProperty("componentContainerData")){this.component.setComponentContainerData(t.componentContainerData)}if(t.hasOwnProperty("i18nModel")){this.component.setI18nModel(t.i18nModel)}if(t.availableOptions&&t.availableOptions.length>0){this.component.setShowOptions(true)}},_checkIfODataIsV4:function e(){try{let e;if(this.component.getContext().base){e=this.component.getContext().base.getModel()}else{e=this.component.getContext().getModel()}if(e.getODataVersion()==="4.0"){return true}else{return false}}catch(e){return false}},refreshBinding:function e(t,a,n){if(t._controller?.getExtensionAPI()){try{t._controller.getExtensionAPI().refresh(a.getPath())}catch(e){s.error("Failed to refresh binding in V4 FE context: "+e)}}else if(t.extensionAPI){if(t.extensionAPI.refresh){try{t.extensionAPI.refresh(a.getPath(n))}catch(e){s.error("Failed to refresh binding in Object Page V2 FE context: "+e)}}if(t.extensionAPI.refreshTable){try{t.extensionAPI.refreshTable(n)}catch(e){s.error("Failed to refresh binding in List Report V2 FE context: "+e)}}}try{a.refresh(true)}catch(e){s.error("Failed to refresh binding in other contexts: "+e)}},_loadDraftController:async function e(){return new Promise(function(e,t){sap.ui.require(["sap/ui/generic/app/transaction/DraftController"],function(t){e(t)},function(e){t(e)})})},resetContent:function e(){this.payloadArray=[];this.payload=[];this.odataHandler.resetContexts();this.spreadsheetUploadDialogHandler.resetContent()},getMessages:function e(){return this.messageHandler.getMessages()},addToMessages:function e(t){t.forEach(e=>{if(e.group){e.type=m.CustomErrorGroup}else{e.type=m.CustomError}e.counter=1});this.messageHandler.addArrayToMessages(t)},getSpreadsheetUploadDialog:function e(){return this.spreadsheetUploadDialogHandler.getDialog()},getPayloadArray:function e(){return this.payloadArray},getODataHandler:function e(){return this.odataHandler},get isODataV4(){return this._isODataV4},set isODataV4(e){this._isODataV4=e},get tableObject(){return this._tableObject},set tableObject(e){this._tableObject=e},get binding(){return this._binding},set binding(e){this._binding=e},get spreadsheetUploadDialogHandler(){return this._spreadsheetUploadDialogHandler},set spreadsheetUploadDialogHandler(e){this._spreadsheetUploadDialogHandler=e},get controller(){return this._controller},get view(){return this._view},getOdataType:function e(){return this._odataType}});return f});
//# sourceMappingURL=SpreadsheetUpload.js.map