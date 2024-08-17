const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000; // Porta do servidor

// Configuração das APIs
const twitterConfig = {
    apiKey: 'rUiKnytIYPcAoOZGdZCHlTpEM',
    apiSecretKey: 'lYQHmHM29A29j5FaU9FBUC4K2tErRxpaNChoNrv0eKPnmygXBk',
    bearerToken: 'AAAAAAAAAAAAAAAAAAAAAHicvQEAAAAAChY4fUhC71pWwt079wDA0scWTtU',
};

const metaConfig = {
    clientId: 'YOUR_META_CLIENT_ID',
    clientSecret: 'YOUR_META_CLIENT_SECRET',
    redirectUri: 'http://localhost:3000/auth/meta/callback',
};

// Middleware para processar JSON
app.use(express.json());

// Rota para autenticação com X
app.get('/auth/x', (req, res) => {
    // Redireciona para o fluxo de autenticação do Twitter
    res.redirect(`https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${twitterConfig.apiKey}&redirect_uri=${encodeURIComponent('http://localhost:3000/auth/x/callback')}&scope=tweet.read tweet.write&state=state`);
});

// Rota de callback do Twitter
app.get('/auth/x/callback', async (req, res) => {
    const { code } = req.query;

    try {
        // Troca o código de autorização pelo token de acesso
        const response = await axios.post('https://api.twitter.com/oauth2/token', {
            code,
            client_id: twitterConfig.apiKey,
            redirect_uri: 'http://localhost:3000/auth/x/callback',
            grant_type: 'authorization_code',
        }, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });

        const accessToken = response.data.access_token;
        res.redirect('/'); // Redireciona de volta para a página principal
    } catch (error) {
        console.error('Erro ao autenticar com X:', error);
        res.status(500).send('Erro ao autenticar com X.');
    }
});

// Rota para autenticação com Meta
app.get('/auth/meta', (req, res) => {
    res.redirect(`https://www.facebook.com/v10.0/dialog/oauth?client_id=${metaConfig.clientId}&redirect_uri=${encodeURIComponent(metaConfig.redirectUri)}&state=state&scope=public_profile,email`);
});

// Rota de callback do Meta
app.get('/auth/meta/callback', async (req, res) => {
    const { code } = req.query;

    try {
        const response = await axios.get('https://graph.facebook.com/v10.0/oauth/access_token', {
            params: {
                client_id: metaConfig.clientId,
                client_secret: metaConfig.clientSecret,
                redirect_uri: metaConfig.redirectUri,
                code,
            },
        });

        const accessToken = response.data.access_token;
        res.redirect('/'); // Redireciona de volta para a página principal
    } catch (error) {
        console.error('Erro ao autenticar com Meta:', error);
        res.status(500).send('Erro ao autenticar com Meta.');
    }
});

// Rota para enviar tweets (apenas exemplo)
app.post('/api/x/tweet', async (req, res) => {
    const { text } = req.body;

    try {
        await axios.post('https://api.twitter.com/2/tweets', { text }, {
            headers: {
                'Authorization': `Bearer ${twitterConfig.bearerToken}`,
                'Content-Type': 'application/json',
            },
        });

        res.status(200).send('Tweet enviado com sucesso.');
    } catch (error) {
        console.error('Erro ao enviar o tweet:', error);
        res.status(500).send('Erro ao enviar o tweet.');
    }
});

// Inicia o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});
