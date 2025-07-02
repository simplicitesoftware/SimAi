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
		this.token = data.authtoken;
	}
	
	async function callApi(data = {},action = ""){
		
		const response = await fetch(apiUrl + endpointUrl+ (action ? '/' + action : ''), {
			method: 'POST',
			headers: {
				'accept': 'application/json',
				'Authorization': `Bearer ${this.token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});
		const res = await response;

		return res.json();
	}
	async function getModuleInfo(){
		const response = await fetch(apiUrl + endpointUrl + '/moduleInfo', {
			method: 'GET',
			headers: {
				'accept': 'application/json',
				'Authorization': `Bearer ${this.token}`
			}
		});
		const res = await response.json();
		return res;
	}
	async function getRedirectScope(module = ""){
		const response = await fetch(apiUrl + endpointUrl + '/getRedirectScope' + (module ? '/' + module : ''), {
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
		const response = await fetch(apiUrl + endpointUrl + '/isPostClearCache', {
			method: 'GET',
			headers: {
				'accept': 'application/json',
				'Authorization': `Bearer ${this.token}`
			}
		});
		const res = await response.json();
		return res.isPostClearCache;
	}
	async function isModuleNameAvailable(moduleName){
		const response = await fetch(apiUrl + endpointUrl + '/isModuleNameAvailable/' + moduleName, {
			method: 'GET',
			headers: {
				'accept': 'application/json',
				'Authorization': `Bearer ${this.token}`
			}
		});
		const res = await response.json();
		return res.available;
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
		setToken,
		isModuleNameAvailable
	};
})();