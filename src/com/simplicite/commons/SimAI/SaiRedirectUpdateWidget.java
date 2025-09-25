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
		String undoId = SaiTool.addUndo(mld,Grant.getSystemAdmin());
		
		String js = """
		function setConfirm(extId = ""){
			$ui.confirm({
			name:	"confirm",
			title:	$T('SAI_CONFIRM_UPDATE_TITLE'),
			content:	$T('SAI_CONFIRM_UPDATE'),
			okLabel:	$T('SAI_CONFIRM_UPDATE_YES'),
			cancelLabel:	$T('SAI_CONFIRM_UPDATE_NO'),
			onOk:	function(){
				redirectUpdate();
			},
			onCancel:	function(){
				cancelUpdate(extId);
			}
		});
		}
		function redirectUpdate(){
			window.location.href = '/ui?scope=SimAIUpdateScope';
		}
		function cancelUpdate(extId = ""){
			let externalObject = 'SaiModulesApi';
			let app = simplicite.session({
				 endpoint: 'ui',
				 authtoken: $grant.authtoken, // set in Java
				 timeout: 180 //second
			});
			app.getExternalObject(externalObject).invoke(null,null,{'method':'GET','path':'cancelUpdateModule/' + extId,'accept':'application/json'}).then((r) => {
				console.log("cancelUpdate: "+extId,r);
			});
			window.location.href = '/ui';
		}
		""";
		
		return  HTMLTool.jsBlock(js+"\nsetConfirm(\""+undoId+"\");");

		
	}
	
	
}