/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */




function openFilterOptions(){
    
    buttonClickCount_filterOptions += 1;
    
    document.getElementById('tab2').click();
    d3.select("[id=basicInfoBox_div]").select("[id=view2]").select("g").remove();

    var archInfoBox = d3.select("[id=basicInfoBox_div]").select("[id=view2]").append("g");
    archInfoBox.append("div")
            .attr("id","filter_title")
            .append("p")
            .text("Filter Setting");

    var filterApplicationStatus = archInfoBox.append('div')
            .attr('id','filter_application_status');
    var filterOptions = archInfoBox.append("div")
            .attr("id","filter_options");
    var filterInputs = archInfoBox.append("div")
            .attr('id','filter_inputs');
    var filterAppendSlots = archInfoBox.append("div")
            .attr('id','filter_inputs_append_slots');
    var filterHints = archInfoBox.append('div')
            .attr('id','filter_hints');
    var filterButtons = archInfoBox.append('div')
            .attr('id','filter_buttons');
    
    var filterDropdownMenu = d3.select("#filter_options")
            .append("select")
            .attr('id','filter_options_dropdown_1')
            .attr("class","filter_options_dropdown");
    

    filterDropdownMenu.selectAll("option").remove();
    filterDropdownMenu.selectAll("option")
            .data(preset_filter_options)
            .enter()
            .append("option")
            .attr("value",function(d){
                return d.value;
            })
            .text(function(d){
                return d.text;
            });    
    
    d3.select("#filter_buttons").append("button")
            .attr("id","applyFilterButton_new")
            .attr("class","filter_options_button")
            .text("Apply new filter");
    d3.select("#filter_buttons").append("button")
            .attr("class","filter_options_button")
            .attr("id","applyFilterButton_add")
            .style("margin-left","6px")
            .style("float","left")
            .text("Add to selection");
    d3.select("#filter_buttons").append("button")
            .attr("id","applyFilterButton_within")
            .attr("class","filter_options_button")
            .text("Search within selection");

    d3.select("#filter_buttons").append("button")
            .attr("id","filter_application_saveAll")
            .attr("class","filter_options_button")
            .text("Save currently applied filter scheme")
            .attr('disabled', true);
    
    d3.select("#filter_options_dropdown_1").on("change",filter_options_dropdown_preset_filters);    

    d3.select("#applyFilterButton_add").on("click",function(d){
        applyFilter("add");
    });
    d3.select("#applyFilterButton_new").on("click",function(d){
        applyFilter("new");
    });
    d3.select("#applyFilterButton_within").on("click",function(d){
        applyFilter("within");
    });
    
    highlight_basic_info_box()
}


function remove_filter_option_inputs(level){
    
    d3.selectAll('.filter_inputs_div').remove(); 
    d3.selectAll('.filter_hints_div').remove();
    d3.select('#filter_application_saveAll')[0][0].disabled=true;
    
    d3.select('#filter_options_dropdown_4').remove();
    if(level==3){return;}
    d3.select('#filter_options_dropdown_3').remove();
    if(level==2){return;}        
    d3.select('#filter_options_dropdown_2').remove();
    if(level==1){return;}
}



function filter_options_dropdown_preset_filters(){
    
    remove_filter_option_inputs(2);
    var selectedOption = d3.select('#filter_options_dropdown_1')[0][0].value;
    
    if (selectedOption==="not_selected"){return;}
    else{
        filter_input_preset(selectedOption,false); 
        d3.select("[id=saveFilter]").attr('disabled', true);
    }
}

function filter_input_preset(selectedOption,userDefOption){

    var filter_inputs = d3.select("[id=filter_inputs]");

    if (selectedOption=="present"){
        append_filterInputField_singleInstInput();
        d3.select("#filter_hints")
                .append("div")
                .attr("id","filter_hints_div_1")
                .attr('class','filter_hints_div')
                .text("(Hint: Designs that have the specified instrument are selected)");
   
    }
    else if (selectedOption=="absent"){
        append_filterInputField_singleInstInput();
        d3.select("#filter_hints")
                .append("div")
                .attr("id","filter_hints_div_1")
                .attr('class','filter_hints_div')
                .text("(Hint: Designs that do not have the specified instrument are selected)");   
    }
    else if (selectedOption=="inOrbit"){
        append_filterInputField_orbitAndInstInput();
        d3.select("#filter_hints")
                .append("div")
                .attr("id","filter_hints_div_1")
                .attr('class','filter_hints_div')
                .text("(Hint: Designs that have the specified instrument inside the chosen orbit are selected)");
    }
    else if (selectedOption=="notInOrbit"){
        append_filterInputField_orbitAndInstInput();
        d3.select("#filter_hints")
                .append("div")
                .attr("id","filter_hints_div_1")
                .attr('class','filter_hints_div')
                .text("(Hint: Designs that do not have the specified instrument inside the chosen orbit are selected)");    
    }
    else if (selectedOption=="together"){
        append_filterInputField_multipleInstInput();
        d3.select("#filter_hints")
                .append("div")
                .attr("id","filter_hints_div_1")
                .attr('class','filter_hints_div')
                .text("(Hint: Designs that have the specified instruments in any one orbit are chosen)");    
    } 
    else if (selectedOption=="togetherInOrbit"){
        append_filterInputField_orbitAndMultipleInstInput();
        d3.select("#filter_hints")
                .append("div")
                .attr("id","filter_hints_div_1")
                .attr('class','filter_hints_div')
                .text("(Hint: Designs that have the specified instruments in the specified orbit are chosen)"); 
    } 
    else if (selectedOption=="separate"){
        append_filterInputField_multipleInstInput();
        d3.select("#filter_hints")
                .append("div")
                .attr("id","filter_hints_div_1")
                .attr('class','filter_hints_div')
                .text("(Hint: Designs that do not have the specified instruments in the same orbit are chosen)");    
    } 
    else if (selectedOption=="emptyOrbit"){
        append_filterInputField_orbitInput();
        d3.select("#filter_hints")
                .append("div")
                .attr("id","filter_hints_div_1")
                .attr('class','filter_hints_div')
                .text("(Hint: Designs that have no instrument inside the specified orbit are chosen)");       
    } 
    else if (selectedOption=="numOrbits"){
        append_filterInputField_numOrbitInput();
        d3.select("#filter_hints")
                .append("div")
                .attr("id","filter_hints_div_1")
                .attr('class','filter_hints_div')
                .text("(Hint: Designs that have the specified number of non-empty orbits are chosen)");      
    } 
    else if (selectedOption=="numOfInstruments"){
    	append_filterInputField_numOfInstruments();
        d3.select("#filter_hints")
                .append("div")
                .attr("id","filter_hints_div_1")
                .attr('class','filter_hints_div')
                .text("(Hint: This highlights all the designs with the specified number of instruments. If you specify an orbit name, it will count all instruments in that orbit. If you can also specify an instrument name, and only those instruments will be counted across all orbits. If you leave both instruments and orbits blank, all instruments across all orbits will be counted.)"); 
    } 
    
    else if(selectedOption=="subsetOfInstruments"){
        append_filterInputField_subsetOfInstruments();
        d3.select("#filter_hints")
                .append("div")
                .attr("id","filter_hints_div_1")
                .attr('class','filter_hints_div')
                .text("(Hint: The specified orbit should contain at least m number and at maximum M number of instruments from the specified instrument set. m is the first entry and M is the second entry in the second field)");  
    } else if(selectedOption=="defineNewFilter"){
    	
    } else if(selectedOption=="paretoFront"){
        d3.select('#filter_inputs')
	        .append("div")
	        .attr("id","filter_inputs_div_1")
	        .attr('class','filter_inputs_div')
	        .text("Input Pareto Ranking (Integer number between 0-15): ")
	        .append("input")
	        .attr("class","filter_inputs_textbox")
	        .attr("type","text");
    }else{
    

    }  
    
    d3.select("#filter_hints")
        .append("div")
        .attr("id","filter_hints_div_2")
        .attr('class','filter_hints_div')
        .html('<p>Valid orbit names: 1000, 2000, 3000, 4000, 5000</p>'
                        +'Valid instrument names: A, B, C, D, E, F, G, H, I, J, K, L');      
}



function append_filterInputField_singleInstInput(){
    d3.select("#filter_inputs")
            .append("div")
            .attr("id","filter_inputs_div_1")
            .attr('class','filter_inputs_div')
            .append('div')
            .attr('class','filter_inputs_supporting_comments_begin')
            .text("Input single instrument name: ");
    d3.select('#filter_inputs_div_1')
            .append("input")
            .attr("class","filter_inputs_textbox")  
            .attr("type","text");
}


function append_filterInputField_orbitInput(){
    d3.select('#filter_inputs')
            .append("div")
            .attr("id","filter_inputs_div_1")
            .attr('class','filter_inputs_div')
            .append('div')
            .attr('class','filter_inputs_supporting_comments_begin')
            .text("Input orbit name");
    d3.select('#filter_inputs_div_1')
            .append("input")
            .attr("class","filter_inputs_textbox")
            .attr("type","text");
}
function append_filterInputField_orbitAndInstInput(){

        d3.select('#filter_inputs')
            .append("div")
            .attr("id","filter_inputs_div_1")
            .attr('class','filter_inputs_div')
            .append('div')
            .attr('class','filter_inputs_supporting_comments_begin')
            .text("Input orbit name: ");
        d3.select('#filter_inputs_div_1')
            .append("input")
            .attr("class","filter_inputs_textbox")
            .attr("type","text");

        d3.select('#filter_inputs')
            .append("div")
            .attr("id","filter_inputs_div_2")
            .attr('class','filter_inputs_div')
            .append('div')
            .attr('class','filter_inputs_supporting_comments_begin')
            .text("Input single instrument name: ");
        d3.select('#filter_inputs_div_2')
            .append("input")
            .attr("class","filter_inputs_textbox")
            .attr("type","text");
    
}
function append_filterInputField_multipleInstInput(){
        d3.select('#filter_inputs')
            .append("div")
            .attr("id","filter_inputs_div_1")
            .attr('class','filter_inputs_div')
            .append('div')
            .attr('class','filter_inputs_supporting_comments_begin')
            .text("Input instrument names (2 or 3) separated by comma:");
        d3.select('#filter_inputs_div_1')
            .append("input")
            .attr("class","filter_inputs_textbox")
            .attr("type","text");
}
function append_filterInputField_orbitAndMultipleInstInput(){
        d3.select('#filter_inputs')
            .append("div")
            .attr('id','filter_inputs_div_1')
            .attr('class','filter_inputs_div')
            .append('div')
            .attr('class','filter_inputs_supporting_comments_begin')
            .text("Input orbit name: ");
        d3.select('#filter_inputs_div_1')
            .append("input")
            .attr("class","filter_inputs_textbox")
            .attr("type","text");

        d3.select('#filter_inputs')
            .append("div")
            .attr("id","filter_inputs_div_2")
            .attr('class','filter_inputs_div')
            .append('div')
            .attr('class','filter_inputs_supporting_comments_begin')
            .text("Input instrument names (2 or 3) separated by comma: ");
        d3.select('#filter_inputs_div_2')
            .append("input")
            .attr("class","filter_inputs_textbox")
            .attr("type","text");
}


function append_filterInputField_numOfInstruments(){
    d3.select('#filter_inputs')
            .append("div")
            .attr("id","filter_inputs_div_1")
            .attr('class','filter_inputs_div')
            .append('div')
            .attr('class','filter_inputs_supporting_comments_begin')
            .text("Input an orbit name (Could be N/A): ");
    d3.select('#filter_inputs_div_1')
            .append("input")
            .attr("class","filter_inputs_textbox")
            .attr("type","text")
            .attr("value","N/A");    
    
    d3.select('#filter_inputs')
            .append("div")
            .attr("id","filter_inputs_div_2")
            .attr('class','filter_inputs_div')
            .append('div')
            .attr('class','filter_inputs_supporting_comments_begin')
            .text("Input instrument name (Could be N/A): ");
    d3.select('#filter_inputs_div_2')
            .append("input")
            .attr("class","filter_inputs_textbox")
            .attr("type","text")
            .attr("value","N/A");

    d3.select('#filter_inputs').append("div")
            .attr("id","filter_inputs_div_3")
            .attr('class','filter_inputs_div')
            .append('div')
            .attr('class','filter_inputs_supporting_comments_begin')
	    .text("Input a number of instrument used (should be greater than or equal to 0): ");
    d3.select('#filter_inputs_div_3')
            .append("input")
            .attr('class',"filter_inputs_textbox")
            .attr("type","text");
}
function append_filterInputField_numOrbitInput(){
        d3.select('#filter_inputs')
                .append("div")
                .attr("id","filter_inputs_div_1")
                .attr('class','filter_inputs_div')
                .append('div')
                .attr('class','filter_inputs_supporting_comments_begin')
                .text("Input number of orbits");
        d3.select('#filter_inputs_div_1')
                .append("input")
                .attr("class","filter_inputs_textbox")
                .attr("type","text");
}
function append_filterInputField_subsetOfInstruments(){
        d3.select('#filter_inputs')
                .append("div")
                .attr("id","filter_inputs_div_1")
                .attr('class','filter_inputs_div')
                .append('div')
                .attr('class','filter_inputs_supporting_comments_begin')
                .text("Input orbit name: ");
        d3.select('#filter_inputs_div_1')
                .append("input")
                .attr("class","filter_inputs_textbox")
                .attr("type","text");

        d3.select('#filter_inputs')
                .append("div")
                .attr("id","filter_inputs_div_2")
                .attr('class','filter_inputs_div')
                .append('div')
                .attr('class','filter_inputs_supporting_comments_begin')
                .text("Input the min and the max (optional) number of instruments in the subset, separated by comma: ");
        d3.select('#filter_inputs_div_2')
                .append("input")
                .attr("class","filter_inputs_textbox")
                .attr("type","text");

        d3.select('#filter_inputs')
                .append("div")
                .attr("id","filter_inputs_div_3")
                .attr('class','filter_inputs_div')
                .append('div')
                .attr('class','filter_inputs_supporting_comments_begin')
                .text("Input a set of instrument names, separated by comma: ");
        d3.select('#filter_inputs_div_3')
                .append("input")
                .attr("class","filter_inputs_textbox")
                .attr("type","text");
}


function get_number_of_inputs(){
    return d3.selectAll('.filter_inputs_div')[0].length;
}




function processFilterExpression(expression,bitString){
	if(expression.indexOf("&&")>=0){
		var filters = expression.split("&&");
		for(var i=0;i<filters.length;i++){
			if(!applyPresetFilter(filters[i],bitString)) return false;
		}
		return true;
	}else{
		return applyPresetFilter(expression,bitString);
	}
}

             

function applyPresetFilter(expression,bitString){
	// Preset filter: {presetName[orbits;instruments;numbers]}   
	expression = expression.substring(1,expression.length-1);
	var type = expression.split("[")[0];
	var condition = expression.substring(0,expression.length-1).split("[")[1];
	var condSplit = condition.split(";");
	var orbit, instr, numb;
	if(condSplit[0].length > 0){
		orbit = +condSplit[0];
	}else{
		orbit = condSplit[0];
	}
	if(condSplit[1].length > 0){
		if(condSplit[1].indexOf(",")==-1){
			instr = +condSplit[1];
		}else{
			instr = condSplit[1];
		}
	}else{
		instr = condSplit[1];
	}
	if(condSplit[2].length > 0){
		numb = +condSplit[2];
	}else{
		numb = condSplit[2];
	}

	
	switch(type) {
    case "present":
    	
        for(var i=0;i<norb;i++){
            if(bitString[ninstr*i+instr]===true){
                return true;
            }
        }
        return false;
        break;
    case "absent":
        for(var i=0;i<norb;i++){
            if(bitString[ninstr*i+instr]===true){
                return false;
            }
        }
        return true;
        break;
    case "inOrbit":
        if(bitString[orbit*ninstr + instr]===true){
        	return true;
        }
        return false;
        break;
    case "notInOrbit":
        if(bitString[orbit*ninstr + instr]===true){
        	return false;
        }
        return true;
        break;
    case "together":
    	var instruments = instr.split(",");
    	for(var i=0;i<norb;i++){
    		var found = true;
    		for(var j=0;j<instruments.length;j++){
    			var temp = +instruments[j];
    			if(bitString[i*ninstr+temp]===false){
    				found=false;
    			}
    		}
    		if(found===true){
    			return true;
    		}
    	}
    	return false;
        break;

    case "togetherInOrbit":
    	var instruments = instr.split(",");
		for(var j=0;j<instruments.length;j++){
			var temp = +instruments[j];
			if(bitString[orbit*ninstr + temp]===false){
				return false;
			}
		}
		return true;
        break;

    case "separate":
    	var instruments = instr.split(",");
    	for(var i=0;i<norb;i++){
    		var together = true;
    		for(var j=0;j<instruments.length;j++){
    			var temp = +instruments[j];
    			if(bitString[j*ninstr+temp]===false){
    				together=false;
    			}
    		}
    		if(together===true){
    			return false;
    		}
    	}
    	return true;
        break;

    case "emptyOrbit":
    	for(var i=0;i<ninstr;i++){
    		if(bitString[orbit*ninstr+i]===true){
    			return false;
    		}
    	}
    	return true;
        break;

    case "numOrbits":
    	var count=0;
    	for(var i=0;i<norb;i++){
    		for(var j=0;j<ninstr;j++){
    			if(bitString[i*ninstr+j]===true){
    				count++;
    				break;
    			}
    		}
    	}
    	if(numb===count){
    		return true;
    	}
    	return false;
        break;

    case "numOfInstruments":
    	var count=0;
    	if(orbit===""){
			// num of instruments across all orbits
    		if(instr===""){
    			// num of specified instrument
    			for(var i=0;i<norb;i++){
    				for(var j=0;j<ninstr;j++){
    					if(bitString[i*ninstr+j]===true) count++;
    				}
    			}
    		}else{
    			// num of all instruments
    			for(var i=0;i<norb;i++){
    				if(bitString[i*ninstr+instr]===true){
    					count++;
    				}
    			}
    		}
    	}else{
    		// number of instruments in a specified orbit
    		for(var i=0;i<ninstr;i++){
    			if(bitString[orbit*ninstr+i]===true){
    				count++;
    			}
    		}
    	}
		if(count===numb) return true;
		return false;
        break;
    	
    default:
    	return false;
	}
	 
	
}
   
   
   















function applyFilter(option){
    buttonClickCount_applyFilter += 1;
    
    var wrong_arg = false;
    
    var filterExpression;
    var preset = false;
    var matchedArchIDs = null;

    var dropdown1 = d3.select("#filter_options_dropdown_1")[0][0].value;
    var dropdown2 = null;
    var dropdown3 = null;
    var dropdown4 = null;
    

    if(d3.select('#filter_options_dropdown_2')[0][0]!==null){
        dropdown2 = d3.select('#filter_options_dropdown_2')[0][0].value;
    }
    if(d3.select('#filter_options_dropdown_3')[0][0]!==null){
        dropdown3 = d3.select('#filter_options_dropdown_3')[0][0].value;
    }
    if(d3.select('#filter_options_dropdown_4')[0][0]!==null){
        dropdown4 = d3.select('#filter_options_dropdown_4')[0][0].value;
    }    
    
    var numInputs = get_number_of_inputs();
    var input_textbox = [];
    var input_select = [];
    var inputObj =  d3.selectAll('.filter_inputs_div')[0];
    
    inputObj.forEach(function(d,i){
        var textboxObj = d3.select(d).select('.filter_inputs_textbox')[0][0];
        var selectObj = d3.select(d).select('.filter_inputs_select')[0][0];
        if(textboxObj!==null){
            input_textbox.push(textboxObj.value);
        }else{
            input_textbox.push(null);
        }
        if(selectObj!==null){
            input_select.push(selectObj.value);
        }else{
            input_select.push(null);
        }
    })


    
    // Example of an filter expression: {presetName[orbits;instruments;numbers]} 
    var presetFilter = dropdown1;
    if(presetFilter=="present" || presetFilter=="absent" || presetFilter=="together" || presetFilter=="separate"){
        var instrument = input_textbox[0];
        filterExpression = presetFilter + "[;" + ActualName2Index(instrument,"instrument") + ";]";
    }else if(presetFilter == "inOrbit" || presetFilter == "notInOrbit" || presetFilter=="togetherInOrbit"){
        var orbit = input_textbox[0];
        var instrument = input_textbox[1];
        filterExpression = presetFilter + "["+ ActualName2Index(orbit,"orbit") + ";" + ActualName2Index(instrument,"instrument")+ ";]";
    }else if(presetFilter =="emptyOrbit"){
        var orbit = input_textbox[0];
        filterExpression = presetFilter + "[" + ActualName2Index(orbit,"orbit") + ";;]";
    }else if(presetFilter=="numOrbits"){
        var number = input_textbox[0];
        filterExpression = presetFilter + "[;;" + number + "]";
    }else if(presetFilter=="subsetOfInstruments"){
        // To be implemented
    }else if(presetFilter=="numOfInstruments"){
        var orbit = input_textbox[0];
        var instrument = input_textbox[1];
        var number = input_textbox[2];
        // There are 3 possibilities
        
        var orbitEmpty = false; 
        var instrumentEmpty = false;
        
        if(orbit=="N/A" || orbit.length==0){
            orbitEmpty=true;
        }
        if(instrument=="N/A" || instrument.length==0){
            instrumentEmpty = true;
        }
        if(orbitEmpty && instrumentEmpty){
            // Count all instruments across all orbits
            filterExpression=presetFilter + "[;;" + number + "]";
        }else if(orbitEmpty){
            // Count the number of specified instrument
            filterExpression=presetFilter + "[;" + ActualName2Index(instrument,"instrument") + ";" + number + "]";
        }else if(instrumentEmpty){
            // Count the number of instruments in an orbit
            filterExpression=presetFilter + "[" + ActualName2Index(orbit,"orbit") + ";;" + number + "]";
        }
    }
    else if(dropdown1==="paretoFront"){
        // To be implemented    
        var matchedArchIDs = [];
        var filterInput = d3.select("#filter_inputs_div_1").select('.filter_inputs_textbox')[0][0].value;
        d3.selectAll(".dot")[0].forEach(function (d) {
            var rank = parseInt(d3.select(d).attr("paretoRank"));
            if (rank <= +filterInput && rank >= 0){
                d3.select(d).attr('class','dot_highlighted')
                	.style("fill", "#20DCCC");
            }
        });  
        d3.selectAll(".dot_highlighted")[0].forEach(function (d) {
            var rank = parseInt(d3.select(d).attr("paretoRank"));
            if (rank <= +filterInput && rank >= 0){
                d3.select(d).attr('class','dot_highlighted')
                	.style("fill", "#20DCCC");
            }
        });  
    }
    else{// not selected
        return;
    }
    filterExpression = "{" + filterExpression + "}";


    if(option==="new"){
        cancelDotSelections();
        d3.selectAll('.dot')[0].forEach(function(d){
            var bitString = d.__data__.bitString;
            if(applyPresetFilter(filterExpression,bitString)){
                d3.select(d).attr('class','dot_highlighted')
                            .style("fill", "#20DCCC");
            }
        });
    }else if(option==="add"){
        d3.selectAll('.dot')[0].forEach(function(d){
            var bitString = d.__data__.bitString;
            if(applyPresetFilter(filterExpression,bitString)){
                d3.select(d).attr('class','dot_highlighted')
                            .style("fill", "#20DCCC");
            }
        });
    }else if(option==="within"){
        d3.selectAll('.dot_highlighted')[0].forEach(function(d){
            var bitString = d.__data__.bitString;
            if(applyPresetFilter(filterExpression,bitString)){
                d3.select(d).attr('class','dot')
                .style("fill", function (d) {return "#000000";});   
            }
        });     
    }


    if(wrong_arg){
    	alert("Invalid input argument");
    }
    d3.select("[id=numOfSelectedArchs_inputBox]").text("" + numOfSelectedArchs());  
    d3.select("#filter_application_saveAll")[0][0].disabled = false;
    d3.select('#filter_application_saveAll')
            .on('click',function(d){
                save_user_defined_filter(null);
            });
}





function applyComplexFilter(){
    var filterExpression = parse_filter_application_status();
    if(filterExpression===""){
        cancelDotSelections();
        return;
    }
    
    var matchedArchIDs=null;
    for(var i=0;i<processed_features.length;i++){
        if(processed_features[i].expression===filterExpression){
            matchedArchIDs = processed_features[i].matchedArchIDs;
        }
    }
    if(matchedArchIDs===null){
        $.ajax({
            url: "DrivingFeatureServlet",
            type: "POST",
            data: {ID: "applyComplexFilter",filterExpression:filterExpression},
            async: false,
            success: function (data, textStatus, jqXHR)
            {
                matchedArchIDs = JSON.parse(data);
            },
            error: function (jqXHR, textStatus, errorThrown)
            {alert("Error in applying the filter");}
        });
        processed_features.push({expression:filterExpression,matchedArchIDs:matchedArchIDs});
    }        

    
    cancelDotSelections();
    d3.selectAll('.dot')[0].forEach(function(d){
        var id = d.__data__.ArchID;
        if($.inArray(id,matchedArchIDs)!==-1){
            d3.select(d).attr('class','dot_highlighted')
                        .style("fill", "#20DCCC");
        }
    });  
    d3.select("[id=numOfSelectedArchs_inputBox]").text("" + numOfSelectedArchs());  
}




function save_user_defined_filter(expression){
    if(expression){
        if(expression.substring(0,1)!=="{"){
            expression = "{" + expression + "}";
        }
        userdef_features.push(expression);
    }else{
        var filterExpression = parse_filter_application_status();        
        userdef_features.push(filterExpression);
    }
}










///////////////
////

//
//
//
//function display_filterOption(){
//	
//	document.getElementById('tab2').click();
//
//    d3.select("[id=basicInfoBox_div]").select("[id=view2]").select("g").remove();
//
//    var archInfoBox = d3.select("[id=basicInfoBox_div]").select("[id=view2]").append("g");
//    archInfoBox.append("div")
//            .attr("id","filter_title")
//            .style("width","90%")
//            .style("margin-top","10px")
//            .style("margin-bottom","15px")
//            .style("margin-left","2px")
//            .style("float","left")
//            .append("p")
//            .text("Filter Setting")
//            .style("font-size", "18px");
//    var filterOptions = archInfoBox.append("div")
//            .attr("id","filter_options")
//            .style("width","100%")
//            .style("height","40px")
//            .style("float","left")
//            .style("margin-bottom","10px");
//
//    var filterDropdownMenu = d3.select("[id=filter_options]")
//            .append("select")
//            .attr("id","dropdown_presetFilters")
//            .style("width","200px")
//            .style("float","left")
//            .style("margin-left","2px")
//            .style("height","24px");
//
//    filterDropdownMenu.selectAll("option").remove();
//    filterDropdownMenu.selectAll("option")
//            .data(filterDropdownOptions)
//            .enter()
//            .append("option")
//            .attr("value",function(d){
//                return d.value;
//            })
//            .text(function(d){
//                return d.text;
//            });
//
//    d3.select("[id=filter_options]").append("button")
//            .attr("id","applyFilterButton_new")
//            .attr("class","filterOptionButtons")
//            .style("margin-left","6px")
//            .style("float","left")
//            .text("Apply new filter");
//    d3.select("[id=filter_options]").append("button")
//            .attr("class","filterOptionButtons")
//            .attr("id","applyFilterButton_add")
//            .style("margin-left","6px")
//            .style("float","left")
//            .text("Add to selection");
//    d3.select("[id=filter_options]").append("button")
//            .attr("id","applyFilterButton_within")
//            .attr("class","filterOptionButtons")
//            .style("margin-left","6px")
//            .style("float","left")
//            .text("Search within selection");
////    d3.select("[id=filter_options]").append("button")
////		    .attr("id","applyFilterButton_complement")
////		    .attr("class","filterOptionButtons")
////		    .style("margin-left","6px")
////		    .style("float","left")
////		    .text("Select complement");
//    d3.select("[id=filter_options]").append("button")
//            .attr("id","saveFilter")
//            .attr("class","filterOptionButtons")
//            .style("margin-left","6px")
//            .style("float","left")
//            .text("Save this filter")
//            .attr('disabled', true);
//
//    d3.select("[id=filter_options]").select("select").on("change",selectFilterOption);
//    
//    d3.select("#applyFilterButton_add").on("click",function(d){
//        applyFilter("add");
//    });
//    d3.select("#applyFilterButton_new").on("click",function(d){
//        applyFilter("new");
//    });
//    d3.select("#applyFilterButton_within").on("click",function(d){
//        applyFilter("within");
//    });    
//    
//    
////    d3.select("[id=applyFilterButton_complement]").on("click",applyFilter_complement);
//    
//    highlight_basic_info_box()
//}
//
//
//
//function selectFilterOption(){
//
//    var archInfoBox = d3.select("[id=basicInfoBox_div]").select("[id=view2]").select("g");
//
//    archInfoBox.select("[id=filter_inputs]").remove();
//
//    var filterDropdownMenu = d3.select("[id=dropdown_presetFilters]");
//    var selectedOption = filterDropdownMenu[0][0].value;
//
//    var filterInput = archInfoBox.append("div")
//                .attr("id","filter_inputs");
//
//    if (selectedOption==="defineNewFilter"){
//
//        filterInput.append("div")
//                .attr("id","newFilterDesignOptions")
//                .text("Select preset filter to add: ");
//
//        filterInput.select("[id=newFilterDesignOptions]")
//                .append("select")
//                .attr("id","dropdown_newFilterOption")
//                .style("width","200px")
////                                .style("float","left")
//                .style("margin-left","2px")
//                .style("height","24px");
//
//        var newFilterOptionDropdown = d3.select("[id=dropdown_newFilterOption]");
//
//        newFilterOptionDropdown.selectAll("option").remove();
//
//        var filterDropdownOptions_withoutUserDef = [];
//        for(var i=0;i<filterDropdownOptions.length;i++){
//            if(filterDropdownOptions[i].value!=="defineNewFilter"){
//                filterDropdownOptions_withoutUserDef.push(filterDropdownOptions[i]);
//            }
//        }
//
//        newFilterOptionDropdown.selectAll("option")
//                .data(filterDropdownOptions_withoutUserDef)
//                .enter()
//                .append("option")
//                .attr("value",function(d){
//                    return d.value;
//                })
//                .text(function(d){
//                    return d.text;
//                });
//
//        var filterDescription = filterInput.append("div")
//                    .attr("id","userDefinedFilter_name_div")
//                    .style("width","100%")
//                    .style("float","left")
//                    .style("margin-top","15px");
//        filterDescription.append("div")
//                .text("Filter name: ")
//                .style("float","left");
//        filterDescription.append("input")
//                    .attr("id","userDefinedFilter_name")
//                    .attr("type","text")
//                    .style("width","450px")
//                    .style("float","left")
//                    .style("margin-left","5px")
//                    .style("margin-right","10px");
//
//        var filterExpression = filterInput.append("div")
//                    .attr("id","filter_expression_div")
//                    .style("width","100%")
//                    .style("float","left")
//                    .style("margin-top","15px")
//                    .style("margin-bottom","5px");
//        filterExpression.append("div")
//                .text("Filter expression: ")
//                .style("float","left");
//        filterExpression.append("div")
//                    .attr("id","filter_expression");
//
//        userDefFilterExpressionHistory.length=0;
//        d3.select("[id=dropdown_newFilterOption]").on("change",selectNewFilterOption); 
//
//
//    } else if(selectedOption==="not_selected"){
//        
//    }else{
//        selectFilterOption_filterInput(selectedOption,false); 
//        d3.select("[id=saveFilter]").attr('disabled', true);
//    }
//
//}
//
//
//function selectFilterOption_filterInput(selectedOption,userDefOption){
//
//	
//        d3.select("[id=filter_inputs]")
//                .select("[id=filter_explanation]").remove();
//
//    var filterInput = d3.select("[id=filter_inputs]");
//    if(selectedOption=="not_selected"){
//    }
//    else if(selectedOption=="paretoFront"){
//
//        filterInput.append("div")
//                .attr("id","filter_input1")
//                .text("Input Pareto Ranking (Integer number between 0-15): ");
//
//        filterInput.select("[id=filter_input1]")
//                .append("input")
//                .attr("id","filter_input1_textBox")
//                .attr("type","text");
//    }
//    else if (selectedOption=="present"){
//        filterInputField_singleInstInput();
//        d3.select("[id=filter_inputs]")
//                .append("div")
//                .attr("id","filter_explanation")
//                .style("margin-top","15px")
//                .style("margin-left","10px")
//                .text("(Hint: This selects all designs that use the specified instrument)")
//                .style("color", "#696969");   
//        d3.select("[id=filter_inputs]")
//        .append("div")
//        .attr("id","filter_explanation_valid_inputs")
//        .style("margin-top","15px")
//        .style("margin-left","10px")
//        .style("color", "#696969")
//        .html('<p>Valid orbit names: 1000, 2000, 3000, 4000, 5000</p>'
//        		+'Valid instrument names: A, B, C, D, E, F, G, H, I, J, K, L');     
//    }
//    else if (selectedOption=="absent"){
//        filterInputField_singleInstInput();
//        d3.select("[id=filter_inputs]")
//                .append("div")
//                .attr("id","filter_explanation")
//                .style("margin-top","15px")
//                .style("margin-left","10px")
//                .text("(Hint: This selects all designs that does not use the specified instrument)")
//                .style("color", "#696969");   
//        d3.select("[id=filter_inputs]")
//        .append("div")
//        .attr("id","filter_explanation_valid_inputs")
//        .style("margin-top","15px")
//        .style("margin-left","10px")
//        .style("color", "#696969")
//        .html('<p>Valid orbit names: 1000, 2000, 3000, 4000, 5000</p>'
//        		+'Valid instrument names: A, B, C, D, E, F, G, H, I, J, K, L');     
//    }
//    else if (selectedOption=="inOrbit"){
//        filterInputField_orbitAndInstInput();
//        d3.select("[id=filter_inputs]")
//                .append("div")
//                .attr("id","filter_explanation")
//                .style("margin-top","15px")
//                .style("margin-left","10px")
//                .text("(Hint: This selects all designs that assign the given instrument to the given orbit)")
//                .style("color", "#696969");   
//        d3.select("[id=filter_inputs]")
//        .append("div")
//        .attr("id","filter_explanation_valid_inputs")
//        .style("margin-top","15px")
//        .style("margin-left","10px")
//        .style("color", "#696969")
//        .html('<p>Valid orbit names: 1000, 2000, 3000, 4000, 5000</p>'
//        		+'Valid instrument names: A, B, C, D, E, F, G, H, I, J, K, L');     
//    }
//    else if (selectedOption=="notInOrbit"){
//        filterInputField_orbitAndInstInput();
//        d3.select("[id=filter_inputs]")
//                .append("div")
//                .attr("id","filter_explanation")
//                .style("margin-top","15px")
//                .style("margin-left","10px")
//                .text("(Hint: This selects all designs that do not assign the given instrument to the given orbit)")
//                .style("color", "#696969");   
//        d3.select("[id=filter_inputs]")
//        .append("div")
//        .attr("id","filter_explanation_valid_inputs")
//        .style("margin-top","15px")
//        .style("margin-left","10px")
//        .style("color", "#696969")
//        .html('<p>Valid orbit names: 1000, 2000, 3000, 4000, 5000</p>'
//        		+'Valid instrument names: A, B, C, D, E, F, G, H, I, J, K, L');     
//    }
//    else if (selectedOption=="together"){
//        filterInputField_multipleInstInput();
//        d3.select("[id=filter_inputs]")
//                .append("div")
//                .attr("id","filter_explanation")
//                .style("margin-top","15px")
//                .style("margin-left","10px")
//                .text("(Hint: This selects all designs that assign all specified instruments in the same orbit)")
//                .style("color", "#696969");   
//        d3.select("[id=filter_inputs]")
//        .append("div")
//        .attr("id","filter_explanation_valid_inputs")
//        .style("margin-top","15px")
//        .style("margin-left","10px")
//        .style("color", "#696969")
//        .html('<p>Valid orbit names: 1000, 2000, 3000, 4000, 5000</p>'
//        		+'Valid instrument names: A, B, C, D, E, F, G, H, I, J, K, L');     
//    } 
//    else if (selectedOption=="togetherInOrbit"){
//        filterInputField_orbitAndMultipleInstInput();
//        d3.select("[id=filter_inputs]")
//                .append("div")
//                .attr("id","filter_explanation")
//                .style("margin-top","15px")
//                .style("margin-left","10px")
//                .text("(Hint: This selects all designs that assign all specified instruments in the given orbit)")
//                .style("color", "#696969");   
//        d3.select("[id=filter_inputs]")
//        .append("div")
//        .attr("id","filter_explanation_valid_inputs")
//        .style("margin-top","15px")
//        .style("margin-left","10px")
//        .style("color", "#696969")
//        .html('<p>Valid orbit names: 1000, 2000, 3000, 4000, 5000</p>'
//        		+'Valid instrument names: A, B, C, D, E, F, G, H, I, J, K, L');     
//    } 
//    else if (selectedOption=="separate"){
//        filterInputField_multipleInstInput();
//        d3.select("[id=filter_inputs]")
//                .append("div")
//                .attr("id","filter_explanation")
//                .style("margin-top","15px")
//                .style("margin-left","10px")
//                .text("(Hint: This selects all designs that do not assign all of the specified instruments in the same orbit)")
//                .style("color", "#696969");   
//        d3.select("[id=filter_inputs]")
//        .append("div")
//        .attr("id","filter_explanation_valid_inputs")
//        .style("margin-top","15px")
//        .style("margin-left","10px")
//        .style("color", "#696969")
//        .html('<p>Valid orbit names: 1000, 2000, 3000, 4000, 5000</p>'
//        		+'Valid instrument names: A, B, C, D, E, F, G, H, I, J, K, L');     
//    } 
//    else if (selectedOption=="emptyOrbit"){
//        filterInputField_orbitInput();
//        d3.select("[id=filter_inputs]")
//                .append("div")
//                .attr("id","filter_explanation")
//                .style("margin-top","15px")
//                .style("margin-left","10px")
//                .text("(Hint: This selects all designs that do not assign any instrument to the specified orbit)")
//                .style("color", "#696969");   
//        d3.select("[id=filter_inputs]")
//	        .append("div")
//	        .attr("id","filter_explanation_valid_inputs")
//	        .style("margin-top","15px")
//	        .style("margin-left","10px")
//	        .style("color", "#696969")
//	        .html('<p>Valid orbit names: 1000, 2000, 3000, 4000, 5000</p>'
//	        		+'Valid instrument names: A, B, C, D, E, F, G, H, I, J, K, L');         
//    } 
//    else if (selectedOption=="numOrbitUsed"){
//        filterInputField_numOrbitInput();
//        d3.select("[id=filter_inputs]")
//                .append("div")
//                .attr("id","filter_explanation")
//                .style("margin-top","15px")
//                .style("margin-left","10px")
//                .text("(Hint: This selects all designs that have the specified number of non-empty orbits)")
//                .style("color", "#696969");  
//        d3.select("[id=filter_inputs]")
//		        .append("div")
//		        .attr("id","filter_explanation_valid_inputs")
//		        .style("margin-top","15px")
//		        .style("margin-left","10px")
//		        .style("color", "#696969")
//		        .html('<p>Valid orbit names: 1000, 2000, 3000, 4000, 5000</p>'
//		        		+'Valid instrument names: A, B, C, D, E, F, G, H, I, J, K, L');         
//    } 
//    else if (selectedOption=="numOfInstruments"){
//    	filterInputField_numOfInstruments();
//        d3.select("[id=filter_inputs]")
//                .append("div")
//                .attr("id","filter_explanation")
//                .style("margin-top","15px")
//                .style("margin-left","10px")
//                .text("(Hint: This highlights all the designs with the specified number of instruments. You can also specify the instrument name, and only those instruments will be counted.)")
//                .style("color", "#696969");  
//        d3.select("[id=filter_inputs]")
//		        .append("div")
//		        .attr("id","filter_explanation_valid_inputs")
//		        .style("margin-top","15px")
//		        .style("margin-left","10px")
//		        .style("color", "#696969")
//		        .html('<p>Valid orbit names: 1000, 2000, 3000, 4000, 5000</p>'
//		        		+'Valid instrument names: A, B, C, D, E, F, G, H, I, J, K, L');         
//    } 
//    
//    else if(selectedOption=="subsetOfInstruments"){
//        filterInputField_subsetOfInstruments();
//        d3.select("[id=filter_inputs]")
//                .append("div")
//                .attr("id","filter_explanation")
//                .style("margin-top","15px")
//                .style("margin-left","10px")
//                .text("(Hint: The specified orbit should contain at least m number and at maximum M number of instruments from the specified instrument set. m is the first entry and M is the second entry in the second field)")
//                .style("color", "#696969");  
//        d3.select("[id=filter_inputs]")
//		        .append("div")
//		        .attr("id","filter_explanation_valid_inputs")
//		        .style("margin-top","15px")
//		        .style("margin-left","10px")
//		        .style("color", "#696969")
//		        .html('<p>Valid orbit names: 1000, 2000, 3000, 4000, 5000</p>'
//		        		+'Valid instrument names: A, B, C, D, E, F, G, H, I, J, K, L'); 
//    } else if(selectedOption=="defineNewFilter"){
//    	
//    } else{
//        
//    	if(!userDefOption){
//    		
//            var filterInput = d3.select("[id=filter_inputs]");
//
//            var filterExpression = filterInput.append("div")
//                        .attr("id","filter_expression_div")
//                        .style("width","100%")
//                        .style("float","left")
//                        .style("margin-top","15px")
//                        .style("margin-bottom","5px");
//            filterExpression.append("div")
//                    .text("Filter expression: ")
//                    .style("float","left");
//            filterExpression.append("div")
//                        .attr("id","filter_expression");
//    		
//            var expression;
//            for(var i=0;i<userDefFilters.length;i++){
//                if(userDefFilters[i].name===selectedOption){
//                    expression = userDefFilters[i].expression;
//                }
//            }
//
//            d3.select("[id=filter_expression]")
//                    .style("height","120px")
//                    .text(expression);
//    	}
//
//    }    
//}
//
//function filterInputField_singleInstInput(){
//    var filterInput = d3.select("[id=filter_inputs]");
//        filterInput.append("div")
//                .attr("id","filter_input1")
//                .text("Input single instrument name: ");
//        filterInput.select("[id=filter_input1]")
//                .append("input")
//                .attr("id","filter_input1_textBox")  
//                .attr("type","text");
//}
//function filterInputField_orbitInput(){
//    var filterInput = d3.select("[id=filter_inputs]");
//
//        filterInput.append("div")
//                .attr("id","filter_input1")
//                .text("Input orbit name");
//
//        filterInput.select("[id=filter_input1]")
//                .append("input")
//                .attr("id","filter_input1_textBox")
//                .attr("type","text");
//}
//function filterInputField_orbitAndInstInput(){
//    var filterInput = d3.select("[id=filter_inputs]");
//
//        filterInput.append("div")
//                .attr("id","filter_input1")
//                .text("Input orbit name: ");
//
//        filterInput.select("[id=filter_input1]")
//                .append("input")
//                .attr("id","filter_input1_textBox")
//                .attr("type","text");
//
//        filterInput.append("div")
//                .attr("id","filter_input2")
//                .text("Input single instrument name: ");
//
//        filterInput.select("[id=filter_input2]")
//                .append("input")
//                .attr("id","filter_input2_textBox")
//                .attr("type","text")
//                .style("width","300px")
//                .style("margin-left","5px")
//                .style("margin-right","10px")
//                .style("margin-bottem","5px");
//}
//function filterInputField_multipleInstInput(){
//        var filterInput = d3.select("[id=filter_inputs]");
//        filterInput.append("div")
//                .attr("id","filter_input1")
//                .text("Input instrument names (2 or 3) separated by comma:");
//
//        filterInput.select("[id=filter_input1]")
//                .append("input")
//                .attr("id","filter_input1_textBox")
//                .attr("type","text");
//}
//function filterInputField_orbitAndMultipleInstInput(){
//        var filterInput = d3.select("[id=filter_inputs]");
//        filterInput.append("div")
//                .attr("id","filter_input1")
//                .text("Input orbit name: ");
//
//        filterInput.select("[id=filter_input1]")
//                .append("input")
//                .attr("id","filter_input1_textBox")
//                .attr("type","text");
//
//        filterInput.append("div")
//                .attr("id","filter_input2")
//                .text("Input instrument names (2 or 3) separated by comma: ");
//
//        filterInput.select("[id=filter_input2]")
//                .append("input")
//                .attr("id","filter_input2_textBox")
//                .attr("type","text")
//                .style("width","300px")
//                .style("margin-left","5px")
//                .style("margin-right","10px")
//                .style("margin-bottem","5px");
//}
//function filterInputField_numOfInstruments(){
//    var filterInput = d3.select("[id=filter_inputs]");
//    filterInput.append("div")
//            .attr("id","filter_input1")
//            .text("Input instrument name (Could be N/A): ");
//
//    filterInput.select("[id=filter_input1]")
//            .append("input")
//            .attr("id","filter_input1_textBox")
//            .attr("type","text");
//    
//    d3.select("#filter_input1_textBox").attr("value","N/A");
//
//    filterInput.append("div")
//            .attr("id","filter_input2")
//	    .text("Input a number of instrument used (should be greater than or equal to 0): ");
//
//    filterInput.select("[id=filter_input2]")
//            .append("input")
//            .attr("id","filter_input2_textBox")
//            .attr("type","text")
//            .style("width","300px")
//            .style("margin-left","5px")
//            .style("margin-right","10px")
//            .style("margin-bottem","5px");
//}
//function filterInputField_numOrbitInput(){
//        var filterInput = d3.select("[id=filter_inputs]");
//
//        filterInput.append("div")
//                .attr("id","filter_input1")
//                .text("Input number of orbits");
//
//        filterInput.select("[id=filter_input1]")
//                .append("input")
//                .attr("id","filter_input1_textBox")
//                .attr("type","text");
//}
//function filterInputField_subsetOfInstruments(){
//        var filterInput = d3.select("[id=filter_inputs]");
//        filterInput.append("div")
//                .attr("id","filter_input1")
//                .text("Input orbit name: ");
//
//        filterInput.select("[id=filter_input1]")
//                .append("input")
//                .attr("id","filter_input1_textBox")
//                .attr("type","text");
//
//        filterInput.append("div")
//                .attr("id","filter_input2")
//                .text("Input the min and the max (optional) number of instruments in the subset, separated by comma: ")
//                ;
//
//        filterInput.select("[id=filter_input2]")
//                .append("input")
//                .attr("id","filter_input2_textBox")
//                .attr("type","text")
//                .style("width","100px")
//                .style("margin-left","5px")
//                .style("margin-right","10px")
//                .style("margin-bottem","5px");
//
//        filterInput.append("div")
//                .attr("id","filter_input3")
//                .text("Input a set of instrument names, separated by comma: ");
//
//        filterInput.select("[id=filter_input3]")
//                .append("input")
//                .attr("id","filter_input3_textBox")
//                .attr("type","text")
//                .style("width","300px")
//                .style("margin-left","5px")
//                .style("margin-right","10px")
//                .style("margin-bottem","5px");
//}
//
//
//
//function applyFilter_new(){
//	
//    buttonClickCount_applyFilter += 1;
//
//    cancelDotSelections();
//    var wrong_arg = false;
//    var filterType = d3.select("[id=dropdown_presetFilters]")[0][0].value;
//    var neg = false;
//    
//	
//    
//    if (filterType == "paretoFront"){
//        var filterInput = d3.select("[id=filter_input1_textBox]")[0][0].value;
//        var unClickedArchs = d3.selectAll("[class=dot]")[0].forEach(function (d) {
//        	var rank = parseInt(d3.select(d).attr("paretoRank"));
//            if (rank <= +filterInput && rank >= 0){
//                d3.select(d).attr("class", "dot_highlighted")
//                            .style("fill", "#20DCCC");
//            }
//        });
//
//    }
//    else if (filterType == "present" || filterType == "absent" || filterType == "inOrbit" || filterType == "notInOrbit" || filterType == "together" || filterType == "togetherInOrbit" || filterType == "separate" || 
//            filterType == "emptyOrbit" || filterType=="numOrbitUsed" ||
//            filterType=="subsetOfInstruments" || filterType=="numOfInstruments"){
//
//        var filterInputs = [];
//        if(d3.select("[id=filter_input1_textBox]")[0][0]!==null){
//            filterInputs.push(d3.select("[id=filter_input1_textBox]")[0][0].value);
//        }
//        if(d3.select("[id=filter_input2_textBox]")[0][0]!==null){
//            filterInputs.push(d3.select("[id=filter_input2_textBox]")[0][0].value);
//        }
//        if(d3.select("[id=filter_input3_textBox]")[0][0]!==null){
//            filterInputs.push(d3.select("[id=filter_input3_textBox]")[0][0].value);
//        }
//
//        var unClickedArchs = d3.selectAll("[class=dot]")[0].forEach(function (d) {
//            var bitString = d.__data__.bitString;
//            var temp = presetFilter2(filterType,bitString,filterInputs,neg);
//            if(temp==null){
//            	wrong_arg = true;
//            	return;
//            }
//            else if (temp){
//                d3.select(d).attr("class", "dot_highlighted")
//                            .style("fill", "#20DCCC");
//            }
//        });
//    } else if(filterType == "defineNewFilter" || (filterType =="not_selected" && userDefFilters.length !== 0)){
//        var filterExpression = d3.select("[id=filter_expression]").text();
//        tmpCnt =0;
//
//        d3.selectAll("[class=dot]")[0].forEach(function(d){
//        	
//            var bitString = d.__data__.bitString;
//            if(applyUserDefFilterFromExpression(filterExpression,bitString)){
//                d3.select(d).attr("class", "dot_highlighted")
//                            .style("fill", "#20DCCC");
//            }
//        });
//
//        d3.select("[id=saveFilter]").attr('disabled', null)
//                                    .on("click",saveNewFilter);
//    }
//    else{
//        for(var k=0 ; k < userDefFilters.length; k++){
//           if(userDefFilters[k].name == filterType){
//                var filterExpression = userDefFilters[k].expression;
//                d3.selectAll("[class=dot]")[0].forEach(function(d){
//                    var bitString = d.__data__.bitString;
//                    if(applyUserDefFilterFromExpression(filterExpression,bitString)){
//                        d3.select(d).attr("class", "dot_highlighted")
//                                    .style("fill", "#20DCCC");
//                    }
//                }); 
//           } 
//        }
//    }
//    if(wrong_arg){
//    	alert("Invalid input argument");
//    }
//    d3.select("[id=numOfSelectedArchs_inputBox]").text("" + numOfSelectedArchs());  
//}
//
//function applyFilter_within(){
//	
//	
//    buttonClickCount_applyFilter += 1;
//    var wrong_arg = false;
//    var filterType = d3.select("[id=dropdown_presetFilters]")[0][0].value;
//    var neg = false;
//
//    if (filterType == "paretoFront"){
//        var filterInput = d3.select("[id=filter_input1_textBox]")[0][0].value;
//        var clickedArchs = d3.selectAll("[class=dot_highlighted]")[0].forEach(function (d) {
//
//        	var rank = parseInt(d3.select(d).attr("paretoRank"));
//            if (rank <= +filterInput && rank >= 0){
//            }else {
//                d3.select(d).attr("class", "dot")
//                            .style("fill", function (d) {
//                                if (d.status == "added") {
//                                    return "#188836";
//                                } else if (d.status == "justAdded") {
//                                    return "#20FE5B";
//                                } else {
//                                    return "#000000";
//                                }
//                            });
//            }
//        });
//
//    }
//    else if (filterType == "present" || filterType == "absent" || filterType == "inOrbit" || filterType == "notInOrbit" || 
//            filterType == "together" || filterType == "togetherInOrbit" || filterType == "separate" || 
//            filterType == "emptyOrbit" || filterType=="numOrbitUsed" || filterType=="subsetOfInstruments"||
//            filterType == "numOfInstruments"	){
//
//
//        var filterInputs = [];
//        if(d3.select("[id=filter_input1_textBox]")[0][0]!==null){
//            filterInputs.push(d3.select("[id=filter_input1_textBox]")[0][0].value);
//        }
//        if(d3.select("[id=filter_input2_textBox]")[0][0]!==null){
//            filterInputs.push(d3.select("[id=filter_input2_textBox]")[0][0].value);
//        }
//        if(d3.select("[id=filter_input3_textBox]")[0][0]!==null){
//            filterInputs.push(d3.select("[id=filter_input3_textBox]")[0][0].value);
//        }
//
//
//        var clickedArchs = d3.selectAll("[class=dot_highlighted]")[0].forEach(function (d) {
////                            var bitString = booleanArray2String(d.__data__.bitString)
//
//            var bitString = d.__data__.bitString;
//            var temp = presetFilter2(filterType,bitString,filterInputs,neg);
//            if(temp==null){
//            	wrong_arg = true;
//            	return;
//            } else if(temp){
//            } else {
//                d3.select(d).attr("class", "dot")
//                            .style("fill", function (d) {
//                                if (d.status == "added") {
//                                    return "#188836";
//                                } else if (d.status == "justAdded") {
//                                    return "#20FE5B";
//                                } else {
//                                    return "#000000";
//                                }
//                            });
//            }
//
//
//        });
//    }
//    else{
//        for(var k=0 ; k < userDefFilters.length; k++){
//           if(userDefFilters[k].name == filterType){
//                var filterExpression = userDefFilters[k].expression;
//                d3.selectAll("[class=dot_highlighted]")[0].forEach(function(d){
//                    var bitString = d.__data__.bitString;
//                    if(applyUserDefFilterFromExpression(filterExpression,bitString)){
//                        d3.select(d).attr("class", "dot_highlighted")
//                                    .style("fill", "#20DCCC");
//                    }
//                }); 
//           } 
//        }
//    }
//    if(wrong_arg){
//    	alert("Invalid input argument");
//    }
//    d3.select("[id=numOfSelectedArchs_inputBox]").text("" + numOfSelectedArchs());  
//}
//
//
//function applyFilter_add(){
//	
//    buttonClickCount_applyFilter += 1;
//    var wrong_arg = false;
//    var filterType = d3.select("[id=dropdown_presetFilters]")[0][0].value;
//    var neg = false;
//    
//    if (filterType == "paretoFront"){
//        var filterInput = d3.select("[id=filter_input1_textBox]")[0][0].value;
//        var unClickedArchs = d3.selectAll("[class=dot]")[0].forEach(function (d) {
//        	var rank = parseInt(d3.select(d).attr("paretoRank"));
//            if (rank <= +filterInput && rank >= 0){
//            	d3.select(d).attr("class", "dot_highlighted")
//                            .style("fill", "#20DCCC");
//            }
//        });
//
//    }
//    else if (filterType == "present" || filterType == "absent" || filterType == "inOrbit" || filterType == "notInOrbit" || 
//            filterType == "together" || filterType == "togetherInOrbit" || filterType == "separate" || 
//            filterType == "emptyOrbit" || filterType=="numOrbitUsed" || filterType =="subsetOfInstruments"||
//            filterType=="numOfInstruments"){
//
//
//        var filterInputs = [];
//        if(d3.select("[id=filter_input1_textBox]")[0][0]!==null){
//            filterInputs.push(d3.select("[id=filter_input1_textBox]")[0][0].value);
//        }
//        if(d3.select("[id=filter_input2_textBox]")[0][0]!==null){
//            filterInputs.push(d3.select("[id=filter_input2_textBox]")[0][0].value);
//        }
//        if(d3.select("[id=filter_input3_textBox]")[0][0]!==null){
//            filterInputs.push(d3.select("[id=filter_input3_textBox]")[0][0].value);
//        }
//
//        var unClickedArchs = d3.selectAll("[class=dot]")[0].forEach(function (d) {
////                            var bitString = booleanArray2String(d.__data__.bitString)
//            var bitString = d.__data__.bitString;
//            var temp = presetFilter2(filterType,bitString,filterInputs,neg);
//            if(temp==null){
//            	wrong_arg = true;
//            	return;
//            }
//            else if (temp){
//                d3.select(d).attr("class", "dot_highlighted")
//                            .style("fill", "#20DCCC");
//            }
//        });
//    }
//    else{
//        for(var k=0 ; k < userDefFilters.length; k++){
//           if(userDefFilters[k].name == filterType){
//                var filterExpression = userDefFilters[k].expression;
//                d3.selectAll("[class=dot]")[0].forEach(function(d){
//                    var bitString = d.__data__.bitString;
//                    if(applyUserDefFilterFromExpression(filterExpression,bitString)){
//                        d3.select(d).attr("class", "dot_highlighted")
//                                    .style("fill", "#20DCCC");
//                    }
//                }); 
//           } 
//        }
//    }
//    if(wrong_arg){
//    	alert("Invalid input argument");
//    }
//    d3.select("[id=numOfSelectedArchs_inputBox]").text("" + numOfSelectedArchs());  
//}
//
//
//
//
//
//
//
//
//
//
//function presetFilter2(filterName,bitString,inputs,neg){
//    var filterInput1;
//    var filterInput2;
//    var filterInput3;
//
//    filterInput1 = inputs[0];
//    if(inputs.length > 1){
//        filterInput2 = inputs[1];
//    }
//    if(inputs.length > 2){
//        filterInput3 = inputs[2];
//    }
//
//    var output;
//    var leng = bitString.length;
//    var norb = orbitList.length;
//    var ninstr = instrList.length;
//
//    if(filterName==="present"){
//        filterInput1 = relabelback(filterInput1);
//        var thisInstr = $.inArray(filterInput1,instrList);
//        if(thisInstr==-1){
//        	return null;
//        }
//        output = false;
//        for(var i=0;i<orbitList.length;i++){
//            if(bitString[ninstr*i+thisInstr]===true){
//                output = true;
//                break;
//            }
//        }
//    } else if(filterName==="absent"){
//        filterInput1 = relabelback(filterInput1);
//        var thisInstr = $.inArray(filterInput1,instrList);
//        if(thisInstr==-1){
//        	return null;
//        }
//        output = true;
//        for(var i=0;i<orbitList.length;i++){
//            if(bitString[ninstr*i+thisInstr]===true){
//                output = false;
//                break;
//            }
//        }
//    } else if(filterName==="inOrbit"){
//        filterInput1 = relabelback(filterInput1);
//        filterInput2 = relabelback(filterInput2);
//        output = false;
//        var thisOrbit = $.inArray(filterInput1,orbitList);
//        var thisInstr = $.inArray(filterInput2,instrList);
//        
//        if(thisInstr==-1 || thisOrbit==-1){
//        	return null;
//        }
//            if(bitString[thisOrbit*ninstr + thisInstr]===true){
//                output = true;
//            }
//    } else if(filterName==="notInOrbit"){
//        filterInput1 = relabelback(filterInput1);
//        filterInput2 = relabelback(filterInput2);
//        output = true;
//        var thisOrbit = $.inArray(filterInput1,orbitList);
//        var thisInstr = $.inArray(filterInput2,instrList);
//        if(thisInstr==-1 || thisOrbit==-1){
//        	return null;
//        }
//            if(bitString[thisOrbit*ninstr + thisInstr]===true){
//                output = false;
//            }
//    } else if(filterName === "together"){
//        output = false;
//        var splitInstruments = filterInput1.split(",");
//        var thisInstr1 = $.inArray(relabelback(splitInstruments[0]),instrList);
//        var thisInstr2 = $.inArray(relabelback(splitInstruments[1]),instrList);
//        var thisInstr3;
//        if(splitInstruments.length===2){
//            if(thisInstr1==-1 || thisInstr2==-1){
//            	return null;
//            }
//            for(var i=0;i<norb;i++){
//                if(bitString[i*ninstr + thisInstr1] === true && bitString[i*ninstr + thisInstr2] === true){
//                    output = true;
//                    break;
//                }
//            }
//        } else {
//            thisInstr3 = $.inArray(relabelback(splitInstruments[2]),instrList);
//            if(thisInstr1==-1 || thisInstr2==-1 || thisInstr3==-1){
//            	return null;
//            }
//            for(var i=0;i<norb;i++){
//                if(bitString[i*ninstr + thisInstr1] === true && bitString[i*ninstr + thisInstr2] === true
//                        && bitString[i*ninstr + thisInstr3] === true){
//                    output = true;
//                    break;
//                }
//            }
//        }
//    } else if(filterName === "togetherInOrbit"){
//        output = false;
//        var thisOrbit =  $.inArray(relabelback(filterInput1),orbitList);
//        var splitInstruments = filterInput2.split(",");
//        var thisInstr1 = $.inArray(relabelback(splitInstruments[0]),instrList);
//        var thisInstr2 = $.inArray(relabelback(splitInstruments[1]),instrList);
//        var thisInstr3;
//        if(splitInstruments.length===2){
//            if(thisInstr1==-1 || thisInstr2==-1 || thisOrbit==-1){
//            	return null;
//            }
//            if(bitString[thisOrbit*ninstr + thisInstr1] === true && bitString[thisOrbit*ninstr + thisInstr2] === true){
//                output = true;
//            }
//        } else {
//            thisInstr3 = $.inArray(relabelback(splitInstruments[2]),instrList);
//            if(thisInstr1==-1 || thisInstr2==-1 || thisInstr3==-1 || thisOrbit==-1){
//            	return null;
//            }
//            if(bitString[thisOrbit*ninstr + thisInstr1] === true && bitString[thisOrbit*ninstr + thisInstr2] === true
//                        && bitString[thisOrbit*ninstr + thisInstr3] === true){
//                output = true;
//            }
//        }
//    } else if(filterName ==="separate"){
//        output = true;
//        var splitInstruments = filterInput1.split(",");
//        var thisInstr1 = $.inArray(relabelback(splitInstruments[0]),instrList);
//        var thisInstr2 = $.inArray(relabelback(splitInstruments[1]),instrList);
//        var thisInstr3;
//        if(splitInstruments.length===2){
//            if(thisInstr1==-1 || thisInstr2==-1){
//            	return null;
//            }
//            for(var i=0;i<norb;i++){
//                if(bitString[i*ninstr + thisInstr1] === true && bitString[i*ninstr + thisInstr2] === true){
//                    output = false;
//                    break;
//                }
//            }
//        } else {
//            thisInstr3 = $.inArray(relabelback(splitInstruments[2]),instrList);
//            if(thisInstr1==-1 || thisInstr2==-1 || thisInstr3==-1){
//            	return null;
//            }
//            for(var i=0;i<norb;i++){
//                if(bitString[i*ninstr + thisInstr1] === true && bitString[i*ninstr + thisInstr2] === true
//                        && bitString[i*ninstr + thisInstr3] === true){
//                    output = false;
//                    break;
//                }
//            }
//        }
//    } else if(filterName ==="emptyOrbit"){
//        var thisOrbit =  $.inArray(relabelback(filterInput1),orbitList);
//        if(thisOrbit==-1){
//        	return null;
//        }
//        output = true;
//        for(var i=0;i<ninstr;i++){
//            if(bitString[thisOrbit*ninstr + i]===true){
//                output=false;
//                break;
//            }
//        }
//    } else if(filterName ==="numOrbitUsed"){
//        var numOrbits = filterInput1;
//        if(numOrbits > 5 || numOrbits < 0){
//        	return null;
//        }
//        var cnt = 0;
//        for (var i=0;i<norb;i++){
//            for (var j=0;j<ninstr;j++){
//                if(bitString[i*ninstr+j]==true){
//                    cnt++;
//                    break;
//                }
//            }
//        }
//        if(cnt==numOrbits){
//            output = true;
//        } else{
//            output= false;
//        }  
//        
//    } else if(filterName === "numOfInstruments"){
//        output = false;
//
//        var all_instruments = false;
//        var thisInstr = -1;
//        
//        var instrument;
//        var num_of_instruments;
//        if(filterInput1.indexOf(",") != -1){
//        	var comma = filterInput1.indexOf(",");
//        	instrument = filterInput1.substring(0,comma);
//        	num_of_instruments = filterInput1.substring(comma+1);
//        }else{
//        	instrument = filterInput1;
//        	num_of_instruments = filterInput2;
//        }
//        
//        if(instrument=="N/A"){
//        	//continue;
//        	all_instruments = true;
//        }
//        else{
//            thisInstr = $.inArray(relabelback(instrument),instrList);
//            if(thisInstr==-1){
//            	return null;
//            }
//        }        
//        var cnt = 0;
//        for(var i=0;i<orbitList.length;i++){
//        	if(all_instruments){
//        		for(var j=0;j<instrList.length;j++){
//                	if(bitString[i*ninstr + j] === true){
//                        cnt = cnt+1;
//                    }
//        		}
//        	}else{
//            	if(bitString[i*ninstr + thisInstr] === true){
//                    cnt = cnt+1;
//                }
//        	}
//        }
//
//            
//        if(num_of_instruments== ""+cnt){
//        	output=true;
//        }else{
//        	output=false;
//        }
//        return checkNeg(output,neg)     
//        
//    } else if(filterName === "subsetOfInstruments"){ 
//        var thisOrbit = $.inArray(relabelback(filterInput1),orbitList);
//        var minmax = filterInput2.split(",");
//        var instruments = filterInput3.split(",");
//
//        var constraint = minmax.length;
//        var numOfInstr = instruments.length;
//
//        var min,max;
//        if(constraint===1){ // only the minimum number of instruments is typed in
//            min = minmax[0];
//            max = 100;
//        } else if(constraint===2){
//            min = minmax[0];
//            max = minmax[1];
//        }
//
//        var size = instruments.length;
//        var cnt=0;
//
//        for(var i=0;i<size;i++){ //var thisInstr1 = $.inArray(splitInstruments[0],instrList);
//            var thisInstr = $.inArray(relabelback(instruments[i]),instrList);
//            if(bitString[thisOrbit*ninstr + thisInstr]===true){
//                cnt++;
//            }
//        }
//        if(cnt <= max && cnt >= min){
//            output = true;
//        }else{
//            output = false;
//        }
//    }
//
//    return checkNeg(output,neg)
//}
//
//
//function checkNeg(original,neg){
//	if(neg==true){
//		return !original;
//	}else{
//		return original;
//	}
//}
