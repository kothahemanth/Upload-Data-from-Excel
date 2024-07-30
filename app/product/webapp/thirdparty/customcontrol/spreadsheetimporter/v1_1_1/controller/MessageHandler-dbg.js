"use strict";

sap.ui.define(["sap/ui/base/ManagedObject", "./Util", "sap/ui/core/Fragment", "sap/ui/model/json/JSONModel", "sap/ui/core/library", "sap/base/Log", "../enums", "cc/spreadsheetimporter/v1_1_1/thirdparty/xlsx"], function (ManagedObject, __Util, Fragment, JSONModel, sap_ui_core_library, Log, ___enums, XLSX) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const Util = _interopRequireDefault(__Util);
  const MessageType = sap_ui_core_library["MessageType"];
  const CustomMessageTypes = ___enums["CustomMessageTypes"];
  /**
   * @namespace cc.spreadsheetimporter.v1_1_1
   */
  const MessageHandler = ManagedObject.extend("cc.spreadsheetimporter.v1_1_1.MessageHandler", {
    constructor: function _constructor(spreadsheetUploadController) {
      ManagedObject.prototype.constructor.call(this);
      this.messages = [];
      this.messages = [];
      this.spreadsheetUploadController = spreadsheetUploadController;
    },
    setMessages: function _setMessages(messages) {
      this.messages = messages;
    },
    addArrayToMessages: function _addArrayToMessages(messages) {
      Log.debug("addArrayToMessages", undefined, "SpreadsheetUpload: MessageHandler", () => this.spreadsheetUploadController.component.logger.returnObject(messages));
      this.messages = this.messages.concat(messages);
    },
    addMessageToMessages: function _addMessageToMessages(message) {
      Log.debug("addMessageToMessages", undefined, "SpreadsheetUpload: MessageHandler", () => this.spreadsheetUploadController.component.logger.returnObject(message));
      this.messages.push(message);
    },
    getMessages: function _getMessages() {
      return this.messages;
    },
    checkDuplicateColumns: function _checkDuplicateColumns(columnNames) {
      const duplicateColumns = columnNames.filter((columnName, index) => columnNames.indexOf(columnName) !== index);
      if (duplicateColumns.length > 0) {
        const errorMessage = {
          title: this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.duplicateColumns", [duplicateColumns.join(", ")]),
          type: CustomMessageTypes.DuplicateColumns,
          ui5type: MessageType.Error,
          group: false
        };
        this.addMessageToMessages(errorMessage);
      }
    },
    checkMandatoryColumns: function _checkMandatoryColumns(data, columnNames, mandatoryFieldsUser, mandatoryFieldsMetadata, typeLabelList) {
      // concat mandatory fields arrays and remove duplicates
      const mandatoryFields = [...new Set([...mandatoryFieldsUser, ...mandatoryFieldsMetadata])];
      // check if column is in the data list
      //const availableKeyColumns = this.checkKeyColumns(columnNames, mandatoryFields, typeLabelList);
      // check if data is filled in for available columns
      this.checkMandatoryFields(data, mandatoryFields, typeLabelList);
    },
    checkMandatoryFields: function _checkMandatoryFields(data, mandatoryFields, typeLabelList) {
      if (!mandatoryFields) {
        return;
      }
      for (const mandatoryField of mandatoryFields) {
        const fieldLabel = typeLabelList.get(mandatoryField)?.label;
        if (!fieldLabel) {
          Log.error(`Mandatory Field ${mandatoryField} not found for checking mandatory fields`, undefined, "SpreadsheetUpload: MessageHandler");
          continue;
        }
        for (const [index, row] of data.entries()) {
          const value = Util.getValueFromRow(row, fieldLabel, mandatoryField, this.spreadsheetUploadController.component.getFieldMatchType());
          const errorMessage = {
            title: this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.mandatoryFieldNotFilled", [fieldLabel]),
            type: CustomMessageTypes.MandatoryFieldNotFilled,
            row: index + 2,
            counter: 1,
            ui5type: MessageType.Error
          };
          // no value found or value is empty, create error message
          if (!value || value.rawValue === "" || value.rawValue === undefined) {
            this.addMessageToMessages(errorMessage);
          }
        }
      }
    },
    checkFormat: function _checkFormat(data) {
      for (const [index, row] of data.entries()) {
        Object.values(row).forEach(_ref => {
          let {
            sheetDataType,
            format,
            rawValue,
            formattedValue
          } = _ref;
          if (sheetDataType === "n" && format !== "General" && rawValue !== Number(formattedValue)) {
            const warningMessage = {
              title: "Format",
              type: CustomMessageTypes.Formatting,
              row: index + 2,
              counter: 1,
              ui5type: MessageType.Warning,
              rawValue: rawValue,
              formattedValue: formattedValue
            };
            this.addMessageToMessages(warningMessage);
          }
        });
      }
    },
    checkMaxLength: function _checkMaxLength(data, typeLabelList, fieldMatchType) {
      for (const [index, row] of data.entries()) {
        for (const [key, valueTypeLabelList] of typeLabelList) {
          if (valueTypeLabelList.maxLength) {
            const value = Util.getValueFromRow(row, valueTypeLabelList.label, key, this.spreadsheetUploadController.component.getFieldMatchType());
            // check if value is longer then max length
            if (value && value.rawValue && value.rawValue.length > valueTypeLabelList.maxLength) {
              // the length was exceeded by x characters
              const exceededLength = value.rawValue.length - valueTypeLabelList.maxLength;
              const errorMessage = {
                title: this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.maxLengthExceeded", [valueTypeLabelList.maxLength, valueTypeLabelList.label]),
                type: CustomMessageTypes.MaxLengthExceeded,
                row: index + 2,
                counter: 1,
                ui5type: MessageType.Error,
                rawValue: value.rawValue,
                maxLength: valueTypeLabelList.maxLength,
                excededLength: exceededLength
              };
              this.addMessageToMessages(errorMessage);
            }
          }
        }
      }
    },
    checkColumnNames: function _checkColumnNames(columnNames, fieldMatchType, typeLabelList) {
      for (let index = 0; index < columnNames.length; index++) {
        const columnName = columnNames[index];
        let found = false;
        for (const [key, value] of typeLabelList) {
          if (fieldMatchType === "label") {
            if (value.label === columnName) {
              found = true;
              break;
            }
          }
          if (fieldMatchType === "labelTypeBrackets") {
            if (columnName.includes(`[${key}]`)) {
              found = true;
              break;
            }
          }
        }
        if (!found) {
          const errorMessage = {
            title: this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.columnNotFound", [columnName]),
            type: CustomMessageTypes.ColumnNotFound,
            counter: 1,
            ui5type: MessageType.Error
          };
          this.addMessageToMessages(errorMessage);
        }
      }
    },
    checkKeyColumns: function _checkKeyColumns(columnNames, odataKeyList, typeLabelList) {
      const availableKeyColumns = [];
      for (let index = 0; index < odataKeyList.length; index++) {
        const columnName = odataKeyList[index];
        let found = false;
        for (const index in columnNames) {
          if (columnNames[index].includes(`[${columnName}]`)) {
            found = true;
            availableKeyColumns.push(columnName);
            break;
          }
        }
        if (!found) {
          const columnNameLabel = typeLabelList.get(columnName)?.label ? typeLabelList.get(columnName).label : columnName;
          const errorMessage = {
            title: this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.keyColumnNotFound", [columnNameLabel]),
            type: CustomMessageTypes.ColumnNotFound,
            counter: 1,
            ui5type: MessageType.Error
          };
          this.addMessageToMessages(errorMessage);
        }
      }
      return availableKeyColumns;
    },
    areMessagesPresent: function _areMessagesPresent() {
      if (this.messages.some(message => message.counter > 0)) {
        return true;
      }
      return false;
    },
    /**
     * Display messages.
     */
    displayMessages: async function _displayMessages(strict) {
      this.messageDialog = await Fragment.load({
        name: "cc.spreadsheetimporter.v1_1_1.fragment.MessagesDialog",
        type: "XML",
        controller: this
      });
      this.messageDialog.setModel(this.spreadsheetUploadController.componentI18n, "i18n");
      this.messageDialog.setModel(new JSONModel(), "messages");
      const messagesGrouped = this.groupMessages(this.messages);
      const sortedMessagesGrouped = this.sortMessagesByTitle(messagesGrouped);
      Log.debug("sortedMessagesGrouped", undefined, "SpreadsheetUpload: MessageHandler", () => this.spreadsheetUploadController.component.logger.returnObject({
        sortedMessagesGrouped: sortedMessagesGrouped
      }));
      this.messageDialog.getModel("messages").setData(sortedMessagesGrouped);
      const dialogState = this.getWorstType(sortedMessagesGrouped);
      const infoModel = new JSONModel({
        strict: this.spreadsheetUploadController.component.getStrict(),
        strictParameter: strict,
        dialogState: dialogState
      });
      this.messageDialog.setModel(infoModel, "info");
      this.messageDialog.open();
    },
    groupMessages: function _groupMessages(messages) {
      const counterLargerThanOne = messages.filter(message => message.counter !== 0);
      const parsingMessages = counterLargerThanOne.filter(message => message.type.group === true);
      const messageGroups = parsingMessages.reduce((groups, message) => {
        let messageText = "";
        if (!groups[message.title]) {
          groups[message.title] = [];
        }
        if (message.maxLength && message.excededLength) {
          messageText = this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.maxLengthExceededWithLength", [message.maxLength, message.excededLength, message.rawValue]);
        } else if (message.rawValue && message.formattedValue) {
          messageText = this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.errorInRowWithValueFormatted", [message.row, message.formattedValue, message.rawValue]);
        } else if (message.rawValue) {
          messageText = this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.errorInRowWithValue", [message.row, message.rawValue]);
        } else {
          messageText = this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.errorInRow", [message.row]);
        }
        groups[message.title].push({
          description: messageText,
          row: message.row
        });
        return groups;
      }, {});
      const groupedMessages = [];
      for (const messageKeyTitle in messageGroups) {
        const messageArray = messageGroups[messageKeyTitle];
        const ui5type = messages.find(message => message.title === messageKeyTitle)?.ui5type || "";
        groupedMessages.push({
          title: messageKeyTitle,
          description: messageArray.map(message => message.description).join("\n"),
          ui5type: ui5type,
          details: messageArray
        });
      }
      const allMessages = groupedMessages.concat(counterLargerThanOne.filter(message => message.type.group === false));
      return allMessages;
    },
    onCloseMessageDialog: function _onCloseMessageDialog() {
      this.messageDialog.close();
      this.messageDialog.destroy();
      // rest file uploader content
      this.spreadsheetUploadController.resetContent();
    },
    onContinue: function _onContinue() {
      this.messageDialog.close();
      const spreadsheetUploadDialog = this.spreadsheetUploadController.getSpreadsheetUploadDialog();
      const payloadArrayLength = this.spreadsheetUploadController.payloadArray.length;
      spreadsheetUploadDialog.getModel("info").setProperty("/dataRows", payloadArrayLength);
    },
    onDownloadErrors: function _onDownloadErrors() {
      const messages = this.messageDialog.getModel("messages").getData();

      // Define a mapping of original attribute names to custom headers
      const headerMapping = {
        title: this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.messageTitle"),
        description: this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.messageDescription"),
        ui5type: this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.messageType"),
        rowNumber: this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.messageRow")
      };
      const colWidth = [{
        wch: 60
      }, {
        wch: 40
      }, {
        wch: 15
      }, {
        wch: 20
      }];
      const flattenedData = [];
      messages.forEach(item => {
        // if details are present, the messages are grouped
        if (item.details?.length > 0) {
          item.details?.forEach(detail => {
            // Create a new object based on headerMapping
            const transformedItem = {};
            for (const key in headerMapping) {
              if (key === "description") {
                transformedItem[headerMapping[key]] = detail.description;
              } else if (key === "rowNumber") {
                transformedItem[headerMapping[key]] = detail.row;
              } else if (item.hasOwnProperty(key)) {
                transformedItem[headerMapping[key]] = item[key];
              }
            }
            flattenedData.push(transformedItem);
          });
        } else {
          // no details, just add the message
          const transformedItem = {};
          for (const key in headerMapping) {
            if (key === "description") {
              transformedItem[headerMapping[key]] = item.title;
            } else if (key === "rowNumber") {
              transformedItem[headerMapping[key]] = item.row;
            } else if (item.hasOwnProperty(key)) {
              transformedItem[headerMapping[key]] = item[key];
            }
          }
          flattenedData.push(transformedItem);
        }
      });

      // Convert the flattened data to a worksheet
      const worksheet = XLSX.utils.json_to_sheet(flattenedData);
      worksheet["!cols"] = colWidth;

      // Convert the worksheet to a workbook and download it
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.sheetName"));
      XLSX.writeFile(workbook, this.spreadsheetUploadController.util.geti18nText("spreadsheetimporter.spreadsheetFilenameName") + ".xlsx");
    },
    sortMessagesByTitle: function _sortMessagesByTitle(messages) {
      return messages.sort((a, b) => {
        if (a.title < b.title) {
          return -1;
        }
        if (a.title > b.title) {
          return 1;
        }
        return 0;
      });
    },
    getWorstType: function _getWorstType(messages) {
      let worstType = MessageType.None;

      // Map MessageType to severity levels
      const severity = {
        [MessageType.None]: 0,
        [MessageType.Information]: 1,
        [MessageType.Success]: 2,
        [MessageType.Warning]: 3,
        [MessageType.Error]: 4
      };
      for (const message of messages) {
        if (severity[message.ui5type] > severity[worstType]) {
          worstType = message.ui5type;
        }
      }

      // Convert MessageType to ValueState
      return worstType;
    }
  });
  return MessageHandler;
});
