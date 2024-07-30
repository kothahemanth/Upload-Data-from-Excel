/// <reference path="../Component.d.ts" />
/// <reference path="../Component.gen.d.ts" />
/// <reference path="MessageHandler.d.ts" />
/// <reference path="Util.d.ts" />
declare module "cc/spreadsheetimporter/v1_1_1/controller/Parser" {
    import ManagedObject from "sap/ui/base/ManagedObject";
    import Component from "cc/spreadsheetimporter/v1_1_1/Component";
    import { ArrayData, ListObject, Property, ValueData } from "cc/spreadsheetimporter/v1_1_1/types";
    import MessageHandler from "cc/spreadsheetimporter/v1_1_1/controller/MessageHandler";
    import Util from "cc/spreadsheetimporter/v1_1_1/controller/Util";
    /**
     * @namespace cc.spreadsheetimporter.v1_1_1
     */
    export default class Parser extends ManagedObject {
        static parseSpreadsheetData(sheetData: ArrayData, typeLabelList: ListObject, component: Component, messageHandler: MessageHandler, util: Util, isODataV4: Boolean): PayloadArray;
        static checkDate(value: any, metadataColumn: Property, util: Util, messageHandler: MessageHandler, index: number): boolean;
        static checkDouble(value: ValueData, metadataColumn: Property, util: Util, messageHandler: MessageHandler, index: number, component: Component): any;
        static checkInteger(value: ValueData, metadataColumn: Property, util: Util, messageHandler: MessageHandler, index: number, component: Component): any;
        static addMessageToMessages(text: string, util: Util, messageHandler: MessageHandler, index: number, array?: any, rawValue?: any, formattedValue?: any): void;
        /**
         * Parses a time string according to specific patterns and returns the local time as a string.
         * This method handles raw time strings and validates them against the expected format.
         * The method supports time strings in the format "HH:mm:ss" and "HH:mm:ss.sss", where:
         * - HH represents hours (00 to 23),
         * - mm represents minutes (00 to 59),
         * - ss represents seconds (00 to 59),
         * - sss represents milliseconds (000 to 999).
         *
         * If the time string is valid and the components are within their respective ranges,
         * it constructs a Date object and formats the time to respect the local timezone.
         * If the time string does not match the expected pattern or components are out of range,
         * it logs an appropriate error message.
         *
         * @param {string} rawValue - The raw time string to be parsed.
         * @param {Util} util - Utility class instance for accessing helper functions like i18n.
         * @param {MessageHandler} messageHandler - MessageHandler class instance for logging errors.
         * @param {number} index - The row index of the data being parsed, used for error reporting.
         * @param {Property} metadataColumn - The metadata for the column, including the type label.
         * @returns {string|null} - Returns a formatted time string if successful, otherwise null.
         */
        static parseTimePattern(rawValue: any, util: Util, messageHandler: MessageHandler, index: number, metadataColumn: Property): string;
    }
}
//# sourceMappingURL=Parser.d.ts.map