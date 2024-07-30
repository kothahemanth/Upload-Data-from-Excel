/// <reference path="../SpreadsheetUpload.d.ts" />
/// <reference path="../../control/SpreadsheetDialog.d.ts" />
/// <reference path="../../control/SpreadsheetDialog.gen.d.ts" />
/// <reference path="../../Component.d.ts" />
/// <reference path="../../Component.gen.d.ts" />
/// <reference path="../Preview.d.ts" />
/// <reference path="../Util.d.ts" />
/// <reference path="OptionsDialog.d.ts" />
/// <reference path="../MessageHandler.d.ts" />
declare module "cc/spreadsheetimporter/v1_1_1/controller/dialog/SpreadsheetUploadDialog" {
    import ManagedObject from "sap/ui/base/ManagedObject";
    import SpreadsheetUpload from "cc/spreadsheetimporter/v1_1_1/controller/SpreadsheetUpload";
    import SpreadsheetDialog, { SpreadsheetDialog$AvailableOptionsChangedEvent, SpreadsheetDialog$DecimalSeparatorChangedEvent, SpreadsheetDialog$FileDropEvent } from "cc/spreadsheetimporter/v1_1_1/control/SpreadsheetDialog";
    import ResourceModel from "sap/ui/model/resource/ResourceModel";
    import Component from "cc/spreadsheetimporter/v1_1_1/Component";
    import Event from "sap/ui/base/Event";
    import { FileUploader$ChangeEvent } from "sap/ui/unified/FileUploader";
    import Preview from "cc/spreadsheetimporter/v1_1_1/controller/Preview";
    import Util from "cc/spreadsheetimporter/v1_1_1/controller/Util";
    import * as XLSX from "xlsx";
    import OptionsDialog from "cc/spreadsheetimporter/v1_1_1/controller/dialog/OptionsDialog";
    import MessageHandler from "cc/spreadsheetimporter/v1_1_1/controller/MessageHandler";
    import JSONModel from "sap/ui/model/json/JSONModel";
    type InputType = {
        [key: string]: {
            rawValue: any;
            [additionalKeys: string]: any;
        };
    };
    /**
     * @namespace cc.spreadsheetimporter.v1_1_1
     */
    export default class SpreadsheetUploadDialog extends ManagedObject {
        spreadsheetUploadController: SpreadsheetUpload;
        spreadsheetUploadDialog: SpreadsheetDialog;
        component: Component;
        previewHandler: Preview;
        util: Util;
        componentI18n: ResourceModel;
        optionsHandler: OptionsDialog;
        messageHandler: MessageHandler;
        spreadsheetOptionsModel: JSONModel;
        constructor(spreadsheetUploadController: SpreadsheetUpload, component: Component, componentI18n: ResourceModel, messageHandler: MessageHandler);
        createSpreadsheetUploadDialog(): Promise<void>;
        onFileDrop(event: SpreadsheetDialog$FileDropEvent): void;
        /**
         * Handles file upload event.
         * @param {Event} event - The file upload event
         */
        onFileUpload(event: FileUploader$ChangeEvent): Promise<void>;
        handleFile(file: Blob): Promise<void>;
        /**
         * Sending extracted data to backend
         * @param {*} event
         */
        onUploadSet(event: Event): Promise<void>;
        openSpreadsheetUploadDialog(): void;
        /**
         * Closes the Spreadsheet upload dialog.
         */
        onCloseDialog(): void;
        onDecimalSeparatorChanged(event: SpreadsheetDialog$DecimalSeparatorChangedEvent): void;
        onAvailableOptionsChanged(event: SpreadsheetDialog$AvailableOptionsChangedEvent): void;
        resetContent(): void;
        setDataRows(length: number): void;
        getDialog(): SpreadsheetDialog;
        showPreview(): Promise<void>;
        onTempDownload(): Promise<void>;
        onOpenOptionsDialog(): void;
        /**
         * Read the uploaded workbook from the file.
         * @param {File} file - The uploaded file.
         * @returns {Promise} - Promise object representing the workbook.
         */
        _readWorkbook(file: Blob): Promise<unknown>;
        buffer_RS(stream: ReadableStream): Promise<Uint8Array>;
        _extractRawValues(data: InputType[]): any[];
        _extractParsedValues(data: InputType[]): any[];
        _getSheetName(workbook: XLSX.WorkBook, sheetOption: string): Promise<string>;
        _displaySheetSelectorDialog(sheetNames: string[]): Promise<string>;
        private getLanguage;
    }
}
//# sourceMappingURL=SpreadsheetUploadDialog.d.ts.map