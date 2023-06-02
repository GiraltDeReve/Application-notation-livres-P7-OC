const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  // unique:true permet aux utilisateurs de pas s'inscrire plusieurs fois avec la même adresse
  // mais on peut aussi et c'est mieux, utiliser un paquage
  password: { type: String, required: true },
});

userSchema.plugin(uniqueValidator);
module.exports = mongoose.model("User", userSchema);
