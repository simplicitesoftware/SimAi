package com.simplicite.objects.SimAI;

import java.util.*;

import org.json.JSONObject;

import com.simplicite.util.*;
import com.simplicite.util.exceptions.*;
import com.simplicite.util.tools.*;

/**
 * Business object Instance
 */
public class SaiInstance extends ObjectDB {
	private static final long serialVersionUID = 1L;
	public String pingInstance(){
		String baseUrl = getFieldValue("saiInstanceUrl");
		baseUrl = baseUrl.replaceAll("/ui.*$", "");
		String pingUrl = baseUrl + "/ping";
		// Clear cache using RESTTool
		String response;
		try {
			response = RESTTool.get(pingUrl+"?service=clearcache");
		} catch (HTTPException e) {
			AppLog.info("HTTPException: " + e.getMessage(),getGrant());
			return "DELETED";
		}
		try{
			new JSONObject(response);
			return "UP";
		}catch(Exception e){
			AppLog.info("response: " + response,getGrant());
			return "DOWN";
			
		}
	}
@Override
public void initUpdate() {
	//setFieldValue("saiInstanceStatus", pingInstance());
	super.initUpdate();
}
	@Override
	public void initCreate(){
		AppLog.info("Initializing create for SaiInstance");

		getField("saiInstanceStatus").setVisibility(ObjectField.VIS_HIDDEN);
		super.initCreate();
	}
	@Override
	public List<String> preValidate() {
		if(isNew()){
			setFieldValue("saiInstanceUrl", "https://candicetest61.demo.simplicite.io");			
		}
		return super.preValidate();		
	}
}