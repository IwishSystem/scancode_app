import { EventData } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";
import { Frame, getFrameById, topmost } from "tns-core-modules/ui/frame";
import { HomeModel } from "./home-model";

export function navigatingTo(args: EventData) {
	let page = <Page>args.object;
    page.bindingContext = new HomeModel();
}

export function backEvent(args) {
  	console.log('EXEMPLO DE VOLTAR NA HOME');
}