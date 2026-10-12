import { query } from '../db.js';

export async function createList(userId, title, isPublic = false) {
  const now = new Date().toISOString();
  const res = await query(
    'INSERT INTO job_lists(user_id, title, public, status, created_at, updated_at) VALUES ($1,$2,$3,1,$4,$4) RETURNING *',
    [userId, title, isPublic, now]
  );
  return res.rows[0];
}

export async function listByUser(userId) {
  const res = await query('SELECT * FROM job_lists WHERE user_id=$1 AND status=1 ORDER BY created_at DESC', [userId]);
  return res.rows;
}

export async function getUserListsWithJobs(userId) {
  // Get all user's lists with their jobs and creator info
  const res = await query(`
    SELECT 
      jl.id as list_id,
      jl.title as list_title,
      jl.public as list_public,
      jl.created_at as list_created_at,
      jl.updated_at as list_updated_at,
      u.name as creator_name,
      j.id as job_id,
      j.title as job_title,
      j.apply_link,
      j.created_at as job_created_at,
      j.updated_at as job_updated_at
    FROM job_lists jl
    JOIN users u ON jl.user_id = u.id
    LEFT JOIN jobs j ON jl.id = j.job_list_id AND j.status = 1
    WHERE jl.user_id = $1 AND jl.status = 1
    ORDER BY jl.created_at DESC, j.created_at DESC
  `, [userId]);
  
  // Group jobs by list
  const listsMap = new Map();
  
  res.rows.forEach(row => {
    if (!listsMap.has(row.list_id)) {
      listsMap.set(row.list_id, {
        id: row.list_id,
        title: row.list_title,
        public: row.list_public,
        created_at: row.list_created_at,
        updated_at: row.list_updated_at,
        creator_name: row.creator_name,
        jobs: []
      });
    }
    
    if (row.job_id) {
      listsMap.get(row.list_id).jobs.push({
        id: row.job_id,
        title: row.job_title,
        apply_link: row.apply_link,
        created_at: row.job_created_at,
        updated_at: row.job_updated_at
      });
    }
  });
  
  return Array.from(listsMap.values());
}

export async function getPublicListsWithJobs() {
  // Get all public lists with their jobs and creator info
  const res = await query(`
    SELECT 
      jl.id as list_id,
      jl.title as list_title,
      jl.created_at as list_created_at,
      u.name as creator_name,
      j.id as job_id,
      j.title as job_title,
      j.apply_link,
      j.created_at as job_created_at,
      j.updated_at as job_updated_at
    FROM job_lists jl
    JOIN users u ON jl.user_id = u.id
    LEFT JOIN jobs j ON jl.id = j.job_list_id AND j.status = 1
    WHERE jl.public = true AND jl.status = 1
    ORDER BY jl.created_at DESC, j.created_at DESC
  `);
  
  // Group jobs by list
  const listsMap = new Map();
  
  res.rows.forEach(row => {
    if (!listsMap.has(row.list_id)) {
      listsMap.set(row.list_id, {
        id: row.list_id,
        title: row.list_title,
        created_at: row.list_created_at,
        creator_name: row.creator_name,
        jobs: []
      });
    }
    
    if (row.job_id) {
      listsMap.get(row.list_id).jobs.push({
        id: row.job_id,
        title: row.job_title,
        apply_link: row.apply_link,
        created_at: row.job_created_at,
        updated_at: row.job_updated_at
      });
    }
  });
  
  return Array.from(listsMap.values());
}

export async function getSharedListsWithJobs(userId) {
  // Get all lists shared with the user, including jobs and creator info
  const res = await query(`
    SELECT 
      jl.id as list_id,
      jl.title as list_title,
      jl.public as list_public,
      jl.created_at as list_created_at,
      jl.updated_at as list_updated_at,
      u.name as creator_name,
      ls.id as share_id,
      ls.created_at as share_created_at,
      ls.shared_by_user_id,
      j.id as job_id,
      j.title as job_title,
      j.apply_link,
      j.created_at as job_created_at,
      j.updated_at as job_updated_at
    FROM list_shares ls
    JOIN job_lists jl ON ls.list_id = jl.id
    JOIN users u ON jl.user_id = u.id
    LEFT JOIN jobs j ON jl.id = j.job_list_id AND j.status = 1
    WHERE ls.shared_with_user_id = $1 AND jl.status = 1
    ORDER BY ls.created_at DESC, j.created_at DESC
  `, [userId]);
  
  // Group jobs by list
  const listsMap = new Map();
  
  res.rows.forEach(row => {
    if (!listsMap.has(row.list_id)) {
      listsMap.set(row.list_id, {
        id: row.list_id,
        title: row.list_title,
        public: row.list_public,
        created_at: row.list_created_at,
        updated_at: row.list_updated_at,
        creator_name: row.creator_name,
        share_id: row.share_id,
        share_created_at: row.share_created_at,
        shared_by_user_id: row.shared_by_user_id,
        jobs: []
      });
    }
    
    if (row.job_id) {
      listsMap.get(row.list_id).jobs.push({
        id: row.job_id,
        title: row.job_title,
        apply_link: row.apply_link,
        created_at: row.job_created_at,
        updated_at: row.job_updated_at
      });
    }
  });
  
  return Array.from(listsMap.values());
}

export async function updateList(listId, userId, data) {
  const { title, public: isPublic } = data;
  const now = new Date().toISOString();
  const res = await query(
    'UPDATE job_lists SET title=$1, public=$2, updated_at=$3 WHERE id=$4 AND user_id=$5 AND status=1 RETURNING *',
    [title, isPublic, now, listId, userId]
  );
  return res.rows[0];
}

export async function softDeleteList(listId, userId) {
  const res = await query('UPDATE job_lists SET status=0 WHERE id=$1 AND user_id=$2 RETURNING *', [listId, userId]);
  return res.rows[0];
} 