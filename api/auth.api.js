import {Router} from "express";

import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import {User, sequelize} from "../postgreSql.js"

import dotenv from "dotenv"
import { validateLogin, validateSignup } from "../validators/authValidator.js";
dotenv.config();


const route = Router();

route.post("/login", validateLogin, async (req, res) => {
    const {email, password} = req.body;
    if(!email || !password){
        res.send(`Email or password is not found`).status(404);
    }
    console.log(email);
    console.log(password);

    try{
        const user = await User.findOne({
            where: {email}
        })

        if(!user){
            res.send(`User not found with this ${email}`).status(404);
        }

        const checkPassword = await bcrypt.compare(password, user.password);
        if(!checkPassword){
            res.send(`Incorrect Password`).status(400);
        }

        const jwtToken = jwt.sign({
            userId: user.id,
            email: user.email,
            role: user.role
        }, process.env.JWT_SECRET);

        return res.send({
            message: `Login Successfull`,
            token: jwtToken
        }).status(200);

    } catch (err) {
        console.error(`Login error ${err}`);
        return res.status(500).send("Internal server error");
    }
})

route.post("/signup", validateSignup, async (req, res) => {
    const {name, email, password, role } = req.body;

    if(!name || !email || !password){
        return res.send(`Name, email and password are required`).status(400);
    }

    const transaction = await sequelize.transaction();

    try{
        const existingUser = await User.findOne({where: {email}});

        if(existingUser){
            return res.send(`User already exists with this email`).status(400);
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const newUser = await User.create({
            name,
            email,
            password : hashedPassword,
            role
        }, {transaction});

        await transaction.commit();

        return res.send({
            message: "User created successfully",
        }).status(200);
    }
    catch(err){
        console.error(`Login error ${err}`);
        return res.status(500).send("Internal server error");
    }

})

export default route;