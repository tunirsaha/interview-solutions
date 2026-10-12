import ListShareRepository from '../repositories/list-share.repository.js';
import { findIdByEmail } from '../repositories/user.repository.js';

class ListSharesController {
    async shareList(req, res) {
        try {
            const { listId } = req.params;
            const { email } = req.body;
            const sharedByUserId = req.user.id;

            // Check if email exists
            const sharedWithUserId = await findIdByEmail(email);
            if (!sharedWithUserId) {
                return res.status(404).json({ error: 'User with this email not found' });
            }

            // Check if already shared
            const isAlreadyShared = await ListShareRepository.checkIfShared(listId, sharedWithUserId);
            if (isAlreadyShared) {
                return res.status(400).json({ error: 'List is already shared with this user' });
            }

            // Create share
            const listShare = {
                list_id: listId,
                shared_by_user_id: sharedByUserId,
                shared_with_user_id: sharedWithUserId
            };

            await ListShareRepository.create(listShare);
            res.status(201).json({ message: 'List shared successfully' });
        } catch (error) {
            console.error('Error sharing list:', error);
            res.status(500).json({ error: 'Failed to share list' });
        }
    }

    async getSharedLists(req, res) {
        try {
            const userId = req.user.id;
            const sharedLists = await ListShareRepository.findBySharedWithUserId(userId);
            res.json(sharedLists);
        } catch (error) {
            console.error('Error getting shared lists:', error);
            res.status(500).json({ error: 'Failed to get shared lists' });
        }
    }

    async getListShares(req, res) {
        try {
            const { listId } = req.params;
            const shares = await ListShareRepository.findByListId(listId);
            res.json(shares);
        } catch (error) {
            console.error('Error getting list shares:', error);
            res.status(500).json({ error: 'Failed to get list shares' });
        }
    }

    async removeShare(req, res) {
        try {
            const { listId, userId } = req.params;
            await ListShareRepository.delete(listId, userId);
            res.json({ message: 'Share removed successfully' });
        } catch (error) {
            console.error('Error removing share:', error);
            res.status(500).json({ error: 'Failed to remove share' });
        }
    }
}

export default new ListSharesController(); 