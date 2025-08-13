package com.simplicite.commons.SimAI;

import java.util.*;

import com.simplicite.util.*;
import com.simplicite.bpm.*;
import com.simplicite.util.exceptions.*;
import com.simplicite.util.tools.*;
import org.json.*;

/**
 * Shared code SaiMailTool
 */
public class SaiMailTool implements java.io.Serializable {
	private static final long serialVersionUID = 1L;
	private static final String MAIL_TECHNICAL = "technical";
	private static final String MAIL_BUSINESS = "business";
	private static final JSONObject MAIL_CONTACTS = new JSONObject(Grant.getSystemAdmin().getParameter("SAI_MAIL_TO"));
	private static final boolean issetup = false;
	
	private static MailTool prepareMail (String type){
		MailTool mail = new MailTool();
		JSONArray mails = MAIL_CONTACTS.getJSONArray(type);
		List<String> mailsList = new ArrayList<>();
		for(int i = 0; i < mails.length(); i++){
			mailsList.add(mails.getString(i));
		}
		AppLog.info("Mails: "+String.join(",", mailsList));
		for(int i = 0; i < mails.length(); i++){
			mail.addRcpt(mails.getString(i));
		}
		return mail;
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
		if(!issetup){ AppLog.info("serv stmp not setup:\n"+body); return;}
		MailTool mail = prepareMail(MAIL_BUSINESS);
		mail.setSubject("[AI] new contact");
		
		mail.setBody(body);
		mail.addAttach(obj, obj.getField("saiCntModuleId.mdl_xml"));
		mail.send();
	}
	public static void sendAiAlert(String error){
		String body = "The AI API call from "+Globals.getApplicationURL()+ "has encountered an error: \n"+error;
		if(!issetup){ AppLog.info("serv stmp not setup:\n"+body); return;}
		MailTool mail = prepareMail(MAIL_TECHNICAL);
		mail.setSubject("[AI] Provider API Error");
	
		mail.setBody(body);
		mail.send();
	}
}