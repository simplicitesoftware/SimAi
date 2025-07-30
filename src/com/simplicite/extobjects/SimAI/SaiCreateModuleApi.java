package com.simplicite.extobjects.SimAI;

import java.util.*;

import org.json.*;

import com.simplicite.util.*;
import com.simplicite.util.exceptions.*;
import com.simplicite.util.tools.*;
import com.simplicite.commons.AIBySimplicite.AIModel;
import com.docusign.esign.client.JSON;
import com.simplicite.commons.AIBySimplicite.AIData;
import com.simplicite.commons.AIBySimplicite.AITools;
import java.util.regex.Pattern;
import java.util.regex.Matcher;
import com.simplicite.util.annotations.RESTService;
import com.simplicite.util.annotations.RESTServiceParam;
import com.simplicite.util.annotations.RESTServiceOperation;
/**
 * REST service external object SaiCreateModuleApi
 */
@RESTService(title = "Custom REST API create module by AI", desc = "Custom REST API for create module by AI")
public class SaiCreateModuleApi extends com.simplicite.webapp.services.RESTServiceExternalObject {
	private static final boolean testWithoutAiCall = Grant.getSystemAdmin().getBooleanParameter("SAI_TEST_INIB_AI_CALL");
	private static final long serialVersionUID = 1L;
	private static final Grant sysAdmin = Grant.getSystemAdmin();
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
				case "isModuleNameAvailable":
					return isModuleNameAvailable(uriParts.size()>1?uriParts.get(1):null);
				case "getRedirectScope":
					return getRedirectScope(uriParts.size()>1?uriParts.get(1):null);
				case "moduleInfo":
					return getModuleInfo();
				case "isPostClearCache":
					return isPostClearCache();
				default:
					return badRequest("Invalid action");
			}
		}catch(Exception e){
			AppLog.error(e,getGrant());
			return error(e);
		}
	}
	@RESTServiceOperation(method = "get", path = "/isModuleNameAvailable/{module}", desc = "Check if a module name is available")
	public Object isModuleNameAvailable(@RESTServiceParam(name = "module",in="path", type = "string", desc = "Module name", required = false) String moduleName) {
		if(Tool.isEmpty(moduleName)) return badRequest("Empty module name");
		moduleName = checkModuleName(moduleName);
		return new JSONObject().put("available", !ModuleDB.exists(moduleName));
	}
	private Object getOpenAPISchema(String name) {
		if (name.endsWith(".yml") || name.endsWith(".yaml")) {
			setYAMLMIMEType();
			return JSONTool.getYAMLASCIILogo(null) + JSONTool.toYAML(openapi());
		}
		return openapi();
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
				if(Tool.isEmpty(action)){
					List<String> uriParts = params.getURIParts(getName());
					if(!uriParts.isEmpty()){
						action = uriParts.get(0);
					}
				}
				if(!Tool.isEmpty(action))sysAdmin.setUserSystemParam​("AI_DEDICATE_FRONT_STEP",action, false);
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
						return genLinks();
					case "initClearCache":
						return initClearCache(req);
					case "postClearCache":
						return postClearCache();
					case "genJsonData":
						return genJsonData();
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
	@RESTServiceOperation(method = "get", path = "/isPostClearCache", desc = "Check it's a reconnection after clear cache in creation process")
	public Object isPostClearCache() {
		Grant g = getGrant();
		return new JSONObject().put("isPostClearCache", g.hasParameter("AI_AWAIT_CLEAR_CACHE")).put("isPostClearCache", g.hasParameter("AI_AWAIT_CLEAR_CACHE"));
	}
	private String getCurrentModuleId() {
		Grant g = getGrant();
		String moduleParam = g.getUserSystemParam("AI_CURRENT_MODULE_GEN");
		if(Tool.isEmpty(moduleParam)) return null;
		return new JSONObject(moduleParam).optString("moduleId");
	}

	@RESTServiceOperation(method = "get", path = "/getRedirectScope/{module}", desc = "Get redirect scope for a module")
	public Object getRedirectScope(@RESTServiceParam(name = "module",in="path", type = "string", desc = "Module name. Default is current creation module", required = false) String module) {
		String mldid;
		if(Tool.isEmpty(module)){
			mldid = getCurrentModuleId();
			if(Tool.isEmpty(mldid)) return error(404, "No current module creation");
		}else{
			mldid = ModuleDB.getModuleId(module);
		}
		if(Tool.isEmpty(mldid)) return error(404,"Module not found");
		String scope = getScopeByModuleId(mldid);
		if(Tool.isEmpty(scope)) return error(404,"No scope found");
		return new JSONObject()
			.put("redirect", "scope="+scope);
		
	}
	private String getScopeByModuleId(String moduleId){
		ObjectDB obj = sysAdmin.getTmpObject("ViewHome");
		synchronized(obj.getLock()){
			obj.resetFilters();
			obj.setFieldFilter("row_module_id", moduleId);
			List<String[]> search = obj.search();
			if(search.isEmpty()){
				return null;
			}

			return search.get(0)[obj.getFieldIndex("viw_name")];
		}
	}
	@RESTServiceOperation(method = "post", path = "/genDatas", desc = "generate datas for a module")
	public Object genDatas(@RESTServiceParam(name = "datas", type = "string", desc = "Datas: JSON string", required = true, in="body") String datas) {
		Grant g = getGrant();
		String moduleParam = g.getUserSystemParam("AI_CURRENT_MODULE_GEN");
		AIModel.ModuleInfo mInfo = new AIModel.ModuleInfo(new JSONObject(moduleParam));
		String moduleName =ModuleDB.getModuleName(mInfo.getModuleId());
		JSONObject JsonDatas = new JSONObject(datas);
		if(Tool.isEmpty(JsonDatas)) return badRequest("No datas");
		return new JSONObject().put("success", AIData.createDataFromJSON(moduleName,JsonDatas,g));
	}
	private Object genDatas(JSONObject req) {
		return genDatas(req.optString("datas"));
	}
	@RESTServiceOperation(method = "post", path = "/genJsonData", desc = "generate json data for a module")
	public Object genJsonData() {
		Grant g = getGrant();
		String moduleParam = g.getUserSystemParam("AI_CURRENT_MODULE_GEN");
		AIModel.ModuleInfo mInfo = new AIModel.ModuleInfo(new JSONObject(moduleParam));
		String moduleName =ModuleDB.getModuleName(mInfo.getModuleId());
		if(Tool.isEmpty(moduleName)) return badRequest("Module not found");
		JSONObject response = AIData.genDataForModule(moduleName,sysAdmin);
		if(response.has("error")){
			return error(503,response.getString("error"));
		}
		return  response.toString(1);
	}

	@RESTServiceOperation(method = "post", path = "/postClearCache", desc = "remove the clear cache flag")
	public Object postClearCache() {
		Grant g = getGrant();
		String mermaidDesc = g.getUserSystemParam("AI_AWAIT_CLEAR_CACHE");
		g.removeUserSystemParam​("AI_AWAIT_CLEAR_CACHE",true);
		JSONObject res = getModuleInfo().put("mermaid", mermaidDesc);
		return res;
	}
	@RESTServiceOperation(method = "get", path = "/moduleInfo", desc = "Get info of current creation module")
	public JSONObject getModuleInfo() {
		Grant g = getGrant();
		String moduleParam= g.getUserSystemParam("AI_CURRENT_MODULE_GEN");
		JSONObject moduleInfo = new JSONObject(moduleParam);
		return moduleInfo;
	}
	@RESTServiceOperation(method = "post", path = "/initClearCache", desc = "setup the clear cache flag")
	public Object initClearCache(@RESTServiceParam(name = "mermaidText", type = "string", desc = "Mermaid uml", required = true, in="body") String mermaidText) {
		Grant g = getGrant();
		g.removeUserSystemParam​("AI_JSON_TOGEN",false);
		g.removeUserSystemParam​("AI_DATA_MAP_OBJECT",false);
		
		if(Tool.isEmpty(mermaidText)) return error(400,"Invalid mermaidText");
		g.setUserSystemParam​("AI_AWAIT_CLEAR_CACHE", mermaidText, true);
		return new JSONObject().put("success", true);
	}
	
	private Object initClearCache(JSONObject req) {
		String mermaidText= req.optString("mermaidText");
		return initClearCache(mermaidText);
	}
	@RESTServiceOperation(method = "post", path = "/genLinks", desc = "generate links for a module")
	public Object genLinks() throws GetException, ValidateException, UpdateException{
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
		JSONObject res =AIModel.createLinks(json.getJSONArray(AIModel.JSON_LINK_KEY),mInfo, dataMaps,true, sysAdmin);
		
		List<String> order = order(res.getJSONArray("links"),dataMaps.getObjCreateIds(),sysAdmin);
		addOrderExport(order,sysAdmin);
		return new JSONObject().put("links",res.getJSONArray("mermaid")).put("order",order);
	}
	private void addOrderExport(List<String> order,Grant g){
		ObjectDB obj = g.getTmpObject("ObjectInternal");
		synchronized(obj.getLock()){
			obj.resetFilters();
			int i = 1;
			for(String id : order){
				obj.select(id);
				obj.setFieldValue("obo_exportorder",i);
				obj.save();
				i+=10;
			}
			
		}
	}
	private List<String> order(JSONArray links,List<String> objs,Grant g){
		ArrayList<String> ordered = new ArrayList<>();
		JSONObject sources = new JSONObject();
		JSONObject targets = new JSONObject();
		ArrayList<String> both = new ArrayList<>();
		ArrayList<String> end = new ArrayList<>();
		for(int i = 0; i < links.length(); i++){
			JSONObject link = links.getJSONObject(i);
			String source = link.getString("source");
			String target = link.getString("target");
			if(sources.has(source)){
				sources.getJSONArray(source).put(target);
			}else{
				sources.put(source,new JSONArray().put(target));
			}
			if(targets.has(target)){
				targets.getJSONArray(target).put(source);
			}else{
				targets.put(target,new JSONArray().put(source));
			}
		}
		for (String obj : objs) {
			if(sources.has(obj) && targets.has(obj)){
				both.add(obj);
			}else if(sources.has(obj)){
				//source at end
				end.add(obj);
			}else {
				//target or nothing at begin
				ordered.add(obj);
			}
		}
		ordered.addAll(orderBoth(both,sources,targets,g));
		ordered.addAll(end);

		return ordered;
	}
	private List<String> orderBoth(List<String> both,JSONObject sources,JSONObject targets,Grant g){
		List<String> safe = new ArrayList<>();
		List<String> ordered = new ArrayList<>();
		for(String target : both){
			// Si les sources ne sont pas dans both, alors safe (ajout a la fin)
			JSONArray sourcesArray = targets.getJSONArray(target);
			if(!sourcesInBoth(sourcesArray,both)){
				safe.add(target);
			}else{
				// Si une sources est dans both, alors si orddered vide ajout
				if(Tool.isEmpty(ordered)){
					ordered.add(target);
				}else{
					List<String> newOrder = new ArrayList<>();
					boolean isInserted = false;
					// Sinon ordoannacement (parcour de ordered si id dans ordered est source de target ajout avant sinon pas au suivant)
					for(String id : ordered){
						if(!isInserted && isSourceOfTarget(target,sources.getJSONArray(id))){
							newOrder.add(target);
							newOrder.add(id);
							isInserted = true;
						}else{
							newOrder.add(id);
						}
					}
					ordered = newOrder;
				}
				
			}
			
			

		}
		ordered.addAll(safe);
		//TODO pas de gestion des boucles.
		return ordered;
	}
	private boolean isSourceOfTarget(String target,JSONArray targets){
		for(int i = 0; i < targets.length(); i++){
			if(targets.optString(i,"").equals(target)){
				return true;
			}
		}
		return false;
	}
	private boolean sourcesInBoth(JSONArray sources,List<String> both){
		for(Object source : sources){
			if(both.contains((String) source)){
				return true;
			}
		}
		return false;
	}
	
	@RESTServiceOperation(method = "post", path = "/genObj", desc = "generate an object for a module")
	public Object genObj(@RESTServiceParam(name = "objName", type = "string", desc = "Object name", required = true, in="body") String objName) throws GetException, ValidateException, SaveException{
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
		JSONObject jsonObj = classes.getJSONObject(objName);
		int domainOrder = jsonObj.getInt("domainOrder");
		String objPrefix=AIModel.getOboPrefix(jsonObj, objName);
		AIModel.ModuleInfo mInfo = new AIModel.ModuleInfo(new JSONObject(g.getUserSystemParam("AI_CURRENT_MODULE_GEN")));
		String oboId = AIModel.createObject(jsonObj, objName, objPrefix, domainOrder,mInfo, dataMaps, sysAdmin);
		List<String> fields = new ArrayList<>();
		if(jsonObj.has("attributes")){	
			
			fields.addAll(AIModel.parsefield(jsonObj, json, oboId, fieldOrder, mInfo, dataMaps, false, sysAdmin));
		}
		
		g.setUserSystemParam("AI_DATA_MAP_OBJECT", dataMaps.toJson().toString(1), true);
		return new JSONObject().put("name", objName).put("fields",fields);
	}
	private Object genObj(JSONObject req) throws GetException, ValidateException, SaveException{
		
		String objName = req.getString("objName");
		return genObj(objName);
	}
	@RESTServiceOperation(method = "post", path = "/prepareJson", desc = "prepare json for create object")
	public Object prepareJson(
		@RESTServiceParam(name = "json", type = "string", desc = "JSON string", required = true, in="body") String json
		) {
		int domainOrder = 100;
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
		return new JSONObject().put("objects", objects);
	}
	private Object prepareJson(JSONObject req) {
		String json = req.optString("json");
		return prepareJson(json);

	}
	private Object create(JSONObject req) {
		String moduleName = req.getString("moduleName");
		JSONObject res = (JSONObject) create(moduleName);
		return res;
	}
	@RESTServiceOperation(method = "post", path = "/create", desc = "create a new module")
	public Object create(
		@RESTServiceParam(name = "moduleName", type = "string", desc = "Module name", required = true, in="body") String moduleName
		){
		String login = getGrant().getLogin();
		
		if(Tool.isEmpty(moduleName)) return error(400, "Empty module name");
		String validModuleName = checkModuleName(moduleName); 
		if (ModuleDB.exists(validModuleName)) {
			return error(400, "Module " + moduleName + " already exists!");
		}
		String prefix = validModuleName.length() >= 3 ? validModuleName.substring(0, 3) : validModuleName;
		ObjectDB obj = sysAdmin.getTmpObject("Module");
		synchronized(obj.getLock()){
			obj.resetFilters();
			obj.setFieldFilter("mdl_prefix", prefix);
			
			int i = 0;
			while(!Tool.isEmpty(obj.search())){
				i++;
				obj.setFieldFilter("mdl_prefix", prefix + String.valueOf(i));
			}
			if(i>0)prefix = prefix + String.valueOf(i);
		}
		boolean[] oldThemeAccess = sysAdmin.changeAccess("Theme", true,true,true,true);
		
		JSONObject moduleInfo = AIModel.createModule(validModuleName,moduleName,"ThemeMondrian-Light",prefix,login,sysAdmin);
		String scopeId ="0";
		obj = sysAdmin.getTmpObject("ViewHome");
		synchronized(obj.getLock()){
			obj.resetFilters();
			obj.setFieldFilter("row_module_id",moduleInfo.getString("moduleId"));
			List<String[]> search = obj.search();
			if(!Tool.isEmpty(search)){
				scopeId = search.get(0)[obj.getRowIdFieldIndex()];
			}
			
		}
		if(moduleInfo.has("error")){
			return error(500, moduleInfo.getString("error"));
		}
		addHomeContact(scopeId,validModuleName,moduleInfo,sysAdmin);
		getGrant().setUserSystemParam​("AI_CURRENT_MODULE_GEN", moduleInfo.toString(1), true);
		sysAdmin.changeAccess("Theme",oldThemeAccess);
		return moduleInfo;
	}
	private void addHomeContact(String scopeId,String mldName, JSONObject moduleInfo,Grant g){
		/*{
		"groupId": "67",
		"moduleId": "43",
		"domainId": "2066",
		"mPrefix": "tes"
		}
  	*/
	  String moduleId = moduleInfo.getString("moduleId");
		// Create external object

		String extName = moduleInfo.getString("mPrefix")+"HomeContact";
		JSONObject homeContact = new JSONObject();
		homeContact.put("obe_name", extName);
		homeContact.put("obe_widget", true);
		homeContact.put("row_module_id", moduleId);
		homeContact.put("obe_settings", new JSONObject().put("module",mldName).toString());
		homeContact.put("obe_class", "com.simplicite.commons.SimAI.SaiContactWidget");
		String extId = AITools.createOrUpdateWithJson("ObjectExternal",homeContact,true,g);
		// add permisions

		JSONObject permissionFlds = new JSONObject();
		permissionFlds.put("prm_group_id",moduleInfo.getString("groupId"));
		permissionFlds.put("prm_object","ObjectExternal:"+extId);
		permissionFlds.put("row_module_id",moduleId);
		AITools.createOrUpdateWithJson("Permission",permissionFlds,g);
		// Create DomainePage
		JSONObject domainPage = new JSONObject();
		domainPage.put("viw_name",moduleInfo.getString("mPrefix")+"Home");
		domainPage.put("viw_type","D");
		domainPage.put("viw_ui","<div class=\"area\" data-area=\"1\"></div>");
		domainPage.put("row_module_id",moduleId);
		domainPage.put("viw_order",1);
		String pageId =AITools.createOrUpdateWithJson("ViewDomain",domainPage,true,g);
		// add to domain
		ObjectDB obj = g.getTmpObject("Domain");
		synchronized(obj.getLock()){
			obj.select(pageId);
			obj.setFieldValue("obd_view_id",pageId);
			obj.validate();
			obj.save();
		}
		// add html to scope
		obj = g.getTmpObject("ViewHome");
		synchronized(obj.getLock()){
			obj.select(scopeId);
			obj.setFieldValue("viw_ui","<div class=\"area\" data-area=\"1\"></div>");
			obj.validate();
			obj.save();
		}

		// add area to scope and domaine page ViewItem
		JSONObject area = new JSONObject();
		area.put("vwi_view_id",pageId);
		area.put("vwi_type","E");
		area.put("vwi_position",1);
		area.put("vwi_title",false);
		area.put("vwi_url",new JSONObject().put("extobject",extName).toString());
		area.put("row_module_id",moduleId);
		AITools.createOrUpdateWithJson("ViewItem",area,true,g);
		area.put("vwi_view_id",scopeId);
		AITools.createOrUpdateWithJson("ViewItem",area,true,g);
		
		// add contact profile to groupe
		JSONObject contactProfile = new JSONObject();
		contactProfile.put("prf_profile_id",moduleInfo.getString("groupId"));
		contactProfile.put("prf_group_id",GroupDB.getGroupId("SAI_CNT_GROUP"));
		contactProfile.put("row_module_id",moduleId);
		AITools.createOrUpdateWithJson("Profile",contactProfile,g);
		
	}
	private String checkModuleName(String moduleName){
		if(Tool.isEmpty(moduleName)) return null;
		
		// Decode URL-encoded characters
		try {
			moduleName = java.net.URLDecoder.decode(moduleName, "UTF-8");
		} catch (Exception e) {
			AppLog.error("Error decoding module name: " + moduleName, e, getGrant());
		}
		Pattern pattern = Pattern.compile("^[a-zA-Z]{1}[a-zA-Z0-9_]*$");
		Matcher matcher = pattern.matcher(moduleName);
		if(!matcher.matches()){
			//remove spaces
			moduleName = moduleName.replaceAll(" ", "_");
			//remove accents
			moduleName = removeAccents(moduleName);
			//remove special characters
			moduleName = moduleName.replaceAll("[^a-zA-Z0-9_]", "");

		}
		return moduleName;
	}
	private String removeAccents(String text){
		return text.replaceAll("(?u)[éèêë]", "e")
			.replaceAll("(?u)[àâä]", "a")
			.replaceAll("(?u)[îï]", "i")
			.replaceAll("(?u)[ôö]", "o")
			.replaceAll("(?u)[ùûü]", "u")
			.replaceAll("(?u)ç", "c")
			.replaceAll("(?u)ÿ", "y");
	}
	@RESTServiceOperation(method = "post", path = "/chat", desc = "chat with the AI")
	public Object chat(
		@RESTServiceParam(name = "prompt", type = "object", desc = "Prompt: string or JSON Object", required = true, in="body") String prompt,
		@RESTServiceParam(name = "specialisation", type = "string", desc = "Specialisation default specialization for uml definition", required = false, in="body") String specialisation,
		@RESTServiceParam(name = "historic", type = "array", desc = "Historic: JSON Array", required = false, in="body") JSONArray historic,
		@RESTServiceParam(name = "providerParams", type = "object", desc = "Provider parameters: JSON Object", required = false, in="body") JSONObject providerParams
		){
			boolean isJsonPrompt = true;
			String ping = AITools.pingAI();
			if(!AITools.PING_SUCCESS.equals(ping)){
				AppLog.error(ping,null,getGrant());
				return error(503,"Provider api is not available");
			}
			JSONArray jsonPrompt = optJSONArray(prompt);
			if(Tool.isEmpty(jsonPrompt)){
				isJsonPrompt = false;
			}
			JSONObject resJson = AITools.aiCaller(getGrant(), specialisation, historic, providerParams, isJsonPrompt ? jsonPrompt : prompt);
			if(resJson.has("error")){
				return error(503,resJson.getString("error"));
			}
			return resJson;
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
		int histDepth = AITools.getHistDepth();
		String specialisation = req.optString("specialisation");
		String historicString = req.optString("historic");
		String providerParamsString = req.optString("providerParams");
		JSONArray historic = optHistoric(historicString, histDepth);
		JSONObject providerParams = optJSONObject(providerParamsString);
		return chat(prompt, specialisation, historic, providerParams);

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
	@RESTServiceOperation(method = "post", path = "/genJson", desc = "generate a json module from a chat of design")
	public Object genJson(
		@RESTServiceParam(name = "historic", type = "array", desc = "Historic: JSON Array", required = true, in="body") String historicString
		){
		int histDepth = AITools.getHistDepth();
		JSONArray historic = optHistoric(historicString, histDepth);	
		byte[] template =getGrant().getExternalObject("AIProcessResource").getResourceContent(Resource.TYPE_OTHER,"CONTEXT_INTERACTION_PROMPT");
		String result;
		if(testWithoutAiCall){
			result = """
Here is the given JSON template with the UML class diagram for the order application extrapolated and completed with the data:
```json
{
  "classes": [
    {
      "name": "User",
      "trigram": "USR",
      "bootstrapIcon": "person",
      "en": "User",
      "fr": "Utilisateur",
      "comment": "Represents the application users",
      "attributes": [
        {
          "name": "id",
          "fr": "Identifiant",
          "en": "Identifier",
          "key": true,
          "required": true,
          "type": "Integer",
          "isStatus": false,
          "class": ""
        },
        {
          "name": "username",
          "fr": "Nom d'utilisateur",
          "en": "Username",
          "key": false,
          "required": true,
          "type": "Short text",
          "isStatus": false,
          "class": ""
        },
        {
          "name": "email",
          "fr": "Email",
          "en": "Email",
          "key": false,
          "required": true,
          "type": "Email",
          "isStatus": false,
          "class": ""
        },
        {
          "name": "password",
          "fr": "Mot de passe",
          "en": "Password",
          "key": false,
          "required": true,
          "type": "Password",
          "isStatus": false,
          "class": ""
        },
        {
          "name": "address",
          "fr": "Adresse",
          "en": "Address",
          "key": false,
          "required": false,
          "type": "Long text",
          "isStatus": false,
          "class": ""
        }
      ]
    },
    {
      "name": "Product",
      "trigram": "PRO",
      "bootstrapIcon": "box",
      "en": "Product",
      "fr": "Produit",
      "comment": "Represents the products available in the application",
      "attributes": [
        {
          "name": "id",
          "fr": "Identifiant",
          "en": "Identifier",
          "key": true,
          "required": true,
          "type": "Integer",
          "isStatus": false,
          "class": ""
        },
        {
          "name": "name",
          "fr": "Nom",
          "en": "Name",
          "key": false,
          "required": true,
          "type": "Short text",
          "isStatus": false,
          "class": ""
        },
        {
          "name": "description",
          "fr": "Description",
          "en": "Description",
          "key": false,
          "required": false,
          "type": "Long text",
          "isStatus": false,
          "class": ""
        },
        {
          "name": "price",
          "fr": "Prix",
          "en": "Price",
          "key": false,
          "required": true,
          "type": "Decimal",
          "isStatus": false,
          "class": ""
        },
        {
          "name": "stock_count",
          "fr": "Stock",
          "en": "Stock count",
          "key": false,
          "required": true,
          "type": "Integer",
          "isStatus": false,
          "class": ""
        }
      ]
    },
    {
      "name": "Order",
      "trigram": "ORD",
      "bootstrapIcon": "shopping-cart",
      "en": "Order",
      "fr": "Commande",
      "comment": "Represents the orders placed by users",
      "attributes": [
        {
          "name": "id",
          "fr": "Identifiant",
          "en": "Identifier",
          "key": true,
          "required": true,
          "type": "Integer",
          "isStatus": false,
          "class": ""
        },
        {
          "name": "user_id",
          "fr": "Utilisateur",
          "en": "User",
          "key": false,
          "required": true,
          "type": "Integer",
          "isStatus": false,
          "class": "User"
        },
        {
          "name": "order_date",
          "fr": "Date de commande",
          "en": "Order date",
          "key": false,
          "required": true,
          "type": "Date and time",
          "isStatus": false,
          "class": ""
        },
        {
          "name": "total_amount",
          "fr": "Montant total",
          "en": "Total amount",
          "key": false,
          "required": true,
          "type": "Decimal",
          "isStatus": false,
          "class": ""
        },
        {
          "name": "status",
          "fr": "Statut",
          "en": "Status",
          "key": false,
          "required": true,
          "type": "Enumeration",
          "isStatus": false,
          "Enumeration": {
            "Values": [
              {
                "code": "P",
                "en": "Pending",
                "fr": "En attente",
                "color": "orange"
              },
              {
                "code": "S",
                "en": "Shipped",
                "fr": "Expédié",
                "color": "green"
              },
              {
                "code": "C",
                "en": "Cancelled",
                "fr": "Annulé",
                "color": "red"
              }
            ]
          },
          "class": ""
        }
      ]
    }
  ],
  "relationships": [
    {
      "class1": "User",
      "class2": "Order",
      "type": "OneToMany"
    },
    {
      "class1": "Order",
      "class2": "Product",
      "type": "ManyToMany"
    }
  ]
}
```
This JSON template represents the UML class diagram for the order application, with the classes, their attributes, relationships, and enumerations defined. The relationships between classes indicate that a user has many orders (OneToMany), and each order contains many products (ManyToMany). The enumeration for the order status has values "Pending" (P), "Shipped" (S), and "Cancelled" (C) with corresponding colors orange, green, and red.
				""";
		}else{
			JSONObject jsonResponse = AITools.aiCaller(getGrant(), AITools.SPECIALISATION_NEED_JSON, template!=null?new String(template):"", historic,false,true);
			if(jsonResponse.has("error")){
				return error(503,jsonResponse.getString("error"));
			}
			result = AITools.parseJsonResponse(jsonResponse);
		}
		List<String> listResult = new ArrayList<>();
		
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
			if(Tool.isEmpty(listResult.get(0))){		
				listResult.add(0,"''");
			}
			if(Tool.isEmpty(listResult.get(listResult.size()-1))){
				listResult.add(listResult.size()-1,"''");
			}
		}else{
			listResult.add("''");
			listResult.add(jsonres.toString());
			listResult.add("''");	
		}
		JSONArray jsonRes = new JSONArray();
		jsonRes.put(listResult.get(0));
		jsonRes.put(listResult.get(1));
		jsonRes.put(listResult.get(2));
		return jsonRes;
	}
	private Object genJson(JSONObject req) {
		String historicString = req.optString("historic");
		return genJson(historicString);
	}	

}