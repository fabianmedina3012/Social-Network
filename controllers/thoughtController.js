const { User, Thought } = require('../models');

const thoughtController = {
  // Get all thoughts
  getThoughts(req, res) {
    Thought.find()
      .populate('reactions', '-__v')
      .then((thoughts) => res.json(thoughts))
      .catch((err) => res.status(500).json({ error: err.message }));
  },

  // Get a single thought by ID
  getSingleThought(req, res) {
    Thought.findOne({ _id: req.params.thoughtId })
      .select('-__v')
      .populate('reactions', '-__v')
      .then((thought) =>
        !thought
          ? res.status(404).json({ message: 'No thought found with that ID' })
          : res.json(thought)
      )
      .catch((err) => res.status(500).json({ error: err.message }));
  },

  // Create a new thought
  createThought(req, res) {
    Thought.create(req.body)
      .then((thought) =>
        User.findByIdAndUpdate(
          req.body.userId,
          { $addToSet: { thoughts: thought._id } },
          { new: true }
        ).then((user) =>
          !user
            ? res.status(404).json({ message: 'No user found with that ID, but the thought was created' })
            : res.json(thought)
        )
      )
      .catch((err) => res.status(500).json({ error: err.message }));
  },

  // Update a thought by ID
  updateThought(req, res) {
    Thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $set: req.body },
      { runValidators: true, new: true }
    )
      .then((thought) =>
        !thought
          ? res.status(404).json({ message: 'No thought found with that ID' })
          : res.json(thought)
      )
      .catch((err) => res.status(500).json({ error: err.message }));
  },

  // Delete a thought by ID
  deleteThought(req, res) {
    Thought.findOneAndDelete({ _id: req.params.thoughtId })
      .then((thought) => {
        if (!thought) {
          return res.status(404).json({ message: 'No thought found with that ID' });
        }
        return User.findOneAndUpdate(
          { _id: req.params.userId },
          { $pull: { thoughts: req.params.thoughtId } },
          { new: true }
        );
      })
      .then((userData) =>
        !userData
          ? res.status(404).json({ message: 'No user found with that ID, but the thought was deleted' })
          : res.json({ message: 'Thought deleted successfully', userData })
      )
      .catch((err) => res.status(500).json({ error: err.message }));
  },

  // Add a reaction to a thought
  addReaction(req, res) {
    Thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $addToSet: { reactions: req.body } },
      { new: true }
    )
      .populate('reactions', '-__v')
      .select('-__v')
      .then((thought) =>
        !thought
          ? res.status(404).json({ message: 'No thought found with that ID' })
          : res.json(thought)
      )
      .catch((err) => res.status(500).json({ error: err.message }));
  },

  // Delete a reaction by ID
  deleteReaction(req, res) {
    Thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $pull: { reactions: { _id: req.params.reactionId } } },
      { new: true, runValidators: true }
    )
      .then((thought) =>
        !thought
          ? res.status(404).json({ message: 'No thought found with that ID' })
          : res.json(thought)
      )
      .catch((err) => res.status(500).json({ error: err.message }));
  }
};

module.exports = thoughtController;