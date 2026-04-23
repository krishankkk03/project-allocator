import express from 'express';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { User, Project, Group, Request, Message } from './db.js';

dotenv.config();
const router = express.Router();
const JWT_SECRET = 'supersecretkey_for_academic_project';

const tempStore = {};
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const sendOTP = async (email, otp) => {
  console.log(`\n=========================================`);
  console.log(`🔑 OTP for ${email}: ${otp}`);
  console.log(`=========================================\n`);

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    await transporter.sendMail({
      from: `"Project Allocator" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your Authentication OTP',
      text: `Your OTP for Project Allocator is: ${otp}. It is valid for 5 minutes.`
    });
  } catch (err) {
    console.error('Error sending email:', err);
  }
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---
router.post('/auth/register', async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const otp = generateOTP();
    tempStore[email] = { otp, userData: req.body, expires: Date.now() + 5 * 60000 };
    
    await sendOTP(email, otp);
    res.json({ message: 'OTP sent successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/auth/verify-register', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = tempStore[email];
    if (!record || record.expires < Date.now() || record.otp !== otp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const { role, name, password, rollNumber, contactNumber } = record.userData;
    const newUser = new User({
      role, name, email, password,
      ...(role === 'student' && { rollNumber, contactNumber })
    });

    await newUser.save();
    delete tempStore[email];
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const otp = generateOTP();
    tempStore[email] = { otp, user, expires: Date.now() + 5 * 60000 };
    
    await sendOTP(email, otp);
    res.json({ message: 'OTP sent successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/auth/verify-login', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = tempStore[email];
    if (!record || record.expires < Date.now() || record.otp !== otp) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    const user = record.user;
    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '24h' });
    delete tempStore[email];

    res.json({ 
      token, 
      user: { 
        id: user._id, role: user.role, name: user.name, email: user.email,
        rollNumber: user.rollNumber, contactNumber: user.contactNumber
      } 
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- TEACHER ROUTES ---
router.post('/projects', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.sendStatus(403);
    const newProject = new Project({ ...req.body, teacherId: req.user.id });
    await newProject.save();
    res.status(201).json(newProject);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/projects/teacher', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.sendStatus(403);
    const projects = await Project.find({ teacherId: req.user.id });
    res.json(projects);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/requests/teacher', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.sendStatus(403);
    const projects = await Project.find({ teacherId: req.user.id });
    const projectIds = projects.map(p => p._id);
    
    const requests = await Request.find({ projectId: { $in: projectIds } })
      .populate('groupId')
      .populate('projectId');
      
    res.json(requests);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/requests/:id/status', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'teacher') return res.sendStatus(403);
    const { status } = req.body;
    
    const request = await Request.findById(req.params.id);
    if (!request) return res.status(404).json({ error: 'Request not found' });
    
    const project = await Project.findById(request.projectId);
    if (project.teacherId.toString() !== req.user.id) return res.sendStatus(403);
    
    request.status = status;
    await request.save();
    
    if (status === 'accepted') {
      project.status = 'allocated';
      await project.save();
      
      // Reject others
      await Request.updateMany(
        { projectId: request.projectId, _id: { $ne: request._id } },
        { status: 'rejected' }
      );
    }
    
    req.io.emit('notification', { type: 'request_update', groupId: request.groupId, status });
    res.json(request);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- STUDENT ROUTES ---
router.post('/groups', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.sendStatus(403);
    const { additionalEmails = [] } = req.body;
    
    // Check if leader already in group
    const existingGroup = await Group.findOne({ 'members.email': req.user.email });
    if (existingGroup) return res.status(400).json({ error: 'You are already in a group' });

    if (additionalEmails.length > 3) return res.status(400).json({ error: 'Maximum 3 additional members.' });
    if (new Set(additionalEmails).size !== additionalEmails.length) return res.status(400).json({ error: 'Duplicate emails.' });
    if (additionalEmails.includes(req.user.email)) return res.status(400).json({ error: 'Cannot invite yourself.' });

    const leader = await User.findById(req.user.id);
    const members = [{ userId: leader._id, name: leader.name, email: leader.email, rollNumber: leader.rollNumber }];

    for (let email of additionalEmails) {
      if (!email.trim()) continue;
      const student = await User.findOne({ email, role: 'student' });
      if (!student) return res.status(404).json({ error: `Student ${email} not found. Register first.` });
      
      const inGroup = await Group.findOne({ 'members.email': email });
      if (inGroup) return res.status(400).json({ error: `Student ${email} already in a group.` });
      
      members.push({ userId: student._id, name: student.name, email: student.email, rollNumber: student.rollNumber });
    }

    const newGroup = new Group({ createdBy: req.user.id, members });
    await newGroup.save();
    res.status(201).json(newGroup);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/groups/me', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.sendStatus(403);
    const group = await Group.findOne({ 'members.userId': req.user.id });
    res.json(group || null);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/projects', authenticateToken, async (req, res) => {
  try {
    const projects = await Project.find().populate('teacherId', 'name');
    const formatted = projects.map(p => {
      const obj = p.toObject();
      obj.teacherName = p.teacherId ? p.teacherId.name : 'Unknown';
      return obj;
    });
    res.json(formatted);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/requests', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.sendStatus(403);
    const { projectId, groupId } = req.body;
    
    const existing = await Request.findOne({ projectId, groupId });
    if (existing) return res.status(400).json({ error: 'Already requested' });
    
    const newRequest = new Request({ projectId, groupId });
    await newRequest.save();
    
    const project = await Project.findById(projectId);
    if (project) req.io.emit('notification', { type: 'new_request', teacherId: project.teacherId });
    
    res.status(201).json(newRequest);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/requests/student', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.sendStatus(403);
    const group = await Group.findOne({ 'members.userId': req.user.id });
    if (!group) return res.json([]);
    
    const requests = await Request.find({ groupId: group._id }).populate('projectId');
    res.json(requests);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/projects/:id/submit-synopsis', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.sendStatus(403);
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    
    project.synopsisUrl = req.body.synopsisUrl;
    await project.save();
    res.json(project);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/projects/:id/submit-final', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'student') return res.sendStatus(403);
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: 'Not found' });
    
    project.finalUrl = req.body.finalUrl;
    project.status = 'completed';
    await project.save();
    res.json(project);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/messages/:roomId', authenticateToken, async (req, res) => {
  try {
    const messages = await Message.find({ roomId: req.params.roomId }).sort({ timestamp: 1 });
    res.json(messages);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
