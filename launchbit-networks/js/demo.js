$(document).ready(function(){

	var categories = new Array("marketers");
	getSampleAnalytics("1", "1000", categories);
	
});

//this function takes in cpc bid, budget, and publisher categories and returns an array of sample analytics and sample CPLs
//categories is an array
function getSampleAnalytics(budget, categories, cpc, callback) {

    if (!cpc || !budget || !categories) {
        return false;
    }

    var total_publishers = new Array();
	
	//loop through categories and push list of publishers
	for(var i = 0; i < categories.length; i++) {
		switch(categories[i]) {
			case "51":
			total_publishers.push("eWallstreeter.com", "Everything Finance", "Finance Matters");			
		  	break;
			case "12":
			total_publishers.push("Social Media Examiner", "Social Apps HQ", "Tracking 202");			
		  	break;
			case "17":
			total_publishers.push("Now I Know", "iDoneThis", "OneRead");			
		  	break;
			case "65":
			total_publishers.push("WaveApps", "Launch Grow Joy", "Project Eve");			
		  	break;
			case "61":
			total_publishers.push("Zerply", "Hack Design", "Design Taxi");			
		  	break;
			case "10":
			total_publishers.push("Startup Digest", "Startup Weekend", "Women 2.0");			
		  	break;
			case "9":
			total_publishers.push("Hacker Newsletter", "Javascript Weekly", "Ruby Weekly");			
		  	break;
			case "18":
			total_publishers.push("Xconomy", "How To Geek", "Techi");			
		  	break;
		}
	}
	
	var data = {};
    data["pickpubs"] = new Array();

	//if there are 5 or more publishers randomly pick 5 to show in analytics
	if (total_publishers.length >= 5) {
		for (var i = 0; i < 5; i++) {

			//randomly select a publisher and push into the selected publishers array
			var pub_position = Math.floor((Math.random())*(total_publishers.length));
            data["pickpubs"].push(new pubStats(total_publishers[pub_position], cpc, budget));

			//remove publisher from total publishers list so that we don't choose it again
			total_publishers.splice(pub_position, 1);
		}
	}	
	else {
		for (var i = 0; i < total_publishers.length; i++) {
            data["pickpubs"].push(new pubStats(total_publishers[i], cpc, budget));
		}
	}

	//compute cpl range based on categories	
	var currentcpl = 0;
	for(var i = 0; i < categories.length; i++) {
		if (categories[i] == "65") {
			if((currentcpl > 20) || (!currentcpl)) {
				currentcpl = 20;
			}
		}
		else if (categories[i] == "12") {
			if((currentcpl > 40) || (!currentcpl)) {
				currentcpl = 40;
			}
		}
		else if (categories[i] == "9") {
			if((currentcpl > 15) || (!currentcpl)) {
				currentcpl = 15;
			}
		}
		else if (categories[i] == "61") {
			if((currentcpl > 40) || (!currentcpl)) {
				currentcpl = 40;
			}
		}
		else {
			if((currentcpl > 50) || (!currentcpl)) {
				currentcpl = 50;
			}
		}		
	}

	//rough cpl range
	data["low_cpl"] = currentcpl - 5;
    data["high_cpl"] = currentcpl + 10;
	
	//compute rough number of leads based on budget and bid
    data["nhighleads"] = Math.round(budget / data["low_cpl"]);
    data["nlowleads"] = Math.round(budget / data["high_cpl"]);

    //this will need rounding
    if (typeof callback == 'function') {
	    callback(data);
    }
}

//http://stackoverflow.com/questions/2729323/javascript-pushing-object-into-array
function pubStats(pubname, cpc, budget) {
	//if cpcs are unreasonable
	if (cpc < 2) {
		var clicks = Math.round(Math.random() * (5 - 1) + 1),
		ctr = Math.round((Math.random() * (0.03 - 0.001) + 0.001) * 10000) / 100,
		impressions = Math.floor(clicks / (ctr / 100));
	}
	
	//if cpc is reasonable
	else {
   		var clicks = Math.floor(Math.random() * ((budget / cpc) / 10)),
    	ctr = Math.round((Math.random() * (0.03 - 0.001) + 0.001) * 10000) / 100,
    	impressions = Math.floor(clicks / (ctr / 100));
	}
	
	return {
        "name" : pubname,
        "clicks" : clicks,
        "impressions" : impressions,
	    "ctr" : ctr
    };
}


