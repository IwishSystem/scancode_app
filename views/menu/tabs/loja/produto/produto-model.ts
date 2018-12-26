import { Observable } from "tns-core-modules/data/observable";
import * as cache from "tns-core-modules/application-settings";
import * as storage from "nativescript-localstorage";
import axios from "axios";
import { topmost, Frame } from "tns-core-modules/ui/frame";
import { TabView } from "tns-core-modules/ui/tab-view";

export class ProdutoModel extends Observable {

    public url: string;
    
    private id_produto: number;
    
    public produto;
    public pedido;
    public pedido_item;
    
    public observacao: string;

    public quantidade: number;
    public quantidade_minima: number;
    public quantidade_maxima: number;
    public quantidade_inicio: number;

    public btn_color: string;

    constructor(id_produto: number) {
        super();
        this.id_produto = id_produto;
        this.url = cache.getString('url');

        this.pedido = storage.getItem('pedido');

        if(this.pedido) {
            this.pedido_item = this.pedido.pedido_itens.find((pedido_item) => {
                if(pedido_item.id_produto == this.id_produto){
                    return true;
                }
            });
        }

        this.btn_color = 'bg-gray';

    }

    public loaded(args){
        var page = args.object.page;
        //console.log(this.pedido);
        if(!this.produto){
            //console.log('carregar produto');
            axios.get(cache.getString("api") +'/produtos/'+this.id_produto, {auth: {username: cache.getString('login'), password: cache.getString('senha')}}).then(
                result => {
                    if(result.status == 200) {
                        this.set('produto', result.data.produto);
                        var total_estoque =  this.produto.produto_estoque.disponivel_atual+this.produto.produto_estoque.disponivel_futuro;

                        this.set('quantidade_minima', this.produto.qtd_min);
                        this.set('quantidade_inicio', this.produto.qtd_min);
                        this.set('quantidade', this.quantidade_inicio);
                        this.set('quantidade_maxima', total_estoque);

                        
                        if(this.pedido_item){

                            this.set('quantidade', this.pedido_item.quantidade);
                            this.set('quantidade_inicio', 0);

                            this.set('quantidade_maxima', total_estoque+this.pedido_item.quantidade);
                            if(this.quantidade_minima > this.pedido_item.quantidade) {
                                this.quantidade_minima = this.pedido_item.quantidade;
                            }

                            this.set('observacao', this.pedido_item.observacao);
                        } 

                        if(this.pedido){
                            if(this.pedido.id_status == 6 && total_estoque >= this.quantidade_inicio){
                                this.set('btn_color', 'bg-green');
                            } else {
                                this.set('btn_color', 'bg-gray');
                            }
                        }

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
        } else {
            var total_estoque =  this.produto.produto_estoque.disponivel_atual+this.produto.produto_estoque.disponivel_futuro;
            this.set('pedido', storage.getItem('pedido'));

            if(this.pedido) {
                var pedido_item = this.pedido.pedido_itens.find((pedido_item) => {
                    if(pedido_item.id_produto == this.id_produto){
                        return true;
                    }
                });

                if(pedido_item){
                    this.set('pedido_item', pedido_item);       
                    this.set('quantidade', this.pedido_item.quantidade);
                    this.set('quantidade_inicio', 0);

                    this.set('quantidade_maxima', total_estoque+this.pedido_item.quantidade);
                    if(this.quantidade_minima > this.pedido_item.quantidade) {
                        this.quantidade_minima = this.pedido_item.quantidade;
                    }

                    this.set('observacao', this.pedido_item.observacao);             
                } else {
                    this.set('quantidade_minima', this.produto.qtd_min);
                    this.set('quantidade_inicio', this.produto.qtd_min);
                    this.set('quantidade', this.quantidade_inicio);
                    this.set('quantidade_maxima', total_estoque);
                }


                if(this.pedido.id_status == 6 && total_estoque >= this.quantidade_inicio){
                    this.set('btn_color', 'bg-green');
                } else {
                    this.set('btn_color', 'bg-gray');
                    
                }

            }
        }
    }

    public adicionar(){
        if( (this.quantidade+1)  <= this.quantidade_maxima){
            this.set('quantidade', this.quantidade+1);
        } else {
            alert({title: "", message: 'Máximo de produtos disponíveis é '+ this.quantidade_maxima, okButtonText: "Voltar"});
        }
    }

    public diminuir(){
        if( (this.quantidade-1) >= this.quantidade_minima){
            this.set('quantidade', this.quantidade-1);
        } else {
            alert({title: "", message: 'Não é permitido na sacola menos que '+this.quantidade_minima+' unidade(s)', okButtonText: "Voltar"})
        }
    }

    public atualizar(args){
       var page = args.object.page;

        var total_estoque = this.produto.produto_estoque.disponivel_atual+this.produto.produto_estoque.disponivel_futuro;
        if(this.pedido.id_status == 6 && total_estoque >= this.quantidade_inicio){
            if(this.pedido_item){
                axios.patch(cache.getString("api")+'/pedidos/'+this.pedido.id_pedido+'/pedido_item/'+this.pedido_item.id, {quantidade: this.quantidade, observacao: this.observacao}, {auth: {username: cache.getString('login'), password: cache.getString('senha')}}).then(
                    (result) => {
                        if(result.status == 200) {
                            storage.setItemObject('pedido', result.data.pedido);
                            var tab = <TabView>topmost().currentPage.parent.parent.parent;
                            tab.selectedIndex = 2;
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
            } else {
                axios.post(cache.getString("api")+'/pedidos/'+this.pedido.id_pedido+'/pedido_item', {id_produto: this.produto.id_produto, preco: this.produto.preco, quantidade: this.quantidade, observacao: this.observacao}, {auth: {username: cache.getString('login'), password: cache.getString('senha')}}).then(
                    (result) => {
                        if(result.status == 200) {
                            storage.setItemObject('pedido', result.data.pedido);
                            var tab = <TabView>topmost().currentPage.parent.parent.parent;
                            tab.selectedIndex = 2;
                        } else {
                            this.redirectLogin(page);
                        }
                    }, (error) => {
                        if(error.response.status == 404 || error.response.status == 401){
                            this.redirectLogin(page);
                        } else {
                            alert({title: "", message: "Opps, Ocorreu alguma falha ", okButtonText: ""});
                        }
                    });
            }
        } else {
            alert('Pedido não esta em anadamento');
        }
    }    

    private redirectLogin(page){
        var frame = page.parent.parent.parent.parent.frame;
        frame.navigate({moduleName: "views/login/login-page", clearHistory: true});
    }

}
