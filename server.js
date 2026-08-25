const express = require('express');
const axios = require('axios');
const crypto = require('crypto');

const app = express();
const APPID = 'wx277bc04fe36608e4';
const SECRET = '9874e071849ad3389552fc3da757a52f';

/** 微信公众号服务器验证 */
// const TOKEN = 'cjy38'; // 和微信后台填写一致
// app.get('/wx/push', (req, res) => {
// 	const { signature, timestamp, nonce, echostr } = req.query;

// 	const str = [TOKEN, timestamp, nonce].sort().join('');

// 	const sha1 = crypto.createHash('sha1').update(str).digest('hex');

// 	if (sha1 === signature) {
// 		res.send(echostr);
// 	} else {
// 		res.send('check fail');
// 	}
// });

async function getAccessToken() {
    const res = await axios.get('https://api.weixin.qq.com/cgi-bin/token', {
        params: {
            grant_type: 'client_credential',
            appid: APPID,
            secret: SECRET,
        },
    });

    return res.data.access_token;
}

app.use(express.json());

app.post('/login', async (req, res) => {
    try {
        const { code } = req.body;

        const result = await axios.get(
            'https://api.weixin.qq.com/sns/jscode2session',
            {
                params: {
                    appid: APPID,
                    secret: SECRET,
                    js_code: code,
                    grant_type: 'authorization_code',
                },
            },
        );

        res.send({
            code: 200,
            data: {
                openId: result.data.openid,
            },
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
});

app.get('/token', async (req, res) => {
    const result = await getAccessToken();

    console.log(result);

    res.send(result);
});

app.get('/send', async (req, res) => {
    const token = await getAccessToken();

    const result = await axios.post(
        `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${token}`,
        {
            touser: 'oca6a5XpSBIlOYrE7UW1jdULRYPA',
            template_id: 'H9Sw71n5nEPxOxfU4qGoT9rkd1rjxbJ1jdfkBOFr9XE',
            page: 'pages/index/index',
            data: {
                date4: {
                    value: '2077-07-07',
                },
                name3: {
                    value: '菜叶',
                },
                thing1: {
                    value: '来夜之城',
                },
            },
        },
    );

    res.send(result.data);
});

app.listen(3001);
