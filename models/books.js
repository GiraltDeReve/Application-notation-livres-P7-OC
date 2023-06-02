const mongoose = require('mongoose');

const bookSchema = mongoose.Schema({
  // on utilise la fonction "shéma" de mongose" à laquelle on passe un objet qui va dicter les différent champs
  userId: { type: String, required: true },
  // on donne un titre à notre champ et on passe sa config en précisant sa nature et si il est absoluent requis ou non pour valider le champ
  title: { type: String, required: true },
  author: { type: String, required: true },
  imageUrl: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  ratings: [
    {
      userId: { type: String, required: true },
      grade: { type: Number, required: true },
    },
  ],
  averageRating: { type: Number, required: true },
});

module.exports = mongoose.model('Book', bookSchema);
//on exporte le module terminé
// pour exporter notre champs, on doit utiliser la fonctione model avec en premier argument le nom du type du model et en deuxiéme le scham qu'on veut utiliser
