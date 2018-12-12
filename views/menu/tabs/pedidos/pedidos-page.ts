import { EventData } from "tns-core-modules/data/observable";
import { topmost } from "tns-core-modules/ui/frame";

export function navigatingTo(args: EventData) {
	
}

export function goClientes(args: EventData) {
	topmost().navigate("views/menu/tabs/pedidos/clientes/clientes-page");
}

export function goHistorico(args: EventData) {
	topmost().navigate("views/menu/tabs/pedidos/historico/historico-page");
}