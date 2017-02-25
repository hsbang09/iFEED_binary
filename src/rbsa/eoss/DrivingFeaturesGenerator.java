

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package rbsa.eoss;


import java.util.ArrayList;
//import weka.gui.treevisualizer.PlaceNode2;
//import weka.gui.treevisualizer.TreeVisualizer;
//import weka.core.converters.ConverterUtils.DataSink;
//import weka.core.converters.CSVSaver;
//import java.io.File;
//import java.awt.BorderLayout;
import java.util.Arrays;
//import javax.swing.JFrame;

import rbsa.eoss.Apriori.Feature;
import rbsa.eoss.local.Params;
import rbsa.eoss.server.IFEEDServlet;


import weka.classifiers.trees.J48;
import weka.core.Attribute;
import weka.core.FastVector;
import weka.core.Instance;
import weka.core.Instances;

/**
 *
 * @author Bang
 */
public class DrivingFeaturesGenerator {

    private ArrayList<Integer> behavioral;
    private ArrayList<Integer> non_behavioral;
    private ArrayList<Integer> population;
    
    private double[][] dataFeatureMat;
    private double supp_threshold;
    private double conf_threshold;
    private double lift_threshold;
    private double[] thresholds;
    
    private double ninstr;
    private double norb;
    
    private ArrayList<DrivingFeature> drivingFeatures;
    private ArrayList<String> userDefFeatures;
    
    private ArrayList<IFEEDServlet.ArchInfo> archsInfo;
    private FilterExpressionHandler feh;
    
    double stepSize = 0.1;
    

    public DrivingFeaturesGenerator(){
    }
    
    
    public void initialize(ArrayList<Integer> behavioral, ArrayList<Integer> non_behavioral, ArrayList<IFEEDServlet.ArchInfo> archs,
    					double supp, double conf, double lift){
        
    	this.thresholds = new double[3];
    	thresholds[0] = supp;
    	thresholds[1] = lift;
    	thresholds[2] = conf;
      
    	this.behavioral = behavioral;
    	this.non_behavioral = non_behavioral;
    	this.population = new ArrayList<>();
    	this.population.addAll(behavioral);
    	this.population.addAll(non_behavioral);
      
		
		this.supp_threshold= (double) behavioral.size() / population.size() * 0.5 ;
		this.conf_threshold=0;
		this.lift_threshold=0;      
		this.stepSize = supp_threshold * 0.7;
      
      this.archsInfo = archs;
      this.ninstr = 12;
      this.norb = 5;
      
      userDefFeatures = new ArrayList<>();
      drivingFeatures = new ArrayList<>();
      feh = new FilterExpressionHandler();
      feh.setArchs(archs,behavioral,non_behavioral);      
  }    
    
    
    
    private double[] computeMetrics(ArrayList<Integer> matchedArchIDs){
        
        if (matchedArchIDs.isEmpty()){
            double[] metrics = {0,0,0,0};
            return metrics;
        }

        double cnt_all= (double) non_behavioral.size() + behavioral.size();
        double cnt_F=0.0;
        double cnt_S= (double) behavioral.size();
        double cnt_SF=0.0;

        // Need to count cnt_SF and cnt_F
        for(int id:matchedArchIDs){
            cnt_F++;
            if(behavioral.contains(id)){
                cnt_SF++;
            }
        }
        double cnt_NS = cnt_all-cnt_S;
        double cnt_NF = cnt_all-cnt_F;
        double cnt_S_NF = cnt_S-cnt_SF;
        double cnt_F_NS = cnt_F-cnt_SF;
        
    	double[] metrics = new double[4];
    	
        double support = cnt_SF/cnt_all;
        double support_F = cnt_F/cnt_all;
        double support_S = cnt_S/cnt_all;
        
        double lift=0;
        double conf_given_F=0;
        if(cnt_F!=0){
            lift = (cnt_SF/cnt_S) / (cnt_F/cnt_all);
            conf_given_F = (cnt_SF)/(cnt_F);   // confidence (feature -> selection)
        }
        double conf_given_S = (cnt_SF)/(cnt_S);   // confidence (selection -> feature)

    	metrics[0] = support;
    	metrics[1] = lift;
    	metrics[2] = conf_given_F;
    	metrics[3] = conf_given_S;
    	
    	return metrics;
    }  

    

    public ArrayList<DrivingFeature> getPrimitiveDrivingFeatures(ArrayList<Integer> hist){
    	    	
    	this.drivingFeatures = new ArrayList<>();
        ArrayList<int[]> satList = new ArrayList<>();
    	ArrayList<String> candidate_features = new ArrayList<>();
    	
    	
        // Input variables
        // present, absent, inOrbit, notInOrbit, together2, togetherInOrbit2
        // separate2, separate3, together3, togetherInOrbit3, emptyOrbit
        // numOrbits, numOfInstruments, subsetOfInstruments
        
        // Preset filter expression example:
        // {presetName[orbits;instruments;numbers]}    
                    
        for(int i=0;i<ninstr;i++){
            // present, absent
            candidate_features.add("{present[;"+i+";]}");
            candidate_features.add("{absent[;"+i+";]}");
            
            for(int j=0;j<norb+1;j++){
                // numOfInstruments (number of specified instruments across all orbits)
                candidate_features.add("{numOfInstruments[;"+i+";"+j+"]}");
            }                
            
            for(int j=0;j<i;j++){
                // together2, separate2
                candidate_features.add("{together[;"+i+","+j+";]}");
                candidate_features.add("{separate[;"+i+","+j+";]}");
                for(int k=0;k<j;k++){
                    // together3, separate3
                    candidate_features.add("{together[;"+i+","+j+","+k+";]}");
                    candidate_features.add("{separate[;"+i+","+j+","+k+";]}");
                }
            }
        }
        for(int i=0;i<norb;i++){
            for(int j=1;j<9;j++){
                // numOfInstruments (number of instruments in a given orbit)
                candidate_features.add("{numOfInstruments["+i+";;"+j+"]}");
            }
            // emptyOrbit
            candidate_features.add("{emptyOrbit["+i+";;]}");
            // numOrbits
            candidate_features.add("{numOrbits[;;"+i+1+"]}");
            for(int j=0;j<ninstr;j++){
                // inOrbit, notInOrbit
                candidate_features.add("{inOrbit["+i+";"+j+";]}");
                candidate_features.add("{notInOrbit["+i+";"+j+";]}");
                for(int k=0;k<j;k++){
                    // togetherInOrbit2
                    candidate_features.add("{togetherInOrbit["+i+";"+j+","+k+";]}");
                    for(int l=0;l<k;l++){
                        // togetherInOrbit3
                        candidate_features.add("{togetherInOrbit["+i+";"+j+","+k+","+l+";]}");
                    }
                }
            }
        }
        for(int i=0;i<16;i++){
            // numOfInstruments (across all orbits)
            candidate_features.add("{numOfInstruments[;;"+i+"]}");
        }
        
        
        
        for(String feature:candidate_features){        	
            String feature_expression_inside = feature.substring(1,feature.length()-1);
            String name = feature_expression_inside.split("\\[")[0];
            double[] metrics = feh.processSingleFilterExpression_computeMetrics(feature_expression_inside);
            if(metrics[0]>supp_threshold){
                drivingFeatures.add(new DrivingFeature(name,feature,metrics,true));
                //int[] satArray = satisfactionArray(matchedArchIDs,population); 
                //satList.add(satArray);
            }
        }      	
    	
        
        // Test the user-defined features
        if(!this.userDefFeatures.isEmpty()){
            for(String exp:this.userDefFeatures){
                if(exp.isEmpty()){
                    continue;
                }
                ArrayList<Integer> matchedArchIDs = feh.processFilterExpression(exp, new ArrayList<Integer>(), "||");
                double[] metrics = this.computeMetrics(matchedArchIDs);
                if(metrics[0]>supp_threshold && metrics[1] > lift_threshold && metrics[2] > conf_threshold && metrics[3] > conf_threshold){
                    drivingFeatures.add(new DrivingFeature(exp,exp,metrics,false));
                   // int[] satArray = satisfactionArray(matchedArchIDs,population); 
                   // satList.add(satArray);
                }             
            }
        }

//        // Get feature satisfaction matrix
//        this.dataFeatureMat = new double[population.size()][drivingFeatures.size()];
//        for(int i=0;i<population.size();i++){
//        	for(int j=0;j<drivingFeatures.size();j++){
//    			this.dataFeatureMat[i][j] = (double) satList.get(j)[i];
//        	}
//        }        

        
	    if(drivingFeatures.size() > 300 || drivingFeatures.size() < 100){
	    	System.out.println("Size: " + drivingFeatures.size() +" Treshold: "+ this.supp_threshold + " stepSize: " + stepSize);
	    	if(hist.size() < 7){
		    	int current = 0;
		    	if(drivingFeatures.size()>300) current = 1;
		    	else current = -1; 
		    	int last = 0;
		    	if(hist.size()>0) last = hist.get(hist.size()-1);

		    	if(current!=last && last !=0){
		    		stepSize = stepSize*0.7;
		    	}
		    	
		    	if(current==1){
		    		this.supp_threshold = this.supp_threshold + stepSize;
		    	}else{
		    		this.supp_threshold = this.supp_threshold - stepSize;	    		
		    	}
		    	hist.add(current);
		    	this.drivingFeatures = this.getPrimitiveDrivingFeatures(hist);
	    	}

	    }else{System.out.println("driving features extracted: " + drivingFeatures.size());}
	    
	    
	    return drivingFeatures;        
    }
    
    
    public ArrayList<DrivingFeature> getDrivingFeatures(){
    	
    	ArrayList<DrivingFeature> dfs=new ArrayList<>();
    	
    	int[] label_int = satisfactionArray(behavioral,population); 
    	double[] label = new double[label_int.length];
    	for(int i=0;i<label_int.length;i++){
    		label[i] = (double) label_int[i];
    	}

        // Create a new instance of Apriori
        Apriori ap = new Apriori(drivingFeatures, this.dataFeatureMat, label, thresholds);
        
        // Run Apriori algorithm
        ArrayList<Apriori.Feature> new_features = ap.runApriori(2,false,100);

        // Create a new list of driving features (assign new IDs)
        int id=0;
        for(int f=0;f<new_features.size();f++){
            
            Apriori.Feature feat = new_features.get(f);
            String expression="";
            String name="";
            ArrayList<Integer> featureIndices = feat.getElements();
            
            int[] indices_array = new int[featureIndices.size()];
            
            for(int i=0;i<featureIndices.size();i++){
                indices_array[i] = featureIndices.get(i);
            }

            boolean first = true;
            for(int index:featureIndices){
                if(first){
                    first = false;
                }
                else{
                    expression = expression + "&&";
                    name = name + "&&";
                }
                DrivingFeature thisDF = this.drivingFeatures.get(index);
                expression = expression + thisDF.getExpression();
                name = name + thisDF.getName();
            }
            double[] metrics = feat.getMetrics();
            DrivingFeature df = new DrivingFeature(name,expression, metrics, false);

            dfs.add(df);
        }
        
//        // Define the new feature satisfaction matrix       
//        DoubleMatrix prev_sat_matrix = new DoubleMatrix(this.drivingFeaturesMatrix);
//        DoubleMatrix new_sat_matrix = prev_sat_matrix.mmul(mapping_old_and_new_feature_indices);        
//        
//        DoubleMatrix newDrivingFeaturesMatrix = DoubleMatrix.zeros(new_sat_matrix.getRows(), new_sat_matrix.getColumns());
//        for(int i=0;i<new_sat_matrix.getColumns();i++){
//            DoubleMatrix col = new_sat_matrix.getColumn(i);
//            col = col.eq(save_feature_length[i]);
//            newDrivingFeaturesMatrix.putColumn(i, col);
//        }
        
//        this.drivingFeaturesMatrix = newDrivingFeaturesMatrix.toArray2();
        this.drivingFeatures = dfs;
    	
    	return this.drivingFeatures;
    }
    
    
    
    
    
    
    public int[][] booleanToInt(boolean[][] b) {
        int[][] intVector = new int[b.length][b[0].length]; 
        for(int i = 0; i < b.length; i++){
            for(int j = 0; j < b[0].length; ++j) intVector[i][j] = b[i][j] ? 1 : 0;
        }
        return intVector;
    }
    
//    public static DrivingFeaturesGenerator getInstance()
//    {
//        if( instance == null ) 
//        {
//            instance = new DrivingFeaturesGenerator();
//        }
//        return instance;
//    }


    
    private int[] satisfactionArray(ArrayList<Integer> matchedArchIDs, ArrayList<Integer> allArchIDs){
        int[] satArray = new int[allArchIDs.size()];
        for(int i=0;i<allArchIDs.size();i++){
            int id = allArchIDs.get(i);
            if(matchedArchIDs.contains(id)){
                satArray[i]=1;
            }else{
                satArray[i]=0;
            }
        }
        return satArray;
    }    
    
    
//    public ArrayList<String> minRedundancyMaxRelevance(int numSelectedFeatures){
//        
//        int[][] m = dataFeatureMat;
//        int numFeatures = m[0].length;
//        int numData = m.length;
//        ArrayList<String> selected = new ArrayList<>();
//        
//        while(selected.size() < numSelectedFeatures){
//            double phi = -10000;
//            int save=0;
//            for(int i=0;i<numFeatures-1;i++){
//                if(selected.contains(""+i)){
//                    continue;
//                }
//
//                double D = getMutualInformation(i,numFeatures-1);
//                double R = 0;
//
//                for (String selected1 : selected) {
//                    R = R + getMutualInformation(i, Integer.parseInt(selected1));
//                }
//                if(!selected.isEmpty()){
//                   R = (double) R/selected.size();
//                }
//                
////                System.out.println(D-R);
//                
//                if(D-R > phi){
//                    phi = D-R;
//                    save = i;
//                }
//            }
////            System.out.println(save);
//            selected.add(""+save);
//        }
//        return selected;
//    }  
//    public double getMutualInformation(int feature1, int feature2){
//        
//        int[][] m = dataFeatureMat;
//        int numFeatures = m[0].length;
//        int numData = m.length;
//        double I;
//        
//        int x1=0,x2=0;
//        int x1x2=0,nx1x2=0,x1nx2=0,nx1nx2=0;      
//
//        for(int k=0;k<numData;k++){
//            if(m[k][feature1]==1){ // x1==1
//                x1++;
//                if(m[k][feature2]==1){ // x2==1
//                    x2++;
//                    x1x2++;
//                } else{ // x2!=1
//                    x1nx2++;
//                }
//            } else{ // x1!=1
//                if(m[k][feature2]==1){ // x2==1 
//                    x2++;
//                    nx1x2++;
//                }else{ // x2!=1
//                    nx1nx2++;
//                }
//            }
//        }
//        double p_x1 =(double) x1/numData;
//        double p_nx1 = (double) 1-p_x1;
//        double p_x2 = (double) x2/numData;
//        double p_nx2 = (double) 1-p_x2;
//        double p_x1x2 = (double) x1x2/numData;
//        double p_nx1x2 = (double) nx1x2/numData;
//        double p_x1nx2 = (double) x1nx2/numData;
//        double p_nx1nx2 = (double) nx1nx2/numData;
//        
//        if(p_x1==0){p_x1 = 0.0001;}
//        if(p_nx1==0){p_nx1=0.0001;}
//        if(p_x2==0){p_x2=0.0001;}
//        if(p_nx2==0){p_nx2=0.0001;}
//        if(p_x1x2==0){p_x1x2=0.0001;}
//        if(p_nx1x2==0){p_nx1x2=0.0001;}
//        if(p_x1nx2==0){p_x1nx2=0.0001;}
//        if(p_nx1nx2==0){p_nx1nx2=0.0001;}
//        
//        double i1 = p_x1x2*Math.log(p_x1x2/(p_x1*p_x2));
//        double i2 = p_x1nx2*Math.log(p_x1nx2/(p_x1*p_nx2));
//        double i3 = p_nx1x2*Math.log(p_nx1x2/(p_nx1*p_x2));
//        double i4 = p_nx1nx2*Math.log(p_nx1nx2/(p_nx1*p_nx2));
//
//        I = i1 + i2 + i3 + i4;
//        return I;
//    }
    
    
//    public FastVector setDataFormat(){
//        
//            FastVector bool = new FastVector();
//            bool.addElement("false");
//            bool.addElement("true");
//            FastVector attributes = new FastVector();
//
//            for(DrivingFeature df:drivingFeatures){
//                String name = df.getName();
//                attributes.addElement(new Attribute(name,bool));
//            }
//            
//            FastVector bool2 = new FastVector();
//            bool2.addElement("not selected");
//            bool2.addElement("selected ");
//            
//            attributes.addElement(new Attribute("class",bool2));
//            
//            return attributes;
//    }
//    
//    public Instances addData(Instances dataset){
//        
//        for(int i=0;i<behavioral.size()+non_behavioral.size();i++){
//            double[] values = new double[drivingFeatures.size()+1];
//            for(int j=0;j<drivingFeatures.size()+1;j++){
//                values[j] = (double) dataFeatureMat[i][j];
//            }
//            Instance thisInstance = new Instance(1.0,values);
//            dataset.add(thisInstance);
//        }
//        return dataset;
//    }
//    
//
//
//    public String buildTree(boolean recomputeDFs) {
//    	  
//        String graph="";
//        if(recomputeDFs){
//        	getDrivingFeatures();
//        }
//        int[][] mat = getDataFeatureMat();
//        ClassificationTreeBuilder ctb = new ClassificationTreeBuilder(mat);
//        
//        try{
//            ctb.setDrivingFeatures(drivingFeatures);
//        	ctb.buildTree();
//        	graph = ctb.printTree_json();
//        	
//
//        } catch(Exception e){
//            e.printStackTrace();
//        }
//        
//        return graph;
//    }
//    
//    
//    public String buildTree_Weka() { // using WEKA
//  
//        String graph="";
////        long t0 = System.currentTimeMillis();
//        J48 tree = new J48();
//        getDrivingFeatures();
//        getDataFeatureMat();
//        try{
//            
//            FastVector attributes = setDataFormat();
//            Instances dataset = new Instances("Tree_dataset", attributes, 100000);
//            dataset.setClassIndex(dataset.numAttributes()-1);
//            dataset = addData(dataset);
//            dataset.compactify();
//
////            // save as CSV
////            CSVSaver saver = new CSVSaver();
////            saver.setInstances(dataset);
////            saver.setFile(new File(Params.path + "\\tmp_treeData.clp"));
////            saver.writeBatch();
//            
//            System.out.println("numAttributes: " + dataset.numAttributes());
//            System.out.println("num instances: " + dataset.numInstances());
//            
//            String [] options = new String[2];
//            options[0] = "-C";
//            options[1] = "0.05";
//            tree.setOptions(options);
//            
////            Evaluation eval = new Evaluation(dataset);
////            eval.crossValidateModel(tree, dataset, 10, new Random(1));
//            tree.buildClassifier(dataset);
//            
////            System.out.println(eval.toSummaryString("\nResults\n\n", false));
////            System.out.println(eval.toMatrixString());
////            System.out.println(tree.toSummaryString());
////            String summary = tree.toSummaryString();
////            String evalSummary = eval.toSummaryString("\nResults\n\n", false);
////            String confusion = eval.toMatrixString();
//            graph = tree.graph();
//            
//
//            
////Number of leaves: 21
////Size of the tree: 41
////Results
////Correctly Classified Instances        2550               97.3654 %
////Incorrectly Classified Instances        69                2.6346 %
////Kappa statistic                          0.9385
////Mean absolute error                      0.0418
////Root mean squared error                  0.1603
////Relative absolute error                  9.6708 %
////Root relative squared error             34.4579 %
////Total Number of Instances             2619
////=== Confusion Matrix ===
////    a    b   <-- classified as
//// 1771   19 |    a = false
////   50  779 |    b = true
//
//            
//            
////            System.out.println(graph);
//            
////            TreeVisualizer tv = new TreeVisualizer(null, tree.graph(), new PlaceNode2());
////            JFrame jf = new JFrame("Weka Classifier Tree Visualizer: J48");
////            jf.setDefaultCloseOperation(JFrame.DISPOSE_ON_CLOSE);
////            jf.setSize(800, 600);
////            jf.getContentPane().setLayout(new BorderLayout());
////            jf.getContentPane().add(tv, BorderLayout.CENTER);
////            jf.setVisible(true);
////            // adjust tree
////            tv.fitToScreen();
//            
////            long t1 = System.currentTimeMillis();
////            System.out.println( "Tree building done in: " + String.valueOf(t1-t0) + " msec");
//        } catch(Exception e){
//            e.printStackTrace();
//        }
//        
//        return graph;
//    }
    

    
    public void addUserDefFeature(String expression){
    	this.userDefFeatures.add(expression);
    }
    
    

}
