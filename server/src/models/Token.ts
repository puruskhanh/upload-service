import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

class Token extends Model {
  declare id: number;
  public userId!: number;
  public token!: string;
  public createdAt!: Date;
  public updatedAt!: Date;
  public expiresAt!: Date;
  public permissionLevel!: number;
}

export enum PermissionLevel {
  READ = 1,
  READ_WRITE = 2,
  READ_WRITE_DELETE = 3,
  ADMIN = 4,
}

Token.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  permissionLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: PermissionLevel.READ,
  },
}, {
  sequelize,
  modelName: 'Token',
});

Token.belongsTo(User, { foreignKey: 'userId' });

export default Token;
