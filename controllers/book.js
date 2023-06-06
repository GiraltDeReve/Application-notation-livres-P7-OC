const Book = require('../models/books');
const fs = require('fs');
const sharp = require('sharp');

exports.createBook = async (req, res, next) => {
  console.log(req.body);
  const bookObject = JSON.parse(req.body.book);
  // Avec fonction parse de JSON on parse l'objet requet parce que maintenant cet objet nous ais envoyé en chaine de caractére
  delete bookObject._id;
  delete bookObject._userId;
  // on supprime deux champs de cet objet qui nous ais renvoyé
  // l'id est généré authomatiquement par notre basse de donnée
  // on ne fait pas confiance au client donc on supprime l'userID et on va remplacer l'userId par celui du token

  const imagePath = `${req.file.destination}/${req.file.filename}`;
  // stocker le chemin de l'image téléchargée à partir de la requête
  try {
    // Redimensionner l'image
    const resizedImageBuffer = await sharp(imagePath)
      .resize({ width: 800 })
      .toBuffer();
    // Enregistrer l'image redimensionnée
    const resizedImagePath = `${req.file.destination}/resized_${req.file.filename}`;
    await fs.promises.writeFile(resizedImagePath, resizedImageBuffer);

    const book = new Book({
      // on créé l'obejt avec notre nouveau book
      ...bookObject,
      // opérateur de déversement (...) = pour déverser les propriétés de bookObject dans l'objet du livre
      userId: req.auth.userId,
      // on remplace comme dit plus le suser id avec token de authentication
      imageUrl: `${req.protocol}://${req.get('host')}/images/${
        // multer nous passe que le nom de fichier donc on doit le générer nous même
        req.file.filename
      }`,
    });

    console.log(book);
    // maintenant on sauvegarde cet objet et on gére l'erreur et le succés
    await book.save();

    res.status(201).json({ message: 'Objet enregistré !' });
  } catch (error) {
    console.error('Erreur lors de la création du livre :', error);
    res.status(400).json({ error });
  }
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({
    // méthode findOne permet de trouver un seul document correspondant aux critères de recherche
    _id: req.params.id,
    //  = critére de recherche
  })
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

exports.modifyBook = (req, res, next) => {
  // d'abord, prendre en compte deux possibilités : l'utilisateur a mis à jour l'image ou pas.
  // Si oui : nous recevrons l'élément form-data et le fichier
  // Si non : nous recevrons uniquement les données JSON.
  const bookObject = req.file
    ? // objet file (image) ou non ? Si oui, on recup notre objet en parsaant la chaine de caractére et en recréant l'url de l'image comme pécédemment
      {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  // si pas de fichier de transmis, on récupére simplpment l'objet dans le corps de la requête

  delete bookObject._userId;
  // on supprime de nouveau l'user id pour sécurité
  Book.findOne({ _id: req.params.id })
    // méthode findOne pour trouver livre dans bdd : critère de recherche est l'ID du livre
    .then((book) => {
      if (book.userId != req.auth.userId) {
        // vérif bon utilisateur (compare user id du token et celui de notre basse)
        res.status(401).json({ message: 'Not authorized' });
      } else {
        // utilisateur authorisé à modifié avec méthode updateOne pour mettre à jour le livre dans la basse de données
        Book.updateOne(
          { _id: req.params.id },
          { ...bookObject, _id: req.params.id },
          { new: true }
        )
          .then(() => res.status(200).json({ message: 'Objet modifié!' }))
          .catch((error) => res.status(401).json({ error }));
      }
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res, next) => {
  // on doit vérifier les droits d'authorisation comme on l'a fait pour chemin put
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        // utilisateur authorisé si le token correspondant dans la BDD
        res.status(401).json({ message: 'Not authorized' });
      } else {
        const filename = book.imageUrl.split('/images/')[1];
        // extraction du nom du fichier d'image à parrir de l'url de l'image du livre
        fs.unlink(`images/${filename}`, () => {
          // fonction fs.unlink pour supprimer le fichier d'image du systéme de fichiers
          Book.deleteOne({ _id: req.params.id })
            // fonction book.deleteOne pour supprimer le doc du livre de la basse de données
            .then(() => {
              res.status(200).json({ message: 'Objet supprimé !' });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getAllBook = (req, res, next) => {
  Book.find()
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

// -------------------------------------------------------RATINGS --------------------------------

exports.getBestRating = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 }) // Tri par ordre décroissant de la note moyenne
    .limit(3) // Limite à 3 résultats
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.addRating = async (req, res, next) => {
  const ratingObject = req.body;
  ratingObject.grade = ratingObject.rating;
  delete ratingObject.rating;
  // const { userId, rating } = req.body;

  try {
    const updatedBook = await Book.findOneAndUpdate(
      { _id: req.params.id },
      { $push: { ratings: ratingObject }, $inc: { totalRatings: 1 } },
      // mise à jour pour ajouter la note (ratingObject) au tableau ratings du lire avec l'id indiqué par prams.id
      //  + mise a jour avec opérateur inc pour augmenter titaRatings du livre de 1 (nombre total d'évaluation du livre)
      { new: true }
    );

    // calcul de la note moyenne du livre en itérant sur le tableau ratings
    let averageRates = 0;
    for (let i = 0; i < updatedBook.ratings.length; i++) {
      averageRates += updatedBook.ratings[i].grade;
    }
    averageRates /= updatedBook.ratings.length;

    const bookWithAverageRating = await Book.findOneAndUpdate(
      { _id: req.params.id },
      { averageRating: averageRates },
      // mise à jour note moyenne (averageRating) du livre avec la nouvelle note moyenne calculée
      { new: true }
    );

    res.status(201).json({
      message: 'Note moyenne du livre mise à jour',
      book: bookWithAverageRating,
      _id: req.params.id,
    });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
};
