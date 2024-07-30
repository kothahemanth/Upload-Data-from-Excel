/// <reference path="MetadataHandler.d.ts" />
declare module "cc/spreadsheetimporter/v1_1_1/controller/odata/MetadataHandlerV2" {
    import { Columns, ListObject } from "cc/spreadsheetimporter/v1_1_1/types";
    import MetadataHandler from "cc/spreadsheetimporter/v1_1_1/controller/odata/MetadataHandler";
    /**
     * @namespace cc.spreadsheetimporter.v1_1_1
     */
    export default class MetadataHandlerV2 extends MetadataHandler {
        constructor(spreadsheetUploadController: any);
        getLabelList(columns: Columns, odataType: string, odataEntityType: any, excludeColumns: Columns): ListObject;
        private getLabel;
        /**
         * Creates a list of properties that are defined mandatory in the OData metadata V2
         * @param odataType
         **/
        getKeyList(odataEntityType: any): string[];
    }
}
//# sourceMappingURL=MetadataHandlerV2.d.ts.map