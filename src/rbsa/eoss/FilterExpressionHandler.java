/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package rbsa.eoss;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Set;
import java.util.HashSet;
import java.util.Collections;

import rbsa.eoss.local.Params;
import rbsa.eoss.server.IFEEDServlet.ArchInfo;


/**
 *
 * @author bang
 */
public class FilterExpressionHandler {

    private String[] instr_list;
    private String[] orbit_list;
    private int norb;
    private int ninstr;
    private JessExpressionAnalyzer jea;
    private ArrayList<ArchInfo> archs;
    
            
    public FilterExpressionHandler(){
        instr_list = Params.instrument_list;
        orbit_list = Params.orbit_list;
        norb = orbit_list.length;
        ninstr = instr_list.length;
        jea = new JessExpressionAnalyzer();
    }

    public void setArchs(ArrayList<ArchInfo> inputArchs){
    	archs = inputArchs;
    }
    
    
    public ArrayList<Integer> processSingleFilterExpression(String inputExpression){
        boolean preset;
        if(inputExpression.contains(":")){
            preset=false;
        }else{
            preset=true;
        }
        return processSingleFilterExpression(inputExpression,preset);
    }
    
    
    public ArrayList<Integer> processSingleFilterExpression(String inputExpression, boolean preset){
        // Examples of feature expressions 
        // Preset filter: {presetName[orbits;instruments;numbers]}   
        
        ArrayList<Integer> matchedArchIDs = new ArrayList<>();
        String exp;
        if(inputExpression.startsWith("{") && inputExpression.endsWith("}")){
            exp = inputExpression.substring(1,inputExpression.length()-1);
        }else{
            exp = inputExpression;
        }
        
    
        String presetName = exp.split("\\[")[0];
        String arguments = exp.substring(0,exp.length()-1).split("\\[")[1];
        
        String[] argSplit = arguments.split(";");
        String[] orbits = new String[1];
        String[] instruments = new String[1];
        String[] numbers = new String[1];
        
        if(argSplit.length>0){
            orbits = argSplit[0].split(",");
        }
        if(argSplit.length>1){
            instruments = argSplit[1].split(",");
        }
        if(argSplit.length>2){
            numbers = argSplit[2].split(",");
        }


        for(ArchInfo a:archs){
            int ArchID = a.getID();
            String bitString = boolArray2boolString(a.getBitString());
            if(comparePresetFilter(bitString, presetName,orbits,instruments,numbers)){
                matchedArchIDs.add(ArchID);
            }
        }
        
        return matchedArchIDs;
    }    
    
    

    
    
    public boolean comparePresetFilter(String bitString, String type, String[] orbits, String[] instruments, String[] numbers){
        
        int[][] mat = booleanString2IntArray(bitString);
        
        if(type.equalsIgnoreCase("present")){
            int instrument = Integer.parseInt(instruments[0]);
            for (int i=0;i<norb;i++) {
                if (mat[i][instrument]==1) return true;
            }
            return false;
        } else if(type.equalsIgnoreCase("absent")){
            
            int instrument = Integer.parseInt(instruments[0]);
            for (int i = 0; i < norb; ++i) {
                if (mat[i][instrument]==1) return false;
            }
            return true;  
        } else if(type.equalsIgnoreCase("inOrbit")){
            
            int orbit = Integer.parseInt(orbits[0]);
            int instrument = Integer.parseInt(instruments[0]);
            return mat[orbit][instrument] == 1;
            
        } else if(type.equalsIgnoreCase("notInOrbit")){
            
            int orbit = Integer.parseInt(orbits[0]);
            int instrument = Integer.parseInt(instruments[0]);
            return mat[orbit][instrument] == 0;
            
        } else if(type.equalsIgnoreCase("together")){
            
            for(int i=0;i<norb;i++){
                boolean together = true;
                for(int j=0;j<instruments.length;j++){
                    int instrument = Integer.parseInt(instruments[j]);
                    if(mat[i][instrument]==0){together=false;}
                }
                if(together){return true;}
            }
            return false;
            
        } else if(type.equalsIgnoreCase("togetherInOrbit")){
            
            int orbit = Integer.parseInt(orbits[0]);
            boolean together = true;
            for(int j=0;j<instruments.length;j++){
                int instrument = Integer.parseInt(instruments[j]);
                if(mat[orbit][instrument]==0){together=false;}
            }
            if(together){return true;}            
            return false;
            
        } else if(type.equalsIgnoreCase("separate")){
            
            for(int i=0;i<norb;i++){
                boolean together = true;
                for(int j=0;j<instruments.length;j++){
                    int instrument = Integer.parseInt(instruments[j]);
                    if(mat[i][instrument]==0){together=false;}
                }
                if(together){return false;}
            }
            return true;
            
        } else if(type.equalsIgnoreCase("emptyOrbit")){
            
            int orbit = Integer.parseInt(orbits[0]);
            for(int i=0;i<ninstr;i++){
                if(mat[orbit][i]==1){return false;}
            }
            return true;
           
        } else if(type.equalsIgnoreCase("numOrbits")){
            
            int num = Integer.parseInt(numbers[0]);
            int count = 0;
            for (int i = 0; i < norb; ++i) {
               boolean empty= true;
               for (int j=0; j< ninstr; j++){
                   if(mat[i][j]==1){
                       empty= false;
                   }
               }
               if(empty==false) count++;
            }
            return count==num;     
            
        } else if(type.equalsIgnoreCase("numOfInstruments")){
            // Three cases
            //numOfInstruments[;i;j]
            //numOfInstruments[i;;j]
            //numOfInstruments[;;i]
            
            int num = Integer.parseInt(numbers[0]);
            int count = 0;

            if(orbits[0]!=null && !orbits[0].isEmpty()){
                // Number of instruments in a specified orbit
                int orbit = Integer.parseInt(orbits[0]);
                for(int i=0;i<ninstr;i++){
                    if(mat[orbit][i]==1){count++;}
                }
            }else if(instruments[0]!=null && !instruments[0].isEmpty()){
                // Number of a specified instrument
                int instrument = Integer.parseInt(instruments[0]);
                for(int i=0;i<norb;i++){
                    if(mat[i][instrument]==1){count++;}
                }
            }else{
                // Number of instruments in all orbits
                for(int i=0;i<norb;i++){
                    for(int j=0;j<ninstr;j++){
                        if(mat[i][j]==1){count++;}
                    }
                }
            }
            if(count==num){return true;}
            return false;
            
        } else if(type.equalsIgnoreCase("subsetOfInstruments")){ 
            // To be implemented later
        }
        
        return false;
    }
    
    
    
    public int[][] booleanString2IntArray(String booleanString){
        int[][] mat = new int[norb][ninstr];
        for(int i=0;i<norb;i++){
            for(int j=0;j<ninstr;j++){
                int loc = i*ninstr+j;
                mat[i][j] = Integer.parseInt(booleanString.substring(loc,loc+1));
            }
        }
        return mat;
    }
    
    


    
    public ArrayList<Integer> processFilterExpression(String filterExpression, ArrayList<Integer> prevMatched, String prevLogic){
        String e=filterExpression;
        // Remove outer parenthesis
        if(e.startsWith("(") && e.endsWith(")")){
            e=e.substring(1,e.length()-1);
        }
        ArrayList<Integer> currMatched = new ArrayList<>();
        boolean first = true;
        
        String e_collapsed;
        if(jea.getNestedParenLevel(e)==0){
            // Given expression does not have a nested structure
            if(e.contains("&&")||e.contains("||")){
               e_collapsed=e; 
            }else{
                currMatched = this.processSingleFilterExpression(filterExpression);
                return compareMatchedIDSets(prevLogic, currMatched, prevMatched);
            }
        }else{
            // Removes the nested structure
            e_collapsed = jea.collapseAllParenIntoSymbol(e);
        }

        while(true){
            String current_collapsed;
            String prev;
            
            if(first){
                // The first filter in a series to be applied
                prev = "||";
                first = false;
            }else{
                prev = e_collapsed.substring(0,2);
                e_collapsed = e_collapsed.substring(2);
                e = e.substring(2);
            }
            
            String next; // The imediate next logical connective
            int and = e_collapsed.indexOf("&&");
            int or = e_collapsed.indexOf("||");
            if(and==-1 && or==-1){
                next = "";
            } else if(and==-1){ 
                next = "||";
            } else if(or==-1){
                next = "&&";
            } else if(and < or){
                next = "&&";
            } else{
                next = "||";
            }
            
            if(!next.isEmpty()){
                if(next.equals("||")){
                    current_collapsed = e_collapsed.split("\\|\\|",2)[0];
                }else{
                    current_collapsed = e_collapsed.split(next,2)[0];
                }
                String current = e.substring(0,current_collapsed.length());
                e_collapsed = e_collapsed.substring(current_collapsed.length());
                e = e.substring(current_collapsed.length());
                currMatched = processFilterExpression(current,currMatched,prev); 
            }else{
                currMatched = processFilterExpression(e,currMatched,prev); 
                break;
            }
        }
        return compareMatchedIDSets(prevLogic, currMatched, prevMatched);
    }
    
    
    
    
    public ArrayList<Integer> compareMatchedIDSets(String logic, ArrayList<Integer> set1, ArrayList<Integer> set2){
        ArrayList<Integer> output = new ArrayList<>();
        if(logic.equals("&&")){
            for(int i:set1){
                if(set2.contains(i)){
                    output.add(i);
                }
            }
        }else{
            for(int i:set1){
                output.add(i);
            }
            for(int i:set2){
                if(!output.contains(i)){
                    output.add(i);
                }
            }
        }
        return output;
    }
    
    
    public String boolArray2boolString(boolean[] arr){
    	String out= "";
    	for(boolean b:arr){
    		if(b) {
    			out=out+"1";
    		}else{
    			out=out+"0";
    		}
    	}
    	return out;
    }
    
    

    
}
