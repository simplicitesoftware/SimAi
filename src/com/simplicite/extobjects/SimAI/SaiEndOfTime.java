package com.simplicite.extobjects.SimAI;

import java.util.*;

import com.simplicite.util.AppLog;
import com.simplicite.util.ExternalObject;
import com.simplicite.util.tools.HTMLTool;
import com.simplicite.util.tools.Parameters;
import com.simplicite.webapp.web.BootstrapWebPage;
/**
 * Standalone basic web page external object SaiEndOfTime
 */
public class SaiEndOfTime extends com.simplicite.webapp.web.WebPageExternalObject {
	private static final long serialVersionUID = 1L;

	
	/**
	 * Body part of the page
	 * @param params Request parameters
	 */
	@Override
	public String displayBody(Parameters params) {
		try {
			setDecoration(false);
			String render = getName() + ".render()";
			BootstrapWebPage wp = new BootstrapWebPage(params.getRoot(), getDisplay());
			//wp.setFavicon(HTMLTool.getResourceIconURL(this, "FAVICON"));
			wp.appendAjax(true);
			//wp.appendJSInclude(HTMLTool.getResourceJSURL(this, "CLASS"));
			wp.appendJSInclude(HTMLTool.simpliciteClientJS());
			wp.appendCSSInclude(HTMLTool.getResourceCSSURL(this, "STYLES"));
			wp.append(HTMLTool.getResourceHTMLContent(this, "HTML"));
			//wp.setReady(render);
			return wp.toString();
		}
		catch (Exception e) {
			AppLog.error(null, e, getGrant());
			return e.getMessage();
		}
	}
}
