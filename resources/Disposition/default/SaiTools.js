var SaiTools = SaiTools || (function(param) {
	const apiUrl = '/api/';
	const endpointUrl = 'ext/SaiCreateModuleApi';
	const user = $grant.login;
	const password = '8yhzGBNYn@@U';
	let token = '';
	
	async function setToken(t){
		token=t;
	}
	
	async function loginApi(){
		const response = await fetch(apiUrl + "login", {
			method: 'GET',
			headers: {
				'accept': 'application/json',
				'Authorization': $app._callAuth(user,password)
			}
		});
		const data = await response.json();
		console.log('loginApi response ',data);
		this.token = data.authtoken;
		console.log('token',this.token);
	}
	
	async function callApi(data = {}){
		console.log('token',this.token);
		const response = await fetch(apiUrl + endpointUrl, {
			method: 'POST',
			headers: {
				'accept': 'application/json',
				'Authorization': `Bearer ${this.token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});
		const res = await response;
		if(res.status == 200)
			return res.json();
		return;
	}
	async function getModuleInfo(data = {}){
		const response = await fetch(apiUrl + endpointUrl + '?action=moduleInfo', {
			method: 'GET',
			headers: {
				'accept': 'application/json',
				'Authorization': `Bearer ${this.token}`
			}
		});
		const res = await response.json();
		return res;
	}
	async function getRedirectScope(data = {}){
		const response = await fetch(apiUrl + endpointUrl + '?action=getRedirectScope', {
			method: 'GET',
			headers: {
				'accept': 'application/json',
				'Authorization': `Bearer ${this.token}`
			}
		});
		const res = await response.json();
		return res;
	}
	async function isPostClearCache(){
		const response = await fetch(apiUrl + endpointUrl + '?action=isPostClearCache', {
			method: 'GET',
			headers: {
				'accept': 'application/json',
				'Authorization': `Bearer ${this.token}`
			}
		});
		const res = await response.json();
		return res.isPostClearCache;
	}
	async function getHistoric(ctn){
		let historic = [];
		$(ctn).find(".user-messages").each(function() {
			let text ={};
			text.role = "user";
			let contents =[];
			let content = {"type":"text","text":$(this).find(".msg").text()};
			contents.push(content);
			let img = $(this).find(".ai-chat-img");
			if(img.length >0){
				content = {"type":"image_url","image_url":{"url":img.attr("src")}};
				contents.push(content);
			}
			text.content = contents;
			historic.push(JSON.stringify(text));
			text={};
			text.role = "assistant";
			text.content = $(this).next(".bot-messages").find(".msg").text();
			historic.push(JSON.stringify(text));
			
		});
		return historic;
	}
	async function logoutApi() {
		const response = await fetch(apiUrl + "logout", {
			method: 'GET',
			headers: {
				'accept': 'application/json',
				'Authorization': `Bearer ${this.token}`
			}
		});
		const data = await response.json();
		return data.status == '200';
	}
	return {
		loginApi,
		callApi,
		getModuleInfo,
		getRedirectScope,
		logoutApi,
		getHistoric,
		isPostClearCache,
		setToken
	};
})();