/// <reference path="../enums.d.ts" />
/// <reference path="../Component.d.ts" />
/// <reference path="../Component.gen.d.ts" />
declare module "cc/spreadsheetimporter/v1_1_1/controller/Util" {
    import ManagedObject from "sap/ui/base/ManagedObject";
    import ResourceBundle from "sap/base/i18n/ResourceBundle";
    import { FireEventReturnType, RowData, ValueData } from "cc/spreadsheetimporter/v1_1_1/types";
    import Component from "cc/spreadsheetimporter/v1_1_1/Component";
    import { FieldMatchType } from "cc/spreadsheetimporter/v1_1_1/enums";
    /**
     * @namespace cc.spreadsheetimporter.v1_1_1
     */
    export default class Util extends ManagedObject {
        private resourceBundle;
        constructor(resourceBundle: ResourceBundle);
        static getValueFromRow(row: RowData, label: string, type: string, fieldMatchType: FieldMatchType): ValueData;
        geti18nText(text: string, array?: any): string;
        static changeDecimalSeperator(value: string): number;
        static sleep(ms: number): Promise<unknown>;
        static showError(error: any, className: string, methodName: string): void;
        static showErrorMessage(errorMessage: string, className: string, methodName: string): void;
        static getBrowserDecimalAndThousandSeparators(componentDecimalSeparator: string): {
            thousandSeparator: string;
            decimalSeparator: string;
        };
        static normalizeNumberString(numberString: string, component: Component): string;
        static getRandomString(length: number): string;
        static stringify(obj: any): string;
        static extractObjects(objects: any[]): Record<string, any>[];
        static downloadSpreadsheetFile(arrayBuffer: ArrayBuffer, fileName: string): void;
        static loadUI5RessourceAsync(libraryName: string): Promise<any>;
        /**
         * Asynchronously fires an event with the given name and parameters on the specified component.
         * With this method, async methods can be attached and also sync methods
         * instead of the standard generated fireEvent methods, we call the methods directly
         * using promises to wait for the event handlers to complete
         *
         * @param eventName - The name of the event to be fired.
         * @param eventParameters - The parameters to be passed to the event handlers.
         * @param component - The component on which the event is fired.
         * @returns A promise that resolves when all event handlers have completed.
         */
        static fireEventAsync(eventName: string, eventParameters: object, component: Component): Promise<FireEventReturnType>;
    }
}
//# sourceMappingURL=Util.d.ts.map