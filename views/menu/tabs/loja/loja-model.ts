import { Observable } from "tns-core-modules/data/observable";
import { ItemEventData } from "tns-core-modules/ui/list-view";
import * as cache from "tns-core-modules/application-settings";
import axios from "axios";
import { topmost } from "tns-core-modules/ui/frame";

export class LojaModel extends Observable {

    public categorias: Array<object>;
    public url: string;

    constructor() {
        super();
        this.url = cache.getString('url');
        this.categorias = [];
    }

    public loaded(args){
        var page = args.object.page;
        if(this.categorias.length == 0){
            axios.get(cache.getString('api')+'/categorias', {auth: {username: cache.getString('login'), password: cache.getString('senha')}}).then(
                (result) => {
                    if(result.status == 200) {
                        this.set('categorias', result.data.categorias);
                    } else {
                        this.redirectLogin(page);
                    }
                }, (error) => {
                    if(error.response.status == 404 || error.response.status == 401){
                        this.redirectLogin(page);
                    } else {
                        alert({title: "", message: "Opps, Ocorreu alguma falha", okButtonText: ""});
                    }
                });
        }
    }

    public refresh(args){
        var page = args.object.page;
        var pullRefresh = args.object;
        axios.get(cache.getString('api')+'/categorias', {auth: {username: cache.getString('login'), password: cache.getString('senha')}}).then(
            (result) => {
                pullRefresh.refreshing = false;
                if(result.status == 200) {
                    this.set('categorias', result.data.categorias);
                } else {
                    this.redirectLogin(page);
                }
            }, (error) => {
                pullRefresh.refreshing = false;
                if(error.response.status == 404 || error.response.status == 401){
                    this.redirectLogin(page);
                } else {
                    alert({title: "", message: "Opps, Ocorreu alguma falha", okButtonText: ""});
                }
            });
    }

    public  itemTap(args: ItemEventData){
        topmost().navigate({moduleName: "views/menu/tabs/loja/produtos/produtos-page", context: { id_categoria: args.view.bindingContext.id_categoria }});
    }

    private redirectLogin(page){
        var frame = page.parent.parent.parent.parent.frame;
        frame.navigate({moduleName: "views/login/login-page", clearHistory: true});
    }

}
