sap.ui.define([
    "sap/m/MessageToast"
], function(MessageToast) {
    'use strict';

    return {
        Upload: function(oEvent) {
            var that = this;
            // Create an input element to browse files
            var fileInput = document.createElement('input');
            fileInput.type = 'file';

            // Add an event listener to handle the selected file
            fileInput.addEventListener('change', function (event) {
                var selectedFile = event.target.files[0];
                if (selectedFile) {
                    // Update the model with the selected file name
                    that.getView().getModel("fileModel").setProperty("/selectedFile", selectedFile.name);
                    MessageToast.show("Selected file: " + selectedFile.name);
                }
            });

            // Trigger the click event to open the file dialog
            fileInput.click();
        }
        
    };
});