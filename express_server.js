const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");// this tells the Express app to use EJS as its templating engine
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

function generateRandomString() {
  return Math.random().toString(36).substring(2,7)
}

// old structure
// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };
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
  res.send("Hello!");
});

//If the user is not logged in, redirect GET /urls/new to GET /login
const requireLogin = (req, res, next) => {
  const user_id = req.cookies.user_id;
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
  const user_id = req.cookies.user_id;
  const user = users[user_id];
  // const urls = urlDatabase;
  // console.log("show me what is this", urls);
  if(!user){
    res.status(401).send("Please log in or register first ")
  }
  // shortURLIDs.map(id => urlDatabase[id].userID)
  console.log("user", user)
  const urls = urlsForUser(user_id);
  console.log("urls", urls)
  const templateVars = { urls, user};
  return res.render("urls_index", templateVars);
});

// urls/new must genertate before "GET /urls/:id" route.
app.get("/urls/new", requireLogin ,(req, res) => {
  // const username = req.cookies.username
  const user_id = req.cookies.user_id;
  console.log(user_id)
  const user = users[user_id];
  res.render("urls_new", {user});
});


// route for urls_show.ejs template
app.get("/urls/:id", requireLogin,(req, res) => {
  // const username = req.cookies.username;
  const user_id = req.cookies.user_id;
  const user = users[user_id];
  const id = req.params.id;
  const longURL = urlDatabase[id].longURL;
  const templateVars = { id, longURL, user};
  if(!longURL) {
    return res.status(404).send("URL not found");
  }
  res.render("urls_show", templateVars);
});

app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id; 
  delete id;
  res.redirect('/urls');
});

app.post('/urls/:id/edit', (req, res) => {
  const id = req.params.id;
  const newLongURL = req.body.longURL;
  urlDatabase[id].longURL = newLongURL
  res.redirect('/urls')
})

app.post("/urls", requireLogin,(req, res) => {
  // console.log(req.body); // Log the POST request body to the console
  // urlDatabase["111"] = req.body.longURL
  const user_id = req.cookies.user_id;
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
  const longURL = urlDatabase[id].longURL;
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("URL not found");
  }
});

app.get("/login", (req, res) => {
  const id = req.cookies.user_id
  const user = req.body.user;
  if(user){
    return res.redirect('/urls');
  }
  
  return res.render("urls_login", {user : null});
});

//ask mentor how to change the username to user
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send('Please provide an email and password');
  }
  const user = Object.values(users).find(user => user.email === email);
  // console.log("print the value of user password", user.password);
  if (!user || !bcrypt.compareSync(password, user.password)){
    return res.status(403).send(`Invalid email or password`);
  }
  res.cookie("user_id", user.id);
  return res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  console.log("test logout")
  res.clearCookie("user_id");
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
    res.status(400).send(`Email and Password can not be empty`)
  }
  const exitedUser = Object.values(users).find(user => user.email === email);
  if (exitedUser){
    res.status(400).send(`This email has already been registered`)
  }
  const user_id = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password, 10);
  console.log(hashedPassword);
  const newUser = {
    id : user_id, 
    email: email,
    password : hashedPassword
  };

  users[user_id] = newUser
  res.cookie("user_id", user_id)
  //register new users
  console.log(users)
  res.redirect("/urls"); // Redirect to a desired page after registration
});


app.get("/signup", (req, res) => {
  res.render("register");
});
// app.get('/protected', (req, res) => {
//   //read the incoming cookie(S)
//   const username = req.cookies.username;
//   if(username){
//       res.status(401).send(`you must be logged in to see the page`)
//   }
//   console.log(req.cookies);
// })

app.listen(PORT, () =>{
  console.log( `app is listening on port ${PORT}` );
});