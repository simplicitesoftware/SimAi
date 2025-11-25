const testWithoutAiCall = $grant.sysparams.SAI_TEST_INIB_AI_CALL == 'true';

Simplicite.UI.ExternalObjects.SaiNewModuleFront = class extends(
    Simplicite.UI.ExternalObject
) {
    constructor() {
        super();
        this.validatedModuleName = null;
        this.moduleObjects = [];
        this.showJson = $grant.sysparams.SAI_SHOW_JSON == 'true';
        this.firstMessage = false;
        // state handling -> for RELOAD popup
        this.currentState = 'chatInteraction';
    }

    async render(params, data = {}) {

        $ui.loadAceEditor(() => {
            console.log("ace editor loaded");
        });
        const app = this;

        if (typeof AiJsTools !== 'undefined')
        	console.log("AiJsTools loaded");
        else {
            console.log("AiJsTools not loaded, loading now...");
            await $ui.loadScript({
                url: $ui.getApp().dispositionResourceURL("AiJsTools", "JS"),
                onload: function() {
                    console.log("AiJsTools charged and loaded");
                },
            });
        }

        app.SaiTools = new SaiTools(data);
        app.getPage(app);
    }

    getPage(app) {
        $grant.getParameter((parameter) => {
            if (
                !parameter ||
                parameter == "false" ||
                parameter?.value == "" ||
                app.isJsonAndEmpty(parameter)
            ) {
                let front = $("#sainewmodulefront");
        		let dialog = $("<div/>").attr("id", "sainewmodulefront_dialog").addClass("sai_front_dialog");
        		$(front).append(dialog);
        		
                app.setChatInteraction();
            } else {
                app.genData();
            }
        }, "AI_AWAIT_CLEAR_CACHE");
    }
    isJsonAndEmpty(parameter) {
        try {
            let json = JSON.parse(parameter);
            return json.AI_AWAIT_CLEAR_CACHE == "";
        } catch (e) {
            console.log("Erreur lors du parsing JSON:", e);
            return false;
        }
    }
    async setModuleNameForm() {
    	this.currentState = "moduleNameForm";
        let ctn = $("#sainewmodulefront");

        let subCtn = $("<div/>").attr("id", "sainewmodulefront_dialog").addClass("sai_front_dialog");
        
        subCtn.append(
        	$("<div/>")
        		.attr("id", "sai_helpPin")
        		.addClass("simai-safe-navigation")
        		.append(
        			$(`<i class="fas fa-question"></i>`)
        		)
        		.on("click", this.SaiTools.openContactHelpModal)
        );

        console.log(this);

        subCtn.append(
            $("<span/>")
            .addClass("simai-contextualHelp")
            .text(`${$T("SAI_MODULE_NAME")}`)
        );

        let interactiveBox = $("<div/>").addClass("simai-interactiveBox");
        interactiveBox.append(
            `<input type="text" id="moduleName" placeholder="${$T("SAI_PH_MODULE")}" minlength="3" maxlength="50"/>`
        );
        const createButton = $(
            `<button id="createModule" class="actionButton-blue">${$T(
        "SAI_CREATE_MODULE"
      )}</button>`
        );

        createButton.addClass("simai-safe-navigation").on("click", () => this.validateModuleName(this));
        interactiveBox.append(createButton);

        subCtn.append(interactiveBox);
        $(ctn).append(subCtn);
        
        setTimeout(() => {
	        this.showIntroModal();
	    }, 300);
	    
	    // setTimeout(() => {
	    //     this.SaiTools.redirectToErrorPage();
	    // }, 2500);
    }

    async setChatInteraction() {
    	await this.SaiTools.callApi({}, "initTokensHistory");
    	
	    this.currentState = "chatInteraction";
	    let dialog = $("#sainewmodulefront_dialog").addClass("sai_front_dialog");
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
	    
	    await this.attachExamples(dialog);
	
	    dialog.append(
	        $("<span/>")
	        .addClass("simai-contextualHelp")
	        .text(`${$T("SAI_MODULE_SPEC")}`)
	    );
	    
	    let subCtn = $("<div/>").attr("id", "sainewmodulefront_chatFooter").addClass("chatFooter");
	
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
		
		let exampleHintButton = $(
		  `<button id="exampleHint" class="chatButtonGrey" title="${$T("SAI_TOOLTIP_EXAMPLES")}">
		    <i class="fas fa-bolt"></i>
		  </button>`
		);
		exampleHintButton.on("click", () => this.exampleHint(this));
		
		leftButtons.append(exampleHintButton).append(takePictureButton).append(addImageButton);
		
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
	    
	    // genButton.addClass("simai-safe-navigation").on("click", () => this.createModule(this));
	    genButton.addClass("simai-safe-navigation").on("click", () => this.showModuleNameModal());
	    subCtn.append(genButton);
	
	    dialog.append(subCtn);
	    
	    let dialogBottom = $("<div class='sai-dialog-bottom'></div>");
	    dialogBottom.append(this.SaiTools.createTips($T("SAI_TIP_PROMPT"),true));
	    dialogBottom.append(this.SaiTools.createDataWarning($T("SAI_DATA_PRIVACY_TITLE"), $T("SAI_DATA_PRIVACY_TEXT")));
	    
	    dialog.append(dialogBottom);
	
	    dialog.find("#chatContainer").append(
	        AiJsTools.getDisplayBotMessage(`${$T("SAI_BOT_MESSAGE")}`)
	    );
	    
	    this.firstMessage = true;
	    this.activateExamples(true);
	    
	    setTimeout(() => {
	        this.showIntroModal();
	    }, 300);
	}

    async validateModuleName(app) {
        const moduleName = $("#moduleName").val();
        if (moduleName) {

            let available = await this.SaiTools.isModuleNameAvailable(moduleName);

            if (available) {
                this.validatedModuleName = moduleName;
                app.setChatInteraction();
            } else {
                $view.widget.toast({
                	level: "error",
                	content: `${$T("SAI_MODULE_NAMEEXIST")}`,
                	position: "top",
                	align: "right",
                	duration: 2500,
                	undo: false,
                	pinable: false,
                });
            }
        } else {
            $view.widget.toast({
                level: "error",
                content: `${$T("SAI_MODULE_NONAME")}`,
                position: "top",
                align: "right",
                duration: 2500,
                undo: false,
                pinable: false
            });
        }
    }
    
    async speechToText() {
    	// TODO : inspire from the module process for this one
    	console.log("<Speech to Text> feature not implemented yet");
    }
    
    async exampleHint() {
	    // Shall redo it ...
    }

    async sendMessage() {
        let ctn = $("#sainewmodulefront");
        
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

        if (testWithoutAiCall) {
        	let userMessage = AiJsTools.getDisplayUserMessage(ctn);
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
			        
			        this.activateExamples(false);
		        }
            }, 2000);
	        
	        this.SaiTools.autoResizeTextarea(document.getElementById('message'));
	        
            return;
        }

        const message = $("#message").val();
        let params = AiJsTools.getPostParams(ctn, AiJsTools.chatUmlSpecialisation);

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
	        this.activateExamples(false);
        }
    }

    async createModule(app) {
    	try {
	        const moduleInfo = await this.SaiTools.callApi({
	            action: "create",
	            login: $grant.getLogin(),
	            moduleName: this.validatedModuleName,
	        });
	        
	        console.log(moduleInfo);
	        
	        if (moduleInfo?.error) {
	            $view.widget.toast({
	                level: "error",
	                content: $T("SAI_ERR_CREATE"),
	                position: "top",
	                align: "right",
	                duration: 4000,
	                undo: false,
	                pinable: false
	            });
	            
	            this.setChatInteraction(); // back to beginning ...
	        } else {
	            app.generateModule(app);
	        }
        
    	} catch(e) {
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

    async generateModule(app) {
        let params = {};
        if (testWithoutAiCall) {
            params = {
                historic: [
                    '{"role":"user","content":[{"type":"text","text":"app de commande"}]}',
                    '{"role":"assistant","content":"Designing a UML (Unified Modeling Language) class diagram for an \\"app de commande\\" (order application) involves creating a visual representation of the classes, their attributes, methods, and relationships in an object-oriented application.\\nHere\'s a sample UML class diagram for an order application without function (method) descriptions, focusing on the relationships between classes.\\nClass: User\\n\\nattributes:\\nid (integer)\\nusername (string)\\nemail (string)\\npassword (string)\\naddress (string)\\n\\n\\n\\nClass: Product\\n\\nattributes:\\nid (integer)\\nname (string)\\ndescription (string)\\nprice (float)\\nstock_count (integer)\\n\\n\\n\\nClass: Order\\n\\nattributes:\\nid (integer)\\nuser_id (integer)\\norder_date (date)\\ntotal_amount (float)\\nstatus (string)\\n\\n\\n\\nRelationships:\\n\\nUser -> Order (1:N, Composition, A User has many Orders)\\nOrder -> Product (N:M, Association, An Order contains many Products and a Product can be in many Orders)\\n\\n\\nattributes:\\nquantity (integer)\\ndiscount (float)\\n\\n\\n\\nNotes:\\n\\nThe \\"User\\" class represents the application\'s users, having attributes like id, username, email, and address.\\nThe \\"Product\\" class represents the products available in the application, with attributes like id, name, description, price, and stock_count.\\nThe \\"Order\\" class represents the orders placed by users, involving user_id, order_date, total_amount, and status.\\nThe relationships between classes depict that a user has many orders (1:N), and each order contains many products (N:M).\\nIn the N:M association between Order and Product, an attribute called \\"quantity\\" signifies the number of a specific product in an order, and \\"discount\\", if any, offered on the product for the specific order.\\n\\nThis UML design does not include function descriptions, focusing solely on the classes, their attributes, and relationships."}',
                ],
            };
        } else {
            let ctn = $("#sainewmodulefront");
            let historic = await this.SaiTools.getHistoric(ctn);
            params = {
                historic: historic
            };
        }
        
        $view.showLoading();
        this.SaiTools.replaceLoader($T("SAI_LOADER_MODULE_GEN"));
        
        try {
	        let res = await this.SaiTools.callApi(params, "genJson");
	
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
	            app.SaiTools.setJsonValidation(() => app.prepareJson(app), res,"#sainewmodulefront_dialog");
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
        let ctn = $("#sainewmodulefront");
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
        let ctn = $("#sainewmodulefront");
        let dialog = $("#sainewmodulefront_dialog").addClass("sai_front_dialog");

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
	                action: "genObj",
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
	                $("#sainewmodulefront").find("img").attr("src", svg);
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
	            $("#sainewmodulefront").find("img").attr("src", svg);
	        });
	
	        let nextButton = $(
	            `<button id="nextButton" class="actionButton-blue">${$T(
	        "SAI_NEXT"
	      )}</button>`
	        );
	        nextButton.addClass("simai-safe-navigation").on("click", () => {
	            app.clearCache(mermaidText);
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

    async clearCache(mermaidText) {
    	this.currentState = "reconnect";
        let ctn = $("#sainewmodulefront");
        let dialog = $("#sainewmodulefront_dialog").addClass("sai_front_dialog");

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

        let res = await this.SaiTools.callApi({
            action: "initClearCache",
            mermaidText: mermaidText,
        });
        
        if (res?.error) {
        	$view.widget.toast({
		    	level: "warning",
		    	content: $T("SAI_ERR_400_CACHE"),
		    	position: "top",
		    	align: "right",
		    	duration: 4000,
		    	undo: false,
		    	pinable: false
		    });
		    // retry after quick timeout
		    
		    let resBis = await this.SaiTools.callApi({ action: "initClearCache", mermaidText: mermaidText });
		    if (resBis?.error) {
		    	$view.widget.toast({
			    	level: "error",
			    	content: $T("SAI_ERR_400_CACHE_BIS"),
			    	position: "top",
			    	align: "right",
			    	duration: 4500,
			    	undo: false,
			    	pinable: false
			    });
			    // if error again then send back to chat ?
			    this.setChatInteraction(); // no historic ...
			    return;
		    }
		    res = resBis;
        }
        
        console.log(res);

        dialog.append(
            $("<span/>")
            .addClass("simai-contextualHelp")
            .text(`${$T("SAI_DATA_GEN")}`)
        );
        // dialog.append(this.SaiTools.getModuleSummary());
        dialog.append(
        	AiJsTools.getDisplayBotMessage(`${$T("SAI_MODULE_RECONNECT")}`)
        );

        let interactiveBox = $("<div/>").addClass("simai-interactiveBox");

        let reconnectButton = $("<button/>").attr("id", "reconnectButton").addClass("actionButton-yellow").text(`${$T("SAI_RECONNECT")}`).on("click", () => {
            $view.showLoading();
            this.SaiTools.replaceLoader($T("SAI_LOADER_RECONNECT"));
            
            this.SaiTools.callApi({
                action: "clearCache"
            }).then(() => {
                
                $view.hideLoading();
                $app.logout(console.log, console.error);
                location.reload();

            });
        });

        interactiveBox.append(reconnectButton);

        dialog.append(interactiveBox);
    }

    async genData(attempt=0) {
    	this.currentState = "dataGeneration";

        $view.showLoading();
        this.SaiTools.replaceLoader($T("SAI_LOADER_DATA_GEN"));
        
        await this.SaiTools.callApi({}, "postClearCache");

        let res;
        if (testWithoutAiCall) {
            let info = await this.SaiTools.getModuleInfo();
            let prefix = info.mPrefix?.toLowerCase();
            let upperPrefix =
                String(prefix).charAt(0).toUpperCase() + String(prefix).slice(1);
            res = {
                [upperPrefix + "Product"]: [{
                        [prefix + "ProPrice"]: 19.99,
                        [prefix + "ProId"]: 1,
                        [prefix + "ProName"]: "Product 1",
                        [prefix + "ProStock_count"]: 100,
                        id: "",
                        [prefix + "ProDescription"]: "This is product 1",
                    },
                    {
                        [prefix + "ProPrice"]: 29.99,
                        [prefix + "ProId"]: 2,
                        [prefix + "ProName"]: "Product 2",
                        [prefix + "ProStock_count"]: 200,
                        id: "",
                        [prefix + "ProDescription"]: "This is product 2",
                    },
                    {
                        [prefix + "ProPrice"]: 39.99,
                        [prefix + "ProId"]: 3,
                        [prefix + "ProName"]: "Product 3",
                        [prefix + "ProStock_count"]: 300,
                        id: "",
                        [prefix + "ProDescription"]: "This is product 3",
                    },
                    {
                        [prefix + "ProPrice"]: 49.99,
                        [prefix + "ProId"]: 4,
                        [prefix + "ProName"]: "Product 4",
                        [prefix + "ProStock_count"]: 400,
                        id: "",
                        [prefix + "ProDescription"]: "This is product 4",
                    },
                    {
                        [prefix + "ProPrice"]: 59.99,
                        [prefix + "ProId"]: 5,
                        [prefix + "ProName"]: "Product 5",
                        [prefix + "ProStock_count"]: 500,
                        id: "",
                        [prefix + "ProDescription"]: "This is product 5",
                    },
                ],
                [upperPrefix + "User"]: [{
                        [prefix + "UsrPassword"]: "password1",
                        [prefix + "UsrAddress"]: "Address 1",
                        [prefix + "UsrId"]: 1,
                        [prefix + "UsrUsername"]: "user1",
                        id: "",
                        [prefix + "UsrEmail"]: "user1@example.com",
                    },
                    {
                        [prefix + "UsrPassword"]: "password2",
                        [prefix + "UsrAddress"]: "Address 2",
                        [prefix + "UsrId"]: 2,
                        [prefix + "UsrUsername"]: "user2",
                        id: "",
                        [prefix + "UsrEmail"]: "user2@example.com",
                    },
                    {
                        [prefix + "UsrPassword"]: "password3",
                        [prefix + "UsrAddress"]: "Address 3",
                        [prefix + "UsrId"]: 3,
                        [prefix + "UsrUsername"]: "user3",
                        id: "",
                        [prefix + "UsrEmail"]: "user3@example.com",
                    },
                    {
                        [prefix + "UsrPassword"]: "password4",
                        [prefix + "UsrAddress"]: "Address 4",
                        [prefix + "UsrId"]: 4,
                        [prefix + "UsrUsername"]: "user4",
                        id: "",
                        [prefix + "UsrEmail"]: "user4@example.com",
                    },
                    {
                        [prefix + "UsrPassword"]: "password5",
                        [prefix + "UsrAddress"]: "Address 5",
                        [prefix + "UsrId"]: 5,
                        [prefix + "UsrUsername"]: "user5",
                        id: "",
                        [prefix + "UsrEmail"]: "user5@example.com",
                    },
                ],
                [upperPrefix + "Order"]: [{
                        [prefix + "OrdTotal_amount"]: 99.99,
                        [prefix + "OrdStatus"]: "P",
                        [prefix + "OrdEr_date"]: "2022-01-01 12:00:00",
                        link: {
                            [upperPrefix + "User"]: "1",
                        },
                        id: "",
                        [prefix + "OrdId"]: 1,
                        [prefix + "OrdUser_id"]: 1,
                    },
                    {
                        [prefix + "OrdTotal_amount"]: 199.99,
                        [prefix + "OrdStatus"]: "S",
                        [prefix + "OrdEr_date"]: "2022-02-01 12:00:00",
                        link: {
                            [upperPrefix + "User"]: "2",
                        },
                        id: "",
                        [prefix + "OrdId"]: 2,
                        [prefix + "OrdUser_id"]: 2,
                    },
                    {
                        [prefix + "OrdTotal_amount"]: 299.99,
                        [prefix + "OrdStatus"]: "C",
                        [prefix + "OrdEr_date"]: "2022-03-01 12:00:00",
                        link: {
                            [upperPrefix + "User"]: "3",
                        },
                        id: "",
                        [prefix + "OrdId"]: 3,
                        [prefix + "OrdUser_id"]: 3,
                    },
                    {
                        [prefix + "OrdTotal_amount"]: 399.99,
                        [prefix + "OrdStatus"]: "P",
                        [prefix + "OrdEr_date"]: "2022-04-01 12:00:00",
                        link: {
                            [upperPrefix + "User"]: "4",
                        },
                        id: "",
                        [prefix + "OrdId"]: 4,
                        [prefix + "OrdUser_id"]: 4,
                    },
                    {
                        [prefix + "OrdTotal_amount"]: 499.99,
                        [prefix + "OrdStatus"]: "S",
                        [prefix + "OrdEr_date"]: "2022-05-01 12:00:00",
                        link: {
                            [upperPrefix + "User"]: "5",
                        },
                        id: "",
                        [prefix + "OrdId"]: 5,
                        [prefix + "OrdUser_id"]: 5,
                    },
                ],
                [upperPrefix + "OrdPro"]: [{
                        link: {
                            [upperPrefix + "Product"]: "1",
                            [upperPrefix + "Order"]: "1",
                        },
                        id: "",
                    },
                    {
                        link: {
                            [upperPrefix + "Product"]: "2",
                            [upperPrefix + "Order"]: "2",
                        },
                        id: "",
                    },
                    {
                        link: {
                            [upperPrefix + "Product"]: "3",
                            [upperPrefix + "Order"]: "3",
                        },
                        id: "",
                    },
                    {
                        link: {
                            [upperPrefix + "Product"]: "4",
                            [upperPrefix + "Order"]: "4",
                        },
                        id: "",
                    },
                    {
                        link: {
                            [upperPrefix + "Product"]: "5",
                            [upperPrefix + "Order"]: "5",
                        },
                        id: "",
                    },
                ],
            };
        } else {
        	// first attempts -> trying with ALL data
        	try {
	            res = await this.SaiTools.callApi({}, "genJsonData");
		        if (res?.error) {
		        	// both 500 & 413 are the same so whatev'
		            $view.widget.toast({
		                level: "warning", // first is only a warning
		                content: $T("SAI_ERR_JSONDATA"),
		                position: "top",
		                align: "right",
		                duration: 4000,
		                undo: false,
		                pinable: false
		            });
		            
		            res = await this.SaiTools.callApi({}, "genJsonData"); // this ain't "less data", yet just retrying ...
		            if (res?.error) {
			        	// both 500 & 413 are the same so whatev'
			            $view.widget.toast({
			                level: "error", // second is an error
			                content: $T("SAI_ERR_JSONDATA_BIS"),
			                position: "top",
			                align: "right",
			                duration: 4500,
			                undo: false,
			                pinable: false
			            });
			            
			            res = {}; // going with absolutely no data ... (no return ?)
		            }
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
        
        $view.hideLoading();
        let listResult = ["datas:", JSON.stringify(res, null, 1), ""];
        if (this.showJson) {
            this.SaiTools.setJsonValidation(() => this.createData(this), listResult,"#sainewmodulefront_dialog");
        } else {
            this.createData(this, listResult[1]);
        }
    }

    async createData(app, jsonValue = {}) {
        let ctn = $("#sainewmodulefront");
        
        let dialog = $("<div/>").attr("id","sainewmodulefront_dialog").addClass("sai_front_dialog");

        dialog.append(
        	$("<div/>")
        		.attr("id", "sai_helpPin")
        		.addClass("simai-safe-navigation")
        		.append(
        			$(`<i class="fas fa-question"></i>`)
        		)
        		.on("click", this.SaiTools.openContactHelpModal)
        );
        
        if (this.showJson) {
            const editor = window.ace.edit("jsonEditor");
            const jsonValue = editor.getValue();
        }
        
        let res;
        try {
	        res = await this.SaiTools.callApi({
	            action: "genDatas",
	            datas: jsonValue
	        });
	        
	        if (res?.error) {
	        	// only 404 possible
	        	$view.widget.toast({
			    	level: "warning",
			    	content: $T("SAI_ERR_404_DATA"),
			    	position: "top",
			    	align: "right",
			    	duration: 4000,
			    	undo: false,
			    	pinable: false
			    });
			    // retry once
				
			    let resBis = await this.SaiTools.callApi({ action: "genDatas", datas: jsonValue });
			    if (resBis?.error) {
			    	$view.widget.toast({
				    	level: "error",
				    	content: $T("SAI_ERR_404_DATA_BIS"),
				    	position: "top",
				    	align: "right",
				    	duration: 4500,
				    	undo: false,
				    	pinable: false
				    });
				    /*
				    	??? what to do here ???
				    */
			    }
			    res = resBis;
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
	        
        	return;
        }
        
        console.log(res);
        dialog.html("");
        dialog.append(`<div id="genData" class="simai-contextualHelp">${$T("SAI_DATA_GENERATED")}</div>`);
        
        dialog.append( AiJsTools.getDisplayBotMessage(`${$T("SAI_BOT_REDIRECT")}`) ); // should have the styles of a bot message...

        let interactiveBox = $("<div/>").addClass("simai-interactiveBox");

        let nextButton = $("<button/>").attr("id", "nextButton").addClass("actionButton-blue").addClass("simai-safe-navigation").text(`${$T("SAI_NEXT")}`).on("click", () => {
            this.redirectToModule();
        });

        interactiveBox.append(nextButton);

        dialog.append(interactiveBox);
        dialog.append(this.SaiTools.createTips($T("SAI_TIP_DATA"))); // needed ?
        ctn.append(dialog);
    }

    async redirectToModule() {
    	await this.SaiTools.callApi({moduleName: this.moduleName}, "endTokensHistory");
        let ctn = $("#sainewmodulefront");
        ctn.html("");
        let res = await this.SaiTools.getRedirectScope();
        let redirect = res.redirect;
        window.location.href = "/ui?" + redirect;
    }
	
	setButtonLoading(buttonSelector, isLoading, originalIcon = "fas fa-arrow-up") {
	    const button = $(buttonSelector);
	    const icon = button.find("i");
	    
	    if (isLoading) {
	        icon.data("original-classes", icon.attr("class"));
	        icon.attr("class", "fas fa-spinner simai-spinner");
	        button.addClass("simai-disabledButton");
	    } else {
	        const originalClasses = icon.data("original-classes") || originalIcon;
	        icon.attr("class", originalClasses);
	        button.removeClass("simai-disabledButton");
	    }
	}
    
   
    autoResizeTextarea(textarea) {
	    textarea.style.height = 'auto';
	    let newHeight = Math.min(textarea.scrollHeight, 120);
	    
	    // account for image container height
	    let imgContainer = $("#input-img");
	    if (imgContainer.is(':visible')) {
	        let imgHeight = imgContainer.outerHeight() || 0;
	        // adjust max height when image is present
	        newHeight = Math.min(textarea.scrollHeight, 120 - Math.min(imgHeight, 40));
	    }
	    
	    newHeight = Math.max(newHeight, 60);
	    
	    textarea.style.height = newHeight + 'px';
	}
	
	async attachExamples(dialogContainer) {
		let exampleList = $("<div/>").attr("id", "sainewmodulefront_examples");
		
		let exampleBO = $app.getBusinessObject("SaiApplicationExample");
		
		let e = await exampleBO.search(list => {
			for (let ex of exampleBO.list) {
				let example = $("<div/>").addClass("simai-example").addClass("collapsed");
				
				let lang = $grant.getLang();
				let title, prompt;
				
				if (lang==="FRA") {
					title = ex.saiSaeTitle;
					prompt = ex.saiSaePrompt;
				} else {
					// using english as default (only ENU or FRA tho)
					title = ex.saiSaeTitleEnglish;
					prompt = ex.saiSaePromptEnglish;
				}
				
				example.append(
					$(`<i class="collapsedIcon fas fa-angle-left"></i>`)
				);
				
				let mainPart = $("<div/>")
					.addClass("simai-example-header")
					.append(
						$("<div/>").addClass("example-title").text(title)
					);
				
				let image = "";
				if (ex.saiSaeImage!=null)
					image = $app.imageURL("SaiApplicationExample","saiSaeImage",ex.row_id,ex.saiSaeImage,false);
					
				let copyBtn = $("<button/>").addClass("example-copy")
					.append(`<i class="fas fa-eye" title="${$T("SAI_TOOLTIP_COPY")}"></i>`)
					.on("click", () => { this.SaiTools.openPromptModal(title,prompt,image) });
				
				let actionBar = $("<div/>").addClass("example-actionbar");
				
				actionBar
					.append(copyBtn);
				
				if (ex.saiSaeImage!=null)
					actionBar.append(`<i style="margin-left:-32px; opacity:0.5" class="fas fa-image" title="${$T("SAI_TOOLTIP_EXAMPLE_IMAGE")}"></i>`)
				
				actionBar
					.append(
						$("<button/>").addClass("actionButton-blue").addClass("simai-safe-navigation").text($T("SAI_USE_EXAMPLE")).on("click", this.SaiTools.applyExamplePrompt(prompt, image))
					);
				
				let toggledPart = $("<div/>")
					.addClass("simai-example-toggle")
					.addClass("untoggled")
					.append(actionBar);
				
				example.append(mainPart).append(toggledPart);
				
				// Replace the animation part with this version:
				let expandTimeout = null;
				let actionBarTimeout = null;
				let collapseTimeout = null;
				let isAnimating = false;
				
				example.on('mouseenter', () => {
				    if (collapseTimeout) {
				        clearTimeout(collapseTimeout);
				        collapseTimeout = null;
				    }
				    
				    if (example.hasClass('collapsed')) {
				        example.removeClass('collapsed').addClass('expanding');
				        
				        setTimeout(() => {
				            if (example.hasClass('expanding')) {
				                example.removeClass('expanding').addClass('expanded');
				            }
				        }, 300);
				    }
				});
				
				example.on('mouseleave', () => {
				    collapseTimeout = setTimeout(() => {
				        if (!example.is(':hover')) {
				            example.removeClass('expanding expanded').addClass('collapsed');
				        }
				        collapseTimeout = null;
				    }, 150);
				});
				
				exampleList.append(example);
			}
			
			dialogContainer.append(exampleList);
			
		}, null, null);
	}
	
	scrollChatToBottom(smooth = true) {
	    const chatContainer = $("#chatContainer")[0];
	    if (chatContainer) {
	        if (smooth) {
	            chatContainer.scrollTo({
	                top: chatContainer.scrollHeight,
	                behavior: 'smooth'
	            });
	        } else {
	            // Instant scroll to bottom
	            chatContainer.scrollTop = chatContainer.scrollHeight;
	        }
	    }
	}
	
	showIntroModal() {
	    $("#simai-introModal").remove();
	    
	    let modalOverlay = $("<div/>")
	        .attr("id", "simai-introModal")
	        .css({
	            position: "fixed",
	            top: 0,
	            left: 0,
	            width: "100%",
	            height: "100%",
	            backgroundColor: "rgba(0, 0, 0, 0.7)",
	            zIndex: 1000,
	            display: "flex",
	            justifyContent: "center",
	            alignItems: "center"
	        });
	    
	    let modalContent = $("<div/>").addClass("simai-intro-modal");
	    
	    let closeButton = $("<button/>")
	        .addClass("simai-modal-close-btn")
	        .html('<i class="fas fa-times"></i>')
	        .on("click", () => modalOverlay.remove());
	    
	    let header = $("<h3/>").html(`
	        <i class="fas fa-magic intro-icon"></i>
	        ${ $T("SAI_INTRO_MODAL_HEADER") }
	    `);
	    
	    let content = $("<div/>").html($T("SAI_INTRO_MODAL"));
	    
	    let modalFooter = $("<div/>").addClass("simai-modal-footer");
	    let startButton = $("<button/>")
	        .text($T("SAI_INTRO_BUTTON"))
	        .addClass("actionButton-blue")
	        .addClass("simai-safe-navigation")
	        .on("click", () => modalOverlay.remove());
	    
	    modalFooter.append(startButton);
	    
	    modalContent
	        .append(closeButton)
	        .append(header)
	        .append(content)
	        .append(modalFooter);
	    
	    modalOverlay.append(modalContent);
	    
	    $("body").append(modalOverlay);
	    
	    modalOverlay.on("click", (e) => {
	        if (e.target === modalOverlay[0]) {
	            modalOverlay.remove();
	        }
	    });
	    
	    $(document).on("keydown.introModal", (e) => {
	        if (e.key === "Escape") {
	            modalOverlay.remove();
	            $(document).off("keydown.introModal");
	        }
	    });
	}
	
	
	
	shouldShowReloadWarning() {
		return ["chatInteraction","jsonValidation","umlGeneration","reconnect","dataGeneration"].includes(this.currentState);
	}
	
	waitForImageLoad() {
	    return new Promise((resolve) => {
	        const checkImage = () => {
	            const img = $("#input-img img");
	            if (img.attr("src")) {
	                resolve();
	            } else {
	                setTimeout(checkImage, 100);
	            }
	        };
	        checkImage();
	    });
	}
	
	showModuleNameModal() {
	    $("#simai-moduleNameModal").remove();
	    
	    let modalOverlay = $("<div/>")
	        .attr("id", "simai-moduleNameModal")
	        .css({
	            position: "fixed",
	            top: 0,
	            left: 0,
	            width: "100%",
	            height: "100%",
	            backgroundColor: "rgba(0, 0, 0, 0.7)",
	            zIndex: 1000,
	            display: "flex",
	            justifyContent: "center",
	            alignItems: "center"
	        });
	    
	    let modalContent = $("<div/>").addClass("simai-help-modal");
	    
	    let closeButton = $("<button/>")
	        .addClass("simai-modal-close-btn")
	        .html('<i class="fas fa-times"></i>')
	        .on("click", () => modalOverlay.remove());
	    
	    let header = $("<h3/>").text(`${$T("SAI_MODULE_NAME")}`);
	    
	    let inputContainer = $("<div/>").css({
	        marginBottom: "16px"
	    });
	    
	    let moduleNameInput = $(`<input type="text" id="modalModuleName" placeholder="${$T("SAI_PH_MODULE")}" />`)
	        .css({
	            width: "100%",
	            padding: "8px",
	            border: "solid 1px #8b8b8b",
	            backgroundColor: "#454545",
	            color: "white",
	            marginBottom: "8px",
	            minLength: "3",
	            maxLength: "50"
	        });
	    
	    inputContainer.append(moduleNameInput);
	    
	    let modalFooter = $("<div/>").addClass("simai-modal-footer");
	    
	    let cancelButton = $("<button/>")
	        .text($T("SAI_CANCEL_BUTTON"))
	        .addClass("actionButton-blue")
	        .css({ marginRight: "8px" })
	        .on("click", () => modalOverlay.remove());
	    
	    let createButton = $("<button/>")
	        .text(`${$T("SAI_CREATE_MODULE")}`)
	        .addClass("actionButton-blue")
	        .addClass("simai-safe-navigation")
	        .on("click", () => this.validateModalModuleName(modalOverlay));
	    
	    modalFooter.append(cancelButton).append(createButton);
	    
	    modalContent
	        .append(closeButton)
	        .append(header)
	        .append(inputContainer)
	        .append(modalFooter);
	    
	    modalOverlay.append(modalContent);
	    
	    $("body").append(modalOverlay);
	    
	    // Focus on input and handle Enter key
	    moduleNameInput.focus();
	    moduleNameInput.on("keypress", (e) => {
	        if (e.which === 13) { // Enter key
	            this.validateModalModuleName(modalOverlay);
	        }
	    });
	    
	    modalOverlay.on("click", (e) => {
	        if (e.target === modalOverlay[0]) {
	            modalOverlay.remove();
	        }
	    });
	    
	    $(document).on("keydown.moduleNameModal", (e) => {
	        if (e.key === "Escape") {
	            modalOverlay.remove();
	            $(document).off("keydown.moduleNameModal");
	        }
	    });
	}
	
	async validateModalModuleName(modalOverlay) {
	    const moduleName = $("#modalModuleName").val();
	    if (moduleName) {
	        let available = await this.SaiTools.isModuleNameAvailable(moduleName);

	        if (available) {
	            this.validatedModuleName = moduleName;
	            modalOverlay.remove();
	            this.createModule(this);
	        } else {
	            $view.widget.toast({
	                level: "error",
	                content: `${$T("SAI_MODULE_NAMEEXIST")}`,
	                position: "top",
	                align: "right",
	                duration: 2500,
	                undo: false,
	                pinable: false,
	            });
	        }
	    } else {
	        $view.widget.toast({
	            level: "error",
	            content: `${$T("SAI_MODULE_NONAME")}`,
	            position: "top",
	            align: "right",
	            duration: 2500,
	            undo: false,
	            pinable: false
	        });
	    }
	}
	
	createTips(tipText="") {
		let tipDiv = $("<div/>").addClass("simai-bottom-tips");
		
		let tipSection = $("<div/>").addClass("tip-section");
		tipSection.append($(tipText)); // passed texts are supposed to be HTML formatted ...
		
		tipDiv.append(tipSection);
		
		return tipDiv;
	}
	
	scrollToLatestUserMessage(smooth = true) {
	    const chatContainer = $("#chatContainer")[0];
	    if (!chatContainer) return;
	    
	    // Find the last user message
	    const userMessages = chatContainer.querySelectorAll('.user-messages');
	    if (userMessages.length === 0) return;
	    
	    const lastUserMessage = userMessages[userMessages.length - 1];
	    
	    // Calculate position relative to chatContainer's scrollable content
	    const containerRect = chatContainer.getBoundingClientRect();
	    const messageRect = lastUserMessage.getBoundingClientRect();
	    
	    // Calculate the scroll position needed to put the user message at the top
	    const currentScrollTop = chatContainer.scrollTop;
	    const messageOffsetFromContainerTop = messageRect.top - containerRect.top;
	    const targetScrollTop = currentScrollTop + messageOffsetFromContainerTop;
	    
	    if (smooth) {
	        chatContainer.scrollTo({
	            top: targetScrollTop,
	            behavior: 'smooth'
	        });
	    } else {
	        chatContainer.scrollTop = targetScrollTop;
	    }
	}
	
	async forcedReloadPage() {
		// here should reload the session ...
		// How to properly do ??
		$view.hideLoading();
		
		// sending back to first step + asking for module deletion 
		await this.SaiTools.deleteModule(this.validatedModuleName); // ask for module deletion
		this.validatedModuleName = "";
		
    	this.setChatInteraction();
    }
    
    activateExamples(bool = true) {
    	if (bool) {
    		$("#exampleHint").removeClass("simai-disabledButton");
    		$("#sainewmodulefront_examples").css("display", "flex");
    	} else {
    		$("#exampleHint").addClass("simai-disabledButton");
    		$("#sainewmodulefront_examples").css("display", "none");
    	}
    }
	
};