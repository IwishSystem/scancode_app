import {displayedEvent, launchEvent, resumeEvent, suspendEvent, ApplicationEventData, LaunchEventData, AndroidActivityBackPressedEventData} from "tns-core-modules/application";
import * as application from "tns-core-modules/application";
import * as cache from "tns-core-modules/application-settings";

application.on(launchEvent, (args: LaunchEventData) => {});
application.on(displayedEvent, (args: ApplicationEventData) => {});
application.on(suspendEvent, (args: ApplicationEventData) => {});
application.on(resumeEvent, (args: ApplicationEventData) => {});

if (application.android) {
	application.android.on(application.AndroidApplication.activityBackPressedEvent, function (args: AndroidActivityBackPressedEventData) {
		
		var frame = require('tns-core-modules/ui/frame');
		var currentPage = frame.topmost().currentPage;

		console.log(currentPage);
		if (currentPage && currentPage.exports && typeof currentPage.exports.backEvent === "function") {
			currentPage.exports.backEvent(args);
		}
	}); 
}

function getIcon(value){
	return String.fromCharCode(value);
}

application.setResources( { getIcon });

application.run({ moduleName: "main-root" });