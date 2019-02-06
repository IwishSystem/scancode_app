// http://scancode.com.br/app  app@app.com.br 123456
import {displayedEvent, launchEvent, resumeEvent, suspendEvent, ApplicationEventData, LaunchEventData, AndroidActivityBackPressedEventData} from "tns-core-modules/application";
import * as application from "tns-core-modules/application";
import * as cache from "tns-core-modules/application-settings";
import * as utils from "utils/utils";
import { isIOS, isAndroid } from "platform";
import * as frame from "ui/frame";

application.on(launchEvent, (args: LaunchEventData) => {});
application.on(displayedEvent, (args: ApplicationEventData) => {});
application.on(suspendEvent, (args: ApplicationEventData) => {});
application.on(resumeEvent, (args: ApplicationEventData) => {});

if (application.android) {
	application.android.on(application.AndroidApplication.activityBackPressedEvent, function (args: AndroidActivityBackPressedEventData) {
		
		var frame = require('tns-core-modules/ui/frame');
		var currentPage = frame.topmost().currentPage;

		if (currentPage && currentPage.exports && typeof currentPage.exports.backEvent === "function") {
			currentPage.exports.backEvent(args);
		}
	}); 
}

function concurrency(value){
	let val = (value/1).toFixed(2).replace('.', ',')
	return 'R$'+val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function urlBefore(value){
	return cache.getString('url', '')+value;
}

function getIcon(value){
	return String.fromCharCode(value);
}

function historicoItems(value){
	if(value == 1){
		return 'Aberto';
	}else if(value == 2){
		return 'Concluído';
	} else if(value == 3) {
		return 'Cancelado';
	} else if(value == 4) {
		return 'Reservado';
	}  else if(value == 6) {
		return 'Em andamento';
	}else {
		return 'N/A';
	}
}




function historicoBg(value){
	if(value == 1 || value == 6){
		return 'green';
	}else if(value == 2){
		return 'red';
	} else  {
		return 'gray';
	} 
}

function hideKeybaord(){
	//console.log('esconder teclado');
	if (isIOS) {
		frame.topmost().nativeView.endEditing(true);
	}
	if (isAndroid) {
		utils.ad.dismissSoftInput();
	}
}

application.setResources( { getIcon, concurrency, historicoItems, historicoBg, urlBefore, hideKeybaord });

application.run({ moduleName: "main-root" });
// http://192.168.0.19  app@app.com.br 123456  K80198