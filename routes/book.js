const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const bookCtrl = require('../controllers/book');

router.get('/', bookCtrl.getAllBook);
router.post('/', auth, multer, bookCtrl.createBook);
router.get('/bestrating', bookCtrl.getBestRating);
router.post('/:id/rating', auth, bookCtrl.addRating);
router.get('/:id', bookCtrl.getOneBook);
router.put('/:id', auth, multer, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);

// premiérement vérif de l'authentification puis ensuite multer pour envoi fichiers
// en rajoutant multer, le format de la requpete change, donc on doit modifier les routes dans le fichier book de controlers (les routes)
module.exports = router;
