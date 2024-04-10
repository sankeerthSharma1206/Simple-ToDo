console.log("Hello, Node.js!");

const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session')


//get schemas
const User = require('./schemas/newUser');
const loginUser = require('./schemas/oldUser');


const app = express();
const port = 5500;

const {mongoURI , options} = require('./api/key')

mongoose.connect(mongoURI, options).then(() => console.log("success")).catch(err => console.log("failure", err))


//middleware why
app.use(express.urlencoded({extended: true}))
app.use(session({
    secret  : 'sankeerth',
    resave: false,
    saveUninitialized: true,
    cookie: {secure: false}
}));

app.set('view engine', 'ejs');
app.set('views', __dirname + '/screens');

// connectinng login page
app.get('/login', (req, res) => {
    res.sendFile(__dirname + '/screens/login.html');
})

// this will connect registration page 
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/screens/registration.html');
});

//connect and send data to dashboard
app.get('/dashboard', (req, res) => {
    res.render('dashboard', {
        username : req.session.user.email
    });
});


//routes

//registration route
app.post('/register', async(req, res) => {
    try {
        const {
            username, email, password, confirmPassword
        } = req.body;

        if(password !== confirmPassword){
            return res.status(400).send("password don't match");
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("values", username + "\n" + email + "\n" + password)
        const newUser = new User({
            username,
            email,
            password : hashedPassword
        });

        await newUser.save();

        res.status(201).send('user registartion succesful');

    } catch (e) {
        console.log(e);
        res.status(500).send('server error');
    }
});


// login route
app.post('/login', async(req, res) => {
    try {
        const {email, password } = req.body;

        const user = await User.findOne({email});

        if (!user) {
            return res.status(400).send("The mentioned email id has not been registered, Please register first")
        }

        const validPass = await bcrypt.compareSync(password , user.password);

        if (!validPass) {
            return res.status(400).send("Password was incorrect, Please check again ")
        }


        req.session.loggedIn = true;
        req.session.user = {email};
        res.redirect('/dashboard');
        // res.status(200).send("Login ")
        
    } catch (error) {
        console.log("something went wrong, Please try again", error);
        res.status(500).send('server error');
    }
})


//dashboard route


//logout route 
app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error("error in logout, try again ", err);
        }

        // res.clearCookie('cookie-name')
        res.redirect('/login');
    });
});



app.listen(port, () => {
    console.log('server listening at somewhere in space ')
})
