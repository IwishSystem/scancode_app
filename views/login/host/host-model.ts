import { Observable } from "tns-core-modules/data/observable";
import axios from "axios";
import * as cache from "tns-core-modules/application-settings";
import { topmost } from "tns-core-modules/ui/frame";

export class HostModel extends Observable {

    public url: string;

    constructor() {
        super();
        this.url = '';
    }   

    public confirm(args) {    
        var frame = args.object.page.frame;
        console.log('confirm');
        axios.get(this.url+'/api').then(
            (result) => {
                console.log('confirm result'+ result.status);
                if(result.status == 200){
                    cache.setString('url', this.url);
                    cache.setString('api', this.url+'/api');
                    frame.goBack();
                } else {
                    alert({title: "", message: "Servidor não encontrado", okButtonText: ""});
                }
            },
            (error) => {
                console.log('confirm error'+ error.response.status);
                if(error.response.status == 404){
                    alert({title: "", message: "Servidor não encontrado", okButtonText: ""});
                } else {
                    alert({title: "", message: "Servidor não responde", okButtonText: ""});
                }
            });


    }


}
