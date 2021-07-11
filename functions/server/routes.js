const express = require("express");
const router = express.Router();

const inventory = require("../controllers/inventory");
const user = require("../controllers/user");
const { isAuthenticated, isAuthorized } = require("../utility/auth");

module.exports = (app) => {
  app.get("/inventories", isAuthenticated, inventory.readAll);
  app.post(
    "/inventory",
    isAuthenticated,
    isAuthorized({ roles: ["Admin"] }),
    inventory.createOne
  );
  app.delete(
    "/inventory/:itemId",
    isAuthenticated,
    isAuthorized({ roles: ["Admin"] }),
    inventory.deleteOne
  );
  app.put("/inventory/:itemId", isAuthenticated, inventory.updateOne);

  app.post("/user/login", user.login);
  app.get("/user/detail", isAuthenticated, user.userDetail);
  app.get("/users", isAuthenticated, isAuthorized({ roles: ["Admin"] }), user.users);

  app.post(
    "/user/create",
    isAuthenticated,
    isAuthorized({ roles: ["Admin"] }),
    user.createUser
  );
  app.use(router);
};
