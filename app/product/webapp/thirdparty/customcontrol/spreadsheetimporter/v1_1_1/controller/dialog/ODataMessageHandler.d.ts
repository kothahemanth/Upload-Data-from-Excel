/// <reference path="../SpreadsheetUpload.d.ts" />
declare module "cc/spreadsheetimporter/v1_1_1/controller/dialog/ODataMessageHandler" {
    import ManagedObject from "sap/ui/base/ManagedObject";
    import SpreadsheetUpload from "cc/spreadsheetimporter/v1_1_1/controller/SpreadsheetUpload";
    /**
     * @namespace cc.spreadsheetimporter.v1_1_1
     */
    export default class ODataMessageHandler extends ManagedObject {
        private messages;
        private spreadsheetUploadController;
        private messageDialog;
        constructor(spreadsheetUploadController: SpreadsheetUpload);
        /**
         * Display messages.
         */
        displayMessages(messageData: any): Promise<void>;
        private onCloseMessageDialog;
    }
}
//# sourceMappingURL=ODataMessageHandler.d.ts.map