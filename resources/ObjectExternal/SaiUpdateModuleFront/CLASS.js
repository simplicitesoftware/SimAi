const testWithoutAiCall = $grant.sysparams.SAI_TEST_INIB_AI_CALL == 'true';
Simplicite.UI.ExternalObjects.SaiUpdateModuleFront = class extends Simplicite.UI.ExternalObject {
	constructor() {
        super();
        this.moduleName = null;
        this.initialObjects = [];
		this.moduleObjects = [];
        this.showJson = $grant.sysparams.SAI_SHOW_JSON == 'true';
        this.currentState = 'chatInteraction';
		this.initialDesc = null;
    }

	async render(params, data = {}) {
		$ui.loadAceEditor(() => {
            console.log("ace editor loaded");
        });
        const app = this;

        if (typeof AiJsTools !== 'undefined') console.log("AiJsTools loaded");
        else {
            console.log("AiJsTools not loaded, loading now...");
            await $ui.loadScript({
                url: $ui.getApp().dispositionResourceURL("AiJsTools", "JS"),
                onload: function() {
                    console.log("AiJsTools charged and loaded");
                },
            });
        }
		app.moduleName = data.moduleName;
        app.SaiTools = new SaiTools(data);
		this.SaiTools = app.SaiTools;
        app.getPage(app);
	}

	getPage(app) {
		$view.showLoading();
        this.SaiTools.replaceLoader($T("SAI_LOADER_MODULE_ANALYSIS"));
		this.SaiTools.getModuleDesc("",app.moduleName).then((res) => {
			app.initialDesc = res.payload;
			console.log(app.initialDesc);
			let front = $("#saiupdatemodulefront");
        		let dialog = $("<div/>").attr("id", "saiupdatemodulefront_dialog").addClass("sai_front_dialog");
        		$(front).append(dialog);
                app.setChatInteraction(app.initialDesc);
		}).catch((err) => {
			console.log(err);
		}).finally(() => {
			$view.hideLoading();
			
		});
	}
	async sendMessage() {
        let ctn = $("#saiupdatemodulefront");
        
		let messageText = ctn.find("#message").val().trim();
		let hasImage = $("#input-img img").attr("src");
		
		if (messageText==="" && !hasImage) {
            $view.widget.toast({
                level: "warning",
                content: `${$T("SAI_EMPTY_MESSAGE")}`,
                position: "top",
                align: "right",
                duration: 2500,
                undo: false,
                pinable: false
            });
            return;
        }
		let params = AiJsTools.getPostParams(ctn, AiJsTools.chatUmlSpecialisation);
		// add desc to historic
		if(this.initialDesc){
			let initialText = {};
			initialText.role = "assistant";
			initialText.content = this.initialDesc;
			let historic = params.historic;
			if (typeof historic === 'string') {
				historic = JSON.parse(historic);
			}
			historic.unshift(initialText);
			params.historic = JSON.stringify(historic);
		}
        if (testWithoutAiCall) {

        	let userMessage = AiJsTools.getDisplayUserMessage(ctn);
			
			//console.log("params: "+JSON.stringify(params));
            ctn.find("#chatContainer").append(userMessage);
        	
        	let thinkingMessage = $("<div/>").attr("id","bot-thinking-text").text( $T("SAI_BOT_THINKING") );
            ctn
                .find("#chatContainer")
                .append(
                	thinkingMessage
                );
            this.SaiTools.scrollChatToBottom();
            
            await new Promise(r => setTimeout(r, 3000)); // wait for 3s to test thinking animation
            
            ctn.find("#bot-thinking-text").remove();
            ctn
                .find("#chatContainer")
                .append(
                	AiJsTools.getDisplayBotMessage("AI call inib (on purpose) -> no actual answers from AI to provide.")
                );
            this.SaiTools.scrollToLatestUserMessage();
            
            // custom reset
            ctn.find("#message").val("");
			$("#input-img").hide();
			$("#input-img img").removeAttr("src");
			this.SaiTools.autoResizeTextarea(document.getElementById('message'));

			this.SaiTools.setButtonLoading("#sendMessage", true, "fas fa-cog");
			
            $("#generateModule").addClass("simai-disabledButton");
            $("#takePicture").addClass("simai-disabledButton");
        	$("#addImage").addClass("simai-disabledButton");
        	$("#speechToText").addClass("simai-disabledButton");
	        $("#exampleHint").addClass("simai-disabledButton");

            setTimeout(() => {
            	this.SaiTools.setButtonLoading("#sendMessage", false, "fas fa-cog");
            	$("#takePicture").removeClass("simai-disabledButton");
        		$("#addImage").removeClass("simai-disabledButton");
                $("#generateModule").removeClass("simai-disabledButton");
                $("#speechToText").removeClass("simai-disabledButton");
	        	$("#exampleHint").removeClass("simai-disabledButton");
                
                if (this.firstMessage) {
		        	ctn.find("#chatContainer").append( AiJsTools.getDisplayBotMessage(`${$T("SAI_BOT_MESSAGE_BIS")}`) );
		        	
			        this.SaiTools.scrollToLatestUserMessage();
			        this.firstMessage = false;
		        }
            }, 2000);
	        
	        this.SaiTools.autoResizeTextarea(document.getElementById('message'));
	        
            return;
        }

        const message = $("#message").val();
        

		let userMessage = AiJsTools.getDisplayUserMessage(ctn);
        ctn.find("#chatContainer").append(userMessage);
        
        // let thinkingMessage = AiJsTools.getDisplayBotMessage(); 
        let thinkingMessage = $("<div/>").attr("id","bot-thinking-text").text( $T("SAI_BOT_THINKING") );
        
        ctn.find("#chatContainer").append(thinkingMessage);
        
        this.SaiTools.scrollChatToBottom();
        
        ctn.find("#message").val("");
		$("#input-img").hide();
		$("#input-img img").removeAttr("src");
		
		this.SaiTools.autoResizeTextarea(document.getElementById('message'));

		this.SaiTools.setButtonLoading("#sendMessage", true, "fas fa-cog");
        $("#takePicture").addClass("simai-disabledButton");
        $("#addImage").addClass("simai-disabledButton");
        $("#generateModule").addClass("simai-disabledButton");
        $("#exampleHint").addClass("simai-disabledButton");
        $("#speechToText").addClass("simai-disabledButton");

		let res;
		try {
        	res = await this.SaiTools.callApi(params, "chat");
		} catch (e) {
			console.error("Timeout error ?\n"+e);
			
			$view.widget.toast({
				level: "warning",
		        content: $T("SAI_REACHED_TIMEOUT"),
		        position: "top",
		        align: "right",
		        duration: 3500,
		        undo: false,
		        pinable: false
			});
			
			ctn.find("#chatContainer").remove("#bot-thinking-text");
			
			ctn.find("#chatContainer").append(
	            AiJsTools.getDisplayBotMessage(`${$T("SAI_BOT_MESSAGE_TIMEOUT")}`)
	        );
	        
	        this.SaiTools.scrollChatToBottom();
			
			this.SaiTools.setButtonLoading("#sendMessage", false, "fas fa-cog");
	        $("#takePicture").removeClass("simai-disabledButton");
	        $("#addImage").removeClass("simai-disabledButton");
	        $("#generateModule").removeClass("simai-disabledButton");
	        $("#exampleHint").removeClass("simai-disabledButton");
	        $("#speechToText").removeClass("simai-disabledButton");
	        
	        $view.hideLoading();
	        return;
		}
        
        if (res?.error) {
            // ctn.find('#chatContainer').append("an error occured: " + AiJsTools.getDisplayBotMessage(res?.error)); // keep this in any case
            switch (res.error[0]) {
            	case 400:
            		$view.widget.toast({
		                level: "warning",
		                content: $T("SAI_ERR_400_CHAT"),
		                position: "top",
		                align: "right",
		                duration: 4000,
		                undo: false,
		                pinable: false
		            });
		            ctn.find("#message").val(message); // putting back message
		        	// then will face the return, so possible to retry
            		break;
            	case 503:
            		$view.widget.toast({ // error toast
		                level: "error",
		                content: $T("SAI_ERR_503_CHAT"),
		                position: "top",
		                align: "right",
		                duration: 4000,
		                undo: false,
		                pinable: false
		            });
		            
		            this.SaiTools.redirectToErrorPage(); // redirect to dead-end page (back to website at least ?)
            		break;
            		
            	default:
            		console.log("UNKNOWN ERROR : "+JSON.stringify(res.error));
            		this.SaiTools.redirectToErrorPage();
            		break;
            		
            	// no default.
            }
            
            ctn.find("#bot-thinking-text").remove();
            
            this.SaiTools.setButtonLoading("#sendMessage", false, "fas fa-cog");
	        $("#takePicture").removeClass("simai-disabledButton");
	        $("#addImage").removeClass("simai-disabledButton");
	        $("#generateModule").removeClass("simai-disabledButton");
	        $("#speechToText").removeClass("simai-disabledButton");
	        $("#exampleHint").removeClass("simai-disabledButton");
            
            return;
        }
        
        // await shall block until having a valid response ...
        this.SaiTools.setButtonLoading("#sendMessage", false, "fas fa-cog");
        $("#takePicture").removeClass("simai-disabledButton");
        $("#addImage").removeClass("simai-disabledButton");
        $("#generateModule").removeClass("simai-disabledButton");
        $("#speechToText").removeClass("simai-disabledButton");
        $("#exampleHint").removeClass("simai-disabledButton");

        let response = $view
            .markdownToHTML(res?.choices[0]?.message?.content)
            .html();
        
        console.log("Finish Reason : "+ res?.choices[0]?.finish_reason);
        
        if (res?.choices[0]?.finished_reason === "length")
        	response += $T("SAI_BOT_MESSAGE_LENGTH");
        else if (res?.choices[0]?.finished_reason === "error")
        	response += $T("SAI_BOT_MESSAGE_LENGTH");
        
        
        ctn.find("#chatContainer").append( AiJsTools.getDisplayBotMessage(response) );
        this.SaiTools.scrollToLatestUserMessage();
        
        ctn.find("#bot-thinking-text").remove();
        
        this.SaiTools.autoResizeTextarea(document.getElementById('message'));
        
        if (this.firstMessage) {
        	console.log("it was the first message !");
        	
        	ctn.find("#chatContainer").append( AiJsTools.getDisplayBotMessage(`${$T("SAI_BOT_MESSAGE_BIS")}`) );
	        
	        this.firstMessage = false;

        }
    }
	async setChatInteraction(moduleDesc) {
    	
	    this.currentState = "chatInteraction";
	    let dialog = $("#saiupdatemodulefront_dialog").addClass("sai_front_dialog");
	    dialog.html("");
	    
	    dialog.append(
	        $("<div/>")
	            .attr("id", "sai_helpPin")
	            .addClass("simai-safe-navigation")
	            .append(
	                $(`<i class="fas fa-question"></i>`)
	            )
	            .on("click", this.SaiTools.openContactHelpModal)
	    );
	    
	    dialog.append(
	        $("<span/>")
	        .addClass("simai-contextualHelp")
	        .text(`${$T("SAI_MODULE_SPEC_UPDATE")}`)
	    );
	    
	    let subCtn = $("<div/>").attr("id", "saiupdatemodulefront_chatFooter").addClass("chatFooter");
	
	    subCtn.append('<div id="chatContainer"></div>');
	    
	    let inputCtn = $('<div class="ai-chat-wrapper"></div>');
	    let textCtn = $('<div class="ai-chat-input-area"></div>');
	    let imageCtn = $('<div class="ai-image-input-area"></div>');
	    
	    imageCtn.append(
	        '<input type="file" id="input-img-file" accept="image/*" hidden />'
	    );
	    
	    imageCtn.append(
		    `<div id="input-img">
		        <img />
		        <button type="button" class="remove-image-btn" onclick="$('#input-img').hide(); $('#input-img img').removeAttr('src');">
		            <i class="fas fa-trash"></i>
		        </button>
		    </div>`
		);
		
	    let textAreaContainer = $("<div/>").addClass("simai-textarea-container");
	    let textArea = $(`<textarea id="message" class="user-message" placeholder="${$T("SAI_PH_MESSAGE")}" rows="2"></textarea>`);
	    
	    textAreaContainer.append(textArea);
	    
	    let buttonsContainer = $("<div/>").addClass("simai-buttons-container");
	    let leftButtons = $("<div/>").addClass("chat-left-buttons");
	    
	    let takePictureButton = $(
		  `<button id="takePicture" class="chatButtonGrey" title="${$T("SAI_TOOLTIP_PICTURE")}">
		    <i class="fas fa-camera"></i>
		  </button>`
		);
		takePictureButton.on("click", () => this.SaiTools.takePicture(this));
		
		let addImageButton = $(
		  `<button id="addImage" class="chatButtonGrey" title="${$T("SAI_TOOLTIP_IMAGE")}">
		    <i class="fas fa-image"></i>
		  </button>`
		);
		addImageButton.on("click", () => this.SaiTools.addImage(this));
		
		
		leftButtons.append(takePictureButton).append(addImageButton);
		
		let rightButtons = $("<div/>").addClass("chat-right-buttons");
		
		let textToSpeechButton = $(
		  `<button id="textToSpeech" class="chatButtonGrey" title="${$T("SAI_TOOLTIP_SPEECH")}">
		    <i class="fas fa-microphone"></i>
		  </button>`
		);
		textToSpeechButton.on("click", () => this.speechToText());
		
		let sendButton = $(
		  `<button id="sendMessage" class="chatButton" title="${$T("SAI_TOOLTIP_MESSAGE")}">
		    <i class="fas fa-paper-plane"></i>
		  </button>`
		);
		sendButton.on("click", () => this.sendMessage(this));
		
		rightButtons/*.append(textToSpeechButton)*/.append(sendButton);
		
		buttonsContainer.append(leftButtons).append(rightButtons);
	    
	    textCtn.append(textAreaContainer);
	    textCtn.append(buttonsContainer);
		
		inputCtn.append(imageCtn).append(textCtn);
	    subCtn.append(inputCtn);
	
	    let genButton = $(
	        `<button id="generateModule" class="actionButton-blue simai-disabledButton">${$T(
	            "SAI_GEN_MODULE"
	        )}</button>`
	    );
	    
	    genButton.addClass("simai-safe-navigation").on("click", () => this.initUpdateModule(this));
	    subCtn.append(genButton);
	
	    dialog.append(subCtn);
	    dialog.append(this.SaiTools.createTips($T("SAI_TIP_PROMPT")));
	
	    dialog.find("#chatContainer").append(
	        AiJsTools.getDisplayBotMessage(`${$T("SAI_BOT_MESSAGE_UPDATE")}`)
	    );
		console.log("moduleDesc: "+moduleDesc);
		let mdModuleDesc = $view.markdownToHTML(moduleDesc).html();
		dialog.find("#chatContainer").append(
	        AiJsTools.getDisplayBotMessage(`${mdModuleDesc}`)
	    );
	}
	async initUpdateModule(app) {
		let params = {};
		params.moduleName = this.moduleName;
		let res = await this.SaiTools.callApi(params, "initUpdateModule");
		console.log("initUpdateModule: ",res);
		this.generateUpdateModule(app);
	}
	async generateUpdateModule(app) {
        let params = {};
        if (testWithoutAiCall) {
            params = {
                historic: [
                    '{"role":"user","content":[{"type":"text","text":"app de commande"}]}',
                    '{"role":"assistant","content":"Designing a UML (Unified Modeling Language) class diagram for an \\"app de commande\\" (order application) involves creating a visual representation of the classes, their attributes, methods, and relationships in an object-oriented application.\\nHere\'s a sample UML class diagram for an order application without function (method) descriptions, focusing on the relationships between classes.\\nClass: User\\n\\nattributes:\\nid (integer)\\nusername (string)\\nemail (string)\\npassword (string)\\naddress (string)\\n\\n\\n\\nClass: Product\\n\\nattributes:\\nid (integer)\\nname (string)\\ndescription (string)\\nprice (float)\\nstock_count (integer)\\n\\n\\n\\nClass: Order\\n\\nattributes:\\nid (integer)\\nuser_id (integer)\\norder_date (date)\\ntotal_amount (float)\\nstatus (string)\\n\\n\\n\\nRelationships:\\n\\nUser -> Order (1:N, Composition, A User has many Orders)\\nOrder -> Product (N:M, Association, An Order contains many Products and a Product can be in many Orders)\\n\\n\\nattributes:\\nquantity (integer)\\ndiscount (float)\\n\\n\\n\\nNotes:\\n\\nThe \\"User\\" class represents the application\'s users, having attributes like id, username, email, and address.\\nThe \\"Product\\" class represents the products available in the application, with attributes like id, name, description, price, and stock_count.\\nThe \\"Order\\" class represents the orders placed by users, involving user_id, order_date, total_amount, and status.\\nThe relationships between classes depict that a user has many orders (1:N), and each order contains many products (N:M).\\nIn the N:M association between Order and Product, an attribute called \\"quantity\\" signifies the number of a specific product in an order, and \\"discount\\", if any, offered on the product for the specific order.\\n\\nThis UML design does not include function descriptions, focusing solely on the classes, their attributes, and relationships."}',
                ],
            };
        } else {
            let ctn = $("#saiupdatemodulefront");
            let historic = await this.SaiTools.getHistoric(ctn,this.initialDesc);
			console.log("historic: ",historic);
            params = {
                historic: historic
            };
        }
        
        $view.showLoading();
        this.SaiTools.replaceLoader($T("SAI_LOADER_MODULE_GEN"));
        
        try {
			let res;
			if(testWithoutAiCall) {
				res = [
					"D'accord, je vais vous fournir un modèle UML en JSON pour une application qui inclut les classes `Commande`, `Article de Commande`, `Produit`, `Utilisateur` et `Favoris`. Voici le modèle complet en utilisant le template JSON fourni :\n\n\n",
					"{\n    \"classes\": [\n        {\n            \"name\": \"Commande\",\n            \"trigram\": \"CMD\",\n            \"bootstrapIcon\": \"shopping-cart\",\n            \"en\": \"Order\",\n            \"fr\": \"Commande\",\n            \"comment\": \"Représente une commande passée par un utilisateur.\",\n            \"attributes\": [\n                {\n                    \"name\": \"OrderId\",\n                    \"fr\": \"Identifiant de commande\",\n                    \"en\": \"Order ID\",\n                    \"key\": true,\n                    \"required\": true,\n                    \"type\": \"Integer\"\n                },\n                {\n                    \"name\": \"OrderDate\",\n                    \"fr\": \"Date de la commande\",\n                    \"en\": \"Order Date\",\n                    \"required\": true,\n                    \"type\": \"Date and time\"\n                },\n                {\n                    \"name\": \"OrderStatus\",\n                    \"fr\": \"Statut de la commande\",\n                    \"en\": \"Order Status\",\n                    \"required\": true,\n                    \"type\": \"Enumeration\",\n                    \"Enumeration\": {\n                        \"Values\": [\n                            {\n                                \"code\": \"PENDING\",\n                                \"en\": \"Pending\",\n                                \"fr\": \"En attente\",\n                                \"color\": \"orange\"\n                            },\n                            {\n                                \"code\": \"SHIPPED\",\n                                \"en\": \"Shipped\",\n                                \"fr\": \"Expédié\",\n                                \"color\": \"green\"\n                            },\n                            {\n                                \"code\": \"CANCELLED\",\n                                \"en\": \"Cancelled\",\n                                \"fr\": \"Annulé\",\n                                \"color\": \"red\"\n                            }\n                        ]\n                    }\n                }\n            ]\n        },\n        {\n            \"name\": \"Article de Commande\",\n            \"trigram\": \"OIT\",\n            \"bootstrapIcon\": \"cart-plus\",\n            \"en\": \"OrderItem\",\n            \"fr\": \"Article de Commande\",\n            \"comment\": \"Représente un article dans une commande.\",\n            \"attributes\": [\n                {\n                    \"name\": \"OrderItemId\",\n                    \"fr\": \"Identifiant de l'article de commande\",\n                    \"en\": \"Order Item ID\",\n                    \"key\": true,\n                    \"required\": true,\n                    \"type\": \"Integer\"\n                },\n                {\n                    \"name\": \"Quantity\",\n                    \"fr\": \"Quantité\",\n                    \"en\": \"Quantity\",\n                    \"required\": true,\n                    \"type\": \"Integer\"\n                },\n                {\n                    \"name\": \"Price\",\n                    \"fr\": \"Prix\",\n                    \"en\": \"Price\",\n                    \"required\": true,\n                    \"type\": \"Decimal\"\n                }\n            ]\n        },\n        {\n            \"name\": \"Produit\",\n            \"trigram\": \"PRD\",\n            \"bootstrapIcon\": \"box\",\n            \"en\": \"Product\",\n            \"fr\": \"Produit\",\n            \"comment\": \"Représente un produit disponible à la vente.\",\n            \"attributes\": [\n                {\n                    \"name\": \"ProductId\",\n                    \"fr\": \"Identifiant du produit\",\n                    \"en\": \"Product ID\",\n                    \"key\": true,\n                    \"required\": true,\n                    \"type\": \"Integer\"\n                },\n                {\n                    \"name\": \"Name\",\n                    \"fr\": \"Nom\",\n                    \"en\": \"Name\",\n                    \"required\": true,\n                    \"type\": \"Short text\"\n                },\n                {\n                    \"name\": \"Description\",\n                    \"fr\": \"Description\",\n                    \"en\": \"Description\",\n                    \"required\": false,\n                    \"type\": \"Long text\"\n                },\n                {\n                    \"name\": \"Price\",\n                    \"fr\": \"Prix\",\n                    \"en\": \"Price\",\n                    \"required\": true,\n                    \"type\": \"Decimal\"\n                }\n            ]\n        },\n        {\n            \"name\": \"Utilisateur\",\n            \"trigram\": \"USR\",\n            \"bootstrapIcon\": \"user\",\n            \"en\": \"User\",\n            \"fr\": \"Utilisateur\",\n            \"comment\": \"Représente un utilisateur de l'application.\",\n            \"attributes\": [\n                {\n                    \"name\": \"UserId\",\n                    \"fr\": \"Identifiant de l'utilisateur\",\n                    \"en\": \"User ID\",\n                    \"key\": true,\n                    \"required\": true,\n                    \"type\": \"Integer\"\n                },\n                {\n                    \"name\": \"Username\",\n                    \"fr\": \"Nom d'utilisateur\",\n                    \"en\": \"Username\",\n                    \"required\": true,\n                    \"type\": \"Short text\"\n                },\n                {\n                    \"name\": \"Password\",\n                    \"fr\": \"Mot de passe\",\n                    \"en\": \"Password\",\n                    \"required\": true,\n                    \"type\": \"Password\"\n                },\n                {\n                    \"name\": \"Email\",\n                    \"fr\": \"Email\",\n                    \"en\": \"Email\",\n                    \"required\": true,\n                    \"type\": \"Email\"\n                }\n            ]\n        },\n        {\n            \"name\": \"Favoris\",\n            \"trigram\": \"FRV\",\n            \"bootstrapIcon\": \"heart\",\n            \"en\": \"Favorite\",\n            \"fr\": \"Favoris\",\n            \"comment\": \"Représente un produit ajouté aux favoris par un utilisateur.\",\n            \"attributes\": [\n                {\n                    \"name\": \"FavoriteId\",\n                    \"fr\": \"Identifiant du favori\",\n                    \"en\": \"Favorite ID\",\n                    \"key\": true,\n                    \"required\": true,\n                    \"type\": \"Integer\"\n                },\n                {\n                    \"name\": \"UserId\",\n                    \"fr\": \"Identifiant de l'utilisateur\",\n                    \"en\": \"User ID\",\n                    \"required\": true,\n                    \"type\": \"Integer\"\n                },\n                {\n                    \"name\": \"ProductId\",\n                    \"fr\": \"Identifiant du produit\",\n                    \"en\": \"Product ID\",\n                    \"required\": true,\n                    \"type\": \"Integer\"\n                }\n            ]\n        }\n    ],\n    \"relationships\": [\n        {\n            \"class1\": \"Commande\",\n            \"class2\": \"Article de Commande\",\n            \"type\": \"OneToMany\"\n        },\n        {\n            \"class1\": \"Article de Commande\",\n            \"class2\": \"Produit\",\n            \"type\": \"ManyToOne\"\n        },\n        {\n            \"class1\": \"Commande\",\n            \"class2\": \"Utilisateur\",\n            \"type\": \"ManyToOne\"\n        },\n        {\n            \"class1\": \"Utilisateur\",\n            \"class2\": \"Favoris\",\n            \"type\": \"OneToMany\"\n        },\n        {\n            \"class1\": \"Favoris\",\n            \"class2\": \"Produit\",\n            \"type\": \"ManyToOne\"\n        }\n    ]\n}",
					"\n\n\nCe modèle JSON décrit les classes et leurs attributs, ainsi que les relations entre elles. Chaque classe a des attributs spécifiques, et les relations entre les classes sont définies pour montrer comment elles interagissent. Vous pouvez utiliser ce modèle pour générer un diagramme UML ou pour implémenter une application en Java."
				]
			} else {
				res = await this.SaiTools.callApi(params, "genUpdateJson");
			}
	
	        if (res?.error) {
	            switch (res.error[0]) {
	            	case 500:
	            		$view.widget.toast({
			                level: "error",
			                content: $T("SAI_ERR_500_JSON"),
			                position: "top",
			                align: "right",
			                duration: 4000,
			                undo: false,
			                pinable: false
			            });
			            // back to chat (no historic ?)
			            this.setChatInteraction();
	            		break;
	            		
	            	case 503:
	            		$view.widget.toast({
			                level: "error",
			                content: $T("SAI_ERR_503_JSON"),
			                position: "top",
			                align: "right",
			                duration: 4000,
			                undo: false,
			                pinable: false
			            });
			            let resDel = await this.SaiTools.deleteModule(this.validatedModuleName); // ask for module deletion
			            // if error (404|500) then rename module to random name ??
			            this.validatedModuleName = "";
			            this.setChatInteraction(); // back to process beginning
	            		break;
	            	default:
	            		console.log("UNKNOWN ERROR : "+JSON.stringify(res.error));
	            		resDel = await this.SaiTools.deleteModule(this.validatedModuleName); // ask for module deletion
	            		this.SaiTools.redirectToErrorPage();
	            		break;
	            	// no default
	            }
	            
	            $view.hideLoading();
	            
	            return;
	        }
	        
	        $view.hideLoading();
	        if (this.showJson) {
	            app.SaiTools.setJsonValidation(() => app.prepareJson(app), res,"#saiupdatemodulefront_dialog");
	        } else {
	            app.prepareJson(app, res[1]);
	        }
        } catch (e) {
        	// supposely session's timeout
    		$view.widget.toast({
	            level: "error",
	            content: $T("SAI_SESSION_TIMEOUT"),
	            position: "top",
	            align: "right",
	            duration: 5000,
	            undo: false,
	            pinable: false
	        });
	        
	        // reload page should send back to the CHAT
	        await this.forcedReloadPage();
        }
    }
	async prepareJson(app, jsonValue = {}) {
        if (this.showJson) {
            const editor = window.ace.edit("jsonEditor");
            jsonValue = editor.getValue();
        }
        
        try {
            JSON.parse(jsonValue); // Tente de parser le JSON
            
            let res = await this.SaiTools.callApi({
                action: "prepareJson",
                json: jsonValue,
            });
            
            if (res?.error) {
            	// only 404 is possible there
            	$view.widget.toast({
	                level: "warning",
	                content: $T("SAI_ERR_404_JSON"),
	                position: "top",
	                align: "right",
	                duration: 4000,
	                undo: false,
	                pinable: false
	            });
	            // retry quickly
	            let resBis = await this.SaiTools.callApi({ action: "prepareJson", json: jsonValue });
	        	if (resBis?.error) {
	        		// same but don't retry -> back to home ?
	        		$view.widget.toast({
		                level: "error",
		                content: $T("SAI_ERR_404_JSON_BIS"),
		                position: "top",
		                align: "right",
		                duration: 4500,
		                undo: false,
		                pinable: false
		            });
		            
		            this.setChatInteraction(); // back to chat without historic (so keep module name)
		            return;
	        	}
	        	res = resBis;
            }
            console.log("Preparing JSON with : " + JSON.stringify(res));
            app.createObjs(app, res.objects);
        } catch (e) {
            console.log("error", e);
	        $view.widget.toast({
	            level: "error",
	            content: $T("SAI_ERR_404_JSON_BIS"),
	            position: "top",
	            align: "right",
	            duration: 4500,
	            undo: false,
	            pinable: false
	        });
	        // exit only ?? sending back to chat (no historic) ??
	        this.setChatInteraction();
	        return;
        }
    }

    async createObjs(app, objects) {
    	this.currentState = "umlGeneration";
        let dialog = $("#saiupdatemodulefront_dialog").addClass("sai_front_dialog");

        dialog.prevAll().remove();
        dialog.nextAll().remove();

        dialog.html("");
        
        dialog.append(
        	$("<div/>")
        		.attr("id", "sai_helpPin")
        		.addClass("simai-safe-navigation")
        		.append(
        			$(`<i class="fas fa-question"></i>`)
        		)
        		.on("click", this.SaiTools.openContactHelpModal)
        );

        dialog.append(
            $("<span/>")
            .addClass("simai-contextualHelp")
            .text(`${$T("SAI_MODULE_UML")}`)
        );

        let mermaidText = "classDiagram\n direction RL\n";

        mermaid.initialize({
            theme: "dark",
        });
        dialog.append(
            $("<img/>")
            .attr("src", "")
            .attr("id", "mermaidImage")
        );
        for (let obj of objects) {
        	
        	try {
	            let mermaidObj = await this.SaiTools.callApi({
	                action: "genUpdateObj",
	                objName: obj,
	            });
	            mermaidText += "class " + mermaidObj.name + " {\n";
	
	            let objectFields = [];
	            for (let field of mermaidObj.fields) {
	                objectFields.push(field);
	                mermaidText += "    " + field + "\n";
	            }
	
	            console.log("Creating module object : " + obj + " -> " + objectFields);
	
	            this.moduleObjects.push({
	                code: obj,
	                fields: objectFields
	            });
	
	            mermaidText += "}\n";
	            console.log(mermaidText);
	
	            mermaid.render("mermaidImg", mermaidText).then((res) => {
	                const svg = `data:image/svg+xml;base64,${$app.base64Encode(res.svg)}`;
	                $("#saiupdatemodulefront").find("img").attr("src", svg);
	            });
        	} catch (e) {
        		// supposely session's timeout
	    		$view.widget.toast({
		            level: "error",
		            content: $T("SAI_SESSION_TIMEOUT"),
		            position: "top",
		            align: "right",
		            duration: 5000,
		            undo: false,
		            pinable: false
		        });
				console.log("error: "+e);
		        
		        // reload page should send back to the CHAT
		        await this.forcedReloadPage();
        	}
        }

		try {
	        let links = await this.SaiTools.callApi({
	            action: "genlinks"
	        });
	        
	        console.log(links);
	        for (let link of links.links) {
	            mermaidText += "    " + link + "\n";
	        }
	        console.log(mermaidText);
	        mermaid.render("mermaidImg", mermaidText).then((res) => {
	            const svg = `data:image/svg+xml;base64,${$app.base64Encode(res.svg)}`;
	            $("#saiupdatemodulefront").find("img").attr("src", svg);
	        });
	
	        let nextButton = $(
	            `<button id="nextButton" class="actionButton-blue">${$T(
	        "SAI_NEXT"
	      )}</button>`
	        );
	        nextButton.addClass("simai-safe-navigation").on("click", () => {
	            app.clearCacheAndRedirect(mermaidText);

	        });
	
	        let interactiveBox = $("<div/>").addClass("simai-interactiveBox");
	        interactiveBox.append(nextButton);
	
	        dialog.append(interactiveBox);
	        
	        dialog.append(this.SaiTools.createTips($T("SAI_TIP_UML")));
        
		} catch (e) {
			// supposely session's timeout
    		$view.widget.toast({
	            level: "error",
	            content: $T("SAI_SESSION_TIMEOUT"),
	            position: "top",
	            align: "right",
	            duration: 5000,
	            undo: false,
	            pinable: false
	        });
	        
	        // reload page should send back to the CHAT
	        await this.forcedReloadPage();
		}
    }
	async forcedReloadPage() {
		$view.hideLoading();
		this.setChatInteraction();
	}
	async clearCacheAndRedirect(mermaidText) {
    	this.currentState = "reconnect";
        let dialog = $("#saiupdatemodulefront_dialog").addClass("sai_front_dialog");

        dialog.html("");
        
        dialog.append(
        	$("<div/>")
        		.attr("id", "sai_helpPin")
        		.addClass("simai-safe-navigation")
        		.append(
        			$(`<i class="fas fa-question"></i>`)
        		)
        		.on("click", this.SaiTools.openContactHelpModal)
        );
        dialog.append(
            $("<span/>")
            .addClass("simai-contextualHelp")
            .text(`${$T("SAI_DATA_GEN")}`)
        );

        dialog.append(this.SaiTools.getModuleSummary());

        let interactiveBox = $("<div/>").addClass("simai-interactiveBox");
		
        let reconnectButton = $("<button/>").attr("id", "reconnectButton").addClass("actionButton-yellow").text(`${$T("SAI_RECONNECT")}`).on("click", () => {
            $view.showLoading();
            this.SaiTools.replaceLoader($T("SAI_LOADER_RECONNECT"));
           
			this.SaiTools.callApi({
				action: "clearCache",
				isUpdate: true,
				moduleName: this.moduleName
			}).then(() => {
				$view.hideLoading();
				$app.logout(console.log, console.error);
				location.reload();
			});
        });

        interactiveBox.append(reconnectButton);

        dialog.append(interactiveBox);
    }
};
