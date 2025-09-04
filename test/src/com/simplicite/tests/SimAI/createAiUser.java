package com.simplicite.tests.SimAI;

import java.util.*;

import com.simplicite.util.*;
import com.simplicite.bpm.*;
import com.simplicite.util.exceptions.*;
import com.simplicite.util.tools.*;

import org.junit.Test;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertTrue;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.fail;

/**
 * Unit tests createAiUser
 */
public class createAiUser {
	@Test
	public void test() {
		try {
			String usrName = System.getenv("usrName");
			String usrPassword = System.getenv("password");
			Grant g = Grant.getSystemAdmin();
			boolean[] old = g.changeAccess("User",true,true,true,false);
			ObjectDB o = g.getTmpObject("User");
			BusinessObjectTool t = o.getTool();
			t.getForCreate();
			o.setFieldValue("usr_login",usrName);
			o.setFieldValue("usr_active",GrantCore.USER_ACTIVE);
			o.setFieldValue("usr_lang_pref","FRA");
			o.setFieldValue("usr_lang","FRA");
			t.validateAndCreate();
			Grant.addResponsibility(Grant.getUserId(usrName),"SAI_CREATE_MODULE");
			g.changePassword(usrName,usrPassword,false,false);
			g.changeAccess("User",old);
		} catch (Exception e) {
			fail(e.getMessage());
		}
	}
}
