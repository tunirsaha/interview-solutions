import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { createList, listByUser, updateList, softDeleteList, getPublicListsWithJobs, getUserListsWithJobs, getSharedListsWithJobs } from '../repositories/list.repository.js';

const router = Router();

// create list
router.post('/', authenticate, async (req, res) => {
  const { title, public: isPublic = false } = req.body;
  if (!title) return res.status(400).json({ message: 'title required' });
  const list = await createList(req.user.id, title, isPublic);
  res.status(201).json(list);
});

// lists by user
router.get('/', authenticate, async (req, res) => {
  const lists = await listByUser(req.user.id);
  res.json({ lists });
});

// user lists with jobs (for dashboard)
router.get('/with-jobs', authenticate, async (req, res) => {
  try {
    const userLists = await getUserListsWithJobs(req.user.id);
    res.json({ lists: userLists });
  } catch (error) {
    console.error('Error fetching user lists with jobs:', error);
    res.status(500).json({ message: 'Failed to fetch user lists with jobs' });
  }
});

// shared lists with jobs (for shared lists page)
router.get('/shared-with-jobs', authenticate, async (req, res) => {
  try {
    const sharedLists = await getSharedListsWithJobs(req.user.id);
    res.json({ lists: sharedLists });
  } catch (error) {
    console.error('Error fetching shared lists with jobs:', error);
    res.status(500).json({ message: 'Failed to fetch shared lists with jobs' });
  }
});

// public lists with jobs (no authentication required)
router.get('/public', async (req, res) => {
  try {
    const publicLists = await getPublicListsWithJobs();
    res.json({ lists: publicLists });
  } catch (error) {
    console.error('Error fetching public lists:', error);
    res.status(500).json({ message: 'Failed to fetch public lists' });
  }
});

// update
router.put('/:id', authenticate, async (req, res) => {
  const { title, public: isPublic } = req.body;
  const list = await updateList(Number(req.params.id), req.user.id, { title, public: isPublic });
  if (!list) return res.status(404).json({ message: 'list not found' });
  res.json(list);
});

// soft delete
router.delete('/:id', authenticate, async (req, res) => {
  const list = await softDeleteList(Number(req.params.id), req.user.id);
  if (!list) return res.status(404).json({ message: 'list not found' });
  res.json({ success: true });
});

export default router; 