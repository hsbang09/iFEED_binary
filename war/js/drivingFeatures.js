

/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */





function runDataMining() {
	document.getElementById('tab3').click();
    highlight_basic_info_box()
    
	if(selection_changed == false && sortedDFs != null){
		display_drivingFeatures(sortedDFs,"lift");
		if(testType=="3"){
			display_classificationTree(jsonObj_tree);
		}
		return;
	}
	
    var selectedArchs = d3.selectAll("[class=dot_highlighted]");
    var nonSelectedArchs = d3.selectAll("[class=dot]");
    var numOfSelectedArchs = selectedArchs.size();
    var numOfNonSelectedArchs = nonSelectedArchs.size();
    
    if (numOfSelectedArchs==0){
    	alert("First select target solutions!");
    }else{

        buttonClickCount_drivingFeatures += 1;
        getDrivingFeatures_numOfArchs.push({numOfSelectedArchs,numOfNonSelectedArchs});
        getDrivingFeatures_thresholds.push({supp:support_threshold,lift:lift_threshold,conf:confidence_threshold});
        
        var selected = [];
        var non_selected = [];
        selected.length = 0;
        non_selected.length=0;

        for (var i = 0; i < numOfSelectedArchs; i++) {
            var id = selectedArchs[0][i].__data__.id;
            selected.push(id);
        }
        for (var i = 0; i < numOfNonSelectedArchs; i++) {
            var id = nonSelectedArchs[0][i].__data__.id;
            non_selected.push(id);
        }

        sortedDFs = generateDrivingFeatures(selected,non_selected,support_threshold,confidence_threshold,lift_threshold,userDefFilters,"lift");
        if(testType=="3"){
           // jsonObj_tree = buildClassificationTree();
        }
        
        if(sortedDFs.length==0){
        	return;
        }
        
        display_drivingFeatures(sortedDFs,"lift");
        if(testType=="3"){
        	//display_classificationTree(jsonObj_tree);
        }
        selection_changed = false;
        
    }
}




function generateDrivingFeatures(selected,non_selected,
		support_threshold,confidence_threshold,lift_threshold,
		userDefFilters,sortBy){
	
	var output;
    $.ajax({
        url: "IFEEDServlet",
        type: "POST",
        data: {ID: "get_driving_features",
        	selected: JSON.stringify(selected),
        	non_selected:JSON.stringify(non_selected),
        	supp:support_threshold,
        	conf:confidence_threshold,
        	lift:lift_threshold,
        	userDefFilters:JSON.stringify(userDefFilters),
        	sortBy:sortBy},
        async: false,
        success: function (data, textStatus, jqXHR)
        {
        	if(data=="[]"){
        		alert("No driving feature mined. Please try modifying the selection. (Try selecting more designs)");
        	}
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
	
	for (var i=0;i<drivingFeatures.length;i++){
		
		var thisDF = drivingFeatures[i];
		var value=0;
		var maxval = 1000000000;
		var minval = -1;
		
		if(newlySorted.length==0){
			newlySorted.push(thisDF);
			continue;
		}
		
		var metrics = thisDF.metrics;
	       
        if(sortBy=="lift"){
            value = thisDF.metrics[1];
            maxval = newlySorted[0].metrics[1];
            minval = newlySorted[newlySorted.length-1].metrics[1];
        } else if(sortBy=="supp"){
            value = thisDF.metrics[0];
            maxval = newlySorted[0].metrics[0];
            minval = newlySorted[newlySorted.length-1].metrics[0];
        } else if(sortBy=="confave"){
            value = (thisDF.metrics[2] + thisDF.metrics[3])/2;
            maxval = (newlySorted[0].metrics[2] + newlySorted[0].metrics[3])/2;
            minval = (newlySorted[newlySorted.length-1].metrics[2]+newlySorted[newlySorted.length-1].metrics[3])/2;
        } else if(sortBy=="conf1"){
            value = thisDF.metrics[2];
            maxval = newlySorted[0].metrics[2];
            minval = newlySorted[newlySorted.length-1].metrics[2];
        } else if(sortBy=="conf2"){
            value = thisDF.metrics[3];
            maxval = newlySorted[0].metrics[3];
            minval = newlySorted[newlySorted.length-1].metrics[3];
        }
		
		if(value>=maxval){
			newlySorted.splice(0,0,thisDF);
		} else if (value<=minval){
			newlySorted.push(thisDF);
		} else {
			for (var j=0;j<newlySorted.length;j++){
				var refval=0; var refval2=0;
				
				if(sortBy=="lift"){
					refval=newlySorted[j].metrics[1];
					refval2=newlySorted[j+1].metrics[1];
				} else if(sortBy=="supp"){
					refval=newlySorted[j].metrics[0];
					refval2=newlySorted[j+1].metrics[0];
				} else if(sortBy=="confave"){
					refval=(newlySorted[j].metrics[2]+newlySorted[j].metrics[3])/2
					refval2=(newlySorted[j+1].metrics[2]+newlySorted[j+1].metrics[3])/2
				} else if(sortBy=="conf1"){
					refval=newlySorted[j].metrics[2];
					refval2=newlySorted[j+1].metrics[2];
				} else if(sortBy=="conf2"){
					refval=newlySorted[j].metrics[3];
					refval2=newlySorted[j+1].metrics[3];
				}
				if(value <=refval && value > refval2){
					newlySorted.splice(j+1,0,thisDF); break;
				}
		
			}
		}
	}         
	return newlySorted;
}









               
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
    var lifts=[];
    var supps=[];
    var conf1s=[];
    var conf2s=[];

    for (var i=0;i<size;i++){
        lifts.push(source[i].metrics[1]);
        supps.push(source[i].metrics[0]);
        conf1s.push(source[i].metrics[2]);
        conf2s.push(source[i].metrics[3]);
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

//    xScale_df = d3.scale.ordinal()
//            .rangeBands([0, width_df]);
    xScale_df = d3.scale.linear()
            .range([0, width_df]);
    yScale_df = d3.scale.linear().range([height_df, 0]);
    xScale_df.domain([0,drivingFeatures.length-1]);
    
    
    var minval;
    if(sortby==="lift"){
        minval = d3.min(lifts);
        yScale_df.domain([d3.min(lifts), d3.max(lifts)]);
    } else if(sortby==="supp"){
        minval = d3.min(supps);
        yScale_df.domain([d3.min(supps), d3.max(supps)]);
    }else if(sortby==="confave"){
        var min_tmp = (d3.min(conf1s) + d3.min(conf2s))/2;
        minval = min_tmp;
        var max_tmp = (d3.max(conf1s) + d3.max(conf2s))/2;
        yScale_df.domain([min_tmp, max_tmp]);
    }else if(sortby==="conf1"){
        minval = d3.min(conf1s);
        yScale_df.domain([d3.min(conf1s), d3.max(conf1s)]);
    }else if(sortby==="conf2"){
        minval = d3.min(conf2s);
        yScale_df.domain([d3.min(conf2s), d3.max(conf2s)]);
    }

    xAxis_df = d3.svg.axis()
            .scale(xScale_df)
            .orient("bottom")
            .tickFormat(function (d) { return ''; });
    yAxis_df = d3.svg.axis()
            .scale(yScale_df)
            .orient("left");

    d3.select("[id=basicInfoBox_div]").select("[id=view3]").select("g").remove();
    var infoBox = d3.select("[id=basicInfoBox_div]").select("[id=view3]")
            .append("g");

    var svg_df = infoBox.append("svg")
    		.style("float","left")
            .attr("width", width_df + margin_df.left + margin_df.right)
            .attr("height", height_df + margin_df.top + margin_df.bottom)
                .call(
                    d3.behavior.zoom()
                    .x(xScale_df)
                    .scaleExtent([1, 10])
                    .on("zoom", function (d) {

                        var svg = d3.select("[id=basicInfoBox_div]").select("[id=view3]")
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

    
    
    
    
    var df_explanation_box = infoBox.append("div")
		.attr("id","df_explanation_box")
		.style("float","left")
		.style("background-color","#E7E7E7")
	    .style('height','350px')
	    .style('margin-top','15px')
	    .style('padding','15px')
	    .style('width','320px');
    
    df_explanation_box.append('div')
		.style("font-family","sans-serif")
		.style('margin-left','10px')
		.style("font-size","18px")
    	.style('width','100%')
    	.text('Total number of designs: ' + numOfArchs());
    
    df_explanation_box.append("svg")
		.style('width','320px')  			
		.style('height','305px')
		.style('margin-top','10px')
		.style('margin-bottom','10px'); 
    

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
                if(sortby==="lift"){
                    return "Lift";
                } else if(sortby==="supp"){
                    return "Support";
                }else if(sortby==="confave"){
                    return "Average Confidence";
                }else if(sortby==="conf1"){
                    return "Confidence {feature}->{selection}"
                }else if(sortby==="conf2"){
                    return "Confidence {selection}->{feature}"
                }
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
                if(sortby==="lift"){
                    return yScale_df(d.metrics[1]); 
                } else if(sortby==="supp"){
                    return yScale_df(d.metrics[0]); 
                }else if(sortby==="confave"){
                    return yScale_df((d.metrics[2]+d.metrics[3])/2); 
                }else if(sortby==="conf1"){
                    return yScale_df(d.metrics[2]); 
                }else if(sortby==="conf2"){
                    return yScale_df(d.metrics[3]); 
                }
            })
            .attr("height", function(d) { 
                if(sortby==="lift"){
                    return height_df - yScale_df(d.metrics[1]); 
                } else if(sortby==="supp"){
                    return height_df - yScale_df(d.metrics[0]); 
                }else if(sortby==="confave"){
                    return height_df - yScale_df((d.metrics[2]+d.metrics[3])/2); 
                }else if(sortby==="conf1"){
                    return height_df - yScale_df(d.metrics[2]); 
                }else if(sortby==="conf2"){
                    return height_df - yScale_df(d.metrics[3]); 
                }
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
                	
                    var mouseLoc_x = d3.mouse(d3.select("[id=basicInfoBox_div]").select("[id=view3]").select("[class=dfbars_svg]")[0][0])[0];
                    var mouseLoc_y = d3.mouse(d3.select("[id=basicInfoBox_div]").select("[id=view3]").select("[class=dfbars_svg]")[0][0])[1];
                    var featureInfoLoc = {x:0,y:0};
                    var h_threshold = (width_df + margin_df.left + margin_df.right)*0.5;
                    var v_threshold = (height_df + margin_df.top + margin_df.bottom)*0.55;
                    var tooltip_width = 360;
                    var tooltip_height = 210;
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
                    var svg_tmp = d3.select("[id=basicInfoBox_div]").select("[id=view3]").select("[class=dfbars_svg]");
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
                    var name = d.name;
                    var expression = d.expression;
                    var lift = d.metrics[1];
                    var supp = d.metrics[0];
                    var conf = d.metrics[2];
                    var conf2 = d.metrics[3];

                    d3.selectAll("[class=bar]").filter(function(d){
                        if(d.id===tmp){
                            return true;
                        }else{
                            return false;
                        }
                    }).style("stroke-width",1.5)
                        .style("stroke","black");

                 // Preset filter: {presetName[orbits;instruments;numbers]}   
           
                    d3.selectAll("[class=dot]")[0].forEach(function (d) {
                    	var bitString = d.__data__.bitString;
                    	if(processFilterExpression(expression,bitString)===true){
                    		d3.select(d).attr("class", "dot_DFhighlighted")
    						.style("fill", "#F75082");
                		}
                    });
                    d3.selectAll("[class=dot_highlighted]")[0].forEach(function (d) {
                    	var bitString = d.__data__.bitString;
                    	if(processFilterExpression(expression,bitString)===true){
                			d3.select(d).attr("class", "dot_selected_DFhighlighted")
    						.style("fill", "#F75082");
                		}                    	

                    });


                    
                    var fo = d3.select("[id=basicInfoBox_div]").select("[id=view3]").select("[class=dfbars_svg]")
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
                                                'class': 'fo_tooltip'
                                            });
                    var textdiv = fo_div.selectAll("div")
                            .data([{name:name,expression:expression,supp:supp,conf:conf,conf2:conf2,lift:lift}])
                            .enter()
                            .append("div")
                            .style("padding","15px");
//                            .style("margin-left","15px")
//                            .style("margin-top","10px");
                          
//                    
                    textdiv.html(function(d){
                        var output= "" + ppdf(d.expression) + "<br><br> The % of designs in the intersection out of all designs: " + round_num_2_perc(d.supp) + 
                        "% <br> The % of selected designs among designs with the feature: " + round_num_2_perc(d.conf) + 
                        "%<br> The % of designs with the feature among selected designs: " + round_num_2_perc(d.conf2) +"%";
                        return output;
                    }).style("color", "#F7FF55")
                    .style('word-wrap','break-word');                         

                    draw_venn_diagram(df_explanation_box,supp,conf,conf2);

                })
                .on("mouseout",function(d){
                    d3.select("[id=basicInfoBox_div]").select("[id=view3]").selectAll("[id=featureInfo_tooltip]").remove();
                    d3.select("[id=basicInfoBox_div]").select("[id=view3]").selectAll("[id=foreignObject_tooltip]").remove();
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
                    		.attr("class", "dot_highlighted")
                            .style("fill","#20DCCC");    

                });


    
    if(testType==="4"){
    }else{
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
    }
    

    d3.select("[id=instrumentOptions]")
            .select("table").remove();
    
    d3.select("[id=dfsort_options]").on("change",dfsort);
}
                


function dfsort(){
    var sortby = d3.select("[id=dfsort_options]")[0][0].value;
//    "lift","supp","conf(ave)","conf(feature->selection)","conf(selection->feature)"

    var sortedDrivingFeatures = sortDrivingFeatures(sortedDFs,sortby);
    sortedDFs=sortedDrivingFeatures;
    display_drivingFeatures(sortedDrivingFeatures,sortby);
}
                








function draw_venn_diagram(df_explanation_box,supp,conf,conf2){

	df_explanation_box.select("svg").remove();
	var svg_venn_diag = df_explanation_box
								.append("svg")
					    		.style('width','320px')  			
								.style('border-width','3px')
								.style('height','305px')
								.style('border-style','solid')
								.style('border-color','black')
								.style('border-radius','40px')
								.style('margin-top','10px')
								.style('margin-bottom','10px'); 

	var F_size = supp * 1/conf;
	var S_size = supp * 1/conf2;
		
	// Radius range: 30 ~ 80
	// Intersecting distance range: 0 ~ (r1+r2)
	
    radius_scale = d3.scale.pow()
    				.exponent(0.5)
					.domain([0,5])
	    			.range([10, 150]);
    var r1 = radius_scale(1);
    var	r2 = radius_scale(F_size/S_size);
    
    intersection_scale = d3.scale.linear()
					.domain([0,1])
					.range([r1+r2, 20+ r2-r1]);
    
    var left_margin = 50;
    var c1x = left_margin + r1;
    var c2x;
	if (conf2 > 0.99){
		c2x = c1x + r2 - r1;
    }else{
    	c2x = c1x + intersection_scale(conf2);
    }
	
	svg_venn_diag
		.append("circle")
		.attr("id","venn_diag_c1")
	    .attr("cx", c1x)
	    .attr("cy", 180-30)
	    .attr("r", r1)
	    .style("fill", "steelblue")
	    .style("fill-opacity", ".5");
    
	svg_venn_diag
		.append("circle")
		.attr("id","venn_diag_c2")
	    .attr("cx", c2x)
	    .attr("cy", 180-30)
	    .attr("r", r2)
	    .style("fill", "brown")
	    .style("fill-opacity", ".5");
	
	
	svg_venn_diag
		.append("text")
		.attr("x",left_margin-10)
		.attr("y",70-30)
		.attr("font-family","sans-serif")
		.attr("font-size","18px")
		.attr("fill","black")
		.text("Intersection: " + Math.round(supp * numOfArchs()));
	
	svg_venn_diag
		.append("text")
		.attr("x",c1x-110)
		.attr("y",180+r1+50-30)
		.attr("font-family","sans-serif")
		.attr("font-size","18px")
		.attr("fill","steelblue")
		.text("Selected:" + numOfSelectedArchs() );
	svg_venn_diag
		.append("text")
		.attr("x",c1x+30)
		.attr("y",180+r1+50-30)
		.attr("font-family","sans-serif")
		.attr("font-size","18px")
		.attr("fill","brown")
		.text("Features:" + Math.round(F_size * numOfArchs()) );
}



