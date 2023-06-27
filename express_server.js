const {getUserByEmail} = require('./helpers')
const express = require("express");
const morgan = require("morgan");
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080


// this tells the Express app to use EJS as its templating engine
app.set("view engine", "ejs");
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ["encryptKey1", "encryptKey2"],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

function generateRandomString() {
  return Math.random().toString(36).substring(2,7)
}

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur",10),
    
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk",10),
  },
};

app.get("/", (req, res) => {
  res.send("Hello! Welcome to Tiny App. Please enter /login page to login your account.");
});

//If the user is not logged in, redirect GET /urls/new to GET /login
const requireLogin = (req, res, next) => {
  const user_id = req.session.user_id;
  if (!user_id || !users[user_id]) {
    res.redirect("/login");
  } else {
    next();
  }
};

function urlsForUser(id) {
  const userURLs = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      userURLs[url] = urlDatabase[url];
    }
  }
  return userURLs;
}

app.get("/urls", (req, res) => {
  // const username = req.cookies.username  
  const user_id = req.session.user_id;
  const user = users[user_id];
  // const urls = urlDatabase;
  // console.log("show me what is this", urls);
  if(!user){
    return res.status(401).send("Please log in or register first ")
  }
  // shortURLIDs.map(id => urlDatabase[id].userID)
  console.log("user", user)
  const urls = urlsForUser(user_id);
  console.log("urls", urls)
  const templateVars = { urls, user};
  res.render("urls_index", templateVars);
});

// urls/new must genertate before "GET /urls/:id" route.
app.get("/urls/new", requireLogin ,(req, res) => {
  // const username = req.cookies.username
  const user_id = req.session.user_id;
  console.log(user_id)
  const user = users[user_id];
  res.render("urls_new", {user});
});


// route for urls_show.ejs template
app.get("/urls/:id", (req, res) => {
  // const username = req.cookies.username;
  const user_id = req.session.user_id;
  const user = users[user_id];
  const id = req.params.id;
  const userURLs = urlsForUser(user_id);
  console.log("what is this ", user);
  if (!user) {
    res.status(401).send("You need to be logged in to update a URL.");
    return;
  }
  if (urlDatabase[id] === undefined) {
    res.status(404).send("URL does not exist");
    return;
  }
  const longURL = urlDatabase[id].longURL;
  if (!Object.keys(userURLs).includes(id)) {
    res.status(403).send("You do not have permission to access this URL");
    return;
  }

  const templateVars = { id, longURL, user};
  res.render("urls_show", templateVars);
});

app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id; 
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[id].longURL = newLongURL
  res.redirect('/urls')
})

app.post("/urls", requireLogin,(req, res) => {
  // console.log(req.body); // Log the POST request body to the console
  // urlDatabase["111"] = req.body.longURL
  const user_id = req.session.user_id;
  const id = generateRandomString()
  const user = users[user_id];
  if (!user){
    return res.send("You are not allowed to shorten URLs. Please login first. \n Here is the login page :'http://localhost:8080/login' "); // Respond with 'Ok' (we will replace this)
  }
  urlDatabase[id] = {
    longURL : req.body.longURL,
    userID : user_id
  }
  res.redirect('/urls')
});


app.get("/u/:id", (req, res) => {
  // const longURL = ...
  const id = req.params.id;
  const url = urlDatabase[id];
  if (url.longURL) {
    res.redirect(url.longURL);
  } else {
    res.status(404).send("URL not found");
  }
});

app.get("/login", (req, res) => {
  const id = req.session.user_id
  const user = req.body.user;
  if(user){
    return res.redirect('/urls');
  }
  res.render("urls_login", {user});
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  
  if (!email || !password) {
    res.status(400).send('Please provide an email and password');
  }
  const user = getUserByEmail(email, users);
  // console.log("print the value of user password", user.password);
  if (!user || !bcrypt.compareSync(password, user.password)){
    res.status(403).send(`Invalid email or password`);
    return;
  }
  // res.cookie("user_id", user.id);
  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  console.log("test logout")
  req.session = null;
  res.redirect("/login");
});

app.get("/register", (req, res) => {
  // const username = "";
  const user = "";
  if(user){
    res.redirect("/urls");
  }
  res.render("urls_register", {user});
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  // Perform registration logic here
  // ...
  if (email === "" || password === ""){
    return res.status(400).send(`Email and Password can not be empty`)
  }
  const exitedUser = getUserByEmail(email, users);
  if (exitedUser){
    return res.status(400).send(`This email has already been registered`)
  }
  const user_id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);
  console.log(hashedPassword);
  const newUser = {
    id : user_id, 
    email: email,
    password : hashedPassword
  };

  users[user_id] = newUser //New user into Users database
  // res.cookie("user_id", user_id);
  req.session.user_id = user_id;// we can use user_id or newUser.id
  //register new users
  console.log(users)
  res.redirect("/urls"); // Redirect to a desired page after registration
});


app.get("/signup", (req, res) => {
  res.render("register");
});

app.listen(PORT, () =>{
  console.log( `app is listening on port ${PORT}` );
});