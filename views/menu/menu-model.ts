import {Observable } from "tns-core-modules/data/observable";
import {TabView, SelectedIndexChangedEventData} from "tns-core-modules/ui/tab-view";

export class MenuModel extends Observable {

    public home: string;
    public pedidos: string;
    public sacola: string;
    public loja: string;
    //public tabSelectedIndex: number;

    constructor() {
        super();
        //this.set("tabSelectedIndex", 2);
        this.set("home", "res://home2");
        this.set("pedidos", 'res://pedido1');
        this.set("sacola", 'res://sacola1');
        this.set("loja", 'res://loja1');
    }

    public changed(args: SelectedIndexChangedEventData) {
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

        }
    }

}
