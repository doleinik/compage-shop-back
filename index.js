require('dotenv').config()
// let ip = require("ip");

const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const cors = require('cors');

const token = '5864650726:AAHxAflT-YsgvwZ8eob-Y1u0kjDHKTK1uiY';
const webAppUrl = 'https://splendorous-buttercream-c2243b.netlify.app';

const bot = new TelegramBot(token, {polling: true});
const app = express();

const admin_id = '350664322';
let user_id = '';
let message = '';

app.use(express.json());
app.use(cors());

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    message = msg.text;
    user_id = msg.chat.id;

    if (text === '/start') {
        await bot.sendMessage(chatId, 'Ниже появится кнопка, заполни форму', {
            reply_markup: {
                keyboard: [
                    [{text: 'Заполнить форму', web_app: {url: webAppUrl + '/form'}}],
                    [{text: 'Сделать заказ', web_app: {url: webAppUrl}}]
                ]
            }
        })

        await bot.sendMessage(chatId, 'Заходи в наш интернет магазин по кнопке ниже' + chatId, {
            reply_markup: {
                inline_keyboard: [
                    [{text: 'Сделать заказ', web_app: {url: webAppUrl}}],
                    [{text: 'Заполнить форму', web_app: {url: webAppUrl + '/form'}}]
                ]
            }
        })
    }

    if (msg?.web_app_data?.data) {
        try {
            const data = JSON.parse(msg?.web_app_data?.data)
            await bot.sendMessage(chatId, 'Спасибо за обратную связь!')
            await bot.sendMessage(chatId, 'Ваша страна: ' + data?.country);
            await bot.sendMessage(chatId, 'Ваша улица: ' + data?.street);
            await bot.sendMessage(admin_id, 'New order!\nВаша страна: ' + data?.country + '\nВаша улица: ' + data?.street, {
                reply_markup: {
                    inline_keyboard: [
                        [{text: 'Отправлен', callback_data: 'send'}],
                        [{text: 'Доставлен', callback_data: 'done'}],
                        [{text: 'Повідомлення', web_app: {url: webAppUrl + '/message'}}]
                    ]
                }
            })

            setTimeout(async () => {
                await bot.sendMessage(chatId, 'Всю информацию вы получите в этом чате');
            }, 3000)
        } catch (e) {
            console.log(e);
        }
    }

    bot.on('callback_query', function onCallbackQuery(callbackQuery) {
        const action = callbackQuery.data;
        message = callbackQuery.text;
        if (action === 'send') {
            bot.sendMessage(user_id, 'Ваше замовлення відправлено');
        }
        if (action === 'done') {
            bot.sendMessage(user_id, 'Ваше замовлення доставленно');
        }
        if (action === 'message') {
            bot.sendMessage(user_id, text);
        }
    });
});



app.post('/web-data', async (req, res) => {
    const {queryId, products = [], totalPrice} = req.body;
    try {
        await bot.answerWebAppQuery(queryId, {
            type: 'article',
            id: queryId,
            title: 'Успешная покупка',
            input_message_content: {
                message_text: ` Поздравляю с покупкой, вы приобрели товар на сумму ${totalPrice}, ${products.map(item => item.title).join(', ')}`
            }
        })
        return res.status(200).json({});
    } catch (e) {
        return res.status(500).json({})
    }
})
const PORT = 8000;

app.listen(PORT, () => console.log('server started on PORT ' + PORT))


