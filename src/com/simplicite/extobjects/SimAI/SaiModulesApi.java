package com.simplicite.extobjects.SimAI;

import java.util.*;

import org.json.*;

import com.simplicite.util.*;
import com.simplicite.util.exceptions.*;
import com.simplicite.util.tools.*;
import com.simplicite.util.annotations.RESTService;
import com.simplicite.util.annotations.RESTServiceParam;
import com.simplicite.util.annotations.RESTServiceOperation;
import com.simplicite.commons.SimAI.SaiDevConst;
import com.simplicite.commons.SimAI.SaiTool;


/**
 * REST service external object SaiModulesApi
 */
public class SaiModulesApi extends com.simplicite.webapp.services.RESTServiceExternalObject {
	private static final long serialVersionUID = 1L;

	/*@Override
	public void init(Parameters params) {
		// if needed...
	}*/

	/**
	 * GET method handler (returns bad request by default)
	 * @param params Request parameters
	 * @return Typically JSON object or array
	 * @throws HTTPException
	 */
	@Override
	public Object get(Parameters params) throws HTTPException {
		List<String> uriParts = params.getURIParts(getName());
		// if get openApi shema
		if (!Tool.isEmpty(uriParts) && uriParts.get(0).startsWith("openapi"))
			return getOpenAPISchema(uriParts.get(0));
		
		try {
			String action = uriParts.isEmpty()?params.getParameter("action",""):uriParts.get(0);
			switch(action){
				case "undoRegnerate":
					return undoRegnerate(uriParts.size()>1?uriParts.get(1):null,uriParts.size()>2?uriParts.get(2):null);
				case "getTokensHistory":
                    return getTokensHistory(uriParts.size()>1?uriParts.get(1):null);
				default:
					return badRequest("Invalid action");
			}
		}catch(Exception e){
			AppLog.error(e,getGrant());
			return error(e);
		}
	}
	@RESTServiceOperation(method = "get", path = "/undoRegnerate/{moduleName}/{extId}", desc = "Undo regenerate")
	public Object undoRegnerate(@RESTServiceParam(name = "moduleName", type = "string", desc = "Module name", required = true, in="path") String moduleName,
		@RESTServiceParam(name = "extId", type = "string", desc = "External object ID", required = true, in="path") String extId) {
			SaiTool.reloadSaved(moduleName);
			SaiTool.deleteUndoExternal(extId);
			SystemTool.resetCache(Grant.getSystemAdmin(),true,true,true,true,0);
			return success("Undo regenerate");
	}
	private Object getOpenAPISchema(String name) {
		if (name.endsWith(".yml") || name.endsWith(".yaml")) {
			setYAMLMIMEType();
			return JSONTool.getYAMLASCIILogo(null) + JSONTool.toYAML(openapi());
		}
		return openapi();
	}
	@RESTServiceOperation(method = "get", path = "/getTokensHistory/{moduleName}", desc = "Get history for a module")
    public Object getTokensHistory(@RESTServiceParam(name = "moduleName", type = "string", desc = "Module name", required = true, in="path") String moduleName) {
    	
		JSONObject tmp = new JSONObject(getGrant().getUserSystemParam(SaiTool.getModuleUsageParamName(moduleName)));
		if(SaiDevConst.isWithoutAiDebug())
			tmp.put("tokens", SaiDevConst.getFakeUsage());
        return success(tmp.toString());
    }
	/**
	 * POST method handler (returns bad request by default)
	 * @param params Request parameters
	 * @return Typically JSON object or array
	 * @throws HTTPException
	 */
	@Override
	public Object post(Parameters params) throws HTTPException {
		/* Example:
		try {
			JSONObject req = params.getJSONObject();
			if (req!=null) {
				return new JSONObject()
					.put("request", req)
					.put("response", "Hello " + req.optString("name", "Unknown") + "!");
			}
			return badRequest("Call me with a request please!");
		} catch (Exception e) {
			return error(e);
		}
		*/
		return super.post(params);
	}
}
