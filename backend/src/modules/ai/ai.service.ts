import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { GoogleGenAI } from '@google/genai';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private ai: any;
  private isGeminiConfigured = false;

  constructor(private prisma: PrismaService) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        this.ai = new GoogleGenAI({ apiKey });
        this.isGeminiConfigured = true;
        this.logger.log('✨ Gemini AI engine successfully initialized.');
      } catch (err) {
        this.logger.error('❌ Failed to initialize Gemini API Client, using fallback engine.', err);
      }
    } else {
      this.logger.log('⚠️ GEMINI_API_KEY not found in environment. Using Fallback Mock AI Engine.');
    }
  }

  async parseResume(rawText: string): Promise<any> {
    if (this.isGeminiConfigured) {
      try {
        const response = await this.ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: `Parse the following resume raw text and extract:
1. List of technical skills (e.g. React, Node.js, Python, CSS) matching actual industry terms.
2. List of projects with their title and technology stack list.
3. List of jobs/internships with title, company, and description.
Resume Raw Text:
${rawText}`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                skills: {
                  type: 'ARRAY',
                  items: { type: 'STRING' }
                },
                projects: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      title: { type: 'STRING' },
                      techStack: { type: 'ARRAY', items: { type: 'STRING' } }
                    },
                    required: ['title']
                  }
                },
                jobs: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      title: { type: 'STRING' },
                      company: { type: 'STRING' },
                      description: { type: 'STRING' }
                    },
                    required: ['title']
                  }
                }
              },
              required: ['skills', 'projects', 'jobs']
            }
          }
        });
        return JSON.parse(response.text);
      } catch (error) {
        this.logger.error('Gemini Resume Parse failed, running fallback...', error);
        return this.fallbackParseResume(rawText);
      }
    } else {
      return this.fallbackParseResume(rawText);
    }
  }

  async generateRoadmap(roleName: string, missingSkills: string[], quizScore: number): Promise<any> {
    if (this.isGeminiConfigured) {
      try {
        const response = await this.ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: `Create a structured learning roadmap (30-90 days) to become a "${roleName}" targeting these missing skills: ${missingSkills.join(', ')}. The student recently scored ${quizScore}% in the initial quick quiz. Output exactly 3 phases with ordering, descriptions, and 2 concrete daily tasks for each phase.`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                title: { type: 'STRING' },
                steps: {
                  type: 'ARRAY',
                  items: {
                    type: 'OBJECT',
                    properties: {
                      phase: { type: 'INTEGER' },
                      title: { type: 'STRING' },
                      description: { type: 'STRING' },
                      order: { type: 'INTEGER' },
                      tasks: {
                        type: 'ARRAY',
                        items: {
                          type: 'OBJECT',
                          properties: {
                            title: { type: 'STRING' },
                            description: { type: 'STRING' }
                          },
                          required: ['title', 'description']
                        }
                      }
                    },
                    required: ['phase', 'title', 'description', 'order', 'tasks']
                  }
                }
              },
              required: ['title', 'steps']
            }
          }
        });
        return JSON.parse(response.text);
      } catch (error) {
        this.logger.error('Gemini Roadmap Generation failed, running fallback...', error);
        return this.fallbackGenerateRoadmap(roleName, missingSkills);
      }
    } else {
      return this.fallbackGenerateRoadmap(roleName, missingSkills);
    }
  }

  async generateResumeAnalysis(targetRoleName: string, parsedSkills: string[], allSkills: string[]): Promise<any> {
    if (this.isGeminiConfigured) {
      try {
        const response = await this.ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: `Analyze this parsed resume for a target role of "${targetRoleName}".
Parsed Skills: ${parsedSkills.join(', ')}
All Available Skills: ${allSkills.join(', ')}

Analyze the resume quality. Output a JSON object containing:
1. score: an integer between 0 and 100 representing resume quality.
2. strengths: array of strings.
3. weaknesses: array of strings.
4. suggestions: array of strings of improvements.`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                score: { type: 'INTEGER' },
                strengths: { type: 'ARRAY', items: { type: 'STRING' } },
                weaknesses: { type: 'ARRAY', items: { type: 'STRING' } },
                suggestions: { type: 'ARRAY', items: { type: 'STRING' } }
              },
              required: ['score', 'strengths', 'weaknesses', 'suggestions']
            }
          }
        });
        return JSON.parse(response.text);
      } catch (err) {
        this.logger.error('Gemini Resume Analysis failed, running fallback...', err);
        return this.fallbackResumeAnalysis(targetRoleName, parsedSkills);
      }
    } else {
      return this.fallbackResumeAnalysis(targetRoleName, parsedSkills);
    }
  }

  async queryCopilot(userId: string, message: string): Promise<string> {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      include: {
        targetRole: {
          include: {
            skills: { include: { skill: true } },
            projectTemplates: true,
          },
        },
        skills: { include: { skill: true } },
        userAssessments: true,
        roadmaps: {
          where: { isActive: true },
          include: {
            steps: {
              include: { tasks: true },
            },
          },
        },
      },
    });

    if (!profile) return 'Profile not found. Please log in again.';

    const targetRoleName = profile.targetRole?.name || 'Undefined Role';
    const currentSkills = profile.skills.map(s => `${s.skill.name}: ${s.score}%`).join(', ') || 'None';
    const activeRoadmap = profile.roadmaps[0];
    const incompleteTasks = activeRoadmap 
      ? activeRoadmap.steps.flatMap(s => s.tasks).filter(t => t.status !== 'DONE').map(t => t.title)
      : [];
    const completedTasksCount = activeRoadmap
      ? activeRoadmap.steps.flatMap(s => s.tasks).filter(t => t.status === 'DONE').length
      : 0;
    const totalTasksCount = activeRoadmap
      ? activeRoadmap.steps.flatMap(s => s.tasks).length
      : 0;

    let avgQuizScore = 0;
    if (profile.userAssessments.length > 0) {
      avgQuizScore = Math.round(profile.userAssessments.reduce((sum, item) => sum + item.score, 0) / profile.userAssessments.length);
    }

    const contextPrompt = `You are CareerPilot AI, a turn-by-turn Career GPS. Provide a highly actionable, structured recommendation to the user.
User Context:
- Target Role: ${targetRoleName}
- Current Skills & Scores: ${currentSkills}
- Active Tasks Progress: ${completedTasksCount}/${totalTasksCount} completed
- Incomplete Tasks List: ${incompleteTasks.slice(0, 3).join(', ')}
- Average Assessment Quiz Score: ${avgQuizScore}%
- User Message: "${message}"

Rules:
1. References actual user context details.
2. Tell them exactly what to do next.
3. Do not give generic advice. Keep it under 150 words.`;

    if (this.isGeminiConfigured) {
      try {
        const response = await this.ai.models.generateContent({
          model: 'gemini-1.5-flash',
          contents: contextPrompt,
        });
        return response.text;
      } catch (err) {
        this.logger.error('Gemini Copilot Query failed, running fallback...', err);
        return this.fallbackQueryCopilot(message, targetRoleName, incompleteTasks, completedTasksCount, totalTasksCount, avgQuizScore);
      }
    } else {
      return this.fallbackQueryCopilot(message, targetRoleName, incompleteTasks, completedTasksCount, totalTasksCount, avgQuizScore);
    }
  }

  // --- Fallback Deterministic Logic ---

  private async fallbackParseResume(rawText: string): Promise<any> {
    this.logger.log('Fallback Resume Parsing running...');
    const lowercaseText = rawText.toLowerCase();

    // Query seeded skills to check matches
    const allSkills = await this.prisma.skill.findMany({});
    const matchedSkills: string[] = [];

    for (const skill of allSkills) {
      // Regex check for word boundaries
      const regex = new RegExp(`\\b${skill.name.toLowerCase().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'i');
      if (regex.test(lowercaseText) || lowercaseText.includes(skill.slug)) {
        matchedSkills.push(skill.name);
      }
    }

    // Default mock fallback values for projects and jobs if none are obvious
    const projects = [
      {
        title: 'Personal Portfolio Website',
        techStack: matchedSkills.slice(0, 3)
      }
    ];

    const jobs = [
      {
        title: 'Freelance Web Developer',
        company: 'Self-employed',
        description: 'Designed and developed custom layouts and web features.'
      }
    ];

    return {
      skills: matchedSkills.length > 0 ? matchedSkills : ['HTML & CSS', 'JavaScript'],
      projects,
      jobs
    };
  }

  private fallbackGenerateRoadmap(roleName: string, missingSkills: string[]): any {
    this.logger.log('Fallback Roadmap Generation running...');
    const steps = [
      {
        phase: 1,
        title: `Fundamentals & Core missing skills`,
        description: `Deep dive into the underlying building blocks, targeting ${missingSkills.slice(0, 2).join(', ') || 'prerequisite tools'}.`,
        order: 1,
        tasks: [
          {
            title: `Review core Documentation & Guides`,
            description: `Spend 45 minutes reading the official specifications and getting comfortable with concepts.`
          },
          {
            title: `Build 3 simple sandbox examples`,
            description: `Write small, isolated code samples in a local file or codepen to test syntax.`
          }
        ]
      },
      {
        phase: 2,
        title: `Advanced Application & Integration`,
        description: `Apply your knowledge by solving problems, focusing on ${missingSkills.slice(2, 4).join(', ') || 'development libraries'}.`,
        order: 2,
        tasks: [
          {
            title: `Solve 2 DSA practice tasks`,
            description: `Use a platform like LeetCode or HackerRank to write algorithms using these skills.`
          },
          {
            title: `Implement routing & state management`,
            description: `Connect multiple views together and store configurations in local state.`
          }
        ]
      },
      {
        phase: 3,
        title: `Portfolio Project & Validation`,
        description: `Build a production-ready application to showcase in your resume.`,
        order: 3,
        tasks: [
          {
            title: `Initialize Repository & Setup database`,
            description: `Setup git repo, define database schema, and write basic mock endpoints.`
          },
          {
            title: `Complete portfolio integration`,
            description: `Connect frontend design to backend APIs and deploy locally.`
          }
        ]
      }
    ];

    return {
      title: `Learning roadmap to become a ${roleName}`,
      steps
    };
  }

  private fallbackResumeAnalysis(targetRoleName: string, parsedSkills: string[]): any {
    this.logger.log('Fallback Resume Analysis running...');
    const score = Math.min(95, Math.max(45, 50 + parsedSkills.length * 5));
    
    return {
      score,
      strengths: [
        `Demonstrated technical knowledge in core areas: ${parsedSkills.slice(0, 3).join(', ') || 'General engineering'}`,
        'Structured project catalog detailing specific tools and languages used',
        'Clear professional summary alignable with engineering requirements'
      ],
      weaknesses: [
        `Limited visible depth in advanced ecosystem skills for "${targetRoleName}"`,
        'Missing metrics or specific outcome impacts (e.g. key performance percentages)',
        'Lack of explicit cloud deployment links or public portfolio repositories'
      ],
      suggestions: [
        `Incorporate 2-3 measurable project outcomes (e.g., "reduced latency by 20%" or "boosted conversions by 15%")`,
        `Add active deployment urls (e.g., Netlify, Vercel, AWS) next to project headings`,
        `Directly link your GitHub profile and showcase clean version-controlled code`,
        `Add specific certifications or assessments validated in "${targetRoleName}" keywords`
      ]
    };
  }

  private fallbackQueryCopilot(
    message: string,
    targetRoleName: string,
    incompleteTasks: string[],
    completedTasksCount: number,
    totalTasksCount: number,
    avgQuizScore: number
  ): string {
    this.logger.log('Fallback Query Copilot running...');
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('focus') || lowerMessage.includes('today') || lowerMessage.includes('do next')) {
      if (incompleteTasks.length > 0) {
        return `Based on your target role of ${targetRoleName}, you should focus on completing the task: "${incompleteTasks[0]}" today. This is currently blocking your roadmap progress. You've completed ${completedTasksCount}/${totalTasksCount} tasks so far. Keep it up!`;
      }
      return `You have completed all tasks in your current roadmap steps! You should take the next assessment to validate your skills or start a new project to raise your readiness score.`;
    }

    if (lowerMessage.includes('readiness') || lowerMessage.includes('score') || lowerMessage.includes('low')) {
      return `Your Career Readiness is currently determined by your Skills, Projects, Roadmap progress, and Assessments. To improve your score, focus on:
1. Completing tasks in your daily checklist.
2. Building the recommended portfolio projects.
3. Taking assessments to validate your skills.`;
    }

    if (lowerMessage.includes('project') || lowerMessage.includes('build')) {
      return `For a ${targetRoleName}, I highly recommend building a portfolio project matching your next roadmap milestones. Check out the Projects tab to choose from Beginner, Intermediate, or Advanced project blueprints. Completing these will directly boost your Project Readiness score.`;
    }

    if (lowerMessage.includes('resume') || lowerMessage.includes('cv') || lowerMessage.includes('improve')) {
      return `To improve your resume for ${targetRoleName} roles, head over to the Profile tab to view your parsed Resume Analysis. Focus on adding impact metrics (e.g., numbers, percentages), direct GitHub links, and deployment urls for your projects.`;
    }

    return `Hello! As your Career GPS, I'm tracking your progress toward becoming a ${targetRoleName}. You have completed ${completedTasksCount} of ${totalTasksCount} tasks in your roadmap, and your average assessment score is ${avgQuizScore}%. Ask me what you should focus on today, how to improve your resume, or about your readiness score!`;
  }
}
