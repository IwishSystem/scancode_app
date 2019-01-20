import { Observable, PropertyChangeData  } from "tns-core-modules/data/observable";
import * as cache from "tns-core-modules/application-settings";
import * as storage from "nativescript-localstorage";
import axios from "axios";
import { topmost, Frame } from "tns-core-modules/ui/frame";
import { TabView } from "tns-core-modules/ui/tab-view";
import { View } from "ui/core/view";
import { prompt, PromptOptions, PromptResult } from "ui/dialogs";

export class ProdutoModel extends Observable {

    public url: string;
    
    private id_produto: number;
    
    public produto;
    public pedido;
    public pedido_item;
    
    public observacao: string;
    public desconto: number;

    public quantidade: number;
    public quantidade_minima: number;
    public quantidade_maxima: number;
    public quantidade_inicio: number;

    public btn_color: string;

    public preco: number;
    public preco_desconto: number;

    public multiplo: number;

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
        this.desconto = 0;
        this.multiplo = 1;

        this.btn_color = 'bg-gray';

        this.on(Observable.propertyChangeEvent, (propertyChangeData: PropertyChangeData) => {
            if (propertyChangeData.propertyName === "quantidade" || propertyChangeData.propertyName === "desconto") {
                this.updatePrice(propertyChangeData);
            }
        }, this);

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
                        this.set('preco', this.produto.preco);
                        this.set('preco_desconto', this.produto.preco);
                        this.set('multiplo', this.produto.multiplo);


                        var total_estoque =  this.produto.produto_estoque.disponivel_atual+this.produto.produto_estoque.disponivel_futuro;

                        this.set('quantidade_minima', this.produto.qtd_min);
                        if(this.quantidade_minima < this.multiplo) this.set('quantidade_minima', this.multiplo);
                        
                        this.set('quantidade_inicio', this.quantidade_minima);
                        this.set('quantidade', this.quantidade_inicio);
                        this.set('quantidade_maxima', total_estoque);

                        
                        if(this.pedido_item){

                            this.set('quantidade', this.pedido_item.quantidade);
                            this.set('quantidade_inicio', 0);

                            this.set('quantidade_maxima', total_estoque+this.pedido_item.quantidade);
                            if(this.quantidade_minima > this.pedido_item.quantidade) {
                                this.set('quantidade_minima', this.pedido_item.quantidade);
                            }

                            this.set('observacao', this.pedido_item.observacao);
                            this.set('desconto', this.pedido_item.desconto);
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
                    this.set('desconto', this.pedido_item.desconto);             
                } else {
                    this.set('quantidade_minima', this.produto.qtd_min);
                    if(this.quantidade_minima < this.multiplo) this.set('quantidade_minima', this.multiplo);
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
        if( (this.quantidade+this.multiplo)  <= this.quantidade_maxima){
            this.set('quantidade', this.quantidade+this.multiplo);
        } else {
            alert({title: "", message: 'Máximo de produtos disponíveis é '+ this.quantidade_maxima, okButtonText: "Voltar"});
        }
    }

    public diminuir(){
        if( (this.quantidade-this.multiplo) >= this.quantidade_minima){
            this.set('quantidade', this.quantidade-this.multiplo);
        } else {
            alert({title: "", message: 'Não é permitido na sacola menos que '+this.quantidade_minima+' unidade(s)', okButtonText: "Voltar"})
        }
    }

    public atualizar(args){
       var page = args.object.page;

        var total_estoque = this.produto.produto_estoque.disponivel_atual+this.produto.produto_estoque.disponivel_futuro;
        if(this.pedido.id_status == 6 && total_estoque >= this.quantidade_inicio){
            if(this.pedido_item){
                axios.patch(cache.getString("api")+'/pedidos/'+this.pedido.id_pedido+'/pedido_item/'+this.pedido_item.id, {quantidade: this.quantidade, observacao: this.observacao, desconto: this.desconto}, {auth: {username: cache.getString('login'), password: cache.getString('senha')}}).then(
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
                            console.log(error.response.data);
                            alert({title: "", message: "Opps, Ocorreu alguma falha1", okButtonText: ""});
                        }
                    });
            } else {
                axios.post(cache.getString("api")+'/pedidos/'+this.pedido.id_pedido+'/pedido_item', {id_produto: this.produto.id_produto, preco: this.produto.preco, quantidade: this.quantidade, observacao: this.observacao, desconto: this.desconto}, {auth: {username: cache.getString('login'), password: cache.getString('senha')}}).then(
                    (result) => {
                        if(result.status == 200) {
                            console.log(result.data);
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
                            console.log(error.response.data);
                            alert({title: "", message: "Opps, Ocorreu alguma falha2", okButtonText: ""});
                        }
                    });
            }
        } else {
            alert('Pedido não esta em andamento ou não possui o produto em estoque');
        }
    }    

    private redirectLogin(page){
        var frame = page.parent.parent.parent.parent.frame;
        frame.navigate({moduleName: "views/login/login-page", clearHistory: true});
    }


    public showQuantidadeModal(args){
        args.object.showModal("views/menu/tabs/loja/produto/quantidade/quantidade-page", {quantidade: this.quantidade, min: this.quantidade_minima, max: this.quantidade_maxima, multiplo: this.multiplo},
            (quantidade) => {
                if(quantidade){  
                    this.set('quantidade', quantidade);
                }
            });
    }

    public showDescontoModal(args){
        args.object.showModal("views/menu/tabs/loja/produto/desconto/desconto-page", {desconto: this.desconto},
            (desconto) => {
                if(desconto){  
                    this.set('desconto', desconto);
                }
            });
    }

    public updatePrice(args){

        let precos_promocionais = this.produto.precos_promocionais;
        let quantidade_min = 0;
        let preco = this.produto.preco;
        precos_promocionais.forEach((preco_promocional) => {
            if(this.quantidade >= preco_promocional.quantidade && quantidade_min < preco_promocional.quantidade){
                preco = preco_promocional.preco;
                quantidade_min = preco_promocional.quantidade;
            }
        });
        this.set('preco', preco);


        let preco_desconto = preco*((100-this.desconto)/100);
        this.set('preco_desconto', preco_desconto);
    }

}
// http://192.168.0.19   app@app.com.br    123456