import { Router, Request, Response } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
import { checkNickNameDuplicate } from '../utils/validation';
import { calculateConsecutiveAttendance } from '../utils/attendance';
import { sendEmail } from '../utils/email';
import { attendanceRepository, userRepository } from '../repository/repository';
import { ILike, In, Not } from 'typeorm';
import bcrypt from 'bcryptjs';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: User
 *   description: 유저 정보 수정 및 조회 관련 API
 */

/**
 * @swagger
 * /users/search?type=${email || nickName}&value=${email || nickName}&userEmail=${userEmail}:
 *   get:
 *     summary: 사용자 검색
 *     description: 닉네임 또는 이메일을 사용하여 사용자를 검색합니다.
 *     tags: [User]
 *     parameters:
 *       - name: type
 *         in: query
 *         required: true
 *         description: 검색할 유형 (nickName 또는 email)
 *         schema:
 *           type: string
 *           enum: [nickName, email]
 *       - name: value
 *         in: query
 *         required: true
 *         description: 검색할 값
 *         schema:
 *           type: string
 *       - name: userEmail
 *         in: query
 *         required: true
 *         description: 현재 사용자의 이메일
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 사용자 검색 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   nickName:
 *                     type: string
 *                   level:
 *                     type: integer
 *                   isRival:
 *                     type: boolean
 *                     items:
 *                       type: string
 *       400:
 *         description: 검색할 유형과 값이 입력되지 않았습니다.
 *       404:
 *         description: 일치하는 사용자가 없습니다.
 *       500:
 *         description: 서버 오류
 */

router.get(
  '/search',
  authMiddleware,
  async (
    req: Request<
      Record<string, never>,
      Record<string, never>,
      Record<string, never>,
      { type: string; value: string }
    >,
    res: Response,
  ): Promise<void> => {
    const { type, value } = req.query;
    const userEmail = req.user?.email;
    if (!type || !value) {
      res.status(400).json({ message: '검색할 유형과 값을 입력해주세요.' });
      return;
    }

    if (!userEmail) {
      res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
      return;
    }

    try {
      const currentUser = await userRepository.findOne({
        where: { email: userEmail },
        relations: ['rivals'],
      });

      if (!currentUser) {
        res.status(404).json({ message: '현재 유저를 찾을 수 없습니다.' });
        return;
      }

      const searchCondition =
        type === 'nickName'
          ? { nickName: ILike(`%${value}%`), userId: Not(currentUser.userId) }
          : { email: ILike(`%${value}%`), userId: Not(currentUser.userId) };

      const users = await userRepository.find({
        where: searchCondition,
        relations: ['level'],
        select: ['userId', 'nickName'],
      });

      if (users.length === 0) {
        res.status(404).json({ message: '일치하는 사용자가 없습니다.' });
        return;
      }

      const result = users.map((user) => ({
        nickName: user.nickName,
        level: user.level || null,
        isRival: currentUser.rivals.some(
          (rival) => rival.rivalId === user.userId,
        ),
      }));

      res.json(result);
    } catch (error) {
      console.error('검색 오류:', error);
      res.status(500).json({
        message: '서버 오류가 발생했습니다. 나중에 다시 시도해주세요.',
      });
    }
  },
);

/**
 * @swagger
 * /users/update-nickName:
 *   put:
 *     summary: 닉네임 변경
 *     description: 사용자 닉네임을 변경합니다.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newNickName:
 *                 type: string
 *                 description: 새 닉네임
 *                 example: 'new_nickname'
 *     responses:
 *       200:
 *         description: 닉네임 변경 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "닉네임이 성공적으로 변경되었습니다."
 *       400:
 *         description: 이미 사용 중인 닉네임입니다.
 *       500:
 *         description: 서버 에러
 */
router.put(
  '/update-nickName',
  authMiddleware,
  async (
    req: Request<
      Record<string, never>,
      Record<string, never>,
      { newNickName: string }
    >,
    res: Response,
  ): Promise<void> => {
    const { newNickName } = req.body;

    try {
      const isNickNameDuplicate = await checkNickNameDuplicate(newNickName);
      if (isNickNameDuplicate) {
        res.status(400).json({ message: '이미 사용 중인 닉네임입니다.' });
        return;
      }

      const userId = req.user?.userId ? parseInt(req.user.userId, 10) : null;
      if (!userId) {
        res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
        return;
      }
      const user = await userRepository.findOne({
        where: { userId },
      });

      if (!user) {
        res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        return;
      }

      user.nickName = newNickName;
      await userRepository.save(user);

      res.status(200).json({ message: '닉네임이 성공적으로 변경되었습니다.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '서버 에러' });
    }
  },
);

/**
 * @swagger
 * /users/update-password:
 *   put:
 *     summary: 비밀번호 변경
 *     description: 사용자 비밀번호를 변경합니다.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newPassword:
 *                 type: string
 *                 description: 새 비밀번호
 *                 example: 'newPassword456!'
 *               confirmPassword:
 *                 type: string
 *                 description: 새 비밀번호 검증
 *                 example: 'newPassword456!'
 *     responses:
 *       200:
 *         description: 비밀번호 변경 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "비밀번호가 성공적으로 변경되었습니다."
 *       400:
 *         description: 새 비밀번호와 재설정한 비밀번호가 일치하지 않습니다.
 *       500:
 *         description: 서버 에러
 */
router.put(
  '/update-password',
  authMiddleware,
  async (
    req: Request<
      Record<string, never>,
      Record<string, never>,
      { newPassword: string; confirmPassword: string }
    >,
    res: Response,
  ): Promise<void> => {
    const { newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      res.status(400).json({
        message: '새 비밀번호와 재설정한 비밀번호가 일치하지 않습니다.',
      });
      return;
    }

    try {
      const userId = req.user?.userId ? parseInt(req.user.userId, 10) : null;
      if (!userId) {
        res.status(401).json({ message: '인증되지 않은 사용자입니다.' });
        return;
      }
      const user = await userRepository.findOne({ where: { userId } });
      if (!user) {
        res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
        return;
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await userRepository.save(user);

      res
        .status(200)
        .json({ message: '비밀번호가 성공적으로 변경되었습니다.' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: '서버 에러' });
    }
  },
);

/**
 * @swagger
 * /users/attend:
 *   post:
 *     summary: 출석 기록 추가
 *     description: 사용자의 출석 날짜를 기록합니다.
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userEmail:
 *                 type: string
 *                 description: 사용자 이메일
 *                 example: 'user@example.com'
 *               attendanceDate:
 *                 type: string
 *                 format: date
 *                 description: 출석 날짜
 *                 example: '2024-09-30'
 *     responses:
 *       200:
 *         description: 출석 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "출석 성공!"
 *       404:
 *         description: 해당 유저를 찾을 수 없습니다.
 *       500:
 *         description: 서버 에러
 */

router.post(
  '/attend',
  authMiddleware,
  async (
    req: Request<
      Record<string, never>,
      Record<string, never>,
      { userEmail: string; attendanceDate: Date }
    >,
    res: Response,
  ): Promise<void> => {
    const { userEmail, attendanceDate } = req.body;
    try {
      if (req.user?.email !== userEmail) {
        res
          .status(403)
          .json({ message: '자신의 계정에 대해서만 출석 기록이 가능합니다.' });
        return;
      }
      const user = await userRepository.findOne({
        where: {
          email: userEmail,
        },
        relations: ['rivals', 'attendances'],
      });

      if (!user) {
        res.status(404).json({ message: '해당 유저를 찾을 수 없습니다.' });
        return;
      }

      const today = new Date(attendanceDate).toISOString().split('T')[0];
      const hasAlreadyAttended = user.attendances.some(
        (attendance) =>
          attendance.attendanceDates.toISOString().split('T')[0] === today,
      );

      if (!hasAlreadyAttended) {
        const newAttendance = attendanceRepository.create({
          attendanceDates: attendanceDate,
          user,
        });
        await attendanceRepository.save(newAttendance);
      }

      const rivals = user.rivals ?? [];

      if (rivals.length === 0) console.log('라이벌이 없습니다.');
      else {
        const rivalIds = rivals.map((rival) => rival.rivalId);
        const rivalUsers = await userRepository.find({
          where: { userId: In(rivalIds) },
          relations: ['attendances'],
        });
        await Promise.all(
          rivalUsers.map(async (rivalUser) => {
            const rivalHasAttended = rivalUser.attendances.some(
              (attendance) =>
                attendance.attendanceDates.toISOString().split('T')[0] ===
                today,
            );

            if (!rivalHasAttended) {
              return sendEmail(
                rivalUser.email,
                '오늘 문제 풀기 알림',
                `
             안녕하세요 ${rivalUser.nickName}님,
             ${user.nickName}님이 오늘 문제를 풀었습니다. 당신도 오늘 문제를 풀어보세요!
           `,
              );
            }

            return Promise.resolve();
          }),
        );
      }

      res.status(200).json({ message: '출석 성공!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: '서버 에러' });
    }
  },
);

/**
 * @swagger
 * /users/attend/${userEmail}:
 *   get:
 *     summary: 출석 일수 조회
 *     description: 사용자의 출석 일수를 조회합니다.
 *     tags: [User]
 *     parameters:
 *       - name: userEmail
 *         in: path
 *         required: true
 *         description: 사용자 이메일
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 출석 일수 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 consecutiveDays:
 *                   type: integer
 *       404:
 *         description: 해당 유저를 찾을 수 없습니다.
 *       500:
 *         description: 서버 에러
 */
router.get(
  '/attend/:userEmail',
  authMiddleware,
  async (req: Request<{ userEmail: string }>, res: Response): Promise<void> => {
    const { userEmail } = req.params;
    if (req.user?.email !== userEmail) {
      res
        .status(403)
        .json({ message: '자신의 계정에 대한 정보만 조회할 수 있습니다.' });
      return;
    }

    try {
      const user = await userRepository.findOne({
        where: {
          email: userEmail,
        },
        relations: ['attendances'],
      });

      if (!user) {
        res.status(404).json({ message: '해당 유저를 찾을 수 없습니다.' });
        return;
      }

      const consecutiveDays: number = calculateConsecutiveAttendance(
        user.attendances.map((attendance) => attendance.attendanceDates),
      );
      res.status(200).json({ consecutiveDays });
    } catch (error) {
      console.error('Error fetching user attendance:', error);
      res.status(500).json({ message: '서버 에러' });
    }
  },
);

/**
 * @swagger
 * /users/level/{userEmail}:
 *   get:
 *     summary: 사용자 레벨 조회
 *     description: 사용자의 현재 레벨을 반환합니다.
 *     tags: [User]
 *     parameters:
 *       - name: userEmail
 *         in: path
 *         required: true
 *         description: 사용자 이메일
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 사용자 레벨 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 level:
 *                   type: integer
 *       404:
 *         description: 사용자를 찾을 수 없습니다.
 *       500:
 *         description: 서버 오류
 */
router.get(
  '/level/:userEmail',
  authMiddleware,
  async (req: Request<{ userEmail: string }>, res: Response): Promise<void> => {
    const { userEmail } = req.params;
    console.log(userEmail);
    if (req.user?.email !== userEmail) {
      res
        .status(403)
        .json({ message: '자신의 계정 정보만 조회할 수 있습니다.' });
      return;
    }

    try {
      const user = await userRepository.findOne({
        where: { email: userEmail },
        relations: ['level'],
      });

      if (!user || !user.level) {
        res
          .status(404)
          .json({ message: '사용자 또는 레벨 정보를 찾을 수 없습니다.' });
        return;
      }

      res.status(200).json({ level: user.level.level });
    } catch (error) {
      console.error('레벨 조회 실패:', error);
      res.status(500).json({ message: '서버 오류' });
    }
  },
);

export default router;
