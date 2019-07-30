var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer");
var app = express();

// APP CONFIG
mongoose.connect("mongodb://localhost:27017/restful_blog_app", { useNewUrlParser: true });
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended : true}));
mongoose.set('useFindAndModify', false);
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
// This line must be after body parser use line
app.use(expressSanitizer());

// MONGOOSE/MODEL CONFIG
var blogSchema = new mongoose.Schema({
	title : String,
	image : String,
	body : String,
	Created : {type:Date, default:Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
// 	title : "Test Blog",
// 	image : "https://appdevelopermagazine.com/images/news_images/Making-Application-Testing-a-First-Class-Citizen-App-Developer-Magazine_gd5jd6gn.jpg",
// 	body : "We are testing"
	
// });

// RESTFUL ROUTES  https://codepen.io/urketadic/details/oZRdRN
app.get("/", function(req, res){
	res.redirect("/blogs");
});

// INDEX ROUTE
app.get("/blogs", function(req, res){
	Blog.find({}, function(err, blogs){
		if(err){
			console.log(err);
		}else{
			res.render("index", {blogs : blogs});	
		}
	});
});

// NEW ROUTE
app.get("/blogs/new", function(req, res){
	res.render("new");
});

// CREATE ROUTE
app.post("/blogs", function(req, res){
	// create blog
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, function(err, newBlog){
		if(err){
			res.render("new");
		}else{
			// redirect to the index
			 res.redirect("/blogs");
		}
	});
});

// SHOW ROUTE
app.get("/blogs/:id", function(req, res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.render("show", {blog : foundBlog});
		}
			
	});
});

// EDIT ROUTE
app.get("/blogs/:id/edit", function(req, res){
	
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.render("edit", {blog : foundBlog});	
		}
	});
});

// UPDATE ROUTE
// ?_method=PUT method="POST"
// npm install method-override --save
app.put("/blogs/:id", function(req, res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
		if(err){
			res.redirect("/blogs");
		}else{
			res.redirect("/blogs/" + req.params.id);
		}
	});
});

// DELETE ROUTE
app.delete("/blogs/:id", function(req, res){
	
	// destroy blog
	Blog.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect("/blogs");
		}else{
			
			// redirect the blog
			res.redirect("/blogs");
		}
	});
});

app.listen(3000, function(){
	console.log("Server working");
});