var SaiTools = SaiTools || (function(param) {
	const apiUrl = '/api/';
	const endpointUrl = 'ext/SaiCreateModuleApi';
	const user = 'AIUserAPI';
	const password = 'Ec0Kj8Yb';
	let token = '';
	
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
	async function callApi(data = {}){
		const response = await fetch(apiUrl + endpointUrl, {
			method: 'POST',
			headers: {
				'accept': 'application/json',
				'Authorization': `Bearer ${this.token}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});
		const res = await response.json();
		return res;
	}
	async function getModuleInfo(data = {}){
		const response = await fetch(this.apiUrl + this.endpointUrl + '?action=moduleInfo', {
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
		const response = await fetch(this.apiUrl + this.endpointUrl + '?action=getRedirectScope', {
			method: 'GET',
			headers: {
				'accept': 'application/json',
				'Authorization': `Bearer ${this.token}`
			}
		});
		const res = await response.json();
		return res;
	}
	async function logoutApi() {
		const response = await fetch(this.apiUrl + "logout", {
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
		logoutApi
	}
})();