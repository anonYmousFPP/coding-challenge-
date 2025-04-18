import {Router} from "express";

import jwt from "jsonwebtoken";

import {User} from "../postgreSql.js"

import dotenv from "dotenv"
dotenv.config();


const route = Router();

route.get('/', async (req, res) => {
    try{
        const token = req.headers.authorization?.split(' ')[1];
        console.log(token);
        if(!token){
            res.send("You have to Login First").status(400);
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findByPk(decoded.userId);

        if(!user){
            return res.send(`User not found`).status(400);
        }

        return res.send({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        }).status(200);
    }
    catch(err){
        console.log(`Error is found in myProfile ${err}`);
        res.send(`Error is found ${err}`).status(400);
    }
})

export default route;