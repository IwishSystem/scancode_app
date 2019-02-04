import { EventData } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";
import { LoginModel } from "./login-model";
import * as cache from "tns-core-modules/application-settings";

export function navigatingTo(args: EventData) {
	//console.log(cache.getString('login'));
	//console.log(cache.getString('senha'));

	//cache.clear();
	//cache.remove("login");
	//cache.remove("senha");  http://192.168.0.19 app@app.com.br 123456

	let page = <Page>args.object;
	page.bindingContext = new LoginModel();
}