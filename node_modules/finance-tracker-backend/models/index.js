const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '..', 'database.sqlite'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
});

// Import models
const User = require('./User')(sequelize);
const Transaction = require('./Transaction')(sequelize);
const Budget = require('./Budget')(sequelize);
const RecurringTransaction = require('./RecurringTransaction')(sequelize);
const Subscription = require('./Subscription')(sequelize);

// Define associations
User.hasMany(Transaction, { foreignKey: 'userId', onDelete: 'CASCADE' });
Transaction.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Budget, { foreignKey: 'userId', onDelete: 'CASCADE' });
Budget.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(RecurringTransaction, { foreignKey: 'userId', onDelete: 'CASCADE' });
RecurringTransaction.belongsTo(User, { foreignKey: 'userId' });

User.hasOne(Subscription, { foreignKey: 'userId', onDelete: 'CASCADE' });
Subscription.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Transaction,
  Budget,
  RecurringTransaction,
  Subscription
};