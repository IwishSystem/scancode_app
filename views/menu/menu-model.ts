import {Observable } from "tns-core-modules/data/observable";
import {TabView, SelectedIndexChangedEventData} from "tns-core-modules/ui/tab-view";
import * as storage from "nativescript-localstorage";
import { topmost, Frame } from "tns-core-modules/ui/frame";
import { Page } from "tns-core-modules/ui/page";

export class MenuModel extends Observable {

    public home: string;
    public pedidos: string;
    public sacola: string;
    public loja: string;

    public default_pedido_page: string;
    //public tabSelectedIndex: number;

    constructor() {
        super();
        //this.set("tabSelectedIndex", 2);
        this.set("home", "res://home2");
        this.set("pedidos", 'res://pedido1');
        this.set("sacola", 'res://sacola1');
        this.set("loja", 'res://loja1');

        if(storage.getItem('pedido')){
            this.default_pedido_page = 'views/menu/tabs/pedidos/pedido/pedido-page';
        } else {
            this.default_pedido_page = 'views/menu/tabs/pedidos/pedidos-page';
        }
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
                case 2: this.set("sacola", "res://sacola2"); break;
                case 3: this.set("loja", "res://loja2"); break;
            }

            if(args.newIndex == 2) {
                var page = <Page>args.object.page;
                var frame_sacola = <Frame>page.getViewById('sacola_frame');
                frame_sacola.navigate({moduleName: "views/menu/tabs/sacola/sacola-page", clearHistory: true});
            }

        }
    }

}
