import express from 'express';
import hbs from 'hbs';
import { Server } from 'socket.io';
import http from 'http';
import { userRoutes } from './routes/user.routes.js';
import session from 'express-session'
import bodyParser from 'body-parser';
import { connectToDB } from './config/database.js';
import { initialServer } from './services/socketio.js';


const app = express();

app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(session({
    secret: "Abc123abc",
    resave: false,
    saveUninitialized: false,
}))
app.use((req, res, next)=>{
    res.locals.user = req.session.user;
    next();
})

app.use('/', userRoutes );

connectToDB();

const server = http.createServer(app);
initialServer(server);

server.listen(3000, ()=>{
    console.log("server is running on http://localhost:3000");
})
