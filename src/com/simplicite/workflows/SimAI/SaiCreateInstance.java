package com.simplicite.workflows.SimAI;

import java.util.*;

import org.json.JSONArray;
import org.json.JSONObject;

import com.simplicite.bpm.*;
import com.simplicite.util.*;
import com.simplicite.util.exceptions.*;
import com.simplicite.util.tools.*;
import com.simplicite.webapp.ObjectContextWeb;
import com.simplicite.commons.AIBySimplicite.AITools;
/**
 * Process SaiCreateInstance
 */
public class SaiCreateInstance extends Processus {
	private static final long serialVersionUID = 1L;
	private static final String  IO_CREDENTIALS = "designer:eba23f224ae4ff8902e4ade87d464ea3";
	private static final String  API_USER = "TestAIAPI";
	private static final String  API_PASSWORD = "enMMjGcyj?B4DY5o";
	private static final String PROCESS_RESOURCE_EXTERNAL_OBJECT ="SaiProcessResource";
	
	public String chatbot(Processus p, ActivityFile context, ObjectContextWeb ctx, Grant g){
		if(context.getStatus() == ActivityFile.STATE_DONE)
			return null;
		AppLog.info("chatBot", getGrant());
		if(!AITools.isAIParam(true)) return  g.T("AI_SETTING_NEED");
		String script =HTMLTool.jsBlock(g.getExternalObject(PROCESS_RESOURCE_EXTERNAL_OBJECT).getResourceJSContent("CHAT_BOT_SCRIPT"));
		String css = HTMLTool.lessToCss(g.getExternalObject(PROCESS_RESOURCE_EXTERNAL_OBJECT).getResourceCSSContent("CHAT_BOT_CSS"));
		String html = g.getExternalObject(PROCESS_RESOURCE_EXTERNAL_OBJECT).getResourceHTMLContent("CHAT_BOT_MODEL");
		html = html.replace("{{{script}}}", script);
		html = html.replace("{{css}}", css);
		html = html.replace("{{botMesage}}", "");
		return html;
	}
	@Override
	public void postValidate(ActivityFile context) {
		AppLog.info("Post validating SaiCreateInstance");
		String step = context.getActivity().getStep();
		if(step.equals("SCI_0100")){
			try{
				AppLog.info("Creating module");
				String moduleName = getContext(getActivity("SCI_0050")).getDataValue("Field", "saiInstanceName");
				String baseUrl = getContext(getActivity("SCI_0050")).getDataValue("Field", "saiInstanceUrl");
				String apiUrl = baseUrl + "/api";
				
				// Build login request
				String tokenResponse = RESTTool.get(apiUrl + "/login?_output=token",API_USER,API_PASSWORD);
				AppLog.info("Token response: " + tokenResponse);
				JSONObject tokenJson = new JSONObject(tokenResponse);
				String authToken = tokenJson.getString("authtoken");
				AppLog.info("Auth token: " + authToken.substring(0, 3)+"...",getGrant());
				// create Module
				String data = context.getDataValue("Data","AI_data");
				AppLog.info("Data: " + data,getGrant());
				JSONArray prompt = new JSONArray(data);
				JSONObject body = new JSONObject().put("moduleName", moduleName).put("prompt", prompt);
				//String moduleResponse = RESTTool.post(body,apiUrl + "/AiaCreateAPI",authToken,null);
				String moduleResponse = RESTTool.request(body,HTTPTool.MIME_TYPE_JSON,apiUrl + "/AiaCreateAPI","post",authToken,null,null,0);
				AppLog.info("Module response: " + moduleResponse); 

				//io clear cache
				String ioUrl = baseUrl + "/io";
				String[] credentials = IO_CREDENTIALS.split(":");
				RESTTool.post(null, ioUrl+"?service=clearcache", credentials[0], credentials[1]);
				
				//gen data
				String dataResponse = RESTTool.get(apiUrl + "/AiaCreateAPI?moduleName="+moduleName,authToken,null);
				AppLog.info("Data response: " + dataResponse);

				//get scope
				String scopeResponse = RESTTool.get(apiUrl + "/AiaCreateAPI?moduleName="+moduleName+"&action=scope", authToken, null);
				AppLog.info("Scope response: " + scopeResponse);
				String scope = new JSONObject(scopeResponse).optString("scope");
				//logout
				RESTTool.get(apiUrl + "/logout", authToken, null);
				AppLog.info("Successfully logged out");

				ObjectDB obj = getGrant().getProcessObject("SaiInstance");
				synchronized(obj.getLock()){
					obj.select(getContext(getActivity("SCI_0050")).getDataValue("Field", "row_id"));
					obj.setFieldValue("saiInstanceUrl", baseUrl+"/ui?scope="+scope);
					obj.save();
					getContext(getActivity("sic-END")).setDataFile("Forward","page",HTMLTool.getDirectURL(obj,true));

				}
				
			} catch (Exception e) {
				AppLog.error("Error creating module: " + e.getMessage());
			}

		}
		
	}
}