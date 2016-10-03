/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package rbsa.eoss.server;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.FileWriter;
import java.io.PrintWriter;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.channels.Channels;
import java.security.GeneralSecurityException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Arrays;
import java.util.List;
import java.util.Properties;
import java.util.Random;
import java.util.Stack;

import javax.mail.Authenticator;
import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.PasswordAuthentication;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.AddressException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

//import org.codemonkey.simplejavamail.email.*;
//import org.codemonkey.simplejavamail.*;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
//import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.Base64;
import com.google.api.services.gmail.Gmail;

import com.googlecode.objectify.ObjectifyService;
import com.googlecode.objectify.annotation.*;
import static com.googlecode.objectify.ObjectifyService.ofy;


import rbsa.eoss.Result;
import rbsa.eoss.ResultCollection;
import rbsa.eoss.server.resultsGUIServlet.archEvalResults;


//import com.google.api.client.json.jackson2.JacksonFactory;
//import com.google.api.client.http.javanet.NetHttpTransport;


//import madkitdemo3.AgentEvaluationCounter;


/**
 *
 * @author Bang
 */
public class loginServlet extends HttpServlet {
	
	int time_given = 1 * 30 * 60 * 1000;

//    ArrayList<String> userEmails = new ArrayList<>();
//    HashMap<String,String> experimentCond = new HashMap<>();
//    HashMap<String,String> expStartTime = new HashMap<>();
//    HashMap<String,String> clickData = new HashMap<>();

    private String CLIENT_ID = "564804694787-lnsp9md3u0q8086nftbamu43drid6d4t.apps.googleusercontent.com";
    private String[] CLIENT_ID_List = new String[1];
    private static String USER_NAME = "hsbang.experiment";  // GMail user name (just the part before "@gmail.com")
    private static String PASSWORD = "harrisbang09"; // GMail password
    private static String RECIPIENT = "hsbang.experiment@gmail.com";
    
    private static loginServlet instance=null;
	private int testType;
	
	private Checker checker;
	
    @Override
    public void init() throws ServletException{ 
    	instance = this;
    	testType = 1;
    	CLIENT_ID_List[0] = CLIENT_ID;
    	ObjectifyService.register(account.class);
    	account acc = ofy().load().type(account.class).filter("googleIDToken","hb398@cornell.edu").first().now();
    	if(acc!=null){
    		ofy().delete().entity(acc).now();
    	}
    }
    
    
    /**
     * Processes requests for both HTTP <code>GET</code> and <code>POST</code>
     * methods.
     *
     * @param request servlet request
     * @param response servlet response
     * @throws ServletException if a servlet-specific error occurs
     * @throws IOException if an I/O error occurs
     */
    protected void processRequest(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        response.setContentType("text/html;charset=UTF-8");
        try (PrintWriter out = response.getWriter()) {
            /* TODO output your page here. You may use following sample code. */
            out.println("<!DOCTYPE html>");
            out.println("<html>");
            out.println("<head>");
            out.println("<title>Servlet jessCommandServlet</title>");            
            out.println("</head>");
            out.println("<body>");
            out.println("<h1>Servlet jessCommandServlet at " + request.getContextPath() + "</h1>");
            out.println("</body>");
            out.println("</html>");
        }
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
    	
    	

        String requestID = request.getParameter("ID");
        String outputString = "";
        
        

    	if (requestID.equalsIgnoreCase("login")){
                
	    	boolean accessGranted = false;
	        
	        System.out.println("----- Login -----");
	        String inputIDToken = request.getParameter("IDToken");
	        String loginTime = request.getParameter("loginTime");
	        
	//        System.out.println(inputIDToken);
	        
	        checker = new Checker(CLIENT_ID_List,"");
	        GoogleIdToken.Payload pl = checker.check(inputIDToken);
	        
	        if(checker.isVerified()){
	        	
	        	account acc = ofy().load().type(account.class).filter("email",pl.getEmail()).first().now();

	            if(acc!=null){    // Logged in before

	            	System.out.println(" logged in before ");
		        	String originalStartTime = acc.getLoginTime();
	            	String testType_saved = acc.getType();
	            	
		        	System.out.println("Exp start time: " + originalStartTime);
		        	System.out.println("Time right now: " + loginTime);
	            	
	            	double timeDiff_milisec = Double.parseDouble(loginTime) - Double.parseDouble(originalStartTime);
	            	double timeDiff_sec = (double) ((double)timeDiff_milisec) / ((double)1000.0);
	            	System.out.println(timeDiff_sec + " seconds have passed since the experiment has started");
	            	
	            	double remaining_time = time_given - timeDiff_milisec;
	            	outputString = testType_saved + "-" + remaining_time;
	            	
	            	int n = acc.getLoginTrial();
	            	acc.setLoginTrial(n+1);
	            	ofy().save().entity(acc);
	            	
	            } else{   // logging in for the first time

	            	double remaining_time = time_given;
	            	outputString = testType + "-" + remaining_time;
	                
	            	//saving the account info in the database
	    	        account a1 = new account();
	    	        a1.setEmail(pl.getEmail());
	    	        a1.setLoginTime(loginTime);
	    	        a1.setType(Integer.toString(testType));
	    	        a1.setLoginTrial(1);
	    	        ofy().save().entity(a1);

	    	        // sending the basic account info through gmail
	    	        String from = USER_NAME;
	                String pass = PASSWORD;
	                String[] to = { RECIPIENT }; // list of recipient email addresses
	                String subject = "iFEED_experiment_started:" + pl.getEmail();
	                String body = "Email: " + pl.getEmail() + "\n"
	                		+ "Test type: " + testType + "\n"
	                		+ "Verified: " + checker.isVerified();
//	                sendFromGMail(from, pass, to, subject, body);
	  
	    	    	if(testType==4){
	    	    		testType = 1;
	    	    	} else{
	    	    		testType += 1;
	    	    	}

	            }
	            accessGranted=true;
	        } 
	        System.out.println(outputString);
	        
	        
	        if(!accessGranted){
	        	outputString="accessDenied";
	        }

    	} 
    	
    	if (requestID.equalsIgnoreCase("sessionTimeout")){
    		
    		System.out.println("-----Session Timeout-----");
    		
	        String inputIDToken = request.getParameter("IDToken");

	        Checker checker = new Checker(CLIENT_ID_List,"");
	        GoogleIdToken.Payload pl = checker.check(inputIDToken);
	        
	        String key = "";
	        
	        account acc = ofy().load().type(account.class).filter("email",pl.getEmail()).first().now();
	        if(checker.isVerified() && acc!=null){
		        for (int i=0;i<3;i++){
		        	int rand = (int) (Math.random()*10);
		        	key = key + rand;
		        }
		        key = key + acc.getType();
		        for (int i=0;i<6;i++){
		        	int rand = (int) (Math.random()*10);
		        	key = key + rand;
		        }
		        key = key + "71703" + acc.getID() + "8028138";
	        }else{
	        	key = "798465132798466869058630457365132";
	        }
	        outputString = key;
	        System.out.println("key_number: " + outputString);
	        
	        
//	        cnt_df:buttonClickCount_drivingFeatures,
//        	cnt_ct:buttonClickCount_classificationTree,
//        	cnt_fo:buttonClickCount_filterOptions,
//        	cnt_af:buttonClickCount_applyFilter,
//        	cnt_ud:buttonClickCount_addUserDefFilter,
//        	cnt_ar:numOfArchViewed,
//        	cnt_db:numOfDrivingFeatureViewed,
//        	numArch_df: getDrivingFeatures_numOfArchs,
//        	numArch_ct: getClassificationTree_numOfArchs,
//        	threshold_df: getDrivingFeatures_thresholds
//	        userdef:userDefFilters
	        
	        String cnt_df = request.getParameter("cnt_df");
	        String cnt_ct = request.getParameter("cnt_ct");
	        String cnt_fo = request.getParameter("cnt_fo");
	        String cnt_af = request.getParameter("cnt_af");
	        String cnt_ud = request.getParameter("cnt_ud");
	        String cnt_ar = request.getParameter("cnt_ar");
	        String cnt_db = request.getParameter("cnt_db");
	        String numArch_df = request.getParameter("numArch_df");
	        String numArch_ct = request.getParameter("numArch_ct");
	        String threshold_df = request.getParameter("threshold_df");
	        String userdef = request.getParameter("userdef");
	        
	        
	        String from = USER_NAME;
            String pass = PASSWORD;
            String[] to = { RECIPIENT }; // list of recipient email addresses
            String subject = "session_timeout:" + pl.getEmail();
            String body = "User ID: " + acc.getID() + "\n" 
            		+ "Email: " + pl.getEmail() + "\n"
            		+ "cnt_df: " + cnt_df + "\n"
            		+ "cnt_ct: " + cnt_ct + "\n"
            		+ "cnt_fo: " + cnt_fo + "\n"
            		+ "cnt_af: " + cnt_af + "\n"
            		+ "cnt_ud: " + cnt_ud + "\n"
            		+ "cnt_ar: " + cnt_ar + "\n"
            		+ "cnt_db: " + cnt_db + "\n"
            		+ "numArch_df: " + numArch_df + "\n"
            		+ "numArch_ct: " + numArch_ct + "\n"
            		+ "threshold_df: " + threshold_df + "\n"
            		+ "userdef: " + userdef;
//            sendFromGMail(from, pass, to, subject, body);
	        

        	acc.setTimedOut(true);
        	acc.setMeasurements(cnt_df, cnt_ct, cnt_fo, cnt_af, cnt_ud, cnt_ar, 
        			cnt_db, numArch_df, numArch_ct, threshold_df, userdef);
        	ofy().save().entity(acc);
	        
    	}
    	

    	
        
        
//        final Email email = new Email();
//        
//        email.setFromAddress("lollypop", "hb398@cornell.edu");
//        email.setSubject("hey");
//        email.addRecipient("C. Cane", "hb398@cornell.edu", Message.RecipientType.TO);
//        email.setText("We should meet up! ;)");
//        
//        new Mailer("smtp.gmail.com", 465, "hb398@cornell.edu", "fon?4819", TransportStrategy.SMTP_SSL).sendMail(email);

        

//        // Recipient's email ID needs to be mentioned.
//        String to = "hb398@cornell.edu";
//        // Sender's email ID needs to be mentioned
//        String from = "hb398@cornell.edu";
//        String host = "smtp.gmail.com";
//        boolean auth = true;
//        int port = 465;
//        final String username = "hb398@cornell.edu";
//        final String password = "fon?4819";
//        Properties props = new Properties();
//        props.put("mail.smtp.host",host);
////        props.put("mail.smtp.port", port);
//        props.put("mail.smtp.socketFactory.port","465");
//        props.put("mail.smtp.socketFactory.class","javax.net.ssl.SSLSocketFactory");
////        props.put("mail.smtp.ssl.enable",true);
//        props.put("mail.smtp.auth",true);
//        props.put("mail.smtp.port","465");
//        
//        Session session = Session.getDefaultInstance(props,
//        		new Authenticator(){
//        			protected PasswordAuthentication getPasswordAuthentication(){
//        				return new PasswordAuthentication("hb398@cornell.edu","fon?4819");
//        			}
//        });
//        
//        try{
//	        Message message = new MimeMessage(session);
//	        message.setFrom(new InternetAddress("hb398@cornell.edu"));
//	        message.setRecipients(Message.RecipientType.TO,InternetAddress.parse("hb398@cornell.edu"));
//	        message.setSubject("this is the subject");
//	        message.setText("melong");
//	        Transport.send(message);
//        } catch(MessagingException e){
//        	throw new RuntimeException(e);
//        }
//        
        
        
        
        
//        Authenticator authenticator = null;
//        if (auth) {
//            props.put("mail.smtp.auth", true);
//            authenticator = new Authenticator() {
//                private PasswordAuthentication pa = new PasswordAuthentication(username, password);
//                @Override
//                public PasswordAuthentication getPasswordAuthentication() {
//                    return pa;
//                }
//            };
//        }
//        
//        // Get the default Session object.
////        Session session = Session.getDefaultInstance(properties);
//        Session session = Session.getInstance(props, authenticator);
//
//        try{
//           // Create a default MimeMessage object.
//           MimeMessage message = new MimeMessage(session);
//           // Set From: header field of the header.
//           message.setFrom(new InternetAddress(from));
//           // Set To: header field of the header.
//           message.addRecipient(Message.RecipientType.TO,
//                                    new InternetAddress(to));
//           // Set Subject: header field
//           message.setSubject("This is the Subject Line!");
//           // Now set the actual message
//           message.setText("This is actual message");
//           // Send message
//           Transport.send(message);
//           System.out.println("mail sent");
//        }catch (MessagingException mex) {
//        	System.out.println("error in sending email");
//           mex.printStackTrace();
//        }
//        
//        
//        

      
        
//      /** Authorizes the installed application to access user's protected data. */
//      private static GoogleCredential authorize() throws Exception {
//        // load client secrets
//        GoogleClientSecrets clientSecrets = GoogleClientSecrets.load(JSON_FACTORY,
//            new InputStreamReader(CalendarSample.class.getResourceAsStream("/client_secrets.json")));
//        // set up authorization code flow
//        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
//            httpTransport, JSON_FACTORY, clientSecrets,
//            Collections.singleton(CalendarScopes.CALENDAR)).setDataStoreFactory(dataStoreFactory)
//           .build();
//        // authorize
//        return new AuthorizationCodeInstalledApp(flow, new LocalServerReceiver()).authorize("user");
//     } 
        

//        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(transport, jsonFactory)
//                .setAudience(Arrays.asList("myClientId"))
//                .build();
        
//		GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(transport, jsonFactory)
//	    .setAudience(Arrays.asList(CLIENT_ID))
//	    .setIssuer("https://accounts.google.com")
//	    .build();
        
//        
//		GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(),JacksonFactory.getDefaultInstance())
//		    .setAudience(Arrays.asList(CLIENT_ID))
//		    // If you retrieved the token on Android using the Play Services 8.3 API or newer, set
//		    // the issuer to "https://accounts.google.com". Otherwise, set the issuer to
//		    // "accounts.google.com". If you need to verify tokens from multiple sources, build
//		    // a GoogleIdTokenVerifier for each issuer and try them both.
//		    .setIssuer("https://accounts.google.com")
//		    .build();
		
		
		
		
		
		// (Receive idTokenString by HTTPS POST)
//		try{
//			GoogleIdToken idToken = verifier.verify(inputIDToken);
//
//			if (idToken != null) {
//			  Payload payload = idToken.getPayload();
//			
//			  // Print user identifier
//			  String userId = payload.getSubject();
//			  
//			  System.out.println("User ID: " + userId);
//			
//			  // Get profile information from payload
//			  String email = payload.getEmail();
//			  boolean emailVerified = Boolean.valueOf(payload.getEmailVerified());
//			  String name = (String) payload.get("name");
//			  String pictureUrl = (String) payload.get("picture");
//			  String locale = (String) payload.get("locale");
//			  String familyName = (String) payload.get("family_name");
//			  String givenName = (String) payload.get("given_name");
//			
//			  // Use or store profile information
//			  // ...
//			  
//			  System.out.println(email);
//			  System.out.println(givenName);
//			  
//			  
//			} else {
//			  System.out.println("Invalid ID token.");
//			}
//        
//		} catch(Exception e){
//			e.printStackTrace();
//		}
        

        response.flushBuffer();
        response.setContentType("text/html");
        response.setHeader("Cache-Control", "no-cache");
        response.getWriter().write(outputString);

//        Put things back
//        System.out.flush();
//        System.setOut(old);
//        Show what happened
//        System.out.println("Intercepted text:" + baos.toString());
    }

    /**
     * Returns a short description of the servlet.
     *
     * @return a String containing servlet description
     */
    @Override
    public String getServletInfo() {
        return "Short description";
    }// </editor-fold>

    
    
    public static loginServlet getInstance()
    {
        if( instance == null ) 
        {
            instance = new loginServlet();
        }
        return instance;
    }
    
    public class Checker {

    	private final List mClientIDs;
    	private final String mAudience;
    	private final GoogleIdTokenVerifier mVerifier;
    	private final JsonFactory mJFactory;
    	private String mProblem = "Verification failed. (Time-out?)";
    	private boolean verified;

    	public Checker(String[] clientIDs, String audience) {
    	    mClientIDs = Arrays.asList(clientIDs);
    	    mAudience = audience;
    	    NetHttpTransport transport = new NetHttpTransport();
    	    mJFactory = new GsonFactory();
    	    mVerifier = new GoogleIdTokenVerifier(transport, mJFactory);
    	    verified = false;
    	}

    	public GoogleIdToken.Payload check(String tokenString) {
    	    GoogleIdToken.Payload payload = null;
    	    try {
    	        GoogleIdToken token = GoogleIdToken.parse(mJFactory, tokenString);
    	        if (mVerifier.verify(token)) {
    	        	verified = true;
    	        	GoogleIdToken.Payload tempPayload = token.getPayload();
    	        	System.out.println("Credential verified: " + tempPayload.getEmail());
//    	            System.out.println(tempPayload.getUserId());
    	            

    	            
//    	            String to = "hb398@cornell.edu";
//    	            String from = "hb398@cornell.edu";
//    	            String subject = "this is the subject";
//    	            String bodyText = "and this is the body!!!";
//    	            String userID = tempPayload.getUserId();
    	            
//    	            try{
//    	            
//    	    	        MimeMessage email = createEmail(to, from, subject, bodyText);
//    	    		    NetHttpTransport transport = new NetHttpTransport();
//    	    		    JsonFactory jsonFactory = new GsonFactory();
//    	    		    
//    	    		    
//    	    		    
//    	    	        Gmail service = new Gmail.Builder(transport, jsonFactory, null)
//    	    	        		.setGmailRequestInitializer(new GmailRequestInitializer(null))
//    	    	        		.setApplicationName("Application Name")
//    	    	        		.build();
//    	    	        sendMessage(service,userID, email);
//    	            
//    	            } catch(Exception e){
//    	            	e.printStackTrace();
//    	            }
    	            

//    	            if (!tempPayload.getAudience().equals(mAudience))
//    	                mProblem = "Audience mismatch";
//    	            else 
    	            	if (!mClientIDs.contains(tempPayload.getIssuee()))
    	                mProblem = "Client ID mismatch";
    	            else
    	                payload = tempPayload;
    	        }
    	    } catch (GeneralSecurityException e) {
    	        mProblem = "Security issue: " + e.getLocalizedMessage();
    	    } catch (IOException e) {
    	        mProblem = "Network problem: " + e.getLocalizedMessage();
    	    }
    	    return payload;
    	}
    	
    	public boolean isVerified(){
    		return verified;
    	}

    	public String problem() {
    	    return mProblem;
    	}
    }
    
//    public static MimeMessage createEmail(String to, String from, String subject, 
//    		String bodyText) throws MessagingException{
//    	
//        Properties props = new Properties();
////        Session session = Session.getDefaultInstance(props, null);
//
//		props.put("mail.smtp.host","smtp.gmail.com");
//		props.put("mail.smtp.socketFactory.port","465");
//		props.put("mail.smtp.socketFactory.class","javax.net.ssl.SSLSocketFactory");
//		props.put("mail.smtp.ssl.enable",true);
//		props.put("mail.smtp.auth",true);
//		props.put("mail.smtp.port","465");
//		  
//		Session session = Session.getDefaultInstance(props,
//			new Authenticator(){
//				protected PasswordAuthentication getPasswordAuthentication(){
//					return new PasswordAuthentication("hb398@cornell.edu","fon?4819");
//				}
//		});
//
//        MimeMessage email = new MimeMessage(session);
//        InternetAddress tAddress = new InternetAddress(to);
//        InternetAddress fAddress = new InternetAddress(from);
//
//        email.setFrom(new InternetAddress(from));
//        email.addRecipient(javax.mail.Message.RecipientType.TO,
//                           new InternetAddress(to));
//        email.setSubject(subject);
//        email.setText(bodyText);
//        return email;
//    	
//    }
//    
//    
//    public static void sendMessage(Gmail service, String userId, MimeMessage email)
//    	      throws MessagingException, IOException {
//    	    com.google.api.services.gmail.model.Message message = createMessageWithEmail(email);
//    	    message = service.users().messages().send(userId, message).execute();
//
//    	    System.out.println("Message id: " + message.getId());
//    	    System.out.println(message.toPrettyString());
//    }
//    
//    public static com.google.api.services.gmail.model.Message createMessageWithEmail(MimeMessage email)
//    	      throws MessagingException, IOException {
//    	    ByteArrayOutputStream bytes = new ByteArrayOutputStream();
//    	    email.writeTo(bytes);
//    	    String encodedEmail = Base64.encodeBase64URLSafeString(bytes.toByteArray());
//    	    com.google.api.services.gmail.model.Message message = new com.google.api.services.gmail.model.Message();
//    	    message.setRaw(encodedEmail);
//    	    return message;
//   }
    
    
    private static void sendFromGMail(String from, String pass, String[] to, String subject, String body) {
        Properties props = System.getProperties();
        String host = "smtp.gmail.com";
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", host);
        props.put("mail.smtp.user", from);
        props.put("mail.smtp.password", pass);
        props.put("mail.smtp.port", "587");
        props.put("mail.smtp.auth", "true");

        Session session = Session.getDefaultInstance(props);
        MimeMessage message = new MimeMessage(session);

        try {
            message.setFrom(new InternetAddress(from));
            InternetAddress[] toAddress = new InternetAddress[to.length];

            // To get the array of addresses
            for( int i = 0; i < to.length; i++ ) {
                toAddress[i] = new InternetAddress(to[i]);
            }

            for( int i = 0; i < toAddress.length; i++) {
                message.addRecipient(Message.RecipientType.TO, toAddress[i]);
            }

            message.setSubject(subject);
            message.setText(body);
            Transport transport = session.getTransport("smtp");
            transport.connect(host, from, pass);
            transport.sendMessage(message, message.getAllRecipients());
            transport.close();
            System.out.println("mail sent through gmail");
        }
        catch (AddressException ae) {
            ae.printStackTrace();
        }
        catch (MessagingException me) {
            me.printStackTrace();
        }
    }
    
    
    @Entity
    public static class account{
    	
    	@Id Long id;
    	@Index String email;
    	@Index String type;
    	@Index boolean timedOut;
    	String loginTime;
    	int loginTrial;
    	
        String cnt_df ;
        String cnt_ct;
        String cnt_fo ;
        String cnt_af ;
        String cnt_ud ;
        String cnt_ar ;
        String cnt_db ;
        String numArch_df ;
        String numArch_ct ;
        String threshold_df ;
        String userdef ;
    	
    	
    	public account(){
    		timedOut=false;
    	}
    	
    	public void setEmail(String email){this.email=email;}
    	public void setLoginTime(String time){this.loginTime=time;}
    	public void setType(String type){this.type=type;}
    	public void setLoginTrial(int n){this.loginTrial=n;}
    	public void setTimedOut(boolean timedout){this.timedOut=timedout;}
    	public void setMeasurements(String cnt_df,String cnt_ct, String cnt_fo, String cnt_af, 
    			String cnt_ud, String cnt_ar, String cnt_db, String numArch_df, String numArch_ct,
    			String threshold_df, String userdef){
    		
    		this.cnt_df=cnt_df;
    		this.cnt_ct=cnt_ct;
    		this.cnt_fo=cnt_fo;
    		this.cnt_af=cnt_af;
    		this.cnt_ud=cnt_ud;
    		this.cnt_ar=cnt_ar;
    		this.cnt_db=cnt_db;
    		this.numArch_df=numArch_df;
    		this.numArch_ct=numArch_ct;
    		this.threshold_df=threshold_df;
    		this.userdef=userdef;
    		
    	}
    	public String getEmail(){return this.email;}
    	public String getLoginTime(){return this.loginTime;}
    	public String getType(){return this.type;}
    	public Long getID(){return this.id;}
    	public int getLoginTrial(){return this.loginTrial;}
    	public boolean getTimedOut(){return this.timedOut;}
    	
    	public String getCnt_df(){return cnt_df;}
    	public String getCnt_ct(){return cnt_ct;}
    	public String getCnt_fo(){return cnt_fo;}
    	public String getCnt_af(){return cnt_af;}
    	public String getCnt_ud(){return cnt_ud;}
    	public String getCnt_ar(){return cnt_ar;}
    	public String getCnt_db(){return cnt_db;}
    	public String getNumArch_df(){return numArch_df;}
    	public String getNumArch_ct(){return numArch_ct;}
    	public String getThreshold_df(){return threshold_df;}
    	public String getUserDef(){return userdef;}

    	
    }
    
    
    
}