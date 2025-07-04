// src/models/User.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

export const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,  // Sequelize gera automaticamente
    primaryKey: true
  },
  fullname: { type: DataTypes.STRING,  allowNull: false },
  email:    { type: DataTypes.STRING,  allowNull: false, unique: true },
  password: { type: DataTypes.STRING,  allowNull: true },   // hash aqui
  googleId: { type: DataTypes.STRING,  unique: true, allowNull: true },
}, {
  tableName: 'users',
});