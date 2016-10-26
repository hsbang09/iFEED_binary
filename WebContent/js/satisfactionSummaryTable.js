/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */



   

            function satisfactionScoreSummaryRequest(bitString){
                var jsonObj_satScores
                $.ajax({
                    url: "resultsGUIServlet",
                    type: "POST",
                    data: {ID: "satisfactionScoreSummaryRequest", bitString: bitString},
                    async: false,
                    success:function(data, textStatus, jqXHR) 
                    {
//                        d3.select("body").append("p").text(data);
                        jsonObj_satScores = JSON.parse(data);
                    },
                    error: function(jqXHR, textStatus, errorThrown) 
                    {
                        alert("error");
                    } 
                });
                return jsonObj_satScores;
            }
            function satisfactionScoreCompareRequest(bitString,bitString2){
                var jsonObj_satScores
                $.ajax({
                    url: "resultsGUIServlet",
                    type: "POST",
                    data: {ID: "satisfactionScoreCompareRequest", bitString: bitString,bitString2:bitString2},
                    async: false,
                    success:function(data, textStatus, jqXHR) 
                    {
//                        d3.select("body").append("p").text(data);
                        jsonObj_satScores = JSON.parse(data);
                    },
                    error: function(jqXHR, textStatus, errorThrown) 
                    {
                        alert("error");
                    } 
                });
                return jsonObj_satScores;
            }
            
            
            function getNSats(archNum){
                var nSats;
                $.ajax({
                    url: "resultsGUIServlet",
                    type: "POST",
                    data: {ID: "getNSats",archNum:archNum},
                    async: false,
                    success:function(data, textStatus, jqXHR) 
                    {
                        nSats = data;
                    },
                    error: function(jqXHR, textStatus, errorThrown) 
                    {
                        alert("error");
                    } 
                });
                return nSats;
            }
            
 

            function init_satisfactionSummary_Tree(source){
                
                var nodes = tree_satTable.nodes(source);
                nodes.forEach(function(n,i) {  // All nodes collapsed by default
                    if(n.level == "value"){
                    }
                    else {
                        n._children = n.children;
                        n.children = null;
                    }
                });
                draw_satisfactionSummary_Tree(source);
            }

            function draw_satisfactionSummary_Tree(source){


                root_satTable = source;

                var nodes = tree_satTable.nodes(source);
                var height = Math.max(500, nodes.length * barHeight_satTable + margin_satTable.top + margin_satTable.bottom);
                var satisfactionSummaryTreeDiv = d3.select("[id=satisfactionSummaryTree]");

                satisfactionSummaryTreeDiv.select("svg").transition()
                                .duration(duration_satTable)
                                .attr("height", height);
                                    
                 // Compute the "layout".
                nodes.forEach(function(n, i) {
                    n.x = i * barHeight_satTable;
                    if(n.level == "value"){n.y = 0;}
                    else if (n.level == "stakeholder"){ n.y = barHeight_satTable / 2;}
                    else if (n.level == "objective"){ n.y = barHeight_satTable;}
                    else {n.y = barHeight_satTable * 3 / 2;}
                });
                
                  // Update the nodes…
                var node = svg_satTable.selectAll("g.node")
                                    .data(nodes, function(d) { return d.id || (d.id = ++i_satTable); });



                var nodeEnter = node.enter().append("g")
                                            .attr("class", "node")
                                            .style("opacity", 1e-6)
                                            .on("click", click_satTable);
 

                // Enter any new nodes at the parent's previous position.
                nodeEnter.append("rect")
                            .attr("height", barHeight_satTable)
                            .attr("width", barWidth_satTable)
                            .style("fill", color_satTable);
                                                
                
                nodeEnter.append("text")
                            .attr("dy", 14)
                            .attr("dx", 5.5)
                            .style("font-size","11px")
                            .text(function(d) {
                                var numb = d.score;
                                numb = numb.toFixed(4);
                                if (compareMode == true){
                                    var numb2 = d.score2;
                                    numb2 = numb2.toFixed(4);
                                    
                                    if(d.level == "value"){
                                        return "Science Score: " + numb + " | " +numb2;
                                    } else if (d.level == "stakeholder"){
                                        return "[" + d.name + "] "+ " " + numb + " | " +numb2; 
                                    } else {
                                        return "[" + d.name + "] "+ d.description + ": " + numb + " | " +numb2; 
                                    }
                                    
                                } else{
                                    if(d.level == "value"){
                                        return "Science Score: " + numb;
                                    } else if (d.level == "stakeholder"){
                                        return "[" + d.name + "] "+ " " + numb; 
                                    } else {
                                        return "[" + d.name + "] "+ d.description + ": " + numb; 
                                    }
                                }
                            });
//                            .style("color",function(d){
//                                if(d.level == "value"){
//                                    return "#FFFFFF";
//                                }
//                                else{
//                                    return "#000000";
//                                }                                
//                            });

                // Transition nodes to their new position.
                nodeEnter.transition()
                            .duration(duration_satTable)
                            .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
                            .style("opacity", 1);

                node.transition()
                        .duration(duration_satTable)
                        .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; })
                        .style("opacity", 1)
                        .select("rect")
                        .style("fill", color_satTable);

                // Transition exiting nodes to the parent's new position.
                node.exit().transition()
                    .duration(duration_satTable)
                    .attr("transform", function(d) { 
                        return "translate(" + d.parent.y + "," + d.parent.x + ")"; 
                    })
                    .style("opacity", 1e-6)
                    .remove();

                // Stash the old positions for transition.
//                nodes.forEach(function(d) {
//                    d.x0 = d.x;
//                    d.y0 = d.y;
//                });

            }
            
            
            
                
            // Toggle children on click.
            function click_satTable(d) {
                if (d.level=="subobjective"){
                        var subobjName = d.name;
                        var factID;
                        var factID2;
                        if (compareMode == true){
                            factID = getFactIDFromSubobj(subobjName,1);
                            factID2 = getFactIDFromSubobj(subobjName,2);
                            console.log(factID +" " +factID2);
                            attributeScoreCompareRequest(subobjName);
                        } else{
                            factID = getFactIDFromSubobj(subobjName,1);
                            attributeScoreSummaryRequest(subobjName);
                        }
                        factHistoryFigureRequest(factID);
                        
                } else{
                    if (d.children) {
                        d._children = d.children;
                        d.children = null;
                    } else {
                        d.children = d._children;
                        d._children = null;
                    }
                        draw_satisfactionSummary_Tree(root_satTable);
                    }
                }

            function color_satTable(d) {
                
                if (compareMode == true){
                    if(d.score == d.score2){
                        if(d.level == "objective"){
                            return "#BFBFBF";
                        } else if(d.level=="subobjective"){
                            return "#DCDCDC";
                        }
                    }
                    if(d.score > d.score2){
                        if(d.level == "value"){return "#673900";}
                        else if (d.level == "stakeholder"){ return "#DF8D07";}
                        else if (d.level == "objective"){ return "#FEC406";}
                        else {return "#FFFF61";}
                    } else{
                        if(d.level == "value"){return "#071D70";}
                        else if (d.level == "stakeholder"){ return "#1644E9";}
                        else if (d.level == "objective"){ return "#1AB7FF";}
                        else {return "#32FFE5";}
                    }

                } else{
                    if(d.level == "value"){return "#2F75FF";}
                    else if (d.level == "stakeholder"){ return "#2FC5FF";}
                    else if (d.level == "objective"){ return "#A9FFFE";}
                    else {return "#F5FF91";}
                }
//                return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
            }
