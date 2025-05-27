package com.simplicite.extobjects.SimAI;

import java.util.*;

import com.simplicite.util.*;
import com.simplicite.util.exceptions.*;
import com.simplicite.util.tools.*;
import org.json.JSONObject;

/**
 * UI component external object SaiNewModuleFront
 */
public class SaiNewModuleFront extends com.simplicite.webapp.web.ResponsiveExternalObject {
	private static final long serialVersionUID = 1L;

	// Note: in most cases no server-side Java code is needed
	// Just implement the 3 client-side resources: HTML, SCRIPT (Javascript with the render function), STYLES

	@Override
	public void init(Parameters params) {
		addMermaid();
	}


}