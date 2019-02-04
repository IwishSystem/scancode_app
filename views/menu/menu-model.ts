import {Observable, PropertyChangeData} from "tns-core-modules/data/observable";
import {TabView, SelectedIndexChangedEventData} from "tns-core-modules/ui/tab-view";
import * as storage from "nativescript-localstorage";
import { topmost, Frame } from "tns-core-modules/ui/frame";
import { Page } from "tns-core-modules/ui/page";
import { isAndroid } from "tns-core-modules/platform";
import {SearchBar} from "ui/search-bar";
import {TextView} from "ui/text-view";
import axios from "axios";
import * as cache from "tns-core-modules/application-settings";
import * as application from "tns-core-modules/application";


export class MenuModel extends Observable {

    public home: string;
    public pedidos: string;
    public sacola: string;
    public loja: string;
    public mais: string;

    public default_pedido_page: string;

    public search: string;
    public produtos_search: Array<Object>;
    public scan: string;

    public page: Page;

    constructor(page: Page) {
        super();
        this.page = page;

        this.search = '';
        //this.scan = '';
        this.produtos_search = [];

        this.set("home", "res://home2");
        this.set("pedidos", 'res://pedido1');
        this.set("sacola", 'res://sacola1');
        this.set("loja", 'res://loja1');
        this.set("mais", 'res://mais1');

        if(storage.getItem('pedido')){
            this.default_pedido_page = 'views/menu/tabs/pedidos/pedido/pedido-page';
        } else {
            this.default_pedido_page = 'views/menu/tabs/pedidos/pedidos-page';
        }

        this.on(Observable.propertyChangeEvent, (propertyChangeData: PropertyChangeData) => {
            if (propertyChangeData.propertyName === "scan") {
                this.scanUpdate();
            }
        }, this);

        this.on(Observable.propertyChangeEvent, (propertyChangeData: PropertyChangeData) => {
            if (propertyChangeData.propertyName === "search") {
                this.searchChange();
            }
        }, this);


    }


    public loadedScan(args){
        //console.log('FOCUS SCAN!!');
        var txt = args.object;
        txt.focus();

        setTimeout(function(){ 
            //txt.dismissSoftInput();
            var applicationResources = application.getResources();
            var hide = applicationResources.hideKeybaord;
            hide();
        }, 100);
        
    }


    public searchChange(){
        var produtos = storage.getItem('produtos').filter((produto, index) => {
            if (this.search != "") {
                if (produto.codigo.toLowerCase().indexOf(this.search.toLowerCase()) != -1) {
                    return true;
                }
                if (produto.descricao.toLowerCase().indexOf(this.search.toLowerCase()) != -1) {
                    return true;
                }
            }
            return false;
        });

        produtos = produtos.slice(-3);

        this.set('produtos_search', produtos);
    }

    public itemTapSearch(args){
        var page = args.object.page;

        var frame_loja = <Frame>page.getViewById('loja_frame');
        var tabview = <TabView>page.getViewById('tabViewContainer');
        var search_bar = page.getViewById('search_bar');


        frame_loja.navigate({moduleName: "views/menu/tabs/loja/produto/produto-page", backstackVisible: false, context: { id_produto: args.view.bindingContext.id_produto }});
        tabview.selectedIndex = 3;
        search_bar.text = '';

    }


    public loaded(args){
        //console.log('MENU LOADED!!');
        //this.loadedScan({object:args.object.getViewById('scan')});
        //console.log(args.object);
    }


    public changed(args) {
        if (args.oldIndex !== -1) {
            const vm = (<TabView>args.object).bindingContext;

            this.set("home", "res://home1");
            this.set("pedidos", 'res://pedido1');
            this.set("sacola", 'res://sacola1');
            this.set("loja", 'res://loja1');
            this.set("mais", 'res://mais1');

            switch(args.newIndex){
                case 0: this.set("home", "res://home2"); break;
                case 1: this.set("pedidos", "res://pedido2"); break;
                case 2: this.set("sacola", "res://sacola2"); this.sacolaSettings(args);  break;
                case 3: this.set("loja", "res://loja2"); break;
                case 4: this.set("mais", "res://mais2"); break;
            }
        }

    }


    public scanUpdateSearch(args){
        let search = this.search;
        this.set('search', '');
        this.searchProduto(search);

        let page = args.object.page;
        let scan_txt = page.getViewById('scan');
        scan_txt.focus();
        scan_txt.dismissSoftInput();

    }

    public scanUpdate(){
        console.log(topmost().currentPage);
        console.log(this.scan);
        if((this.scan.match(/\n/g)||[]).length == 1){
            var txt = <TextView>this.page.getViewById('scan');
            var search = txt.text;
            txt.text = '';
            search = search.replace(/(\r\n\t|\n|\r\t)/gm,"");
            this.searchProduto(search);
        }
    }


    public searchProduto(search){
        var produtos = storage.getItem('produtos') || [];
        var produto = produtos.find(
            (produto) => {
                if(produto.id_produto == search){
                    return true;
                } else {
                    return false;
                }
            });
        if(produto) {
            var tab = <TabView>this.page.getViewById('tabViewContainer');
            tab.selectedIndex = 3;
            var frameLoja = <Frame>this.page.getViewById('loja_frame');
            frameLoja.navigate({moduleName: "views/menu/tabs/loja/produto/produto-page", backstackVisible: false, context: { id_produto: produto.id_produto }});
        } else {
            axios.get(cache.getString("api") + "/produtos/"+search+"/find", {auth: {username: cache.getString('login'), password: cache.getString('senha')}}).then(
                result => {
                    if(result.status == 200) {
                        var produto = result.data.produto;
                        if(produto){
                            var tab = <TabView>this.page.getViewById('tabViewContainer');
                            tab.selectedIndex = 3;
                            var frameLoja = <Frame>this.page.getViewById('loja_frame');
                            frameLoja.navigate({moduleName: "views/menu/tabs/loja/produto/produto-page", backstackVisible: false, context: { id_produto: produto.id_produto }});
                        } else {
                            alert({title: "", message: "Produto não encontrado", okButtonText: ""});
                        }
                    } else {
                        this.redirectLogin(this.page);
                    }
                },
                error => {
                    alert(error.response.status);
                    if(error.response.status == 404 || error.response.status == 401){
                        this.redirectLogin(this.page);
                    } else {
                        alert({title: "", message: "Opps,Ocorreu alguma falha", okButtonText: ""});
                    }
                });
        }
    }

    private redirectLogin(page){
        var frame = page.frame;
        frame.navigate({moduleName: "views/login/login-page", clearHistory: true});
    }



    public sacolaSettings(args){
        var frame_sacola = <Frame>args.object.getViewById('sacola_frame');

        var page_sacola = frame_sacola.currentPage;
        if(page_sacola){

            if(isAndroid){
                var bindingContext = page_sacola.bindingContext;
                bindingContext.setPedido();
            }
        }
    }

}
