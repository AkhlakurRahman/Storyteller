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
	.then(story => {
		res.render('stories/show', {
			story
		});
	});
});

// Edit story form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
	Story.findById({
		_id: req.params.id
	}).then(story => {
		res.render('stories/edit', {
			story
		});
	})
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

module.exports = router;