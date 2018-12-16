import { EventData } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";
import { SacolaModel } from "./sacola-model";
import { topmost } from "tns-core-modules/ui/frame";
import { TabView } from "tns-core-modules/ui/tab-view";

export function navigatingTo(args: EventData) {
	let page = <Page>args.object;
	page.bindingContext = new SacolaModel();
}

export function backEvent(args) {
	args.cancel = true;
	var tab = <TabView>topmost().currentPage.parent.parent.parent;
	tab.selectedIndex = 1;
}