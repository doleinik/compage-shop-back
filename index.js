const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');
const products = require('./data/products')

const token = '5756599852:AAF2AcGhYNOAC3gMB1bCdUEnIoY1CnKU0Fw';
const webAppUrl = 'https://shimmering-belekoy-c380cc.netlify.app';
const groupId = '-665180888';

const bot = new TelegramBot(token, {polling: true});
const app = express();

app.use(express.json());
app.use(cors());

app.get('/api/products', (req, res) => {
    res.json(products)
})

app.get('/api/products/:id', (req, res) => {
    const product = products.find(p => p.id === req.params.id)
    res.json(product)
})

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text === '/start') {
        await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму', {
            reply_markup: {
                keyboard: [
                    [{text: 'Заполнить форму', web_app: {url: webAppUrl + '/form'}}],
                    [{text: 'Заполнить форму', web_app: {url: webAppUrl + '/form'}}]
                ]
            }

        })

        await bot.sendMessage(chatId, 'Заходи в наш интернет магазин по кнопке ниже', {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Сделать заказ', web_app: {url: webAppUrl}}]
                ]
            }
        })
        if (msg?.web_app_data?.data) {
            try {
                const data = JSON.parse(msg?.web_app_data?.data)
                console.log(msg?.web_app_data?.data)
                await bot.sendMessage(chatId, 'Спасибо за обратную связь!')
                await bot.sendMessage(chatId, 'User: ' + data);
                await bot.sendMessage(chatId, 'Ваша страна: ' + data?.country);
                await bot.sendMessage(chatId, 'Ваша улица: ');
                // await bot.sendMessage(groupId, 'User: ' + data?.user + ' Ваша улица: ' + data?.street + ' Ваша страна' + data?.country);

                setTimeout(async () => {
                    await bot.sendMessage(chatId, 'Всю информацию вы получите в этом чате');
                }, 3000)
            } catch (e) {
                console.log(e);
            }
        }
    }
});

// app.post('/web-data', async (req, res) => {
//     const {queryId, products = [], totalPrice} = req.body;
//     try {
//         await bot.answerWebAppQuery(queryId, {
//             type: 'article',
//             id: queryId,
//             title: 'Успешная покупка',
//             input_message_content: {
//                 message_text: ` Поздравляю с покупкой, вы приобрели товар на сумму ${totalPrice}, ${products.map(item => item.title).join(', ')}`
//             }
//         })
//         return res.status(200).json({});
//     } catch (e) {
//         return res.status(500).json({})
//     }
// })

const PORT = 8000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT))
