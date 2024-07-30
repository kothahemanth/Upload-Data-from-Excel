import RenderManager from "sap/ui/core/RenderManager";
import DialogRenderer from "sap/m/DialogRenderer";
import SpreadsheetDialog from "./SpreadsheetDialog";
/**
 * @name cc.spreadsheetimporter.v1_1_1.SpreadsheetDialog
 */
export default {
	// can´t use apiVersion: 2, because of support for 1.71, remove when out of support
	//apiVersion: 2,
	render: function (rm: RenderManager, control: SpreadsheetDialog) {
		// @ts-ignore
		DialogRenderer.render.apply(this, arguments);
	}
};
