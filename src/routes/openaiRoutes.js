const express = require('express');
const OpenAI = require("openai");
const router = express.Router();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

router.post('/', async (req, res) => {
    const { category } = req.body;
    const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{role: 'user', content: `백준에서 ${category} 문제를 초급, 중급, 고급으로 나누어 문제 번호와 제목을 배열 형식으로 3개씩 제공해 주세요. 예: 초급: [번호 - 제목], 중급: [번호 - 제목], 고급: [번호 - 제목].`}],
        max_tokens: 150
    })
    res.send(response.choices[0].message.content)
});

router.post('/grade',async (req, res) => {
    const { problemTitle, userLanguage, userCode } = req.body;

    try {
        const gradingPrompt = `
        문제: ${problemTitle}
        언어: ${userLanguage}
        사용자 코드:
        ${userCode}
        이 코드가 문제를 정확하게 해결하는지 평가해 주세요. 
        정확히 동작하면 true, 오류가 있거나 동작하지 않으면 false 라고 답변해 주세요.
        `;

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{role: 'user', content: gradingPrompt}],
            max_tokens: 5
        });

        res.send(response.choices[0].message.content);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '채점 중 오류가 발생했습니다.' });
    }
});

module.exports = router;
