const mongoose = require("mongoose");

// Membuat model/shcema
const Profile = mongoose.model("Profile", {
  nama: {
    type: String,
    required: true,
  },
  alamat: {
    type: String,
    required: true,
  },
  noHp: {
    type: String,
    required: true,
  },
});

module.exports = Profile;
