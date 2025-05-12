Simplicite.UI.ExternalObjects.SaiNewModuleFront = class extends Simplicite.UI.ExternalObject {
	async render(params, data = {}) {
		console.log('render');
		await $ui.loadScript({url: $ui.getApp().dispositionResourceURL("SaiTools", "JS"),onload: function(){ SaiTools.loginApi();}});
		window.addEventListener('beforeunload', function() {
			SaiTools.logoutApi();
		});
		setModuleNameForm($('#sainewmodulefront'));
		
	}
	async setModuleNameForm(ctn){
		$(ctn).append('<input type="text" id="moduleName" placeholder="Entrez le nom du module" />');
		$(ctn).append('<button id="createModule" onclick="SaiNewModuleFront.createModule()">Créer le module</button>');
	}
	async createModule(){
		const moduleName = $('#moduleName').val();
		const moduleInfo = await SaiTools.callApi({action: 'create', moduleName: moduleName});
		console.log(moduleInfo);
	}
		
};
