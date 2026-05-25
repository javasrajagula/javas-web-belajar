const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding started...');
  
  // Read JSON files
  const smaData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/content/curriculum/sma.json'), 'utf-8'));
  const smkData = JSON.parse(fs.readFileSync(path.join(__dirname, '../src/content/curriculum/smk.json'), 'utf-8'));

  // Combine both data
  const subjects = [...smaData, ...smkData];

  for (const subject of subjects) {
    console.log(`Seeding subject: ${subject.title} (${subject.id})`);
    
    // Upsert Subject
    await prisma.subject.upsert({
      where: { id: subject.id },
      update: {
        title: subject.title,
        phase: subject.phase,
        schoolType: subject.schoolType,
        grade: subject.grade,
        cpStatement: subject.cpStatement,
        isDigitalSkill: subject.isDigitalSkill || false,
      },
      create: {
        id: subject.id,
        title: subject.title,
        phase: subject.phase,
        schoolType: subject.schoolType,
        grade: subject.grade,
        cpStatement: subject.cpStatement,
        isDigitalSkill: subject.isDigitalSkill || false,
      }
    });

    // Seed Modules
    for (const mod of subject.modules) {
      const dbMod = await prisma.module.upsert({
        where: { id: mod.id },
        update: {
          title: mod.title,
          subjectId: subject.id,
        },
        create: {
          id: mod.id,
          title: mod.title,
          subjectId: subject.id,
        }
      });

      // Seed Lessons
      for (const lesson of mod.lessons) {
        const dbLesson = await prisma.lesson.upsert({
          where: { id: lesson.id },
          update: {
            title: lesson.title,
            explanation: lesson.explanation,
            visualExample: lesson.visualExample,
            summary: lesson.summary,
            hotsQuestions: lesson.hotsQuestions,
            practiceBank: lesson.practiceBank,
            podcastScript: lesson.podcastScript || null,
            moduleId: dbMod.id,
          },
          create: {
            id: lesson.id,
            title: lesson.title,
            explanation: lesson.explanation,
            visualExample: lesson.visualExample,
            summary: lesson.summary,
            hotsQuestions: lesson.hotsQuestions,
            practiceBank: lesson.practiceBank,
            podcastScript: lesson.podcastScript || null,
            moduleId: dbMod.id,
          }
        });

        // Seed Quizzes for the lesson
        if (lesson.quizzes && lesson.quizzes.length > 0) {
          // Delete old quizzes for this lesson first to avoid duplicates
          await prisma.quiz.deleteMany({
            where: { lessonId: dbLesson.id }
          });
          
          for (const quiz of lesson.quizzes) {
            await prisma.quiz.create({
              data: {
                id: quiz.id,
                lessonId: dbLesson.id,
                question: quiz.question,
                options: quiz.options,
                correctOptionIndex: quiz.correctOptionIndex,
                explanation: quiz.explanation
              }
            });
          }
        }

        // Seed Flashcards for the lesson
        if (lesson.flashcards && lesson.flashcards.length > 0) {
          // Delete old flashcards first
          await prisma.flashcard.deleteMany({
            where: { lessonId: dbLesson.id }
          });

          for (const fc of lesson.flashcards) {
            await prisma.flashcard.create({
              data: {
                id: fc.id,
                lessonId: dbLesson.id,
                front: fc.front,
                back: fc.back
              }
            });
          }
        }
      }
    }
  }

  console.log('Seeding default users...');
  
  // Student User
  await prisma.user.upsert({
    where: { email: 'alex@academy.os' },
    update: {},
    create: {
      name: 'Alex Mercer',
      email: 'alex@academy.os',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      role: 'student',
      schoolType: 'sma',
      grade: 10,
      selectedPathway: 'Umum',
      goals: ['Kuasai kalkulus sebelum semester baru', 'Menyelesaikan 3 kuis berturut-turut', 'Konsisten Pomodoro harian'],
      streak: 5,
      xp: 1250,
      level: 4,
      studyTimeToday: 35,
      dailyGoalMinutes: 45,
      dailyGoalXp: 200,
      weeklyProgress: [
        { day: 'Sen', minutes: 40, xp: 180 },
        { day: 'Sel', minutes: 50, xp: 220 },
        { day: 'Rab', minutes: 30, xp: 140 },
        { day: 'Kam', minutes: 60, xp: 250 },
        { day: 'Jum', minutes: 35, xp: 160 },
        { day: 'Sab', minutes: 0, xp: 0 },
        { day: 'Min', minutes: 0, xp: 0 }
      ],
      weakTopics: [
        { topic: 'Persamaan Eksponen', mastery: 42 },
        { topic: 'Pilar Enkapsulasi', mastery: 58 },
        { topic: 'Routing Statis', mastery: 65 }
      ],
      skills: {
        focus: 64,
        logic: 72,
        creativity: 55,
        discipline: 80
      },
      dailyQuests: [
        { id: 'q1', title: 'Belajar 45 Menit Hari Ini', xpReward: 100, completed: false, target: 45, current: 35, type: 'study' },
        { id: 'q2', title: 'Selesaikan Satu Kuis AI', xpReward: 50, completed: false, target: 1, current: 0, type: 'quiz' },
        { id: 'q3', title: 'Bertanya Pada Tutor AI', xpReward: 50, completed: false, target: 3, current: 1, type: 'chat' }
      ]
    }
  });

  // Teacher User
  await prisma.user.upsert({
    where: { email: 'budi@academy.os' },
    update: {},
    create: {
      name: 'Pak Budi',
      email: 'budi@academy.os',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      role: 'teacher',
      schoolType: 'smk',
      grade: 11,
      selectedPathway: 'RPL',
      xp: 5000,
      level: 10,
      streak: 10,
      dailyGoalMinutes: 60,
      dailyGoalXp: 500,
      goals: ['Evaluasi proyek portofolio kelas XI RPL', 'Siapkan materi database dan SQL'],
      studyTimeToday: 0
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
