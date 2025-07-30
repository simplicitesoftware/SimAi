package com.simplicite.objects.SimAI;

import java.util.*;

import com.simplicite.util.*;
import com.simplicite.util.exceptions.*;
import com.simplicite.util.tools.*;

/**
 * Business object SaiContact
 */
public class SaiContact extends ObjectDB {
	private static final long serialVersionUID = 1L;
	
	@Override
	public List<String> preValidate() {
		List<String> msgs = new ArrayList<>();
		if(!getField("saiContactName").isEmpty()){
			String mldName = getFieldValue("mdl_name");
			String msg;
			msg = ModuleDB.exportData(Grant.getSystemAdmin(),mldName, "xml", false,null);
			if(!Tool.isEmpty(msg) && Message.isError(msg))msgs.add(msg);
			msg = ModuleDB.exportModule(Grant.getSystemAdmin(),mldName, "xml", false,false,false,false,false,null);
			if(!Tool.isEmpty(msg) && Message.isError(msg))msgs.add(msg);
			
		}
		//msgs.add(Message.formatInfo("INFO_CODE", "Message", "fieldName"));
		//msgs.add(Message.formatWarning("WARNING_CODE", "Message", "fieldName"));
		//msgs.add(Message.formatError("ERROR_CODE", "Message", "fieldName"));
		
		
		
		return msgs;
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
}
