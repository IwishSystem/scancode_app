import { Observable , PropertyChangeData} from "tns-core-modules/data/observable";
import * as storage from "nativescript-localstorage";
import { topmost, Frame } from "tns-core-modules/ui/frame";
import { TabView } from "tns-core-modules/ui/tab-view";
import * as cache from "tns-core-modules/application-settings";
import {SearchBar} from "ui/search-bar";
import axios from "axios";

import {TextView} from "ui/text-view";

import {isAndroid} from "platform";

export class SacolaModel extends Observable {

	public pedido;
	public items;
	public url: string;
	public scan_produto :string;
	public submit_produto :string;

	constructor() {
		super(); 
		this.scan_produto = '';
		this.submit_produto = '';
		this.url = cache.getString('url');
		this.items = [];


		this.on(Observable.propertyChangeEvent, (propertyChangeData: PropertyChangeData) => {
			if (propertyChangeData.propertyName === "scan_produto") {
				this.textChangeScanBarCode();
			}
		}, this);
	}

	public loaded(args){
		//console.log('loaded sacola');
		this.set('pedido', storage.getItem('pedido'));
		if(this.pedido){
			this.set('items', this.pedido.pedido_itens);
		}
	}

	public setPedido(){
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

	public  loadedSearchBar (args){
		//console.log('loaded search bar');
		var searchbar:SearchBar = <SearchBar>args.object;
		if(isAndroid){
			searchbar.android.clearFocus();
		}
	}


	public loadedScanBarCode(args){
		this.settingScanBarCode(args.object);
	}

	public settingScanBarCode(scan_bar_code: TextView){
		//alert('loaded scan bar');
		//scan_bar_code.focus();
		//scan_bar_code.dismissSoftInput();
	}

	public textChangeScanBarCode(){
		if((this.scan_produto.match(/\n/g)||[]).length == 1){
			var txt = <TextView>topmost().currentPage.getViewById('scan_bar_code');
			console.log(txt);
			var search = txt.text;
			console.log(search);
			txt.text = '';

			search = search.replace(/(\r\n\t|\n|\r\t)/gm,"");
			this.searchProduto(search);
		}
	}

	public searchProduto(search){
		var page = topmost().currentPage;
		axios.get(cache.getString("api") + "/produtos/"+search+"/find", {auth: {username: cache.getString('login'), password: cache.getString('senha')}}).then(
			result => {
				if(result.status == 200) {

					var produto = result.data.produto;
					if(produto){
						var frameLoja= <Frame>topmost().currentPage.parent.parent.parent.parent.getViewById('loja_frame');
						frameLoja.navigate({moduleName: "views/menu/tabs/loja/produto/produto-page", backstackVisible: false, context: { id_produto: produto.id_produto }});
						
						var tab = <TabView>topmost().currentPage.parent.parent.parent;
						tab.selectedIndex = 3;
					} else {
						alert({title: "", message: "Produto não encontrado", okButtonText: ""});
					}

				} else {
					this.redirectLogin(page);
				}
			},
			error => {
				alert(error.response.status);
				if(error.response.status == 404 || error.response.status == 401){
					this.redirectLogin(page);
				} else {
					alert({title: "", message: "Opps,Ocorreu alguma falha", okButtonText: ""});
				}
			});
	} 

	private redirectLogin(page){
		var frame = page.parent.parent.parent.parent.frame;
		frame.navigate({moduleName: "views/login/login-page", clearHistory: true});
	}

	public submit(args){
		/*var submit_produto = this.submit_produto;
		this.set('submit_produto', '');
		this.searchProduto(submit_produto);*/
	}

}
