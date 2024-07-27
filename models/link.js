const { Sequelize, DataTypes } = require("sequelize");
require('dotenv').config();
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

const Linkuser = sequelize.define('Linkuser', {

  email: {
    type: DataTypes.STRING,
    allowNull: false, // This line ensures email is not null
    unique: true // If email should be unique
  } ,

  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'users',
  timestamps: false
});

const Link = sequelize.define('Link', {
  shortURL: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  longURL: {
    type: DataTypes.STRING,
    allowNull: false
  },
  visitCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  }
}, {
  tableName: 'links',
  timestamps: false
});
// Establish relationships
Linkuser.hasMany(Link, { foreignKey: 'userId' }); // A user can have many links
Link.belongsTo(Linkuser, { foreignKey: 'userId' }); // A link belongs to a user

module.exports = { Linkuser, Link, sequelize };
