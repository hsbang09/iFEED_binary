package rbsa.eoss;

import java.util.ArrayList;

public class StatApriori {

	int[][] dataMat;
	double threshold;

	public StatApriori(int[][] dataMat){
		
		this.dataMat = dataMat;
	
	
	
	}
	
	
	
	
	
	public void runStatApriori(ArrayList<DrivingFeature> inputDF){
		
		// Define the initial set of features
		ArrayList<setOfFeatures> S = generateInitialSets(setInitialAttributes(inputDF,0));
		
		// Define frontier. Frontier is the set of features that are non-minimum and PS
		ArrayList<setOfFeatures> frontier = new ArrayList<>(); 
		
		for (setOfFeatures s:S){
			frontier.add(s.copy());
		}
		int l = 1;
		while(frontier.size() > 0){
				
			
			
			
			l=l+1;
		}
		
		
	}
	
	
	
	public ArrayList<DrivingFeature> setInitialAttributes(ArrayList<DrivingFeature> inputDF, int index){
		ArrayList<DrivingFeature> initialAttributes;
		initialAttributes = new ArrayList<>();
		
		//Copy first element
		initialAttributes.add(inputDF.remove(0));
		// Sort driving features
		for(DrivingFeature df:inputDF){
			double val = df.getMetrics()[index];
			if (val <= initialAttributes.get(0).getMetrics()[index]){
				// If val is smaller than the first element, insert it at as the first element
				initialAttributes.add(0, df);
			}else if(val > initialAttributes.get(initialAttributes.size()-1).getMetrics()[index]){
				// If val is larger than the last element, add it to the last
				initialAttributes.add(df);
			}else{
				// Insert df based on the metric value
				for(int i=0;i<initialAttributes.size();i++){
					if(val > initialAttributes.get(i).getMetrics()[index] && 
					val <= initialAttributes.get(i+1).getMetrics()[index] ){
						initialAttributes.add(i+1, df);
					}
				}
			}
		}
		return initialAttributes;
	}
	
	public ArrayList<setOfFeatures> generateInitialSets(ArrayList<DrivingFeature> initAttr){
		
		ArrayList<setOfFeatures> S = new ArrayList<>();
		for(DrivingFeature attr:initAttr){
			ArrayList<DrivingFeature> tmp = new ArrayList<>();
			tmp.add(attr);
			S.add(new setOfFeatures(tmp));
		}
		return S;
	}
	
	
	
	public class setOfFeatures{
		
		private ArrayList<DrivingFeature> features;
        private double[] metrics=null;
		
        public setOfFeatures(ArrayList<DrivingFeature> feat){
        	this.features = feat;
        }
        
        
        public setOfFeatures copy(){
        	ArrayList<DrivingFeature> temp = new ArrayList<>();
        	for(DrivingFeature feat:this.features){
        		temp.add(feat);
        	}
        	return new setOfFeatures(temp);
        }
        

        public double[] computeMetrics(int[][] dataMat){

        	int nrows = dataMat.length;
        	int ncols = dataMat[0].length;
        	
        	double cnt_all = nrows;
            double cnt_F = 0;
            double cnt_S = 0;
            double cnt_SF = 0;
        	
        	for(int i=0;i<nrows;i++){
        		// for each data point
        		
        		boolean label = (dataMat[i][ncols-1]==1);
        		boolean feat = true;
        		
        		for (DrivingFeature thisDF: features){
        			int ind = thisDF.getIndex();
        			if (dataMat[i][ind] ==0 ){
        				feat=false;
        				break;
        			}
        		}
        		
        		if(label==true && feat==true){
        			cnt_SF++;
        		}else if(label==false && feat == true){
        			cnt_F++;
        		}else if(label==true && feat == false){
        			cnt_S++;
        		}
        		
        	}

//            double cnt_NS = cnt_all-cnt_S;
//            double cnt_NF = cnt_all-cnt_F;
//            double cnt_S_NF = cnt_S-cnt_SF;
//            double cnt_F_NS = cnt_F-cnt_SF;
            
        	double[] metrics = new double[2];
        	
            double support = cnt_SF/cnt_all;
//            double support_F = cnt_F/cnt_all;
//            double support_S = cnt_S/cnt_all;
            double lift = (cnt_SF/cnt_S) / (cnt_F/cnt_all);
//            double conf_given_F = (cnt_SF)/(cnt_F);   // confidence (feature -> selection)
//            double conf_given_S = (cnt_SF)/(cnt_S);   // confidence (selection -> feature)

        	metrics[0] = support;
        	metrics[1] = lift;
        	this.metrics = metrics;
        	return metrics;
        }
        
        
        
        
        
        
        
	}
	

	
}
