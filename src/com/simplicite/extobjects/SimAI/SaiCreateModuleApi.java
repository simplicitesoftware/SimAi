package com.simplicite.extobjects.SimAI;

import java.util.*;

import org.json.*;

import com.simplicite.util.*;
import com.simplicite.util.exceptions.*;
import com.simplicite.util.tools.*;
import com.simplicite.commons.AIBySimplicite.AIModel;
import com.simplicite.commons.AIBySimplicite.AIData;
import com.simplicite.commons.AIBySimplicite.AITools;
import com.simplicite.commons.SimAI.SaiTool;
import java.util.regex.Pattern;
import java.util.regex.Matcher;
import com.simplicite.util.annotations.RESTService;
import com.simplicite.util.annotations.RESTServiceParam;
import com.simplicite.util.annotations.RESTServiceOperation;
import com.simplicite.commons.SimAI.SaiMailTool;
import com.simplicite.commons.SimAI.SaiDevConst;
/**
 * REST service external object SaiCreateModuleApi
 */
@RESTService(title = "Custom REST API create module by AI", desc = "Custom REST API for create module by AI")
public class SaiCreateModuleApi extends com.simplicite.webapp.services.RESTServiceExternalObject {
	
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
				case "getModuleObjects":
					return getModuleObjects(uriParts.size()>1?uriParts.get(1):null);
				
				default:
					return badRequest("Invalid action");
			}
		}catch(Exception e){
			AppLog.error(e,getGrant());
			return error(e);
		}
	}
	
	@RESTServiceOperation(method = "get", path = "/getModuleObjects/{module}", desc = "Get module objects")
	public Object getModuleObjects(String module){
		if(Tool.isEmpty(module) || !ModuleDB.exists(module)) return error(404,"Module not found");
		String moduleId = ModuleDB.getModuleId(module,false);
		List<String[]> objs = getModuleObjects(moduleId,sysAdmin);
		//AppLog.info("objs: "+objs);
		if(Tool.isEmpty(objs)) return error(404,"Empty module");
		JSONObject json = objectToJSON(objs,ModuleDB.getModulePrefixFromId(moduleId));
		//AppLog.info("json: "+json.toString(1));
		return success(json.toString(1));
	}

	


	private List<String[]> getModuleObjects(String moduleId,Grant g){
		ObjectDB obj = g.getTmpObject("ObjectInternal");
		obj.resetFilters();
		obj.setFieldFilter("row_module_id", moduleId);

		return obj.search();
	}
	private JSONObject objectToJSON(List<String[]> objs,String modulePrefix){
		JSONArray objects = new JSONArray();
		JSONArray relationship = new JSONArray();
		ObjectDB obj = sysAdmin.getTmpObject("ObjectInternal");
		for(String[] el : objs){
			JSONObject object = new JSONObject();
			String objName = el[obj.getFieldIndex("obo_name")];
			String regex = "^(?i)"+modulePrefix+"(.*)$";
			if(objName.matches(regex)){
				object.put("name", objName.replaceFirst(regex, "$1"));
			}else{
				object.put("name", objName);
			}
			
			object.put("comment", el[obj.getFieldIndex("obo_comment")]);
			object.put("attributes", getFieldArray(objName,relationship,modulePrefix));
			objects.put(object);
		}

		return new JSONObject().put("classes",objects).put("relationships",relationship);
	}
	private JSONArray getFieldArray(String objName, JSONArray relationship, String modulePrefix) {
		String regex = "^(?i)"+modulePrefix+"(.*)$";
		ObjectDB obj = getGrant().getTmpObject(objName);
		JSONArray array = new JSONArray();
		for (ObjectField field : obj.getFields()) {
			if(field.isForeignKey()){
				field.getRefObjectName();
				JSONObject relation = new JSONObject();
				String class1 = objName;
				if(class1.matches(regex)){
					class1 = class1.replaceFirst(regex, "$1");
				}
				
				String class2 = field.getRefObjectName();
				if(class2.matches(regex)){
					class2 = class2.replaceFirst(regex, "$1");
				}
				relation.put("class1", class1);
				relation.put("class2", class2);
				relation.put("type","ManyToOne");
				relationship.put(relation);
			}else if(!field.isTechnicalField()){
				JSONObject fieldJson = new JSONObject();
				fieldJson.put("name", field.getName().replace(modulePrefix, ""));
				fieldJson.put("type", ObjectField.getFieldTypeName(String.valueOf(field.getType())));
				fieldJson.put("key", field.isFunctId());
				fieldJson.put("required",field.isRequired());
				array.put(fieldJson);
			}
			
		}
		return array;
	}
	/**
	 * DELETE method handler (returns bad request by default)
	 * @param params Request parameters
	 * @return Typically JSON object or array
	 * @throws HTTPException
	 */
	@Override
	public Object del(Parameters params) throws HTTPException {
		List<String> uriParts = params.getURIParts(getName());
		String action = uriParts.isEmpty()?params.getParameter("action",""):uriParts.get(0);
		switch(action){
			case "deleteModule":
				return deleteModule(uriParts.size()>1?uriParts.get(1):params.getParameter("module",""));
			default:
				return badRequest("Invalid action");
		}
	}
	@RESTServiceOperation(method = "delete", path = "/deleteModule/{module}", desc = "Delete a module")
	public Object deleteModule(String module){
		if(Tool.isEmpty(module) || !ModuleDB.exists(module)) return error(404,"Module not found");
		String err = ModuleDB.delete(Grant.getSystemAdmin(),module,false,null,null,null);
		if(Tool.isEmpty(err)){
			return success("Module "+module+" deleted");
		}
		return error(500,"Module not deleted: "+err);
	}

	@RESTServiceOperation(method = "get", path = "/isModuleNameAvailable/{module}", desc = "Check if a module name is available")
	public Object isModuleNameAvailable(@RESTServiceParam(name = "module",in="path", type = "string", desc = "Module name", required = false) String moduleName) {
		if(Tool.isEmpty(moduleName)) return badRequest("Empty module name");
		moduleName = SaiTool.checkModuleName(moduleName,getGrant());
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
			List<String> uriParts = params.getURIParts(getName());
			if (req!=null) {
				String action = req.optString("action");
				if(Tool.isEmpty(action)){
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
					case "genUpdateJson"://TODO
						return genUpdateJson(req);
					case "prepareJson":
						return prepareJson(req);
					case "genObj":
						return genObj(req);
					case "genUpdateObj":
						return genUpdateObj(req);
					case "genlinks":
						return genLinks();
					case "initClearCache":
						return initClearCache(req);
					case "clearCache":
						return clearGlobalCache(req);
					case "postClearCache":
						return postClearCache();
					case "genJsonData":
						return genJsonData();
					case "genDatas":
						return genDatas(req);
					case "help":
						return help(req);
					case "getModuleDesc":
						return getModuleDesc(req,uriParts.size()>1?uriParts.get(1):null);
					case "initUpdateModule":
						return initUpdateModule(req);
					case "initTokensHistory":
                        return initTokensHistory(req);
                    case "endTokensHistory":
                        return endTokensHistory(req);
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
	private Object initUpdateModule(JSONObject req) {
		String moduleName = req.optString("moduleName");
		return initUpdateModule(moduleName);
	}
	@RESTServiceOperation(method = "post", path = "/initUpdateModule", desc = "Init update module")
	public Object initUpdateModule(@RESTServiceParam(name = "moduleName", type = "string", desc = "Module name", required = true, in="body") String moduleName) {
		getGrant().setUserSystemParam("AI_DATA_MAP_OBJECT", "", true);
		JSONObject moduleInfo = SaiTool.getModuleInfoByModuleName(moduleName);
		if(Tool.isEmpty(moduleInfo)) return error(404,"Module not found");
		getGrant().setUserSystemParam("AI_CURRENT_MODULE_GEN", moduleInfo.toString(1), true);
		return success(moduleInfo);
	}
	
	private Object getModuleDesc(JSONObject req, String module) {
		String objs = req.optString("objs");
		return getModuleDesc(objs,module);
	}
	@RESTServiceOperation(method = "post", path = "/getModuleDesc/{module}", desc = "Get module description")
	public Object getModuleDesc(@RESTServiceParam(
		name = "objs", type = "string", desc = "Objects", required = true, in="body") String objs,
		@RESTServiceParam(name = "module", type = "string", desc = "Module", required = true, in="path") String module
	) {
		if(Tool.isEmpty(objs)) objs = getModuleObjects(module).toString();
		if(Tool.isEmpty(objs)) return error(404,"Empty module");
		if(SaiDevConst.isWithoutAiDebug()) return success(SaiDevConst.getDefaultDescModule());
		String spec = ("FRA".equals(getGrant().getLang()))?"Tu décris un module en UML pour un non-technique":"you describe UML for non technical person";
		String prompt = (("FRA".equals(getGrant().getLang()))?"Décris le module decrit dans le json pour un non-technique":"Describes the application defined by this JSON in a graphical way for non-technical users: ")+objs;
		JSONObject jsonResponse =AITools.aiCaller(sysAdmin, spec,prompt, null,false,true);
		//AppLog.info("jsonResponse: "+jsonResponse.toString(1));
		SaiTool.addTokensHistory(getGrant(), module, jsonResponse.optJSONObject(AITools.USAGE_KEY));
		String contextApp =AITools.parseJsonResponse(jsonResponse);
		//AppLog.info("contextApp: "+contextApp);
		return success(contextApp);
	}

	
	private Object help(JSONObject req) {
		String question = req.optString("question");
		return help(question);
	}
	@RESTServiceOperation(method = "get", path = "/help", desc = "Get help for a module")
	public Object help(@RESTServiceParam(name = "question", type = "string", desc = "Question", required = true, in="body") String question) {
		Grant g = getGrant();
		return success(question);
	}

	@RESTServiceOperation(method = "get", path = "/isPostClearCache", desc = "Check it's a reconnection after clear cache in creation process")
	public Object isPostClearCache() {
		Grant g = getGrant();
		return new JSONObject().put("isPostClearCache", g.hasParameter("AI_AWAIT_CLEAR_CACHE")).put("isPostClearCache", g.hasParameter("AI_AWAIT_CLEAR_CACHE"));
	}
	

	@RESTServiceOperation(method = "get", path = "/getRedirectScope/{module}", desc = "Get redirect scope for a module")
	public Object getRedirectScope(@RESTServiceParam(name = "module",in="path", type = "string", desc = "Module name. Default is current creation module", required = false) String module) {
		String mldid;
		if(Tool.isEmpty(module)){
			mldid = SaiTool.getCurrentModuleId(getGrant());
			if(Tool.isEmpty(mldid)) return error(404, "No current module creation");
		}else{
			mldid = ModuleDB.getModuleId(module);
		}
		if(Tool.isEmpty(mldid)) return error(404,"Module not found");
		String scope = SaiTool.getScopeByModuleId(mldid);
		if(Tool.isEmpty(scope)) return error(404,"No scope found");
		return new JSONObject()
			.put("redirect", "scope="+scope);
		
	}
	@RESTServiceOperation(method = "post", path = "/genDatas", desc = "generate datas for a module")
	public Object genDatas(@RESTServiceParam(name = "datas", type = "string", desc = "Datas: JSON string", required = true, in="body") String datas) {
		Grant g = getGrant();
		String moduleParam = g.getUserSystemParam("AI_CURRENT_MODULE_GEN");
		AIModel.ModuleInfo mInfo = new AIModel.ModuleInfo(new JSONObject(moduleParam));
		String moduleName =ModuleDB.getModuleName(mInfo.getModuleId());
		JSONObject JsonDatas = new JSONObject(datas);
		if(Tool.isEmpty(JsonDatas)) return error(404,"No datas");
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
		JSONObject response = AIData.genDataForModule(moduleName,true,sysAdmin);
		if(response.has("error")){
			if(response.has("error_status")){
				return error(response.getInt("error_status"),response.getString("error"));
			}
			if(response.getString("error").equals("token_limit_reached")){
				return error(413,"Token limit reached");
			}
			return error(500,response.getString("error"));
		}
		SaiTool.addTokensHistory(getGrant(), moduleName, response.optJSONObject(AITools.USAGE_KEY));
		response.remove(AITools.USAGE_KEY);
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
		
		List<String> order = SaiTool.order(res.getJSONArray("links"),dataMaps.getObjCreateIds(),sysAdmin);
		SaiTool.addOrderExport(order,sysAdmin);
		return new JSONObject().put("links",res.getJSONArray("mermaid")).put("order",order);
	}
	
	
	@RESTServiceOperation(method = "post", path = "/genObj", desc = "generate an object for a module")
	public Object genObj(@RESTServiceParam(name = "objName", type = "string", desc = "Object name", required = true, in="body") String objName) throws GetException, ValidateException, SaveException{

		Grant g = getGrant();
		String jsonString = g.getUserSystemParam("AI_JSON_TOGEN");
		JSONObject json = AITools.getValidJson(jsonString);
		JSONObject classes = json.getJSONObject("classes");
		JSONObject jsonObj = classes.getJSONObject(objName);
		
		return createObj(jsonObj, objName,json,g);
	}
	private Object createObj(JSONObject jsonObj, String objName,JSONObject json,Grant g) throws GetException, ValidateException, SaveException{
		int fieldOrder = 100;
		String datamapParam =g.getUserSystemParam("AI_DATA_MAP_OBJECT");
		AIModel.DataMapObject dataMaps;
		if(Tool.isEmpty(datamapParam)){

			dataMaps= new AIModel.DataMapObject();
		}else{
			dataMaps = new AIModel.DataMapObject(new JSONObject(datamapParam));
		}
		int domainOrder = jsonObj.getInt("domainOrder");
		String objPrefix=AIModel.getOboPrefix(jsonObj, objName);
		//AppLog.info("objPrefix: "+objPrefix);
		//AppLog.info("moduleInfo: "+g.getUserSystemParam("AI_CURRENT_MODULE_GEN"));
		AIModel.ModuleInfo mInfo = new AIModel.ModuleInfo(new JSONObject(g.getUserSystemParam("AI_CURRENT_MODULE_GEN")));
		String oboId = AIModel.createObject(jsonObj, objName, objPrefix, domainOrder,mInfo, dataMaps, sysAdmin);
		List<String> fields = new ArrayList<>();
		if(jsonObj.has("attributes")){	
			
			fields.addAll(AIModel.parsefield(jsonObj, json, oboId, fieldOrder, mInfo, dataMaps, false, sysAdmin));
		}
		
		g.setUserSystemParam("AI_DATA_MAP_OBJECT", dataMaps.toJson().toString(1), true);
		JSONObject res = new JSONObject().put("name", objName).put("fields",fields);
		//AppLog.info("res: "+res.toString(1));
		return res;
	}
	
	private Object genObj(JSONObject req) throws GetException, ValidateException, SaveException{
		
		String objName = req.getString("objName");
		return genObj(objName);
	}
	private Object genUpdateObj(JSONObject req) {
		String objName = req.getString("objName");
		return genUpdateObj(objName);
	}
	@RESTServiceOperation(method = "post", path = "/genUpdateObj", desc = "create update or delete object")
	public Object genUpdateObj(@RESTServiceParam(name = "objName", type = "string", desc = "Object name", required = true, in="body") String objName) {
		Grant g = getGrant();
		String jsonString = g.getUserSystemParam("AI_JSON_TOGEN");
		JSONObject json = AITools.getValidJson(jsonString);
		JSONObject classes = json.getJSONObject("classes");
		JSONObject jsonObj = classes.getJSONObject(objName);
		if(!jsonObj.has("action")) jsonObj.put("action", "create");
		try{
			switch(jsonObj.getString("action").toLowerCase()){
				case "delete":
					return deleteObj(jsonObj, objName,json,g);
				case "update":
					return updateObj(jsonObj, objName,json,g);
				case "create": //default create new object
				default:
					return createObj(jsonObj, objName,json,g);
			}
		}catch(GetException |ValidateException |SaveException e){
			return error(500,"Error creating or updating object: "+e.getMessage());
		}
	}
	private Object deleteObj(JSONObject jsonObj, String objName,JSONObject json,Grant g) {
		AIModel.ModuleInfo mInfo = new AIModel.ModuleInfo(new JSONObject(g.getUserSystemParam("AI_CURRENT_MODULE_GEN")));
		String name = mInfo.getFormatedObjectName(objName);
		
		String id = ObjectCore.getObjectId(name);
		if(Tool.isEmpty(id)) return error(404,"Object to delete not found");
		ObjectDB obj = sysAdmin.getTmpObject("ObjectInternal");
		try{
			synchronized(obj.getLock()){
				BusinessObjectTool t = obj.getTool();
				t.getForDelete(id);
				obj.delete();
			}
		}catch(GetException e){
			return error(500,"Error deleting object: "+e.getMessage());
		}
		return success(name);
		
	}
	private Object updateObj(JSONObject jsonObj, String objName,JSONObject json,Grant g) throws GetException, ValidateException, SaveException{
		return createObj(jsonObj, objName,json,g);
	}
	private String hasKeyIgnoreCase(JSONObject jsonObjects, String key) {
		if(Tool.isEmpty(key)) return null;
		key = key.toLowerCase();
		Set<String> keys = jsonObjects.keySet();
		for(String k : keys){
			if(key.equals(k.toLowerCase())){
				return k;
			}
		}
		return null;
	}
	@RESTServiceOperation(method = "post", path = "/prepareJson", desc = "prepare json for create object")
	public Object prepareJson(
		@RESTServiceParam(name = "json", type = "string", desc = "JSON string", required = true, in="body") String json
		) {
		String domainId =new JSONObject(getGrant().getUserSystemParam("AI_CURRENT_MODULE_GEN")).getString("domainId");
		int domainOrder = getInitialDomainOrder(domainId);
		
		JSONObject jsonObjects = new JSONObject(json);
		String keyClasses = hasKeyIgnoreCase(jsonObjects, "classes");
		if(!Tool.isEmpty(keyClasses)){
			Set<String> keys = jsonObjects.keySet();
			for(String key: keys){
				keyClasses =hasKeyIgnoreCase(jsonObjects.getJSONObject(key), "classes");
				if(!Tool.isEmpty(keyClasses)){
					jsonObjects = jsonObjects.getJSONObject(key);
					break;
				}

			}
			
		}
		if(Tool.isEmpty(jsonObjects) || Tool.isEmpty(keyClasses)) return error(404,"Invalid json");
		if(!"classes".equals(keyClasses)){
			jsonObjects.put("classes", jsonObjects.getJSONObject(keyClasses));
			jsonObjects.remove(keyClasses);
			keyClasses = "classes";
		}
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
		if(jsonObjects.has("objectToDelete")){
			//AppLog.info("objectToDelete: "+jsonObjects.getJSONArray("objectToDelete").toString());
			for(Object object : jsonObjects.getJSONArray("objectToDelete")){
				String objName = (String) object;
				objects.add(objName);
				classes.put(objName, new JSONObject().put("name", AIModel.formatObjectNames(objName)).put("action", "delete"));
			}
		}
		jsonToGen.put("classes", classes);
		getGrant().setUserSystemParam​("AI_JSON_TOGEN", jsonToGen.toString(1), true);
		return new JSONObject().put("objects", objects);
	}
	private int getInitialDomainOrder(String domainId) {
		ObjectDB obj = sysAdmin.getTmpObject("Map");
		obj.resetFilters();
		obj.setFieldFilter("map_domain_id", domainId);
		obj.resetOrders();
		obj.setFieldOrder("map_order", -1);
		List<String[]> rows = obj.search();
		//AppLog.info("rows: "+rows.toString());
		if(Tool.isEmpty(rows)) return 100;
		// for(String[] row : rows){
		// 	AppLog.info("row: "+String.join(",",row));
		// }
		int initialOrder = 100;
		if(rows.size() > 3) initialOrder = Integer.parseInt(rows.get(2)[obj.getFieldIndex("map_order")])+100;//pass the external objects
		if(initialOrder == 0) initialOrder = 100;
		if(initialOrder == 9100) initialOrder = 9100;
		//AppLog.info("initialOrder: "+String.valueOf(initialOrder));
		return initialOrder;
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
		String validModuleName = SaiTool.checkModuleName(moduleName,getGrant()); 
		if (ModuleDB.exists(validModuleName)) {
			if(!validModuleName.endsWith("_"+login) && ModuleDB.exists(validModuleName+"_"+login)) return error(409, "Module " + moduleName + " already exists!");
			validModuleName = validModuleName+"_"+login;
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
		SaiTool.addHomeContact(scopeId,validModuleName,moduleInfo,sysAdmin);
		SaiTool.addUpdate(validModuleName,moduleInfo,sysAdmin);
		getGrant().addResponsibility("SAI_UPDATE_MODULE","","",true,SaiTool.DEFAULT_MODULE);
		//Grant.addResponsibility(String.valueOf(getGrant().getUserId()),"SAI_UPDATE_MODULE");
		SaiTool.addDisposition(scopeId,"SaiModulesDisp",sysAdmin);
		getGrant().setUserSystemParam("AI_CURRENT_MODULE_GEN", moduleInfo.toString(1), true);
		sysAdmin.changeAccess("Theme",oldThemeAccess);
		// move usage from curent to dedicated module
		String currentParam = SaiTool.getModuleUsageParamName("");
		JSONObject usage = new JSONObject(getGrant().getUserSystemParam(currentParam));
		getGrant().setUserSystemParam(SaiTool.getModuleUsageParamName(validModuleName), usage.toString(), true);
		getGrant().removeUserSystemParam(currentParam,true);
		return moduleInfo.put("name",validModuleName);
	}
	
	@RESTServiceOperation(method = "post", path = "/chat", desc = "chat with the AI")
	public Object chat(
		@RESTServiceParam(name = "prompt", type = "object", desc = "Prompt: string or JSON Object", required = true, in="body") String prompt,
		@RESTServiceParam(name = "specialisation", type = "string", desc = "Specialisation default specialization for uml definition", required = false, in="body") String specialisation,
		@RESTServiceParam(name = "historic", type = "array", desc = "Historic: JSON Array", required = false, in="body") JSONArray historic,
		@RESTServiceParam(name = "providerParams", type = "object", desc = "Provider parameters: JSON Object", required = false, in="body") JSONObject providerParams,
		@RESTServiceParam(name = "moduleName", type = "string", desc = "Module name for reprompting", required = false, in="body") String moduleName
		
		){
			boolean isJsonPrompt = true;
			String ping = AITools.pingAI();
			if(!AITools.PING_SUCCESS.equals(ping)){
				AppLog.error(ping,null,getGrant());
				SaiMailTool.sendAiAlert("Provider api is not available:  error during ping: "+ping);
				return error(503,"Provider api is not available");
			}
			if(Tool.isEmpty(prompt)){
				return error(400,"Empty prompt");
			}
			JSONArray jsonPrompt = SaiTool.optJSONArray(prompt);
			if(Tool.isEmpty(jsonPrompt)){
				isJsonPrompt = false;
			}
			JSONObject resJson = AITools.aiCaller(getGrant(), specialisation, historic, providerParams, isJsonPrompt ? jsonPrompt : prompt);
			if(resJson.has("error")){
				SaiMailTool.sendAiAlert("error during ai api call (chat): \n"+resJson.getString("error"));
				return error(503,resJson.getString("error"));
			}
			SaiTool.addTokensHistory(getGrant(), moduleName, resJson.optJSONObject(AITools.USAGE_KEY));
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
		String moduleName = req.optString("module","");
		if(req.has("moduleContext")){
			//todo call api with context
		}
		JSONArray historic = SaiTool.optHistoric(historicString, histDepth);
		JSONObject providerParams = SaiTool.optJSONObject(providerParamsString);
		return chat(prompt, specialisation, historic, providerParams, moduleName);

	}
	
	@RESTServiceOperation(method = "post", path = "/genJson", desc = "generate a json module from a chat of design")
	public Object genJson(
		@RESTServiceParam(name = "historic", type = "array", desc = "Historic: JSON Array", required = true, in="body") String historicString,
		@RESTServiceParam(name = "moduleName", type = "string", desc = "Module name for reprompting", required = false, in="body") String moduleName
		){
		if(Tool.isEmpty(moduleName)) moduleName = SaiTool.getCurrentModuleName(getGrant());
		int histDepth = AITools.getHistDepth();
		JSONArray historic = SaiTool.optHistoric(historicString, histDepth);	
		byte[] template =getGrant().getExternalObject("AIProcessResource").getResourceContent(Resource.TYPE_OTHER,"CONTEXT_INTERACTION_PROMPT");
		String result;
		if(SaiDevConst.isWithoutAiDebug()){
			result = SaiDevConst.getFakeResponse();
		}else{
			JSONObject jsonResponse = AITools.aiCaller(getGrant(), AITools.SPECIALISATION_NEED_JSON, template!=null?new String(template):"", historic,false,true);
			if(jsonResponse.has("error")){
				SaiMailTool.sendAiAlert("error during ai api call (genJson): \n"+jsonResponse.getString("error"));
				return error(503,jsonResponse.getString("error"));
			}
			
			SaiTool.addTokensHistory(getGrant(), moduleName, jsonResponse.optJSONObject(AITools.USAGE_KEY));
			result = AITools.parseJsonResponse(jsonResponse);
		}
		AppLog.info("result:\n"+result);
		List<String> listResult = new ArrayList<>();
		
		JSONObject jsonres = AITools.getValidJson(result);
		if(Tool.isEmpty(jsonres)){	
			listResult = AITools.getJSONBlock(result,getGrant());
			
			if(Tool.isEmpty(listResult)){
				jsonres = AITools.getValidJson(listResult.get(1));
				if(Tool.isEmpty(jsonres)){
					return error(500,"Sorry AI do not return interpretable json:"+result);
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
		//AppLog.info("jsonRes: "+jsonRes.toString(1));
		return jsonRes;
	}
	private Object genJson(JSONObject req) {
		
		String historicString = req.optString("historic");
		JSONArray historicJson = new JSONArray(historicString);
		sendHistoricToCommerce(historicJson);
		return genJson(historicString,"");
	}
	private void sendHistoricToCommerce(JSONArray historicJson) {
		//AppLog.info("historicJson: "+historicJson.toString(1));
		JSONObject datas = new JSONObject();
		datas.put("FirstName",getGrant().getFirstName());
		datas.put("LastName", getGrant().getLastName());
		datas.put("Email", getGrant().getEmail());
		JSONObject histJson = new JSONObject(historicJson.optString(0));	
		//AppLog.info("content: "+histJson.toString(1));
		if(histJson.has("content")){
			JSONArray contents = histJson.optJSONArray("content");
			for(Object content : contents){
				JSONObject contentJson = (JSONObject) content;
				datas.put("content", "");
				if("text".equals(contentJson.optString("type"))){
					datas.put("Request", datas.optString("Request","")+"\n"+contentJson.optString("text").replaceAll("\\n", "<br />"));
				}else if("image_url".equals(contentJson.optString("type"))){
					datas.put("image_url", contentJson.optJSONObject("image_url").optString("url"));
				}
			}
		}
		JSONArray prompts = new JSONArray();	
		
		for(Object hist : historicJson){
			histJson = new JSONObject((String) hist);
			JSONObject content = new JSONObject();
			if("user".equals(histJson.optString("role"))){
				content.put("user", true);
				if(histJson.has("content")){
					JSONArray contents = histJson.optJSONArray("content");
					for(Object cont : contents){
						JSONObject contentJson = (JSONObject) cont;
						content.put("content", "");
						if("text".equals(contentJson.optString("type"))){
							content.put("content", content.optString("content","")+"\n"+contentJson.optString("text"));
						}else if("image_url".equals(contentJson.optString("type"))){
							content.put("image_url", contentJson.optJSONObject("image_url").optString("url"));
						}
					}
				}
			}else{
				content.put("user", false);
				content.put("content", histJson.optString("content"));
			}
			
			
			prompts.put(content);
		}
		//datas.put("prompts", prompts);
		String body = MustacheTool.apply(HTMLTool.getResourceHTMLContent(getGrant(), "SAI_COMERCE_MAIL"), datas);
		SaiMailTool.sendCommercialEmail(body,prompts);
		
	}
	private Object genUpdateJson(JSONObject req) {
		String historicString = req.optString("historic");
		String moduleName = req.optString("moduleName",SaiTool.getCurrentModuleName(getGrant()));
		return genUpdateJson(historicString,moduleName);
	}
	@RESTServiceOperation(method = "post", path = "/genUpdateJson", desc = "generate a json module from a chat of design for update")
	public Object genUpdateJson(
		@RESTServiceParam(name = "historic", type = "array", desc = "Historic: JSON Array", required = true, in="body") String historicString,
		@RESTServiceParam(name = "moduleName", type = "string", desc = "Module name", required = false, in="body") String moduleName
		){
		if(Tool.isEmpty(moduleName)) moduleName = SaiTool.getCurrentModuleName(getGrant());
		int histDepth = AITools.getHistDepth();
		JSONArray historic = SaiTool.optHistoric(historicString, histDepth);	
		byte[] template =getGrant().getExternalObject("AIProcessResource").getResourceContent(Resource.TYPE_OTHER,"CONTEXT_INTERACTION_UPDATE_PROMPT");
		String result;
		String objs = getModuleObjects(moduleName).toString();
		//AppLog.info("objs: "+objs);
		if(SaiDevConst.isWithoutAiDebug()){
			result = SaiDevConst.getFakejsonUpdateResponse();
		}else{
			// todo adapte template and specialisation to update
			JSONObject actualDescription  = getJSONDescription(moduleName);
			
			JSONObject jsonResponse = AITools.aiCaller(getGrant(), AITools.SPECIALISATION_UPDATE_JSON+" "+objs/*getModuleObjects(moduleName).toString()*/, template!=null?new String(template):"", historic,false,true);
			if(jsonResponse.has("error")){
				SaiMailTool.sendAiAlert("error during ai api call (genUpdateJson): \n"+jsonResponse.getString("error"));
				return error(503,jsonResponse.getString("error"));
			}
			//AppLog.info("jsonResponse: "+jsonResponse.toString(1));
			SaiTool.addTokensHistory(getGrant(), moduleName, jsonResponse.optJSONObject(AITools.USAGE_KEY));
			result = AITools.parseJsonResponse(jsonResponse);
			//AppLog.info("result: "+result);
		}
		List<String> listResult = new ArrayList<>();
		
		JSONObject jsonres = AITools.getValidJson(result);
		if(Tool.isEmpty(jsonres)){	
			listResult = AITools.getJSONBlock(result,getGrant());
			
			if(Tool.isEmpty(listResult)){
				jsonres = AITools.getValidJson(listResult.get(1));
				if(Tool.isEmpty(jsonres)){
					return error(500,"Sorry AI do not return interpretable json:"+result);
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
			listResult.add(jsonres.toString(1));
			listResult.add("''");	
		}
		JSONArray jsonRes = new JSONArray();
		jsonRes.put(listResult.get(0));
		jsonRes.put(listResult.get(1));
		jsonRes.put(listResult.get(2));
		//AppLog.info("jsonRes: "+jsonRes.toString(1));
		return jsonRes;
	}
	JSONObject getJSONDescription(String moduleName) {
		JSONObject json = new JSONObject();
		JSONArray classes = new JSONArray();
		ObjectDB obj = sysAdmin.getTmpObject("ObjectInternal");
		List<String[]> objs = getModuleObjects(moduleName,sysAdmin);
		for(String[] objRow : objs){
			JSONObject ojson = new JSONObject();
			ojson.put("name", objRow[obj.getFieldIndex("obo_name")]);
			ojson.put("trigram", objRow[obj.getFieldIndex("obo_prefix")]);
			ojson.put("comment", objRow[obj.getFieldIndex("obo_comment")]);		
			JSONArray attributes = new JSONArray();
			ObjectDB objAttr = sysAdmin.getTmpObject("ObjectFieldSystem");
			objAttr.resetFilters();
			objAttr.setFieldFilter("row_object_id", objRow[obj.getFieldIndex("row_id")]);
			List<String[]> attrs = objAttr.search();
			for(String[] attrRow : attrs){
				JSONObject attr = new JSONObject();
				attr.put("name", attrRow[objAttr.getFieldIndex("fld_name")]);
				attr.put("type", translateFieldType(Integer.parseInt(attrRow[objAttr.getFieldIndex("fld_type")])));
				attr.put("required", ("1".equals(attrRow[objAttr.getFieldIndex("fld_required")])?"true":"false"));
				attr.put("key", ("1".equals(attrRow[objAttr.getFieldIndex("fld_fonctid")])?"true":"false"));
				attributes.put(attr);
			}
			ojson.put("attributes", attributes);
			classes.put(ojson);
		}
		return json;
	}
	String translateFieldType(Integer type) {
		switch(type){
			case ObjectField.TYPE_STRING:
				return "Short text";
			case ObjectField.TYPE_LONG_STRING:
				return "Long text";
			case ObjectField.TYPE_INT:
				return "Integer";
			case ObjectField.TYPE_FLOAT:
				return "Decimal";
			case ObjectField.TYPE_BIGDECIMAL:
				return "BigDecimal";
			case ObjectField.TYPE_DATE:
				return "Date";
			case ObjectField.TYPE_DATETIME:
				return "Date and time";
			case ObjectField.TYPE_TIME:
				return "Time";
			case ObjectField.TYPE_ENUM:
				return "Enumeration";
			case ObjectField.TYPE_ENUM_MULTI:
				return "Multiple enumeration";
			case ObjectField.TYPE_BOOLEAN:
				return "Boolean";
			case ObjectField.TYPE_URL:
				return "URL";
			case ObjectField.TYPE_HTML:
				return "HTML content";
			case ObjectField.TYPE_EMAIL:
				return "Email";
			case ObjectField.TYPE_DOC:
				return "Document";
			case ObjectField.TYPE_OBJECT:
				return "Object";
			case ObjectField.TYPE_PASSWORD:
				return "Password";
			case ObjectField.TYPE_EXTFILE:
				return "External file";
			case ObjectField.TYPE_IMAGE:
				return "Image";
			case ObjectField.TYPE_NOTEPAD:
				return "Notepad";
			case ObjectField.TYPE_PHONENUM:
				return "Phone number";
			case ObjectField.TYPE_COLOR:
				return "Color";
			case ObjectField.TYPE_GEOCOORDS:
				return "Geographical coordinates";
			default:
				return "Short text";
		}
	}

	private Object clearGlobalCache(JSONObject req) {
		boolean isUpdate = req.optBoolean("isUpdate",false);
		String moduleName = req.optString("moduleName","");
		return clearGlobalCache(isUpdate,moduleName);
	}

	@RESTServiceOperation(method = "post", path = "/clearCache", desc = "clear all cache")
	public Object clearGlobalCache(@RESTServiceParam(name = "isUpdate", type = "boolean", desc = "Is update context for scope user", required = false, in="body") boolean isUpdate,
		@RESTServiceParam(name = "moduleName", type = "string", desc = "Module name", required = false, in="body") String moduleName){
		if(isUpdate){
			Grant g = getGrant();
			String moduleId = ModuleDB.getModuleId(moduleName,false);
			if(Tool.isEmpty(moduleId)) return error(404,"Module not found");
			String scope = SaiTool.getScopeByModuleId(moduleId);
			if(Tool.isEmpty(scope)) return error(404,"No scope found");
			g.changeScope(scope);
		}
		SystemTool.resetCache(Grant.getSystemAdmin(),true,true,true,true,0);
		return new JSONObject().put("success", true);
	}
	
	private Object initTokensHistory(JSONObject req) {
		JSONObject usage = new JSONObject().put("begin", Tool.getCurrentDatetime())
											.put("end","")
											.put("tokens",new JSONArray());

		getGrant().setUserSystemParam​(SaiTool.getModuleUsageParamName(""), usage.toString(), true);
        return success("initTokensHistory: "+Tool.getCurrentDatetime());
    }
    
    
    
    private Object endTokensHistory(JSONObject req) {
        String moduleName = req.optString("moduleName");
		if(Tool.isEmpty(moduleName)) moduleName = SaiTool.getCurrentModuleName(getGrant());
		if(Tool.isEmpty(moduleName)) return error(404,"Module not found");
		return endTokensHistory(moduleName);
    }
   
	@RESTServiceOperation(method = "post", path = "/endTokensHistory", desc = "add tokens history")
	public Object endTokensHistory(@RESTServiceParam(name = "moduleName", type = "string", desc = "Module name", required = true, in="body") String moduleName) {
		//AppLog.info("endTokensHistory: "+moduleName);
		//AppLog.info("getGrant().getUserSystemParam(SaiTool.getModuleUsageParamName(moduleName)): "+getGrant().getUserSystemParam(SaiTool.getModuleUsageParamName(moduleName)));
		JSONObject usage = new JSONObject(getGrant().getUserSystemParam(SaiTool.getModuleUsageParamName(moduleName)));
		usage.put("end", Tool.getCurrentDatetime());
		getGrant().setUserSystemParam(SaiTool.getModuleUsageParamName(moduleName), usage.toString(), true);
		return success("endTokensHistory: "+moduleName);
	}
}