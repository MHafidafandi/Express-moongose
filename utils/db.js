const mongoose = require("mongoose");

mongoose.set("strictQuery", false);
mongoose.connect("mongodb://127.0.0.1:27017/unesa");

// Menambah satu data
// const profil1 = new Profile({
//   nama: "Muhammad Hafid",
//   alamat: "Mojokerto",
//   noHp: 082140565565,
// });

// const user1 = new User({
//   username: "hafid",
//   password: "12345678",
// });

// // // Simpan profile
// user1.save().then((result) => console.log(result));
