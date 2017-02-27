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
    	if(instr==-1) return false;
        for(var i=0;i<norb;i++){
            if(bitString[ninstr*i+instr]===true){
                return true;
            }
        }
        return false;
        break;
    case "absent":
    	if(instr==-1) return false;
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

    var dropdown = d3.select("#filter_options_dropdown_1")[0][0].value;

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
    var presetFilter = dropdown;
    if(presetFilter=="present" || presetFilter=="absent" || presetFilter=="together" || presetFilter=="separate"){
        var instrument = input_textbox[0];
        filterExpression = presetFilter + "[;" + DisplayName2Index(instrument,"instrument") + ";]";
    }else if(presetFilter == "inOrbit" || presetFilter == "notInOrbit" || presetFilter=="togetherInOrbit"){
        var orbit = input_textbox[0];
        var instrument = input_textbox[1];
        filterExpression = presetFilter + "["+ DisplayName2Index(orbit,"orbit") + ";" + DisplayName2Index(instrument,"instrument")+ ";]";
    }else if(presetFilter =="emptyOrbit"){
        var orbit = input_textbox[0];
        filterExpression = presetFilter + "[" + DisplayName2Index(orbit,"orbit") + ";;]";
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
            filterExpression=presetFilter + "[;" + DisplayName2Index(instrument,"instrument") + ";" + number + "]";
        }else if(instrumentEmpty){
            // Count the number of instruments in an orbit
            filterExpression=presetFilter + "[" + DisplayName2Index(orbit,"orbit") + ";;" + number + "]";
        }
    }
    else if(dropdown==="paretoFront"){
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
    update_filter_application_status(filterExpression,option);
    

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

    cancelDotSelections();
    d3.selectAll('.dot')[0].forEach(function(d){
        var bitString = d.__data__.bitString;
        if(processFilterExpression(filterExpression,bitString)){
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



function update_filter_application_status(inputExpression,option){    
    
    var application_status = d3.select('#filter_application_status');
    var count = application_status.selectAll('.applied_filter').size();
    
    var thisFilter = application_status.append('div')
            .attr('id',function(){
                var num = count+1;
                return 'applied_filter_' + num;
            })
            .attr('class','applied_filter');
    
    thisFilter.append('input')
            .attr('type','checkbox')
            .attr('class','filter_application_activate');
    thisFilter.append('select')
            .attr('class','filter_application_logical_connective')
            .selectAll('option')
            .data([{value:"&&",text:"AND"},{value:"||",text:"OR"}])
            .enter()
            .append("option")
            .attr("value",function(d){
                return d.value;
            })
            .text(function(d){
                return d.text;
            });
    thisFilter.append('div')
            .attr('class','filter_application_expression')
            .attr('expression',function(d){
            	return inputExpression;
            })
            .text(ppdf(inputExpression));
    
//    thisFilter.append('img')
//            .attr('src','img/left_arrow.png')
//            .attr('id','left_arrow')
//            .attr('width','21')
//            .attr('height','21')
//            .style('float','left')
//            .style('margin-left','7px');
//    thisFilter.append('img')
//            .attr('src','img/left_arrow.png')
//            .attr('id','right_arrow')
//            .attr('class','img-hor-vert')
//            .attr('width','21')
//            .attr('height','21')
//            .style('float','left')
//            .style('margin-left','4px')
//            .style('margin-right','7px'); 
//    
//    thisFilter.append('button')
//            .attr('class','filter_application_saveThis')
//            .text('Add this filter')
//            .on('click',function(d){
//                save_user_defined_filter(inputExpression);
//            });
    
    
    
    thisFilter.append('button')
            .attr('class','filter_application_delete')
            .text('Remove');
    
    
    if(option==="new"){
        // Activate only the current filter
        d3.selectAll('.filter_application_activate')[0].forEach(function(d){
            d3.select(d)[0][0].checked=false;
        })        
        d3.selectAll('.filter_application_expression').style("color","#989898"); // gray
        thisFilter.select('.filter_application_expression').style("color","#000000"); // black
        thisFilter.select('.filter_application_activate')[0][0].checked=true;
        thisFilter.select('.filter_application_logical_connective')[0][0].value="&&";
    }else if(option==="add"){ // or
        thisFilter.select('.filter_application_activate')[0][0].checked=true;
        thisFilter.select('.filter_application_logical_connective')[0][0].value="||";
    }else if(option==="within"){ // and
        thisFilter.select('.filter_application_activate')[0][0].checked=true;
        thisFilter.select('.filter_application_logical_connective')[0][0].value="&&";
    }
    
    thisFilter.select(".filter_application_delete").on("click",function(d){
        var activated = thisFilter.select('.filter_application_activate')[0][0].checked;
        thisFilter.remove();
        if(activated){
            applyComplexFilter();
        }
        if(d3.selectAll('.applied_filter')[0].length===0){
            d3.select('#filter_application_saveAll')[0][0].disabled=true;
        }
    });
    
    thisFilter.select('.filter_application_activate').on("change",function(d){
        var activated = thisFilter.select('.filter_application_activate')[0][0].checked;
        thisFilter.select('.filter_application_expression').style("color",function(d){
            if(activated){
                return "#000000"; //black
            }else{
                return "#989898"; // gray
            }
        });
        applyComplexFilter();
    });
    thisFilter.select('.filter_application_logical_connective').on("change",function(d){
        applyComplexFilter();
    });

}



function parse_filter_application_status(){
    var application_status = d3.select('#filter_application_status');
    var count = application_status.selectAll('.applied_filter').size();
    var filter_expressions = [];
    var filter_logical_connective = [];
    application_status.selectAll('.applied_filter')[0].forEach(function(d){
        var activated = d3.select(d).select('.filter_application_activate')[0][0].checked;
        var expression = d3.select(d).select('.filter_application_expression').attr('expression');
        var logic = d3.select(d).select('.filter_application_logical_connective')[0][0].value;
        if(activated){
            filter_expressions.push(expression);
            filter_logical_connective.push(logic);
        }
    });
    var filterExpression = "";
    for(var i=0;i<filter_expressions.length;i++){
        if(i > 0){
            filterExpression = filterExpression + filter_logical_connective[i];
        }
        filterExpression = filterExpression + filter_expressions[i];
    }
    return filterExpression;
}