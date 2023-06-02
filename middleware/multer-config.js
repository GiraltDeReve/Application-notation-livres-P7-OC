const multer = require("multer");

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
};
//   Une sorte de bibliothéque qu'on passe à notre fonction storage

// Constante storage , à passer à multer comme configuration, qui contient la logique
// nécessaire pour indiquer à multer où enregistrer les fichiers entrants :
const storage = multer.diskStorage({
  // fonction de multer qui dit qu'on va enregistrer sur le disk
  destination: (req, file, callback) => {
    // la fonction destination indique à multer d'enregistrer les fichiers dans le dossier images ;
    // cette fonction a besoin de deux arguments qui dit où on va l'enregister (prends elle mêeme trois arguments)
    callback(null, "images");
    // dans destination on passe le callback avec null pour dire pas d'erreur en premier argument et le nom du deuxiéme argument avec le nom du fichier
  },
  filename: (req, file, callback) => {
    // la fonction filename indique à multer d'utiliser le nom d'origine, de remplacer
    const name = file.originalname.split(" ").join("_");
    // on stock le nom d'origine du fichier en enlevant les espaces et en les remplaçant par des _
    const extension = MIME_TYPES[file.mimetype];
    // utilise ensuite la constante dictionnaire de type MIME pour résoudre l'extension de fichier appropriée.
    callback(null, name + Date.now() + "." + extension);
    // on génére avec notre callback un nom de fichier unique puisqu'on y ajoute la date à la seconde pret
  },
  // deuxiéme argumentqui explique a multer quel nom de fichier utiliser à la place de celui d'origine (evite soucis si fichiers ont un même nom d'origine)
});

module.exports = multer({ storage: storage }).single("image");
// Nous exportons ensuite l'élément multer entièrement configuré, lui passons notre constante storage et lui indiquons que nous gérerons uniquement les téléchargements de fichiers image.
