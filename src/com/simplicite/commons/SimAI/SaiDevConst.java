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
 Voici la représentation **strictement valide en JSON** du modèle UML décrit précédemment, optimisée pour une intégration automatique dans des outils Java (comme **PlantUML**, **Eclipse UML**, ou des générateurs de code comme **JAXB** ou **MapStruct**).
    Le JSON suit une structure **normalisée** avec des **enums**, **classes**, **relations**, et **attributs** clairement définis pour une génération de code ou une visualisation UML.
    
    ---
    
    ### **`uml_model.json`**
    ```json
    {
     "metadata": {
     "description": "Modèle UML pour une application de gestion des emplacements vacants dans les centres commerciaux, intégrant la fréquentation piétonne et le CA des magasins.",
     "author": "Assistant UML",
     "version": "1.0",
     "tools_compatible": ["PlantUML", "Eclipse UML", "JAXB", "MapStruct"]
     },
     "enums": {
     "TypeEmplacement": {
     "values": ["BOUTIQUE", "RESTAURATION", "SERVICE", "VACANT", "ESPACE_COMMERCIAL"]
     },
     "Visibilite": {
     "values": ["FAIBLE", "MOYENNE", "ELEVEE"]
     },
     "TypeProprietaire": {
     "values": ["PARTICULIER", "ENTREPRISE", "FRANCHISE"]
     },
     "StatutDemande": {
     "values": ["EN_ATTENTE", "ACCEPTEE", "REFUSEE", "EN_NEGOCIATION"]
     },
     "TypePromotion": {
     "values": ["SOLDE", "EVENT", "PARTENARIAT", "SAISONNIERE"]
     },
     "TypeStatutMagasin": {
     "values": ["OUVERT", "FERME", "EN_RESTRUCTURATION"]
     }
     },
     "classes": {
     "CentreCommercial": {
     "attributes": [
     {"name": "nom", "type": "String", "visibility": "private"},
     {"name": "adresse", "type": "String", "visibility": "private"},
     {"name": "superficieTotale", "type": "float", "visibility": "private"},
     {"name": "dateOuverture", "type": "Date", "visibility": "private"},
     {"name": "nombreEtages", "type": "int", "visibility": "private"},
     {"name": "emplacementsDisponibles", "type": "int", "visibility": "private"},
     {"name": "frequentationMoyenne", "type": "int", "visibility": "private", "description": "Fréquentation piétonne moyenne mensuelle (estimée)."}
     ],
     "relations": [
     {
     "target": "Magasin",
     "type": "ONE_TO_MANY",
     "description": "Un centre commercial contient plusieurs magasins.",
     "cardinality": {
     "source": "1",
     "target": "N"
     }
     },
     {
     "target": "GestionCentre",
     "type": "ONE_TO_ONE",
     "description": "Un centre a une entité de gestion dédiée.",
     "cardinality": {
     "source": "1",
     "target": "1"
     }
     },
     {
     "target": "Etage",
     "type": "ONE_TO_MANY",
     "description": "Un centre a plusieurs étages.",
     "cardinality": {
     "source": "1",
     "target": "N"
     }
     },
     {
     "target": "StatistiquesCentre",
     "type": "ONE_TO_ONE",
     "description": "Statistiques globales du centre (fréquentation, CA moyen, etc.).",
     "cardinality": {
     "source": "1",
     "target": "1"
     }
     }
     ]
     },
     "Etage": {
     "attributes": [
     {"name": "numero", "type": "int", "visibility": "private", "description": "Numéro de l'étage (ex: -1 pour sous-sol, 0 pour RDC)."},
     {"name": "superficie", "type": "float", "visibility": "private"},
     {"name": "emplacementsOccupes", "type": "int", "visibility": "private"},
     {"name": "emplacementsVacants", "type": "int", "visibility": "private"},
     {"name": "frequentationEstimee", "type": "int", "visibility": "private", "description": "Fréquentation piétonne estimée par jour."}
     ],
     "relations": [
     {
     "target": "CentreCommercial",
     "type": "MANY_TO_ONE",
     "description": "Un étage appartient à un centre commercial.",
     "cardinality": {
     "source": "N",
     "target": "1"
     }
     },
     {
     "target": "Emplacement",
     "type": "ONE_TO_MANY",
     "description": "Un étage contient plusieurs emplacements.",
     "cardinality": {
     "source": "1",
     "target": "N"
     }
     },
     {
     "target": "Magasin",
     "type": "ONE_TO_MANY",
     "description": "Un étage peut héberger plusieurs magasins.",
     "cardinality": {
     "source": "1",
     "target": "N"
     }
     }
     ]
     },
     "Emplacement": {
     "attributes": [
     {"name": "id", "type": "String", "visibility": "private", "description": "Identifiant unique (ex: 'E-01-05')."},
     {"name": "numero", "type": "int", "visibility": "private"},
     {"name": "superficie", "type": "float", "visibility": "private"},
     {"name": "type", "type": "TypeEmplacement", "visibility": "private"},
     {"name": "prixLoyerMensuel", "type": "float", "visibility": "private"},
     {"name": "disponible", "type": "boolean", "visibility": "private"},
     {"name": "frequentationEstimee", "type": "int", "visibility": "private", "description": "Fréquentation piétonne estimée devant l'emplacement."},
     {"name": "visibilite", "type": "Visibilite", "visibility": "private"}
     ],
     "relations": [
     {
     "target": "Etage",
     "type": "MANY_TO_ONE",
     "description": "Un emplacement appartient à un étage.",
     "cardinality": {
     "source": "N",
     "target": "1"
     }
     },
     {
     "target": "Magasin",
     "type": "ONE_TO_ONE",
     "description": "Un emplacement peut être occupé par un magasin ou être vacant.",
     "cardinality": {
     "source": "1",
     "target": "0..1"
     }
     },
     {
     "target": "HistoriquePrix",
     "type": "ONE_TO_ONE",
     "description": "Historique des prix de loyer de l'emplacement.",
     "cardinality": {
     "source": "1",
     "target": "1"
     }
     }
     ]
     },
     "Magasin": {
     "attributes": [
     {"name": "nom", "type": "String", "visibility": "private"},
     {"name": "secteurActivite", "type": "String", "visibility": "private"},
     {"name": "surfaceOccupee", "type": "float", "visibility": "private"},
     {"name": "dateOuverture", "type": "Date", "visibility": "private"},
     {"name": "caMensuelMoyen", "type": "float", "visibility": "private", "description": "Chiffre d'affaires mensuel moyen (en €)."},
     {"name": "caAnnuelPrevu", "type": "float", "visibility": "private", "description": "CA annuel prévu (pour projection)."},
     {"name": "frequentationInterne", "type": "int", "visibility": "private", "description": "Fréquentation moyenne de clients par jour."},
     {"name": "noteClient", "type": "float", "visibility": "private", "description": "Note moyenne des clients (sur 5)."},
     {"name": "contratExpiration", "type": "Date", "visibility": "private"},
     {"name": "statut", "type": "TypeStatutMagasin", "visibility": "private"}
     ],
     "relations": [
     {
     "target": "CentreCommercial",
     "type": "MANY_TO_ONE",
     "description": "Un magasin est situé dans un centre commercial.",
     "cardinality": {
     "source": "N",
     "target": "1"
     }
     },
     {
     "target": "Emplacement",
     "type": "ONE_TO_ONE",
     "description": "Un magasin occupe un emplacement spécifique.",
     "cardinality": {
     "source": "1",
     "target": "1"
     }
     },
     {
     "target": "StatistiqueCA",
     "type": "ONE_TO_MANY",
     "description": "Historique des performances financières du magasin.",
     "cardinality": {
     "source": "1",
     "target": "N"
     }
     },
     {
     "target": "Proprietaire",
     "type": "ONE_TO_MANY",
     "description": "Un propriétaire peut gérer plusieurs magasins.",
     "cardinality": {
     "source": "N",
     "target": "1"
     }
     },
     {
     "target": "Promotion",
     "type": "ONE_TO_MANY",
     "description": "Promotions organisées par le magasin.",
     "cardinality": {
     "source": "1",
     "target": "N"
     }
     }
     ]
     },
     "StatistiqueCA": {
     "attributes": [
     {"name": "mois", "type": "String", "visibility": "private", "description": "Mois de référence (ex: 'Janvier 2023')."},
     {"name": "caReel", "type": "float", "visibility": "private", "description": "CA réel enregistré (en €)."},
     {"name": "objectifCA", "type": "float", "visibility": "private", "description": "Objectif CA fixé pour le mois."},
     {"name": "ecart", "type": "float", "visibility": "private", "description": "Écart entre CA réel et objectif (en €)."},
     {"name": "frequentationReelle", "type": "int", "visibility": "private", "description": "Fréquentation réelle mesurée."}
     ],
     "relations": [
     {
     "target": "Magasin",
     "type": "MANY_TO_ONE",
     "description": "Statistiques liées à un magasin spécifique.",
     "cardinality": {
     "source": "N",
     "target": "1"
     }
     }
     ]
     },
     "Proprietaire": {
     "attributes": [
     {"name": "nom", "type": "String", "visibility": "private"},
     {"name": "type", "type": "TypeProprietaire", "visibility": "private"},
     {"name": "contact", "type": "String", "visibility": "private"},
     {"name": "budgetMax", "type": "float", "visibility": "private", "description": "Budget maximal pour le loyer (en €/mois)."},
     {"name": "preferences", "type": "String", "visibility": "private", "description": "Critères de choix (ex: 'Proximité entrée')."}
     ],
     "relations": [
     {
     "target": "Magasin",
     "type": "ONE_TO_MANY",
     "description": "Un propriétaire peut gérer plusieurs magasins.",
     "cardinality": {
     "source": "1",
     "target": "N"
     }
     },
     {
     "target": "DemandeEmplacement",
     "type": "ONE_TO_MANY",
     "description": "Demandes d'emplacements formulées par le propriétaire.",
     "cardinality": {
     "source": "1",
     "target": "N"
     }
     }
     ]
     },
     "DemandeEmplacement": {
     "attributes": [
     {"name": "id", "type": "String", "visibility": "private", "description": "Identifiant unique de la demande."},
     {"name": "dateCreation", "type": "Date", "visibility": "private"},
     {"name": "statut", "type": "StatutDemande", "visibility": "private"},
     {"name": "budgetPropose", "type": "float", "visibility": "private", "description": "Budget maximal proposé pour le loyer."},
     {"name": "criteres", "type": "String", "visibility": "private", "description": "Critères spécifiques (ex: 'Visibilité élevée')."},
     {"name": "priorite", "type": "int", "visibility": "private", "description": "Priorité (1 à 5)."}
     ],
     "relations": [
     {
     "target": "Proprietaire",
     "type": "MANY_TO_ONE",
     "description": "La demande émane d'un propriétaire.",
     "cardinality": {
     "source": "N",
     "target": "1"
     }
     },
     {
     "target": "Emplacement",
     "type": "ONE_TO_ONE",
     "description": "Lien vers l'emplacement proposé (si attribué).",
     "cardinality": {
     "source": "1",
     "target": "0..1"
     }
     },
     {
     "target": "CentreCommercial",
     "type": "MANY_TO_ONE",
     "description": "La demande est adressée à un centre commercial spécifique.",
     "cardinality": {
     "source": "N",
     "target": "1"
     }
     }
     ]
     },
     "FrequentationPietonne": {
     "attributes": [
     {"name": "date", "type": "Date", "visibility": "private"},
     {"name": "heureDebut", "type": "Time", "visibility": "private"},
     {"name": "heureFin", "type": "Time", "visibility": "private"},
     {"name": "nombreVisiteurs", "type": "int", "visibility": "private", "description": "Nombre de visiteurs estimés."},
     {"name": "sourceDonnees", "type": "String", "visibility": "private", "description": "Source (ex: 'Capteurs', 'Estimation')."}
     ],
     "relations": [
     {
     "target": "CentreCommercial",
     "type": "MANY_TO_ONE",
     "description": "Fréquentation globale du centre.",
     "cardinality": {
     "source": "N",
     "target": "1"
     }
     },
     {
     "target": "Etage",
     "type": "MANY_TO_ONE",
     "description": "Fréquentation par étage.",
     "cardinality": {
     "source": "N",
     "target": "1"
     }
     },
     {
     "target": "Emplacement",
     "type": "MANY_TO_ONE",
     "description": "Fréquentation devant un emplacement spécifique.",
     "cardinality": {
     "source": "N",
     "target": "1"
     }
     },
     {
     "target": "Magasin",
     "type": "MANY_TO_ONE",
     "description": "Fréquentation devant un magasin.",
     "cardinality": {
     "source": "N",
     "target": "1"
     }
     },
     {
     "target": "AnalyseTendances",
     "type": "ONE_TO_MANY",
     "description": "Analyse basée sur les données de fréquentation.",
     "cardinality": {
     "source": "1",
     "target": "N"
     }
     }
     ]
     },
     "AnalyseTendances": {
     "attributes": [
     {"name": "periode", "type": "String", "visibility": "private", "description": "Période analysée (ex: 'Trimestre 1 2023')."},
     {"name": "tendanceFrequentation", "type": "String", "visibility": "private", "description": "Description de la tendance (ex: 'Hausse de 10%')."},
     {"name": "impactCA", "type": "String", "visibility": "private", "description": "Impact estimé sur le CA des magasins."},
     {"name": "recommandations", "type": "String", "visibility": "private", "description": "Recommandations pour optimiser les emplacements."}
     ],
     "relations": [
     {
     "target": "FrequentationPietonne",
     "type": "MANY_TO_ONE",
     "description": "Analyse basée sur des données de fréquentation.",
     "cardinality": {
     "source": "N",
     "target": "1"
     }
     },
     {
     "target": "CentreCommercial",
     "type": "MANY_TO_ONE",
     "description": "Analyse spécifique à un centre.",
     "cardinality": {
     "source": "N",
     "target": "1"
     }
     }
     ]
     },
     "GestionCentre": {
     "attributes": [
     {"name": "responsable", "type": "String", "visibility": "private"},
     {"name": "contact", "type": "String", "visibility": "private"},
     {"name": "tauxOccupationCible", "type": "float", "visibility": "private", "description": "Taux d'occupation cible (ex: 90%)."},
     {"name": "strategieMarketing", "type": "String", "visibility": "private", "description": "Stratégie pour attirer des locataires."}
     ],
     "relations": [
     {
     "target": "CentreCommercial",
     "type": "ONE_TO_ONE",
     "description": "Gestion dédiée à un centre.",
     "cardinality": {
     "source": "1",
     "target": "1"
     }
     },
     {
     "target": "Promotion",
     "type": "ONE_TO_MANY",
     "description": "Promotions organisées par le centre.",
     "cardinality": {
     "source": "1",
     "target": "N"
     }
     }
     ]
     },
     "Promotion": {
     "attributes": [
     {"name": "nom", "type": "String", "visibility": "private"},
     {"name": "dateDebut", "type": "Date", "visibility": "private"},
     {"name": "dateFin", "type": "Date", "visibility": "private"},
     {"name": "type", "type": "TypePromotion", "visibility": "private"},
     {"name": "impactFrequentation", "type": "int", "visibility": "private", "description": "Estimation de l'impact sur la fréquentation."}
     ],
     "relations": [
     {
     "target": "CentreCommercial",
     "type": "MANY_TO_ONE",
     "description": "Promotion organisée par le centre.",
     "cardinality": {
     "source": "N",
     "target": "1"
     }
     },
     {
     "target": "Magasin",
     "type": "MANY_TO_MANY",
     "description": "Promotion liée à un ou plusieurs magasins.",
     "cardinality": {
     "source": "N",
     "target": "N"
     }
     }
     ]
     },
     "HistoriquePrix": {
     "attributes": [
     {"name": "dateMiseAJour", "type": "Date", "visibility": "private"},
     {"name": "prixAncien", "type": "float", "visibility": "private", "description": "Prix précédent (en €/mois)."},
     {"name": "prixNouveau", "type": "float", "visibility": "private", "description": "Nouveau prix proposé."},
     {"name": "motif", "type": "String", "visibility": "private", "description": "Motif de la modification (ex: 'Inflation')."}
     ],
     "relations": [
     {
     "target": "Emplacement",
     "type": "ONE_TO_ONE",
     "description": "Historique des prix d'un emplacement.",
     "cardinality": {
     "source": "1",
     "target": "1"
     }
     }
     ]
     },
     "StatistiquesCentre": {
     "attributes": [
     {"name": "frequentationMoyenneAnnuelle", "type": "int", "visibility": "private", "description": "Fréquentation moyenne annuelle."},
     {"name": "caMoyenParMagasin", "type": "float", "visibility": "private", "description": "CA moyen par magasin (en €)."},
     {"name": "tauxOccupationActuel", "type": "float", "visibility": "private", "description": "Taux d'occupation actuel (%)."}
     ],
     "relations": [
     {
     "target": "CentreCommercial",
     "type": "ONE_TO_ONE",
     "description": "Statistiques globales du centre.",
     "cardinality": {
     "source": "1",
     "target": "1"
     }
     }
     ]
     }
     },
     "diagrams": {
     "class_diagram": {
     "title": "Gestion des Emplacements Vacants dans les Centres Commerciaux",
     "description": "Modèle UML complet avec fréquentation piétonne et CA des magasins.",
     "packages": [
     {
     "name": "com.centrecommercial.core",
     "classes": ["CentreCommercial", "Etage", "Emplacement", "Magasin", "StatistiqueCA"]
     },
     {
     "name": "com.centrecommercial.management",
     "classes": ["GestionCentre", "Proprietaire", "DemandeEmplacement", "Promotion"]
     },
     {
     "name": "com.centrecommercial.analytics",
     "classes": ["FrequentationPietonne", "AnalyseTendances", "StatistiquesCentre"]
     }
     ]
     }
     }
    }
    ```
    
    ---
    
    ### **Caractéristiques du JSON**
    1. **Structure Normalisée** :
     - **Enums** définis pour les types répétitifs (ex: `TypeEmplacement`, `StatutDemande`).
     - **Classes** avec attributs (`name`, `type`, `visibility`, `description`).
     - **Relations** précises avec cardinalités (ex: `ONE_TO_MANY`, `MANY_TO_ONE`).
    
				""";
	}
}