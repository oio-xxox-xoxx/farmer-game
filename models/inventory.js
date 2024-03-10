module.exports = (seqeulize, DataTypes) => {
  const inventory = seqeulize.define(
    "inventory",
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      farmer_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      seed_id: {
        type: DataTypes.STRING,
      },
      seed_type: {
        type: DataTypes.STRING,
      },
    },
    {
      freezeTableName: true,
      timestamps: false,
    }
  );
  return inventory;
};
