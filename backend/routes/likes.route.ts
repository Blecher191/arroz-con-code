import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware.ts';
import likesController from '../controllers/likes.controller.ts';

const router = Router({ mergeParams: true });

// Get like count for a post (PUBLIC - returns userLiked if token present)
router.get('/posts/:postId/likes', likesController.getPostLikes);

// Toggle like on a post (PROTECTED)
router.post('/posts/:postId/like', authenticateToken, likesController.togglePostLike);

// Toggle like on a comment (PROTECTED)
router.post('/posts/:postId/comments/:commentId/like', authenticateToken, likesController.toggleCommentLike);

export default router;
