class  SaiTools {
	constructor(data) {
		console.log(data);
		this.externalObject = 'SaiCreateModuleApi';
		this.app = null;
		this.user = $grant.login;
		this.app = simplicite.session({
		 	endpoint: 'ui',
		 	authtoken: data._authtoken, // set in Java
		 	ajaxkey: data._ajaxkey, // set in Java
		 	timeout: 180 //second
		});
		this.app.info(`Lib version: ${simplicite.constants.MODULE_VERSION}`);
		this.chatUmlSpecialisation = "You help design uml for object-oriented applications. Without function and whith relation description. Respond with a text for no technical users" ;
		
	}

	

	
	async callApi(data = {},action = ""){
			console.log(data);
			const response =this.app.getExternalObject(this.externalObject).invoke(null,JSON.stringify(data),{'method':'POST','path':action,'accept':'application/json','contentType':'application/json'});
			const res = await response;
			return res;
		}
	async deleteModule(module = ""){
		const response =this.app.getExternalObject(this.externalObject).invoke(null,null,{'method':'DELETE','path':'deleteModule/' + module,'accept':'application/json'});
		const res = await response;
		return res.status == '200';
	}
	async getModuleInfo(){
		const response =this.app.getExternalObject(this.externalObject).invoke(null,null,{'method':'GET','path':'moduleInfo','accept':'application/json'});
		const res = await response;
		return res;
	}
	async getRedirectScope(module = ""){
		const response =this.app.getExternalObject(this.externalObject).invoke(null,null,{'method':'GET','path':'getRedirectScope' + (module ? '/' + module : ''),'accept':'application/json'});
		const res = await response;
		return res;
	}
	async  isPostClearCache(){
		const response =this.app.getExternalObject(this.externalObject).invoke(null,null,{'method':'GET','path':'isPostClearCache','accept':'application/json'});
		const res = await response;
		return res.isPostClearCache;
	}
	async  isModuleNameAvailable(moduleName){
		const response =this.app.getExternalObject(this.externalObject).invoke(null,null,{'method':'GET','path':'isModuleNameAvailable/' + moduleName,'accept':'application/json'});
		const res = await response;
		return res.available;
	}
	async  getHistoric(ctn){
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
	// async logoutApi() {
	// 	const response = await fetch(apiUrl + "logout", {
	// 		method: 'GET',
	// 		headers: {
	// 			'accept': 'application/json',
	// 			'Authorization': `Bearer ${this.token}`
	// 		}
	// 	});
	// 	const data = await response.json();
	// 	return data.status == '200';
	// }
	// return {
	// 	loginApi,
	// 	callApi,
	// 	getModuleInfo,
	// 	getRedirectScope,
	// 	logoutApi,
	// 	getHistoric,
	// 	isPostClearCache,
	// 	setToken,
	// 	isModuleNameAvailable
	// };
}