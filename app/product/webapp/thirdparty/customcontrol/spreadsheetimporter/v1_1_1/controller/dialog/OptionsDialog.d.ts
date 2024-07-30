/// <reference path="../SpreadsheetUpload.d.ts" />
declare module "cc/spreadsheetimporter/v1_1_1/controller/dialog/OptionsDialog" {
    import ManagedObject from "sap/ui/base/ManagedObject";
    import Dialog from "sap/m/Dialog";
    import SpreadsheetUpload from "cc/spreadsheetimporter/v1_1_1/controller/SpreadsheetUpload";
    /**
     * @namespace cc.spreadsheetimporter.v1_1_1
     */
    export default class OptionsDialog extends ManagedObject {
        spreadsheetUploadController: SpreadsheetUpload;
        optionsDialog: Dialog;
        availableOptions: string[];
        constructor(spreadsheetUploadController: any);
        openOptionsDialog(): Promise<void>;
        onSave(): void;
        onCancel(): void;
    }
}
//# sourceMappingURL=OptionsDialog.d.ts.map