import { EventData } from "tns-core-modules/data/observable";
import { Page } from "tns-core-modules/ui/page";
import { PedidoModel } from "./pedido-model";

export function navigatingTo(args: EventData) {
	let page = <Page>args.object;
    page.bindingContext = new PedidoModel();
}

