const jwt = require("jsonwebtoken");

module.exports = {
  CreateToken: (payload) => {
    const token = jwt.sign(payload, "DKJHSDKHAKHKSHDKNHK", {
      algorithm: "HS256",
      expiresIn: "30m",
    });
    return token;
  },
  VerifyToken: (token) => {
    let decoded = jwt.verify(token, "DKJHSDKHAKHKSHDKNHK");
    return decoded;
  },
  CreateRefreshToken: (payload) => {
    const token = jwt.sign(payload, "dshadsafnbjsbv", {
      algorithm: "HS256",
      expiresIn: "15d",
    });
    return token;
  },
  VerifyRefreshToken: (token) => {
    let decoded = jwt.verify(token, "dshadsafnbjsbv");
    return decoded;
  },
};
