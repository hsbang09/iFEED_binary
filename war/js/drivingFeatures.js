

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */





function getDrivingFeatures() {
    var support_threshold = d3.select("[id=support_threshold_input]")[0][0].value;
    var confidence_threshold = d3.select("[id=confidence_threshold_input]")[0][0].value;
    var lift_threshold = d3.select("[id=lift_threshold_input]")[0][0].value;

    var selectedArchs = d3.selectAll("[class=dot_clicked]");
    var nonSelectedArchs = d3.selectAll("[class=dot]");
    var numOfSelectedArchs = selectedArchs.size();
    var numOfNonSelectedArchs = nonSelectedArchs.size();
    
    
    buttonClickCount_drivingFeatures += 1;
    getDrivingFeatures_numOfArchs.push({numOfSelectedArchs,numOfNonSelectedArchs});
    getDrivingFeatures_thresholds.push({supp:support_threshold,lift:lift_threshold,conf:confidence_threshold});
    
    
    var selectedBitStrings = [];
    var nonSelectedBitStrings = [];
    selectedBitStrings.length = 0;
    nonSelectedBitStrings.length=0;

    for (var i = 0; i < numOfSelectedArchs; i++) {
        var tmpBitString = booleanArray2String(selectedArchs[0][i].__data__.archBitString);
        selectedBitStrings.push(tmpBitString);
    }
    for (var i = 0; i < numOfNonSelectedArchs; i++) {
        var tmpBitString = booleanArray2String(nonSelectedArchs[0][i].__data__.archBitString);
        nonSelectedBitStrings.push(tmpBitString);
    }

    sortedDFs = generateDrivingFeatures(selectedBitStrings,nonSelectedBitStrings,support_threshold,confidence_threshold,lift_threshold,userDefFilters,"1");
    display_drivingFeatures(sortedDFs,"1");
}




function generateDrivingFeatures(selected,nonSelected,
		support_threshold,confidence_threshold,lift_threshold,
		userDefFilters,sortBy){
	
	var output;
    $.ajax({
        url: "drivingFeatureServlet",
        type: "POST",
        data: {ID: "generateDrivingFeatures",selected: JSON.stringify(selected),nonSelected:JSON.stringify(nonSelected),
        	supp:support_threshold,conf:confidence_threshold,lift:lift_threshold,
        	userDefFilters:JSON.stringify(userDefFilters),sortBy:sortBy},
        async: false,
        success: function (data, textStatus, jqXHR)
        {
        	output = JSON.parse(data);
        },
        error: function (jqXHR, textStatus, errorThrown)
        {alert("error");}
    });
    
    return output;
}


function sortDrivingFeatures(drivingFeatures,sortBy){
	
	var newlySorted = [];
	newlySorted.length=0;
	sortBy = + sortBy;
	
	for (var i=0;i<drivingFeatures.length;i++){
		
		var thisDF = drivingFeatures[i];
		var value=0;
		var maxval = 1000000000;
		var minval = -1;
		
		if(newlySorted.length==0){
			newlySorted.push(thisDF);
			continue;
		}

        value = thisDF.metrics[sortBy];
        maxval = newlySorted[0].metrics[sortBy];
        minval = newlySorted[newlySorted.length-1].metrics[sortBy];

		if(value>=maxval){
			newlySorted.splice(0,0,thisDF);
		} else if (value<=minval){
			newlySorted.push(thisDF);
		} else {
			for (var j=0;j<newlySorted.length;j++){
				var refval=0; var refval2=0;
				
				refval=newlySorted[j].metrics[sortBy];
				refval2=newlySorted[j+1].metrics[sortBy];
				if(value <=refval && value > refval2){
					newlySorted.splice(j+1,0,thisDF); break;
				}
			}
		}
	}         
	return newlySorted;
}


//function loadDrivingFeaturesWindow() {
//    var drivingFeatureDisplayWindow = window.open('drivingFeatures.html');
//}


function display_filterOption(){

    d3.select("[id=basicInfoBox_div]").select("g").remove();

    var archInfoBox = d3.select("[id=basicInfoBox_div]").append("g");
    archInfoBox.append("div")
            .attr("id","filter_title")
            .style("width","90%")
            .style("margin-top","10px")
            .style("margin-bottom","15px")
            .style("margin-left","2px")
            .style("float","left")
            .append("p")
            .text("Filter Setting")
            .style("font-size", "18px");
    var filterOptions = archInfoBox.append("div")
            .attr("id","filter_options")
            .style("width","100%")
            .style("height","40px")
            .style("float","left")
            .style("margin-bottom","10px");

    var filterDropdownMenu = d3.select("[id=filter_options]")
            .append("select")
            .attr("id","dropdown_presetFilters")
            .style("width","200px")
            .style("float","left")
            .style("margin-left","2px")
            .style("height","24px");

    filterDropdownMenu.selectAll("option").remove();
    filterDropdownMenu.selectAll("option")
            .data(filterDropdownOptions)
            .enter()
            .append("option")
            .attr("value",function(d){
                return d.value;
            })
            .text(function(d){
                return d.text;
            });

    d3.select("[id=filter_options]").append("button")
            .attr("id","applyFilterButton_new")
            .attr("class","filterOptionButtons")
            .style("margin-left","6px")
            .style("float","left")
            .text("Apply new filter");
    d3.select("[id=filter_options]").append("button")
            .attr("class","filterOptionButtons")
            .attr("id","applyFilterButton_add")
            .style("margin-left","6px")
            .style("float","left")
            .text("Add to selection");
    d3.select("[id=filter_options]").append("button")
            .attr("id","applyFilterButton_within")
            .attr("class","filterOptionButtons")
            .style("margin-left","6px")
            .style("float","left")
            .text("Search within selection");
    d3.select("[id=filter_options]").append("button")
		    .attr("id","applyFilterButton_complement")
		    .attr("class","filterOptionButtons")
		    .style("margin-left","6px")
		    .style("float","left")
		    .text("Select complement");
    d3.select("[id=filter_options]").append("button")
            .attr("id","saveFilter")
            .attr("class","filterOptionButtons")
            .style("margin-left","6px")
            .style("float","left")
            .text("Save this filter")
            .attr('disabled', true);

    d3.select("[id=filter_options]").select("select").on("change",selectFilterOption);
    d3.select("[id=applyFilterButton_add]").on("click",applyFilter_add);
    d3.select("[id=applyFilterButton_new]").on("click",applyFilter_new);
    d3.select("[id=applyFilterButton_within]").on("click",applyFilter_within);
    d3.select("[id=applyFilterButton_complement]").on("click",applyFilter_complement);
}



function selectFilterOption(){

    var archInfoBox = d3.select("[id=basicInfoBox_div]").select("g");

    archInfoBox.select("[id=filter_inputs]").remove();

    var filterDropdownMenu = d3.select("[id=dropdown_presetFilters]");
    var selectedOption = filterDropdownMenu[0][0].value;

    var filterInput = archInfoBox.append("div")
                .attr("id","filter_inputs");

    if (selectedOption==="defineNewFilter"){

        filterInput.append("div")
                .attr("id","newFilterDesignOptions")
                .text("Select preset filter to add: ");

        filterInput.select("[id=newFilterDesignOptions]")
                .append("select")
                .attr("id","dropdown_newFilterOption")
                .style("width","200px")
//                                .style("float","left")
                .style("margin-left","2px")
                .style("height","24px");

        var newFilterOptionDropdown = d3.select("[id=dropdown_newFilterOption]");

        newFilterOptionDropdown.selectAll("option").remove();

        var filterDropdownOptions_withoutUserDef = [];
        for(var i=0;i<filterDropdownOptions.length;i++){
            if(filterDropdownOptions[i].value!=="defineNewFilter"){
                filterDropdownOptions_withoutUserDef.push(filterDropdownOptions[i]);
            }
        }

        newFilterOptionDropdown.selectAll("option")
                .data(filterDropdownOptions_withoutUserDef)
                .enter()
                .append("option")
                .attr("value",function(d){
                    return d.value;
                })
                .text(function(d){
                    return d.text;
                });

        var filterDescription = filterInput.append("div")
                    .attr("id","userDefinedFilter_name_div")
                    .style("width","100%")
                    .style("float","left")
                    .style("margin-top","15px");
        filterDescription.append("div")
                .text("Filter name: ")
                .style("float","left");
        filterDescription.append("input")
                    .attr("id","userDefinedFilter_name")
                    .attr("type","text")
                    .style("width","450px")
                    .style("float","left")
                    .style("margin-left","5px")
                    .style("margin-right","10px");

        var filterExpression = filterInput.append("div")
                    .attr("id","filter_expression_div")
                    .style("width","100%")
                    .style("float","left")
                    .style("margin-top","15px")
                    .style("margin-bottom","5px");
        filterExpression.append("div")
                .text("Filter expression: ")
                .style("float","left");
        filterExpression.append("div")
                    .attr("id","filter_expression");

        userDefFilterExpressionHistory.length=0;
        d3.select("[id=dropdown_newFilterOption]").on("change",selectNewFilterOption); 


    } else if(selectedOption==="not_selected"){
        
    }else{
        selectFilterOption_filterInput(selectedOption,false); 
        d3.select("[id=saveFilter]").attr('disabled', true);
    }

}


function selectFilterOption_filterInput(selectedOption,userDefOption){

	
        d3.select("[id=filter_inputs]")
                .select("[id=filter_explanation]").remove();

    var filterInput = d3.select("[id=filter_inputs]");
    if(selectedOption=="not_selected"){
    }
    else if(selectedOption=="paretoFront"){

        filterInput.append("div")
                .attr("id","filter_input1")
                .text("Input Pareto Ranking: ");

        filterInput.select("[id=filter_input1]")
                .append("input")
                .attr("id","filter_input1_textBox")
                .attr("type","text");
    }
    else if (selectedOption=="present"){
        filterInputField_singleInstInput();
        d3.select("[id=filter_inputs]")
                .append("div")
                .attr("id","filter_explanation")
                .style("margin-top","15px")
                .style("margin-left","10px")
                .text("(Hint: Designs that have the specified instrument are selected)")
                .style("color", "#696969");   
    }
    else if (selectedOption=="absent"){
        filterInputField_singleInstInput();
        d3.select("[id=filter_inputs]")
                .append("div")
                .attr("id","filter_explanation")
                .style("margin-top","15px")
                .style("margin-left","10px")
                .text("(Hint: Designs that does not have the specified instrument are selected)")
                .style("color", "#696969");   
    }
    else if (selectedOption=="inOrbit"){
        filterInputField_orbitAndInstInput();
        d3.select("[id=filter_inputs]")
                .append("div")
                .attr("id","filter_explanation")
                .style("margin-top","15px")
                .style("margin-left","10px")
                .text("(Hint: Designs that have the specified instrument inside the chosen orbit are selected)")
                .style("color", "#696969");   
    }
    else if (selectedOption=="notInOrbit"){
        filterInputField_orbitAndInstInput();
        d3.select("[id=filter_inputs]")
                .append("div")
                .attr("id","filter_explanation")
                .style("margin-top","15px")
                .style("margin-left","10px")
                .text("(Hint: Designs that does not have the specified instrument inside the chosen orbit are selected)")
                .style("color", "#696969");   
    }
    else if (selectedOption=="together"){
        filterInputField_multipleInstInput();
        d3.select("[id=filter_inputs]")
                .append("div")
                .attr("id","filter_explanation")
                .style("margin-top","15px")
                .style("margin-left","10px")
                .text("(Hint: Designs that have the specified instruments in any one orbit are chosen)")
                .style("color", "#696969");   
    } 
    else if (selectedOption=="togetherInOrbit"){
        filterInputField_orbitAndMultipleInstInput();
        d3.select("[id=filter_inputs]")
                .append("div")
                .attr("id","filter_explanation")
                .style("margin-top","15px")
                .style("margin-left","10px")
                .text("(Hint: Designs that have the specified instruments in the specified orbit are chosen)")
                .style("color", "#696969");   
    } 
    else if (selectedOption=="separate"){
        filterInputField_multipleInstInput();
        d3.select("[id=filter_inputs]")
                .append("div")
                .attr("id","filter_explanation")
                .style("margin-top","15px")
                .style("margin-left","10px")
                .text("(Hint: Designs that does not have the specified instruments in the same orbit are chosen)")
                .style("color", "#696969");   
    } 
    else if (selectedOption=="emptyOrbit"){
        filterInputField_orbitInput();
        d3.select("[id=filter_inputs]")
                .append("div")
                .attr("id","filter_explanation")
                .style("margin-top","15px")
                .style("margin-left","10px")
                .text("(Hint: Designs that have no instrument inside the specified orbit are chosen)")
                .style("color", "#696969");   
    } 
    else if (selectedOption=="numOrbitUsed"){
        filterInputField_numOrbitInput();
        d3.select("[id=filter_inputs]")
                .append("div")
                .attr("id","filter_explanation")
                .style("margin-top","15px")
                .style("margin-left","10px")
                .text("(Hint: Designs that have the specified number of non-empty orbits are chosen)")
                .style("color", "#696969");   
    } 
    else if(selectedOption=="subsetOfInstruments"){
        filterInputField_subsetOfInstruments();
        d3.select("[id=filter_inputs]")
                .append("div")
                .attr("id","filter_explanation")
                .style("margin-top","15px")
                .style("margin-left","10px")
                .text("(Hint: The specified orbit should contain at least m number and at maximum M number of instruments from the specified instrument set. m is the first entry and M is the second entry in the second field)")
                .style("color", "#696969");  
    } else if(selectedOption=="defineNewFilter"){
    	
    } else{
    	
    	

        
    	if(!userDefOption){
    		
            var filterInput = d3.select("[id=filter_inputs]");

            var filterExpression = filterInput.append("div")
                        .attr("id","filter_expression_div")
                        .style("width","100%")
                        .style("float","left")
                        .style("margin-top","15px")
                        .style("margin-bottom","5px");
            filterExpression.append("div")
                    .text("Filter expression: ")
                    .style("float","left");
            filterExpression.append("div")
                        .attr("id","filter_expression");
    		
            var expression;
            for(var i=0;i<userDefFilters.length;i++){
                if(userDefFilters[i].name===selectedOption){
                    expression = userDefFilters[i].expression;
                }
            }

            d3.select("[id=filter_expression]")
                    .style("height","120px")
                    .text(expression);
    	}

    }    
}

function filterInputField_singleInstInput(){
    var filterInput = d3.select("[id=filter_inputs]");
        filterInput.append("div")
                .attr("id","filter_input1")
                .text("Input single instrument name: ");
        filterInput.select("[id=filter_input1]")
                .append("input")
                .attr("id","filter_input1_textBox")  
                .attr("type","text");
}
function filterInputField_orbitInput(){
    var filterInput = d3.select("[id=filter_inputs]");

        filterInput.append("div")
                .attr("id","filter_input1")
                .text("Input orbit name");

        filterInput.select("[id=filter_input1]")
                .append("input")
                .attr("id","filter_input1_textBox")
                .attr("type","text");
}
function filterInputField_orbitAndInstInput(){
    var filterInput = d3.select("[id=filter_inputs]");

        filterInput.append("div")
                .attr("id","filter_input1")
                .text("Input orbit name: ");

        filterInput.select("[id=filter_input1]")
                .append("input")
                .attr("id","filter_input1_textBox")
                .attr("type","text");

        filterInput.append("div")
                .attr("id","filter_input2")
                .text("Input single instrument name: ");

        filterInput.select("[id=filter_input2]")
                .append("input")
                .attr("id","filter_input2_textBox")
                .attr("type","text")
                .style("width","300px")
                .style("margin-left","5px")
                .style("margin-right","10px")
                .style("margin-bottem","5px");
}
function filterInputField_multipleInstInput(){
        var filterInput = d3.select("[id=filter_inputs]");
        filterInput.append("div")
                .attr("id","filter_input1")
                .text("Input instrument names (2 or 3) separated by comma:");

        filterInput.select("[id=filter_input1]")
                .append("input")
                .attr("id","filter_input1_textBox")
                .attr("type","text");
}
function filterInputField_orbitAndMultipleInstInput(){
        var filterInput = d3.select("[id=filter_inputs]");
        filterInput.append("div")
                .attr("id","filter_input1")
                .text("Input orbit name: ");

        filterInput.select("[id=filter_input1]")
                .append("input")
                .attr("id","filter_input1_textBox")
                .attr("type","text");

        filterInput.append("div")
                .attr("id","filter_input2")
                .text("Input instrument names (2 or 3) separated by comma: ");

        filterInput.select("[id=filter_input2]")
                .append("input")
                .attr("id","filter_input2_textBox")
                .attr("type","text")
                .style("width","300px")
                .style("margin-left","5px")
                .style("margin-right","10px")
                .style("margin-bottem","5px");
}
function filterInputField_numOrbitInput(){
        var filterInput = d3.select("[id=filter_inputs]");

        filterInput.append("div")
                .attr("id","filter_input1")
                .text("Input number of orbits");

        filterInput.select("[id=filter_input1]")
                .append("input")
                .attr("id","filter_input1_textBox")
                .attr("type","text");
}
function filterInputField_subsetOfInstruments(){
        var filterInput = d3.select("[id=filter_inputs]");
        filterInput.append("div")
                .attr("id","filter_input1")
                .text("Input orbit name: ");

        filterInput.select("[id=filter_input1]")
                .append("input")
                .attr("id","filter_input1_textBox")
                .attr("type","text");

        filterInput.append("div")
                .attr("id","filter_input2")
                .text("Input the min and the max (optional) number of instruments in the subset, separated by comma: ")
                ;

        filterInput.select("[id=filter_input2]")
                .append("input")
                .attr("id","filter_input2_textBox")
                .attr("type","text")
                .style("width","100px")
                .style("margin-left","5px")
                .style("margin-right","10px")
                .style("margin-bottem","5px");

        filterInput.append("div")
                .attr("id","filter_input3")
                .text("Input a set of instrument names, separated by comma: ");

        filterInput.select("[id=filter_input3]")
                .append("input")
                .attr("id","filter_input3_textBox")
                .attr("type","text")
                .style("width","300px")
                .style("margin-left","5px")
                .style("margin-right","10px")
                .style("margin-bottem","5px");
}



function applyFilter_new(){
    buttonClickCount_applyFilter += 1;


    cancelDotSelections();

    var filterType = d3.select("[id=dropdown_presetFilters]")[0][0].value;
    var neg = false;
    
    if (filterType == "paretoFront"){
        var filterInput = d3.select("[id=filter_input1_textBox]")[0][0].value;
        var unClickedArchs = d3.selectAll("[class=dot]")[0].forEach(function (d) {
            if (d3.select(d).attr("paretoRank")== ""+filterInput){
                d3.select(d).attr("class", "dot_clicked")
                            .style("fill", "#0040FF");
            }
        });

    }
    else if (filterType == "present" || filterType == "absent" || filterType == "inOrbit" || filterType == "notInOrbit" || filterType == "together" || filterType == "togetherInOrbit" || filterType == "separate" || 
            filterType == "emptyOrbit" || filterType=="numOrbitUsed" || filterType=="subsetOfInstruments"){

        var filterInputs = [];
        if(d3.select("[id=filter_input1_textBox]")[0][0]!==null){
            filterInputs.push(d3.select("[id=filter_input1_textBox]")[0][0].value);
        }
        if(d3.select("[id=filter_input2_textBox]")[0][0]!==null){
            filterInputs.push(d3.select("[id=filter_input2_textBox]")[0][0].value);
        }
        if(d3.select("[id=filter_input3_textBox]")[0][0]!==null){
            filterInputs.push(d3.select("[id=filter_input3_textBox]")[0][0].value);
        }

        var unClickedArchs = d3.selectAll("[class=dot]")[0].forEach(function (d) {
//                            var bitString = booleanArray2String(d.__data__.archBitString)
            var bitString = d.__data__.archBitString;
            if (presetFilter2(filterType,bitString,filterInputs,neg)){
                d3.select(d).attr("class", "dot_clicked")
                            .style("fill", "#0040FF");
            }
        });
    } else if(filterType == "defineNewFilter" || (filterType =="not_selected" && userDefFilters.length !== 0)){
        var filterExpression = d3.select("[id=filter_expression]").text();
        tmpCnt =0;


        d3.selectAll("[class=dot]")[0].forEach(function(d){
        	
            var bitString = d.__data__.archBitString;
            if(applyUserDefFilterFromExpression(filterExpression,bitString)){
                d3.select(d).attr("class", "dot_clicked")
                            .style("fill", "#0040FF");
            }
        });

        d3.select("[id=saveFilter]").attr('disabled', null)
                                    .on("click",saveNewFilter);
    }
    else{
        for(var k=0 ; k < userDefFilters.length; k++){
           if(userDefFilters[k].name == filterType){
                var filterExpression = userDefFilters[k].expression;
                d3.selectAll("[class=dot]")[0].forEach(function(d){
                    var bitString = d.__data__.archBitString;
                    if(applyUserDefFilterFromExpression(filterExpression,bitString)){
                        d3.select(d).attr("class", "dot_clicked")
                                    .style("fill", "#0040FF");
                    }
                }); 
           } 
        }
    }

    d3.select("[id=numOfSelectedArchs_inputBox]").attr("value",numOfSelectedArchs());  
}

function applyFilter_within(){
    buttonClickCount_applyFilter += 1;
    var filterType = d3.select("[id=dropdown_presetFilters]")[0][0].value;
    var neg = false;

    if (filterType == "paretoFront"){
        var filterInput = d3.select("[id=filter_input1_textBox]")[0][0].value;
        var clickedArchs = d3.selectAll("[class=dot_clicked]")[0].forEach(function (d) {

            if (d3.select(d).attr("paretoRank")== ""+filterInput){
            } else {
                d3.select(d).attr("class", "dot")
                            .style("fill", function (d) {
                                if (d.status == "added") {
                                    return "#188836";
                                } else if (d.status == "justAdded") {
                                    return "#20FE5B";
                                } else {
                                    return "#000000";
                                }
                            });
            }
        });

    }
    else if (filterType == "present" || filterType == "absent" || filterType == "inOrbit" || filterType == "notInOrbit" || 
            filterType == "together" || filterType == "togetherInOrbit" || filterType == "separate" || 
            filterType == "emptyOrbit" || filterType=="numOrbitUsed" || filterType=="subsetOfInstruments"){


        var filterInputs = [];
        if(d3.select("[id=filter_input1_textBox]")[0][0]!==null){
            filterInputs.push(d3.select("[id=filter_input1_textBox]")[0][0].value);
        }
        if(d3.select("[id=filter_input2_textBox]")[0][0]!==null){
            filterInputs.push(d3.select("[id=filter_input2_textBox]")[0][0].value);
        }
        if(d3.select("[id=filter_input3_textBox]")[0][0]!==null){
            filterInputs.push(d3.select("[id=filter_input3_textBox]")[0][0].value);
        }


        var clickedArchs = d3.selectAll("[class=dot_clicked]")[0].forEach(function (d) {
//                            var bitString = booleanArray2String(d.__data__.archBitString)

            var bitString = d.__data__.archBitString;
            if (presetFilter2(filterType,bitString,filterInputs,neg)){
            } else {
                d3.select(d).attr("class", "dot")
                            .style("fill", function (d) {
                                if (d.status == "added") {
                                    return "#188836";
                                } else if (d.status == "justAdded") {
                                    return "#20FE5B";
                                } else {
                                    return "#000000";
                                }
                            });
            }


        });
    }
    else{
        for(var k=0 ; k < userDefFilters.length; k++){
           if(userDefFilters[k].name == filterType){
                var filterExpression = userDefFilters[k].expression;
                d3.selectAll("[class=dot_clicked]")[0].forEach(function(d){
                    var bitString = d.__data__.archBitString;
                    if(applyUserDefFilterFromExpression(filterExpression,bitString)){
                        d3.select(d).attr("class", "dot_clicked")
                                    .style("fill", "#0040FF");
                    }
                }); 
           } 
        }
    }
    d3.select("[id=numOfSelectedArchs_inputBox]").attr("value",numOfSelectedArchs());  
}


function applyFilter_add(){
    buttonClickCount_applyFilter += 1;

    var filterType = d3.select("[id=dropdown_presetFilters]")[0][0].value;
    var neg = false;
    
    if (filterType == "paretoFront"){
        var filterInput = d3.select("[id=filter_input1_textBox]")[0][0].value;
        var unClickedArchs = d3.selectAll("[class=dot]")[0].forEach(function (d) {
            if (d3.select(d).attr("paretoRank")== ""+filterInput){
                d3.select(d).attr("class", "dot_clicked")
                            .style("fill", "#0040FF");
            }
        });

    }
    else if (filterType == "present" || filterType == "absent" || filterType == "inOrbit" || filterType == "notInOrbit" || 
            filterType == "together" || filterType == "togetherInOrbit" || filterType == "separate" || 
            filterType == "emptyOrbit" || filterType=="numOrbitUsed" || filterType =="subsetOfInstruments"){


        var filterInputs = [];
        if(d3.select("[id=filter_input1_textBox]")[0][0]!==null){
            filterInputs.push(d3.select("[id=filter_input1_textBox]")[0][0].value);
        }
        if(d3.select("[id=filter_input2_textBox]")[0][0]!==null){
            filterInputs.push(d3.select("[id=filter_input2_textBox]")[0][0].value);
        }
        if(d3.select("[id=filter_input3_textBox]")[0][0]!==null){
            filterInputs.push(d3.select("[id=filter_input3_textBox]")[0][0].value);
        }

        var unClickedArchs = d3.selectAll("[class=dot]")[0].forEach(function (d) {
//                            var bitString = booleanArray2String(d.__data__.archBitString)
            var bitString = d.__data__.archBitString;
            if (presetFilter2(filterType,bitString,filterInputs,neg)){
                d3.select(d).attr("class", "dot_clicked")
                            .style("fill", "#0040FF");
            }
        });
    }
    else{
        for(var k=0 ; k < userDefFilters.length; k++){
           if(userDefFilters[k].name == filterType){
                var filterExpression = userDefFilters[k].expression;
                d3.selectAll("[class=dot]")[0].forEach(function(d){
                    var bitString = d.__data__.archBitString;
                    if(applyUserDefFilterFromExpression(filterExpression,bitString)){
                        d3.select(d).attr("class", "dot_clicked")
                                    .style("fill", "#0040FF");
                    }
                }); 
           } 
        }
    }
    d3.select("[id=numOfSelectedArchs_inputBox]").attr("value",numOfSelectedArchs());  
}

function applyFilter_complement(){
    buttonClickCount_applyFilter += 1;
    cancelDotSelections();

    var filterType = d3.select("[id=dropdown_presetFilters]")[0][0].value;
    var neg = true;
    
    if (filterType == "paretoFront"){
        var filterInput = d3.select("[id=filter_input1_textBox]")[0][0].value;
        var unClickedArchs = d3.selectAll("[class=dot]")[0].forEach(function (d) {
            if (d3.select(d).attr("paretoRank")== ""+filterInput){
                d3.select(d).attr("class", "dot_clicked")
                            .style("fill", "#0040FF");
            }
        });

    }
    else if (filterType == "present" || filterType == "absent" || filterType == "inOrbit" || filterType == "notInOrbit" || filterType == "together" || filterType == "togetherInOrbit" || filterType == "separate" || 
            filterType == "emptyOrbit" || filterType=="numOrbitUsed" || filterType=="subsetOfInstruments"){

        var filterInputs = [];
        if(d3.select("[id=filter_input1_textBox]")[0][0]!==null){
            filterInputs.push(d3.select("[id=filter_input1_textBox]")[0][0].value);
        }
        if(d3.select("[id=filter_input2_textBox]")[0][0]!==null){
            filterInputs.push(d3.select("[id=filter_input2_textBox]")[0][0].value);
        }
        if(d3.select("[id=filter_input3_textBox]")[0][0]!==null){
            filterInputs.push(d3.select("[id=filter_input3_textBox]")[0][0].value);
        }

        var unClickedArchs = d3.selectAll("[class=dot]")[0].forEach(function (d) {
//                            var bitString = booleanArray2String(d.__data__.archBitString)
            var bitString = d.__data__.archBitString;
            if (presetFilter2(filterType,bitString,filterInputs,neg)){
                d3.select(d).attr("class", "dot_clicked")
                            .style("fill", "#0040FF");
            }
        });
    } else if(filterType == "defineNewFilter" || (filterType =="not_selected" && userDefFilters.length !== 0)){
        var filterExpression = d3.select("[id=filter_expression]").text();
        tmpCnt =0;

        d3.selectAll("[class=dot]")[0].forEach(function(d){

            var bitString = d.__data__.archBitString;
            if(applyUserDefFilterFromExpression(filterExpression,bitString)){
                d3.select(d).attr("class", "dot_clicked")
                            .style("fill", "#0040FF");
            }
        });

        d3.select("[id=saveFilter]").attr('disabled', null)
                                    .on("click",saveNewFilter);
    }
    else{
        for(var k=0 ; k < userDefFilters.length; k++){
           if(userDefFilters[k].name == filterType){
                var filterExpression = userDefFilters[k].expression;
                d3.selectAll("[class=dot]")[0].forEach(function(d){
                    var bitString = d.__data__.archBitString;
                    if(!applyUserDefFilterFromExpression(filterExpression,bitString)){
                        d3.select(d).attr("class", "dot_clicked")
                                    .style("fill", "#0040FF");
                    }
                }); 
           }
        }
    }

    d3.select("[id=numOfSelectedArchs_inputBox]").attr("value",numOfSelectedArchs());  
}





var ARM_metric = ["Support","Lift","Confidence {feature}->{selection}","Confidence {selection}->{feature}"]

var xScale_df;
var yScale_df;
var xAxis_df;
var yAxis_df;
var dfbar_width;
          
function display_drivingFeatures(source,sortby) {

    var size = source.length;
    var drivingFeatures = [];
    var drivingFeatureNames = [];
    var drivingFeatureTypes = [];
    i_drivingFeatures=0;
    var sorting_metric = [];
    // Change the type of the variable into integer
    sortby =  + sortby;

    for (var i=0;i<size;i++){
        sorting_metric.push(source[i].metrics[sortby]);
        drivingFeatures.push(source[i]);
        if(source[i].preset===true){
            drivingFeatureNames.push(source[i].name);
            drivingFeatureTypes.push(source[i].type);
        } else{
            drivingFeatureNames.push(source[i].type);
            drivingFeatureTypes.push(source[i].name);
        }
    }

//                    InOrbit [orbit,inst1,inst2];

    var margin_df = {top: 20, right: 20, bottom: 10, left:65},
    width_df = 800 - 35 - margin_df.left - margin_df.right,
    height_df = 430 - 20 - margin_df.top - margin_df.bottom;

    xScale_df = d3.scale.linear()
            .range([0, width_df]);
    yScale_df = d3.scale.linear().range([height_df, 0]);
    xScale_df.domain([0,drivingFeatures.length-1]);
    
    
    // Save the minimum value of the metric (e.g. lift, support, confidence)
    var minval = d3.min(sorting_metric);
    yScale_df.domain([d3.min(sorting_metric), d3.max(sorting_metric)]);


    xAxis_df = d3.svg.axis()
            .scale(xScale_df)
            .orient("bottom")
            .tickFormat(function (d) { return ''; });
    yAxis_df = d3.svg.axis()
            .scale(yScale_df)
            .orient("left");

    var drivingFeaturesDisplayBox = d3.select("[id=drivingFeaturesAndSensitivityAnalysis_div]");

    d3.select("[id=basicInfoBox_div]").select("g").remove();
    var infoBox = d3.select("[id=basicInfoBox_div]")
            .append("g");



    var svg_df = infoBox.append("svg")
            .attr("width", width_df + margin_df.left + margin_df.right)
            .attr("height", height_df + margin_df.top + margin_df.bottom)
                .call(
                    d3.behavior.zoom()
                    .x(xScale_df)
                    .scaleExtent([1, 10])
                    .on("zoom", function (d) {

                        var svg = d3.select("[id=basicInfoBox_div]")
                                .select("svg");
                        var scale = d3.event.scale;

                        svg.select(".x.axis").call(xAxis_df);
                 
                        svg.selectAll("[class=bar]")
                                .attr("transform",function(d){
                                    var xCoord = xScale_df(d.id);
                                    return "translate(" + xCoord + "," + 0 + ")";
                                })
                                .attr("width", function(d){
                                    return dfbar_width*scale;
                                });

                        })
                    )
            .append("g")        
            .attr("transform", "translate(" + margin_df.left + "," + margin_df.top + ")");

    

////////////////////////////////////////////////////////
    // x-axis
    svg_df.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height_df + ")")
            .call(xAxis_df)
            .append("text")
            .attr("class", "label")
            .attr("x", width_df)
            .attr("y", -6)
            .style("text-anchor", "end");

    // y-axis
    svg_df.append("g")
            .attr("class", "y axis")
            .call(yAxis_df)
            .append("text")
            .attr("class","label")
            .attr("transform", "rotate(-90)")
            .attr("y",-60)
            .attr("x",-3)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text(function(d){
            	return ARM_metric[sortby];
            });

    var objects = svg_df.append("svg")
            .attr("class","dfbars_svg")
            .attr("width",width_df)
            .attr("height",height_df);

    //Create main 0,0 axis lines:
    objects.append("svg:line")
            .attr("class", "axisLine hAxisLine")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", width_df)
            .attr("y2", 0)
            .attr("transform", "translate(0," + (yScale_df(minval)) + ")");
    objects.append("svg:line")
            .attr("class", "axisLine vAxisLine")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", 0)
            .attr("y2", height_df)
            .attr("transform", "translate(" + (xScale_df(0)) + ",0)");
    /////////////////////////////////////////////////////////////////////////////////



    objects.selectAll(".bar")
            .data(drivingFeatures, function(d){return (d.id = i_drivingFeatures++);})
            .enter()
            .append("rect")
            .attr("class","bar")
            .attr("x", function(d) {
                return 0;
            })
            .attr("width", xScale_df(1))
            .attr("y", function(d) {
            	return yScale_df(+ d.metrics[sortby]);
            })
            .attr("height", function(d) { 
            	return height_df - yScale_df(+ d.metrics[sortby]);
            })
            .attr("transform",function(d){
                var xCoord = xScale_df(d.id);
                return "translate(" + xCoord + "," + 0 + ")";
            })
            .style("fill", function(d,i){return color_drivingFeatures(drivingFeatureTypes[i]);});
    dfbar_width = d3.select("[class=bar]").attr("width");

    var bars = d3.selectAll("[class=bar]")
   
                .on("mouseover",function(d){

                	numOfDrivingFeatureViewed = numOfDrivingFeatureViewed+1;
                	
                    var mouseLoc_x = d3.mouse(d3.select("[id=basicInfoBox_div]").select("[class=dfbars_svg]")[0][0])[0];
                    var mouseLoc_y = d3.mouse(d3.select("[id=basicInfoBox_div]").select("[class=dfbars_svg]")[0][0])[1];
                    var featureInfoLoc = {x:0,y:0};
                    var h_threshold = (width_df + margin_df.left + margin_df.right)*0.5;
                    var v_threshold = (height_df + margin_df.top + margin_df.bottom)*0.55;
                    var tooltip_width = 350;
                    var tooltip_height = 170;
                    if(mouseLoc_x >= h_threshold){
                        featureInfoLoc.x = -10 - tooltip_width;
                    } else{
                        featureInfoLoc.x = 10;
                    }
                    if(mouseLoc_y < v_threshold){
                        featureInfoLoc.y = 10;
                    } else{
                        featureInfoLoc.y = -10 -tooltip_height;
                    }
                    var svg_tmp = d3.select("[id=basicInfoBox_div]").select("[class=dfbars_svg]");
                    var featureInfoBox = svg_tmp.append("g")
                                                .attr("id","featureInfo_tooltip")
                                                .append("rect")
                                                .attr("id","featureInfo_box")
                                                .attr("transform", function(){
                                                    var x = mouseLoc_x + featureInfoLoc.x;
                                                    var y = mouseLoc_y + featureInfoLoc.y;
                                                    return "translate(" + x + "," + y + ")";
                                                })
                                                .attr("width",tooltip_width)
                                                .attr("height",tooltip_height)
                                                .style("fill","#4B4B4B")
                                                .style("opacity", 0.92);
                    var tmp= d.id;
                    var name = relabelDrivingFeatureName(d.name);
                    var type = d.type;
                    var metrics = d.metrics;

                    d3.selectAll("[class=bar]").filter(function(d){
                        if(d.id===tmp){
                            return true;
                        }else{
                            return false;
                        }
                    }).style("stroke-width",1.5)
                            .style("stroke","black");

                    if(type=="present" || type=="absent" || type=="inOrbit" ||type=="notInOrbit"||type=="together2"||
                    		type=="togetherInOrbit2"||type=="separate2"||type=="together3"||type=="togetherInOrbit3"||
                    		type=="separate3"||type=="emptyOrbit"||type=="numOrbits"){
                    	// Preset filter
                    	
                    	
                    	var type_modified;
                    	var filterInputs = [];
                    	
                    	if(type=="together2"||type=="together3"||type=="separate2"||type=="separate3"||
                    		type=="togetherInOrbit2"||type=="togetherInOrbit3"){
                    		type_modified = type.substring(0,type.length-1);
                    	}else{
                    		type_modified = type;
                    	}
                    	
                    	var arg = name.substring(name.indexOf("[")+1,name.indexOf("]"));
                            
                        	
                    	if(type_modified=="present" || type_modified=="absent" || type_modified=="emptyOrbit"
                    				|| type_modified=="numOrbits" || type_modified=="together" 
                    					|| type_modified=="separate"){
                    		filterInputs.push(arg);
                    	}else if(type_modified=="inOrbit" || type_modified=="notInOrbit" || 
                    											type_modified=="togetherInOrbit"){
                    		var first = arg.substring(0,arg.indexOf(","));
                    		var second = arg.substring(arg.indexOf(",")+1);
                    		filterInputs.push(first);
                    		filterInputs.push(second);
                    	} else{
                    		filterInputs.push(arg);
                    	}
                            
                    	
                        d3.selectAll("[class=dot]")[0].forEach(function (d) {
                        	var bitString = d.__data__.archBitString;
                    		if (presetFilter2(type_modified,bitString,filterInputs,false)){
                    			d3.select(d).attr("class", "dot_DFhighlighted")
                    						.style("fill", "#F75082");
                			}
                        });
                        d3.selectAll("[class=dot_clicked]")[0].forEach(function (d) {
                        	var bitString = d.__data__.archBitString;
                    		if (presetFilter2(type_modified,bitString,filterInputs,false)){
                    			d3.select(d).attr("class", "dot_selected_DFhighlighted")
                    						.style("fill", "#F75082");
                			}
                        });

                    }else{
                    		type_modified = type;
                            d3.selectAll("[class=dot]")[0].forEach(function (d) {
                            	var bitString = d.__data__.archBitString;
                        		if (applyUserDefFilterFromExpression(type_modified,bitString)){
                        			d3.select(d).attr("class", "dot_DFhighlighted")
                        						.style("fill", "#F75082");
                    			}
                            });
                            d3.selectAll("[class=dot_clicked]")[0].forEach(function (d) {
                            	var bitString = d.__data__.archBitString;
                        		if (applyUserDefFilterFromExpression(type_modified,bitString)){
                        			d3.select(d).attr("class", "dot_selected_DFhighlighted")
                        						.style("fill", "#F75082");
                    			}
                            });
                    }
                    

                    
                    var fo = d3.select("[id=basicInfoBox_div]").select("[class=dfbars_svg]")
                                    .append("g")
                                    .attr("id","foreignObject_tooltip")
                                    .append("foreignObject")
                                    .attr("x",function(){
                                        return mouseLoc_x + featureInfoLoc.x;
                                    })
                                    .attr("y",function(){
                                       return mouseLoc_y + featureInfoLoc.y; 
                                    })
                                    .attr({
                                        'width':tooltip_width,
                                        'height':tooltip_height  
                                    });
                                    
                    var fo_div = fo.append('xhtml:div')
                                            .attr({
                                                'class': 'tooltip'
                                            });
                    var textdiv = fo_div.selectAll("div")
                            .data([{name:name,metrics:metrics}])
                            .enter()
                            .append("div");
                          
//                    
                    textdiv.html(function(d){
                    	

                        var output= d.name + "<br> lift: " + d.metrics[1].toFixed(4) + "<br> support: " + d.metrics[0].toFixed(4) + 
                        "<br> conf {feature} -> {selection}: " + d.metrics[2].toFixed(4) + "<br> conf2 {selection} -> {feature}: " + d.metrics[3].toFixed(4) +
                        "";
                    	
                        return output;
                    }).style("color", "#F7FF55");                         

           

                })
                .on("mouseout",function(d){
                    d3.select("[id=basicInfoBox_div]").selectAll("[id=featureInfo_tooltip]").remove();
                    d3.select("[id=basicInfoBox_div]").selectAll("[id=foreignObject_tooltip]").remove();
                    var tmp= d.id;
                    d3.selectAll("[class=bar]").filter(function(d){
                           if(d.id===tmp){
                               return true;
                           }else{
                               return false;
                           }
                       }).style("stroke-width",0)
                               .style("stroke","black");
                    
                    var highlighted = d3.selectAll("[class=dot_DFhighlighted]");
                    highlighted.attr("class", "dot")
                            .style("fill", function (d) {
                                if (d.status == "added") {
                                    return "#188836";
                                } else if (d.status == "justAdded") {
                                    return "#20FE5B";
                                } else {
                                    return "#000000";
                                }
                            });     
                    d3.selectAll("[class=dot_selected_DFhighlighted]")
                    		.attr("class", "dot_clicked")
                            .style("fill","#0040FF");     
                    
                });


    

    // draw legend
    var legend_df = objects.selectAll(".legend")
                    .data(color_drivingFeatures.domain())
                    .enter().append("g")
                    .attr("class", "legend")
                    .attr("transform", function(d, i) { return "translate(0," + (i * 20) + ")"; });

        // draw legend colored rectangles
    legend_df.append("rect")
            .attr("x", 655)
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", color_drivingFeatures);

        // draw legend text
    legend_df.append("text")
            .attr("x", 655)
            .attr("y", 9)
            .attr("dy", ".35em")
            .style("text-anchor", "end")
            .text(function(d) { return d;});
    

    d3.select("[id=instrumentOptions]")
            .select("table").remove();
    
    d3.select("[id=dfsort_options]").on("change",dfsort);
}
                


function dfsort(){
    var sortby = d3.select("[id=dfsort_options]")[0][0].value;
    var sortedDrivingFeatures = sortDrivingFeatures(sortedDFs,sortby);
    sortedDFs=sortedDrivingFeatures;
    display_drivingFeatures(sortedDrivingFeatures,sortby);
}
                

function openFilterOptions(){
    d3.select("[id=basicInfoBox_div]").select("g").remove();
    d3.select("[id=instrumentOptions]").select("table").remove();
    display_filterOption();
    
    buttonClickCount_filterOptions += 1;
}
                
   
   

function presetFilter2(filterName,bitString,inputs,neg){
    var filterInput1;
    var filterInput2;
    var filterInput3;

    filterInput1 = inputs[0];
    if(inputs.length > 1){
        filterInput2 = inputs[1];
    }
    if(inputs.length > 2){
        filterInput3 = inputs[2];
    }

    var output;
    var leng = bitString.length;
    var norb = orbitList.length;
    var ninstr = instrList.length;

    if(filterName==="present"){
        filterInput1 = relabelback(filterInput1);
        var thisInstr = $.inArray(filterInput1,instrList);
        output = false;
        for(var i=0;i<orbitList.length;i++){
            if(bitString[ninstr*i+thisInstr]===true){
                output = true;
                break;
            }
        }
    } else if(filterName==="absent"){
        filterInput1 = relabelback(filterInput1);
        var thisInstr = $.inArray(filterInput1,instrList);
        output = true;
        for(var i=0;i<orbitList.length;i++){
            if(bitString[ninstr*i+thisInstr]===true){
                output = false;
                break;
            }
        }
    } else if(filterName==="inOrbit"){
        filterInput1 = relabelback(filterInput1);
        filterInput2 = relabelback(filterInput2);
        output = false;
        var thisOrbit = $.inArray(filterInput1,orbitList);
        var thisInstr = $.inArray(filterInput2,instrList);
            if(bitString[thisOrbit*ninstr + thisInstr]===true){
                output = true;
            }
    } else if(filterName==="notInOrbit"){
        filterInput1 = relabelback(filterInput1);
        filterInput2 = relabelback(filterInput2);
        output = true;
        var thisOrbit = $.inArray(filterInput1,orbitList);
        var thisInstr = $.inArray(filterInput2,instrList);
            if(bitString[thisOrbit*ninstr + thisInstr]===true){
                output = false;
            }
    } else if(filterName === "together"){
        output = false;
        var splitInstruments = filterInput1.split(",");
        var thisInstr1 = $.inArray(relabelback(splitInstruments[0]),instrList);
        var thisInstr2 = $.inArray(relabelback(splitInstruments[1]),instrList);
        var thisInstr3;
        if(splitInstruments.length===2){
            for(var i=0;i<norb;i++){
                if(bitString[i*ninstr + thisInstr1] === true && bitString[i*ninstr + thisInstr2] === true){
                    output = true;
                    break;
                }
            }
        } else {
            
            thisInstr3 = $.inArray(relabelback(splitInstruments[2]),instrList);
            for(var i=0;i<norb;i++){
                if(bitString[i*ninstr + thisInstr1] === true && bitString[i*ninstr + thisInstr2] === true
                        && bitString[i*ninstr + thisInstr3] === true){
                    output = true;
                    break;
                }
            }
        }
    } else if(filterName === "togetherInOrbit"){
        output = false;
        var thisOrbit =  $.inArray(relabelback(filterInput1),orbitList);
        var splitInstruments = filterInput2.split(",");
        var thisInstr1 = $.inArray(relabelback(splitInstruments[0]),instrList);
        var thisInstr2 = $.inArray(relabelback(splitInstruments[1]),instrList);
        var thisInstr3;
        if(splitInstruments.length===2){
            if(bitString[thisOrbit*ninstr + thisInstr1] === true && bitString[thisOrbit*ninstr + thisInstr2] === true){
                output = true;
            }
        } else {
            thisInstr3 = $.inArray(relabelback(splitInstruments[2]),instrList);
            if(bitString[thisOrbit*ninstr + thisInstr1] === true && bitString[thisOrbit*ninstr + thisInstr2] === true
                        && bitString[thisOrbit*ninstr + thisInstr3] === true){
                output = true;
            }
        }
    } else if(filterName ==="separate"){
        output = true;
        var splitInstruments = filterInput1.split(",");
        var thisInstr1 = $.inArray(relabelback(splitInstruments[0]),instrList);
        var thisInstr2 = $.inArray(relabelback(splitInstruments[1]),instrList);
        var thisInstr3;
        if(splitInstruments.length===2){
            for(var i=0;i<norb;i++){
                if(bitString[i*ninstr + thisInstr1] === true && bitString[i*ninstr + thisInstr2] === true){
                    output = false;
                    break;
                }
            }
        } else {
            thisInstr3 = $.inArray(relabelback(splitInstruments[2]),instrList);
            for(var i=0;i<norb;i++){
                if(bitString[i*ninstr + thisInstr1] === true && bitString[i*ninstr + thisInstr2] === true
                        && bitString[i*ninstr + thisInstr3] === true){
                    output = false;
                    break;
                }
            }
        }
    } else if(filterName ==="emptyOrbit"){
        var thisOrbit =  $.inArray(relabelback(filterInput1),orbitList);
        output = true;
        for(var i=0;i<ninstr;i++){
            if(bitString[thisOrbit*ninstr + i]===true){
                output=false;
                break;
            }
        }
    } else if(filterName ==="numOrbitUsed"){
        var numOrbits = filterInput1;
        var cnt = 0;
        for (var i=0;i<norb;i++){
            for (var j=0;j<ninstr;j++){
                if(bitString[i*ninstr+j]==true){
                    cnt++;
                    break;
                }
            }
        }
        if(cnt==numOrbits){
            output = true;
        } else{
            output= false;
        }
    } else if(filterName === "subsetOfInstruments"){ 
        var thisOrbit = $.inArray(relabelback(filterInput1),orbitList);
        var minmax = filterInput2.split(",");
        var instruments = filterInput3.split(",");

        var constraint = minmax.length;
        var numOfInstr = instruments.length;

        var min,max;
        if(constraint===1){ // only the minimum number of instruments is typed in
            min = minmax[0];
            max = 100;
        } else if(constraint===2){
            min = minmax[0];
            max = minmax[1];
        }

        var size = instruments.length;
        var cnt=0;

        for(var i=0;i<size;i++){ //var thisInstr1 = $.inArray(splitInstruments[0],instrList);
            var thisInstr = $.inArray(relabelback(instruments[i]),instrList);
            if(bitString[thisOrbit*ninstr + thisInstr]===true){
                cnt++;
            }
        }
        if(cnt <= max && cnt >= min){
            output = true;
        }else{
            output = false;
        }
    }

    return checkNeg(output,neg)
}


function checkNeg(original,neg){
	if(neg==false){
		return original;
	}else{
		return !original;
	}
}