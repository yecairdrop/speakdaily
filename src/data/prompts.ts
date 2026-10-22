import type { Phase, Prompt, PromptCategory } from '../types'

/**
 * Question bank for a computer-science student in Turkey preparing for corporate
 * (telecom / tech) interviews. Phase 1 = short and personal, phase 2 = structured
 * interview answers + STAR, phase 3 = longer, opinion-heavy and spontaneous.
 */
function p(
  id: string,
  category: PromptCategory,
  phase: Phase,
  suggestedSeconds: number,
  text: string,
  hints?: [string, string, string],
): Prompt {
  return hints ? { id, category, phase, suggestedSeconds, text, hints } : { id, category, phase, suggestedSeconds, text }
}

export const PROMPTS: Prompt[] = [
  // ───────────────────────── Phase 1 · daily (60s) ─────────────────────────
  p('day-01', 'daily', 1, 60, 'Describe the city you live in to someone who has never been there.', [
    'Size, location, what it is famous for',
    'One place you would take a visitor',
    'One thing you would change about it',
  ]),
  p('day-02', 'daily', 1, 60, 'Walk me through a typical weekday for you.', [
    'Morning routine and getting to campus',
    'Classes, study or project time',
    'How you relax in the evening',
  ]),
  p('day-03', 'daily', 1, 60, 'Tell me about a hobby you enjoy and why you like it.', [
    'When and how you started',
    'What you get out of it',
    'How often you do it now',
  ]),
  p('day-04', 'daily', 1, 60, 'Talk about a book, film or series you liked recently.', [
    'What it is about in two sentences',
    'What you liked most',
    'Who you would recommend it to',
  ]),
  p('day-05', 'daily', 1, 60, 'Describe a trip you took that you still remember well.', [
    'Where, when and with whom',
    'One funny or surprising moment',
    'What you learned from it',
  ]),
  p('day-06', 'daily', 1, 60, 'Tell me about your university and your department.', [
    'Where it is and how big it is',
    'What you like about your department',
    'One thing that could be better',
  ]),
  p('day-07', 'daily', 1, 60, 'What did you do last weekend?', [
    'Saturday plans',
    'Sunday plans',
    'Was it relaxing or busy?',
  ]),
  p('day-08', 'daily', 1, 60, 'Describe your favourite place to study or work.', [
    'Where it is and what it looks like',
    'Why you focus well there',
    'What you usually bring with you',
  ]),
  p('day-09', 'daily', 1, 60, 'Talk about a food from your region that a foreigner should try.', [
    'What it is and how it is made',
    'When people usually eat it',
    'Where to find a good one',
  ]),
  p('day-10', 'daily', 1, 60, 'Describe a person who has influenced you.', [
    'Who they are and how you know them',
    'What they taught you',
    'How you are different because of them',
  ]),
  p('day-11', 'daily', 1, 60, 'How do you usually spend your summer holidays?', [
    'Work, internship or rest?',
    'A place you like to go',
    'Your plan for next summer',
  ]),
  p('day-12', 'daily', 1, 60, 'What is your morning routine and would you like to change it?', [
    'What time you wake up',
    'The first three things you do',
    'One habit you want to add',
  ]),
  p('day-13', 'daily', 1, 60, 'Describe your phone: which apps do you use the most and why?', [
    'Top three apps',
    'One app you use for learning',
    'One app you should use less',
  ]),
  p('day-14', 'daily', 1, 60, 'Tell me about a sport or physical activity you do or would like to do.', [
    'What it is',
    'How it makes you feel',
    'How often you can do it',
  ]),
  p('day-15', 'daily', 1, 60, 'What is a skill you would like to learn outside of computer science?', [
    'The skill',
    'Why it interests you',
    'How you would start learning it',
  ]),
  p('day-16', 'daily', 1, 60, 'Describe a celebration or holiday that is important in your family.', [
    'What happens on that day',
    'Who you spend it with',
    'Your favourite part',
  ]),
  p('day-17', 'daily', 1, 60, 'How do you usually get around in your city? Describe your commute.', [
    'Transport you use',
    'How long it takes',
    'What you do during the trip',
  ]),
  p('day-18', 'daily', 1, 60, 'Talk about a small achievement you are proud of from this year.', [
    'What you achieved',
    'Why it was not easy',
    'How you celebrated',
  ]),

  // ───────────────────────── Phase 1 · interview (60s) ─────────────────────────
  p('int-01', 'interview', 1, 60, 'Tell me about yourself in one minute.', [
    'Name, university, year, department',
    'One or two technical interests or projects',
    'What kind of role you are looking for',
  ]),
  p('int-02', 'interview', 1, 60, 'Why did you choose to study computer science?', [
    'The moment you got interested',
    'What you enjoy about it now',
    'Where you want it to take you',
  ]),
  p('int-03', 'interview', 1, 60, 'What are your hobbies outside of programming?', [
    'One or two hobbies',
    'What they teach you (patience, teamwork…)',
    'How they balance your study life',
  ]),
  p('int-04', 'interview', 1, 60, 'What is your favourite course so far and why?', [
    'Name the course',
    'One concept that clicked for you',
    'How you used it later',
  ]),
  p('int-05', 'interview', 1, 60, 'How would your friends describe you?', [
    'Three adjectives',
    'A quick example for one of them',
    'How that helps you at work',
  ]),
  p('int-06', 'interview', 1, 60, 'What programming languages do you know and which is your favourite?', [
    'Languages you have used',
    'Your favourite and why',
    'One you want to learn next',
  ]),
  p('int-07', 'interview', 1, 60, 'What do you know about our company?', [
    'Main business and products (e.g. mobile, broadband, digital services)',
    'Something recent you read about it',
    'Why that interests you',
  ]),
  p('int-08', 'interview', 1, 60, 'Are you more of a team player or do you prefer working alone?', [
    'Your honest preference',
    'An example from a group project',
    'Why both matter in a company',
  ]),
  p('int-09', 'interview', 1, 60, 'What motivates you to get up and work every day?', [
    'Learning something new',
    'Building something people use',
    'A personal goal',
  ]),
  p('int-10', 'interview', 1, 60, 'Describe your ideal working environment.', [
    'Team size and culture',
    'Office, remote or hybrid',
    'The kind of manager you work well with',
  ]),
  p('int-11', 'interview', 1, 60, 'What did you do in your last internship or summer job?', [
    'Company and team',
    'Your main task',
    'One thing you learned',
  ]),
  p('int-12', 'interview', 1, 60, 'How do you organise your time during exam weeks?', [
    'Planning tools you use',
    'How you prioritise',
    'How you avoid burnout',
  ]),

  // ───────────────────────── Phase 1 · tech (60s) ─────────────────────────
  p('tech-01', 'tech', 1, 60, 'Explain what an API is to someone who does not work in tech.', [
    'Use a restaurant / waiter analogy',
    'A real example (weather app, payment)',
    'Why companies build APIs',
  ]),
  p('tech-02', 'tech', 1, 60, 'Tell me about a technology or tool you really like.', [
    'What it is',
    'What problem it solves for you',
    'Something you built with it',
  ]),
  p('tech-03', 'tech', 1, 60, 'What is the difference between frontend and backend?', [
    'What the user sees vs. what runs on the server',
    'Typical technologies for each',
    'Which side you prefer',
  ]),
  p('tech-04', 'tech', 1, 60, 'Explain what Git is and why developers use it.', [
    'Version history',
    'Working together with branches',
    'A time it saved you',
  ]),
  p('tech-05', 'tech', 1, 60, 'Describe your computer setup for programming.', [
    'Operating system and editor',
    'Favourite extensions or tools',
    'One shortcut you use all the time',
  ]),
  p('tech-06', 'tech', 1, 60, 'Explain what "the cloud" means in simple words.', [
    'Somebody else\'s computers you rent',
    'Examples: storage, hosting',
    'Why companies like it',
  ]),
  p('tech-07', 'tech', 1, 60, 'How do you usually learn a new programming topic?', [
    'Documentation, videos or courses',
    'Building a small project',
    'How you know you have learned it',
  ]),
  p('tech-08', 'tech', 1, 60, 'Explain what a database is and give an everyday example.', [
    'Organised storage of data',
    'Example: contacts, a shop\'s products',
    'Tables and queries in one sentence',
  ]),
  p('tech-09', 'tech', 1, 60, 'What is a mobile network and how does your phone connect to the internet?', [
    'Base stations / cell towers',
    '4G / 5G in simple words',
    'Why coverage sometimes drops',
  ]),
  p('tech-10', 'tech', 1, 60, 'Describe the last small program or script you wrote.', [
    'What it did',
    'The language you used',
    'What you would improve',
  ]),

  // ───────────────────────── Phase 2 · interview (120s) ─────────────────────────
  p('int-13', 'interview', 2, 120, 'Why do you want to work for our company?', [
    'Something specific about the company (product, scale, culture)',
    'How it matches your skills',
    'What you want to learn there',
  ]),
  p('int-14', 'interview', 2, 120, 'What are your greatest strengths?', [
    'Pick two strengths, not five',
    'Give a short example for each',
    'Connect them to the role',
  ]),
  p('int-15', 'interview', 2, 120, 'What is your biggest weakness?', [
    'A real but non-critical weakness',
    'What you are doing to improve it',
    'Evidence that it is getting better',
  ]),
  p('int-16', 'interview', 2, 120, 'Where do you see yourself in five years?', [
    'Technical growth (e.g. senior engineer, specialist)',
    'Responsibilities you want',
    'Why this company fits that path',
  ]),
  p('int-17', 'interview', 2, 120, 'Why should we hire you instead of other candidates?', [
    'Your unique mix of skills',
    'Proof: a project or result',
    'Attitude: fast learner, reliable',
  ]),
  p('int-18', 'interview', 2, 120, 'Describe a project you are proud of.', [
    'Goal of the project and your role',
    'Technologies and one hard problem',
    'The result and what you learned',
  ]),
  p('int-19', 'interview', 2, 120, 'How do you handle pressure and tight deadlines?', [
    'Your method: break down, prioritise',
    'A concrete example',
    'How you communicate with the team',
  ]),
  p('int-20', 'interview', 2, 120, 'What are your salary expectations?', [
    'Show you researched the market for junior roles',
    'Give a range, not one number',
    'Say learning and growth also matter to you',
  ]),
  p('int-21', 'interview', 2, 120, 'Do you have any questions for us?', [
    'Ask about the team and the first three months',
    'Ask about tech stack or training',
    'Ask how success is measured in the role',
  ]),
  p('int-22', 'interview', 2, 120, 'What kind of role are you looking for and why?', [
    'Area: backend, mobile, data, network…',
    'Why that area excites you',
    'What you can already bring',
  ]),
  p('int-23', 'interview', 2, 120, 'How do you keep up to date with technology?', [
    'Sources: blogs, newsletters, podcasts',
    'Side projects',
    'Something you learned this month',
  ]),
  p('int-24', 'interview', 2, 120, 'What would you do in your first 90 days in this role?', [
    'Learn the systems and the people',
    'Deliver a small task early',
    'Ask for feedback and set goals',
  ]),
  p('int-25', 'interview', 2, 120, 'How do you deal with feedback or criticism?', [
    'Listen first, don\'t defend',
    'An example where feedback changed your work',
    'How you give feedback to others',
  ]),
  p('int-26', 'interview', 2, 120, 'Tell me about your final-year or graduation project.', [
    'The problem it solves',
    'Your architecture and role',
    'Current status and next steps',
  ]),
  p('int-27', 'interview', 2, 120, 'Are you willing to relocate or work shifts if the role requires it?', [
    'Your honest answer',
    'What would make it work for you',
    'Show flexibility for the right opportunity',
  ]),
  p('int-28', 'interview', 2, 120, 'What does good teamwork look like to you?', [
    'Clear communication and ownership',
    'Helping each other',
    'An example from a student project',
  ]),

  // ───────────────────────── Phase 2 · tech (120s) ─────────────────────────
  p('tech-11', 'tech', 2, 120, 'Describe your development workflow from a task to production.', [
    'Understanding the task, branching',
    'Coding, testing, code review',
    'CI/CD and deployment',
  ]),
  p('tech-12', 'tech', 2, 120, 'Tell me about a difficult bug you fixed.', [
    'The symptom',
    'How you found the root cause',
    'The fix and how you prevented it again',
  ]),
  p('tech-13', 'tech', 2, 120, 'Explain object-oriented programming to a first-year student.', [
    'Classes and objects with an example',
    'Encapsulation, inheritance, polymorphism briefly',
    'Why it helps in big projects',
  ]),
  p('tech-14', 'tech', 2, 120, 'What happens when you type a URL into the browser and press Enter?', [
    'DNS lookup',
    'TCP/TLS connection and HTTP request',
    'Server response and rendering',
  ]),
  p('tech-15', 'tech', 2, 120, 'Explain the difference between SQL and NoSQL databases.', [
    'Structure: tables vs documents/key-value',
    'When to use each',
    'An example from your projects',
  ]),
  p('tech-16', 'tech', 2, 120, 'How do you test your code?', [
    'Unit tests and what you test',
    'Manual and integration testing',
    'A bug that tests caught',
  ]),
  p('tech-17', 'tech', 2, 120, 'Explain what a REST API is and how you designed one.', [
    'Resources, HTTP methods, status codes',
    'An endpoint you built',
    'Error handling and versioning',
  ]),
  p('tech-18', 'tech', 2, 120, 'Explain a technical concept you learned recently to a non-technical manager.', [
    'Use an analogy',
    'Why it matters for the business',
    'Keep jargon out',
  ]),

  // ───────────────────────── Phase 2 · opinion (120s) ─────────────────────────
  p('op-01', 'opinion', 2, 120, 'Remote work or office work: which is better for junior developers?', [
    'Learning from seniors in person',
    'Focus and flexibility at home',
    'Your conclusion: hybrid?',
  ]),
  p('op-02', 'opinion', 2, 120, 'Is AI a good thing or a risk for junior developers?', [
    'Productivity gains',
    'Risk of not learning fundamentals',
    'How you use AI tools yourself',
  ]),
  p('op-03', 'opinion', 2, 120, 'Should university education be free for everyone?', [
    'Equal opportunity',
    'Who pays and quality concerns',
    'Your position and why',
  ]),
  p('op-04', 'opinion', 2, 120, 'Do internships matter more than grades when getting a job?', [
    'What employers actually look at',
    'Real experience vs. theory',
    'Your own experience',
  ]),
  p('op-05', 'opinion', 2, 120, 'Is social media more harmful or helpful for young people?', [
    'Connection and learning',
    'Addiction and comparison',
    'How you manage your own use',
  ]),
  p('op-06', 'opinion', 2, 120, 'Should every student learn to code at school?', [
    'Problem-solving skills',
    'Not everyone will be a developer',
    'What the minimum should be',
  ]),

  // ───────────────────────── Phase 2 · STAR (120–150s) ─────────────────────────
  p('star-01', 'star', 2, 150, 'Tell me about a mistake you made and how you handled it.', [
    'S/T: the project and what went wrong',
    'A: how you owned it and fixed it',
    'R: outcome + what you do differently now',
  ]),
  p('star-02', 'star', 2, 150, 'Describe a conflict you had in a team and how you resolved it.', [
    'S/T: the disagreement and why it mattered',
    'A: how you listened and found common ground',
    'R: the decision and the relationship afterwards',
  ]),
  p('star-03', 'star', 2, 150, 'Tell me about a time you had to learn something very quickly.', [
    'S/T: the deadline and the unknown technology',
    'A: your learning strategy',
    'R: what you delivered',
  ]),
  p('star-04', 'star', 2, 150, 'Describe a time you worked under a tight deadline.', [
    'S/T: what was due and why it was tight',
    'A: how you prioritised and communicated',
    'R: was it delivered, and what did you learn',
  ]),
  p('star-05', 'star', 2, 150, 'Tell me about a time you took the initiative without being asked.', [
    'S/T: the problem nobody owned',
    'A: what you did',
    'R: the impact',
  ]),
  p('star-06', 'star', 2, 150, 'Describe a situation where you had to explain something complex to someone.', [
    'S/T: who and what',
    'A: how you simplified it',
    'R: did they understand, how do you know',
  ]),
  p('star-07', 'star', 2, 150, 'Tell me about a time you failed to reach a goal.', [
    'S/T: the goal',
    'A: what you tried',
    'R: what you learned and changed',
  ]),
  p('star-08', 'star', 2, 150, 'Describe a time you received difficult feedback.', [
    'S/T: the context and the feedback',
    'A: how you reacted and what you changed',
    'R: the improvement',
  ]),
  p('star-09', 'star', 2, 150, 'Tell me about a group project where a team member was not contributing.', [
    'S/T: the project and the problem',
    'A: how you talked to them / adjusted the plan',
    'R: the result for the project',
  ]),
  p('star-10', 'star', 2, 150, 'Describe a time you had to manage several tasks at once.', [
    'S/T: the competing tasks',
    'A: your prioritisation method',
    'R: what got done and how',
  ]),
  p('star-11', 'star', 2, 150, 'Tell me about a time you solved a problem in a creative way.', [
    'S/T: the problem and constraints',
    'A: the unusual idea',
    'R: the result',
  ]),
  p('star-12', 'star', 2, 150, 'Describe a time you helped a teammate who was struggling.', [
    'S/T: what they struggled with',
    'A: how you helped without taking over',
    'R: outcome for them and the team',
  ]),
  p('star-13', 'star', 2, 150, 'Tell me about a time you had to work with a technology you did not like.', [
    'S/T: the project and the technology',
    'A: how you adapted',
    'R: what you learned about it',
  ]),
  p('star-14', 'star', 2, 150, 'Describe a time you improved a process or made something more efficient.', [
    'S/T: the slow or manual process',
    'A: your improvement (script, automation…)',
    'R: time or errors saved — use numbers',
  ]),

  // ───────────────────────── Phase 3 · interview (180s) ─────────────────────────
  p('int-29', 'interview', 3, 180, 'Tell me about yourself — the full three-minute version.', [
    'Present: who you are and what you do now',
    'Past: education, projects, internships that shaped you',
    'Future: why this role is the logical next step',
  ]),
  p('int-30', 'interview', 3, 180, 'Walk me through your CV and the decisions behind it.', [
    'Why your university and department',
    'Why each internship or project',
    'The thread that connects them',
  ]),
  p('int-31', 'interview', 3, 180, 'How would you contribute to our company\'s digital transformation?', [
    'Understand their business (telecom → digital services)',
    'Skills you bring (data, cloud, mobile…)',
    'A concrete idea',
  ]),
  p('int-32', 'interview', 3, 180, 'What would make you leave a job after one year?', [
    'Stay positive',
    'Lack of learning or values mismatch',
    'What keeps you long term',
  ]),
  p('int-33', 'interview', 3, 180, 'Describe your leadership style, even if you have not been a manager.', [
    'Leading by example in student projects',
    'How you motivate others',
    'How you make decisions',
  ]),
  p('int-34', 'interview', 3, 180, 'If you got this job, what would you want to be known for in your team?', [
    'Reliability, quality, helpfulness',
    'A habit that shows it',
    'Why it matters to you',
  ]),
  p('int-35', 'interview', 3, 180, 'How do you decide between doing something fast and doing it perfectly?', [
    'Depends on impact and risk',
    'An example of each choice',
    'How you communicate trade-offs',
  ]),
  p('int-36', 'interview', 3, 180, 'Pitch one product idea for a telecom company in three minutes.', [
    'The customer problem',
    'Your solution and how it works',
    'How it makes money / helps retention',
  ]),

  // ───────────────────────── Phase 3 · tech (180s) ─────────────────────────
  p('tech-19', 'tech', 3, 180, 'Design a simple URL shortener. Talk through your approach.', [
    'Requirements and API',
    'Storage and ID generation',
    'Scaling and caching',
  ]),
  p('tech-20', 'tech', 3, 180, 'How would you explain 5G and its business value to a customer?', [
    'Speed, latency, many devices',
    'Use cases: IoT, streaming, factories',
    'What changes for the customer',
  ]),
  p('tech-21', 'tech', 3, 180, 'Compare two frameworks or languages you have used. Which would you choose for a new project?', [
    'Strengths of each',
    'The project context matters',
    'Your choice and reasons',
  ]),
  p('tech-22', 'tech', 3, 180, 'How would you make a slow web page faster?', [
    'Measure first (profiling tools)',
    'Frontend: bundle size, images, caching',
    'Backend: queries, indexes, CDN',
  ]),
  p('tech-23', 'tech', 3, 180, 'What makes code "clean" in your opinion?', [
    'Naming and small functions',
    'Tests and readability over cleverness',
    'An example of refactoring you did',
  ]),
  p('tech-24', 'tech', 3, 180, 'Explain how you would secure a login system.', [
    'Password hashing, HTTPS',
    'Rate limiting, 2FA',
    'Sessions / tokens and expiry',
  ]),
  p('tech-25', 'tech', 3, 180, 'Describe how machine learning could help a telecom company.', [
    'Churn prediction',
    'Network anomaly detection',
    'Customer support chatbots — limits too',
  ]),

  // ───────────────────────── Phase 3 · opinion (180s) ─────────────────────────
  p('op-07', 'opinion', 3, 180, 'Will AI replace software developers in the next ten years?', [
    'What AI already does well',
    'What still needs humans',
    'How developers should adapt',
  ]),
  p('op-08', 'opinion', 3, 180, 'Should companies monitor employees who work from home?', [
    'Trust vs. accountability',
    'Privacy concerns',
    'Better ways to measure output',
  ]),
  p('op-09', 'opinion', 3, 180, 'Is it better to work at a big corporation or a startup at the start of your career?', [
    'Structure, training, stability',
    'Speed, responsibility, risk',
    'Your choice and why',
  ]),
  p('op-10', 'opinion', 3, 180, 'Should smartphones be banned in schools?', [
    'Distraction and mental health',
    'Learning tools and safety',
    'A middle-ground rule',
  ]),
  p('op-11', 'opinion', 3, 180, 'Is a four-day working week a good idea?', [
    'Productivity and wellbeing research',
    'Which jobs it does not fit',
    'Would you want it?',
  ]),
  p('op-12', 'opinion', 3, 180, 'Brain drain: should young engineers stay in Turkey or work abroad?', [
    'Opportunities and salaries abroad',
    'Building the local tech ecosystem',
    'Your personal plan',
  ]),
  p('op-13', 'opinion', 3, 180, 'Should personal data be the price we pay for free apps?', [
    'How free apps make money',
    'Risks for users',
    'Regulation like KVKK / GDPR',
  ]),
  p('op-14', 'opinion', 3, 180, 'Are online certificates as valuable as a university degree?', [
    'Skills vs. credentials',
    'What employers trust',
    'The best combination',
  ]),
  p('op-15', 'opinion', 3, 180, 'Is open-source software good for business?', [
    'Cost and community',
    'Security and support concerns',
    'Examples of companies that win with it',
  ]),
  p('op-16', 'opinion', 3, 180, 'Should big tech companies pay more taxes in the countries where they earn money?', [
    'Fairness to local businesses',
    'Investment and jobs',
    'Your opinion',
  ]),
  p('op-17', 'opinion', 3, 180, 'Is English a requirement for every engineer today?', [
    'Documentation and communities',
    'Global teams and careers',
    'Your own experience learning it',
  ]),
  p('op-18', 'opinion', 3, 180, 'Should children have limits on screen time? Who should set them?', [
    'Health and development',
    'Parents vs. schools vs. apps',
    'A practical rule',
  ]),
  p('op-19', 'opinion', 3, 180, 'Electric cars: are they really the future in Turkey?', [
    'Charging infrastructure and price',
    'Local production',
    'Environmental impact',
  ]),
  p('op-20', 'opinion', 3, 180, 'Is it more important to be talented or hard-working?', [
    'Examples of each',
    'How they work together',
    'Which one you rely on',
  ]),
  p('op-21', 'opinion', 3, 180, 'Should companies hire based on skills tests instead of CVs?', [
    'Fairness and bias',
    'What tests miss (soft skills)',
    'An ideal hiring process',
  ]),

  // ───────────────────────── Phase 3 · STAR (180s) ─────────────────────────
  p('star-15', 'star', 3, 180, 'Tell me about the most challenging project you have worked on.', [
    'S/T: scope, team, why it was hard',
    'A: your key decisions and actions',
    'R: measurable result and learnings',
  ]),
  p('star-16', 'star', 3, 180, 'Describe a time you had to convince others to accept your idea.', [
    'S/T: the idea and the resistance',
    'A: data, demo, listening to concerns',
    'R: outcome',
  ]),
  p('star-17', 'star', 3, 180, 'Tell me about a time you had to make a decision without all the information.', [
    'S/T: what was unknown and why you had to decide',
    'A: how you reduced the risk',
    'R: result and what you would do again',
  ]),
  p('star-18', 'star', 3, 180, 'Describe a time you disagreed with a teacher, manager or senior person.', [
    'S/T: the disagreement',
    'A: how you raised it respectfully',
    'R: what was decided',
  ]),
  p('star-19', 'star', 3, 180, 'Tell me about a time you had to adapt to a big change.', [
    'S/T: the change (team, tool, plan)',
    'A: how you adapted',
    'R: what improved',
  ]),
  p('star-20', 'star', 3, 180, 'Describe a time you went above and beyond for a user or customer.', [
    'S/T: the user and their problem',
    'A: the extra effort',
    'R: their reaction and impact',
  ]),
  p('star-21', 'star', 3, 180, 'Tell me about a time you led a group, formally or informally.', [
    'S/T: the group and goal',
    'A: how you organised and motivated',
    'R: result',
  ]),
  p('star-22', 'star', 3, 180, 'Describe a time a project did not go as planned.', [
    'S/T: plan vs reality',
    'A: how you re-planned',
    'R: final outcome and lessons',
  ]),
  p('star-23', 'star', 3, 180, 'Tell me about a time you had to balance quality and speed.', [
    'S/T: the pressure',
    'A: what you cut and what you protected',
    'R: result',
  ]),
  p('star-24', 'star', 3, 180, 'Describe a time you found and fixed a problem before anyone else noticed it.', [
    'S/T: what you noticed',
    'A: investigation and fix',
    'R: what could have happened',
  ]),
]

export const PROMPTS_BY_ID: ReadonlyMap<string, Prompt> = new Map(PROMPTS.map((pr) => [pr.id, pr]))

export const CATEGORY_LABELS: Record<PromptCategory, string> = {
  interview: 'Interview',
  tech: 'Tech',
  daily: 'Daily life',
  opinion: 'Opinion',
  star: 'STAR',
}

export const CATEGORIES: PromptCategory[] = ['interview', 'tech', 'daily', 'opinion', 'star']
