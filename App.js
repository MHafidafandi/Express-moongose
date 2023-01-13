const express = require("express");
const expressLayouts = require("express-ejs-layouts");

require("./utils/db");
const Profile = require("./model/profileModel");
const User = require("./model/userModal");

const session = require("express-session");
const cookieParser = require("cookie-parser");
const flash = require("connect-flash");
const { body, validationResult, check } = require("express-validator");
const methodOverride = require("method-override");
const { insertMany } = require("./model/profileModel");

const app = express();
const port = 3000;

app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser("secret"));
app.use(
  session({
    cookie: { maxAge: 6000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
app.use(flash());
app.use(methodOverride("_method"));

// Halaman Home
app.get("/", (req, res) => {
  res.render("index", {
    layout: "layouts/Beranda",
    nama: "Hafid Afandi",
    title: "Halaman Home",
  });
});

// halaman about
app.get("/about", (req, res) => {
  res.render("about", {
    layout: "layouts/Beranda",
    title: "Halaman About",
  });
});

// halaman profiles
app.get("/profiles", async (req, res) => {
  const profiles = await Profile.find();
  if (req.session.user) {
    res.render("profiles", {
      layout: "layouts/main-layout",
      title: "Halaman Profils",
      profiles,
      msg: req.flash("msg"),
    });
  } else {
    res.redirect("/");
  }
});

// halaman add-profile
app.get("/profiles/add", (req, res) => {
  res.render("add-profile", {
    layout: "layouts/main-layout",
    title: "Tambah data",
  });
});

// post tambah profile
app.post(
  "/profiles",
  [
    body("nama").custom(async (value) => {
      const duplikat = await Profile.findOne({ nama: value });
      if (duplikat) {
        throw new Error("Nama Yang Anda Masukkan Sudah Terdaftar");
      }
      return true;
    }),
    check("noHp", "Yang Anda masukkan bukan No. HP Valid").isMobilePhone(
      "id-ID"
    ),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("add-profile", {
        layout: "layouts/main-layout",
        title: "Tambah data",
        errors: errors.array(),
      });
    } else {
      //   const profile = new Profile(req.body);
      //   await profile.save();
      Profile.insertMany(req.body, (err, result) => {
        // kirim flash massage
        req.flash("msg", "Data Berhasil Ditambahkan");
        res.redirect("/profiles");
      });
    }
  }
);

app.get("/profiles/edit/:nama", async (req, res) => {
  const profile = await Profile.findOne({ nama: req.params.nama });
  res.render("edit-profile", {
    layout: "layouts/main-layout",
    title: "Form ubah data",
    profile,
  });
});

app.put(
  "/profiles",
  [
    body("nama").custom(async (value, { req }) => {
      const duplikat = await Profile.findOne({ nama: value });
      if (value !== req.body.oldNama && duplikat) {
        throw new Error("Nama Yang Anda Masukkan Sudah Terdaftar");
      }
      return true;
    }),
    check("noHp", "Yang Anda masukkan bukan No. HP Valid").isMobilePhone(
      "id-ID"
    ),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("edit-profile", {
        layout: "layouts/main-layout",
        title: "Form ubah data",
        errors: errors.array(),
        profile: req.body,
      });
    } else {
      Profile.updateOne(
        { nama: req.body.oldNama },
        {
          $set: {
            nama: req.body.nama,
            alamat: req.body.alamat,
            noHp: req.body.noHp,
          },
        },
        (err, result) => {
          // kirim flash massage
          req.flash("msg", "Data Berhasil Diubah");
          res.redirect("/profiles");
        }
      );
    }
  }
);

// delete data profile
app.delete("/profiles", (req, res) => {
  Profile.deleteOne({ nama: req.body.nama }, (err, result) => {
    // kirim flash massage
    req.flash("msg", "Data Berhasil Dihapus");
    res.redirect("/profiles");
  });
});

// halaman Detail
app.get("/profiles/:nama", async (req, res) => {
  const profile = await Profile.findOne({ nama: req.params.nama });
  res.render("Detail", {
    layout: "layouts/main-layout",
    title: "Halaman Detail",
    profile,
  });
});

app.post("/daftar", (req, res) => {
  User.insertMany(req.body, (err, result) => {
    req.flash("msg", "User Berhasil Dibuat");
    res.redirect("/");
  });
});

app.post("/masuk", async (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  const user = await User.findOne({ username: username, password: password });
  if (user) {
    req.session.user = user;
    res.redirect("/profiles");
  }
});

app.get("/logout", (req, res) => {
  // Destroy the session and redirect to the login page
  req.session.destroy();
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`MongoDb Profile app | Listening At http://localhost:${port}`);
});
