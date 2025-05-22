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



`SaiInstance` business object definition
----------------------------------------



### Fields

| Name                                                         | Type                                     | Required | Updatable | Personal | Description                                                                      |
|--------------------------------------------------------------|------------------------------------------|----------|-----------|----------|----------------------------------------------------------------------------------|
| `saiInstanceName`                                            | char(100)                                | yes*     | yes       |          | -                                                                                |
| `saiInstanceUrl`                                             | url(100)                                 |          |           |          | -                                                                                |
| `saiInstanceStatus`                                          | enum(100) using `SAI_INSTANCE_STATUS` list |          |           |          | -                                                                                |

### Lists

* `SAI_INSTANCE_STATUS`
    - `UP` Started
    - `DOWN` Stoped
    - `DELETE` Deleted

`SaiCreateInstance` business process definition
-----------------------------------------------



### Activities

* `Create`: 
* `Chatbot`: 
* `redirect`: 
* `Begin`: 
* `End`: 

`SaiCreateModuleApi` external object definition
-----------------------------------------------




`SaiNewModuleExternal` external object definition
-------------------------------------------------




`SaiNewModuleFront` external object definition
----------------------------------------------




`SaiProcessResource` external object definition
-----------------------------------------------




`SaiRedirect` external object definition
----------------------------------------




`SaiTestapi` external object definition
---------------------------------------




