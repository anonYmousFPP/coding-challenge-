import { DataTypes } from "sequelize";

export const photoModel = (sequelize) => {
    return sequelize.define("Photo", {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        publicId: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        url:{
            type: DataTypes.STRING,
            allowNull: false,
        },
        secureUrl: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        format:{
            type: DataTypes.STRING,
        },
        bytes: {
            type: DataTypes.INTEGER,
        },
        width: {
            type: DataTypes.INTEGER,
        },
        height:{
            type: DataTypes.INTEGER,
        },
        caption: {
            type: DataTypes.STRING,
        }
    }, {
        tableName: 'photos',
        timestamps: true,
    });
};