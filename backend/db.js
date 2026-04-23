import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
  try {
    // You will change this URI to your MongoDB Atlas URI later when deploying
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/project_allocator';
    await mongoose.connect(mongoUri);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const userSchema = new mongoose.Schema({
  role: { type: String, required: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rollNumber: String,
  contactNumber: String,
});
export const User = mongoose.model('User', userSchema);

const projectSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String,
  technology: String,
  description: String,
  status: { type: String, default: 'open' },
  synopsisUrl: String,
  finalUrl: String
});
export const Project = mongoose.model('Project', projectSchema);

const groupSchema = new mongoose.Schema({
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  members: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: String,
    email: String,
    rollNumber: String
  }]
});
export const Group = mongoose.model('Group', groupSchema);

const requestSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  status: { type: String, default: 'pending' },
  timestamp: { type: Date, default: Date.now }
});
export const Request = mongoose.model('Request', requestSchema);

const messageSchema = new mongoose.Schema({
  roomId: String,
  senderId: String,
  senderName: String,
  text: String,
  timestamp: { type: Date, default: Date.now }
});
export const Message = mongoose.model('Message', messageSchema);

export default connectDB;
