import { Observable } from "tns-core-modules/data/observable";
import * as cache from "tns-core-modules/application-settings";
import axios from "axios";

export class ProdutoModel extends Observable {

    public url: string;
    
    private id_produto: number;
    
    public produto: object;
    public pedido: object;
    public pedido_item: object;
    
    public observacao: string;

    public quantidade: number;
    public quantidade_minima: number;
    public quantidade_maxima: number;
    public quantidade_inicio: number;

    constructor(id_produto: number) {
        super();
        this.id_produto = id_produto;
        this.url = cache.getString('url');
    }

    public loaded(args){
        var page = args.object.page;

        if(this.produto){
            axios.get(cache.getString("api") +'/produtos/'+this.id_produto, {auth: {username: cache.getString('login'), password: cache.getString('senha')}}).then(
                result => {
                    if(result.status == 200) {
                        this.set('produto', result.data.produto);
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

}
