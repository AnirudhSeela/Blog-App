const express = require('express'),
	mongoose = require('mongoose'),
	methodOverride = require('method-override'),
	bodyParser = require('body-parser'),
	expressSanitizer = require('express-sanitizer'),
	app = express();

mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);

// update() = updateOne() / updateMany() / replaceOne()
// remove() = removeOne() / removeMany()

mongoose.connect('mongodb://localhost/blog-app');
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressSanitizer());
app.use(methodOverride('_method'));

const blogSchema = new mongoose.Schema({
	title: String,
	image: String,
	body: String,
	created: { type: Date, default: Date.now }
});

const Blog = mongoose.model('Blog', blogSchema);

app.get('/', function(req, res) {
	res.redirect('/blogs');
});

//Index Route
app.get('/blogs', function(req, res) {
	Blog.find({}, function(err, blogs) {
		if (err) {
			console.log('ERROR!');
		} else {
			res.render('index', { blogs: blogs });
		}
	});
});

//New Route
app.get('/blogs/new', function(req, res) {
	res.render('new');
});

//Create Route
app.post('/blogs', function(req, res) {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, function(err, newBlog) {
		if (err) {
			res.render('new');
			console.log('error');
		} else {
			res.redirect('/blogs');
		}
	});
});

//Show Route
app.get('/blogs/:id', function(req, res) {
	Blog.findById(req.params.id, function(err, foundBlog) {
		if (err) {
			res.redirect('/blogs');
		} else {
			res.render('show', { blog: foundBlog });
		}
	});
});

//Edit Route
app.get('/blogs/:id/edit', function(req, res) {
	Blog.findById(req.params.id, function(err, foundBlog) {
		if (err) {
			res.redirect('/blogs');
		} else {
			res.render('edit', { blog: foundBlog });
		}
	});
});

//Update Route
app.put('/blogs/:id', function(req, res) {
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog) {
		if (err) {
			res.redirect('/blogs');
		} else {
			res.redirect('/blogs/' + req.params.id);
		}
	});
});

//Delete Route
app.delete('/blogs/:id', function(req, res) {
	Blog.findByIdAndRemove(req.params.id, function(err) {
		if (err) {
			res.redirect('/blogs');
		} else {
			res.redirect('/blogs');
		}
	});
});

app.listen(3000, function() {
	console.log('Server is running!');
});
