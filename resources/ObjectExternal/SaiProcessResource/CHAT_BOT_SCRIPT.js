
var AIWfChatBot = AIWfChatBot || (function() {
	const app = $ui.getApp();
	// Params
	let useAsync = true; // use async callback pattern
	let url = Simplicite.ROOT+"/ext/AIRestAPI"; // authenticated webservice
	//chat options
	let addImgVisible = true;
	let takeImgVisible = true;
	let SpeechVisible = true;
	let maxbodyH=null;
	function resizeUp(){
		if(!AiJsTools.hasOwnProperty("resizeUp")){
			console.log("load AiJsTools");
			$ui.loadScript({url: $ui.getApp().dispositionResourceURL("AiJsTools", "JS"),onload: function(){ 
				AiJsTools.resizeUp($(".ai-chat-input-area"),$("#module_chat_messages"),maxbodyH);}
			});
		}else{
			console.log("resizeUp");
			AiJsTools.resizeUp($(".ai-chat-input-area"),$("#module_chat_messages"),maxbodyH);
		}
	}
	function render() {
		console.log("render");
		let actionBtn = $('.btn-validate');
		actionBtn.attr("disabled", "disabled");


		let ctn = document.getElementById('AIchatbotProcess');
		$(window).resize(function() {
			resizeUp();
		});
		maxbodyH = $('#AIchatbotProcess').parent().height();
		$ui.loadScript({url: $ui.getApp().dispositionResourceURL("AiJsTools", "JS"),onload: function(){ 
			AiJsTools.addChatOption(ctn.querySelector('.ai-user-input'),addImgVisible,takeImgVisible,SpeechVisible);
			let msgs = $('#module_chat_messages');
			let initMsg;
			if(msgs.length == 0){
				initMsg = AiJsTools.getDisplayBotMessage($T("AI_CHAT_HELLO"));
			}else{
				initMsg = AiJsTools.getDisplayBotMessage($T("AI_CHAT_RESUME_MODULE"));
			}
			initMsg.className = "bot-first-messages";
			msgs.append(initMsg);
			
			
		}});
	}
	function sendModuleMessage() {
		let userMessage = document.getElementById('module_user_message').value;
		let userImage = $("#input-img img").attr("src");
		let chatMessages = document.getElementById('module_chat_messages');
		let historic = [];
		if ($("#context").length >0) {
			let text = {};
			text.role = "assistant";
			text.content = $("#context").text();
			historic.push(JSON.stringify(text));
		}

		$(".user-messages").each(function() {
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
		chatMessages.append(AiJsTools.getDisplayUserMessage($("#AIchatbotProcess")));
		chatMessages.append(AiJsTools.getDisplayBotMessage());
		$("#send-button").attr("disabled", "disabled");
		
		let prompt =[];
		prompt.push({"type":"text","text":userMessage});
		if(userImage){
			prompt.push({"type":"image_url","image_url":{"url":userImage}});
		}
		let postParams = {prompt:JSON.stringify(prompt), specialisation: "You help design uml for object-oriented applications. Without function and whith relation description. Respond with a text", historic: JSON.stringify(historic)}; // post params
		
		// Efface le champ de saisie utilisateur
		document.getElementById('module_user_message').value = '';
		$("#input-img img").removeAttr("src");
		$("#input-img").hide();
		resizeUp();

		// Faites défiler vers le bas pour afficher les messages les plus récents
		chatMessages.scrollTop = chatMessages.scrollHeight;
		$('.btn-validate').attr("disabled", "disabled");
		// Call Webservice (POST requests only)
		app._call(useAsync, url, postParams, function callback(botResponse){
			let text ={};
			text.role = "user";
			text.content = userMessage;
			historic.push(JSON.stringify(text));
			if(!(botResponse.hasOwnProperty('type') && botResponse.type == 'error')){
				let result = botResponse.response.choices[0].message.content;
				result = $view.markdownToHTML(result).html();
				$(".bot-messages:last-child span").html(result);
				
				text={};
				text.role = "assistant";
				text.content =result;
				historic.push(JSON.stringify(text));
				
				
			}else{
				$(".bot-messages:last-child span").text("Sorry, an error occurred");
				
				text={};
				text.role = "assistant";
				text.content ="Sorry, an error occurred";
				historic.push(JSON.stringify(text));
			}
			$("#AI_data").html(JSON.stringify(historic));
			$("#send-button").removeAttr("disabled");
			$('.btn-validate').removeAttr('disabled', true);
			chatMessages.scrollTop = chatMessages.scrollHeight;
		});
		
	}
	
	return {
		sendModuleMessage: sendModuleMessage,
		render: render,
		resizeUp: resizeUp
	};
})();
$(document).ready(function() {
	AIWfChatBot.render();
	
});