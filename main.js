// imports
require('dotenv').config();

const express       = require('express');
const mongoose      = require('mongoose');
const csurf         = require('csurf');
const bodyParser    = require('body-parser');
const session       = require('express-session');
const cookieParser  = require('cookie-parser');
const path          = require('path'); 

const petsCategories = require('./models/pets_categories');

const app = express();
const PORT = process.env.PORT || 4000;

// db connection
mongoose.connect(process.env.DB_URI);

const db = mongoose.connection;
db.on('error', (error) => console.log(error));

// middleware
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cookieParser());

app.use(session({
 secret: process.env.SESSION_SECRET,
 saveUninitialized: true,
 resave: false
}))

// Middleware function to fetch categories
// Needed for navbar
const fetchCategories = async (req, res, next) => {
  try {
      const categories      = await petsCategories.find();
      res.locals.categories = categories;
      next(); 
  } catch (error) {
      res.status(500).json({ message: error.message });
  }
};

app.use(fetchCategories);

app.use((req,res,next) => {

  const csrfToken = csurf({ cookie: true });

  res.locals.csrfToken = csrfToken;
  res.locals.message = req.session.message;
  delete req.session.message;

  // Middleware to set isLoggedIn flag 
  res.locals.isLoggedIn = req.session.accountId ? true : false;
  
  next ();
})

app.use('/uploads', express.static('uploads'));
app.use('/css', express.static(path.join(__dirname, 'views', 'css')));
app.use('/js', express.static(path.join(__dirname, 'views', 'js')));

// template engine
app.set ('view engine', 'ejs');

// route prefix
app.use( "", require("./routes/routes"));
app.use("/pets", require("./routes/pets"));

app.listen( PORT, () => {
  console.log(`started`);
});