import { Observable } from "tns-core-modules/data/observable";
import { ItemEventData } from "tns-core-modules/ui/list-view";
import { topmost } from "tns-core-modules/ui/frame";
import * as cache from "tns-core-modules/application-settings";
import axios from "axios";

export class ProdutosModel extends Observable {

    public produtos: Array<object>;
    private id_categoria: number;
    public url: string;

    constructor(id_categoria: number) {
        super();
        this.id_categoria = id_categoria;

        this.url = cache.getString('url');
        this.produtos = [];
    }

    public loaded(args){
        var page = args.object.page;
        if(this.produtos.length == 0){
            axios.get(cache.getString("api") +'/produtos/'+this.id_categoria+'/categoria', {auth: {username: cache.getString('login'), password: cache.getString('senha')}}).then(
                result => {
                    if(result.status == 200) {
                        this.set('produtos', result.data.produtos);
                    } else {
                        this.redirectLogin(page);
                    }
                },
                error => {
                    if(error.response.status == 404 || error.response.status == 401){
                        this.redirectLogin(page);
                    } else {
                        alert({title: "", message: "Opps, Ocorreu alguma falha ", okButtonText: ""});
                    }
                });
        }
    }

    private redirectLogin(page){
        var frame = page.parent.parent.parent.parent.frame;
        frame.navigate({moduleName: "views/login/login-page", clearHistory: true});
    }

    public refresh(args){
        var page = args.object.page;
        var pullRefresh = args.object;
        axios.get(cache.getString("api") +'/produtos/'+this.id_categoria+'/categoria', {auth: {username: cache.getString('login'), password: cache.getString('senha')}}).then(
            (result) => {
                pullRefresh.refreshing = false;
                if(result.status == 200) {
                    this.set('produtos', result.data.produtos);
                } else {
                    this.redirectLogin(page);
                }
            }, (error) => {
                pullRefresh.refreshing = false;
                if(error.response.status == 404 || error.response.status == 401){
                    this.redirectLogin(page);
                } else {
                    alert({title: "", message: "Opps, Ocorreu alguma falha ", okButtonText: ""});
                }
            });
    }    



    public  itemTap(args: ItemEventData){
        topmost().navigate({moduleName: "views/menu/tabs/loja/produto/produto-page", backstackVisible: false, context: { id_produto: args.view.bindingContext.id_produto }});
    }


}
