import { Router } from 'express';
import { Photo, User } from '../postgreSql.js';
import { authorizeAdmin } from '../middleware/user.middleware.js';

const router = Router();

router.get('/stats', authorizeAdmin, async (req, res) => {
    try {
        const totalUploads = await Photo.count();

        const mostActiveUploader = await User.findOne({
            attributes: [
                'id',
                'name',
                'email',
                [sequelize.fn('COUNT', sequelize.col('photos.id')), 'uploadCount']
            ],
            include: [{
                model: Photo,
                attributes: []
            }],
            group: ['user.id'],
            order: [[sequelize.literal('uploadCount'), 'DESC']]
        });

        // 3. Largest photo uploaded (by file size)
        const largestPhoto = await Photo.findOne({
            order: [['bytes', 'DESC']]
        });

        res.json({
            success: true,
            stats: {
                totalUploads,
                mostActiveUploader: {
                    userId: mostActiveUploader?.id,
                    name: mostActiveUploader?.name,
                    email: mostActiveUploader?.email,
                    uploadCount: mostActiveUploader?.dataValues.uploadCount || 0
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
        console.error('Admin stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch admin stats'
        });
    }
});

export default router;