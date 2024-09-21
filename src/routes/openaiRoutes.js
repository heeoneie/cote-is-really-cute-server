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
        messages: [
            { role: 'system', content: '너는 문제 추천 시스템이다.' },
            { role: 'user', content: `백준에서 ${category} 문제를 초급, 중급, 고급으로 나누어 문제 번호와 제목을 배열 형식으로 3개씩 제공해 주세요. 예: 초급: [번호 - 제목], 중급: [번호 - 제목], 고급: [번호 - 제목].` }
        ],
        max_tokens: 150
    })
    res.send(response.choices[0].message.content)
});

router.post('/grade',async (req, res) => {
    const { problemTitle, userLanguage, userCode } = req.body.data;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: 'You are a grading assistant. Respond only with true or false based on the correctness of the code.' },
                { role: 'user', content: `코드를 검증해주세요. 문제: "${problemTitle}", 언어: "${userLanguage}", 코드: "${userCode}". 올바른 경우 "true", 그렇지 않은 경우 "false"만 반환하세요.` }
            ],
            max_tokens: 5
        });
        const answer = response.choices[0].message.content.trim().toLowerCase();
        const result = answer.startsWith('true') ? true : false;
        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: '채점 중 오류가 발생했습니다.' });
    }
});

module.exports = router;
