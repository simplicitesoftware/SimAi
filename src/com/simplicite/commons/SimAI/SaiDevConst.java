package com.simplicite.commons.SimAI;


import com.simplicite.util.Grant;

import org.json.JSONArray;

/**
 * Shared code SaiDevConst
 */
public class SaiDevConst implements java.io.Serializable {
	private static final long serialVersionUID = 1L;
	private static final boolean TEST_WITHOUT_AI_CALL = Grant.getSystemAdmin().getBooleanParameter("SAI_TEST_INIB_AI_CALL");
	public static boolean isWithoutAiDebug() {
		return TEST_WITHOUT_AI_CALL;
	}
  public static JSONArray getFakeUsage() {
    return new JSONArray("[{\"completion_tokens\":382,\"prompt_tokens\":31,\"total_tokens\":413},{\"completion_tokens\":1285,\"prompt_tokens\":676,\"total_tokens\":1961},{\"completion_tokens\":991,\"prompt_tokens\":460,\"total_tokens\":1451}]");
  }
  public static String getDefaultDescModule(){
    return """
    Pour décrire ce module en utilisant un langage compréhensible par un non-technicien, nous allons imaginer un système de commande en ligne. Voici comment cela pourrait être expliqué :

### Les Classes et leurs Attributs

1. **Commande (Order)** :
   - **Code de Commande (OrdCode)** : Un numéro unique pour chaque commande.
   - **Code d'Utilisateur (UsrCode)** : Un numéro unique pour chaque utilisateur.
   - **Identifiant de l'Utilisateur (OrdUser_id)** : Un identifiant pour l'utilisateur qui a passé la commande.
   - **Date de la Commande (OrdEr_date)** : La date à laquelle la commande a été passée.
   - **Montant Total de la Commande (OrdTotal_amount)** : Le montant total de la commande.
   - **Statut de la Commande (OrdStatus)** : Le statut actuel de la commande (par exemple, en cours, expédié, annulé).

2. **Produit (Product)** :
   - **Code du Produit (ProCode)** : Un numéro unique pour chaque produit.
   - **Nom du Produit (ProName)** : Le nom du produit.
   - **Description du Produit (ProDescription)** : Une description du produit.
   - **Prix du Produit (ProPrice)** : Le prix du produit.
   - **Quantité en Stock (ProStock_count)** : La quantité de ce produit disponible en stock.

3. **Utilisateur (User)** :
   - **Code d'Utilisateur (UsrCode)** : Un numéro unique pour chaque utilisateur.
   - **Nom d'Utilisateur (UsrUsername)** : Le nom d'utilisateur pour se connecter.
   - **Adresse Email (UsrEmail)** : L'adresse email de l'utilisateur.
   - **Mot de Passe (UsrPassword)** : Le mot de passe de l'utilisateur.
   - **Adresse (UsrAddress)** : L'adresse de l'utilisateur.

### Les Relations entre les Classes

1. **Commande et Utilisateur** :
   - Une commande est passée par un utilisateur. Un utilisateur peut passer plusieurs commandes (une commande est liée à un utilisateur, mais un utilisateur peut avoir plusieurs commandes).

2. **Commande et Produit** :
   - Une commande peut contenir plusieurs produits. Chaque produit dans la commande est lié à une commande spécifique.

3. **Produit et Commande** :
   - Une commande peut inclure plusieurs produits. Chaque produit dans la commande est lié à une commande spécifique.

### Exemple Concret

Imaginons que vous passez une commande sur un site de commerce en ligne :

- **Commande** : Vous passez une commande avec un numéro unique (OrdCode), et cette commande est liée à votre compte utilisateur (UsrCode).
- **Produit** : Vous ajoutez plusieurs articles à votre panier, chaque article ayant un code unique (ProCode), un nom (ProName), une description (ProDescription), un prix (ProPrice) et une quantité en stock (ProStock_count).
- **Utilisateur** : Vous êtes identifié par votre code utilisateur (UsrCode), nom d'utilisateur (UsrUsername), adresse email (UsrEmail) et mot de passe (UsrPassword).

En résumé, ce module décrit comment les commandes, les produits et les utilisateurs sont organisés et liés entre eux dans un système de commerce en ligne.
    """;
  }
  public static String getFakejsonUpdateResponse() {
    return """
    {
      "classes": [
        {
          "name": "User",
          "action": "update",
          "trigram": "usr",
          "bootstrapIcon": "user",
          "en": "User",
          "fr": "Utilisateur",
          "comment": "Represents the application users",
          "attributes": [
            {
              "name": "UsrCode",
              "fr": "Code utilisateur",
              "en": "User Code",
              "key": true,
              "required": true,
              "type": "Short text"
            },
            {
              "name": "UsrUserID",
              "fr": "Identifiant utilisateur",
              "en": "User ID",
              "key": true,
              "required": true,
              "type": "Short text"
            },
            {
              "name": "UsrUsername",
              "fr": "Nom d'utilisateur",
              "en": "Username",
              "key": false,
              "required": true,
              "type": "Short text"
            },
            {
              "name": "UsrEmail",
              "fr": "Adresse email",
              "en": "Email",
              "key": false,
              "required": true,
              "type": "Email"
            },
            {
              "name": "UsrAddress",
              "fr": "Adresse",
              "en": "Address",
              "key": false,
              "required": false,
              "type": "Long text"
            },
            {
              "name": "UsrPassword",
              "fr": "Mot de passe",
              "en": "Password",
              "key": false,
              "required": true,
              "type": "Password"
            }
          ]
        },
        {
          "name": "Order",
          "action": "update",
          "trigram": "ord",
          "bootstrapIcon": "shopping-cart",
          "en": "Order",
          "fr": "Commande",
          "comment": "Represents the orders placed by users",
          "attributes": [
            {
              "name": "OrdCode",
              "fr": "Code commande",
              "en": "Order Code",
              "key": true,
              "required": true,
              "type": "Short text"
            },
            {
              "name": "UsrCode",
              "fr": "Code utilisateur",
              "en": "User Code",
              "key": true,
              "required": true,
              "type": "Short text"
            },
            {
              "name": "UsrUserID",
              "fr": "Identifiant utilisateur",
              "en": "User ID",
              "key": true,
              "required": true,
              "type": "Short text"
            },
            {
              "name": "OrdErID",
              "fr": "Identifiant commande",
              "en": "Order ID",
              "key": true,
              "required": true,
              "type": "Short text"
            },
            {
              "name": "OrdUser_id",
              "fr": "Identifiant utilisateur pour la commande",
              "en": "Order User ID",
              "key": false,
              "required": true,
              "type": "Short text"
            },
            {
              "name": "OrdUserID",
              "fr": "Identifiant utilisateur pour la commande",
              "en": "Order User ID",
              "key": false,
              "required": true,
              "type": "Short text"
            },
            {
              "name": "OrdEr_date",
              "fr": "Date de la commande",
              "en": "Order Date",
              "key": false,
              "required": true,
              "type": "Date and time"
            },
            {
              "name": "OrdErDate",
              "fr": "Date de la commande",
              "en": "Order Date",
              "key": false,
              "required": true,
              "type": "Date and time"
            },
            {
              "name": "OrdTotal_amount",
              "fr": "Montant total de la commande",
              "en": "Total Amount",
              "key": false,
              "required": true,
              "type": "Decimal"
            },
            {
              "name": "OrdTotalAmount",
              "fr": "Montant total de la commande",
              "en": "Total Amount",
              "key": false,
              "required": true,
              "type": "Decimal"
            },
            {
              "name": "OrdStatus",
              "fr": "Statut de la commande",
              "en": "Status",
              "key": false,
              "required": true,
              "type": "Enumeration",
              "Enumeration": {
                "Values": [
                  {
                    "code": "pending",
                    "en": "Pending",
                    "fr": "En attente",
                    "color": "orange"
                  },
                  {
                    "code": "shipped",
                    "en": "Shipped",
                    "fr": "Expédié",
                    "color": "green"
                  },
                  {
                    "code": "delivered",
                    "en": "Delivered",
                    "fr": "Livré",
                    "color": "blue"
                  }
                ]
              }
            }
          ]
        },
        {
          "name": "OrderProduct",
          "action": "update",
          "trigram": "op",
          "bootstrapIcon": "cart-plus",
          "en": "OrderProduct",
          "fr": "Produit Commande",
          "comment": "Represents the link between an order and a product",
          "attributes": [
            {
              "name": "OpCode",
              "fr": "Code produit commande",
              "en": "Order Product Code",
              "key": true,
              "required": true,
              "type": "Short text"
            },
            {
              "name": "OrdCode",
              "fr": "Code commande",
              "en": "Order Code",
              "key": true,
              "required": true,
              "type": "Short text"
            },
            {
              "name": "OrdErID",
              "fr": "Identifiant commande",
              "en": "Order ID",
              "key": true,
              "required": true,
              "type": "Short text"
            },
            {
              "name": "OpOrderID",
              "fr": "Identifiant commande pour le produit",
              "en": "Order ID",
              "key": false,
              "required": true,
              "type": "Short text"
            },
            {
              "name": "OpProductID",
              "fr": "Identifiant produit",
              "en": "Product ID",
              "key": false,
              "required": true,
              "type": "Short text"
            },
            {
              "name": "OpQuantity",
              "fr": "Quantité du produit commandée",
              "en": "Quantity",
              "key": false,
              "required": true,
              "type": "Integer"
            }
          ]
        },
        {
          "name": "Product",
          "action": "update",
          "trigram": "pro",
          "bootstrapIcon": "box",
          "en": "Product",
          "fr": "Produit",
          "comment": "Represents the products available in the application",
          "ATTRIBUTES": [
            {
              "name": "ProCode",
              "fr": "Code produit",
              "en": "Product Code",
              "key": true,
              "required": true,
              "type": "Short text"
            },
            {
              "name": "OpCode",
              "fr": "Code produit commande",
              "en": "Order Product Code",
              "key": true,
              "required": true,
              "type": "Short text"
            },
            {
              "name": "ProDuctID",
              "fr": "Identifiant produit",
              "en": "Product ID",
              "key": true,
              "required": true,
              "type": "Short text"
            },
            {
              "name": "ProName",
              "fr": "Nom du produit",
              "en": "Product Name",
              "key": false,
              "required": true,
              "type": "Short text"
            },
            {
              "name": "ProDuctName",
              "fr": "Nom du produit",
              "en": "Product Name",
              "key": false,
              "required": true,
              "type": "Short text"
            },
            {
              "name": "ProDescription",
              "fr": "Description du produit",
              "en": "Product Description",
              "key": false,
              "required": false,
              "type": "Long text"
            },
            {
              "name": "ProStock_count",
              "fr": "Quantité en stock",
              "en": "Stock Count",
              "key": false,
              "required": true,
              "type": "Integer"
            },
            {
              "name": "ProStockCount",
              "fr": "Quantité en stock",
              "en": "Stock Count",
              "key": false,
              "required": true,
              "type": "Integer"
            },
            {
              "name": "ProPrice",
              "fr": "Prix du produit",
              "en": "Price",
              "key": false,
              "required": true,
              "type": "Decimal"
            }
          ]
        }
      ],
        "RELATIONSHIPS": [
          {
            "class1": "User",
            "class2": "Order",
            "type": "ManyToOne",
            "action": "update"
          },
          {
            "class1": "Order",
            "class2": "OrderProduct",
            "type": "ManyToOne",
            "action": "update"
          },
          {
            "class1": "Product",
            "class2": "OrderProduct",
            "type": "ManyToOne",
            "action": "update"
          },
          {
            "class1": "OrderProduct",
            "class2": "Product",
            "type": "ManyToOne",
            "action": "update"
          }
        ],
        "objectToDelete": [
          "Favoris"
        ]
      }
    """;
  }
	public static String getFakeResponse() {
		return """
ertainly! Below is the UML class diagram in JSON format, optimized for automatic integration into Java tools. This JSON structure is strictly valid, accurate, and consistent with the previous exchanges.
    
    ```json
    {
     "classes": [
     {
     "name": "Vehicle",
     "attributes": [
     {"name": "id", "type": "Integer"},
     {"name": "brand", "type": "String"},
     {"name": "model", "type": "String"},
     {"name": "year", "type": "Integer"},
     {"name": "vin", "type": "String"},
     {"name": "registrationNumber", "type": "String"},
     {"name": "currentStatus", "type": "Enum", "values": ["active", "maintenance", "out_of_service"]},
     {"name": "location", "type": "String"},
     {"name": "mileage", "type": "Integer"},
     {"name": "lastMaintenanceDate", "type": "Date"},
     {"name": "cost", "type": "Double"}
     ],
     "relationships": [
     {"name": "Driver", "multiplicity": "1..*"},
     {"name": "Mission", "multiplicity": "1..*"},
     {"name": "Maintenance", "multiplicity": "1..*"},
     {"name": "Expense", "multiplicity": "1..*"},
     {"name": "Alert", "multiplicity": "1..*"}
     ]
     },
     {
     "name": "Driver",
     "attributes": [
     {"name": "id", "type": "Integer"},
     {"name": "name", "type": "String"},
     {"name": "licenseNumber", "type": "String"},
     {"name": "phoneNumber", "type": "String"},
     {"name": "email", "type": "String"},
     {"name": "currentMission", "type": "Mission"}
     ],
     "relationships": [
     {"name": "Mission", "multiplicity": "1..*"}
     ]
     },
     {
     "name": "Mission",
     "attributes": [
     {"name": "id", "type": "Integer"},
     {"name": "driver", "type": "Driver"},
     {"name": "vehicle", "type": "Vehicle"},
     {"name": "startTime", "type": "Date"},
     {"name": "endTime", "type": "Date"},
     {"name": "route", "type": "String"},
     {"name": "status", "type": "Enum", "values": ["scheduled", "in_progress", "completed", "canceled"]}
     ],
     "relationships": [
     {"name": "Driver", "multiplicity": "1"},
     {"name": "Vehicle", "multiplicity": "1"}
     ]
     },
     {
     "name": "Maintenance",
     "attributes": [
     {"name": "id", "type": "Integer"},
     {"name": "vehicle", "type": "Vehicle"},
     {"name": "type", "type": "String"},
     {"name": "date", "type": "Date"},
     {"name": "cost", "type": "Double"},
     {"name": "mechanic", "type": "Mechanic"}
     ],
     "relationships": [
     {"name": "Mechanic", "multiplicity": "1"}
     ]
     },
     {
     "name": "Mechanic",
     "attributes": [
     {"name": "id", "type": "Integer"},
     {"name": "name", "type": "String"},
     {"name": "phoneNumber", "type": "String"},
     {"name": "email", "type": "String"}
     ]
     },
     {
     "name": "User",
     "attributes": [
     {"name": "id", "type": "Integer"},
     {"name": "username", "type": "String"},
     {"name": "password", "type": "String"},
     {"name": "role", "type": "Enum", "values": ["admin", "fleet_manager", "driver", "partner"]}
     ],
     "relationships": [
     {"name": "Partner", "multiplicity": "1"}
     ]
     },
     {
     "name": "Partner",
     "attributes": [
     {"name": "id", "type": "Integer"},
     {"name": "type", "type": "String"},
     {"name": "name", "type": "String"},
     {"name": "contactInfo", "type": "String"},
     {"name": "user", "type": "User"}
     ],
     "relationships": [
     {"name": "User", "multiplicity": "1"}
     ]
     },
     {
     "name": "Expense",
     "attributes": [
     {"name": "id", "type": "Integer"},
     {"name": "type", "type": "String"},
     {"name": "amount", "type": "Double"},
     {"name": "date", "type": "Date"},
     {"name": "vehicle", "type": "Vehicle"}
     ],
     "relationships": [
     {"name": "Vehicle", "multiplicity": "1"}
     ]
     },
     {
     "name": "Alert",
     "attributes": [
     {"name": "id", "type": "Integer"},
     {"name": "type", "type": "String"},
     {"name": "description", "type": "String"},
     {"name": "date", "type": "Date"},
     {"name": "vehicle", "type": "Vehicle"}
     ],
     "relationships": [
     {"name": "Vehicle", "multiplicity": "1"}
     ]
     },
     {
     "name": "Report",
     "attributes": [
     {"name": "id", "type": "Integer"},
     {"name": "type", "type": "String"},
     {"name": "period", "type": "DateRange"},
     {"name": "data", "type": "String"}
     ],
     "relationships": [
     {"name": "User", "multiplicity": "1..*"}
     ]
     }
     ],
     "relationships": [
     {"from": "Vehicle", "to": "Driver", "multiplicity": "1..*"},
     {"from": "Driver", "to": "Mission", "multiplicity": "1..*"},
     {"from": "Vehicle", "to": "Mission", "multiplicity": "1..*"},
     {"from": "Vehicle", "to": "Maintenance", "multiplicity": "1..*"},
     {"from": "Maintenance", "to": "Mechanic", "multiplicity": "1"},
     {"from": "User", "to": "Partner", "multiplicity": "1"},
     {"from": "Vehicle", "to": "Expense", "multiplicity": "1..*"},
     {"from": "Vehicle", "to": "Alert", "multiplicity": "1..*"},
     {"from": "User", "to": "Report", "multiplicity": "1..*"}
     ]
    }
    ```
    
    This JSON structure represents the UML class diagram for the Vehicle Fleet Management Application, including classes, their attributes, and relationships. It is designed to be used by a parser for automatic integration into Java tools.
				""";
	}
}