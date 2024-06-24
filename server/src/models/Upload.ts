import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

class Upload extends Model {
    declare id: number;
    public userId!: number;
    public filePath!: string;
    public originalName!: string;
}

Upload.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    filePath: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    originalName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'Upload',
});

Upload.belongsTo(User, { foreignKey: 'userId' });

export default Upload;
