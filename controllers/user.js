const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/users');

exports.signup = (req, res, next) => {
  bcrypt
    // fonction asynchrone qui renvoie une Promise dans laquelle nous recevons le hash généré ;
    .hash(req.body.password, 10)
    // fonction pour hasher(crypter) un mdp
    // 10 correspond au nombre de fois où on fait tourner l'algorithme pour faire cryper le mdp
    // attention ça prend du temps et donc il faut pas voir trop gros
    .then((hash) => {
      // nous créons un utilisateur et l'enregistrons dans la base de données, en renvoyant une réponse de réussite en cas de succès, et des erreurs avec le code d'erreur en cas d'échec.
      const user = new User({
        email: req.body.email,
        password: hash,
      });
      user
        .save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch((error) => {
          console.log(error);
          console.log(user);
          res.status(400).json({
            error: error,
          });
        });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).json({
        error: error,
      });
    });
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then((user) => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
        // message d'erreur un peu flou car on ne veut pas qu'une personne malveillante comprenne le soucis
      }
      bcrypt
        .compare(req.body.password, user.password)
        // / on utilise la fonction compare de bcrypt pour comparer mdp saisie par utilisateur et ce qui est stocké dans basse de donné
        .then((valid) => {
          if (!valid) {
            // si réponse différente de valid, signifie que rien ne corespond et on reste vague dans message error
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign({ userId: user._id }, 'RANDOM_TOKEN_SECRET', {
              // utilisation de la fonction sign de jsonwebtoken pour chiffer un nouveau token
              // ce token contient l'id de l'utilisateur en tant que payload (donées encodées)
              // RANDOM TOKEN SECRET : chaine secréte de développement temporaire pour crypter le token (normalement chaine alératoire mais là simple pour l'exo)
              expiresIn: '24h',
              // définition de la durée du token. ici au bout de 24h, l'utilisateur doit se reco.
            }),
          });
        })
        .catch((error) => res.status(500).json({ error }));
      // on verif erreur d'exécution et non pas erreur mdp non trouvé dans bdd
    })
    .catch((error) => res.status(500).json({ error }));
};
// en cas d'erreur d'exécution de requêtes dans basse de données et non quand l'utilisateur n'existe pas et pas trouvé dans basse de donnée
