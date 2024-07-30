/// <reference path="Util.d.ts" />
declare module "cc/spreadsheetimporter/v1_1_1/controller/Preview" {
    import ManagedObject from "sap/ui/base/ManagedObject";
    import Dialog from "sap/m/Dialog";
    import Util from "cc/spreadsheetimporter/v1_1_1/controller/Util";
    import { ListObject } from "cc/spreadsheetimporter/v1_1_1/types";
    /**
     * @namespace cc.spreadsheetimporter.v1_1_1
     */
    export default class Preview extends ManagedObject {
        dialog: Dialog;
        util: Util;
        constructor(util: Util);
        showPreview(payload: any, typeLabelList: ListObject, previewColumns: string[]): void;
        createDynamicTable(data: any[], typeLabelList: ListObject, previewColumns: string[]): any;
    }
}
//# sourceMappingURL=Preview.d.ts.map