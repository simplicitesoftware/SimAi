<!--
 ___ _            _ _    _ _    __
/ __(_)_ __  _ __| (_)__(_) |_ /_/
\__ \ | '  \| '_ \ | / _| |  _/ -_)
|___/_|_|_|_| .__/_|_\__|_|\__\___|
            |_| 
-->
![](https://platform.simplicite.io/logos/standard/logo250.png)
* * *

`SimAI` module definition
=========================

**SimAI** is an addon of [AiBySimplicite](https://github.com/simplicitesoftware/module_ai) containing a simplified business process for automatic module generation.

## Installation

### Classic
1. Make sure you have the `AiBySimplicite` module installed
2. Add this module in your Simplicite instance
3. Create a user and configure SAI_CREATE_MODULE rights

### Portainer
In docker compose add the environement parameter to: 
* Import [`SimThemes`](https://github.com/simplicitesoftware/module-theming), [`AIBySimplicite`](https://github.com/simplicitesoftware/module_ai.git) and [`SimAi`](https://github.com/CBimont/SimAi.git) with dataset and unit test to import examples and create user.
* Define the AI parameters:
```json
{
     "completion_url": "",
     "bot_name": "",
     "code_max_token": "",
     "provider": "",
     "api_key": "",
     "default_max_token": "",
     "showDataDisclaimer": true,
     "data_number": "",
     "hist_depth": "",
     "model": "",
     "stt_url": "",
     "ping_url": ""
}
```
* Define user information `usrName` and `password`.
#### Example:
```
environment:
      MODULES_IMPORT_SPEC: |
        title: "AI External"
        modules:
          - name: "SimThemes"
            version: "0.3"
            git:
              uri: "https://github.com/simplicitesoftware/module-theming"
          - name: "AIBySimplicite"
            version: "0.31"
            git:
              uri: "https://github.com/simplicitesoftware/module_ai.git"
              branch: "simplifiedProcess"
          - name: "SimAi"
            version: "0.4"
            datasets: true 
            unittests: true
            git:
              uri: "https://github.com/CBimont/SimAi.git"

        
      SIMPLICITE_SYSPARAM_AI_API_PARAM: |
        {
         "completion_url": "https://api.mistral.ai/v1/chat/completions",
         "bot_name": "George",
         "code_max_token": "2000",
         "provider": "Mistral AI",
         "api_key": "${mistral_api_key}",
         "default_max_token": "5000",
         "showDataDisclaimer": true,
         "data_number": "3",
         "hist_depth": "3",
         "model": "pixtral-12b-2409",
         "stt_url": "",
         "ping_url": "https://api.mistral.ai/v1/models"
        }
      usrName: "${user_name}"
      password: "${user_password}"
```

`SaiContactWidget` widget definition
------------------------------------

Widget for home page (contact)

`createAiUser` unit test
-------------------------

Create a new user granted to process with `usrName` and `password` environment variable, dedicated for docker compose auto deployment.

`SaiApplicationExample` business object definition
--------------------------------------------------

Chat prompt examples

### Fields

| Name                                                         | Type                                     | Required | Updatable | Personal | Description                                                                      |
|--------------------------------------------------------------|------------------------------------------|----------|-----------|----------|----------------------------------------------------------------------------------|
| `saiSaeTitle`                                                | char(50)                                 | yes*     | yes       |          | -                                                                                |
| `saiSaeTitleEnglish`                                         | char(100)                                | yes*     | yes       |          | -                                                                                |
| `saiSaeSummary`                                              | text(350)                                |          | yes       |          | -                                                                                |
| `saiSaePrompt`                                               | text(1500)                               |          | yes       |          | -                                                                                |
| `saiSaeSummaryEnglish`                                       | text(350)                                |          | yes       |          | -                                                                                |
| `saiSaePromptEnglish`                                        | text(1500)                               |          | yes       |          | -                                                                                |

`SaiContact` business object definition
---------------------------------------

Management of commercial contact and module registration.

### Fields

| Name                                                         | Type                                     | Required | Updatable | Personal | Description                                                                      |
|--------------------------------------------------------------|------------------------------------------|----------|-----------|----------|----------------------------------------------------------------------------------|
| `saiContactName`                                             | char(100)                                |          | yes       |          | -                                                                                |
| `saiContactEmail`                                            | email(100)                               |          | yes       |          | -                                                                                |
| `saiContactPhone`                                            | phone(100)                               |          | yes       |          | -                                                                                |
| `saiContactComment`                                          | text(1000)                               |          | yes       |          | -                                                                                |
| `saiCntModuleId` link to **`Module`**                        | id                                       | yes*     | yes       |          | -                                                                                |
| _Ref. `saiCntModuleId.mdl_name`_                             | _regexp(100)_                            |          |           |          | _Module name_                                                                    |
| _Ref. `saiCntModuleId.mdl_xml`_                              | _document_                               |          |           |          | _Module file_                                                                    |
| `saiCntSended`                                               | boolean                                  | yes      |           |          | -                                                                                |
| `saiCntDeletion`                                             | datetime                                 |          |           |          | -                                                                                |
| `saiCntViewhomeId` link to **`ViewHome`**                    | id                                       |          |           |          | -                                                                                |
| _Ref. `saiCntViewhomeId.viw_name`_                           | _char(100)_                              |          |           |          | -                                                                                |

`SaiContactDashboard` external object definition
------------------------------------------------




`SaiCreateModuleApi` external object definition
-----------------------------------------------

Custom endpoint, Interface with the AIBySimplicite process.


`SaiEndOfTime` external object definition
-----------------------------------------

External page, redirect page when end time has been reached


`SaiErrorPage` external object definition
-----------------------------------------

External page, redirect page in case of technical error (such as inaccessible Mistral API or missing token).


`SaiNewModuleFront` external object definition
----------------------------------------------

External page, module generation process.


`SaiUndoApi` external object definition
---------------------------------------




`SaiUpdateModuleFront` external object definition
-------------------------------------------------




