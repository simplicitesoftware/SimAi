package com.simplicite.tests.SimAI;

import java.util.*;

import com.simplicite.util.*;

import com.simplicite.util.tools.*;

import org.junit.Test;
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
			String usrFname = System.getenv("firstName");
			String usrLname = System.getenv("lastName");
			String usrEmail = System.getenv("email");
			String lang = System.getenv("lang");
			Grant g = Grant.getSystemAdmin();
			boolean[] old = g.changeAccess("User",true,true,true,false);
			ObjectDB o = g.getTmpObject("User");
			BusinessObjectTool t = o.getTool();
			t.getForCreate();
			o.setFieldValue("usr_login",usrName);
			o.setFieldValue("usr_first_name",usrFname);
			o.setFieldValue("usr_last_name",usrLname);
			o.setFieldValue("usr_email",usrEmail);
			o.setFieldValue("usr_active",GrantCore.USER_ACTIVE);
			o.setFieldValue("usr_lang_pref",lang);
			o.setFieldValue("usr_lang",lang);
			t.validateAndCreate();
			Grant.addResponsibility(Grant.getUserId(usrName),"SAI_CREATE_MODULE");
			Grant.addResponsibility(Grant.getUserId(usrName),"SAI_VIEW_MODULE");
			// create api user
			t.getForCreate();
			o.setFieldValue("usr_login","ApiSupervisor");
			o.setFieldValue("usr_active",GrantCore.USER_WEBSERVICES);
			t.validateAndCreate();
			Grant.addResponsibility(Grant.getUserId("ApiSupervisor"),"SAI_ADMIN");
			
			g.changePassword(usrName,usrPassword,false,false);
			g.changePassword("designer","S1mplicite_",false,true);
			g.changePassword("ApiSupervisor",System.getenv("passwordApiSupervisor"),false,false);
			g.changeAccess("User",old);
			
		} catch (Exception e) {
			fail(e.getMessage());
		}
	}
}
