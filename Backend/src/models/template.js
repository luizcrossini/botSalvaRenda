import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';


export const Template = sequelize.define('Template', {
  id:            { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true},
  userId:        { type: DataTypes.UUID, allowNull: false , field:'user_id'},
  imageUrl:      { type: DataTypes.STRING, allowNull: false },
  affiliateLink: { type: DataTypes.STRING, allowNull: true, defaultValue:''},
  publicId:   { type: DataTypes.STRING, allowNull: true, field:'public_id' },
  imageUrl:   { type: DataTypes.STRING, allowNull: false },
  content:    { type: DataTypes.TEXT,   allowNull: true  }
}, {
  tableName: 'templates',
  underscored: true,
  timestamps: true
});

