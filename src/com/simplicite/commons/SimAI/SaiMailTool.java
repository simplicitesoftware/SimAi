package com.simplicite.commons.SimAI;

import java.util.*;

import com.simplicite.util.*;
import com.simplicite.bpm.*;
import com.simplicite.util.exceptions.*;
import com.simplicite.util.tools.*;
import org.json.*;
import com.simplicite.util.exceptions.HTTPException;

/**
 * Shared code SaiMailTool
 */
public class SaiMailTool implements java.io.Serializable {
	private static final long serialVersionUID = 1L;
	private static final String MAIL_TECHNICAL = "technical";
	private static final String MAIL_BUSINESS = "business";
	private static final String SUPERVISOR_USER = "saiMailUser";
	private static final String SUPERVISOR_PWD = System.getenv("mailpwd");
	private static final String INSTANCE_URL = System.getenv("supervisorUrl");
	
	
	public static void sendCommercialEmail(String body, JSONArray prompts){
		AppLog.info("sendCommercialEmail: \n"+prompts.toString(1));
		JSONObject params = new JSONObject();
		params.put("type",MAIL_BUSINESS);
		params.put("body",body);
		params.put("subject","[IA] nouvelle demande d'instance par IA");
		params.put("prompts",prompts);
		send(params);
	}
	public static void sendCommercialEmail(String body){
		JSONObject params = new JSONObject();
		params.put("type",MAIL_BUSINESS);
		params.put("body",body);
		params.put("subject","[IA] nouvelle demande d'instance par IA");
		send(params);

	}
	public static void sendContactEmail(ObjectDB obj){
		String name = obj.getFieldValue("saiContactName");
		String email = obj.getFieldValue("saiContactEmail");
		String phone = obj.getFieldValue("saiContactPhone");
		String message = obj.getFieldValue("saiContactComment");
		String body = "New contact from " + name + ":\n";
		body += "Email: " + email + "\n";
		body += "Phone: " + phone + "\n";
		body += "Message: " + message + "\n";
		JSONObject params = new JSONObject();
		params.put("type",MAIL_BUSINESS);
		params.put("subject","[AI] new contact");
		params.put("body",body);
		send(params);
	}
	public static void sendAiAlert(String error){
		String body = "The AI API call on instance "+System.getenv("instName")+" has encountered an error: <br>"+error.replace("\n","<br>");
		JSONObject params = new JSONObject();
		params.put("type",MAIL_TECHNICAL);
		params.put("subject","[AI] Provider API Error");
	
		params.put("body",body);
		send(params);
	}
	private static void send(JSONObject params){
		try {
			
			APITool api = new APITool(INSTANCE_URL,SUPERVISOR_USER,SUPERVISOR_PWD,"UTF_8",true);
			api.login(false);
			String token = api.getAuthToken();
			String apiurl = INSTANCE_URL + "/api/PorSaiMailGestionaire";
			RESTTool.post(params,apiurl, token,null);
			api.logout();
		} catch (ParamsException | HTTPException e) {
			AppLog.error(e,Grant.getSystemAdmin());
		}
		
	}
}