package com.simplicite.objects.SimAI;

import java.util.*;
import com.simplicite.commons.SimAI.SaiMailTool;
import com.simplicite.util.*;
import com.simplicite.util.exceptions.*;
import com.simplicite.util.tools.*;
import java.io.*;


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
		List<String> msgs = new ArrayList<>();
		if(!getField("saiContactName").isEmpty()){
			String mldName = getFieldValue("mdl_name");
			String msg;
			JSONArray save = removeHomeDispAndTheme(getFieldValue("saiCntModuleId"),Grant.getSystemAdmin());
			
			msg = ModuleDB.exportData(Grant.getSystemAdmin(),mldName, "xml", false,null);
			if(!Tool.isEmpty(msg) && Message.isError(msg))msgs.add(msg);
			msg = ModuleDB.exportModule(Grant.getSystemAdmin(),mldName, "xml", false,false,false,false,false,null);
			if(!Tool.isEmpty(msg) && Message.isError(msg))msgs.add(msg);

			recreateHomeDispAndTheme(save,Grant.getSystemAdmin());
			
		}
		//msgs.add(Message.formatInfo("INFO_CODE", "Message", "fieldName"));
		//msgs.add(Message.formatWarning("WARNING_CODE", "Message", "fieldName"));
		//msgs.add(Message.formatError("ERROR_CODE", "Message", "fieldName"));
		
		
		
		return msgs;
	}
	private void recreateHomeDispAndTheme(JSONArray save,Grant g){
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
	private JSONArray removeHomeDispAndTheme(String moduleId,Grant g){
		JSONArray save = new JSONArray();
		ObjectDB obj = g.getTmpObject("ViewHome");
		String appMldId = ModuleDB.getModuleId("SimAiTmp",true);
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
	@Override
	public List<String> postValidate() {
		List<String> msgs = new ArrayList<>();
		if(!getField("saiContactName").isEmpty())setFieldValue("saiCntSended",true);
		save();
		//msgs.add(Message.formatInfo("INFO_CODE", "Message", "fieldName"));
		//msgs.add(Message.formatWarning("WARNING_CODE", "Message", "fieldName"));
		//msgs.add(Message.formatError("ERROR_CODE", "Message", "fieldName"));
		
		
		
		return msgs;
	}
	public void sendBusinessMail(){
		SaiMailTool.sendContactEmail(this);

	}
	
}