const testWithoutAiCall = false;
Simplicite.UI.ExternalObjects.SaiNewModuleFront = class extends Simplicite.UI.ExternalObject {

	async render(params, data = {}) {
		$('#menu').hide();
		console.log('render');
		$ui.loadAceEditor(() => {console.log('ace editor loaded');});
		const app = this;
		await $ui.loadScript({url: $ui.getApp().dispositionResourceURL("AiJsTools", "JS"),onload: function(){console.log('AiJsTools loaded');}});
		$ui.loadScript({url: $ui.getApp().dispositionResourceURL("SaiTools", "JS"),onload: function(){ 
			console.log('SaiTools loaded');

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
			if(!parameter || parameter == 'empty' || app.isJsonAndEmpty(parameter)){
				app.setModuleNameForm();
			}
			else{
				app.genData();
			}
			console.log('parameter',parameter);
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
	async setModuleNameForm(){
		let ctn = $('#sainewmodulefront');
		console.log(this);
		$(ctn).append('<input type="text" id="moduleName" placeholder="Entrez le nom du module" />');
		const createButton = $('<button id="createModule">Créer le module</button>');
		createButton.on('click', () => this.createModule(this));
		$(ctn).append(createButton);
		
	}
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
		console.log('setJsonValidation',listResult);
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
			console.log('sendMessage inib test');
			ctn.find('#chatContainer').append(AiJsTools.getDisplayUserMessage(ctn));
			ctn.find('#chatContainer').append(AiJsTools.getDisplayBotMessage('Ai call inib for test purpose'));
			ctn.find('#message').val('');
			return ;
		}
		
		console.log('sendMessage');
		const message = $('#message').val();
		
		console.log(message);
		let params = AiJsTools.getPostParams(ctn,AiJsTools.chatUmlSpecialisation);
		console.log(params);
		params.action = 'chat';
		console.log('params',params);
		ctn.find('#chatContainer').append(AiJsTools.getDisplayUserMessage(ctn));
		ctn.find('#chatContainer').append(AiJsTools.getDisplayBotMessage());
		ctn.find('#message').val('');
		let res = await SaiTools.callApi(params);
		let response = $view.markdownToHTML(res?.choices[0]?.message?.content).html();
		$(".bot-messages:last-child span").html(response);
		console.log('responce ai ', res);
		
	}

	async createModule(app){
		
		const moduleName = $('#moduleName').val();
		if(moduleName){
			const moduleInfo = await SaiTools.callApi({action: 'create', login: $grant.getLogin(), moduleName: moduleName});
			console.log(moduleInfo);
			if(moduleInfo.error){
				$ui.alert({title: 'Error', content: moduleInfo.error, type: 'error'});
			}
			else{
				app.setChatInteraction();
			}
		}
		else{
			alert('Veuillez entrer un nom de module');
		}
	}
	async generateModule(app){
		
		let params={};
		if(testWithoutAiCall){
			 params = {
				"action": "genJson",
				"historic": [
					"{\"role\":\"user\",\"content\":[{\"type\":\"text\",\"text\":\"app de commande\"}]}",
					"{\"role\":\"assistant\",\"content\":\"Designing a UML (Unified Modeling Language) class diagram for an \\\"app de commande\\\" (order application) involves creating a visual representation of the classes, their attributes, methods, and relationships in an object-oriented application.\\nHere's a sample UML class diagram for an order application without function (method) descriptions, focusing on the relationships between classes.\\nClass: User\\n\\nattributes:\\nid (integer)\\nusername (string)\\nemail (string)\\npassword (string)\\naddress (string)\\n\\n\\n\\nClass: Product\\n\\nattributes:\\nid (integer)\\nname (string)\\ndescription (string)\\nprice (float)\\nstock_count (integer)\\n\\n\\n\\nClass: Order\\n\\nattributes:\\nid (integer)\\nuser_id (integer)\\norder_date (date)\\ntotal_amount (float)\\nstatus (string)\\n\\n\\n\\nRelationships:\\n\\nUser -> Order (1:N, Composition, A User has many Orders)\\nOrder -> Product (N:M, Association, An Order contains many Products and a Product can be in many Orders)\\n\\n\\nattributes:\\nquantity (integer)\\ndiscount (float)\\n\\n\\n\\nNotes:\\n\\nThe \\\"User\\\" class represents the application's users, having attributes like id, username, email, and address.\\nThe \\\"Product\\\" class represents the products available in the application, with attributes like id, name, description, price, and stock_count.\\nThe \\\"Order\\\" class represents the orders placed by users, involving user_id, order_date, total_amount, and status.\\nThe relationships between classes depict that a user has many orders (1:N), and each order contains many products (N:M).\\nIn the N:M association between Order and Product, an attribute called \\\"quantity\\\" signifies the number of a specific product in an order, and \\\"discount\\\", if any, offered on the product for the specific order.\\n\\nThis UML design does not include function descriptions, focusing solely on the classes, their attributes, and relationships.\"}"
				]
			};
		}else {
			let ctn = $('#sainewmodulefront');
			let historic = await SaiTools.getHistoric(ctn);
			params = {action: 'genJson', historic: historic};
		}
		$view.showLoading();
		let res = await SaiTools.callApi(params);
		$view.hideLoading();
		app.setJsonValidation(()=> app.prepareJson(app),res);
		
	}
	async prepareJson(app){
		let ctn = $('#sainewmodulefront');
		const editor = window.ace.edit("jsonEditor");
		
		const jsonValue = editor.getValue();
		try {
			JSON.parse(jsonValue); // Tente de parser le JSON
			//ctn.html('');
			let res = await SaiTools.callApi({action: 'prepareJson', json: jsonValue});
			console.log(res);
			app.createObjs(app,res.objects);
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
			let mermaidObj = await SaiTools.callApi({action: 'genObj', objName: obj});
			mermaidText += 'class '+mermaidObj.name+' {\n';
			for(let field of mermaidObj.fields){
				mermaidText += '    '+field+'\n';
			}

			mermaidText += '}\n';
			console.log(mermaidText);
			
			mermaid.render("mermaidImg",mermaidText).then(res => {
				const svg = `data:image/svg+xml;base64,${$app.base64Encode(res.svg)}`;
				$('#sainewmodulefront').find('img').attr('src', svg);
			});

		}
		let links = await SaiTools.callApi({action: 'genlinks'});
		console.log(links);
		for(let link of links.links){
			mermaidText += '    '+link+'\n';
		}
		console.log(mermaidText);
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
		let res = await SaiTools.callApi({action: 'initClearCache', mermaidText: mermaidText});
		console.log(res);
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
		await SaiTools.callApi({action: 'postClearCache'});

		let res;
		if(testWithoutAiCall){
			res ={
				"Tes1Product": [
				{
				"tes1ProPrice": 19.99,
				"tes1ProId": 1,
				"tes1ProName": "Product 1",
				"tes1ProStock_count": 100,
				"id": "",
				"tes1ProDescription": "This is product 1"
				},
				{
				"tes1ProPrice": 29.99,
				"tes1ProId": 2,
				"tes1ProName": "Product 2",
				"tes1ProStock_count": 200,
				"id": "",
				"tes1ProDescription": "This is product 2"
				},
				{
				"tes1ProPrice": 39.99,
				"tes1ProId": 3,
				"tes1ProName": "Product 3",
				"tes1ProStock_count": 300,
				"id": "",
				"tes1ProDescription": "This is product 3"
				},
				{
				"tes1ProPrice": 49.99,
				"tes1ProId": 4,
				"tes1ProName": "Product 4",
				"tes1ProStock_count": 400,
				"id": "",
				"tes1ProDescription": "This is product 4"
				},
				{
				"tes1ProPrice": 59.99,
				"tes1ProId": 5,
				"tes1ProName": "Product 5",
				"tes1ProStock_count": 500,
				"id": "",
				"tes1ProDescription": "This is product 5"
				}
				],
				"Tes1User": [
				{
				"tes1UsrPassword": "password1",
				"tes1UsrAddress": "Address 1",
				"tes1UsrId": 1,
				"tes1UsrUsername": "user1",
				"id": "",
				"tes1UsrEmail": "user1@example.com"
				},
				{
				"tes1UsrPassword": "password2",
				"tes1UsrAddress": "Address 2",
				"tes1UsrId": 2,
				"tes1UsrUsername": "user2",
				"id": "",
				"tes1UsrEmail": "user2@example.com"
				},
				{
				"tes1UsrPassword": "password3",
				"tes1UsrAddress": "Address 3",
				"tes1UsrId": 3,
				"tes1UsrUsername": "user3",
				"id": "",
				"tes1UsrEmail": "user3@example.com"
				},
				{
				"tes1UsrPassword": "password4",
				"tes1UsrAddress": "Address 4",
				"tes1UsrId": 4,
				"tes1UsrUsername": "user4",
				"id": "",
				"tes1UsrEmail": "user4@example.com"
				},
				{
				"tes1UsrPassword": "password5",
				"tes1UsrAddress": "Address 5",
				"tes1UsrId": 5,
				"tes1UsrUsername": "user5",
				"id": "",
				"tes1UsrEmail": "user5@example.com"
				}
				],
				"Tes1Order": [
				{
				"tes1OrdTotal_amount": 99.99,
				"tes1OrdStatus": "P",
				"tes1OrdEr_date": "2022-01-01 12:00:00",
				"link": {
				"Tes1User": "1"
				},
				"id": "",
				"tes1OrdId": 1,
				"tes1OrdUser_id": 1
				},
				{
				"tes1OrdTotal_amount": 199.99,
				"tes1OrdStatus": "S",
				"tes1OrdEr_date": "2022-02-01 12:00:00",
				"link": {
				"Tes1User": "2"
				},
				"id": "",
				"tes1OrdId": 2,
				"tes1OrdUser_id": 2
				},
				{
				"tes1OrdTotal_amount": 299.99,
				"tes1OrdStatus": "C",
				"tes1OrdEr_date": "2022-03-01 12:00:00",
				"link": {
				"Tes1User": "3"
				},
				"id": "",
				"tes1OrdId": 3,
				"tes1OrdUser_id": 3
				},
				{
				"tes1OrdTotal_amount": 399.99,
				"tes1OrdStatus": "P",
				"tes1OrdEr_date": "2022-04-01 12:00:00",
				"link": {
				"Tes1User": "4"
				},
				"id": "",
				"tes1OrdId": 4,
				"tes1OrdUser_id": 4
				},
				{
				"tes1OrdTotal_amount": 499.99,
				"tes1OrdStatus": "S",
				"tes1OrdEr_date": "2022-05-01 12:00:00",
				"link": {
				"Tes1User": "5"
				},
				"id": "",
				"tes1OrdId": 5,
				"tes1OrdUser_id": 5
				}
				],
				"Tes1OrdPro": [
				{
				"link": {
				"Tes1Product": "1",
				"Tes1Order": "1"
				},
				"id": ""
				},
				{
				"link": {
				"Tes1Product": "2",
				"Tes1Order": "2"
				},
				"id": ""
				},
				{
				"link": {
				"Tes1Product": "3",
				"Tes1Order": "3"
				},
				"id": ""
				},
				{
				"link": {
				"Tes1Product": "4",
				"Tes1Order": "4"
				},
				"id": ""
				},
				{
				"link": {
				"Tes1Product": "5",
				"Tes1Order": "5"
				},
				"id": ""
				}
				]
			};
		}else{
			 res = await SaiTools.callApi({action: 'genJsonData'});
		}
		$view.hideLoading();
		let listResult = ["datas:",JSON.stringify(res,null,1),""];
		this.setJsonValidation(()=> this.createData(this),listResult);
		console.log(res);
		
	}
	async createData(app){
		let ctn = $('#sainewmodulefront');
		const editor = window.ace.edit("jsonEditor");
		
		const jsonValue = editor.getValue();
		let res = await SaiTools.callApi({action: 'genDatas','datas':jsonValue});
		console.log(res);
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
		console.log(res);
		SaiTools.logoutApi().then(() => {
			let redirect = res.redirect;
			console.log('redirect to module',redirect);
			
			window.location.href = "/ui?"+redirect;
		});
	}
};

