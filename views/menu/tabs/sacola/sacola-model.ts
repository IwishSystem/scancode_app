import { Observable } from "tns-core-modules/data/observable";
import * as storage from "nativescript-localstorage";
import { topmost, Frame } from "tns-core-modules/ui/frame";
import { TabView } from "tns-core-modules/ui/tab-view";
import * as cache from "tns-core-modules/application-settings";

export class SacolaModel extends Observable {

	public pedido;
	public items;
	 public url: string;

	constructor() {
		super(); 
		this.url = cache.getString('url');
		this.items = [];
	}

	public loaded(args){
		this.set('pedido', storage.getItem('pedido'));
		if(this.pedido){
			this.set('items', this.pedido.pedido_itens);
		}
	}

	public gotoProduto(args){
		var frameSacola = <Frame>topmost().currentPage.parent.parent.parent.parent.getViewById('loja_frame');
		frameSacola.navigate({moduleName: "views/menu/tabs/loja/produto/produto-page", backstackVisible: false, context: { id_produto: args.view.bindingContext.produto.id_produto }});
		var tab = <TabView>topmost().currentPage.parent.parent.parent;
		tab.selectedIndex = 3;

	}

}
