const express = require('express');
const mongoose = require('mongoose');
const exphbs = require('express-handlebars');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const passport = require('passport');

// Load models
require('./models/User');

// Passport Config
require('./config/passport')(passport);

// Load routers
const auth = require('./routes/auth');
const index = require('./routes/index');

// Load keys
const keys = require('./config/keys');

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

// Handlebars Middleware
app.engine('handlebars', exphbs({
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
	next();
});

app.use('/', index);
app.use('/auth', auth);

const port = process.env.PORT || 3000;

app.listen(port, () => {
	console.log(`Server started on port: ${port}`);
});