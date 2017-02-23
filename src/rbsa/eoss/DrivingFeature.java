/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package rbsa.eoss;

import java.util.Comparator;

/**
 *
 * @author Bang
 */
 
public class DrivingFeature{
        
        private String name; // specific names
        private String type; // inOrbit, together, separate, present, absent, etc.
        private String[] param;
        private boolean preset;
        private double[] metrics;
        

        public DrivingFeature(String name, String type){
            this.name = name;
            this.type = type;
            this.preset = false;
        }
        public DrivingFeature(String name, String type, double[] metrics){
            this.name = name;
            this.type = type;
            this.metrics = metrics;
            this.preset = false;
        }
        public DrivingFeature(String name, String type, String[] param, double[] metrics){
            this.name = name;
            this.type = type;
            this.param = param;
            this.metrics= metrics;
            this.preset = true;
        }
        
//        
//
//       @Override
//       public int compareTo(DrivingFeature other) {
//           if(this.getName().compareTo(other.getName()) == 0)
//               return 0;
//           else return 1;
//       }        
//       public static Comparator<DrivingFeature> DrivingFeatureComparator = new Comparator<DrivingFeature>() {
//	        @Override
//	        public int compare(DrivingFeature d1, DrivingFeature d2) {
//	            double x = (d1.getMetrics()[1] - d2.getMetrics()[1]);
//	            if(x<0) {
//	                return 1;
//	            } else if (x>0) {
//	                return - 1;
//	            } else {
//	                return 0;
//	            }
//	            
//	        }
//       };

        
        
        
        
        public String getType(){return type;}
        public String getName(){return name;}
        public double[] getMetrics(){return metrics;}
        public String[] getParam(){return param;}
        public boolean isPreset(){return preset;}
        
    }
