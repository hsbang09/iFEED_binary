

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

package rbsa.eoss;

import java.util.ArrayList;
import java.util.Arrays;
import java.lang.Math;
import rbsa.eoss.DrivingFeaturesParams;
import rbsa.eoss.DrivingFeature;
import rbsa.eoss.Scheme;

import java.io.BufferedReader;
import java.io.FileReader;
import java.io.IOException;


/**
 *
 * @author Bang
 */
public class DrivingFeaturesGenerator2 {

    private double supp_threshold;
    private double confidence_threshold;
    private double lift_threshold;
    private String[] instrument_list;
    private String[] orbit_list;
    private int ninstr;
    private int norb;
    private String csv_path;
    
    private ArrayList<int[][]> behavioral;
    private ArrayList<int[][]> non_behavioral;
    
    private int max_num_of_instruments;
    
    private int[][] dataFeatureMat;
   
    private ArrayList<DrivingFeature> drivingFeatures;

    


    public DrivingFeaturesGenerator2(){
    	
        this.behavioral = new ArrayList<>();
        this.non_behavioral = new ArrayList<>();
    	this.orbit_list = DrivingFeaturesParams.orbit_list;
    	this.instrument_list = DrivingFeaturesParams.instrument_list;
    	this.norb = orbit_list.length;
    	this.ninstr = instrument_list.length;
        this.supp_threshold=DrivingFeaturesParams.support_threshold;
        this.confidence_threshold=DrivingFeaturesParams.confidence_threshold;
        this.lift_threshold=DrivingFeaturesParams.lift_threshold;
        this.csv_path=DrivingFeaturesParams.csv_path;
        this.drivingFeatures = new ArrayList<>();
        this.max_num_of_instruments=DrivingFeaturesParams.max_number_of_instruments;
        
        parseCSV(csv_path);
    }
    


    

    
    private double[] computeMetrics(Scheme s){
    	
    	double cnt_all= (double) non_behavioral.size();
        double cnt_F=0;
        double cnt_S= (double) behavioral.size();
        double cnt_SF=0;

        for (int[][] e : behavioral) {
            if (s.compare(e, "") == 1) cnt_SF = cnt_SF+1.0;
        }
        for (int[][] e : non_behavioral) {
            if (s.compare(e, "") == 1) cnt_F = cnt_F+1.0;
        }
    	
        double cnt_NS = cnt_all-cnt_S;
        double cnt_NF = cnt_all-cnt_F;
        double cnt_S_NF = cnt_S-cnt_SF;
        double cnt_F_NS = cnt_F-cnt_SF;
        
    	double[] metrics = new double[5];
    	
    	
        double support = cnt_SF/cnt_all;
        double support_F = cnt_F/cnt_all;
        double support_S = cnt_S/cnt_all;
        double lift = (cnt_SF/cnt_S) / (cnt_F/cnt_all);
        double conf_given_F = (cnt_SF)/(cnt_F);   // confidence (feature -> selection)
        double conf_given_S = (cnt_SF)/(cnt_S);   // confidence (selection -> feature)
//    	double added_valueFS = conf_given_F - support_S; // Added Value(feature  -> selection)
//    	double added_valueSF = conf_given_S - support_F; // Added Value (selection -> feature)
    	double cosine = support/Math.sqrt(support_F * support_S);
    	double leverage = support - support_F * support_S;
    	
//    	double convictionFS=0.0;
////    	double convictionSF=0.0;
//    	if (conf_given_F==1 || conf_given_S ==1){
//    	}else{
//        	convictionFS = (1-support_S)/(1-conf_given_F);  // Conviction (feature -> selection)
////        	convictionSF = (1-support_F)/(1-conf_given_S); // conviction (selection -> feature)
//    	}
    	
    	
//    	double odds_ratio = 0.0;
//    	if (cnt_S_NF != 0  && cnt_F_NS != 0){
//        	odds_ratio = cnt_SF*(cnt_all - cnt_S - cnt_F + cnt_SF)/(cnt_S_NF*cnt_F_NS);
//    	}
//    	double gini = 0.0;
//    	if(cnt_F!=0 && cnt_NF!=0){
//        	gini = support_F*(Math.pow(cnt_SF/cnt_F,2)+Math.pow(cnt_F_NS/cnt_F,2)) + 
//        			(1-support_F)*(Math.pow(cnt_S_NF/cnt_NF,2)+Math.pow((cnt_all-cnt_F-cnt_S+cnt_SF)/cnt_NF,2)) - 
//        			Math.pow(support_S,2) - Math.pow((1-support_S),2);
//    	}
//    	double certainty_factor = 0.0;
//    	if (1-support_S != 0){
//    		certainty_factor = (cnt_SF/cnt_F - support_S) / (1-support_S);
//    	}
    	
    	
//    	double all_confidence;
//    	double casual_confidence;
//    	double casual_support;
//    	double chi_squated;
//    	double cross_support_ratio;
//    	double collective_strength;
//    	double coverage;
//    	double descriptive_confirmed_confidence;
//    	double difference_of_confidence;
//    	double example_and_counter_example_rate;

    	metrics[0] = support;
    	metrics[1] = lift;
    	metrics[2] = conf_given_F;
    	metrics[3] = cosine;
    	metrics[4] = leverage;

    	return metrics;
    }
    
    

    public ArrayList<DrivingFeature> getDrivingFeatures (){

        Scheme scheme = new Scheme();

        scheme.setName("present");
        for (int i = 0; i < ninstr; ++i) {
            scheme.setInstrument (i);
            double[] metrics = computeMetrics(scheme);
            if (checkThreshold(metrics)) {
                String[] param = new String[1];
                param[0] = instrument_list[i];
                String featureName = "present[" + param[0] + "]";
                drivingFeatures.add(new DrivingFeature(featureName,"present", param, metrics));
            }
        }
        scheme.resetArg();
        scheme.setName("absent");
        for (int i = 0; i < ninstr; ++i) {
            scheme.setInstrument (i);
            double[] metrics = computeMetrics(scheme);
            if (checkThreshold(metrics)) {
                String [] param = new String[1];
                param[0] = instrument_list[i];
                String featureName = "absent[" + param[0] + "]";
                drivingFeatures.add(new DrivingFeature(featureName,"absent", param, metrics));
            }
        }
        scheme.resetArg();
        scheme.setName("inOrbit");
        for (int i = 0; i < norb; ++i) {
            for (int j = 0; j < ninstr; ++j) {
                scheme.setInstrument (j);
                scheme.setOrbit(i);
                double[] metrics = computeMetrics(scheme);
                if (checkThreshold(metrics)) {
                    String[] param = new String[2];
                    param[0] = orbit_list[i];
                    param[1] = instrument_list[j];
                    String featureName = "inOrbit[" + param[0] + ", " + param[1] + "]";
                    drivingFeatures.add(new DrivingFeature(featureName,"inOrbit", param, metrics));
                }
            }
        }
        scheme.resetArg();
        scheme.setName("notInOrbit");
        for (int i = 0; i < norb; ++i) {
            for (int j = 0; j < ninstr; ++j) {
                scheme.setInstrument (j);
                scheme.setOrbit(i);
                double[] metrics = computeMetrics(scheme);
                if (checkThreshold(metrics)) {
                    String[] param = new String[2];
                    param[0] = orbit_list[i];
                    param[1] = instrument_list[j];
                    String featureName = "notInOrbit[" + param[0] + ", " + param[1] + "]";
                    drivingFeatures.add(new DrivingFeature(featureName,"notInOrbit", param, metrics));
                } 
            }
        }
        scheme.resetArg();
        scheme.setName("together2");
        for (int i = 0; i < ninstr; ++i) {
            for (int j = 0; j < i; ++j) {
                scheme.setInstrument(i);
                scheme.setInstrument2(j);
                double[] metrics = computeMetrics(scheme);
                if (checkThreshold(metrics)) {
                    String[] param = new String[2];
                    param[0] = instrument_list[i];
                    param[1] = instrument_list[j];
                    String featureName = "together2[" + param[0] + ", " + param[1] + "]";
                    drivingFeatures.add(new DrivingFeature(featureName,"together2", param, metrics));
                }
            }
        }    
        scheme.resetArg();
        scheme.setName("togetherInOrbit2");
        for (int i = 0; i < norb; ++i) {
            for (int j = 0; j < ninstr; ++j) {
                for (int k = 0; k < j; ++k) {
                    scheme.setInstrument(j);
                    scheme.setInstrument2(k);
                    scheme.setOrbit(i);
                    double[] metrics = computeMetrics(scheme);
                    if (checkThreshold(metrics)) {
                        String[] param = new String[3];
                        param[0] = orbit_list[i];
                        param[1] = instrument_list[j];
                        param[2] = instrument_list[k];
                        String featureName = "togetherInOrbit2[" + param[0] + ", " + param[1] + 
                                ", " + param[2] + "]"; 
                        drivingFeatures.add(new DrivingFeature(featureName,"togetherInOrbit2", param,metrics));
                    }
                }
            }
        }
        scheme.resetArg();
        scheme.setName("separate2");
        for (int i = 0; i < ninstr; ++i) {
            for (int j = 0; j < i; ++j) {
                scheme.setInstrument(i);
                scheme.setInstrument2(j);
                double[] metrics = computeMetrics(scheme);
                if (checkThreshold(metrics)) {
                        String[] param = new String[2];
                        param[0] = instrument_list[i];
                        param[1] = instrument_list[j];
                        String featureName = "separate2[" + param[0] + ", " + param[1] + "]";
                        drivingFeatures.add(new DrivingFeature(featureName,"separate2", param, metrics));
                    }
            }            
        }
        scheme.resetArg();
        scheme.setName("together3");
        for (int i = 0; i < ninstr; ++i) {
            for (int j = 0; j < i; ++j) {
                for (int k = 0; k < j; ++k) {
                    scheme.setInstrument(i);
                    scheme.setInstrument2(j);
                    scheme.setInstrument3(k);
                    double[] metrics = computeMetrics(scheme);
                    if (checkThreshold(metrics)) {
                        String[] param = new String[3];
                        param[0] = instrument_list[i];
                        param[1] = instrument_list[j];
                        param[2] = instrument_list[k];
                        String featureName = "together3[" + param[0] + ", " + 
                                            param[1] + ", " + param[2] + "]";
                        drivingFeatures.add(new DrivingFeature(featureName,"together3", param, metrics));
                    }
                }
            }            
        }
        scheme.resetArg();
        scheme.setName("togetherInOrbit3");
        for (int i = 0; i < norb; ++i) {
            for (int j = 0; j < ninstr; ++j) {
                for (int k = 0; k < j; ++k) {
                    for (int l = 0; l < k; ++l) {
                        scheme.setName("togetherInOrbit3");
                        scheme.setInstrument(j);
                        scheme.setInstrument2(k);
                        scheme.setInstrument3(l);
                        scheme.setOrbit(i);
                        double[] metrics = computeMetrics(scheme);
                        if (checkThreshold(metrics)) {
                            String[] param = new String[4];
                            param[0] = orbit_list[i];
                            param[1] = instrument_list[j];
                            param[2] = instrument_list[k];
                            param[3] = instrument_list[l];
                            String featureName = "togetherInOrbit3[" + param[0] + ", " + 
                                                param[1] + ", " + param[2] + "," + param[3] + "]";
                            drivingFeatures.add(new DrivingFeature(featureName,"togetherInOrbit3", param, metrics));
                        }
                    }
                }
            }
        }
        scheme.resetArg();
        scheme.setName("separate3");
        for (int i = 0; i < ninstr; ++i) {
            for (int j = 0; j < i; ++j) {
                for (int k = 0; k < j; ++k) {
                    scheme.setInstrument(i);
                    scheme.setInstrument2(j);
                    scheme.setInstrument3(k);
                    double[] metrics = computeMetrics(scheme);
                    if (checkThreshold(metrics)) {
                        String[] param = new String[3];
                        param[0] = instrument_list[i];
                        param[1] = instrument_list[j];
                        param[2] = instrument_list[k];
                        String featureName = "separate3[" + param[0] + ", " + 
                                            param[1] + ", " + param[2] + "]";
                        drivingFeatures.add(new DrivingFeature(featureName,"separate3", param, metrics));
                    }
                }
            }
        }
        scheme.resetArg();
        scheme.setName("emptyOrbit");
        for (int i = 0; i < norb; ++i) {
            scheme.setOrbit(i);
            double[] metrics = computeMetrics(scheme);
            if (checkThreshold(metrics)) {
                String[] param = new String[1];
                param[0] = orbit_list[i];
                String featureName = "emptyOrbit[" + param[0] + "]";
                drivingFeatures.add(new DrivingFeature(featureName,"emptyOrbit", param, metrics));
            }
        }
        scheme.resetArg();
        scheme.setName("numOrbitUsed");
        for (int i = 1; i < norb+1; i++) {
            scheme.setCount(i);
            double[] metrics = computeMetrics(scheme);
            if (checkThreshold(metrics)) {
                String[] param = new String[1];
                param[0] = "" + i;
                String featureName = "numOrbitUsed[" + param[0] + "]";
                drivingFeatures.add(new DrivingFeature(featureName,"numOrbitUsed", param, metrics));
            }
        }
        scheme.resetArg();
        scheme.setName("numInstruments"); 
        // Total number of instruments
        for (int i = 1; i < max_num_of_instruments; i++) {
            scheme.setCount(i);
            scheme.setOrbit(-1);
            scheme.setInstrument(-1);
            double[] metrics = computeMetrics(scheme);
            if (checkThreshold(metrics)) {
            	// add to driving features
            }
        }
        scheme.resetArg();
        scheme.setName("numInstruments"); 
        // Number of each instrument
        for (int i=0;i<ninstr;i++){
        	for (int j=0;j<norb;j++){
        		scheme.setInstrument(i);
	            scheme.setCount(j);
	            scheme.setOrbit(-1);
	            double[] metrics = computeMetrics(scheme);
	            if (checkThreshold(metrics)) {
	            	// add to driving features
	            }
        	}
        }
        

       
        return drivingFeatures;
    }
    
    

//    public int[][] getDataFeatureMat(){
//        
//        int numData = non_behavioral.size();
//        int numFeature = drivingFeatures.size() + 1; // add class label as a last feature
//        int[][] dataMat = new int[numData][numFeature];
//        
//        for(int i=0;i<numData;i++){
//            int[][] d = non_behavioral.get(i);
//            Scheme s = new Scheme();
//
////            presetFilter(String filterName, int[][] data, ArrayList<String> params
//            for(int j=0;j<numFeature-1;j++){
//                DrivingFeature f = drivingFeatures.get(j);
//                String name = f.getName();
//                String type = f.getType();
//                
//                if(f.isPreset()){
//                    String[] param_ = f.getParam();
//                    ArrayList<String> param = new ArrayList<>();
//                    param.addAll(Arrays.asList(param_));
//                    if(s.presetFilter(type, d, param)){
//                        dataMat[i][j]=1;
//                    } else{
//                        dataMat[i][j]=0;
//                    }
//                } else{
//                    if(s.userDefFilter_eval(type, d)){
//                        dataMat[i][j]=1;
//                    } else{
//                        dataMat[i][j]=0;
//                    }
//                }
//            }
//            
//            boolean classLabel = false;
//            for (int[][] compData : behavioral) {
//                boolean match = true;
//                for(int k=0;k<d.length;k++){
//                    for(int l=0;l<d[0].length;l++){
//                        if(d[k][l]!=compData[k][l]){
//                            match = false;
//                            break;
//                        }
//                    }
//                    if(match==false) break;
//                }
//                if(match==true){
//                    classLabel = true;
//                    break;
//                }
//            }
//            if(classLabel==true){
//                dataMat[i][numFeature-1]=1;
//            } else{
//                dataMat[i][numFeature-1]=0;
//            }
//        }
//        dataFeatureMat = dataMat;
//        return dataMat;
//    }

    public boolean checkThreshold(double[] metrics){
    	if (metrics[0] > supp_threshold && 
    			metrics[1]> lift_threshold && 
    			metrics[2] > confidence_threshold && 
    			metrics[3] > confidence_threshold){
    		return true;
    	}
    	else{
    		return false;
    	}
    }

    
    public void parseCSV(String path){
        String csvFile = path;
        String line = "";
        String splitBy = ",";

        try (BufferedReader br = new BufferedReader(new FileReader(csvFile))) {
            while ((line = br.readLine()) != null) {
                // use comma as separator
                String[] tmp = line.split(splitBy);
                int label = Integer.parseInt(tmp[0]);
                String bitString = tmp[1];
                if (label==1){
                	this.behavioral.add(bitString2intArr(bitString));
                }else{
                	this.non_behavioral.add(bitString2intArr(bitString));
                }
            }
        } catch (IOException e) {
            e.printStackTrace();
        }

    	
    }
    
    private int[][] bitString2intArr(String input){
    	int[][] output = new int[norb][ninstr];
    	int cnt=0;
    	for(int i=0;i<ninstr;i++){
    		for (int o=0;o<norb;o++){
    			int thisBit;
    			if(input.length()==1){
    				thisBit = Integer.parseInt(input);
    			}else{
    				thisBit = Integer.parseInt(input.substring(cnt,cnt+1));
    			}
    			output[o][i] = thisBit;
    		}
    	}
    	return output;
    }
    
    public int[][] booleanToInt(boolean[][] b) {
        int[][] intVector = new int[b.length][b[0].length]; 
        for(int i = 0; i < b.length; i++){
            for(int j = 0; j < b[0].length; ++j) intVector[i][j] = b[i][j] ? 1 : 0;
        }
        return intVector;
    }
    

}
