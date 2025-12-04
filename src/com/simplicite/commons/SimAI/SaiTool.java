package com.simplicite.commons.SimAI;

import java.util.*;

import com.simplicite.util.*;
import com.simplicite.util.exceptions.*;
import com.simplicite.util.tools.*;
import java.util.regex.Pattern;
import java.util.regex.Matcher;
import org.json.*;

import com.simplicite.commons.AIBySimplicite.AITools;
/**
 * Shared code SaiCreateTool
 */
public class SaiTool implements java.io.Serializable {
	private static final long serialVersionUID = 1L;
	private static final Grant sysAdmin = Grant.getSystemAdmin();
	public static final String DEFAULT_MODULE = "SimAiTmp";
	public static final String DEFAULT_MODULE_ID = ModuleDB.getModuleId(DEFAULT_MODULE,true);
	private static final String USAGE_CURRENT_PARAM = "SAI_CURRENT_USAGE";

	public static String getDomainId(String moduleName,Grant g){
		ObjectDB obj = g.getTmpObject("Domain");
		obj.resetFilters();
		obj.setFieldFilter("row_module_id",ModuleDB.getModuleId(moduleName,false));
		return obj.search().get(0)[obj.getRowIdFieldIndex()];
	}
	public static String checkModuleName(String moduleName,Grant g){
		if(Tool.isEmpty(moduleName)) return null;
		
		// Decode URL-encoded characters
		try {
			moduleName = java.net.URLDecoder.decode(moduleName, "UTF-8");
		} catch (Exception e) {
			AppLog.error("Error decoding module name: " + moduleName, e, g);
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
	private static String removeAccents(String text){
		return text.replaceAll("(?u)[éèêë]", "e")
			.replaceAll("(?u)[àâä]", "a")
			.replaceAll("(?u)[îï]", "i")
			.replaceAll("(?u)[ôö]", "o")
			.replaceAll("(?u)[ùûü]", "u")
			.replaceAll("(?u)ç", "c")
			.replaceAll("(?u)ÿ", "y");
	}
	public static JSONArray optJSONArray(String prompt){
		try {
			return new JSONArray(prompt);
		}catch(Exception e){
		 	return new JSONArray();
		}
	}
	public static JSONObject optJSONObject(String object){
		if(Tool.isEmpty(object)) return new JSONObject();
		try{
			return new JSONObject(object);
		}catch(JSONException e){
			return new JSONObject();
		}
	}
	public static JSONArray optHistoric(String historicString, int histDepth){
		if (Tool.isEmpty(historicString)) return null;
		JSONArray historic = new JSONArray();
		int i=0;
		JSONArray list = new JSONArray(historicString);
		int begin = list.length()-histDepth*2;
		for(Object hist : list){
			JSONObject histJson;
			if(i>=begin){
				if(hist instanceof String string){
					histJson = new JSONObject(string);
				}else if(hist instanceof JSONObject jsonObject){
					histJson = jsonObject;
				}else{
					continue;
				}	
				historic.put(AITools.formatMessageHistoric(histJson));
			}
			i++;
		}
		return historic;
	}
	public static  String getScopeByModuleId(String moduleId){
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
	public static  String getCurrentModuleId(Grant g) {
		String moduleParam = g.getUserSystemParam("AI_CURRENT_MODULE_GEN");
		if(Tool.isEmpty(moduleParam)) return null;
		return new JSONObject(moduleParam).optString("moduleId");
	}
	public static String getCurrentModuleName(Grant g) {
		String moduleId = getCurrentModuleId(g);
		if(Tool.isEmpty(moduleId)) return null;
		return ModuleDB.getModuleName(moduleId);
	}
	public static void createOrUpdateTranslation(String obj,String objId,String lang,String val, String moduleId,Grant g) throws GetException, UpdateException, ValidateException{
		ObjectDB oTra = g.getTmpObject("Translate");
		synchronized(oTra.getLock()){
			BusinessObjectTool oTraT = oTra.getTool();
			if(!Tool.isEmpty(objId)){
				String objectRef = Tool.toSQL(obj)+":"+Tool.toSQL(objId);
				if(!Tool.isEmpty(val)){
					if(!oTraT.selectForCreateOrUpdate(new JSONObject().put("tsl_object",objectRef).put("tsl_lang",lang))){
						oTra.setFieldValue("tsl_object",objectRef);
						oTra.setFieldValue("tsl_lang",lang);
						oTra.setFieldValue("row_module_id",moduleId);
					}
					oTra.setFieldValue("tsl_value", val);
					oTraT.validateAndUpdate();
				}
				
			}
		}
		
	}
	public static void addDisposition(String scopeId,String dispName,Grant g){
		ObjectDB obj = g.getTmpObject("ViewHome");
		synchronized(obj.getLock()){
			obj.resetFilters();
			obj.select(scopeId);
			obj.setFieldValue("viw_disp_id",Disposition.getDispositionId(dispName));
			obj.populate(true);
			obj.validate();
			obj.save();
		}
	}
	public static void addHomeContact(String scopeId,String mldName, JSONObject moduleInfo,Grant g){
		
		String appMldId = DEFAULT_MODULE_ID;
		// Create external object
		String extName = moduleInfo.getString("mPrefix")+"HomeContact";
		JSONObject homeContact = new JSONObject();
		homeContact.put("obe_name", extName);
		homeContact.put("obe_widget", true);
		homeContact.put("row_module_id", appMldId);
		homeContact.put("obe_settings", new JSONObject().put("module",mldName).toString());
		homeContact.put("obe_class", "com.simplicite.commons.SimAI.SaiContactWidget");
		homeContact.put("obe_icon","fas/envelope");
		String extId = AITools.createOrUpdateWithJson("ObjectExternal",homeContact,true,g);
		String groupId = moduleInfo.getString("groupId");
		// translate external object
		try{
			createOrUpdateTranslation("ObjectExternal",extId,"FRA","Contactez-nous!",appMldId,g);
			createOrUpdateTranslation("ObjectExternal",extId,"ENU","Contact us!",appMldId,g);
		}catch(Exception e){
			AppLog.error("Error creating translation for external object: " + extId, e, g);
		}
		//add External to shortcut
		JSONObject shortcut = new JSONObject();
		shortcut.put("shc_name", extName);
		shortcut.put("shc_url","[EXPR:HTMLTool.getExternalObjectURL(\""+extName+"\")]");
		shortcut.put("shc_visible","P;B");
		shortcut.put("shc_order",500);
		shortcut.put("shc_icon","fas/envelope");
		shortcut.put("row_module_id",appMldId);
		String shcId = AITools.createOrUpdateWithJson("ShortCut",shortcut,g);

		//translate shortcut
		JSONObject shortcutTrans = new JSONObject();
		shortcutTrans.put("tsl_object","ShortCut:"+shcId);
		shortcutTrans.put("row_module_id",appMldId);
		shortcutTrans.put("tsl_lang","FRA");
		shortcutTrans.put("tsl_value","Contactez-nous!");
		AITools.createOrUpdateWithJson("Translate",shortcutTrans,true,g);
		shortcutTrans.put("tsl_lang","ENU");
		shortcutTrans.put("tsl_value","Contact us!");
		AITools.createOrUpdateWithJson("Translate",shortcutTrans,true,g);
		//add permission to shortcut
		JSONObject permission = new JSONObject();
		permission.put("prm_group_id",groupId);
		permission.put("prm_object","ShortCut:"+shcId);
		permission.put("row_module_id",appMldId);
		AITools.createOrUpdateWithJson("Permission",permission,g);

		// add external object to Domain
		JSONObject domain = new JSONObject();
		domain.put("map_domain_id",moduleInfo.getString("domainId"));
		domain.put("map_object","ObjectExternal:"+extId);
		domain.put("map_order",10);
		domain.put("row_module_id",appMldId);
		AITools.createOrUpdateWithJson("Map",domain,g);
		// add permisions

		JSONObject permissionFlds = new JSONObject();
		permissionFlds.put("prm_group_id",groupId);
		permissionFlds.put("prm_object","ObjectExternal:"+extId);
		permissionFlds.put("row_module_id",appMldId);
		AITools.createOrUpdateWithJson("Permission",permissionFlds,g);

		//Add View group to active group
		JSONObject viewGroupFlds = new JSONObject();
		viewGroupFlds.put("vig_view_id",scopeId);
		viewGroupFlds.put("vig_group_id",GroupDB.getGroupId("SAI_VIEW_MODULE"));
		viewGroupFlds.put("row_module_id",appMldId);
		AITools.createOrUpdateWithJson("ViewGroup",viewGroupFlds,g);
		// remove home in domaine
		ObjectDB obj = g.getTmpObject("Domain");
		synchronized(obj.getLock()){
			obj.select(getDomainId(mldName,g));
			obj.setFieldValue("obd_nohome",true);
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
		//area.put("vwi_view_id",pageId);
		area.put("vwi_type","E");
		area.put("vwi_position",1);
		area.put("vwi_title",false);
		area.put("vwi_url",new JSONObject().put("extobject",extName).toString());
		area.put("row_module_id",appMldId);
		//AITools.createOrUpdateWithJson("ViewItem",area,true,g);
		area.put("vwi_view_id",scopeId);
		AITools.createOrUpdateWithJson("ViewItem",area,true,g);
		
		// add contact profile to groupe
		JSONObject contactProfile = new JSONObject();
		contactProfile.put("prf_profile_id",moduleInfo.getString("groupId"));
		contactProfile.put("prf_group_id",GroupDB.getGroupId("SAI_CNT_GROUP"));
		contactProfile.put("row_module_id",appMldId);
		AITools.createOrUpdateWithJson("Profile",contactProfile,g);
		
	}
	public static List<String> order(JSONArray links,List<String> objs,Grant g){
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
	private static  List<String> orderBoth(List<String> both,JSONObject sources,JSONObject targets,Grant g){
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
	private static  boolean isSourceOfTarget(String target,JSONArray targets){
		for(int i = 0; i < targets.length(); i++){
			if(targets.optString(i,"").equals(target)){
				return true;
			}
		}
		return false;
	}
	private static  boolean sourcesInBoth(JSONArray sources,List<String> both){
		for(Object source : sources){
			if(both.contains((String) source)){
				return true;
			}
		}
		return false;
	}
	public static void addOrderExport(List<String> order,Grant g){
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
	public static void addUpdate(String mldName, JSONObject moduleInfo,Grant g){
		String appMldId = DEFAULT_MODULE_ID;
		String extName = moduleInfo.getString("mPrefix")+"UpdateGenerate";
		JSONObject updateWidget = new JSONObject();
		updateWidget.put("obe_name", extName);
		updateWidget.put("obe_widget", true);
		updateWidget.put("row_module_id", appMldId);
		updateWidget.put("obe_settings", new JSONObject().put("module",mldName).toString());
		updateWidget.put("obe_class", "com.simplicite.commons.SimAI.SaiRedirectUpdateWidget");
		updateWidget.put("obe_icon","icon/color/update");
		String extId = AITools.createOrUpdateWithJson("ObjectExternal",updateWidget,true,g);
		// add External to Domain
		// translate external object
		try{
		createOrUpdateTranslation("ObjectExternal",extId,"FRA","Modifier mon application",appMldId,g);
		createOrUpdateTranslation("ObjectExternal",extId,"ENU","Update my application",appMldId,g);
		}catch(Exception e){
			AppLog.error("Error creating translation for external object: " + extId, e, g);
		}
		JSONObject domain = new JSONObject();
		domain.put("map_domain_id",moduleInfo.getString("domainId"));
		domain.put("map_object","ObjectExternal:"+extId);
		domain.put("map_order",9000);
		domain.put("row_module_id",appMldId);
		AITools.createOrUpdateWithJson("Map",domain,g);
		// add permisions
		JSONObject permission = new JSONObject();
		permission.put("prm_group_id",moduleInfo.getString("groupId"));
		permission.put("prm_object","ObjectExternal:"+extId);
		permission.put("row_module_id",appMldId);
		AITools.createOrUpdateWithJson("Permission",permission,g);
	}
	public static String addUndo(String mldName, Grant g){
		JSONObject moduleInfo = getModuleInfoByModuleName(mldName);
		String appMldId = DEFAULT_MODULE_ID;
		String extName = moduleInfo.getString("mPrefix")+"UndoReGenerate";
		JSONObject undoWidget = new JSONObject();
		undoWidget.put("obe_name", extName);
		undoWidget.put("obe_widget", true);
		undoWidget.put("row_module_id", appMldId);
		undoWidget.put("obe_settings", new JSONObject().put("module",mldName).toString());
		undoWidget.put("obe_class", "com.simplicite.commons.SimAI.SaiUndoWidget");
		undoWidget.put("obe_icon","icon/color/update");
		String extId = AITools.createOrUpdateWithJson("ObjectExternal",undoWidget,true,g);
		// add External to Domain
		// translate external object
		try{
		createOrUpdateTranslation("ObjectExternal",extId,"FRA","Revenir à la version précédente",appMldId,g);
		createOrUpdateTranslation("ObjectExternal",extId,"ENU","Go to the previous version",appMldId,g);
		}catch(Exception e){
			AppLog.error("Error creating translation for external object: " + extId, e, g);
		}
		JSONObject domain = new JSONObject();
		domain.put("map_domain_id",moduleInfo.getString("domainId"));
		domain.put("map_object","ObjectExternal:"+extId);
		domain.put("map_order",9200);
		domain.put("row_module_id",appMldId);
		AITools.createOrUpdateWithJson("Map",domain,g);
		// add permisions
		JSONObject permission = new JSONObject();
		permission.put("prm_group_id",moduleInfo.getString("groupId"));
		permission.put("prm_object","ObjectExternal:"+extId);
		permission.put("row_module_id",appMldId);
		AITools.createOrUpdateWithJson("Permission",permission,g);
		return extId;
	}
	public static JSONObject getModuleInfoByModuleName(String moduleName) {
		String moduleId = ModuleDB.getModuleId(moduleName,false);
		if(Tool.isEmpty(moduleId)) return new JSONObject();
		JSONObject moduleInfo = new JSONObject();
		moduleInfo.put("groupId", getGroupIdForModule(moduleId));
		moduleInfo.put("moduleId", moduleId);
		moduleInfo.put("domainId", getDomainIdForModule(moduleId));
		moduleInfo.put("mPrefix", ModuleDB.getModulePrefixFromId(moduleId));
		return moduleInfo;
	}
	private static String getGroupIdForModule(String moduleId) {
		ObjectDB obj = sysAdmin.getTmpObject("Group");
		obj.resetFilters();
		obj.setFieldFilter("row_module_id", moduleId);
		List<String[]> rows = obj.search();
		AppLog.info("rows: "+rows.toString());
		if(Tool.isEmpty(rows)) return null;
		AppLog.info("rows.get(0): "+String.join(",",rows.get(0)));
		return rows.get(0)[obj.getRowIdFieldIndex()];
	}
	private static String getDomainIdForModule(String moduleId) {
		ObjectDB obj = sysAdmin.getTmpObject("Domain");
		obj.resetFilters();
		obj.setFieldFilter("row_module_id", moduleId);
		List<String[]> rows = obj.search();
		AppLog.info("rows: "+rows.toString());
		if(Tool.isEmpty(rows)) return null;
		AppLog.info("rows.get(0): "+String.join(",",rows.get(0)));
		return rows.get(0)[obj.getRowIdFieldIndex()];
	}
	public static String saveModule(String mldName){
		String msg = ModuleDB.exportModule(Grant.getSystemAdmin(),mldName, "xml", false,false,false,false,false,null);
		if(!Tool.isEmpty(msg) && Message.isError(msg))return msg;
		return null;
	}
	public static String reloadSaved(String mldName){
		
		String msg = ModuleDB.importModule(Grant.getSystemAdmin(),mldName, false,null);
		if(!Tool.isEmpty(msg) && Message.isError(msg))return msg;
		//remove xml file
		String mldId = ModuleDB.getModuleId(mldName,false);
		if(Tool.isEmpty(mldId)) return "module not found";
		ObjectDB obj = Grant.getSystemAdmin().getTmpObject("Module");
		synchronized(obj.getLock()){
			obj.select(mldId);
			obj.setFieldValue("mdl_xml",null);
			obj.validate();
			obj.save();
		}
		
		return null;
	}
	public static String deleteUndoExternal(String extId){
		AppLog.info("delete undo external: " + extId);
		ObjectDB obj = sysAdmin.getTmpObject("ObjectExternal");
		try{
			synchronized(obj.getLock()){
				BusinessObjectTool tool = obj.getTool();
				tool.getForDelete(extId);
				AppLog.info("delete undo external: " + extId);
				AppLog.info(obj.delete());
			}
		}catch(Exception e){
			AppLog.error("Error deleting undo external: " + extId, e, sysAdmin);
			return "Error deleting undo external: " + extId;
		}
		return null;
	}


	public static String getModuleUsageParamName(String moduleName) {
		if (Tool.isEmpty(moduleName)) return USAGE_CURRENT_PARAM;
		return "SAI_USAGE_"+moduleName.toUpperCase();
	} 
	public static void addTokensHistory(Grant g, String moduleName, JSONObject usage) {
		//if empty modulename, is chat no module known so use current param
		String paramName = getModuleUsageParamName(moduleName);
		if(Tool.isEmpty(g.getUserSystemParam(paramName))){
			AppLog.info("addTokensHistory: empty param");
			return;
		}
		JSONObject usageJson = new JSONObject(g.getUserSystemParam(paramName));
		usageJson.getJSONArray("tokens").put(usage);
		g.setUserSystemParam(paramName, usageJson.toString(1), true);
		
	}

	
}