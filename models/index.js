const fs = require("fs");
const path = require("path");
const { Sequelize, DataTypes, Op, QueryTypes } = require("sequelize");
const basename = path.basename(__filename);

const sequelize = new Sequelize("farmergamedb", "root", "111111", {
  host: "127.0.0.1",
  port: 3306,
  dialect: "mysql",
  operatorsAliases: 0,
  timezone: "+09:00",
  dialectOptions: {
    charset: "utf8mb4",
    dateStrings: true,
    typeCast: true,
  },
  pool: {
    max: 5,
    min: 1,
    idle: 1000,
  },
  ssl: false,
});

let db = [];

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file))(sequelize, DataTypes);
    db[model.name] = model;
  });
db.sequelize = sequelize;
db.Op = Op;
db.QueryTypes = QueryTypes;

module.exports = db;
