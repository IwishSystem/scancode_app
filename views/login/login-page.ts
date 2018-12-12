import { EventData } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";
import { LoginModel } from "./login-model";
import * as cache from "tns-core-modules/application-settings";

export function navigatingTo(args: EventData) {
	console.log(cache.getString('login'));
	console.log(cache.getString('senha'));

	//cache.remove("login");
	//cache.remove("senha");

	let page = <Page>args.object;
	page.bindingContext = new LoginModel();
}