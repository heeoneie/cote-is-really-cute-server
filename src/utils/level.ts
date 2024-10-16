import {Repository} from "typeorm";
import {Level} from "../entity/Level";
import {AppDataSource} from "../config/db";
import {User} from "../entity/User";

const levelRepository: Repository<Level> = AppDataSource.getRepository(Level);
const userRepository: Repository<User> = AppDataSource.getRepository(User);

export const createInitialLevels = async (): Promise<void> => {
    const levels = [
        { level: 1, requiredExperience: 200 },
        { level: 2, requiredExperience: 400 },
        { level: 3, requiredExperience: 600 },
        { level: 4, requiredExperience: 800 },
        { level: 5, requiredExperience: 1000 },
        { level: 6, requiredExperience: 1200 },
        { level: 7, requiredExperience: 1400 },
        { level: 8, requiredExperience: 1600 },
        { level: 9, requiredExperience: 1800 },
        { level: 10, requiredExperience: 2000 },
    ];

    for (const levelData of levels) {
        const existingLevel = await levelRepository.findOneBy({ level: levelData.level });
        if (!existingLevel) {
            const newLevel = levelRepository.create(levelData);
            await levelRepository.save(newLevel);
            console.log(`레벨 ${levelData.level} 저장 완료`);
        }
    }
};

export const checkLevelUp = async (user: User): Promise<void> => {
    const levels = await levelRepository.find({ order: { level: "ASC" } });
    let currentLevelIndex = levels.findIndex(level => level.id === user.levelId);

    while (currentLevelIndex < levels.length && user.experience >= levels[currentLevelIndex]?.requiredExperience) {
        user.levelId = levels[currentLevelIndex + 1]?.id || user.levelId;
        currentLevelIndex++;
    }
    await userRepository.save(user);
};
