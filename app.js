const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');

// Load models
require('./models/User');
require('./models/Story');

// Passport Config
require('./config/passport')(passport);

// Load routers
const auth = require('./routes/auth');
const index = require('./routes/index');
const stories = require('./routes/stories');

// Load keys
const keys = require('./config/keys');

// Handle Helpers
const {	truncate, stripTags, formatDate, select, editIcon } = require('./helpers/hbs');

// Map global promise
// mongoose.Promise = global.Promise;

// Connect to mongoDB
mongoose.connect(keys.mongoURI, {
	useNewUrlParser: true
}).then(() => {
	console.log('Connected to mongoDB database!');
}).catch(err => {
	console.log(err);
});

const app = express();

//BodyParser Middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Method Override Middleware
app.use(methodOverride('_method'));

// Handlebars Middleware
app.engine('handlebars', exphbs({
	helpers: {
		truncate,
		stripTags,
		formatDate,
		select,
		editIcon
	},
	defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

app.use(cookieParser());
app.use(session({
	secret: 'secret',
	resave: false,
	saveUninitialized: false
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Setting global variables
app.use((req, res, next) => {
	res.locals.user = req.user || null;
	res.locals.date = new Date().getFullYear();
	next();
});

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/auth', auth);
app.use('/stories', stories);

const port = process.env.PORT || 3000;

app.listen(port, () => {
	console.log(`Server started on port: ${port}`);
});