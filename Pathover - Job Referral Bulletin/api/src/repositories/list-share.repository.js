import { query } from '../db.js';
import ListShare from '../entities/list-share.entity.js';

class ListShareRepository {
    async create(listShare) {
        const now = new Date().toISOString();
        const result = await query(
            'INSERT INTO list_shares (list_id, shared_by_user_id, shared_with_user_id, created_at) VALUES ($1, $2, $3, $4) RETURNING *',
            [listShare.list_id, listShare.shared_by_user_id, listShare.shared_with_user_id, now]
        );
        return result.rows[0];
    }

    async findByListId(listId) {
        const result = await query(
            `SELECT ls.*, u.email as shared_with_email 
             FROM list_shares ls 
             JOIN users u ON ls.shared_with_user_id = u.id 
             WHERE ls.list_id = $1`,
            [listId]
        );
        return result.rows.map(row => ({
            ...new ListShare(row),
            shared_with_email: row.shared_with_email
        }));
    }

    async findBySharedWithUserId(userId) {
        const result = await query(
            `SELECT ls.*, jl.title as list_name, jl.public as list_public, u.email as shared_by_email
             FROM list_shares ls 
             JOIN job_lists jl ON ls.list_id = jl.id 
             JOIN users u ON ls.shared_by_user_id = u.id 
             WHERE ls.shared_with_user_id = $1`,
            [userId]
        );
        return result.rows.map(row => ({
            ...new ListShare(row),
            list_name: row.list_name,
            list_public: row.list_public,
            shared_by_email: row.shared_by_email
        }));
    }

    async delete(listId, sharedWithUserId) {
        return await query(
            'DELETE FROM list_shares WHERE list_id = $1 AND shared_with_user_id = $2',
            [listId, sharedWithUserId]
        );
    }

    async checkIfShared(listId, userId) {
        const result = await query(
            'SELECT id FROM list_shares WHERE list_id = $1 AND shared_with_user_id = $2',
            [listId, userId]
        );
        return result.rows.length > 0;
    }
}

export default new ListShareRepository(); 