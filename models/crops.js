module.exports = (seqeulize, DataTypes) => {
  const crops = seqeulize.define(
    "crops",
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      seed_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      farm_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      farmer_id: {
        type: DataTypes.STRING,
      },
    },
    {
      freezeTableName: true,
      timestamps: true,
    }
  );
  return crops;
};
