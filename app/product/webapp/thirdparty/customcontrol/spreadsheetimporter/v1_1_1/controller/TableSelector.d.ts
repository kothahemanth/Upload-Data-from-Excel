declare module "cc/spreadsheetimporter/v1_1_1/controller/TableSelector" {
    import ManagedObject from "sap/ui/base/ManagedObject";
    /**
     * @namespace cc.spreadsheetimporter.v1_1_1
     */
    export default class TableSelector extends ManagedObject {
        private _tables;
        private _i18nModel;
        constructor(view: any);
        getTables(): any[];
        chooseTable(): Promise<any>;
        private _getTableObject;
        get tables(): any[];
        set tables(value: any[]);
    }
}
//# sourceMappingURL=TableSelector.d.ts.map