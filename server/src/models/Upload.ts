import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

class Upload extends Model {
    declare id: number;
    public userId!: number;
    public filePath!: string;
    public originalName!: string;
    public customPath!: string | null;
    public isWebSite!: boolean;
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
    customPath: { // Add this section
        type: new DataTypes.STRING(128),
        allowNull: true,
        unique: true,
    },
    originalName: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isWebSite: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    sequelize,
    modelName: 'Upload',
});

Upload.belongsTo(User, { foreignKey: 'userId' });

export default Upload;
