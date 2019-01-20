import { Observable } from "tns-core-modules/data/observable";// http://scancode.com.br/app     app@app.com.br   123456

export class DescontoModel extends Observable {

    public desconto: number;

    constructor(desconto: number) {
        super();
        this.desconto = desconto;
    }

    public confirmar(args){
        const desconto = Number(this.desconto);
        if(Number.isInteger(desconto)){
            args.object.closeModal(this.desconto);
        } else {
            alert({title: "", message: "Número não inteiro", okButtonText: ""});
        }
    }

}
