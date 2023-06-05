require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');
const mongoose = require('mongoose');
const path = require('path');

mongoose
  .connect(
    'mongodb+srv://test:test@cluster0.yjc4vpz.mongodb.net/?retryWrites=true&w=majority',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();
// permet de créer une application express

// premier middleware générale (appliqué à toutes les routes) exécuté dans notre code pour rajouter des header et
// données les autorisations pour les requêtes en toutes sécutité
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  //   permet d'accéder à notre API depuis n'importe quelle origine ( '*' )
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'
    // permet d'ajouter les headers mentionnés aux requêtes envoyées vers notre API (Origin , X-Requested-With , etc.)
  );
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
    // permet d'envoyer des requêtes avec les méthodes mentionnées ( GET ,POST , etc.)
  );
  next();
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// nous permet de récupérer corps de réponse json qui va être envoyé à notre endpoint http /api/book
// Express prend toutes les requêtes qui ont comme Content-Type  application/json  et met à disposition leur  body  directement sur l'objet req, ce qui nous permet d'écrire le middleware POST
// on peut faire ça avec une methode body.parser mai methode ancienne
app.use(cors());

app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));
// Pour créer et concaténer un chemin vers le dossier images

module.exports = app;
// permet de l'exporter aux autres fichiers pour qu'on puisse s'en servir surtout avec notre fichier node
