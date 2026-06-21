const dotenv = require('dotenv').config();
const express = require("express");
const mongoose = require('mongoose');
const cookieparser = require('cookie-parser');
const connectdb = require('./config/db');
const cors = require('cors');
const compression = require('compression');
const { aiRateLimiter } = require('./middlewere/rateLimiter');

const authroutes = require('./routes/authroutes');
const airoutes = require('./routes/airoutes');
const paymentroutes = require("./routes/paymentroutes");
const adminroutes = require("./routes/adminroutes");
const dashboard = require("./routes/dashboard");
const healthroutes = require("./routes/health");
const leadroutes = require("./routes/leadroutes");
const { startLeadFollowupCron } = require("./scripts/leadFollowupCron");

const app = express();

app.use(compression());
app.use(express.json());
app.use(cookieparser());
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true

}));

connectdb();

app.use('/admin', adminroutes); 
app.use('/auth', authroutes);
app.use('/ai', aiRateLimiter, airoutes); // Apply rate limiter to AI routes
app.use('/payment', paymentroutes);
app.use('/dashboard', dashboard);
app.use('/api/health', healthroutes);
app.use('/api/leads', leadroutes);

startLeadFollowupCron();

app.listen(5000,()=>{
    console.log("Server running...");
})
