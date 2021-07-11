const { db } = require("../utility/admin");
const { isEmpty } = require("../utility/validators");

module.exports = {
  //Create one inventory
  createOne: (req, res) => {
    if (!req.body.description || !req.body.title || !req.body.quantity) {
      return res.status(400).json({
        errorMsg: "Invalid Input. Please check again.",
      });
    }

    const { description, quantity, title } = req.body;

    const newInventory = {
      description: description.trim(),
      quantity: +quantity,
      title: title.trim().toUpperCase(),
      createdDate: new Date().toISOString(),
    };

    const collection = db.collection("inventory");

    collection
      .where("title", "==", newInventory.title)
      .get()
      .then((data) => {
        //check item with same title exists in db
        if (!data.empty) {
          return res.status(500).json({
            errMsg:
              "Item with similar title exist in database. Please input another title",
          });
        } else {
          //if item title dont exist, add to db
          return collection.add(newInventory);
        }
      })
      .then((doc) => {
        const resInventory = { ...newInventory };
        resInventory.id = doc.id;
        return res.status(201).json(resInventory);
      })
      .catch((err) => {
        return res.status(500).json({
          errMsg: "Something went wrong;",
        });
      });
  },

  //Get all Inventory
  readAll: (req, res) => {
    db.collection("inventory")
      .orderBy("createdDate", "desc")
      .get()
      .then((data) => {
        let inventories = [];
        data.forEach((doc) => {
          inventories.push({
            id: doc.id,
            description: doc.data().description,
            title: doc.data().title,
            createdDate: doc.data().createdDate,
            quantity: doc.data().quantity,
          });
        });
        return res.status(200).json(inventories);
      })
      .catch((err) => {
        res.status(500).json({
          errMsg: "Something went wrong;",
        });
      });
  },

  //Delete one inventory
  deleteOne: (req, res) => {
    const itemId = req.params.itemId;
    const document = db.doc(`inventory/${itemId}`);

    document
      .get()
      .then((doc) => {
        if (!doc.exists) {
          return res.status(404).json({ errMsg: "Item not found" });
        }
        return document.delete();
      })
      .then(() => {
        return res.status(200).json({
          msg: `Item Successfully deleted`,
        });
      })
      .catch((err) => {
        return res.status(500).json({
          errMsg: "Something went wrong. Please try again",
        });
      });
  },

  //update one
  updateOne: (req, res) => {
    let updateItem = {};

    if (req.body.description) {
      updateItem.description = req.body.description.trim();
    }
    if (!isNaN(req.body.quantity)) {
      updateItem.quantity = +req.body.quantity;
    }

    if (Object.keys(updateItem).length == 0 || updateItem.quantity < 0) {
      return res.status(500).json({
        errMsg: "Invalid Input. Please check again. Nothing updated",
      });
    }

    const itemId = req.params.itemId;
    const document = db.doc(`inventory/${itemId}`);

    document
      .get()
      .then((doc) => {
        if (!doc.exists) {
          return res.status(404).json({ errMsg: "Item not found" });
        }
        //update item in db
        return document.update(updateItem);
      })
      .then(() => {
        return res.status(200).json({
          msg: "successful Updated",
        });
      })
      .catch((err) => {
        return res.status(500).json({
          errMsg: "Something went wrong. Please try again",
        });
      });
  },
};
