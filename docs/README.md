# 📚 Documentation du Projet RestaurantFood

Ce dossier contient toute la documentation technique du projet RestaurantFood.

## 📋 Index de la Documentation

### 🧩 Composants
- **[ProductAddForm Guide](./PRODUCT_ADD_FORM_GUIDE.md)** - Guide d'utilisation du composant d'ajout/modification de produits
  - Upload d'images vers Cloudinary
  - Formulaire complet avec validation
  - Interface moderne et responsive

### 📄 Pages
- **[ProductsPage Features](./PRODUCTS_PAGE_FEATURES.md)** - Fonctionnalités de la page de gestion des produits
  - Chargement dynamique depuis Firestore
  - Filtrage par catégories
  - Recherche avancée
  - Interface utilisateur optimisée

### 🔐 Configuration Firebase
- **[Firestore Rules](./firestore-rules-updated.txt)** - Règles de sécurité Firestore
  - Permissions pour les collections users, categories, products
  - Contrôle d'accès basé sur les rôles (admin/super_admin)
  - Règles de sécurité optimisées

## 🏗️ Architecture du Projet

### Services
```
src/services/
├── database.js           # Configuration Firebase principale
├── categoriesService.js  # CRUD pour les catégories
└── productsService.js    # CRUD pour les produits
```

### Composants Admin
```
src/components/admin/
├── ProductAddForm.tsx    # Formulaire d'ajout/modification de produits
├── ProductDeleteModal.tsx # Modal de suppression de produits
├── CategoryAddForm.tsx   # Formulaire d'ajout/modification de catégories
└── AdminLayout.tsx       # Layout principal admin
```

### Pages Admin
```
src/pages/admin/
├── ProductsPage.tsx      # Gestion des produits
├── CategoriesPage.tsx    # Gestion des catégories
├── DashboardPage.tsx     # Tableau de bord
└── [autres pages admin...]
```

### Types TypeScript
```
src/types/
├── products.ts           # Types pour les produits
├── categories.ts         # Types pour les catégories
├── productsService.d.ts  # Déclarations pour productsService
└── categoriesService.d.ts # Déclarations pour categoriesService
```

## 🚀 Fonctionnalités Principales

### ✅ Gestion des Produits
- ✅ Ajout de produits avec upload d'images
- ✅ Modification et suppression
- ✅ Filtrage par catégories
- ✅ Recherche avancée
- ✅ Gestion des statuts (disponible/indisponible, spécial)

### ✅ Gestion des Catégories  
- ✅ Ajout/modification/suppression de catégories
- ✅ Catégories prédéfinies avec option personnalisée
- ✅ Gestion de la visibilité
- ✅ Intégration avec les produits

### ✅ Upload d'Images
- ✅ Upload depuis l'ordinateur vers Cloudinary
- ✅ Alternative URL manuelle
- ✅ Aperçu en temps réel
- ✅ Validation de fichiers (type, taille)

### ✅ Interface Admin
- ✅ Design responsive et moderne
- ✅ États de chargement
- ✅ Notifications utilisateur
- ✅ Gestion des erreurs

## 📊 Technologies Utilisées

- **Frontend** : React + TypeScript + Tailwind CSS
- **Backend** : Firebase Firestore + Authentication
- **Images** : Cloudinary
- **Icons** : Lucide React
- **Notifications** : React Toastify
- **Build** : Vite

## 🔧 Configuration Requise

### Firebase
1. Projet Firebase configuré
2. Firestore activé avec les règles de sécurité
3. Authentication activée
4. Configuration dans `src/services/database.js`

### Cloudinary
1. Compte Cloudinary configuré
2. Upload preset configuré
3. Credentials dans `src/services/database.js`

## 📝 Notes de Développement

- Les services JavaScript utilisent des imports avec `@ts-ignore` pour éviter les erreurs TypeScript
- Les règles Firestore utilisent une vérification de rôle basée sur les documents users
- L'upload d'images suit le flux : Sélection → Cloudinary → URL → Firebase
- Le filtrage des produits combine requêtes Firestore (catégories) et filtrage client (recherche)

## 🎯 Prochaines Étapes

1. **Tests** : Ajouter des tests unitaires pour les composants
2. **SEO** : Optimiser pour les moteurs de recherche
3. **PWA** : Transformer en Progressive Web App
4. **Analytics** : Ajouter le suivi des performances
5. **Cache** : Implémenter un système de cache avancé

---

*Dernière mise à jour : Juillet 2025*
