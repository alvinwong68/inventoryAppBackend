const { admin, db } = require("../utility/admin");
const firebase = require("firebase");
const firebaseConfig = require("../utility/firebaseConfig");
firebase.initializeApp(firebaseConfig);

module.exports = {
  createUser: (req, res) => {
    const { email, password, displayName, role } = req.body;

    if (!email || !password || !displayName || !role) {
      return res.status(400).json({
        errMsg: "Invalid Input. Missing fields",
      });
    }

    const usersCollection = db.collection("users");
    let userId;
    admin
      .auth()
      .createUser({
        displayName,
        password,
        email,
      })
      .then((data) => {
        userId = data.uid;
        return admin.auth().setCustomUserClaims(data.uid, { role });
      })
      .then(() => {
        return usersCollection.add({ id: userId, role, displayName, email });
      })
      .then(() => {
        res.status(201).json({ id: userId, role, displayName, email });
      })
      .catch((err) => {
        return res.status(500).json({
          errMsg: `${err.message}`,
        });
      });
  },

  login: (req, res) => {
    const { password, email } = req.body;
    if (!password || !email) {
      return res.status(400).json({
        errMsg: "Invalid Input. Missing fields",
      });
    }

    let authDetails = {};

    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((data) => {
        return data.user.getIdToken();
      })
      .then((token) => {
        authDetails.idToken = token;
        return admin.auth().verifyIdToken(token);
      })
      .then((decodedToken) => {
        authDetails.expiresIn = decodedToken.exp - decodedToken.iat;
        authDetails.localId = decodedToken.uid;
        authDetails.name = decodedToken.name;
        authDetails.role = decodedToken.role;
        authDetails.email = decodedToken.email;
        return res.json(authDetails);
      })
      .catch((err) => {
        return res.status(403).json({
          errMsg: err.message,
        });
      });
  },

  userDetail: (req, res) => {
    const userId = req.user.uid;

    db.collection("users")
      .where("id", "==", userId)
      .get()
      .then((data) => {
        if (data.empty) {
          return res.status(400).json({
            errMsg: "Sorry. Unable to get user detail",
          });
        } else {
          let userDetail = {};
          //always return an element in an array
          data.forEach((doc) => {
            userDetail = { ...doc.data() };
          });
          return res.status(200).json(userDetail);
        }
      })
      .catch((err) => {
        return res.status(400).json({
          errMsg: "Something went wrong. Unable to fetch user detail",
        });
      });
  },

  users: (req, res) => {
    let userList = [];

    db.collection("users")
      .get()
      .then((data) => {
        data.forEach((doc) => {
          console.log(req.user);
          if (doc.data().id !== req.user.uid) {
            userList.push(doc.data());
          }
        });
        return res.status(200).json({ userList: userList });
      })
      .catch((err) => {
        console.log(err);
        return res.status(400).json({
          errMsg: "Something went wrong. Unable to fetch user list",
        });
      });
  },
};
