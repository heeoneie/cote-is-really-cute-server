import { Router, Request, Response } from 'express';
import OpenAI from 'openai';
import NodeCache from 'node-cache';

type ProblemRecommendationRequest = {
  category: string;
};

type CodeGradingRequest = {
  problemTitle: string;
  userLanguage: string;
  userCode: string;
};

type RandomProblem = {
  problemNumber: number;
  problemTitle: string;
};

const router = Router();

if (!process.env.OPENAI_API_KEY)
  throw new Error('OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * @swagger
 * tags:
 *   name: OpenAI
 *   description: OpenAI API를 이용한 문제 추천 및 채점 API
 */

/**
 * @swagger
 * /openai/recommendation:
 *   post:
 *     summary: 문제 추천
 *     description: 입력한 카테고리에 따라 백준의 초급, 중급, 고급 문제를 추천합니다.
 *     tags: [OpenAI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 description: 문제 추천 카테고리
 *                 example: '그래프'
 *     responses:
 *       200:
 *         description: 추천된 문제 목록
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: '초급: [1000 - A+B], 중급: [1001 - A-B], 고급: [1002 - A*C]'
 *       500:
 *         description: 서버 에러
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: '추천 시스템에서 오류가 발생했습니다.'
 */
router.post(
  '/recommendation',
  async (
    req: Request<
      Record<string, never>,
      Record<string, never>,
      ProblemRecommendationRequest
    >,
    res: Response,
  ): Promise<void> => {
    const { category } = req.body;

    if (
      !category ||
      typeof category !== 'string' ||
      category.trim().length === 0
    ) {
      res.status(400).json({ error: '유효한 카테고리를 입력해주세요.' });
      return;
    }

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a Baekjun problem recommendation system. Provide only the problem numbers and titles without any additional commentary.',
          },
          {
            role: 'user',
            content: `백준에서 ${category} 문제를 초급, 중급, 고급으로 나누어 문제 번호와 제목을 배열 형식으로 3개씩 제공해 주세요. 예: 초급: [번호 - 제목], 중급: [번호 - 제목], 고급: [번호 - 제목].`,
          },
        ],
        max_tokens: 150,
      });
      if (!response.choices?.[0]?.message?.content)
        throw new Error('OpenAI API 응답이 예상된 형식이 아닙니다.');
      console.log(response.choices[0].message.content);
      res.send({ problems: response.choices[0].message.content });
    } catch (error) {
      console.error(error);
      if (error instanceof OpenAI.APIError)
        res
          .status(error.status || 500)
          .json({ error: 'OpenAI API 호출 중 오류가 발생했습니다.' });
      else
        res.status(500).json({ error: '추천 시스템에서 오류가 발생했습니다.' });
    }
  },
);

/**
 * @swagger
 * /openai/grade:
 *   post:
 *     summary: 코드 채점
 *     description: 제공된 문제 제목, 언어, 코드로 문제의 정확성을 채점합니다.
 *     tags: [OpenAI]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: object
 *                 properties:
 *                   problemTitle:
 *                     type: string
 *                     description: 채점할 문제의 제목
 *                     example: 'A+B 문제'
 *                   userLanguage:
 *                     type: string
 *                     description: 사용자가 작성한 코드의 언어
 *                     example: 'python'
 *                   userCode:
 *                     type: string
 *                     description: 사용자가 제출한 코드
 *                     example: 'print(sum(map(int, input().split())))'
 *     responses:
 *       200:
 *         description: 코드 채점 결과
 *         content:
 *           application/json:
 *             schema:
 *               type: boolean
 *               example: true
 *       500:
 *         description: 채점 중 오류 발생
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: '채점 중 오류가 발생했습니다.'
 */
router.post(
  '/grade',
  async (
    req: Request<
      Record<string, never>,
      Record<string, never>,
      CodeGradingRequest
    >,
    res: Response,
  ): Promise<void> => {
    const { problemTitle, userLanguage, userCode } = req.body;
    console.log(problemTitle, userLanguage, userCode);

    try {
      if (!problemTitle || !userLanguage || !userCode) {
        res.status(400).json({ error: '모든 필드를 입력해주세요.' });
        return;
      }
      const sanitizedTitle = problemTitle.replace(/["\\]/g, '\\$&');
      const sanitizedCode = userCode.replace(/["\\]/g, '\\$&');
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content:
              'You are a grading assistant. Respond only with true or false based on the correctness of the code.',
          },
          {
            role: 'user',
            content: `코드를 검증해주세요. 문제: "${sanitizedTitle}", 언어: "${userLanguage}", 코드: "${sanitizedCode}". 올바른 경우 "true", 그렇지 않은 경우 "false"만 반환하세요.`,
          },
        ],
        max_tokens: 5,
      });

      const answer = response.choices?.[0]?.message?.content
        ?.trim()
        .toLowerCase();

      if (!answer) {
        console.error('⚠️ OpenAI 응답이 비어 있습니다:', response);
        res.status(500).json({ error: 'AI 응답이 올바르지 않습니다.' });
        return;
      }

      const result = answer.startsWith('true');
      res.json({ isCorrect: result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: '채점 중 오류가 발생했습니다.' });
    }
  },
);

const problemCache = new NodeCache({ stdTTL: 3600 });
export const fetchRandomProblem = async (): Promise<RandomProblem> => {
  const CACHE_KEY = 'random_problems';
  const cachedProblems = problemCache.get<RandomProblem[]>(CACHE_KEY) || [];
  if (cachedProblems.length > 0) {
    const randomIndex = Math.floor(Math.random() * cachedProblems.length);
    return cachedProblems[randomIndex];
  }
  try {
    const problem = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content:
            '백준사이트에서 사람들이 많이 푼 문제 1개를 번호와 제목만 예시와 같은 형식으로 제공해 주세요. 예: 번호 제목',
        },
      ],
      max_tokens: 10,
    });

    const problemData = problem.choices?.[0]?.message.content;
    if (!problemData) throw new Error('OpenAI API 응답이 비어있습니다.');

    const parts = problemData.split(/\s+/);
    if (parts.length < 2) throw new Error('응답 형식이 올바르지 않습니다.');

    const problemNumber = parseInt(parts[0], 10);
    const problemTitle = parts.slice(1).join(' ');

    const result = { problemNumber, problemTitle };

    const existingProblems = (problemCache.get<RandomProblem[]>(CACHE_KEY) ||
      []) as RandomProblem[];
    problemCache.set(CACHE_KEY, [...existingProblems, result]);

    return result;
  } catch (error) {
    console.error('문제 가져오기 중 오류 발생:', error);
    throw error;
  }
};

router.get('/get-random-problem', async (req: Request, res: Response) => {
  try {
    const problem = await fetchRandomProblem();
    res.json(problem);
  } catch (error) {
    res.status(500).json({ error: '문제 가져오기 중 오류가 발생했습니다.' });
  }
});

export default router;
