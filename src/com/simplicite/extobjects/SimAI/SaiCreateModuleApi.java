package com.simplicite.extobjects.SimAI;

import java.util.*;

import org.json.*;

import com.simplicite.util.*;
import com.simplicite.util.exceptions.*;
import com.simplicite.util.tools.*;
import com.simplicite.commons.AIBySimplicite.AIModel;
import com.simplicite.commons.AIBySimplicite.AIData;
import com.simplicite.commons.AIBySimplicite.AITools;
/**
 * REST service external object SaiCreateModuleApi
 */
public class SaiCreateModuleApi extends com.simplicite.webapp.services.RESTServiceExternalObject {
	private static final long serialVersionUID = 1L;
	private static final String REQUEST = "request";
	private static final String RESPONSE = "response";
	private static final String ERROR = "error";
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
		try {
			String action = params.getParameter("action","");
			switch(action){
				case "getRedirectScope":
					return getRedirectScope();
				case "moduleInfo":
					return getModuleInfo();
				default:
					return badRequest("Invalid action");
			}
		}catch(Exception e){
			AppLog.error(e,getGrant());
			return error(e);
		}
	}

	/**
	 * POST method handler (returns bad request by default)
	 * @param params Request parameters
	 * @return Typically JSON object or array
	 * @throws HTTPException
	 */
	@Override
	public Object post(Parameters params) throws HTTPException {

		try {
			JSONObject req = params.getJSONObject();
			if (req!=null) {
				String action = req.optString("action");
				if(!Tool.isEmpty(action))getGrant().setUserSystemParam​("AI_DEDICATE_FRONT_STEP",action, false);
				switch(action) { 
					case "create":
						return create(req);
					case "chat":
						return chat(req);
					case "genJson":
						return genJson(req);
					case "prepareJson":
						return prepareJson(req);
					case "genObj":
						return genObj(req);
					case "genlinks":
						return genLinks(req);
					case "initClearCache":
						return initClearCache(req);
					case "postClearCache":
						return postClearCache(req);
					case "genJsonData":
						return genJsonData(req);
					case "genDatas":
						return genDatas(req);
					default:
						return badRequest("Invalid action");
					
				}
			}
			return badRequest("Call me with a request please!");
		} catch (Exception e) {
			AppLog.error(e,getGrant());
			return error(e);
		}
	}
	private Object getRedirectScope() {
		Grant g = getGrant();
		ObjectDB obj = g.getTmpObject("ViewHome");
		String moduleParam = g.getUserSystemParam("AI_CURRENT_MODULE_GEN");
		String mldid = new JSONObject(moduleParam).optString("moduleId");
		synchronized(obj.getLock()){
		obj.resetFilters();
		obj.setFieldFilter("row_module_id", mldid);
		List<String[]> search = obj.search();
		if(search.isEmpty()){
			return new JSONObject()
				.put(ERROR, "No scope found");
			}
			String scope = search.get(0)[obj.getFieldIndex("viw_name")];
			
			return new JSONObject()
				.put("redirect", "scope="+scope);
			}
	}
	private Object genDatas(JSONObject req) {
		Grant g = getGrant();
		String moduleParam = g.getUserSystemParam("AI_CURRENT_MODULE_GEN");
		AIModel.ModuleInfo mInfo = new AIModel.ModuleInfo(new JSONObject(moduleParam));
		String moduleName =ModuleDB.getModuleName(mInfo.getModuleId());
		JSONObject datas = req.optJSONObject("datas");
		if(Tool.isEmpty(datas)) return badRequest("No datas");
		return new JSONObject().put("success", AIData.createDataFromJSON(moduleName,datas,g));
	}
	private Object genJsonData(JSONObject req) {
		Grant g = getGrant();
		String moduleParam = g.getUserSystemParam("AI_CURRENT_MODULE_GEN");
		AIModel.ModuleInfo mInfo = new AIModel.ModuleInfo(new JSONObject(moduleParam));
		String moduleName =ModuleDB.getModuleName(mInfo.getModuleId());
		if(Tool.isEmpty(moduleName)) return badRequest("Module not found");
		JSONObject response = AIData.genDataForModule(moduleName,g);
		return  response.toString(1);
	}
	private Object postClearCache(JSONObject req) {
		Grant g = getGrant();
		String mermaidJsonDesc = g.getUserSystemParam("AI_AWAIT_CLEAR_CACHE");
		JSONObject mermaidJson = new JSONObject(mermaidJsonDesc);
		g.removeUserSystemParam​("AI_AWAIT_CLEAR_CACHE",true);
		JSONObject res = getModuleInfo().put("mermaidJson", mermaidJson);
		return res;
	}
	private JSONObject getModuleInfo() {
		Grant g = getGrant();
		String moduleParam= g.getUserSystemParam("AI_CURRENT_MODULE_GEN");
		JSONObject moduleInfo = new JSONObject(moduleParam);
		return moduleInfo;
	}
	private Object initClearCache(JSONObject req) {
		Grant g = getGrant();
		g.removeUserSystemParam​("AI_JSON_TOGEN",false);
		g.removeUserSystemParam​("AI_DATA_MAP_OBJECT",false);
		JSONObject mermaidJson = req.optJSONObject("mermaidJson");
		if(Tool.isEmpty(mermaidJson)) return new JSONObject().put("error", "Invalid mermaidJson");
		g.setUserSystemParam​("AI_AWAIT_CLEAR_CACHE", mermaidJson.toString(1), true);
		return new JSONObject().put("success", true);
	}
	private Object genLinks(JSONObject req) throws GetException, ValidateException, UpdateException{
		Grant g = getGrant();
		String datamapParam =g.getUserSystemParam("AI_DATA_MAP_OBJECT");
		AIModel.DataMapObject dataMaps;
		AIModel.ModuleInfo mInfo = new AIModel.ModuleInfo(new JSONObject(g.getUserSystemParam("AI_CURRENT_MODULE_GEN")));
		
		if(Tool.isEmpty(datamapParam)){

			dataMaps= new AIModel.DataMapObject();
		}else{
			dataMaps = new AIModel.DataMapObject(new JSONObject(datamapParam));
		}
		String jsonString = g.getUserSystemParam("AI_JSON_TOGEN");
		JSONObject json = AITools.getValidJson(jsonString);
		return AIModel.createLinks(json.getJSONArray(AIModel.JSON_LINK_KEY),mInfo, dataMaps,true, g);
	}
	private Object genObj(JSONObject req) throws GetException, ValidateException, SaveException{
		int fieldOrder = 100;
		Grant g = getGrant();

		String datamapParam =g.getUserSystemParam("AI_DATA_MAP_OBJECT");
		AIModel.DataMapObject dataMaps;
		if(Tool.isEmpty(datamapParam)){

			dataMaps= new AIModel.DataMapObject();
		}else{
			dataMaps = new AIModel.DataMapObject(new JSONObject(datamapParam));
		}
		String jsonString = g.getUserSystemParam("AI_JSON_TOGEN");
		JSONObject json = AITools.getValidJson(jsonString);
		JSONObject classes = json.getJSONObject("classes");
		String objName = req.getString("objName");
		JSONObject jsonObj = classes.getJSONObject(objName);
		int domainOrder = jsonObj.getInt("domainOrder");
		String objPrefix=AIModel.getOboPrefix(jsonObj, objName);
		AIModel.ModuleInfo mInfo = new AIModel.ModuleInfo(new JSONObject(g.getUserSystemParam("AI_CURRENT_MODULE_GEN")));
		String oboId = AIModel.createObject(jsonObj, objName, objPrefix, domainOrder,mInfo, dataMaps, g);
		List<String> fields = new ArrayList<>();
		AppLog.info("TEST has atribute "+jsonObj.toString(1));
		if(jsonObj.has("attributes")){	
			
			fields.addAll(AIModel.parsefield(jsonObj, json, oboId, fieldOrder, mInfo, dataMaps, false, g));
		}
		
		g.setUserSystemParam("AI_DATA_MAP_OBJECT", dataMaps.toJson().toString(1), true);
		return new JSONObject().put("name", objName).put("fields",fields);
	}
	private Object prepareJson(JSONObject req) {
		int domainOrder = 100;
		String json = req.optString("json");
		JSONObject info = req.optJSONObject("moduleInfo");
		JSONObject jsonObjects = new JSONObject(json);
		if(Tool.isEmpty(jsonObjects)) return new JSONObject().put("error", "Invalid json");
		List<String> objects = new ArrayList<>();
		JSONObject jsonToGen = new JSONObject();
		jsonToGen.put(AIModel.JSON_LINK_KEY, jsonObjects.optJSONArray(AIModel.JSON_LINK_KEY,new JSONArray()));
		JSONObject classes = new JSONObject();
		for(Object object : jsonObjects.getJSONArray("classes")){

			JSONObject jsonObj = (JSONObject) object;
			String objName = AIModel.formatObjectNames(jsonObj.getString("name"));
			jsonObj.put("name", objName);
			jsonObj.put("domainOrder", domainOrder);
			objects.add(objName);
			classes.put(objName, jsonObj);
			domainOrder+=100;			
			//check if AI mis placed link
			jsonToGen.getJSONArray(AIModel.JSON_LINK_KEY).putAll(AIModel.checkMisplacedLink(jsonObj,objName));
		}
		jsonToGen.put("classes", classes);
		getGrant().setUserSystemParam​("AI_JSON_TOGEN", jsonToGen.toString(1), true);
		getGrant().setUserSystemParam​("AI_CURRENT_MODULE_GEN", info.toString(1), true);
		return objects;

	}
	private Object create(JSONObject req) {
		String moduleName = req.getString("moduleName");
		if (!Tool.isEmpty(ModuleDB.getModuleId(moduleName))) {
			return new JSONObject()
				.put(REQUEST, req)
				.put(ERROR, "Module " + moduleName + " already exists!");
		}
		String prefix = moduleName.length() >= 3 ? moduleName.substring(0, 3) : moduleName;
		ObjectDB obj = getGrant().getTmpObject("Module");
		synchronized(obj.getLock()){
			obj.resetFilters();
			obj.setFieldFilter("mdl_prefix", prefix);
			List<String[]> search = obj.search();
			int i = 0;
			while(!search.isEmpty()){
				i++;
				prefix = prefix + String.valueOf(i);
				obj.setFieldFilter("mdl_prefix", prefix);
			}
		}
		JSONObject moduleInfo = AIModel.createModule(moduleName,prefix,getGrant());
		return moduleInfo;
	}
	/**
	 * Chat with the AI
	 * @param req Request parameters
	 * @param req.prompt Prompt string or JSON array
	 * @param req.specialisation Specialisation string
	 * @param req.historic Historic JSON array like [{"role":"user","content":"..."},{"role":"assistant","content":"..."}]
	 * @param req.providerParams Provider parameters JSON object
	 * @return Response
	 */
	private Object chat(JSONObject req) {
		boolean isJsonPrompt = true;
		String prompt = req.getString("prompt");
		JSONArray jsonPrompt = optJSONArray(prompt);
		if(Tool.isEmpty(jsonPrompt)){
			isJsonPrompt = false;
		}
		int histDepth = AITools.getHistDepth();
		JSONObject res;
		String specialisation = req.optString("specialisation");
		String historicString = req.optString("historic");
		String providerParamsString = req.optString("providerParams");
		AppLog.info(providerParamsString);
		JSONArray historic = optHistoric(historicString, histDepth);
		JSONObject providerParams = optJSONObject(providerParamsString);
		res = AITools.aiCaller(getGrant(), specialisation, historic, providerParams, isJsonPrompt ? jsonPrompt : prompt);
		return res;

	}
	private JSONArray optHistoric(String historicString, int histDepth){
		if (Tool.isEmpty(historicString)) return null;
		JSONArray historic = new JSONArray();
		int i=0;
		JSONArray list = new JSONArray(historicString);
		int begin = list.length()-histDepth*2;
		for(Object hist : list){
			if(i>=begin)
				historic.put(AITools.formatMessageHistoric(new JSONObject((String) hist)));
			i++;
		}
		return historic;
	}
	private JSONArray optJSONArray(String prompt){
		try {
			return new JSONArray(prompt);
		}catch(Exception e){
		 	return new JSONArray();
		}
	}
	private JSONObject optJSONObject(String object){
		if(Tool.isEmpty(object)) return new JSONObject();
		try{
			return new JSONObject(object);
		}catch(JSONException e){
			return new JSONObject();
		}
	}
	private Object genJson(JSONObject req) {
		String historicString = req.optString("historic");
		int histDepth = AITools.getHistDepth();
		JSONArray historic = optHistoric(historicString, histDepth);
		byte[] template =getGrant().getExternalObject("AIProcessResource").getResourceContent(Resource.TYPE_OTHER,"CONTEXT_INTERACTION_PROMPT");
		JSONObject jsonResponse = AITools.aiCaller(getGrant(), "you help to create UML in json for application, your answers are automatically processed in java", template!=null?new String(template):"", historic,false,true);
		List<String> listResult = new ArrayList<>();
		String result = AITools.parseJsonResponse(jsonResponse);
		JSONObject jsonres = AITools.getValidJson(result);
		if(Tool.isEmpty(jsonres)){	
			listResult = AITools.getJSONBlock(result,getGrant());
			
			if(Tool.isEmpty(listResult)){
				jsonres = AITools.getValidJson(listResult.get(1));
				if(Tool.isEmpty(jsonres)){
					listResult = new ArrayList<>();
					listResult.add("Sorry AI do not return interpretable json: \n");
				}else{
					listResult.set(1,jsonres.toString());
				}
				
			}
		}else{
			listResult.add("");
			listResult.add(jsonres.toString());
			listResult.add("");	
		}
		return listResult;
	}	

}
