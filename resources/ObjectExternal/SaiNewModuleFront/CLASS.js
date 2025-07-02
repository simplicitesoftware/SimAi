const testWithoutAiCall = false;
Simplicite.UI.ExternalObjects.SaiNewModuleFront = class extends Simplicite.UI.ExternalObject {

	async render(params, data = {}) {
		$('#menu').hide();
		$ui.loadAceEditor(() => {console.log('ace editor loaded');});
		const app = this;
		await $ui.loadScript({url: $ui.getApp().dispositionResourceURL("AiJsTools", "JS"),onload: function(){console.log('AiJsTools loaded');}});
		$ui.loadScript({url: $ui.getApp().dispositionResourceURL("SaiTools", "JS"),onload: function(){ 
			window.addEventListener('beforeunload', function() {
				SaiTools.logoutApi();
			});
			if(!data.api_token){
				SaiTools.loginApi().then(()=>{
					app.getPage(app);
				});
			}else{
				SaiTools.setToken(data.api_token);
				data={};
				app.getPage(app);
			}
			
			
		}});
		
		
		
	}
	getPage(app){
		$grant.getParameter((parameter)=>{
			if(!parameter || parameter == 'false' || parameter?.value == "" || app.isJsonAndEmpty(parameter)){
				app.setChatInteraction();
			}
			else{
				app.genData();
			}
		},'AI_AWAIT_CLEAR_CACHE');
	}
	isJsonAndEmpty(parameter){
		try{
			let json = JSON.parse(parameter);
			return json.AI_AWAIT_CLEAR_CACHE == '';
		}catch(e){
			console.log('Erreur lors du parsing JSON:', e);
			return false;
		}
	}
	// async setModuleNameForm(ctn = $('#sainewmodulefront')){
	// 	let labelCtn = $('<label for="moduleName">Nom du module</label>');
	// 	let inputCtn = $('<input type="text" id="moduleName" placeholder="Entrez le nom du module" />');
	// 	inputCtn.on('change', async () => {
	// 		let moduleName = $('#moduleName').val();
	// 		let isAvailable = await SaiTools.isModuleNameAvailable(moduleName);
	// 		if(!isAvailable){
	// 			labelCtn.style.color = 'red';
	// 			inputCtn.addClass('error');
	// 			inputCtn.append('<span class="error-message">Le nom de module n\'est pas disponible</span>');
	// 		}else{
	// 			if(inputCtn.hasClass('error')){
	// 				inputCtn.removeClass('error');
	// 				labelCtn.style.color = 'black';
	// 				inputCtn.find('.error-message').remove();
	// 			}
	// 		}
	// 	});
	// 	$(ctn).append(labelCtn);
	// 	$(ctn).append(inputCtn);

	// 	const createButton = $('<button id="createModule">Créer le module</button>');
	// 	createButton.on('click', () => this.createModule(this,ctn));
	// 	$(ctn).append(createButton);
		
	// }
	async setChatInteraction(){
		let ctn = $('#sainewmodulefront');
		ctn.html('');
		ctn.append('<div id="chatContainer"></div>');
		let inputCtn = $('<div class="ai-chat-input-area"></div>');
		inputCtn.append('<input type="file" id="input-img" accept="image/*" hidden />');
		inputCtn.append('<input type="text" id="message" class="user-message" placeholder="Message" />');
		let sendButton = $('<button id="sendMessage">Envoyer</button>');
		sendButton.on('click', this.sendMessage);
		inputCtn.append(sendButton);
		ctn.append(inputCtn);
		let genButton = $('<button id="generateModule">Générer le module</button>');
		genButton.on('click', () => this.generateModule(this));
		ctn.append(genButton);
		const chatContainer = $('#chatContainer');
		chatContainer.append(AiJsTools.getDisplayBotMessage('Bonjour, comment puis-je vous aider ?'));
		
	}
	async  setJsonValidation(onValidate,listResult){
	
		let ctn = $('#sainewmodulefront');
		
		ctn.html('');
		ctn.append('<div id="explainJson">'+listResult[0]+'</div>');
		ctn.append('<div class="aceeditor" id="jsonEditor">'+listResult[1]+'</div>');
		const editor = window.ace.edit("jsonEditor");
		editor.setTheme("ace/theme/monokai"); // Choisissez le thème que vous préférez
		editor.session.setMode("ace/mode/json"); // Définit le mode JSON
		editor.setValue(listResult[1], -1); // Définit le contenu de l'éditeur 
		editor.container.style.width = '100%'; // Définit la largeur de l'éditeur
		editor.container.style.height = '60vh'; // Définit la hauteur de l'éditeur
		ctn.append('<div id="ExplaneEndJson">'+listResult[2]+'</div>');
		let buttonValidate = $('<button id="validateJson">Valider</button>');
		buttonValidate.on('click', onValidate);
		ctn.append(buttonValidate);
		
	
	}
	async sendMessage(){
		let ctn = $('#sainewmodulefront');
		if(testWithoutAiCall){
			ctn.find('#chatContainer').append(AiJsTools.getDisplayUserMessage(ctn));
			ctn.find('#chatContainer').append(AiJsTools.getDisplayBotMessage('Ai call inib for test purpose'));
			ctn.find('#message').val('');
			return ;
		}
		const message = $('#message').val();
		let params = AiJsTools.getPostParams(ctn,AiJsTools.chatUmlSpecialisation);
		ctn.find('#chatContainer').append(AiJsTools.getDisplayUserMessage(ctn));
		ctn.find('#chatContainer').append(AiJsTools.getDisplayBotMessage());
		ctn.find('#message').val('');
		let res = await SaiTools.callApi(params,'chat');
		let response = $view.markdownToHTML(res?.choices[0]?.message?.content).html();
		$(".bot-messages:last-child span").html(response);
		
	}

	async createModule(app,moduleName){
		
		if(moduleName){
			let moduleInfo = await SaiTools.callApi({ login: $grant.getLogin(), moduleName: moduleName},'create');
			if(!moduleInfo || moduleInfo?.error){
				//$ui.alert({title: 'Error', content: moduleInfo?.error || 'Erreur lors de la création du module', type: 'error'});
				return moduleInfo?.error || 'Erreur lors de la création du module';
			}
			return "";
		}
		else{
			//alert('Veuillez entrer un nom de module');
			return 'Veuillez entrer un nom de module';
		}
	}
	async generateModule(app){
		
		let params={};
		if(testWithoutAiCall){
			 params = {
				"historic": [
					"{\"role\":\"user\",\"content\":[{\"type\":\"text\",\"text\":\"app de commande\"}]}",
					"{\"role\":\"assistant\",\"content\":\"Designing a UML (Unified Modeling Language) class diagram for an \\\"app de commande\\\" (order application) involves creating a visual representation of the classes, their attributes, methods, and relationships in an object-oriented application.\\nHere's a sample UML class diagram for an order application without function (method) descriptions, focusing on the relationships between classes.\\nClass: User\\n\\nattributes:\\nid (integer)\\nusername (string)\\nemail (string)\\npassword (string)\\naddress (string)\\n\\n\\n\\nClass: Product\\n\\nattributes:\\nid (integer)\\nname (string)\\ndescription (string)\\nprice (float)\\nstock_count (integer)\\n\\n\\n\\nClass: Order\\n\\nattributes:\\nid (integer)\\nuser_id (integer)\\norder_date (date)\\ntotal_amount (float)\\nstatus (string)\\n\\n\\n\\nRelationships:\\n\\nUser -> Order (1:N, Composition, A User has many Orders)\\nOrder -> Product (N:M, Association, An Order contains many Products and a Product can be in many Orders)\\n\\n\\nattributes:\\nquantity (integer)\\ndiscount (float)\\n\\n\\n\\nNotes:\\n\\nThe \\\"User\\\" class represents the application's users, having attributes like id, username, email, and address.\\nThe \\\"Product\\\" class represents the products available in the application, with attributes like id, name, description, price, and stock_count.\\nThe \\\"Order\\\" class represents the orders placed by users, involving user_id, order_date, total_amount, and status.\\nThe relationships between classes depict that a user has many orders (1:N), and each order contains many products (N:M).\\nIn the N:M association between Order and Product, an attribute called \\\"quantity\\\" signifies the number of a specific product in an order, and \\\"discount\\\", if any, offered on the product for the specific order.\\n\\nThis UML design does not include function descriptions, focusing solely on the classes, their attributes, and relationships.\"}"
				]
			};
		}else {
			let ctn = $('#sainewmodulefront');
			let historic = await SaiTools.getHistoric(ctn);
			params = { historic: historic};
		}
		$view.showLoading();
		let res = await SaiTools.callApi(params,'genJson');
		$view.hideLoading();
		app.setJsonValidation(()=> app.prepareJson(app),res);
		
	}
	async prepareJson(app){
		const editor = window.ace.edit("jsonEditor");
		
		const jsonValue = editor.getValue();
		try {
			JSON.parse(jsonValue); // Tente de parser le JSON
			//ctn.html('');
			let res = await SaiTools.callApi({json: jsonValue},'prepareJson');
			let module = $('<input type="text" id="moduleName" />');
			let label = $('<label for="moduleName">Nom du module</label>');
			let formCtn = $('<div />');
			formCtn.append(label);
			formCtn.append(module);
			formCtn.append('<img id="available-icon"/>');
			module.on('change', async () => {
				let moduleName = $('#moduleName').val();
				let isAvailable = await SaiTools.isModuleNameAvailable(moduleName);
				if(!isAvailable){
					label.css('color', 'red');
					module.addClass('error');
					formCtn.find('#available-icon').attr('src',$app.getIconURL("icon/color/cancel"));
				}else {
					formCtn.find('#available-icon').attr('src',$app.getIconURL("icon/color/check"));
					if(module.hasClass('error')){
						module.removeClass('error');
						label.css('color', '');
						
					}
				}
			});
			
			

			$ui.confirm({
				title: 'Generate module',
				content: formCtn,
				onOk: async () => {
					let moduleName = $('#moduleName').val();
					if(moduleName){
						let error = await app.createModule(app,moduleName);
						if(error){
							$ui.alert({title: 'Error', content: error, type: 'error'});
						}else{
							app.createObjs(app,res.objects);
						}
					}
				},
				moveable: true
				
			});
			
		} catch (e) {
			console.log("error",e);
			alert('Le JSON n\'est pas valide'); // Alerte si le JSON est invalide
			return; // Sortir de la fonction si le JSON n'est pas valide
		}
	}
	async createObjs(app,objects){
		let ctn = $('#sainewmodulefront');
		ctn.html('');
		let mermaidText = 'classDiagram\n direction RL\n';
		
		mermaid.initialize({
			theme: 'dark'
		});
		ctn.append($('<img/>').attr('src', '').attr('style', 'max-height: 80vh;'));
		for(let obj of objects){
			let mermaidObj = await SaiTools.callApi({ objName: obj},'genObj');
			mermaidText += 'class '+mermaidObj.name+' {\n';
			for(let field of mermaidObj?.fields || []){
				mermaidText += '    '+field+'\n';
			}

			mermaidText += '}\n';
			
			mermaid.render("mermaidImg",mermaidText).then(res => {
				const svg = `data:image/svg+xml;base64,${$app.base64Encode(res.svg)}`;
				$('#sainewmodulefront').find('img').attr('src', svg);
			});

		}
		let links = await SaiTools.callApi({},'genlinks');

		for(let link of links.links){
			mermaidText += '    '+link+'\n';
		}
		mermaid.render("mermaidImg",mermaidText).then(res => {
			const svg = `data:image/svg+xml;base64,${$app.base64Encode(res.svg)}`;
			$('#sainewmodulefront').find('img').attr('src', svg);
		});

		let nextButton = $('<button id="nextButton">Suivant</button>');
		nextButton.on('click', () => {
			app.clearCache(mermaidText);
		});
		ctn.append(nextButton);

	}
	async clearCache(mermaidText){
		let ctn = $('#sainewmodulefront');
		ctn.html('');
		let res = await SaiTools.callApi({ mermaidText: mermaidText},'initClearCache');
		ctn.text('The generation is done, your module is create we will now generate data,we need to disconect you to continue the process, please reconnect');
		ctn.append('<button id="reconnectButton">I understand</button>');
		$('#reconnectButton').on('click', () => {
			SaiTools.logoutApi().then(() => {
				$ui.clearCache("dc");
			});
		});
		
	}
	async genData(){
		let ctn = $('#sainewmodulefront');
		ctn.html('');
		ctn.append('<div id="genData">Generating data...</div>');
		$view.showLoading();
		await SaiTools.callApi({},'postClearCache');

		let res;
		if(testWithoutAiCall){
			let info = await SaiTools.getModuleInfo();
			let prefix = info.mPrefix?.toLowerCase();
			let upperPrefix = String(prefix).charAt(0).toUpperCase() + String(prefix).slice(1);
			res ={
				[upperPrefix+'Product']: [
				{
				[prefix+'ProPrice']: 19.99,
				[prefix+'ProId']: 1,
				[prefix+'ProName']: "Product 1",
				[prefix+'ProStock_count']: 100,
				"id": "",
				[prefix+'ProDescription']: "This is product 1"
				},
				{
				[prefix+'ProPrice']: 29.99,
				[prefix+'ProId']: 2,
				[prefix+'ProName']: "Product 2",
				[prefix+'ProStock_count']: 200,
				"id": "",
				[prefix+'ProDescription']: "This is product 2"
				},
				{
				[prefix+'ProPrice']: 39.99,
				[prefix+'ProId']: 3,
				[prefix+'ProName']: "Product 3",
				[prefix+'ProStock_count']: 300,
				"id": "",
				[prefix+'ProDescription']: "This is product 3"
				},
				{
				[prefix+'ProPrice']: 49.99,
				[prefix+'ProId']: 4,
				[prefix+'ProName']: "Product 4",
				[prefix+'ProStock_count']: 400,
				"id": "",
				[prefix+'ProDescription']: "This is product 4"
				},
				{
				[prefix+'ProPrice']: 59.99,
				[prefix+'ProId']: 5,
				[prefix+'ProName']: "Product 5",
				[prefix+'ProStock_count']: 500,
				"id": "",
				[prefix+'ProDescription']: "This is product 5"
				}
				],
				[upperPrefix+'User']: [
				{
				[prefix+'UsrPassword']: "password1",
				[prefix+'UsrAddress']: "Address 1",
				[prefix+'UsrId']: 1,
				[prefix+'UsrUsername']: "user1",
				"id": "",
				[prefix+'UsrEmail']: "user1@example.com"
				},
				{
				[prefix+'UsrPassword']: "password2",
				[prefix+'UsrAddress']: "Address 2",
				[prefix+'UsrId']: 2,
				[prefix+'UsrUsername']: "user2",
				"id": "",
				[prefix+'UsrEmail']: "user2@example.com"
				},
				{
				[prefix+'UsrPassword']: "password3",
				[prefix+'UsrAddress']: "Address 3",
				[prefix+'UsrId']: 3,
				[prefix+'UsrUsername']: "user3",
				"id": "",
				[prefix+'UsrEmail']: "user3@example.com"
				},
				{
				[prefix+'UsrPassword']: "password4",
				[prefix+'UsrAddress']: "Address 4",
				[prefix+'UsrId']: 4,
				[prefix+'UsrUsername']: "user4",
				"id": "",
				[prefix+'UsrEmail']: "user4@example.com"
				},
				{
				[prefix+'UsrPassword']: "password5",
				[prefix+'UsrAddress']: "Address 5",
				[prefix+'UsrId']: 5,
				[prefix+'UsrUsername']: "user5",
				"id": "",
				[prefix+'UsrEmail']: "user5@example.com"
				}
				],
				[upperPrefix+'Order']: [
				{
				[prefix+'OrdTotal_amount']: 99.99,
				[prefix+'OrdStatus']: "P",
				[prefix+'OrdEr_date']: "2022-01-01 12:00:00",
				"link": {
				[upperPrefix+'User']: "1"
				},
				"id": "",
				[prefix+'OrdId']: 1,
				[prefix+'OrdUser_id']: 1
				},
				{
				[prefix+'OrdTotal_amount']: 199.99,
				[prefix+'OrdStatus']: "S",
				[prefix+'OrdEr_date']: "2022-02-01 12:00:00",
				"link": {
				[upperPrefix+'User']: "2"
				},
				"id": "",
				[prefix+'OrdId']: 2,
				[prefix+'OrdUser_id']: 2
				},
				{
				[prefix+'OrdTotal_amount']: 299.99,
				[prefix+'OrdStatus']: "C",
				[prefix+'OrdEr_date']: "2022-03-01 12:00:00",
				"link": {
				[upperPrefix+'User']: "3"
				},
				"id": "",
				[prefix+'OrdId']: 3,
				[prefix+'OrdUser_id']: 3
				},
				{
				[prefix+'OrdTotal_amount']: 399.99,
				[prefix+'OrdStatus']: "P",
				[prefix+'OrdEr_date']: "2022-04-01 12:00:00",
				"link": {
				[upperPrefix+'User']: "4"
				},
				"id": "",
				[prefix+'OrdId']: 4,
				[prefix+'OrdUser_id']: 4
				},
				{
				[prefix+'OrdTotal_amount']: 499.99,
				[prefix+'OrdStatus']: "S",
				[prefix+'OrdEr_date']: "2022-05-01 12:00:00",
				"link": {
				[upperPrefix+'User']: "5"
				},
				"id": "",
				[prefix+'OrdId']: 5,
				[prefix+'OrdUser_id']: 5
				}
				],
				[upperPrefix+'OrdPro']: [
				{
				"link": {
				[upperPrefix+'Product']: "1",
				[upperPrefix+'Order']: "1"
				},
				"id": ""
				},
				{
				"link": {
				[upperPrefix+'Product']: "2",
				[upperPrefix+'Order']: "2"
				},
				"id": ""
				},
				{
				"link": {
				[upperPrefix+'Product']: "3",
				[upperPrefix+'Order']: "3"
				},
				"id": ""
				},
				{
				"link": {
				[upperPrefix+'Product']: "4",
				[upperPrefix+'Order']: "4"
				},
				"id": ""
				},
				{
				"link": {
				[upperPrefix+'Product']: "5",
				[upperPrefix+'Order']: "5"
				},
				"id": ""
				}
				]
			};
		}else{
			 res = await SaiTools.callApi({},'genJsonData');
		}
		$view.hideLoading();
		let listResult = ["datas:",JSON.stringify(res,null,1),""];
		this.setJsonValidation(()=> this.createData(this),listResult);
		
	}
	async createData(app){
		let ctn = $('#sainewmodulefront');
		const editor = window.ace.edit("jsonEditor");
		
		const jsonValue = editor.getValue();
		let res = await SaiTools.callApi({datas:jsonValue},'genDatas');
		ctn.html('');
		ctn.append('<div id="genData">Data generated</div>');
		ctn.append('<button id="nextButton">Next</button>');
		$('#nextButton').on('click', () => {
			this.redirectToModule();
		});
	}
	async redirectToModule(){
		let ctn = $('#sainewmodulefront');
		ctn.html('');
		let res = await SaiTools.getRedirectScope();
		SaiTools.logoutApi().then(() => {
			let redirect = res.redirect;
			window.location.href = "/ui?"+redirect;
		});
	}
};