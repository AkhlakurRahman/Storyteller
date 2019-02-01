const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Story = mongoose.model('stories');
const User = mongoose.model('users');
const {ensureAuthenticated} = require('../helpers/auth');

// Stories index
router.get('/', (req, res) => {
	Story.find({status: 'public'})
		.populate('user')
		.sort({date: 'desc'})
		.then(stories => {
			res.render('stories/index', {
				stories
			});
		});
});

// Add story page route
router.get('/add', ensureAuthenticated, (req, res) => {
	res.render('stories/add');
});

// Post story route
router.post('/add', (req, res) => {
	// Check if allowComments is checked or not
	let allowComments;

	if (req.body.allowComments) {
		allowComments = true;
	} else {
		allowComments = false;
	}

	const newStory = {
		title: req.body.title,
		status: req.body.status,
		allowComments,
		story: req.body.story,
		user: req.user.id
	};

	new Story(newStory)
		.save()
		.then(story => {
			res.redirect(`/stories/show/${story.id}`);
		});
});

// Show single story
router.get('/show/:id', (req, res) => {
	Story.findById({
		_id: req.params.id
	})
	.populate('user')
	.populate('comments.commentUser')
	.then(story => {
		if (story.status == 'public') {
			res.render('stories/show', {
				story
			});
		} else {
			if (req.user && req.user.id == story.user._id && story.status == 'private' || story.status == 'unpublished') {
				res.render('stories/show', {
					story
				});
			} else {
				res.redirect('/stories');
			}
		}
	});
});

// Show list of stories from a specific user
router.get('/user/:userId', (req, res) => {
	Story.find({
		user: req.params.userId,
		status: 'public'
	})
	.populate('user')
	.then(stories => {
		res.render('stories/index', {
			stories
		});
	});
});

// Show stories for logged in user
router.get('/my', ensureAuthenticated, (req, res) => {
	Story.find({
		user: req.user.id,
	})
	.populate('user')
	.then(stories => {
		res.render('stories/index', {
			stories
		});
	});
});

// Edit story form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
	Story.findById({
		_id: req.params.id
	}).then(story => {
		if (story.user != req.user.id) {
			res.redirect('/stories');
		} else {
			res.render('stories/edit', {
				story
			});
		}
	});
});

// Edit story put request
router.put('/edit/:id', ensureAuthenticated, (req, res) => {
	Story.findById({
		_id: req.params.id
	}).then(story => {
		// Check if allowComments is checked or not
		let allowComments;

		if (req.body.allowComments) {
			allowComments = true;
		} else {
			allowComments = false;
		}

		// Edited Story
		story.title = req.body.title;
		story.status = req.body.status;
		story.allowComments = allowComments;
		story.story = req.body.story;

		story.save()
			.then(story => {
				res.redirect('/dashboard');
			});
	});
});

// Delete a story
router.delete('/delete/:id', (req, res) => {
	Story.deleteOne({
		_id: req.params.id
	}).then(() => {
		res.redirect('/dashboard');
	});
});

// Add Comment to a story
router.post('/comment/:id', (req, res) => {
	Story.findById({
		_id: req.params.id
	}).then(story => {
		const newComment = {
			commentBody: req.body.commentBody,
			commentUser: req.user.id
		};

		// Add comment beginning of the array
		story.comments.unshift(newComment);

		story.save()
			.then(story => {
				res.redirect(`/stories/show/${story.id}`);
			})
	})
})

module.exports = router;