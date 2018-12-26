import { Observable } from "tns-core-modules/data/observable";
import * as cache from "tns-core-modules/application-settings";

export class MainModel extends Observable {

	public default_page: string;

	constructor() {
		super();
		var api = cache.getString('api', null);
		var url = cache.getString('url', null);
		var login = cache.getString('login', null);
		var senha = cache.getString('senha', null);

		if(api && url && login && senha){
			this.default_page = 'views/menu/menu-page';
		} else {
			this.default_page = 'views/menu/menu-page';
		}

	}


}
