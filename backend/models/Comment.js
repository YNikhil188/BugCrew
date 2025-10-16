import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  bug: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bug',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: [true, 'Please add comment content']
  },
  attachments: [{
    type: String
  }]
}, {
  timestamps: true
});

export default mongoose.model('Comment', commentSchema);
