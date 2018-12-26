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


export class MenuModel extends Observable {

    public home: string;
    public pedidos: string;
    public sacola: string;
    public loja: string;

    public default_pedido_page: string;

    public scan: string;

    public page: Page;

    constructor(page: Page) {
        super();
        this.page = page;

        this.scan = '';

        this.set("home", "res://home2");
        this.set("pedidos", 'res://pedido1');
        this.set("sacola", 'res://sacola1');
        this.set("loja", 'res://loja1');

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

    }
//K81163   http://scancode.com.br/app  app@app.com.br
    public loaded(){
        console.log('MENU LOADED!!');
    }

    public changed(args) {
        if (args.oldIndex !== -1) {
            const vm = (<TabView>args.object).bindingContext;

            this.set("home", "res://home1");
            this.set("pedidos", 'res://pedido1');
            this.set("sacola", 'res://sacola1');
            this.set("loja", 'res://loja1');

            switch(args.newIndex){
                case 0: this.set("home", "res://home2"); break;
                case 1: this.set("pedidos", "res://pedido2"); break;
                case 2: this.set("sacola", "res://sacola2"); this.sacolaSettings(args);  break;
                case 3: this.set("loja", "res://loja2"); break;
            }
        }

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
        var page = this.page;
        axios.get(cache.getString("api") + "/produtos/"+search+"/find", {auth: {username: cache.getString('login'), password: cache.getString('senha')}}).then(
            result => {
                if(result.status == 200) {

                    var produto = result.data.produto;
                    if(produto){
                        var frameLoja = <Frame>page.getViewById('loja_frame');
                        frameLoja.navigate({moduleName: "views/menu/tabs/loja/produto/produto-page", backstackVisible: false, context: { id_produto: produto.id_produto }});
                        
                        var tab = <TabView>page.getViewById('tabViewContainer');
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
        var frame = page.frame;
        frame.navigate({moduleName: "views/login/login-page", clearHistory: true});
    }

    public loadedScan(args){
        var txt = args.object;
        txt.focus();
    }


    public sacolaSettings(args){
        var frame_sacola = <Frame>args.object.getViewById('sacola_frame');

        var page_sacola = frame_sacola.currentPage;
        if(page_sacola){
            var searchbar_reader = <SearchBar>page_sacola.getViewById('scan_bar_code');
            //searchbar_reader.focus();
            //searchbar_reader.dismissSoftInput();

            if(isAndroid){
                var bindingContext = page_sacola.bindingContext;
                bindingContext.setPedido();
            }
        }
    }

}
