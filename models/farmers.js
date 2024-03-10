module.exports = (seqeulize, DataTypes) => {
  const farmers = seqeulize.define(
    "farmers",
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      nickname: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pw: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      money: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      login_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    {
      freezeTableName: true,
      timestamps: true,
    }
  );
  return farmers;
};
