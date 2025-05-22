package com.simplicite.extobjects.SimAI;

import java.util.*;

import com.simplicite.util.*;
import com.simplicite.util.exceptions.*;
import com.simplicite.util.tools.*;

/**
 * JQuery standalone web page external object SaiRedirect
 */
public class SaiRedirect extends com.simplicite.webapp.web.JQueryWebPageExternalObject {
	private static final long serialVersionUID = 1L;

	/**
	 * Body part of the page
	 * @param params Request parameters
	 */
	@Override
	public String displayBody(Parameters params) {
		try {
			// Call the render Javascript method implemented in the SCRIPT resource
			return javascript(getName() + ".render();");
		}
		catch (Exception e) {
			AppLog.error(null, e, getGrant());
			return e.getMessage();
		}
	}
}
