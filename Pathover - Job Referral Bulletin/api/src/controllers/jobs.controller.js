import { Router } from 'express';
import { query } from '../db.js';
import { authenticate } from '../middleware/auth.js';
import { createJob, listJobsByUser, getJobById, updateJob, deleteJob, listJobsByJobList } from '../repositories/job.repository.js';

const router = Router();

// List jobs in user's lists
router.get('/', authenticate, async (req, res) => {
  const jobs = await listJobsByUser(req.user.id);
  res.json(jobs);
});

// Get public jobs from public lists
router.get('/public', async (req, res) => {
  try {
    const result = await query(`
      SELECT j.*, jl.title as list_name 
      FROM jobs j
      JOIN job_lists jl ON jl.id = j.job_list_id
      WHERE jl.public = true
      ORDER BY j.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching public jobs:', error);
    res.status(500).json({ message: 'Failed to fetch public jobs' });
  }
});

// Get single job by ID
router.get('/:id', async (req, res) => {
  try {
    const job = await getJobById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ message: 'Failed to fetch job' });
  }
});

// Create new job
router.post('/', authenticate, async (req, res) => {
  const { title, apply_link, job_list_id } = req.body;
  
  if (!title) return res.status(400).json({ message: 'title required' });
  if (!job_list_id) return res.status(400).json({ message: 'job_list_id required' });

  // Verify the job list belongs to the user
  const jl = await query('SELECT id FROM job_lists WHERE id=$1 AND user_id=$2', [job_list_id, req.user.id]);
  if (jl.rows.length === 0) return res.status(400).json({ message: 'job list not found or access denied' });

  const job = await createJob(job_list_id, { title, apply_link });
  res.status(201).json(job);
});

// Update job
router.put('/:id', authenticate, async (req, res) => {
  const { title, apply_link } = req.body;
  
  if (!title) return res.status(400).json({ message: 'title required' });

  // Verify the job belongs to the user
  const job = await getJobById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  
  const jl = await query('SELECT user_id FROM job_lists WHERE id=$1', [job.job_list_id]);
  if (jl.rows.length === 0 || jl.rows[0].user_id !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const updatedJob = await updateJob(req.params.id, { title, apply_link });
  res.json(updatedJob);
});

// Delete job
router.delete('/:id', authenticate, async (req, res) => {
  // Verify the job belongs to the user
  const job = await getJobById(req.params.id);
  if (!job) return res.status(404).json({ message: 'Job not found' });
  
  const jl = await query('SELECT user_id FROM job_lists WHERE id=$1', [job.job_list_id]);
  if (jl.rows.length === 0 || jl.rows[0].user_id !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }

  await deleteJob(req.params.id);
  res.json({ message: 'Job deleted successfully' });
});

// Get jobs by job list ID
router.get('/list/:jobListId', authenticate, async (req, res) => {
  // Verify the job list belongs to the user
  const jl = await query('SELECT id FROM job_lists WHERE id=$1 AND user_id=$2', [req.params.jobListId, req.user.id]);
  if (jl.rows.length === 0) return res.status(403).json({ message: 'Access denied' });

  const jobs = await listJobsByJobList(req.params.jobListId);
  res.json(jobs);
});

export default router; 