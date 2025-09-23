class  SaiTools {
	constructor(data) {
		this.externalObject = 'SaiCreateModuleApi';
		this.modulesApi = 'SaiModulesApi';
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
	getModuleSummary() { // Is this really useful ???
    	
        let summary = $("<div/>").attr("id", "simai-moduleSummary");

        summary.append($("<p/>").addClass("simai-reconnectWarning").text(`${$T("SAI_MODULE_RECONNECT")}`));

        return summary;
    }
	replaceLoader(msg = "") {
		let loaderBody = $(".waitdlg .waitbody");
		
		loaderBody.html("");
		
		let customLoader = $("<div/>").addClass("custom-loader");
		customLoader
			.append(
				$("<div/>").addClass("custom-loader-line")
			)
			.append(
				$("<div/>").addClass("custom-loader-line")
			)
			.append(
				$("<div/>").addClass("custom-loader-line")
			)
			.append(
				$("<div/>").addClass("custom-loader-line")
			)
			.append(
				$("<div/>").addClass("custom-loader-line")
			)
			.append(
				$("<div/>").addClass("custom-loader-line")
			)
			.append(
				$("<div/>").addClass("custom-loader-line")
			)
			.append(
				$("<div/>").addClass("custom-loader-line")
			);
		
		let message = $("<div/>").addClass("custom-loader-text").text(msg);
		
		loaderBody.append(customLoader);
		loaderBody.append(message);
	}
	createTips(tipText="") {
		let tipDiv = $("<div/>").addClass("simai-bottom-tips");
		
		let tipSection = $("<div/>").addClass("tip-section");
		tipSection.append($(tipText)); // passed texts are supposed to be HTML formatted ...
		
		tipDiv.append(tipSection);
		
		return tipDiv;
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
	redirectToErrorPage() {
		
		let url = $app.getExternalObjectURL("SaiErrorPage",{},true);
		
		$ui.loadURL(null,url);
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
	    
	    let header = $("<h3/>").text( $T("SAI_HELP_MODAL_HEADER"));
	    
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
	async takePicture() {
	    this.setButtonLoading("#takePicture", true, "fas fa-cog");
	    $("#addImage").addClass("simai-disabledButton");
	    $("#sendMessage").addClass("simai-disabledButton");
	    $("#speechToText").addClass("simai-disabledButton");
	    $("#exampleHint").addClass("simai-disabledButton");
	    
	    try {
	        const timeoutPromise = new Promise((_, reject) => {
	            setTimeout(() => {
	                reject(new Error('CAMERA_TIMEOUT'));
	            }, 5000); // 5s timeout
	        });
	        const image_base64 = await Promise.race([
	            $view.widget.takePicture({
	                title: $T('TAKE_PICT'), 
	                facingMode: "environment"
	            }),
	            timeoutPromise
	        ]);
	        
	        if (image_base64) {
	            console.log("-> IMAGE_BASE64");
	            $("#input-img img").attr("src", image_base64);
	            $("#input-img").show();
	            $("#input-img").css("display", "block");
	            
	            this.autoResizeTextarea(document.getElementById('message'));
	            this.scrollChatToBottom();
	        }
	        
	    } catch (e) {
	        console.log("CATCH", e.message);
	        
	        if (e.message === 'CAMERA_TIMEOUT') {
	            console.log("Camera dialog was likely closed by user");
	        } else {
	            $view.widget.toast({
	                level: "info",
	                content: `${$T("SAI_NO_CAMERA")}`,
	                position: "top",
	                align: "right",
	                duration: 3000,
	                undo: false,
	                pinable: false
	            });
	        }
	    } finally {
	        this.setButtonLoading("#takePicture", false, "fas fa-camera");
	        $("#addImage").removeClass("simai-disabledButton");
	        $("#sendMessage").removeClass("simai-disabledButton");
	        $("#speechToText").removeClass("simai-disabledButton");
	        $("#exampleHint").removeClass("simai-disabledButton");
	    }
	}
	async addImage() {
    	this.setButtonLoading("#addImage", true, "fas fa-cog");
	    $("#takePicture").addClass("simai-disabledButton");
	    $("#sendMessage").addClass("simai-disabledButton");
	    $("#speechToText").addClass("simai-disabledButton");
	    $("#exampleHint").addClass("simai-disabledButton");
	    
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
	                    // this.scrollChatToBottom(); // no need for scroll anymore ?
	                };
	                reader.readAsDataURL(file);
	            }
	        };
	        
	        input.click();
	        
	    } catch(e) {
	    	$view.widget.toast({
	    		level: "info",
                content: `${$T("SAI_PICTURE_ERROR")}`,
                position: "top",
                align: "right",
                duration: 3000,
                undo: false,
                pinable: false
	    	});
	    } finally {
	        this.setButtonLoading("#addImage", false, "fas fa-image");
	        $("#takePicture").removeClass("simai-disabledButton");
	        $("#sendMessage").removeClass("simai-disabledButton");
	        $("#speechToText").removeClass("simai-disabledButton");
	        $("#exampleHint").removeClass("simai-disabledButton");
	        $("#generateModule").addClass("simai-disabledButton");
	    }
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
	async getModuleObjects(module = ""){
		const response =this.app.getExternalObject(this.externalObject).invoke(null,null,{'method':'GET','path':'getModuleObjects/' + module,'accept':'application/json'});
		const res = await response;
		return res;
	}
	async getModuleDesc(objs = "", module = ""){
		const response =this.app.getExternalObject(this.externalObject).invoke(null,JSON.stringify({objs:objs}),{'method':'POST','path':'getModuleDesc/' + module,'accept':'application/json','contentType':'application/json'});
		const res = await response;
		return res;
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
	async  getHistoric(ctn,initialDesc = ""){
		let historic = [];
		if(initialDesc){
			let text ={};
			text.role = "assistant";
			text.content = initialDesc;
			historic.push(JSON.stringify(text));
		}
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
	async setJsonValidation(onValidate, listResult,ctn = "") {
    	this.currentState = "jsonValidation";
        console.log("setJsonValidation", listResult);

        let dialog = $(ctn);

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
	async getTokensHistory(moduleName = ""){
	    const response =this.app.getExternalObject(this.modulesApi).invoke(null,null,{'method':'GET','path':'getTokensHistory/' + moduleName,'accept':'application/json'});
	    const res = await response;
	    return res;
	}
}
