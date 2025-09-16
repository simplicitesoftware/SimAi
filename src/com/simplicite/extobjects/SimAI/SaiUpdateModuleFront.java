package com.simplicite.extobjects.SimAI;

import java.util.*;

import com.simplicite.util.*;
import com.simplicite.util.exceptions.*;
import com.simplicite.util.tools.*;
import org.json.JSONObject;

/**
 * UI component external object SaiUpdateModuleFront
 */
public class SaiUpdateModuleFront extends com.simplicite.webapp.web.ResponsiveExternalObject {
	private static final long serialVersionUID = 1L;
	@Override
	public void init(Parameters params) {
		AppLog.info("SaiUpdateModuleFront init: "+getGrant().getUserSystemParam("update_module"));
		addSimpliciteClient();
		addMermaid();
		appendJSInclude(HTMLTool.getResourceJSURL(getGrant(), "SaiTools"));
		appendJSInclude(HTMLTool.getResourceJSURL(getGrant(), "AiJsTools"));

		
	}
	@Override
	public JSONObject data(Parameters params) {
		JSONObject datas = super.data(params);
		if(Tool.isEmpty(datas)) datas = new JSONObject();
		datas.put("_authtoken", getGrant().getAuthToken());
		datas.put("_ajaxkey", getGrant().getAjaxKey());
		datas.put("moduleName", getGrant().getUserSystemParam("update_module"));
		//getGrant().removeUserSystemParam("update_module",false);
		if("Public".equals(getGrant().getLogin())) datas.put("user", System.getenv("usrName"));
		return datas;
	}
}
