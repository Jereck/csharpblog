const   express     = require('express'),
        bodyParser  = require('body-parser'),
        BlogPost    = require('./models/blogpost'),
        User        = require('./models/user'),
        mongoose    = require('mongoose'),
        passport    = require('passport'),
        LocalStrategy = require('passport-local'),
        methodOverride = require('method-override'),
        Instafeed   = require('instafeed.js'),
        app         = express();

mongoose.connect("mongodb://localhost/csblog");

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));
app.set("view engine", "ejs");
app.use(methodOverride("_method"));


//PASSPORT CONFIG
app.use(require('express-session')({
    secret: "Stella is the best dog ever!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    next();
});


app.get("/", function(req, res){
    res.render("index");
});

// INDEX ROUTE
app.get("/blog", function(req, res){
    BlogPost.find({}, function(err, allPosts){
        if(err){
            console.log(err);
        } else {
            res.render("blog", {blogPost: allPosts});
        }
    });
});
//CREATE ROUTE
app.post("/blog", isLoggedIn, function(req, res){
    BlogPost.create(req.body.blog, function(err, newlyCreated){
        if (err){
            console.log(err);
        } else {
            newlyCreated.author.id = req.user._id;
            newlyCreated.author.username = req.user.username;
            newlyCreated.save();
            res.redirect("/blog");
        }
    });
});
//NEW ROUTE
app.get("/blog/new", isLoggedIn, function(req, res){
    res.render("new-blog");
});

//SHOW ROUTE
app.get("/blog/:id", function(req, res){
    BlogPost.findById(req.params.id, function(err, foundPost){
        if(err){
            console.log(err);
        } else {
            res.render("show-post", {blogPost: foundPost});
        }
    });
});
//DELETE ROTUE
app.delete("/blog/:id", isLoggedIn, function(req, res){
    BlogPost.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/blog");
        } else {
            res.redirect("/blog");
        }
    });
});



// USER AUTH ROUTES
app.get("/register", function(req, res){
    res.render("register");
});

app.post("/register", function(req, res){
    var newUser = new User(
        {
            username: req.body.username,
            firstName: req.body.firstName,
            lastName: req.body.lastName
        });
    User.register(newUser, req.body.password, function(err, user){
        if (err){
            console.log(err);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
            res.redirect("/");
        });
    });
});


app.get("/login", function(req, res){
    res.render("login");
});

app.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/",
        failureRedirect: "/"
    }), function(req, res){
});

app.get("/logout", function(req, res){
    req.logout();
    res.redirect("/");
});

app.get("/success", function(req, res){
    res.render("success");
});

app.get("/failure", function(req, res){
    res.render("failure");
});

app.get("/admin", function(req, res){
    res.render("admin");
});

// MIDDLEWARE
function isLoggedIn(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    res.redirect("/login");
}


app.listen(3000, () => console.log("Server has started..."));