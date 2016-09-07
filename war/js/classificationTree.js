/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


function getClassificationTree(){

    var support_threshold = d3.select("[id=support_threshold_input]")[0][0].value;
    var confidence_threshold = d3.select("[id=confidence_threshold_input]")[0][0].value;
    var lift_threshold = d3.select("[id=lift_threshold_input]")[0][0].value;

    var selectedArchs = d3.selectAll("[class=dot_clicked]");
    var nonSelectedArchs = d3.selectAll("[class=dot]");
    var numOfSelectedArchs = selectedArchs.size();
    var numOfNonSelectedArchs = nonSelectedArchs.size();
    var selectedBitStrings = [];
    var nonSelectedBitStrings = [];
    selectedBitStrings.length = 0;
    nonSelectedBitStrings.length=0;
    
    
    
    buttonClickCount_classificationTree += 1;
    getClassificationTree_numOfArchs.push([{numOfSelectedArchs,numOfNonSelectedArchs}]);
    
    
    
    
    for (var i = 0; i < numOfSelectedArchs; i++) {
        var tmpBitString = booleanArray2String(selectedArchs[0][i].__data__.archBitString);
        selectedBitStrings.push(tmpBitString);
    }
    for (var i = 0; i < numOfNonSelectedArchs; i++) {
        var tmpBitString = booleanArray2String(nonSelectedArchs[0][i].__data__.archBitString);
        nonSelectedBitStrings.push(tmpBitString);
    }
   
    jsonObj_tree = buildClassificationTree(selectedBitStrings,nonSelectedBitStrings,support_threshold,confidence_threshold,lift_threshold,userDefFilters);
    jsonObj_tree_nested = constructNestedTreeStructure(jsonObj_tree);
    classificationTree_window = window.open('classificationTree.html');
}



function buildClassificationTree(selected,nonSelected,
		support_threshold,confidence_threshold,lift_threshold,
		userDefFilters){
	
	var output;
    $.ajax({
        url: "classificationTreeServlet",
        type: "POST",
        data: {ID: "buildClassificationTree",selected: JSON.stringify(selected),nonSelected:JSON.stringify(nonSelected),
        	supp:support_threshold,conf:confidence_threshold,lift:lift_threshold,
        	userDefFilters:JSON.stringify(userDefFilters)},
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



function constructNestedTreeStructure(tree_objs){
	var root = tree_objs[0];
	addBranches(root,tree_objs);
	return root;
}
function addBranches(parent,objs){
	
	if (parent.name==="leaf"){
//		parent.children = false;
		return;
	} 
	var i = searchByNodeID(parent.id_c1,objs);
	var j = searchByNodeID(parent.id_c2,objs);
	
	if(i>=0 && j>=0){
		var c1 = objs[i];
		addBranches(c1,objs);
		c1.cond = true;
//		parent.child1 = c1;
		var c2 = objs[j];
		addBranches(c2,objs);
		c2.cond = false;
//		parent.child2 = c2;
//		parent.hasChildren = true;
		parent.children = [c1, c2];
	} else{
//		parent.hasChildren = false;
	}

}
function searchByNodeID(id,objs){
	for(var i=0;i<objs.length;i++){
		if(objs[i].nodeID===id){
			return i;
		}
	}
	return -1;
}


