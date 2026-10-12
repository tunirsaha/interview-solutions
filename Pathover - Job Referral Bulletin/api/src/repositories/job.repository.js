import { query } from '../db.js';

export async function createJob(jobListId, data) {
  const { title, apply_link } = data;
  const now = new Date().toISOString();
  const result = await query(
    `INSERT INTO jobs(job_list_id, title, apply_link, status, created_at, updated_at)
     VALUES ($1,$2,$3,1,$4,$4) RETURNING *`,
    [jobListId, title, apply_link, now]
  );
  return result.rows[0];
}

export async function listJobsByUser(userId) {
  const result = await query(
    `SELECT j.*, jl.title as list_name FROM jobs j
     JOIN job_lists jl ON jl.id = j.job_list_id
     WHERE jl.user_id=$1 AND j.status=1
     ORDER BY j.created_at DESC`,
    [userId]
  );
  return result.rows;
}

export async function getJobById(jobId) {
  const result = await query(
    `SELECT j.*, jl.title as list_name FROM jobs j
     JOIN job_lists jl ON jl.id = j.job_list_id
     WHERE j.id=$1 AND j.status=1`,
    [jobId]
  );
  return result.rows[0];
}

export async function updateJob(jobId, data) {
  const { title, apply_link } = data;
  const now = new Date().toISOString();
  const result = await query(
    `UPDATE jobs SET title=$1, apply_link=$2, updated_at=$3
     WHERE id=$4 AND status=1 RETURNING *`,
    [title, apply_link, now, jobId]
  );
  return result.rows[0];
}

export async function deleteJob(jobId) {
  const result = await query(
    'UPDATE jobs SET status=0 WHERE id=$1 RETURNING *',
    [jobId]
  );
  return result.rows[0];
}

export async function listJobsByJobList(jobListId) {
  const result = await query(
    `SELECT * FROM jobs WHERE job_list_id=$1 AND status=1 ORDER BY created_at DESC`,
    [jobListId]
  );
  return result.rows;
} 