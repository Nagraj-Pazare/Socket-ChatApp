import express from 'express';
import 'dotenv/config'
import hbs from 'hbs';
import { Server } from 'socket.io';
import http from 'http';
import { userRoutes } from './routes/user.routes.js';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import { connectToDB } from './config/database.js';
import { initialServer } from './services/socketio.js';
import { ifCondHelper } from './helpers/hbsHelpers.js';



const app = express();

app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use('/', userRoutes );

app.use((err, req, res, next)=>{
  return res.render('error-page', {
    success: false,
    status: err.statusCode || 500,
    message: err.message,
    error: err.stack,
  })
})

hbs.registerHelper('ifCond', ifCondHelper);

connectToDB();

const server = http.createServer(app);
initialServer(server);

server.listen(3000, ()=>{
    console.log("server is running on http://localhost:3000");
})
