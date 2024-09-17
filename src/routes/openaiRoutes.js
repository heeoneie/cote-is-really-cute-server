const express = require('express');
const OpenAI = require("openai");
const router = express.Router();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
})
router.post('/', async (req, res) => {
    const { category } = req.body;
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{role: 'user', content: `백준에서 ${category} 문제를 초급, 중급, 고급으로 나누어 문제 번호와 제목을 배열 형식으로 3개씩 제공해 주세요. 예: 초급: [번호 - 제목], 중급: [번호 - 제목], 고급: [번호 - 제목].`}],
        max_tokens: 150
    })
    res.send(response.choices[0].message.content)
});

module.exports = router;
