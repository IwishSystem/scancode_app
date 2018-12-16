import { Observable } from "tns-core-modules/data/observable";

export class HomeModel extends Observable {

	public icons: Array<object>;

	constructor() {
		super();

		var charCode = 0xe903;
		var icons = [];
		for(; charCode <= 0xeaea; charCode++){
			icons.push({icon: String.fromCharCode(charCode), code: charCode.toString(16)});
		}
		this.set("icons", icons);

	}

}
