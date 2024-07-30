/// <reference path="../SpreadsheetUpload.d.ts" />
declare module "cc/spreadsheetimporter/v1_1_1/controller/odata/MetadataHandler" {
    import ManagedObject from "sap/ui/base/ManagedObject";
    import { Columns, ListObject } from "cc/spreadsheetimporter/v1_1_1/types";
    import SpreadsheetUpload from "cc/spreadsheetimporter/v1_1_1/controller/SpreadsheetUpload";
    /**
     * @namespace cc.spreadsheetimporter.v1_1_1
     */
    export default abstract class MetadataHandler extends ManagedObject {
        spreadsheetUploadController: SpreadsheetUpload;
        constructor(spreadsheetUploadController: any);
        parseI18nText(i18nMetadataText: string, view: any): string;
        abstract getLabelList(columns: Columns, odataType: string, odataEntityType: any, excludeColumns: Columns): ListObject;
        abstract getKeyList(odataEntityType: any): string[];
    }
}
//# sourceMappingURL=MetadataHandler.d.ts.map