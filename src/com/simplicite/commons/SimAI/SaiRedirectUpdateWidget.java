package com.simplicite.commons.SimAI;

import java.util.*;

import com.simplicite.util.*;
import com.simplicite.bpm.*;
import com.simplicite.util.exceptions.*;
import com.simplicite.util.tools.*;
import org.json.JSONObject;

/**
 * Shared code SaiRedirectUpdateWidget
 */
public class SaiRedirectUpdateWidget extends com.simplicite.webapp.web.widgets.WidgetExternalObject{
	private static final long serialVersionUID = 1L;
	@Override
	public String content(Parameters params)
	{
		Grant g =Grant.getSystemAdmin();
			
		JSONObject settings = getSettings();
		String mld = settings.optString("module");
		
		if(Tool.isEmpty(mld))return "error";
		getGrant().setUserSystemParam​("update_module",mld,true);
		SaiTool.saveModule(mld);
		
		AppLog.info("params set: "+getGrant().getParameter("update_module",""));
		SaiTool.addUndo(mld,Grant.getSystemAdmin());
		String js = "window.location.href = '/ui?scope=SimAIUpdateScope'";
 		
		
		return  HTMLTool.jsBlock(js);

		
	}
	
	
}