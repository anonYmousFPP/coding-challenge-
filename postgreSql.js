import { Sequelize } from "sequelize";
import { userModel } from "./schema/user.schema.js";
import { photoModel } from "./schema/photo.schema.js";

import dotenv from "dotenv"
dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
    define: {
        schema: process.env.DB_SCHEMA
    }
});

const User = userModel(sequelize);
const Photo = photoModel(sequelize);

User.hasMany(Photo, {foreignKey: 'userId', as: 'photos'});
Photo.belongsTo(User, {foreignKey: 'userId', as: 'user'});

export const syncDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        await sequelize.sync({alter: true});
        console.log("Table created");
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

export {sequelize, User, Photo};