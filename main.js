

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const port = 3000;
const path = require('path');
const rateLimit = require("express-rate-limit");
app.use(morgan('combined'));
app.use(express.static(path.join(__dirname, 'public')));

process.on('uncaughtException', (err) => {
  console.error('There was an uncaught error', err);
  process.exit(1); 
});

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
  process.exit(1);
});

function errorHandler(err, req, res, next) {
  console.error(err.stack); 
  res.status(500).json({ message: "An error occurred, try again later." });
  next(); 
}
app.use(errorHandler);

const limiterPerSecond = rateLimit({
    windowMs: 1000, 
    max: 1 
  });

const limiter1Minute = rateLimit({
  windowMs: 1 * 60 * 1000, 
  max: 30
});

const limiter5Minutes = rateLimit({
  windowMs: 5 * 60 * 1000, 
  max: 250 
});

const limiter10Minutes = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 500 
});

  app.use("/", limiterPerSecond, limiter1Minute, limiter5Minutes, limiter10Minutes);

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
    res.sendFile(path.join(__dirname, 'public', 'llama2_70b.html'));
});

app.get('/llama2-13b', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'llama2_13b.html'));
});

app.get('/llama2-7b', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'llama2_7b.html'));
});

app.get('/gemini', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'inprogress.html'));
});

app.get('/llama3-70b', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'llama3_70b.html'));
});

app.get('/llama3-8b', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'llama3_8b.html'));
});

app.get('/mixtral', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'mixtral.html'));
});


app.get('/api/llama3:70b', async (req, res) => {
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


    let chatHistory = req.query.chatHistory ? decodeURIComponent(req.query.chatHistory).split('<br>') : [];
    chatHistory.push(`USER: ${userInput}\n`);

    const systemPrompt = "You are an AI model named Llama 3 70b developed by Meta. Your role is to assist users by providing helpful, professional, and respectful responses. Do not prefix your responses with identifiers like 'AI Assistant:', 'Llama2:70b:' or 'AI:'. Your responses should consist solely of the information or assistance relevant to the user's query. The previous conversation is as follows:\n" + chatHistory.join('');

    const payload = {
        prompt: "<s>[INST] <<SYS>>\n" + systemPrompt + "<</SYS>>\n\n" + userInput + " [/INST]\n",
        audio: null,
        image: null,
        maxTokens: 800,
        model: "meta/meta-llama-3-70b-instruct",
        systemPrompt: systemPrompt,
        temperature: 0.75,
        topP: 0.9
    };

    const response = await axios.post('https://www.llama2.ai/api', payload, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Origin': 'https://www.llama2.ai',
            'Referer': 'https://www.llama2.ai/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 OPR/107.0.0.0',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin'
        }
    });

    if (!response.data.trim()) {
        res.send("Error: Received an empty response. Please submit your query again.");
        return;
    }

    res.send(`AI: ${response.data}`);
    chatHistory.push(`YOU: ${response.data}\n`);
});

app.get('/api/llama3:8b', async (req, res) => {
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


    let chatHistory = req.query.chatHistory ? decodeURIComponent(req.query.chatHistory).split('<br>') : [];
    chatHistory.push(`USER: ${userInput}\n`);

    const systemPrompt = "You are an AI model named Llama 3 8b developed by Meta. Your role is to assist users by providing helpful, professional, and respectful responses. Do not prefix your responses with identifiers like 'AI Assistant:', 'Llama2:70b:' or 'AI:'. Your responses should consist solely of the information or assistance relevant to the user's query. The previous conversation is as follows:\n" + chatHistory.join('');

    const payload = {
        prompt: "<s>[INST] <<SYS>>\n" + systemPrompt + "<</SYS>>\n\n" + userInput + " [/INST]\n",
        audio: null,
        image: null,
        maxTokens: 800,
        model: "meta/meta-llama-3-8b-instruct",
        systemPrompt: systemPrompt,
        temperature: 0.75,
        topP: 0.9
    };

    const response = await axios.post('https://www.llama2.ai/api', payload, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Origin': 'https://www.llama2.ai',
            'Referer': 'https://www.llama2.ai/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 OPR/107.0.0.0',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin'
        }
    });

    if (!response.data.trim()) {
        res.send("Error: Received an empty response. Please submit your query again.");
        return;
    }

    res.send(`AI: ${response.data}`);
    chatHistory.push(`YOU: ${response.data}\n`);
});

app.get('/api/llama2:70b', async (req, res) => {
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

    let chatHistory = req.query.chatHistory ? decodeURIComponent(req.query.chatHistory).split('<br>') : [];
    chatHistory.push(`USER: ${userInput}\n`);

    const systemPrompt = "You are an AI model named Llama2:70b developed by Meta. Your role is to assist users by providing helpful, professional, and respectful responses. Do not prefix your responses with identifiers like 'AI Assistant:', 'Llama2:70b:' or 'AI:'. Your responses should consist solely of the information or assistance relevant to the user's query. The previous conversation is as follows:\n" + chatHistory.join('');

    const payload = {
        prompt: "<s>[INST] <<SYS>>\n" + systemPrompt + "<</SYS>>\n\n" + userInput + " [/INST]\n",
        audio: null,
        image: null,
        maxTokens: 800,
        model: "meta/llama-2-70b-chat",
        systemPrompt: systemPrompt,
        temperature: 0.75,
        topP: 0.9
    };

    const response = await axios.post('https://www.llama2.ai/api', payload, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Origin': 'https://www.llama2.ai',
            'Referer': 'https://www.llama2.ai/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 OPR/107.0.0.0',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin'
        }
    });

    if (!response.data.trim()) {
        res.send("Error: Received an empty response. Please submit your query again.");
        return;
    }

    res.send(`AI: ${response.data}`);
    chatHistory.push(`YOU: ${response.data}\n`);
});

app.get('/api/llama2:13b', async (req, res) => {
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

    let chatHistory = req.query.chatHistory ? decodeURIComponent(req.query.chatHistory).split('<br>') : [];
    chatHistory.push(`USER: ${userInput}\n`);

    const systemPrompt = "You are an AI model named Llama2:13b developed by Meta. Your role is to assist users by providing helpful, professional, and respectful responses. Do not prefix your responses with identifiers like 'AI Assistant:' or 'Llama2:70b:'. Your responses should consist solely of the information or assistance relevant to the user's query. The previous conversation is as follows:\n" + chatHistory.join('');

    const payload = {
        prompt: "<s>[INST] <<SYS>>\n" + systemPrompt + "<</SYS>>\n\n" + userInput + " [/INST]\n",
        audio: null,
        image: null,
        maxTokens: 800,
        model: "meta/llama-2-13b-chat",
        systemPrompt: systemPrompt,
        temperature: 0.75,
        topP: 0.9
    };

    const response = await axios.post('https://www.llama2.ai/api', payload, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Origin': 'https://www.llama2.ai',
            'Referer': 'https://www.llama2.ai/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 OPR/107.0.0.0',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin'
        }
    });

    if (!response.data.trim()) {
        res.send("Error: Received an empty response. Please submit your query again.");
        return;
    }

    res.send(`AI: ${response.data}`);
    chatHistory.push(`YOU: ${response.data}\n`);
});

app.get('/api/llama2:7b', async (req, res) => {
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

    let chatHistory = req.query.chatHistory ? decodeURIComponent(req.query.chatHistory).split('<br>') : [];
    chatHistory.push(`USER: ${userInput}\n`);

    const systemPrompt = "You are an AI model named Llama2:7b developed by Meta. Your role is to assist users by providing helpful, professional, and respectful responses. Do not prefix your responses with identifiers like 'AI Assistant:' or 'Llama2:70b:'. Your responses should consist solely of the information or assistance relevant to the user's query. The previous conversation is as follows:\n" + chatHistory.join('');

    const payload = {
        prompt: "<s>[INST] <<SYS>>\n" + systemPrompt + "<</SYS>>\n\n" + userInput + " [/INST]\n",
        audio: null,
        image: null,
        maxTokens: 800,
        model: "meta/llama-2-7b-chat",
        systemPrompt: systemPrompt,
        temperature: 0.75,
        topP: 0.9
    };

    const response = await axios.post('https://www.llama2.ai/api', payload, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Origin': 'https://www.llama2.ai',
            'Referer': 'https://www.llama2.ai/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 OPR/107.0.0.0',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin'
        }
    });

    if (!response.data.trim()) {
        res.send("Error: Received an empty response. Please submit your query again.");
        return;
    }

    res.send(`AI: ${response.data}`);
    chatHistory.push(`YOU: ${response.data}\n`);
});

app.get('/api/mixtral', async (req, res) => {
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

    let chatHistory = req.query.chatHistory ? decodeURIComponent(req.query.chatHistory).split('<br>') : [];
    chatHistory.push(`USER: ${userInput}\n`);

    const systemPrompt = "You are an AI model named Mixtral 8x7b developed by Meta. Your role is to assist users by providing helpful, professional, and respectful responses. Do not prefix your responses with identifiers like 'AI Assistant:' or 'Llama2:70b:'. Your responses should consist solely of the information or assistance relevant to the user's query. The previous conversation is as follows:\n" + chatHistory.join('');

    const system = {
        role: "system",
        content: systemPrompt
    };
    
    const user = {
        role: "user",
        content: userInput
    };

    const payload = {
        messages: [system, user],
        max_tokens: 800,
        model: "mistralai/Mixtral-8x7B-Instruct-v0.1",
        stream: "False"
    };

    const response = await axios.post('https://api.deepinfra.com/v1/openai/chat/completions', payload, {
        headers: {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Origin': 'https://deepinfra.com',
            'Referer': 'https://deepinfra.com/',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36 OPR/107.0.0.0',
            'Sec-Fetch-Dest': 'empty',
            'Sec-Fetch-Mode': 'cors',
            'Sec-Fetch-Site': 'same-origin'
        }
    });

    const aiResponse = response.data.choices[0].message.content;
    res.send(`AI: ${aiResponse}`);
    chatHistory.push(`YOU: ${aiResponse}\n`);
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

app.get('/api/gpt35', async (req, res) => {
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

    let chatHistory = req.query.chatHistory ? decodeURIComponent(req.query.chatHistory).split('<br>') : [];
    chatHistory.push(`USER: ${userInput}\n`);

    const messages = [
        { 
            role: "system", 
            content: "You are an AI model named GPT 3.5 turbo developed by OpenAI. Your role is to assist users by providing helpful, professional, and respectful responses. Do not prefix your responses with identifiers like 'AI Assistant:' or 'Llama2:70b:'. Your responses should consist solely of the information or assistance relevant to the user's query. The previous conversation is as follows:\n" + chatHistory.join('') 
        },
        { 
            role: "user", 
            content: userInput 
        }
    ];

    try {
        const response = await axios.post('https://api.openai.com/v1/engines/davinci-codex/completions', {
            model: "gpt-3.5-turbo",
            messages: messages
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            }
        });

        if (!response.data.choices[0].text.trim()) {
            res.send("Error: Received an empty response. Please submit your query again.");
            return;
        }

        res.send(`AI: ${response.data.choices[0].text}`);
        chatHistory.push(`YOU: ${response.data.choices[0].text}\n`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An error occurred while trying to ping the OpenAI API' });
    }
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});



app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
