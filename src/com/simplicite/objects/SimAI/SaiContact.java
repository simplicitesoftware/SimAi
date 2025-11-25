package com.simplicite.objects.SimAI;

import java.util.*;
import com.simplicite.commons.SimAI.SaiMailTool;
import com.simplicite.commons.SimAI.SaiTool;
import com.simplicite.util.*;
import com.simplicite.util.tools.*;


import org.json.*;

/**
 * Business object SaiContact
 */
public class SaiContact extends ObjectDB {
	private static final long serialVersionUID = 1L;

	@Override
	public List<String> preValidate() {
		ObjectField field = getField("saiCntViewhomeId");
		if(field.isEmpty()){
			String mld = getFieldValue("saiCntModuleId");
			ObjectDB obj = Grant.getSystemAdmin().getTmpObject("ViewHome");
			synchronized(obj.getLock()){
				obj.resetFilters();
				obj.setFieldFilter("row_module_id",mld);
				List<String[]> rows = obj.search();
				if(!Tool.isEmpty(rows)){
					String id = rows.get(0)[obj.getRowIdFieldIndex()];
					field.setValue(id);
				}
			}
		}
		//List<String> msgs = new ArrayList<>();
		// if(!isNew() &&!getField("saiContactEmail").isEmpty()){
		// 	String mldName = getFieldValue("mdl_name");
		// 	msgs.addAll(genXMLModule(mldName));
			
		// }
		//msgs.add(Message.formatInfo("INFO_CODE", "Message", "fieldName"));
		//msgs.add(Message.formatWarning("WARNING_CODE", "Message", "fieldName"));
		//msgs.add(Message.formatError("ERROR_CODE", "Message", "fieldName"));
		
		
		
		return null;
	}
	public String genXMLModules(){
		List<String> msgs = new ArrayList<>();
		resetFilters();
		for(String[] row : search()){
			String mldName = row[getFieldIndex("mdl_name")];
			msgs.addAll(genXMLModule(mldName,row[getFieldIndex("saiCntModuleId")]));
		}
		return String.join("\n",msgs);
	}
	public String genXMLModule(){
		String mldName = getFieldValue("mdl_name");
		return String.join("\n",genXMLModule(mldName));
	}
	
	public List<String> genXMLModule(String mldName){
		return genXMLModule(mldName,getFieldValue("saiCntModuleId"));
	}
	public static List<String> genXMLModule(String mldName,String moduleId){
		List<String> msgs = new ArrayList<>();
		String msg;
		JSONArray save = removeHomeDispAndTheme(moduleId,Grant.getSystemAdmin());
		
		msg = ModuleDB.exportData(Grant.getSystemAdmin(),mldName, "xml", false,null);
		if(!Tool.isEmpty(msg) && Message.isError(msg))msgs.add(msg);
		msg = ModuleDB.exportModule(Grant.getSystemAdmin(),mldName, "xml", false,false,false,false,false,null);
		if(!Tool.isEmpty(msg) && Message.isError(msg))msgs.add(msg);
		recreateHomeDispAndTheme(save,Grant.getSystemAdmin());
		return msgs;

	}
	public String saveModule(){
		String mldName = getFieldValue("mdl_name");
		String msg = ModuleDB.exportModule(Grant.getSystemAdmin(),mldName, "xml", false,false,false,false,false,null);
		if(!Tool.isEmpty(msg) && Message.isError(msg))return msg;
		return null;
	}
	public String reloadSaved(){
		String mldName = getFieldValue("mdl_name");
		String msg = ModuleDB.importModule(Grant.getSystemAdmin(),mldName, false,null);
		if(!Tool.isEmpty(msg) && Message.isError(msg))return msg;
		SystemTool.resetCache(Grant.getSystemAdmin(),true,true,true,true,0);
		return javascript("window.location.reload();");
	}
	private static void recreateHomeDispAndTheme(JSONArray save,Grant g){
		for(int i = 0; i < save.length(); i++){
			JSONObject item = save.getJSONObject(i);
			if(item.has("id")){
				ObjectDB obj = g.getTmpObject(item.getString("obj"));
				synchronized(obj.getLock()){
					obj.select(item.getString("id"));
					JSONObject fields = item.getJSONObject("fields");
					for(String field : fields.keySet()){
						obj.setFieldValue(field,fields.getString(field));
					}
					obj.validate();
					obj.save();
				}
			}
		}
	}
	private static JSONArray removeHomeDispAndTheme(String moduleId,Grant g){
		JSONArray save = new JSONArray();
		ObjectDB obj = g.getTmpObject("ViewHome");
		String appMldId = SaiTool.DEFAULT_MODULE_ID;
		synchronized(obj.getLock()){
			obj.resetFilters();
			obj.setFieldFilter("row_module_id",moduleId);
			List<String[]> search = obj.search();
			if(!Tool.isEmpty(search)){
				for(String[] row : search){
					String id = row[obj.getRowIdFieldIndex()];
					obj.select(id);
					JSONObject fields = new JSONObject();
					fields.put("viw_disp_id",obj.getFieldValue("viw_disp_id"));
					fields.put("viw_theme_id",obj.getFieldValue("viw_theme_id"));
					fields.put("viw_ui",obj.getFieldValue("viw_ui"));
					save.put(new JSONObject().put("obj","ViewHome").put("id",id).put("fields",fields));
					obj.setFieldValue("viw_disp_id",null);
					obj.setFieldValue("viw_theme_id",null);
					obj.setFieldValue("viw_ui",null);
					obj.validate();
					obj.save();
				}
			}
		}
		obj = g.getTmpObject("Domain");
		synchronized(obj.getLock()){
			obj.resetFilters();
			obj.setFieldFilter("row_module_id",moduleId);
			List<String[]> search = obj.search();
			if(!Tool.isEmpty(search)){
				for(String[] row : search){
					String id = row[obj.getRowIdFieldIndex()];
					obj.select(id);
					JSONObject fields = new JSONObject();
					fields.put("obd_view_id",obj.getFieldValue("obd_view_id"));
					obj.setFieldValue("obd_view_id",null);
					obj.validate();
					obj.save();
					save.put(new JSONObject().put("obj","Domain").put("id",id).put("fields",fields));
				}
			}
		}
		// remove responsability from module
		obj = g.getTmpObject("Responsability");
		synchronized(obj.getLock()){
			obj.resetFilters();
			obj.setFieldFilter("row_module_id",moduleId);
			List<String[]> search = obj.search();
			if(!Tool.isEmpty(search)){
				for(String[] row : search){
					String id = row[obj.getRowIdFieldIndex()];
					obj.select(id);
					obj.setFieldValue("row_module_id",appMldId);
					obj.validate();
					obj.save();
				}
			}
		}
		return save;
	}
	private String delObj(String objName,JSONObject filter,Grant g){
		String xml = "";
		try{
			ObjectDB obj = g.getTmpObject(objName);
			synchronized(obj.getLock()){
				BusinessObjectTool tool = obj.getTool();
				String id =tool.get(filter);
				tool.getForDelete(id);
				xml = ImportExportTool.toXML(obj,"full",false,false);
				obj.delete();
			}
		}catch(Exception e){
			AppLog.error(getClass(),"delObj",e.getMessage(),e,g);
		}
		return xml;
	}
	public String sendContact(){
		SaiMailTool.sendContactEmail(this);
		return Message.formatSimpleInfo("SAI_MAIL_SEND");
	}
	public void sendBusinessMail(){
		

	}
	
}