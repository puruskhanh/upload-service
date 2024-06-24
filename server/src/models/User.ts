import { DataTypes, Model } from 'sequelize';
import bcrypt from 'bcryptjs';
import sequelize from '../config/database';

class User extends Model {
    declare id: number;
    declare username: string;
    declare password: string;

    declare readonly createdAt: Date;
    declare readonly updatedAt: Date;

    declare role: string;
    declare passwordChanged: boolean;

    async comparePassword(candidatePassword: string) {
        return await bcrypt.compare(candidatePassword, this.password);
    }
}

User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.STRING,
        defaultValue: 'user'
    },
    passwordChanged: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    }
}, {
    sequelize,
    modelName: 'User',
    hooks: {
        beforeSave: async (user: User) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
    },
});

export default User;
