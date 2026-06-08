import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

// Direct connection via better-sqlite3 adapter for script execution
const adapter = new PrismaBetterSqlite3({ url: 'dev.db' });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clear existing database entries
  await prisma.auditLog.deleteMany({});
  await prisma.learningResource.deleteMany({});
  await prisma.userAssessment.deleteMany({});
  await prisma.assessment.deleteMany({});
  await prisma.projectTemplate.deleteMany({});
  await prisma.roleSkill.deleteMany({});
  await prisma.userSkill.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.skillCategory.deleteMany({});
  await prisma.careerRole.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🗑️ Database cleared.');

  // 2. Seed Skill Categories
  const catLanguages = await prisma.skillCategory.create({ data: { name: 'Languages & Core' } });
  const catFrontend = await prisma.skillCategory.create({ data: { name: 'Frontend Development' } });
  const catBackend = await prisma.skillCategory.create({ data: { name: 'Backend Development' } });
  const catDataML = await prisma.skillCategory.create({ data: { name: 'Data & Machine Learning' } });
  const catSecurityOps = await prisma.skillCategory.create({ data: { name: 'Security & Operations' } });

  console.log('📁 Skill Categories seeded.');

  // 3. Seed Skills
  const skillsData = [
    // Languages & Core
    { name: 'JavaScript', slug: 'javascript', categoryId: catLanguages.id, description: 'Core web scripting language.' },
    { name: 'TypeScript', slug: 'typescript', categoryId: catLanguages.id, description: 'Typed superset of JavaScript.' },
    { name: 'HTML & CSS', slug: 'html-css', categoryId: catLanguages.id, description: 'Document markup and styling standards.' },
    { name: 'Python', slug: 'python', categoryId: catLanguages.id, description: 'Versatile scripting and machine learning language.' },
    { name: 'SQL', slug: 'sql', categoryId: catLanguages.id, description: 'Structured query language for relational databases.' },
    { name: 'DSA', slug: 'dsa', categoryId: catLanguages.id, description: 'Data Structures and Algorithms essentials.' },

    // Frontend
    { name: 'React', slug: 'react', categoryId: catFrontend.id, description: 'Popular component UI library.' },
    { name: 'Next.js', slug: 'nextjs', categoryId: catFrontend.id, description: 'Full-stack React framework.' },
    { name: 'Tailwind CSS', slug: 'tailwind-css', categoryId: catFrontend.id, description: 'Utility-first styling system.' },
    { name: 'React Router', slug: 'react-router', categoryId: catFrontend.id, description: 'Standard routing library for SPA React.' },

    // Backend
    { name: 'Node.js', slug: 'nodejs', categoryId: catBackend.id, description: 'Asynchronous event-driven server runtime.' },
    { name: 'Express.js', slug: 'expressjs', categoryId: catBackend.id, description: 'Minimalist web framework for Node.' },
    { name: 'NestJS', slug: 'nestjs', categoryId: catBackend.id, description: 'Modular architectural framework for Node.' },
    { name: 'Prisma ORM', slug: 'prisma', categoryId: catBackend.id, description: 'Typesafe database mapper.' },
    { name: 'MongoDB', slug: 'mongodb', categoryId: catBackend.id, description: 'Document-oriented database.' },
    { name: 'PostgreSQL', slug: 'postgresql', categoryId: catBackend.id, description: 'Relational database engine.' },

    // Data & ML
    { name: 'Machine Learning', slug: 'machine-learning', categoryId: catDataML.id, description: 'Core algorithms and model development.' },
    { name: 'Pandas & NumPy', slug: 'pandas-numpy', categoryId: catDataML.id, description: 'Python data science tools.' },

    // Security & Ops
    { name: 'Git & GitHub', slug: 'git', categoryId: catSecurityOps.id, description: 'Version control and collaboration.' },
    { name: 'Docker', slug: 'docker', categoryId: catSecurityOps.id, description: 'Containerization standard.' },
  ];

  const skillsMap: Record<string, string> = {};
  for (const item of skillsData) {
    const created = await prisma.skill.create({ data: item });
    skillsMap[item.slug] = created.id;
  }

  console.log('🛡️ Skills seeded.');

  // 4. Seed Career Roles
  const roleFrontend = await prisma.careerRole.create({
    data: {
      name: 'Frontend Developer',
      slug: 'frontend-developer',
      description: 'Creates user interfaces and client-side applications.',
      salaryRange: '$70,000 - $130,000',
      demandScore: 8,
    },
  });

  const roleBackend = await prisma.careerRole.create({
    data: {
      name: 'Backend Developer',
      slug: 'backend-developer',
      description: 'Designs and maintains backend logic, APIs, and databases.',
      salaryRange: '$80,000 - $145,000',
      demandScore: 9,
    },
  });

  const roleMern = await prisma.careerRole.create({
    data: {
      name: 'MERN Developer',
      slug: 'mern-developer',
      description: 'Builds full-stack applications using MongoDB, Express, React, and Node.js.',
      salaryRange: '$75,000 - $135,000',
      demandScore: 9,
    },
  });

  const roleAI = await prisma.careerRole.create({
    data: {
      name: 'AI Engineer',
      slug: 'ai-engineer',
      description: 'Builds and deploys machine learning models and large language model systems.',
      salaryRange: '$110,000 - $190,000',
      demandScore: 10,
    },
  });

  console.log('💼 Career Roles seeded.');

  // 5. Seed Role Skills mapping (weights/importance)
  // Frontend mappings
  const frontendSkills = [
    { slug: 'html-css', importance: 9 },
    { slug: 'javascript', importance: 9 },
    { slug: 'typescript', importance: 8 },
    { slug: 'react', importance: 10 },
    { slug: 'tailwind-css', importance: 8 },
    { slug: 'react-router', importance: 8 },
    { slug: 'git', importance: 7 },
  ];
  for (const mapping of frontendSkills) {
    await prisma.roleSkill.create({
      data: {
        roleId: roleFrontend.id,
        skillId: skillsMap[mapping.slug],
        importance: mapping.importance,
      },
    });
  }

  // Backend mappings
  const backendSkills = [
    { slug: 'javascript', importance: 8 },
    { slug: 'typescript', importance: 8 },
    { slug: 'nodejs', importance: 9 },
    { slug: 'expressjs', importance: 8 },
    { slug: 'sql', importance: 8 },
    { slug: 'postgresql', importance: 9 },
    { slug: 'prisma', importance: 8 },
    { slug: 'dsa', importance: 8 },
    { slug: 'git', importance: 7 },
  ];
  for (const mapping of backendSkills) {
    await prisma.roleSkill.create({
      data: {
        roleId: roleBackend.id,
        skillId: skillsMap[mapping.slug],
        importance: mapping.importance,
      },
    });
  }

  // MERN mappings
  const mernSkills = [
    { slug: 'html-css', importance: 8 },
    { slug: 'javascript', importance: 9 },
    { slug: 'react', importance: 9 },
    { slug: 'nodejs', importance: 9 },
    { slug: 'expressjs', importance: 8 },
    { slug: 'mongodb', importance: 9 },
    { slug: 'git', importance: 7 },
  ];
  for (const mapping of mernSkills) {
    await prisma.roleSkill.create({
      data: {
        roleId: roleMern.id,
        skillId: skillsMap[mapping.slug],
        importance: mapping.importance,
      },
    });
  }

  console.log('🔗 Role Skill weights maps seeded.');

  // 6. Seed Project Templates
  await prisma.projectTemplate.create({
    data: {
      roleId: roleFrontend.id,
      title: 'E-Commerce Dashboard',
      difficulty: 'Intermediate',
      description: 'Build an interactive dashboard displaying mock sales charts using Tailwind CSS, Recharts, and React Router.'
    }
  });

  await prisma.projectTemplate.create({
    data: {
      roleId: roleBackend.id,
      title: 'RESTful API Task Planner',
      difficulty: 'Intermediate',
      description: 'Create a secured REST API in NestJS featuring database relational models, JWT security guards, and automated tests.'
    }
  });

  await prisma.projectTemplate.create({
    data: {
      roleId: roleMern.id,
      title: 'Real-time collaborative Chat App',
      difficulty: 'Advanced',
      description: 'Develop a full-stack real-time chat application utilizing Socket.io for messaging, Express/Node, React, and MongoDB.'
    }
  });

  console.log('📁 Project Templates seeded.');

  // 7. Seed Assessments (Quick Quizzes)
  await prisma.assessment.create({
    data: {
      skillId: skillsMap['react'],
      title: 'React Core Concept Assessment',
      difficulty: 'Beginner',
      questions: JSON.stringify([
        {
          id: 'q1',
          text: 'What hook is used to perform side effects in functional components?',
          options: ['useState', 'useEffect', 'useContext', 'useReducer'],
          answer: 'useEffect'
        },
        {
          id: 'q2',
          text: 'What standard mechanism is used to pass data down the component tree?',
          options: ['Props', 'State', 'Context', 'Hooks'],
          answer: 'Props'
        },
        {
          id: 'q3',
          text: 'Which hook should you use to share values without passing props explicitly through every level?',
          options: ['useRef', 'useContext', 'useMemo', 'useState'],
          answer: 'useContext'
        },
        {
          id: 'q4',
          text: 'What happens when state changes inside a React component?',
          options: ['The component destroys itself', 'The component re-renders', 'The page refreshes', 'Nothing changes'],
          answer: 'The component re-renders'
        },
        {
          id: 'q5',
          text: 'Which React method or pattern prevents unnecessary re-rendering of functional components?',
          options: ['React.memo', 'shouldComponentUpdate', 'useCallback', 'useRef'],
          answer: 'React.memo'
        }
      ])
    }
  });

  await prisma.assessment.create({
    data: {
      skillId: skillsMap['nodejs'],
      title: 'Node.js Engine Essentials',
      difficulty: 'Beginner',
      questions: JSON.stringify([
        {
          id: 'q1',
          text: 'Which thread handles asynchronous event-driven JavaScript executions in Node.js?',
          options: ['Multi-thread cluster', 'Main Event Loop thread', 'Worker threads pool', 'Prisma client pool'],
          answer: 'Main Event Loop thread'
        },
        {
          id: 'q2',
          text: 'What package manager is shipped by default with Node.js?',
          options: ['yarn', 'pnpm', 'npm', 'bun'],
          answer: 'npm'
        },
        {
          id: 'q3',
          text: 'Which core Node.js module provides filesystem operations?',
          options: ['path', 'fs', 'http', 'os'],
          answer: 'fs'
        },
        {
          id: 'q4',
          text: 'How do you handle asynchronous operations in modern Node.js code?',
          options: ['Callbacks only', 'Sync waits', 'Promises and Async/Await', 'Event listeners only'],
          answer: 'Promises and Async/Await'
        },
        {
          id: 'q5',
          text: 'Which module type is imported using "require()" in Node.js?',
          options: ['ES Modules', 'CommonJS Modules', 'AMD Modules', 'UMD Modules'],
          answer: 'CommonJS Modules'
        }
      ])
    }
  });

  console.log('📝 Assessment Quizzes seeded.');

  // 8. Seed Learning Resources
  await prisma.learningResource.create({
    data: {
      skillId: skillsMap['react'],
      title: 'React Official Documentation Tutorial',
      url: 'https://react.dev/learn',
      type: 'DOCUMENTATION',
      difficulty: 'Beginner'
    }
  });

  await prisma.learningResource.create({
    data: {
      skillId: skillsMap['react'],
      title: 'React Hooks Explained simply',
      url: 'https://www.youtube.com/watch?v=TNhaISOUy6Q',
      type: 'VIDEO',
      difficulty: 'Beginner'
    }
  });

  await prisma.learningResource.create({
    data: {
      skillId: skillsMap['nodejs'],
      title: 'Node.js Complete Guide for Beginners',
      url: 'https://nodejs.org/en/learn/getting-started/introduction-to-nodejs',
      type: 'DOCUMENTATION',
      difficulty: 'Beginner'
    }
  });

  await prisma.learningResource.create({
    data: {
      skillId: skillsMap['typescript'],
      title: 'TypeScript Deep Dive Handbook',
      url: 'https://basarat.gitbook.io/typescript',
      type: 'ARTICLE',
      difficulty: 'Intermediate'
    }
  });

  console.log('📚 Learning Resources seeded.');

  // 9. Seed default test accounts
  const bcrypt = require('bcryptjs');
  const adminPasswordHash = await bcrypt.hash('AdminPass123!', 10);
  const userPasswordHash = await bcrypt.hash('UserPass123!', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@careerpilot.ai',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      profile: {
        create: {
          name: 'System Admin',
        }
      }
    }
  });

  const normalUser = await prisma.user.create({
    data: {
      email: 'user@careerpilot.ai',
      passwordHash: userPasswordHash,
      role: 'USER',
      profile: {
        create: {
          name: 'Pilot User',
        }
      }
    }
  });

  console.log('👥 Default test accounts seeded:');
  console.log('   Admin: admin@careerpilot.ai / AdminPass123!');
  console.log('   User:  user@careerpilot.ai / UserPass123!');

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
