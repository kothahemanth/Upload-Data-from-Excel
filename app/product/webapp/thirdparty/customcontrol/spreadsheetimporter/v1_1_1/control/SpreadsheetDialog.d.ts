/// <reference path="SpreadsheetDialogRenderer.d.ts" />
declare module "cc/spreadsheetimporter/v1_1_1/control/SpreadsheetDialog" {
    import Dialog from "sap/m/Dialog";
    import type { MetadataOptions } from "sap/ui/core/Element";
    import SpreadsheetDialogRenderer from "cc/spreadsheetimporter/v1_1_1/control/SpreadsheetDialogRenderer";
    /**
     * Constructor for a new <code>cc.spreadsheetimporter.v1_1_1.SpreadsheetDialog</code> control.
     *
     * Some class description goes here.
     * @extends Dialog
     *
     * @constructor
     * @public
     * @name cc.spreadsheetimporter.v1_1_1.SpreadsheetDialog
     */
    export default class SpreadsheetDialog extends Dialog {
        dropMessageShown: boolean;
        constructor(id?: string | $SpreadsheetDialogSettings);
        constructor(id?: string, settings?: $SpreadsheetDialogSettings);
        static readonly metadata: MetadataOptions;
        onAfterRendering(event: any): void;
        private handleDragOver;
        private handleDragLeave;
        private handleFileDrop;
        private handleDragEnter;
        private showDropMessage;
        exit(): void;
        static renderer: typeof SpreadsheetDialogRenderer;
    }
}
//# sourceMappingURL=SpreadsheetDialog.d.ts.map