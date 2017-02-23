/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package rbsa.eoss.server;


import java.io.IOException;
import java.io.InputStream;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Stack;

import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.google.gson.Gson;

import rbsa.eoss.DrivingFeature;
import rbsa.eoss.DrivingFeaturesGenerator;
import rbsa.eoss.Result;
import rbsa.eoss.ResultCollection;
import rbsa.eoss.ResultManager;
import rbsa.eoss.local.Params;


/**
 *
 * @author Bang
 */




@WebServlet(name = "IFEEDServlet", urlPatterns = {"/IFEEDServlet"})
public class IFEEDServlet extends HttpServlet {
    
	private static final long serialVersionUID = 1257649107469947355L;

	private Gson gson = new Gson();
    ResultManager RM = ResultManager.getInstance();
    
    private static IFEEDServlet instance=null;
	ServletContext sctxt;
	ServletConfig sconfig;
    
	ArrayList<IFEEDServlet.ArchInfo> architectures;
	rbsa.eoss.DrivingFeaturesGenerator dfsGen;
    
    
    /**
     *
     * @throws ServletException
     */
    @Override
    public void init() throws ServletException{ 
    	instance = this;
    	sctxt = this.getServletContext();
    	sconfig = this.getServletConfig();
    	architectures = new ArrayList<>();
    }

    
    
    
    
    
    // <editor-fold defaultstate="collapsed" desc="HttpServlet methods. Click on the + sign on the left to edit the code.">
    /**
     * Handles the HTTP <code>GET</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
    }

    
    
    
    
    
    /**
     * Handles the HTTP <code>POST</code> method.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
    	

        String outputString="";
        String requestID = request.getParameter("ID");
        try {
                    	
        if (requestID.equalsIgnoreCase("extractInfoFromBitString")){
            String bitString_string = request.getParameter("bitString");
            int cnt = bitString_string.length();
//            boolean[] bitString = new boolean[cnt];
            int norb = Params.orbit_list.length;
            int ninstr = Params.instrument_list.length;
            ArrayList<instrumentsInOrbit> architecture = new ArrayList<>();
            int b = 0;
            for (int i= 0;i<norb;i++) {
                String orbit = Params.orbit_list[i];
                instrumentsInOrbit thisOrbit = new instrumentsInOrbit(orbit);
                for (int j= 0;j<ninstr;j++) { 
                    if (bitString_string.substring(b,b+1).equalsIgnoreCase("1")){
                        String inst = Params.instrument_list[j];
                        thisOrbit.addToChildren(inst);
                    }
                    b++;
                }
                architecture.add(thisOrbit);
            }
            String jsonObj = gson.toJson(architecture);
            outputString = jsonObj;

        }
        
        else if (requestID.equalsIgnoreCase("import_new_data")){
            String path_input = request.getParameter("filePath");
            String[] paths;
            if(path_input.contains(",")){
            	paths = path_input.split(",");
            }else{
            	paths = new String[1];
            	paths[0] = path_input;
            }
            architectures = new ArrayList<>();
            for(String path:paths){
                InputStream file = sctxt.getResourceAsStream(path);
                ResultCollection RC = RM.loadResultCollectionFromInputStream(file);
                Stack<Result> results = RC.getResults();
                
                int size = architectures.size();
                for (int i=0;i<results.size();i++){
                	Result resu = results.get(i);
                    if(resu.getScience()>=0.0001){
                        double sci = resu.getScience();
                        double cost = resu.getCost();
                        boolean[] bitString = resu.getArch().getBitString();
                        ArchInfo arch = new ArchInfo(i+size,sci,cost,bitString);
                        arch.setStatus("originalData");
                        architectures.add(arch);                    	
                    }
                }
            }
            String jsonObj = gson.toJson(architectures);
            outputString = jsonObj;
        }
        

        
        else if (requestID.equalsIgnoreCase("getInstrumentList")){
            ArrayList<String> instrumentList = new ArrayList<>(); 
            String[] instruments = Params.instrument_list;
            for (String inst:instruments){
                instrumentList.add(inst);
            }
            String jsonObj = gson.toJson(instrumentList);
            outputString = jsonObj;

        }
        else if (requestID.equalsIgnoreCase("getOrbitList")){
            ArrayList<String> orbitList = new ArrayList<>(); 
            String[] orbits = Params.orbit_list;
            for (String orb:orbits){
                orbitList.add(orb);
            }
            String jsonObj = gson.toJson(orbitList);
            outputString = jsonObj;
        }

        else if(requestID.equalsIgnoreCase("generateDrivingFeatures")){
        	        	
            double support_threshold = Double.parseDouble(request.getParameter("supp"));
            double confidence_threshold = Double.parseDouble(request.getParameter("conf"));
            double lift_threshold = Double.parseDouble(request.getParameter("lift")); 
            
            //[1,2,3,5]
            String selected_raw = request.getParameter("selected");
            selected_raw = selected_raw.substring(1, selected_raw.length()-1);
            String[] selected_split = selected_raw.split(",");
            //[1,2,3,5]
            String non_selected_raw = request.getParameter("non_selected");
            non_selected_raw = non_selected_raw.substring(1, non_selected_raw.length()-1);
            String[] non_selected_split = non_selected_raw.split(",");            
                                                
            ArrayList<int[][]> behavioral = new ArrayList<>();
            ArrayList<int[][]> non_behavioral = new ArrayList<>();
            
            for (String selected:selected_split) {
            	int id = Integer.parseInt(selected);
                int[][] temp = boolArray2IntMat(this.architectures.get(id).getBitString());
                behavioral.add(temp);
            }
            
            
            
            System.out.println("why won't this be printed1");
            for (String non_selected:non_selected_split) {
            	int id = Integer.parseInt(non_selected);
                int[][] temp = boolArray2IntMat(this.architectures.get(id).getBitString());
                non_behavioral.add(temp);
            }
            
            System.out.println("why won't this be printed2");
            
            System.out.println("b: " + behavioral.size() + " nb: " + non_behavioral.size());
            
            
            dfsGen = new DrivingFeaturesGenerator();
            dfsGen.initialize2(behavioral, non_behavioral, support_threshold,confidence_threshold,lift_threshold);
            
////            "[{"name":"thisName","expression":"present(ACE_ORCA)&&present(DESD_LID)"},{"name":"secondOne","expression":"present(DESD_LID)||numOrbitUsed(3)"}]"
//            String userDefFilters_raw = request.getParameter("userDefFilters");
//
//            if (userDefFilters_raw==null){
//            }else{
////                userDefFilters_raw = userDefFilters_raw.substring(2, userDefFilters_raw.length()-2);
////              {"name":"thisName","expression":"present(ACE_ORCA)&&present(DESD_LID)"},{"name":"secondOne","expression":"present(DESD_LID)||numOrbitUsed(3)"}
//
//              while(true){
//              	
//              	if(!userDefFilters_raw.contains("},") && !userDefFilters_raw.contains("}]")){
//              		if(!userDefFilters_raw.endsWith("}")){
//              			break;
//              		}
//              	}
//              	
//              	int paren1 = userDefFilters_raw.indexOf("{");
//                int paren2;
//                
//                if(userDefFilters_raw.indexOf("},")!=-1){
//                	paren2 = userDefFilters_raw.indexOf("},");
//                }else if (userDefFilters_raw.indexOf("}]")!=-1){
//                	paren2 = userDefFilters_raw.indexOf("}]");
//                } else {
//                	paren2 = userDefFilters_raw.length()-1;
//                }
//                  
//                String thisFilter = userDefFilters_raw.substring(paren1+1,paren2);
//              	String thisFilterName = thisFilter.split(",",2)[0]; //"name":"thisName"
//              	thisFilterName = thisFilterName.split(":")[1]; // "thisName"
//              	thisFilterName = thisFilterName.substring(1, thisFilterName.length()-1); //thisName
//              	String thisFilterExp = thisFilter.split(",",2)[1];  //"expression":"present(ACE_ORCA)&&present(DESD_LID)"
//              	thisFilterExp = thisFilterExp.split(":")[1]; // "thisName"
//              	thisFilterExp = thisFilterExp.substring(1, thisFilterExp.length()-1); //thisName
//              	
//              	dfsGen.addUserDefFilter(thisFilterName,thisFilterExp);
//              	
//              	if(userDefFilters_raw.substring(paren2).length()==1){
//              		break;
//              	}else{
//              		userDefFilters_raw = userDefFilters_raw.substring(paren2+1);
//              	}
//              }
//            	
//            }
            
            
            
            
            
            
            
            ArrayList<DrivingFeature> DFs;
            DFs = dfsGen.getDrivingFeatures();
            //Collections.sort(DFs,DrivingFeature.DrivingFeatureComparator);
            String jsonObj = gson.toJson(DFs);
            outputString = jsonObj;
   
        }
        
        
        
        
        } catch(Exception e){
            System.out.println(e.getMessage());
        }
        
        response.flushBuffer();
        response.setContentType("text/html");
        response.setHeader("Cache-Control", "no-cache");
        response.getWriter().write(outputString);        
    }
    
    
    public static IFEEDServlet getInstance()
    {
        if( instance == null ) 
        {
            instance = new IFEEDServlet();
        }
        return instance;
    }


    
    
    
    public int[][] bitString2IntMat(String bitString){
        int norb = Params.orbit_list.length;
        int ninstr = Params.instrument_list.length;
        int[][] mat = new int[norb][ninstr];
        int cnt=0;
        for(int i=0;i<norb;i++){
            for(int j=0;j<ninstr;j++){
                if(bitString.substring(cnt, cnt+1).equalsIgnoreCase("1")){
                    mat[i][j]=1;
                }else{
                    mat[i][j]=0;
                }
                cnt++;
            }
        }
        return mat;
    }
    public int[][] boolArray2IntMat(boolean[] bool){
        int norb = Params.orbit_list.length;
        int ninstr = Params.instrument_list.length;
        int[][] mat = new int[norb][ninstr];
        int cnt=0;
        for(int i=0;i<norb;i++){
            for(int j=0;j<ninstr;j++){
                if(bool[cnt]==true){
                    mat[i][j]=1;
                }else{
                    mat[i][j]=0;
                }
                cnt++;
            }
        }
        return mat;
    }
    
    public boolean compareTwoBitStrings(String b1, boolean[] b2){
        for(int i=0;i<b2.length;i++){
            if(b1.substring(i,i+1).equalsIgnoreCase("0") && b2.equals(true)){
                return false;
            } else if (b1.substring(i,i+1).equalsIgnoreCase("1") && b2.equals(false)){
            	return false;
            }
        }
    	return true;
    }
    
    public boolean compareTwoBitStrings(boolean[] b1, boolean[] b2){
        for(int i=0;i<b1.length;i++){
            if(b1[i]!=b2[i]){
                return false;
            }
        }
        return true;
    }
    
    
    class instrumentsInOrbit{
        private String orbit;
        private ArrayList<String> children;
        private ArrayList<String> filterLogic;
        
        public instrumentsInOrbit(String orbit){
            this.orbit = orbit;
            children = new ArrayList<>();
            filterLogic = new ArrayList<>();
        }
       public void addToChildren(String instrument){
           children.add(instrument);
       }
       public void addToChildren(String instrument, String logic){
           children.add(instrument);
           filterLogic.add(logic);
       }
       
    }
    
    
    class ArchInfo{
    	private int id;
    	private boolean[] bitString;
        private double science;
        private double cost;
        private String status;
        
        public ArchInfo(){
        }
        
        public ArchInfo(int id, double science,double cost, boolean[] bitString){
            this.id = id;
        	this.science = science;
            this.cost = cost;
            this.bitString = bitString;
        }
        public void setStatus(String status){
            this.status=status;
        }
        
        public boolean[] getBitString(){
        	return this.bitString;
        }
        
        
    }
    
    
    
    
}


        



