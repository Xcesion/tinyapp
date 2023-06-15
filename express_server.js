const express = require("express");
// const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080


app.set("view engine", "ejs");// this tells the Express app to use EJS as its templating engine
// app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

// route for urls_index.ejs template
 app.get("/urls", (req, res) => {
  // const username = req.cookies.username  
  const user_id = req.cookies.user_id;
  const user = users[user_id];
  const urls = urlDatabase
  const templateVars = { urls, user};
  res.render("urls_index", templateVars);
});

// urls/new must genertate before "GET /urls/:id" route.
app.get("/urls/new", (req, res) => {
  // const username = req.cookies.username
  const user_id = req.cookies.user_id;
  const user = users[user_id];
  res.render("urls_new", {user});
});
// something . somthing 
// route for urls_show.ejs template
app.get("/urls/:id", (req, res) => {
  // const username = req.cookies.username;
  const user_id = req.cookies.user_id;
  const user = users[user_id];
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { id, longURL, user};
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
  urlDatabase[id] = newLongURL
  res.redirect(urls)
})
app.post("/urls/", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  urlDatabase["111"] = req.body.longURL
  res.send("Ok"); // Respond with 'Ok' (we will replace this)
});


app.get("/u/:id", (req, res) => {
  // const longURL = ...
  const id = req.params.id;
  const longURL = urlDatabase[id];
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("URL not found");
  }
});

app.get("/login", (req, res) => {
  res.render("urls_login");
});

//ask mentor how to change the username to user
app.post("/login", (req, res) => {
  const username = req.body.username;
  // Perform the necessary login logic here
  // if (!username){
  //   res.status(400).send('Please provide a username');
  // }
  // // lookup the user based off their 
  // res.cookie("user_id", username);
  // res.redirect("/urls");
  if (!email || !password) {
    res.status(400).send('Please provide an email and password');
  }
  const user = Object.values(users).find(user => user.email === email || user.password === password);
  if (!user){
    res.status(403).send(`Invalid email or password`);
    return;
  }
  if (user.password !== password){
    res.status(403).send(`Invalid email or password`);
    return;
  }
  res.cookie("user_id", user.user_id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  const username = "";
  res.render("urls_register", {username});
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
  const user_id = Math.random().toString(36).substring(2,6)
  const newUsers = {user_id, email, password};
  users[user_id] = newUsers
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