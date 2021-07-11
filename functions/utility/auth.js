const { admin } = require("./admin");

const isAuthenticated = (req, res, next) => {
  //grab token from req header
  const { authorization } = req.headers;

  if (!authorization) return res.status(401).send({ message: "Unauthorized" });

  if (!authorization.startsWith("Bearer"))
    return res.status(401).send({ message: "Unauthorized" });

  const split = authorization.split("Bearer ");
  if (split.length !== 2)
    return res.status(401).send({ message: "Unauthorized" });

  const token = split[1];

  admin
    .auth()
    .verifyIdToken(token)
    .then((decodedToken) => {
      req.user = decodedToken;
      return next();
    })
    .catch((err) => {
      return res.status(401).send({ message: "Unauthorized" });
    });
};

const isAuthorized = (config) => {
  return (req, res, next) => {
    const user = { ...req.user };

    if (user.email === "root@domain.com") {
      return next();
    }

    if (!user.role) {
      return res.status(403).json({
        errMsg: "Unauthorized",
      });
    }

    if (config.roles.includes(user.role)) {
      return next();
    }

    return res.status(403).json({
      errMsg: "Unauthorized",
    });
  };
};

module.exports = { isAuthenticated, isAuthorized };
