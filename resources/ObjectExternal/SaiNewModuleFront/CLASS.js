const testWithoutAiCall = $grant.sysparams.SAI_TEST_INIB_AI_CALL == 'true';
Simplicite.UI.ExternalObjects.SaiNewModuleFront = class extends(
    Simplicite.UI.ExternalObject
) {
    constructor() {
        super();
        this.validatedModuleName = null;
        this.moduleObjects = [];
        this.showJson = $grant.sysparams.SAI_SHOW_JSON == 'true';

    }

    async render(params, data = {}) {

        $("#menu").hide();
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
                // app.setChatInteraction();
                app.setModuleNameForm(); // keep this part as first step
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
        let ctn = $("#sainewmodulefront");

        let subCtn = $("<div/>").attr("id", "sainewmodulefront_dialog");

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

        createButton.on("click", () => this.validateModuleName(this));
        interactiveBox.append(createButton);

        subCtn.append(interactiveBox);
        $(ctn).append(subCtn);
    }

    async setChatInteraction() {
        let ctn = $("#sainewmodulefront_dialog"); // #sainnewmodulefront
        ctn.html("");

        ctn.append(
            $("<span/>")
            .addClass("simai-contextualHelp")
            .text(`${$T("SAI_MODULE_SPEC")}`)
        );
        let subCtn = $("<div/>").attr("id", "sainewmodulefront_chatFooter");

        subCtn.append('<div id="chatContainer"></div>');
        let inputCtn = $('<div class="ai-chat-input-area"></div>');
        inputCtn.append(
            '<input type="file" id="input-img" accept="image/*" hidden />'
        );
        inputCtn.append(
            '<input type="text" id="message" class="user-message" placeholder="Message" />'
        );
        let sendButton = $(
            `<button id="sendMessage" class="actionButton-green">${$T(
        "SAI_SEND"
      )}</button>`
        );
        sendButton.on("click", this.sendMessage);
        inputCtn.append(sendButton);
        subCtn.append(inputCtn);

        let genButton = $(
            `<button id="generateModule" class="actionButton-blue simai-disabledButton">${$T(
        "SAI_GEN_MODULE"
      )}</button>`
        );
        genButton.on("click", () => this.createModule(this));
        subCtn.append(genButton);

        ctn.append(subCtn);

        ctn.find("#chatContainer").append(
            AiJsTools.getDisplayBotMessage(`${$T("SAI_BOT_MESSAGE")}`)
        );
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
        console.log("setJsonValidation", listResult);

        let ctn = $("#sainewmodulefront");
        let dialog = $("#sainewmodulefront_dialog");

        dialog.html("");

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
        /*
		editor.container.style.width = '100%'; // Définit la largeur de l'éditeur
		editor.container.style.height = '60vh'; // Définit la hauteur de l'éditeur
		*/
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
        buttonValidate.on("click", onValidate);

        let actionFooter = $("<div/>").addClass("simai-interactiveBox");
        actionFooter.append(buttonValidate);

        dialog.append(actionFooter);
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
            ctn
                .find("#chatContainer")
                .append(
                    AiJsTools.getDisplayBotMessage("Ai call inib for test purpose")
                );
            ctn.find("#message").val("");

            $("#sendMessage").addClass("simai-disabledButton");
            $("#generateModule").addClass("simai-disabledButton");

            setTimeout(() => {
                $("#sendMessage").removeClass("simai-disabledButton");
                $("#generateModule").removeClass("simai-disabledButton");
            }, 2000);
            return;
        }

        const message = $("#message").val();
        let params = AiJsTools.getPostParams(ctn, AiJsTools.chatUmlSpecialisation);

        ctn.find("#chatContainer").append(AiJsTools.getDisplayUserMessage(ctn));
        ctn.find("#chatContainer").append(AiJsTools.getDisplayBotMessage());
        ctn.find("#message").val("");

        $("#sendMessage").addClass("simai-disabledButton");
        $("#generateModule").addClass("simai-disabledButton");

        let res = await this.SaiTools.callApi(params, "chat");
        //TODO: Proper error handling
        if (res?.error) {
            ctn.find('#chatContainer').append("an error occured: " + AiJsTools.getDisplayBotMessage(res?.error));
            return;
        }
        // await shall block until having a valid response ...
        $("#sendMessage").removeClass("simai-disabledButton");
        $("#generateModule").removeClass("simai-disabledButton");

        let response = $view
            .markdownToHTML(res?.choices[0]?.message?.content)
            .html();
        $(".bot-messages:last-child span").html(response);
    }

    async createModule(app) {
        const moduleInfo = await this.SaiTools.callApi({
            action: "create",
            login: $grant.getLogin(),
            moduleName: this.validatedModuleName,
        });
        console.log(moduleInfo);
        if (moduleInfo.error) {
            $ui.toast({
                type: "error",
                content: `Error creating module`,
                position: "top",
                align: "center",
                undo: false,
                moveable: false
            });
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
        //TODO: Proper error handling
        if (res?.error) {
            $ui.toast({
                type: "error",
                content: `Error generating module: ${res?.error}`,
                position: "top",
                align: "center",
                undo: false,
                moveable: false
            });
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
            console.log("Preparing JSON with : " + JSON.stringify(res));
            app.createObjs(app, res.objects);
        } catch (e) {
            console.log("error", e);
            $ui.toast({
                type: "error",
                content: `Error : JSON isn't valid`,
                position: "top",
                align: "center",
                undo: false,
                moveable: false
            });
            return; // Sortir de la fonction si le JSON n'est pas valide
        }
    }

    async createObjs(app, objects) {
        let ctn = $("#sainewmodulefront");
        let dialog = $("#sainewmodulefront_dialog");

        dialog.prevAll().remove();
        dialog.nextAll().remove();

        dialog.html("");

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
        nextButton.on("click", () => {
            app.clearCache(mermaidText);
        });

        let interactiveBox = $("<div/>").addClass("simai-interactiveBox");
        interactiveBox.append(nextButton);

        dialog.append(interactiveBox);
    }

    async clearCache(mermaidText) {
        let ctn = $("#sainewmodulefront");
        let dialog = $("#sainewmodulefront_dialog");

        dialog.html("");

        let res = await this.SaiTools.callApi({
            action: "initClearCache",
            mermaidText: mermaidText,
        });
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

    async genData() {
        let ctn = $("#sainewmodulefront");
        ctn.html("");

        let dialog = $("<div/>").attr("id", "sainewmodulefront_dialog");
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
            res = await this.SaiTools.callApi({}, "genJsonData");
            //TODO: Proper error handling
            if (res?.error) {
                $ui.toast({
                    type: "error",
                    content: `Error generating data: ${res?.error}`,
                    position: "top",
                    align: "center",
                    undo: false,
                    moveable: false
                });
                return;
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
        if (this.showJson) {
            const editor = window.ace.edit("jsonEditor");
            const jsonValue = editor.getValue();
        }
        let res = await this.SaiTools.callApi({
            action: "genDatas",
            datas: jsonValue
        });
        console.log(res);
        dialog.html("");
        dialog.append(`<div id="genData" class="simai-contextualHelp">${$T("SAI_DATA_GENERATED")}</div>`);

        let interactiveBox = $("<div/>").addClass("simai-interactiveBox");

        let nextButton = $("<button/>").attr("id", "nextButton").addClass("actionButton-blue").text(`${$T("SAI_NEXT")}`).on("click", () => {
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
};