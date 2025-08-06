/**
 * Ce fichier définit le schéma de la base de données Firebase pour l'application Grill & Daily
 * Il montre les relations entre les différentes collections et la structure des documents
 */
/**
 * Collection: users
 * Description: Stocke les informations des utilisateurs
 * 
 * Structure:
 * {
 *   uid: string,          // ID utilisateur Firebase Auth
 *   name: string,         // Nom complet de l'utilisateur
 *   email: string,        // Email de l'utilisateur
 *   phone: string,        // Numéro de téléphone (optionnel)
 *   address: string,      // Adresse de livraison (optionnel)
 *   role: string,         // Rôle de l'utilisateur ('admin' ou 'client')
 *   createdAt: timestamp, // Date de création du compte
 *   updatedAt: timestamp  // Date de dernière modification
 * }
 * 
 * Relations:
 * - Un utilisateur peut avoir plusieurs commandes (orders)
 */
/**
 * Collection: products
 * Description: Stocke les informations des produits
 * 
 * Structure:
 * {
 *   name: string,          // Nom du produit
 *   description: string,   // Description du produit
 *   price: number,         // Prix du produit
 *   category: string,      // ID de la catégorie (référence à categories.id)
 *   image: string,         // URL de l'image Cloudinary
 *   available: boolean,    // Disponibilité du produit
 *   isSpecial: boolean,    // Produit mis en avant
 *   createdAt: timestamp,  // Date de création
 *   updatedAt: timestamp   // Date de dernière modification
 * }
 * 
 * Relations:
 * - Un produit appartient à une catégorie (categories)
 * - Un produit peut être présent dans plusieurs commandes (orders)
 */
/**
 * Collection: categories
 * Description: Stocke les catégories de produits
 * 
 * Structure:
 * {
 *   name: string,          // Nom de la catégorie
 *   id: string,            // ID technique utilisé comme référence
 *   description: string,   // Description de la catégorie
 *   order: number,         // Ordre d'affichage
 *   visible: boolean,      // Visibilité dans le menu
 *   createdAt: timestamp,  // Date de création
 *   updatedAt: timestamp   // Date de dernière modification
 * }
 * 
 * Relations:
 * - Une catégorie peut contenir plusieurs produits (products)
 */
/**
 * Collection: orders
 * Description: Stocke les commandes des clients
 * 
 * Structure:
 * {
 *   customerId: string,     // ID de l'utilisateur (référence à users.uid)
 *   customerName: string,   // Nom du client
 *   customerEmail: string,  // Email du client
 *   customerPhone: string,  // Téléphone du client
 *   address: string,        // Adresse de livraison
 *   items: [                // Articles commandés
 *     {
 *       id: string,         // ID du produit
 *       name: string,       // Nom du produit
 *       price: number,      // Prix unitaire
 *       quantity: number,   // Quantité
 *       isMenu: boolean,    // Indique si c'est un menu composé
 *       items: array        // Sous-articles si c'est un menu
 *     }
 *   ],
 *   total: number,          // Montant total
 *   status: string,         // Statut ('En attente', 'En préparation', 'Livré', 'Annulé')
 *   paymentMethod: string,  // Méthode de paiement
 *   paymentStatus: string,  // Statut du paiement
 *   createdAt: timestamp,   // Date de création
 *   updatedAt: timestamp    // Date de dernière modification
 * }
 * 
 * Relations:
 * - Une commande appartient à un utilisateur (users)
 * - Une commande contient plusieurs produits (products)
 */
/**
 * Collection: settings
 * Description: Stocke les paramètres de l'application
 * 
 * Structure:
 * {
 *   restaurantName: string,  // Nom du restaurant
 *   email: string,           // Email de contact
 *   phone: string,           // Téléphone
 *   address: string,         // Adresse
 *   description: string,     // Description du restaurant
 *   website: string,         // Site web
 *   colors: {                // Couleurs du thème
 *     primary: string,       // Couleur principale
 *     secondary: string,     // Couleur secondaire
 *     background: string     // Couleur de fond
 *   },
 *   fontFamily: string,      // Police de caractères
 *   createdAt: timestamp,    // Date de création
 *   updatedAt: timestamp     // Date de dernière modification
 * }
 */
/**
 * Gestion des images avec Cloudinary
 * 
 * Format des URLs Cloudinary:
 * https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{public_id}.{format}
 * 
 * Exemples:
 * - Image de produit: https://res.cloudinary.com/grill-daily/image/upload/v1623456789/products/entrecote-grillee.jpg
 * - Logo: https://res.cloudinary.com/grill-daily/image/upload/v1623456789/settings/logo.png
 * 
 * Organisation des dossiers:
 * - products/: Images des produits
 * - categories/: Images des catégories
 * - settings/: Images des paramètres (logo, favicon)
 */
/**
 * Diagramme des relations entre les collections:
 * 
 * users ──┐
 *         │
 *         ▼
 * orders ◄┼─── products ◄─── categories
 *         │
 * settings┘
 */
// Ce fichier est uniquement documentaire et ne contient pas de code exécutable
export {};