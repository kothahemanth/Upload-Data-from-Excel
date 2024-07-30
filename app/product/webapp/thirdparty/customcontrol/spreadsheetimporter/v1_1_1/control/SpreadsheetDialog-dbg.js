"use strict";

sap.ui.define(["sap/m/Dialog", "../enums", "./SpreadsheetDialogRenderer"], function (Dialog, ___enums, __SpreadsheetDialogRenderer) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const AvailableOptions = ___enums["AvailableOptions"];
  const SpreadsheetDialogRenderer = _interopRequireDefault(__SpreadsheetDialogRenderer);
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
  const SpreadsheetDialog = Dialog.extend("cc.spreadsheetimporter.v1_1_1.SpreadsheetDialog", {
    renderer: SpreadsheetDialogRenderer,
    metadata: {
      properties: {
        decimalSeparator: {
          type: "string"
        },
        availableOptions: {
          type: "string[]"
        },
        component: {
          type: "object"
        }
      },
      events: {
        fileDrop: {
          parameters: {
            files: {
              type: "object[]"
            }
          }
        },
        decimalSeparatorChanged: {
          parameters: {
            decimalSeparator: {
              type: "string"
            }
          }
        },
        availableOptionsChanged: {
          parameters: {
            availableOptions: {
              type: "string[]"
            }
          }
        }
      }
    },
    constructor: function _constructor(id, settings) {
      Dialog.prototype.constructor.call(this, id, settings);
      this.dropMessageShown = false;
    },
    onAfterRendering: function _onAfterRendering(event) {
      Dialog.prototype.onAfterRendering.call(this, event);
      const domRef = this.getDomRef();
      domRef.addEventListener("dragover", this.handleDragOver.bind(this), false);
      domRef.addEventListener("dragenter", this.handleDragEnter.bind(this), false);
      domRef.addEventListener("dragleave", this.handleDragLeave.bind(this), false);
      domRef.addEventListener("drop", this.handleFileDrop.bind(this), false);
    },
    handleDragOver: function _handleDragOver(event) {
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = "copy";
      if (!this.dropMessageShown) {
        this.showDropMessage(true);
      }
    },
    handleDragLeave: function _handleDragLeave(event) {
      // Check if the drag is actually leaving the dialog, not just moving between children
      if (!event.currentTarget.contains(event.relatedTarget)) {
        this.showDropMessage(false);
      }
    },
    handleFileDrop: function _handleFileDrop(event) {
      event.preventDefault();
      event.stopPropagation();
      this.showDropMessage(false);
      const files = event.dataTransfer.files;
      this.fireFileDrop({
        files: files
      });
    },
    handleDragEnter: function _handleDragEnter(event) {},
    showDropMessage: function _showDropMessage(show) {
      // Ensure the current state matches the desired visibility
      if (this.dropMessageShown === show) {
        return; // No change is needed if the state is already correct
      }
      let dropMessage = this.getDomRef().querySelector(".drop-message");
      if (!dropMessage) {
        // Create the message element if it doesn't exist
        dropMessage = document.createElement("div");
        dropMessage.className = "drop-message";
        dropMessage.textContent = this.getModel("i18n").getResourceBundle().getText("spreadsheetimporter.dropMessage");
        this.getDomRef().appendChild(dropMessage);
      }

      // Toggle visibility class based on the 'show' parameter
      dropMessage.classList.toggle("visible", show);
      // Update the flag to reflect the new state
      this.dropMessageShown = show;
    },
    setDecimalSeparator: function _setDecimalSeparator(sDecimalSeparator) {
      if (sDecimalSeparator === "," || sDecimalSeparator === ".") {
        this.setProperty("decimalSeparator", sDecimalSeparator);
        this.fireDecimalSeparatorChanged({
          decimalSeparator: sDecimalSeparator
        });
        return this;
      } else {
        throw new Error("Decimal separator must be either ',' or '.'");
      }
    },
    setAvailableOptions: function _setAvailableOptions(aAvailableOptions) {
      for (let option of aAvailableOptions) {
        if (!Object.values(AvailableOptions).includes(option)) {
          throw new Error("Invalid option: " + option);
        }
      }
      this.setProperty("availableOptions", aAvailableOptions);
      this.fireAvailableOptionsChanged({
        availableOptions: aAvailableOptions
      });
      return this;
    },
    exit: function _exit() {
      // Remove event listeners to clean up
      const domRef = this.getDomRef();
      if (domRef) {
        domRef.removeEventListener("dragover", this.handleDragOver.bind(this), false);
        domRef.removeEventListener("dragleave", this.handleDragLeave.bind(this), false);
        domRef.removeEventListener("drop", this.handleFileDrop.bind(this), false);
      }

      // Clean up the drop message element if needed
      let dropMessage = domRef?.querySelector(".drop-message");
      if (dropMessage) {
        dropMessage.remove();
      }
      this.dropMessageShown = false; // Reset visibility flag
      Dialog.prototype.exit.call(this);
    }
  });
  return SpreadsheetDialog;
});
