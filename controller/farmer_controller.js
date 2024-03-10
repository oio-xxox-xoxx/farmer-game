const db = require("../models");
const bcrypt = require("bcryptjs");
const { QueryTypes } = require("sequelize");
const shortid = require("shortid");
const { jwt, redis } = require("../utils");
const farmers = require("../models/farmers");

//seed_time =심은시간
const check_crop_status = (seed_time, grow_time) => {
  const now = new Date();
  const seed_time_to_date = new Date(seed_time);
  //console.log(now, seed_time_to_date, typeof seed_time_to_date);
  const miliseconds = now - seed_time_to_date;
  //console.log(miliseconds);
  //mili -> 1000 -> 1s -> 60s -> 1m -> 60m -> 1h
  const hours = Math.floor(miliseconds / (60 * 60 * 1000));
  //console.log(hours);
  if (hours >= grow_time) {
    return "수확 가능";
  } else {
    return "성장중";
  }
};

module.exports = {
  ChkDuplicate: async (req, res) => {
    try {
      let { chk_type, chk_value } = req.body;
      let db_con = {};
      if (chk_type == "login_id") {
        db_con = {
          where: {
            login_id: chk_value,
          },
        };
      } else if (chk_type == "nickname") {
        db_con = {
          where: {
            nickname: chk_value,
          },
        };
      } else {
        return res.json({ alert: "chk_type" });
      }

      const duplicate = await db.farmers.findOne(db_con);
      if (duplicate != null) {
        return res.json({ duplicate: true });
      }
      return res.json({ duplicate: false });
    } catch (error) {
      return res.json({ error: error.toString() });
    }
  },

  SignUp: async (req, res) => {
    const tx = await db.sequelize.transaction();
    try {
      req.body.pw = bcrypt.hashSync(req.body.pw, bcrypt.genSaltSync(8));
      req.body.id = shortid.generate();
      await db.farmers.create(req.body, {
        transaction: tx,
      });
      await db.farms.create(
        {
          id: shortid.generate(),
          farmer_id: req.body.id,
          location: "집 앞",
          size: 9,
        },
        {
          transaction: tx,
        }
      );
      await db.inventory.create(
        {
          id: shortid.generate(),
          farmer_id: req.body.id,
          seed_id: "seed-1",
          seed_type: "씨앗",
        },

        {
          transaction: tx,
        }
      );
      await db.inventory.create(
        {
          id: shortid.generate(),
          farmer_id: req.body.id,
          seed_id: "seed-2",
          seed_type: "씨앗",
        },

        {
          transaction: tx,
        }
      );
      await db.inventory.create(
        {
          id: shortid.generate(),
          farmer_id: req.body.id,
          seed_id: "seed-3",
          seed_type: "씨앗",
        },

        {
          transaction: tx,
        }
      );
      await tx.commit();
      return res.json({ result: "성공적으로 가입이 완료되었습니다." });
    } catch (error) {
      await tx.rollback();
      return res.json({ error: error.toString() });
    }
  },

  SignIn: async (req, res) => {
    try {
      let { id, pw } = req.body;
      const user = await db.farmers.findOne({
        where: {
          login_id: id,
        },
      });
      if (user == null) {
        return res.json({ result: "없는 아이디" });
      }
      let refresh_token = jwt.CreateRefreshToken({
        id: user.id,
      });
      //1. user_id 2. refeshtoken
      await redis.SetRedis({
        key: refresh_token,
        value: user.id,
      });
      if (bcrypt.compareSync(pw, user.pw)) {
        return res.json({
          nickname: user.nickname,
          access_token: jwt.CreateToken({
            id: user.id,
            nickname: user.nickname,
          }),
          refresh_token: refresh_token,
        });
      }
      return res.json({ result: "비밀번호 틀림" });
    } catch (error) {
      return res.json({ error: error.toString() });
    }
  },
  UserStatus: async (req, res) => {
    try {
      //authorization은 인증이라는 뜻 ㅋㅋ
      let { authorization } = req.headers;
      let decoded = jwt.VerifyToken(authorization);
      console.log(decoded);
      const user = await db.farmers.findOne({
        where: {
          id: decoded.id,
        },
      });
      const farms = await db.farms.findAll({
        where: {
          farmer_id: decoded.id,
        },
      });
      return res.json({
        farmer: user,
        farms: farms,
      });
    } catch (error) {
      return res.json({ error: error.toString() });
    }
  },

  Inventory: async (req, res) => {
    try {
      let { authorization } = req.headers;
      console.log(authorization);
      let decoded = jwt.VerifyToken(authorization);
      const rows = await db.sequelize.query(
        `select i.id, i.seed_type, s.seed_name, s.seed_price, s.growup_time, s.crop_name, s.crop_price 
      from inventory i inner join seeds s 
      on i.seed_id = s.id where i.farmer_id = ?`,
        {
          type: QueryTypes.SELECT,
          replacements: [decoded.id],
        }
      );
      console.log(rows);
      return res.json(rows);
    } catch (error) {
      return res.json({ error: error.toString() });
    }
  },

  Crops: async (req, res) => {
    const tx = await db.sequelize.transaction();
    try {
      let { farm_id, seed_id, size, inven_id } = req.body;
      let { authorization } = req.headers;
      let decoded = jwt.VerifyToken(authorization);
      let farmer_id = decoded.id;
      const crop_count = await db.crops.count({
        where: {
          farmer_id: farmer_id,
          farm_id: farm_id,
        },
        transaction: tx,
      });
      if (size <= crop_count) {
        await tx.rollback();
        return res.json({
          result: "더 이상 작물을 심을 수 있는 땅이 없습니다",
        });
      }

      await db.crops.create(
        {
          id: shortid.generate(),
          seed_id: seed_id,
          farm_id: farm_id,
          farmer_id: farmer_id,
        },
        {
          transaction: tx,
        }
      );
      await db.inventory.destroy(
        {
          where: {
            id: inven_id,
          },
        },
        {
          transaction: tx,
        }
      );
      await tx.commit();
      return res.json({ result: "씨앗을 심었습니다" });
    } catch (error) {
      await tx.rollback();
      return res.json({ error: error.toString() });
    }
  },
  FarmStatus: async (req, res) => {
    try {
      let { authorization } = req.headers;
      let decoded = jwt.VerifyToken(authorization);
      let { id } = req.query;
      //console.log("query >>> ", id);
      /**
       *  farms를 조회하는데 join을 crops랑 할 거
       *
       */
      const myfarm = await db.sequelize.query(
        `select farms.id as farm_id, farms.size, crops.id, crops.createdAt,
        seeds.seed_name, seeds.id as seed_id, seeds.growup_time from farms 
        inner join crops on farms.id = crops.farm_id 
        inner join seeds on crops.seed_id = seeds.id 
        where farms.farmer_id = ? and farms.id = ?`,
        {
          type: QueryTypes.SELECT,
          replacements: [decoded.id, id],
        }
      );
      //console.log(myfarm);
      for (let i = 0; i < myfarm.length; i++) {
        //console.log("for문", i, "번쨰 >>", myfarm[i]);
        myfarm[i].crop_status = check_crop_status(
          myfarm[i].createdAt,
          myfarm[i].growup_time
        );
      }
      return res.json(myfarm);
    } catch (error) {
      return res.json({ error: error.toString() });
    }
  },

  Crop_harvest: async (req, res) => {
    const tx = await db.sequelize.transaction();
    try {
      let { crop_id, farm_id, seed_id } = req.body;
      let { authorization } = req.headers;
      let decoded = jwt.VerifyToken(authorization);

      await db.inventory.create(
        {
          id: shortid.generate(),
          farmer_id: decoded.id,
          seed_type: "작물",
          seed_id: seed_id,
        },
        {
          transaction: tx,
        }
      );
      await db.crops.destroy({
        where: {
          farm_id: farm_id,
          id: crop_id,
          farmer_id: decoded.id,
        },

        transaction: tx,
      });
      await tx.commit();
      return res.json({ result: "수확완료" });
    } catch (error) {
      await tx.rollback();
      return res.json({ error: error.toString() });
    }
  },

  Storelist: async (req, res) => {
    try {
      const seeds = await db.seeds.findAll();
      return res.json(seeds);
    } catch (error) {
      return res.json({ error: error.toString() });
    }
  },

  Buyseed: async (req, res) => {
    const tx = await db.sequelize.transaction();
    try {
      let { authorization } = req.headers;
      let decoded = jwt.VerifyToken(authorization);
      let { seed_id, seed_price } = req.body;
      await db.inventory.create(
        {
          id: shortid.generate(),
          farmer_id: decoded.id,
          seed_id: seed_id,
          seed_type: "씨앗",
        },
        {
          transaction: tx,
        }
      );
      await db.farmers.update(
        { money: db.sequelize.literal("money-?", seed_price) },
        { where: { id: decoded.id }, transaction: tx }
      );
      const farmer = await db.farmers.findOne({
        where: {
          id: decoded.id,
        },
      });
      if (farmer.money < seed_price) {
        await tx.rollback();
        return res.json({
          result: "소지금이 부족하여 씨앗을 구매할 수 없습니다",
        });
      }
      await tx.commit();
      return res.json({ result: "씨앗을 구입했다" });
    } catch (error) {
      await tx.rollback();
      return res.json({ error: error.toString() });
    }
  },

  Sellcrop: async (req, res) => {
    const tx = await db.sequelize.transaction();
    try {
      let { authorization } = req.headers;
      let decoded = jwt.VerifyToken(authorization);
      let { inventory_id, crop_price } = req.body;
      await db.inventory.destroy(
        {
          id: inventory_id,
          farmer_id: decoded.id,
          seed_type: "작물",
        },
        {
          transaction: tx,
        }
      );
      await db.farmers.update(
        {
          money: db.sequelize.literal("money+?", crop_price),
        },
        { where: { id: decoded.id }, transaction: tx }
      );
      await tx.commit();
      return res.json({ result: " 작물 판매 완" });
    } catch (error) {
      await tx.rollback();
      return res.json({ error: error.toString() });
    }
  },
  RefreshToken: async (req, res) => {
    try {
      let { authorization } = req.headers;
      const redis_data = await redis.GetRedis(authorization);
      if (redis_data == null) {
        return res.json({
          error: "invaild token",
        });
      }
      let decoded = jwt.VerifyRefreshToken(authorization);
      if (decoded.id != redis_data) {
        return res.json({
          error: "invaild token",
        });
      }
      const user = await db.farmers.findOne({
        where: {
          id: decoded.id,
        },
      });

      return res.json({
        access_token: jwt.CreateToken({
          id: user.id,
          nickname: user.nickname,
        }),
      });
    } catch (error) {
      return res.json({
        error: error.toString(),
      });
    }
  },
};
