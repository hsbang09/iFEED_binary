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
		ArrayList<DrivingFeature> initAttrs = setInitialAttributes(inputDF);
		ArrayList<setOfFeatures> S = generateInitialSets(initAttrs);
		
		// Define frontier. Frontier is the set of features whose level is l
		ArrayList<setOfFeatures> frontier = new ArrayList<>(); 
		
		for (setOfFeatures s:S){
			frontier.add(s.copy());
		}
		
		int l = 1;
		// While there are features there are non-minimum and PS
		while(frontier.size() > 0){
			
			// Generate new candidates
			ArrayList<setOfFeatures> candidates = new ArrayList<>();
			
			for(setOfFeatures branch:frontier){				
				int[] indices = branch.getIndices();
				
				for(DrivingFeature attr:initAttrs){
					if(!contains(indices, attr.getIndex())){
						// If this branch doesn't contain this attribute, create a new candidate
						setOfFeatures newFeat = branch.copy();
						newFeat.addNewFeature(attr);
						candidates.add(newFeat);
					}
				}
				
				
				
			}
			
			
			
			l=l+1;
		}
		
		
	}
	
	
	public boolean contains(int[] arr, int i){
		for(int a:arr){
			if(a==i){
				return true; 
			}
		}
		return false;
	}
	
	
	public ArrayList<DrivingFeature> setInitialAttributes(ArrayList<DrivingFeature> inputDF){
		ArrayList<DrivingFeature> initialAttributes;
		initialAttributes = new ArrayList<>();
		
		// Use support to sort driving features
		int index = 0;
		
		//Copy first element
		initialAttributes.add(inputDF.remove(0));
		// Sort driving features in ascending order of support value (frequency)
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
		// Return the sorted driving features 
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
        private int[] indices;
		
        public setOfFeatures(ArrayList<DrivingFeature> feat){
        	this.features = feat;
        	indices = new int[feat.size()];
        	for(int i=0;i<features.size();i++){
        		indices[i] = this.features.get(i).getIndex();
        	}
        }
        
        public void addNewFeature(DrivingFeature df){
        	this.features.add(df);
        }

        public int[] getIndices(){
        	return this.indices;
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

        	double[] metrics = new double[2];
            double support = cnt_SF/cnt_all;
            double lift = (cnt_SF/cnt_S) / (cnt_F/cnt_all);

            
        	metrics[0] = support;
        	metrics[1] = lift;
        	this.metrics = metrics;
        	return metrics;
        }
        
        public ArrayList<DrivingFeature> getFeatures(){
        	return this.features;
        }
        
        
        
        
        
	}
	

	
}
