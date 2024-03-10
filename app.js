const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const db = require("./models");
const redis = require("./utils/redis");

redis.InitRedis();
