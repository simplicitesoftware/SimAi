package com.simplicite.extobjects.SimAI;

import java.util.*;

import com.simplicite.util.*;
import com.simplicite.util.exceptions.*;
import com.simplicite.util.tools.*;
import org.json.JSONObject;

/**
 * Basic external object SaiTestapi
 */
public class SaiTestapi extends com.simplicite.util.ExternalObject {
	private static final long serialVersionUID = 1L;
	
	// Note: instead of this basic external object, a specialized subclass should be used

	/**
	 * Display method
	 * @param params Request parameters
	 */
	@Override
	public Object display(Parameters params) {
		try {
			// Call the render Javascript method implemented in the SCRIPT resource
			// ctn is the "div.extern-content" to fill on UI
			String baseUrl = "https://candicetest61.demo.simplicite.io?f=ObjectExternal%3B2278";
			baseUrl="https://candicetest61.demo.simplicite.io/ui?scope=ViewGrant";
			// Clear cache using RESTTool
			String response = HTMLTool.redirectStatement(HTMLTool.getExternalObjectURL("AiMonitoring"));
			AppLog.info("test redirect " + response);
			return response;
		}
		catch (Exception e) {
			AppLog.error(null, e, getGrant());
			return e.getMessage();
		}
	}
}