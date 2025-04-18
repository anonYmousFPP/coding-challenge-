import express from "express";
import dotenv from "dotenv"
dotenv.config();

import auth from './api/auth.api.js';
import myProfile from './api/myProfile.api.js';
import photoApi from './api/photos.api.js';
import adminApi from './api/admin.api.js';

import { syncDB, Photo, User } from "./postgreSql.js";

import fileUpload from "express-fileupload";

import { logger, morganMiddleware } from './util/logger.js';

import swaggerSetup from './util/swagger.js';

const app = express();
app.use(express.json());

app.use(morganMiddleware);

syncDB();

app.get('/', (req, res) => {
    logger.info('Home route accessed');
    res.send("hey bro")
})

app.use(fileUpload({
    useTempFiles: true
}));

app.use((err, req, res, next) => {
    logger.error(`Error: ${err.message}`, { stack: err.stack });
    res.status(500).send('Internal Server Error');
  });

  swaggerSetup(app);

app.use('/auth', auth);
app.use('/me', myProfile);
app.use('/photos', photoApi);
app.use('/admin', adminApi);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});