import { Router } from 'express';
import { sequelize, Photo, User } from '../postgreSql.js';
import { authenticate, authorizeAdmin } from '../middleware/user.middleware.js';

const router = Router();

router.get('/stats', authenticate, authorizeAdmin, async (req, res) => {
    try {
      // 1. Get total uploads count
      const totalUploads = await Photo.count();
  
      // 2. Fixed most active uploader query
      const [mostActiveUploader] = await sequelize.query(`
        SELECT 
          u.id, 
          u.name, 
          u.email, 
          COUNT(p.id) as "uploadCount"
        FROM users u
        JOIN photos p ON u.id = p."userId"
        GROUP BY u.id, u.name, u.email
        ORDER BY COUNT(p.id) DESC
        LIMIT 1
      `, { type: sequelize.QueryTypes.SELECT });
  
      // 3. Get largest photo
      const largestPhoto = await Photo.findOne({
        order: [['bytes', 'DESC']],
        raw: true
      });
  
      res.json({
        success: true,
        stats: {
          totalUploads,
          mostActiveUploader: mostActiveUploader ? {
            userId: mostActiveUploader.id,
            name: mostActiveUploader.name,
            email: mostActiveUploader.email,
            uploadCount: parseInt(mostActiveUploader.uploadCount) || 0
          } : {
            userId: null,
            name: "No active uploaders",
            email: null,
            uploadCount: 0
          },
          largestPhoto: largestPhoto ? {
            photoId: largestPhoto.id,
            sizeInKB: Math.round(largestPhoto.bytes / 1024),
            dimensions: `${largestPhoto.width}x${largestPhoto.height}`,
            uploadedBy: largestPhoto.userId
          } : null
        }
      });
  
    } catch (error) {
      console.error('Admin stats error:', {
        message: error.message,
        stack: error.stack,
        sql: error.sql // This will show the problematic SQL query
      });
      res.status(500).json({
        success: false,
        message: 'Failed to fetch admin stats',
        code: 'ADMIN_STATS_ERROR',
        detail: error.message
      });
    }
});

export default router;