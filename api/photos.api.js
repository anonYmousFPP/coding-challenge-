import {Router} from "express";

import {authenticate} from '../middleware/user.middleware.js';
import rateLimit from 'express-rate-limit';

import cloudinary from 'cloudinary';

import {Photo} from "../postgreSql.js"
import { logger } from "../util/logger.js";

const route = Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: (req) => req.user.id,
  message: {
    success: false,
    message: 'Too many uploads. Please try again after a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

route.post("/upload", authenticate, uploadLimiter, async (req, res) => {
    const {caption} = req.body;
    try{
        const file = req.files.photo;
        const user = req.user;
        logger.info('Attempting to create photo', { user: req.user.id });
        cloudinary.uploader.upload(file.tempFilePath, async (result, err) => {
            if(err){
                return res.send(`Error is found ${err}`).status(400);
            }
            console.log(result);
            const photo = await Photo.create({
                publicId: result.public_id,
                url: result.url,
                secureUrl: result.secure_url,
                format: result.format,
                bytes: result.size,
                width: result.width,
                height: result.height,
                caption,
                userId: user.id
            })

            logger.info('Photo created successfully', { photoId: photo.publicId });
            return res.send(photo).status(200);
        })
    }catch(error){
      logger.error('Error creating photo', {
        error: error.message,
        stack: error.stack,
        user: req.user?.id
      });
      res.status(500).json({ error: 'Internal server error' });
    }
})

route.get('/', authenticate, async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const photos = await Photo.findAll({
        where: { userId: req.user.id },
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      res.json({
        success: true,
        photos,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: await Photo.count({ where: { userId: req.user.id } })
        }
      });
    } catch (error) {
        console.log(error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch photos'
      });
    }
});

route.get('/:id', authenticate, async (req, res) => {
    try {
      const photo = await Photo.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id
        }
      });

      if (!photo) {
        return res.status(404).json({
          success: false,
          message: 'Photo not found'
        });
      }

      res.json({
        success: true,
        photo
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch photo'
      });
    }
});

route.delete('/:id', authenticate, async (req, res) => {
    try {
      const photo = await Photo.findOne({
        where: {
          id: req.params.id,
          userId: req.user.id
        },
      });

      if (!photo) {
        return res.status(404).json({
          success: false,
          message: 'Photo not found'
        });
      }

      await cloudinary.uploader.destroy(photo.id);
      await photo.destroy();

      res.json({
        success: true,
        message: 'Photo deleted successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete photo'
      });
    }
})

export default route;