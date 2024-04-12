

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const port = 3000;
const path = require('path');
app.use(morgan('combined'));
app.use(express.static(path.join(__dirname, 'public')));

const rateLimit = require("express-rate-limit");

const perSecondLimiter = rateLimit({
  windowMs: 1 * 1000,
  max: 5, 
  message: "Too many requests, please try again later. "
});

const perMinuteLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 30,
  message: "Too many requests, please try again later."
});

const perHourLimiter = rateLimit({
  windowMs: 1 * 60 * 60 * 1000, 
  max: 1000, 
  message: "Too many requests, please try again later."
});

app.use("/api/", perSecondLimiter, perMinuteLimiter, perHourLimiter);

setInterval(() => {
    const memoryUsage = process.memoryUsage();
    console.log(`Memory usage: RSS = ${Math.round(memoryUsage.rss / 1024 / 1024)}MB, Heap Total = ${Math.round(memoryUsage.heapTotal / 1024 / 1024)}MB, Heap Used = ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`);
}, 30000);

app.use(function(req, res, next) {
    res.header("X-Frame-Options", "SAMEORIGIN");
    next();
});

app.use(cors({
    origin: ['https://ai.movie-river.xyz', 'https://bookish-halibut-7qpgpp67xwwhxwwj-3000.app.github.dev']
}));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/faq', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'faq.html'));
});

app.get('/gpt', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'inprogress.html'));
});

app.get('/text2img', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'text2img.html'));
});

app.get('/llama2-70b', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'llama2:70b.html'));
});

app.get('/llama2-13b', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'llama2:13b.html'));
});

app.get('/llama2-7b', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'llama2:7b.html'));
});

app.get('/mixtral', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'mixtral.html'));
});

app.get('/api/text2img', async (req, res) => {
    const userInput = req.query.userInput || '';
    const recaptchaToken = req.query.recaptchaToken;

    const recaptchaVerificationResponse = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
        params: {
            secret: '6LehzKApAAAAADmLx-IuLIEgY2UMgJAMbqqsj2kx',
            response: recaptchaToken
        }
    });

    if (!recaptchaVerificationResponse.data.success || recaptchaVerificationResponse.data.score < 0.5) {
        res.status(400).send('reCAPTCHA failed');
        return;
    }


    const data = new URLSearchParams({
        prompt: userInput,
        output_format: "bytes",
        user_profile_id: null,
        anonymous_user_id: "4da2d119-88d3-4a7e-a293-b1b2eed72e78",
        request_timestamp: 1711060862.342,
        user_is_subscribed: false,
        client_id: "pSgX7WgjukXCBoYwDM8G8GLnRRkvAoJlqa5eAVvj95o"
    });

    const headers = {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Origin': 'https://magicstudio.com',
        'Referer': 'https://magicstudio.com/ai-art-generator/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 OPR/107.0.0.0',
    };

    try {
        const response = await axios.post('https://ai-api.magicstudio.com/api/ai-art-generator', data, { headers: headers, responseType: 'arraybuffer' });

        res.set('Content-Type', 'image/png');
        res.send(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while processing your request.");
    }
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});