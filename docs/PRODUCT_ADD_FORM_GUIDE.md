# Composant ProductAddForm - Guide d'utilisation

## Fonctionnalités

Le composant `ProductAddForm` permet d'ajouter et de modifier des produits avec les fonctionnalités suivantes :

### 1. Gestion des images
- **Upload de fichiers locaux** : L'utilisateur peut sélectionner une image depuis son ordinateur
- **Upload vers Cloudinary** : L'image est automatiquement uploadée vers Cloudinary
- **URL manuelle** : Possibilité d'entrer une URL d'image directement
- **Aperçu en temps réel** : Visualisation de l'image avant sauvegarde
- **Validation** : Vérification du type de fichier (images uniquement) et de la taille (max 5MB)

### 2. Formulaire complet
- **Nom du produit** (obligatoire)
- **Catégorie** (chargée depuis Firestore, obligatoire)
- **Prix** (obligatoire, validation > 0)
- **Description** (optionnelle)
- **Image** (optionnelle)
- **Statut de disponibilité** (disponible/indisponible)
- **Produit spécial** (mis en avant ou non)

### 3. Interface utilisateur
- **Design responsif** : S'adapte aux écrans mobiles et desktop
- **Modal moderne** : Interface en overlay avec fond semi-transparent
- **États de chargement** : Indicateurs visuels pendant les opérations
- **Messages de feedback** : Notifications de succès et d'erreur
- **Validation en temps réel** : Messages d'erreur immédiats

## Processus d'upload d'image

1. **Sélection du fichier** : L'utilisateur clique sur le bouton "Sélectionner une image"
2. **Validation** : Vérification du type et de la taille du fichier
3. **Aperçu local** : Affichage immédiat de l'image sélectionnée
4. **Upload Cloudinary** : Clic sur le bouton "Uploader" pour envoyer vers Cloudinary
5. **Confirmation** : Message de succès et URL récupérée
6. **Sauvegarde** : L'URL Cloudinary est envoyée à Firebase lors de la soumission

## Utilisation

```tsx
import { ProductAddForm } from './components/admin/ProductAddForm';

function MyComponent() {
  const [showForm, setShowForm] = useState(false);

  const handleSuccess = () => {
    // Callback appelé après la sauvegarde réussie
    console.log('Produit sauvegardé !');
    // Recharger la liste des produits si nécessaire
  };

  return (
    <>
      <button onClick={() => setShowForm(true)}>
        Ajouter un produit
      </button>
      
      <ProductAddForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSuccess={handleSuccess}
        currentProduct={null} // null pour ajout, objet Product pour modification
      />
    </>
  );
}
```

## Services utilisés

- **categoriesService** : Pour charger la liste des catégories disponibles
- **productsService** : Pour sauvegarder les produits dans Firestore
- **database.uploadImageToCloudinary** : Pour uploader les images vers Cloudinary

## Dépendances

- React Hooks (useState, useEffect)
- Lucide React (icônes)
- React Toastify (notifications)
- Firebase Firestore (base de données)
- Cloudinary (stockage d'images)

## Notes techniques

- Le composant utilise des imports avec `@ts-ignore` pour éviter les erreurs TypeScript avec les services JavaScript
- Les images sont validées côté client avant upload
- L'URL Cloudinary est prioritaire sur l'URL manuelle lors de la sauvegarde
- Le composant gère automatiquement le nettoyage des états lors de la fermeture
