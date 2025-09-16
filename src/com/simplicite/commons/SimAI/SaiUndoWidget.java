package com.simplicite.commons.SimAI;

import java.util.*;

import com.simplicite.util.*;
import com.simplicite.bpm.*;
import com.simplicite.util.exceptions.*;
import com.simplicite.util.tools.*;
import org.json.JSONObject;

/**
 * Shared code SaiUndoWidget
 */
public class SaiUndoWidget extends com.simplicite.webapp.web.widgets.WidgetExternalObject{
	private static final long serialVersionUID = 1L;
	@Override
	public String content(Parameters params)
	{
		Grant g =Grant.getSystemAdmin();
		addSimpliciteClient();
		JSONObject settings = getSettings();
		String mld = settings.optString("module");
		
		if(Tool.isEmpty(mld))return "error";
		getGrant().setUserSystemParam​("update_module",mld,true);
		JSONObject data = getAuthDatas(params);
		String sessionJS = """
			
		function undoRegnerate(moduleName = "", extId = "",data = {}){
			let externalObject = 'SaiModulesApi';
			let app = simplicite.session({
				 endpoint: 'ui',
				 authtoken: data._authtoken, // set in Java
				 ajaxkey: data._ajaxkey, // set in Java
				 timeout: 180 //second
			});
			console.log("undoRegnerate", moduleName, extId);
			if(!moduleName || !extId) alert($T("SAI_ERR_MODULE_NAME_OR_EXT_ID"));
			$view.showLoading();
			replaceLoader($T("SAI_LOADER_UNDO_REGNERATE"));
			app.getExternalObject(externalObject).invoke(null,null,{'method':'GET','path':'undoRegnerate/' + moduleName + '/' + extId,'accept':'application/json'}).then(() => {
				$view.hideLoading();
				$app.logout(console.log, console.error);
				location.reload();
			});
		};
		function replaceLoader(msg = "") {
			let loaderBody = $(".waitdlg .waitbody");
			
			loaderBody.html("");
			
			let customLoader = $("<div/>").addClass("custom-loader");
			customLoader
				.append(
					$("<div/>").addClass("custom-loader-line")
				)
				.append(
					$("<div/>").addClass("custom-loader-line")
				)
				.append(
					$("<div/>").addClass("custom-loader-line")
				)
				.append(
					$("<div/>").addClass("custom-loader-line")
				)
				.append(
					$("<div/>").addClass("custom-loader-line")
				)
				.append(
					$("<div/>").addClass("custom-loader-line")
				)
				.append(
					$("<div/>").addClass("custom-loader-line")
				)
				.append(
					$("<div/>").addClass("custom-loader-line")
				);
			
			let message = $("<div/>").addClass("custom-loader-text").text(msg);
			
			loaderBody.append(customLoader);
			loaderBody.append(message);
		}
		""";
		String dashboard_css = HTMLTool.getResourceCSSContent(getGrant(), "SAI_STYLES");
		String js = sessionJS+"\nundoRegnerate(\""+mld+"\",\""+getId()+"\","+data.toString()+");";
		
		return  HTMLTool.jsBlock(js)+HTMLTool.cssBlock(dashboard_css);

		
	}
	
	private JSONObject getAuthDatas(Parameters params){
		JSONObject datas = super.data(params);
		if(Tool.isEmpty(datas)) datas = new JSONObject();
		datas.put("_authtoken", getGrant().getAuthToken());
		datas.put("_ajaxkey", getGrant().getAjaxKey());
		AppLog.info(datas.toString(1));
		AppLog.info("token "+ getGrant().getAuthToken());
		AppLog.info("ajaxkey "+getGrant().getAjaxKey());
		return datas;
	}
	
}