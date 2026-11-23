import express from 'express';
import hbs from 'hbs';
import { Server } from 'socket.io';
import http from 'http';
import { userRoutes } from './routes/user.routes.js';
import bodyParser from 'body-parser';
import { connectToDB } from './config/database.js';


const app = express();

app.set('view engine', 'hbs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use('/', userRoutes );


connectToDB();

const server = http.createServer(app);
const io = new Server(server, {
    cors:{
        origin: 'http://localhost:3000'
    }
});



server.listen(3000, ()=>{
    console.log("server is running on http://localhost:3000");
})
