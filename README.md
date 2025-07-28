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



`SaiContact` business object definition
---------------------------------------



### Fields

| Name                                                         | Type                                     | Required | Updatable | Personal | Description                                                                      |
|--------------------------------------------------------------|------------------------------------------|----------|-----------|----------|----------------------------------------------------------------------------------|
| `SaiContactName`                                             | char(100)                                |          | yes       |          | -                                                                                |
| `SaiContactEmail`                                            | email(100)                               |          | yes       |          | -                                                                                |
| `SaiContactPhone`                                            | phone(100)                               |          | yes       |          | -                                                                                |
| `SaiContactComment`                                          | text(1000)                               |          | yes       |          | -                                                                                |
| `saiCntModuleId` link to **`Module`**                        | id                                       | yes*     | yes       |          | -                                                                                |
| _Ref. `saiCntModuleId.mdl_name`_                             | _regexp(100)_                            |          |           |          | _Module name_                                                                    |
| `saiCntXml`                                                  | document                                 |          | yes       |          | -                                                                                |

`SaiCreateModuleApi` external object definition
-----------------------------------------------




`SaiHomePageAI` external object definition
------------------------------------------




`SaiNewModuleFront` external object definition
----------------------------------------------




`SaiWdgExemple` external object definition
------------------------------------------




