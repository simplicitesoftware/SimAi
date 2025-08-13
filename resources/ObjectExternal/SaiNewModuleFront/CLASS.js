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
        this.currentState = 'init';
    }

    async render(params, data = {}) {
    	
        $ui.loadAceEditor(() => {
            console.log("ace editor loaded");
        });
       const app =  this;
	    await $ui.loadScript({
	      url: $ui.getApp().dispositionResourceURL("AiJsTools", "JS"),
	      onload: function () {
	        console.log("AiJsTools loaded");
	      },
	    });
	    
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
                app.setModuleNameForm();
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

        let subCtn = $("<div/>").attr("id", "sainewmodulefront_dialog");
        
        subCtn.append(
        	$("<div/>")
        		.attr("id", "sai_helpPin")
        		.addClass("simai-safe-navigation")
        		.append(
        			$(`<i class="fas fa-question"></i>`)
        		)
        		.on("click", this.openContactHelpModal)
        );

        console.log(this);

        subCtn.append(
            $("<span/>")
            .addClass("simai-contextualHelp")
            .text(`${$T("SAI_MODULE_NAME")}`)
        );

        let interactiveBox = $("<div/>").addClass("simai-interactiveBox");
        interactiveBox.append(
            '<input type="text" id="moduleName" placeholder="Entrez le nom du module" />'
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
    }

    async setChatInteraction() {
	    this.currentState = "chatInteraction";
	    let ctn = $("#sainewmodulefront_dialog");
	    ctn.html("");
	    
	    ctn.append(
	        $("<div/>")
	            .attr("id", "sai_helpPin")
	            .addClass("simai-safe-navigation")
	            .append(
	                $(`<i class="fas fa-question"></i>`)
	            )
	            .on("click", this.openContactHelpModal)
	    );
	    
	    await this.attachExamples(ctn);
	
	    ctn.append(
	        $("<span/>")
	        .addClass("simai-contextualHelp")
	        .text(`${$T("SAI_MODULE_SPEC")}`)
	    );
	    
	    let subCtn = $("<div/>").attr("id", "sainewmodulefront_chatFooter");
	
	    subCtn.append('<div id="chatContainer"></div>');
	    
	    let inputCtn = $('<div class="ai-chat-input-area"></div>');
	    
	    inputCtn.append(
	        '<input type="file" id="input-img-file" accept="image/*" hidden />'
	    );
	    
	    inputCtn.append(
		    `<div id="input-img">
		        <img />
		        <button type="button" class="remove-image-btn" onclick="$('#input-img').hide(); $('#input-img img').removeAttr('src');">
		            <i class="fas fa-trash"></i>
		        </button>
		    </div>`
		);
	
	    let inputRow = $('<div class="input-row"></div>');
	    let messageTextarea = $('<textarea id="message" class="user-message" placeholder="Message" rows="1"></textarea>');
	
	    messageTextarea.on('input', (e) => {
	        this.autoResizeTextarea(e.target);
	    });
	    
	    inputRow.append(messageTextarea);
	    
	    let takePictureButton = $(
	      `<button id="takePicture" class="chatButton">
	        <i class="fas fa-camera"></i>
	      </button>`
	    );
	    takePictureButton.on("click", () => this.takePicture(this));
	    
	    let addImageButton = $(
	      `<button id="addImage" class="chatButton">
	        <i class="fas fa-image"></i>
	      </button>`
	    );
	    addImageButton.on("click", () => this.addImage(this));
	    
	    let sendButton = $(
	      `<button id="sendMessage" class="chatButton" tooltip="Send message">
	        <i class="fas fa-arrow-up"></i>
	      </button>`
	    );
	    sendButton.on("click", () => this.sendMessage(this));
	    
	    inputRow.append(takePictureButton);
	    inputRow.append(addImageButton);
	    inputRow.append(sendButton);
	    
	    inputCtn.append(inputRow);
	    subCtn.append(inputCtn);
	
	    let genButton = $(
	        `<button id="generateModule" class="actionButton-blue simai-disabledButton">${$T(
	            "SAI_GEN_MODULE"
	        )}</button>`
	    );
	    genButton.addClass("simai-safe-navigation").on("click", () => this.createModule(this));
	    subCtn.append(genButton);
	
	    ctn.append(subCtn);
	
	    ctn.find("#chatContainer").append(
	        AiJsTools.getDisplayBotMessage(`${$T("SAI_BOT_MESSAGE")}`)
	    );
	    
	    this.firstMessage = true;
	}

    async validateModuleName(app) {
        const moduleName = $("#moduleName").val();
        if (moduleName) {

            let available = await this.SaiTools.isModuleNameAvailable(moduleName);

            if (available) {
                this.validatedModuleName = moduleName;
                app.setChatInteraction();
            } else {
                $ui.toast({
                    type: "error",
                    content: `${$T("SAI_MODULE_NAMEEXIST")}`,
                    position: "top",
                    align: "center",
                    undo: false,
                    moveable: false
                });
            }
        } else {
            $ui.toast({
                type: "error",
                content: `${$T("SAI_MODULE_NONAME")}`,
                position: "top",
                align: "center",
                undo: false,
                moveable: false
            });
        }
    }

    async setJsonValidation(onValidate, listResult) {
    	this.currentState = "jsonValidation";
        console.log("setJsonValidation", listResult);

        let ctn = $("#sainewmodulefront");
        let dialog = $("#sainewmodulefront_dialog");

        dialog.html("");
        
        dialog.append(
        	$("<div/>")
        		.attr("id", "sai_helpPin")
        		.addClass("simai-safe-navigation")
        		.append(
        			$(`<i class="fas fa-question"></i>`)
        		)
        		.on("click", this.openContactHelpModal)
        );

        let json1 = $("<div/>").addClass("bot-message").append(
            AiJsTools.getDisplayBotMessage(`${listResult[0]}`)
        );
        let json2 = $("<div/>").addClass("bot-message").append(
            AiJsTools.getDisplayBotMessage(`${listResult[2]}`)
        );

        dialog
            .append(json1)
            .append('<div class="aceeditor" id="jsonEditor">' + listResult[1] + "</div>")
            .append(json2);

        const editor = window.ace.edit("jsonEditor");
        editor.setTheme("ace/theme/monokai"); // Choisissez le thème que vous préférez
        editor.session.setMode("ace/mode/json"); // Définit le mode JSON
        editor.setValue(listResult[1], -1); // Définit le contenu de l'éditeur
        editor.container.style.width = "100vw";
        editor.container.style.maxWidth = "580px";
        editor.container.style.minWidth = "300px";
        editor.container.style.height = "100vh";
        editor.container.style.maxHeight = "400px";
        editor.container.style.alignSelf = "flex-start";
        editor.container.style.margin = "6px 0px";

        let buttonValidate = $(
            `<button id="validateJson" class="actionButton-blue">${$T(
        "SAI_VALIDATE"
      )}</button>`
        );
        buttonValidate.addClass("simai-safe-navigation").on("click", onValidate);

        let actionFooter = $("<div/>").addClass("simai-interactiveBox");
        actionFooter.append(buttonValidate);

        dialog.append(actionFooter);
    }
    
    async addImage() {
    	this.setButtonLoading("#addImage", true, "fas fa-cog");
	    $("#takePicture").addClass("simai-disabledButton");
	    $("#sendMessage").addClass("simai-disabledButton");
	    
	    try {
	        // Create custom file input instead of using AiJsTools.addImage()
	        let input = document.createElement('input');
	        input.type = 'file';
	        input.accept = 'image/jpeg, image/png';
	        
	        input.onchange = (event) => {
	            let file = event.target.files[0];
	            if (file) {
	                let reader = new FileReader();
	                reader.onload = (event) => {
	                    let image_base64 = event.target.result;
	                    // Update your specific DOM structure
	                    $("#input-img img").attr("src", image_base64);
	                    $("#input-img").show();
	                    $("#input-img").css("display", "block"); // force visibility
	                    
	                    // Use your own auto-resize instead of AiJsTools.resizeUp
	                    this.autoResizeTextarea(document.getElementById('message'));
	                    this.scrollChatToBottom();
	                };
	                reader.readAsDataURL(file);
	            }
	        };
	        
	        input.click();
	        
	    } finally {
	        this.setButtonLoading("#addImage", false, "fas fa-image");
	        $("#takePicture").removeClass("simai-disabledButton");
	        $("#sendMessage").removeClass("simai-disabledButton");
	    }
    }
    
    async takePicture() {
    	this.setButtonLoading("#takePicture", true, "fas fa-cog");
	    $("#addImage").addClass("simai-disabledButton");
	    $("#sendMessage").addClass("simai-disabledButton");
	    
	    try {
	        // Use $view.widget.takePicture directly instead of AiJsTools.takeImage()
	        let image_base64 = await $view.widget.takePicture({
	            title: $T('TAKE_PICT'), 
	            facingMode: "environment"
	        });
	        
	        if (image_base64) {
	            // Update your specific DOM structure
	            $("#input-img img").attr("src", image_base64);
	            $("#input-img").show();
	            
	            // Use your own auto-resize instead of AiJsTools.resizeUp
	            this.autoResizeTextarea(document.getElementById('message'));
	            this.scrollChatToBottom();
	        }
	        
	    } finally {
	        this.setButtonLoading("#takePicture", false, "fas fa-camera");
	        $("#addImage").removeClass("simai-disabledButton");
	        $("#sendMessage").removeClass("simai-disabledButton");
	    }
    }
    
    async speechToText() {
    	// TODO : inspire from the module process for this one
    	console.log("<Speech to Text> feature not implemented yet");
    }

    async sendMessage() {
        let ctn = $("#sainewmodulefront");

        if (ctn.find("#message").val().trim() === "") {
            $ui.toast({
                type: "warning",
                content: `${$T("SAI_EMPTY_MESSAGE")}`,
                position: "top",
                align: "center",
                undo: false,
                moveable: false
            });
            return;
        }

        if (testWithoutAiCall) {
            ctn.find("#chatContainer").append(AiJsTools.getDisplayUserMessage(ctn));
            this.scrollChatToBottom();
            
            ctn
                .find("#chatContainer")
                .append(
                    AiJsTools.getDisplayBotMessage("Ai call inib for test purpose")
                );
            
            this.scrollChatToBottom();
            
            // AiJsTools.resetInput($(".ai-chat-input-area")[0]);
            // custom reset
            ctn.find("#message").val("");
			$("#input-img").hide();
			$("#input-img img").removeAttr("src");
			this.autoResizeTextarea(document.getElementById('message'));

			this.setButtonLoading("#sendMessage", true, "fas fa-cog");
			
            $("#generateModule").addClass("simai-disabledButton");
            $("#takePicture").addClass("simai-disabledButton");
        	$("#addImage").addClass("simai-disabledButton");

            setTimeout(() => {
            	this.setButtonLoading("#sendMessage", false, "fas fa-cog");
            	$("#takePicture").removeClass("simai-disabledButton");
        		$("#addImage").removeClass("simai-disabledButton");
                $("#generateModule").removeClass("simai-disabledButton");
                
                if (this.firstMessage) {
		        	ctn.find("#chatContainer").append(
			            AiJsTools.getDisplayBotMessage(`${$T("SAI_BOT_MESSAGE_BIS")}`)
			        );
			        
			        this.scrollChatToBottom();
			        this.firstMessage = false;
		        }
            }, 2000);
	        
	        this.autoResizeTextarea(document.getElementById('message'));
	        
            return;
        }

        const message = $("#message").val();
        let params = AiJsTools.getPostParams(ctn, AiJsTools.chatUmlSpecialisation);

        ctn.find("#chatContainer").append(AiJsTools.getDisplayUserMessage(ctn));
        this.scrollChatToBottom();
        
        ctn.find("#chatContainer").append(AiJsTools.getDisplayBotMessage());
        this.scrollChatToBottom();
        
        ctn.find("#message").val("");

		this.setButtonLoading("#sendMessage", true, "fas fa-cog");
        $("#takePicture").addClass("simai-disabledButton");
        $("#addImage").addClass("simai-disabledButton");
        $("#generateModule").addClass("simai-disabledButton");

        let res = await this.SaiTools.callApi(params, "chat");
        
        if (res?.error) {
            ctn.find('#chatContainer').append("an error occured: " + AiJsTools.getDisplayBotMessage(res?.error)); // keep this in any case
            
            switch (res.error[0]) {
            	case 400:
            		$ui.toast({ // warning toast
		                type: "warning",
		                content: $T("SAI_ERR_400_CHAT"),
		                position: "top",
		                align: "center",
		                undo: false,
		                moveable: false
		            });
		            ctn.find("#message").val(message); // putting back message
		        	// then will face the return, so possible to retry
            		break;
            	case 513:
            		$ui.toast({ // error toast
		                type: "error",
		                content: $T("SAI_ERR_503_CHAT"),
		                position: "top",
		                align: "center",
		                undo: false,
		                moveable: false
		            });
		            this.redirectToErrorPage(); // redirect to dead-end page (back to website at least ?)
            		break;
            	// no default.
            }
            
            return;
        }
        
        // await shall block until having a valid response ...
        this.setButtonLoading("#sendMessage", false, "fas fa-cog");
        $("#takePicture").removeClass("simai-disabledButton");
        $("#addImage").removeClass("simai-disabledButton");
        $("#generateModule").removeClass("simai-disabledButton");

        let response = $view
            .markdownToHTML(res?.choices[0]?.message?.content)
            .html();
        $(".bot-messages:last-child span").html(response);
        
        this.autoResizeTextarea(document.getElementById('message'));
        
        if (this.firstMessage) {
        	ctn.find("#chatContainer").append(
	            AiJsTools.getDisplayBotMessage(`${$T("SAI_BOT_MESSAGE_BIS")}`)
	        );
	        
	        this.scrollChatToBottom();
	        this.firstMessage = false;
        }
    }

    async createModule(app) {
        const moduleInfo = await this.SaiTools.callApi({
            action: "create",
            login: $grant.getLogin(),
            moduleName: this.validatedModuleName,
        });
        console.log(moduleInfo);
        if (moduleInfo?.error) {
            $ui.toast({
                type: "error",
                content: $T("SAI_ERR_CREATE"),
                position: "top",
                align: "center",
                undo: false,
                moveable: false
            });
            
            this.setModuleNameForm(); // nothing else to do ...
        } else {
            app.generateModule(app);
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
        let res = await this.SaiTools.callApi(params, "genJson");

        if (res?.error) {
            switch (res.error[0]) {
            	case 500:
            		$ui.toast({
		                type: "error",
		                content: $T("SAI_ERR_500_JSON"),
		                position: "top",
		                align: "center",
		                undo: false,
		                moveable: false
		            });
		            // back to chat (no historic ?)
		            this.setChatInteraction();
            		break;
            	case 503:
            		$ui.toast({
		                type: "error",
		                content: $T("SAI_ERR_503_JSON"),
		                position: "top",
		                align: "center",
		                undo: false,
		                moveable: false
		            });
		            let resDel = await this.SaiTools.deleteModule(this.validatedModuleName); // ask for module deletion
		            // if error (404|500) then rename module to random name ??
		            this.validatedModuleName = "";
		            this.setModuleNameForm(); // back to start
            		break;
            	// no default
            }
            return;
        }
        $view.hideLoading();
        if (this.showJson) {
            app.setJsonValidation(() => app.prepareJson(app), res);
        } else {
            app.prepareJson(app, res[1]);
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
            //ctn.html('');
            let res = await this.SaiTools.callApi({
                action: "prepareJson",
                json: jsonValue,
            });
            
            if (res?.error) {
            	// only 404 is possible there
            	$ui.toast({
	                type: "warning",
	                content: $T("SAI_ERR_404_JSON"),
	                position: "top",
	                align: "center",
	                undo: false,
	                moveable: false
	            });
	            // retry quickly
	            let resBis = await this.SaiTools.callApi({ action: "prepareJson", json: jsonValue });
	        	if (resBis?.error) {
	        		// same but don't retry -> back to home ?
	        		$ui.toast({
		                type: "error",
		                content: $T("SAI_ERR_404_JSON_BIS"),
		                position: "top",
		                align: "center",
		                undo: false,
		                moveable: false
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
	        $ui.toast({
	            type: "error",
	            content: $T("SAI_ERR_JSON"),
	            position: "top",
	            align: "center",
	            undo: false,
	            moveable: false
	        });
	        // exit only ?? sending back to chat (no historic) ??
	        this.setChatInteraction();
	        return;
        }
    }

    async createObjs(app, objects) {
    	this.currentState = "umlGeneration";
        let ctn = $("#sainewmodulefront");
        let dialog = $("#sainewmodulefront_dialog");

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
        		.on("click", this.openContactHelpModal)
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
        }

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
    }

    async clearCache(mermaidText) {
    	this.currentState = "reconnect"; // is that it ??
        let ctn = $("#sainewmodulefront");
        let dialog = $("#sainewmodulefront_dialog");

        dialog.html("");
        
        dialog.append(
        	$("<div/>")
        		.attr("id", "sai_helpPin")
        		.addClass("simai-safe-navigation")
        		.append(
        			$(`<i class="fas fa-question"></i>`)
        		)
        		.on("click", this.openContactHelpModal)
        );

        let res = await this.SaiTools.callApi({
            action: "initClearCache",
            mermaidText: mermaidText,
        });
        
        if (res?.error) {
        	$ui.toast({
		    	type: "warning",
		    	content: $T("SAI_ERR_400_CACHE"),
		    	position: "top",
		    	align: "center",
		    	undo: false,
		    	moveable: false
		    });
		    // retry after quick timeout
		    
		    let resBis = await this.SaiTools.callApi({ action: "initClearCache", mermaidText: mermaidText });
		    if (resBis?.error) {
		    	$ui.toast({
			    	type: "error",
			    	content: $T("SAI_ERR_400_CACHE_BIS"),
			    	position: "top",
			    	align: "center",
			    	undo: false,
			    	moveable: false
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

        dialog.append(this.getModuleSummary());

        let interactiveBox = $("<div/>").addClass("simai-interactiveBox");

        let reconnectButton = $("<button/>").attr("id", "reconnectButton").addClass("actionButton-yellow").text(`${$T("SAI_RECONNECT")}`).on("click", () => {
            $view.showLoading();
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
        let ctn = $("#sainewmodulefront");
        ctn.html("");

        let dialog = $("<div/>").attr("id", "sainewmodulefront_dialog");
        
        dialog.append(
        	$("<div/>")
        		.attr("id", "sai_helpPin")
        		.addClass("simai-safe-navigation")
        		.append(
        			$(`<i class="fas fa-question"></i>`)
        		)
        		.on("click", this.openContactHelpModal)
        );
        
        dialog.append(`<div id="genData">${$T("SAI_DATA_GENERATING")}</div>`);

        ctn.append(dialog);

        $view.showLoading();
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
            res = await this.SaiTools.callApi({}, "genJsonData");
	        if (res?.error) {
	        	// both 500 & 413 are the same so whatev'
	            $ui.toast({
	                type: "warning", // first is only a warning
	                content: $T("SAI_ERR_JSONDATA"),
	                position: "top",
	                align: "center",
	                undo: false,
	                moveable: false
	            });
	            
	            res = await this.SaiTools.callApi({}, "genJsonData"); // this ain't "less data", yet just retrying ...
	            if (res?.error) {
		        	// both 500 & 413 are the same so whatev'
		            $ui.toast({
		                type: "warning", // second is an error
		                content: $T("SAI_ERR_JSONDATA_BIS"),
		                position: "top",
		                align: "center",
		                undo: false,
		                moveable: false
		            });
		            
		            res = {}; // going with absolutely no data ... (no return ?)
	            }
	        }
        }
        
        $view.hideLoading();
        let listResult = ["datas:", JSON.stringify(res, null, 1), ""];
        if (this.showJson) {
            this.setJsonValidation(() => this.createData(this), listResult);
        } else {
            this.createData(this, listResult[1]);
        }
    }

    async createData(app, jsonValue = {}) {
        let ctn = $("#sainewmodulefront");
        let dialog = $("#sainewmodulefront_dialog");
        
        dialog.append(
        	$("<div/>")
        		.attr("id", "sai_helpPin")
        		.addClass("simai-safe-navigation")
        		.append(
        			$(`<i class="fas fa-question"></i>`)
        		)
        		.on("click", this.openContactHelpModal)
        );
        
        if (this.showJson) {
            const editor = window.ace.edit("jsonEditor");
            const jsonValue = editor.getValue();
        }
        let res = await this.SaiTools.callApi({
            action: "genDatas",
            datas: jsonValue
        });
        
        if (res?.error) {
        	// only 404 possible
        	$ui.toast({
		    	type: "warning",
		    	content: $T("SAI_ERR_404_DATA"),
		    	position: "top",
		    	align: "center",
		    	undo: false,
		    	moveable: false
		    });
		    // retry once
		    let resBis = await this.SaiTools.callApi({ action: "genDatas", datas: jsonValue });
		    if (resBis?.error) {
		    	$ui.toast({
			    	type: "error",
			    	content: $T("SAI_ERR_404_DATA_BIS"),
			    	position: "top",
			    	align: "center",
			    	undo: false,
			    	moveable: false
			    });
			    /*
			    	??? what to do here ???
			    */
		    }
		    res = resBis;
        }
        
        console.log(res);
        dialog.html("");
        dialog.append(`<div id="genData" class="simai-contextualHelp">${$T("SAI_DATA_GENERATED")}</div>`);

        let interactiveBox = $("<div/>").addClass("simai-interactiveBox");

        let nextButton = $("<button/>").attr("id", "nextButton").addClass("actionButton-blue").addClass("simai-safe-navigation").text(`${$T("SAI_NEXT")}`).on("click", () => {
            this.redirectToModule();
        });

        interactiveBox.append(nextButton);

        dialog.append(interactiveBox);
    }

    async redirectToModule() {
        let ctn = $("#sainewmodulefront");
        ctn.html("");
        let res = await this.SaiTools.getRedirectScope();
        let redirect = res.redirect;
        window.location.href = "/ui?" + redirect;
    }

    getModuleSummary() { // Is this really useful ???
    	
        let summary = $("<div/>").attr("id", "simai-moduleSummary");

        summary.append($("<p/>").addClass("simai-reconnectWarning").text(`${$T("SAI_MODULE_RECONNECT")}`));

        return summary;
    }
    
    applyExamplePrompt(prompt) {
	    return () => { // Return function to be used as event handler
	        $("#message").val(prompt);
	        
	        this.autoResizeTextarea(document.getElementById('message'));
	        
	        $("#message").focus();
	    };
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
    
    openContactHelpModal() {
	    $("#simai-helpModal").remove();
	    
	    let modalOverlay = $("<div/>")
	        .attr("id", "simai-helpModal")
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
	    
	    let header = $("<h3/>").text($grant.getLang()==="FRA" ? "Besoin d'aide ?" : "Need Help?");
	    
	    let content = $("<div/>").html($T("SAI_HELP_MODAL"));
	    
	    let modalFooter = $("<div/>").addClass("simai-modal-footer");
	    let closeButtonBottom = $("<button/>")
	        .text($T("SAI_HELP_BUTTON"))
	        .addClass("actionButton-blue")
	        .addClass("simai-safe-navigation")
	        .on("click", () => modalOverlay.remove());
	    
	    modalFooter.append(closeButtonBottom);
	    
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
	    
	    $(document).on("keydown.helpModal", (e) => {
	        if (e.key === "Escape") {
	            modalOverlay.remove();
	            $(document).off("keydown.helpModal");
	        }
	    });
	}
    autoResizeTextarea(textarea) {
	    // textarea.style.height = 'auto';
	    // textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
	    textarea.style.height = 'auto';
	    let newHeight = Math.min(textarea.scrollHeight, 120);
	    
	    // account for image container height
	    let imgContainer = $("#input-img");
	    if (imgContainer.is(':visible')) {
	        let imgHeight = imgContainer.outerHeight() || 0;
	        // adjust max height when image is present
	        newHeight = Math.min(textarea.scrollHeight, 120 - Math.min(imgHeight, 40));
	    }
	    
	    textarea.style.height = newHeight + 'px';
	}
	
	async attachExamples(dialogContainer) {
		let exampleList = $("<div/>").attr("id", "sainewmodulefront_examples");
		
		
		let exampleBO = $app.getBusinessObject("SaiApplicationExample");
		
		let e = await exampleBO.search(list => {
			for (let ex of exampleBO.list) {
				let example = $("<div/>").addClass("simai-example").addClass("collapsed");
				
				let lang = $grant.getLang();
				let title, prompt, summary;
				
				if (lang==="FRA") {
					title = ex.saiSaeTitle;
					prompt = ex.saiSaePrompt;
					summary = ex.saiSaeSummary;
				} else {
					// using english as default (only ENU or FRA tho)
					title = ex.saiSaeTitleEnglish;
					prompt = ex.saiSaePromptEnglish;
					summary = ex.saiSaeSummaryEnglish;
				}
				
				example.append(
					$(`<i class="collapsedIcon fas fa-arrow-left"></i>`)
				);
				
				let mainPart = $("<div/>")
					.addClass("simai-example-header")
					.append(
						$("<div/>").addClass("example-title").text(title)
					)
					.append(
						$("<button/>")/*.addClass("example-button")*/.addClass("actionButton-blue").addClass("simai-safe-navigation").text($T("SAI_USE_EXAMPLE")).on("click", this.applyExamplePrompt(prompt))
					);
				
				let toggledPart = $("<div/>")
					.addClass("simai-example-toggle")
					.addClass("untoggled")
					.text(summary);
				
				example.append(mainPart).append(toggledPart);
				
				let collapseTimeout = null;
	
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
				        }, 500);
				    }
				});
				
				example.on('mouseleave', () => {
				    collapseTimeout = setTimeout(() => {
				        example.addClass('collapsed').removeClass('expanding expanded');
				        collapseTimeout = null;
				    }, 200);
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
	        ${$grant.getLang()==="FRA" ? "Bienvenu dans l'assistant IA de Simplicité" : "Welcome to Simplicité's AI Assistant"}
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
	
	redirectToErrorPage() {
		// TODO : implement a nice looking error page saying the problem cannot be overcome right now but we're working on it !
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
};