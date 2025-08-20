package com.simplicite.commons.SimAI;

import java.util.*;

import com.simplicite.util.*;
import com.simplicite.bpm.*;
import com.simplicite.util.exceptions.*;
import com.simplicite.util.tools.*;
import org.json.JSONObject;

/**
 * Shared code SaiContactWidget
 */
public class SaiContactWidget extends com.simplicite.webapp.web.widgets.WidgetExternalObject{
	private static final long serialVersionUID = 1L;
	@Override
	public String content(Parameters params)
	{
		Grant g =Grant.getSystemAdmin();
			
		JSONObject settings = getSettings();
		String mld = settings.optString("module");
		String id = getContactId(mld,g);
		if(Tool.isEmpty(id))return "error";
		String js = "$ui.displayForm($('#contact'),'SaiContact','"+id+"',null,null);";
 		
		String contentDiv = "<div id='contact'></div>";
		// String dashboardDiv = "<div id='saicontactdashboard' class='card'></div>"; // inheriting the '.card' styles (border etc)
		
		// String dashboard_js = HTMLTool.getResourceJSContent(getGrant(), "SAI_DASHBOARD_CLASS");
		String dashboard_css = HTMLTool.getResourceCSSContent(getGrant(), "SAI_DASHBOARD_STYLE");
		
		contentDiv += HTMLTool.jsBlock(js);
		
		// String moduleVar = "var moduleName = '"+ mld +"';"; // handle "already been created" ?
		
		// contentDiv += dashboardDiv;
		// contentDiv += HTMLTool.jsBlock(moduleVar + dashboard_js);
		contentDiv += HTMLTool.cssBlock(dashboard_css);
		
		return contentDiv;

		
	}
	private String getContactId(String mld,Grant g){
		try{
			ObjectDB cnt =  g.getTmpObject("SaiContact");
			synchronized(cnt.getLock()){
				JSONObject filters = new JSONObject().put("saiCntModuleId",ModuleDB.getModuleId(mld));
				BusinessObjectTool tool = cnt.getTool();
				if(tool.getForCreateOrUpdate(filters)){
					return cnt.getRowId();
				}else{
					cnt.setValuesFromJSONObject(filters,false,false,false);
					AppLog.info(filters.toString());
					tool.validateAndSave();
					return cnt.getRowId();
				}
				
			}
		}catch(ValidateException | GetException |SaveException e){
			AppLog.error(e,g);
			return null;
		}
	}
	
}