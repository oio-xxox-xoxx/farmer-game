module.exports = (seqeulize, DataTypes) => {
  const seeds = seqeulize.define(
    "seeds",
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      seed_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      seed_price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      crop_name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      crop_price: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      growup_time: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );
  return seeds;
};
