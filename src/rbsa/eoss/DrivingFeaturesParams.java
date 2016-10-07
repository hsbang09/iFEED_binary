package rbsa.eoss;

public class DrivingFeaturesParams {
	
    public static double support_threshold;
    public static double confidence_threshold;
    public static double lift_threshold;
	public static String[] instrument_list = {"ACE_ORCA","ACE_POL",	"ACE_LID","CLAR_ERB",
												"ACE_CPR","DESD_SAR","DESD_LID","GACM_VIS","GACM_SWIR",
												"HYSP_TIR","POSTEPS_IRS","CNES_KaRIN"};
	public static String[] orbit_list = {"LEO-600-polar-NA", "SSO-600-SSO-AM", "SSO-600-SSO-DD", 
												"SSO-800-SSO-DD", "SSO-800-SSO-PM"};
	public static String csv_path;
	public static String drivingFeature_output_path;
	
	public static int max_number_of_instruments = 17;
	
	public DrivingFeaturesParams(){
		
		support_threshold = 0.1;
		confidence_threshold = 0.4;
		lift_threshold = 1;
		csv_path="./data.csv";
		drivingFeature_output_path = "./drivingFeatures.csv";
	}
	
	
	
}
