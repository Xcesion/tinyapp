const express = require("express");
// const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; // default port 8080

function generateRandomString() {}

app.set("view engine", "ejs");// this tells the Express app to use EJS as its templating engine
// app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

// route for urls_index.ejs template
 app.get("/urls", (req, res) => {
  const username = req.cookies.username
  const urls = urlDatabase
  const templateVars = { 
    urls,
    username
  };
  res.render("urls_index", templateVars);
});

// urls/new must genertate before "GET /urls/:id" route.
app.get("/urls/new", (req, res) => {
  const username = req.cookies.username
  res.render("urls_new", {username});
});
// something . somthing 
// route for urls_show.ejs template
app.get("/urls/:id", (req, res) => {
  const username = req.cookies.username;
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { id, longURL, username};
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


app.post("/login", (req, res) => {
  const username = req.body.username;
  // Perform the necessary login logic here
  if (!username){
    res.status(400).send('Please provide a username');
  }
  // lookup the user based off their 
  res.cookie("username", username);
  res.redirect("/urls");
  
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});
// app.get("/register", (req, res) => {
//   res.render('register');
// });

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