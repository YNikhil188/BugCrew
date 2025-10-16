import mongoose from 'mongoose';

const bugSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a bug title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['open', 'in-progress', 'resolved', 'closed', 'reopened'],
    default: 'open'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  severity: {
    type: String,
    enum: ['minor', 'major', 'critical', 'blocker'],
    default: 'major'
  },
  type: {
    type: String,
    enum: ['bug', 'feature', 'enhancement', 'task'],
    default: 'bug'
  },
  screenshots: [{
    type: String
  }],
  stepsToReproduce: {
    type: String
  },
  environment: {
    type: String
  },
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model('Bug', bugSchema);
