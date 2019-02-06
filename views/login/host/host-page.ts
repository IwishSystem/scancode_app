import { EventData } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";
import { HostModel } from "./host-model";
import * as cache from "tns-core-modules/application-settings";

export function navigatingTo(args: EventData) {
	let page = <Page>args.object;
	page.bindingContext = new HostModel();
}//http://192.168.0.19 app@app.com.br