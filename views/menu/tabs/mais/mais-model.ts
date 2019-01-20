import { Observable} from "tns-core-modules/data/observable";
import * as cache from "tns-core-modules/application-settings";

export class MaisModel extends Observable {

	constructor() {
		super(); 
	}

	public sair(args){
		cache.clear();
		const page = args.object.page;
		const frame = page.parent.parent.parent.parent.parent.parent.frame;
		frame.navigate({moduleName: "views/login/login-page", clearHistory: true});		
	}

}
//http://scancode.com.br/ordesig