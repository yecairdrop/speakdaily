import type { Passage } from '../types'

/** Short interview / workplace passages (40–80 words) for listen → speak-along → record shadowing. */
export const PASSAGES: Passage[] = [
  {
    id: 'sh-01',
    title: 'A short self-introduction',
    text: "Hi, I'm a final-year computer engineering student. Over the last two years I've focused on backend development, mainly with Java and Spring Boot. I enjoy designing clean APIs and making systems reliable. Last summer I did an internship where I worked on an internal reporting tool. Now I'm looking for a junior developer role where I can learn from experienced engineers and contribute to real products.",
  },
  {
    id: 'sh-02',
    title: 'Describing a project',
    text: 'My graduation project is a mobile app that helps students find study partners. Users create a profile, choose their courses, and the app suggests people with similar schedules. I built the backend with Node.js and used PostgreSQL for the data. The hardest part was the matching logic, because it had to be fast and fair. We tested it with forty students, and most of them said it saved them time.',
  },
  {
    id: 'sh-03',
    title: 'Explaining a technical decision',
    text: 'We decided to use a message queue between the two services instead of calling them directly. The main reason is reliability. If the second service is down for a few minutes, the messages simply wait in the queue and nothing is lost. It added a bit of complexity, but in my experience that trade-off is worth it when the data is important.',
  },
  {
    id: 'sh-04',
    title: 'Talking about teamwork',
    text: "In my last group project, we were five people with very different schedules. To be honest, the first two weeks were chaotic. Then we started a short daily check-in, just ten minutes online. Everyone said what they had done and what was blocking them. That small habit changed everything. We finished a week early, and the communication was much better.",
  },
  {
    id: 'sh-05',
    title: 'Why this company',
    text: "I'd like to join your company because you work at a scale that very few companies in Turkey can offer. Millions of people use your services every day, so even a small improvement has a big impact. I'm also interested in your digital services, especially the mobile apps. I believe I can learn a lot here and grow quickly as an engineer.",
  },
  {
    id: 'sh-06',
    title: 'A strength with an example',
    text: "One of my strengths is that I learn new tools quickly. For example, in my internship I had to work with Docker, which I had never used before. I spent the first weekend reading the documentation and building small examples. By the end of the first week, I was able to containerize our test environment, which made setup much faster for the whole team.",
  },
  {
    id: 'sh-07',
    title: 'Talking about a weakness',
    text: "A weakness I'm working on is that I sometimes spend too long trying to make something perfect. I've realised that it can slow the team down. Now I set myself a time limit, share a first version early, and ask for feedback. It's not always easy, but I'd say I'm getting much better at finding the balance between quality and speed.",
  },
  {
    id: 'sh-08',
    title: 'Fixing a bug',
    text: 'Last month we had a bug where some users saw an empty page after logging in. It only happened on slow connections, so it was hard to reproduce. I used the browser tools to slow down the network and finally saw the problem. Two requests were finishing in the wrong order. I fixed it by waiting for both responses before showing the page.',
  },
  {
    id: 'sh-09',
    title: 'Handling pressure',
    text: "When I'm under pressure, the first thing I do is write down everything that needs to be done. Then I decide what is really urgent and what can wait. I also tell my team early if I think something will be late. In my experience, people are usually fine with problems, as long as they hear about them in time.",
  },
  {
    id: 'sh-10',
    title: 'Where I see myself',
    text: "In five years, I see myself as a strong software engineer who can own a complete feature, from design to production. I'd also like to mentor new team members, because explaining things helps me understand them better. I'm not sure yet whether I'll move into management, but I definitely want to keep growing technically.",
  },
  {
    id: 'sh-11',
    title: 'Explaining an API',
    text: "An API is like a waiter in a restaurant. You don't go into the kitchen yourself. You tell the waiter what you want, and the waiter brings the food back. In software, one program sends a request to an API, and the API returns the data. That's why different apps can work together without knowing how the others are built inside.",
  },
  {
    id: 'sh-12',
    title: 'My development workflow',
    text: 'When I get a new task, I first make sure I understand the goal and ask questions if something is unclear. Then I create a new branch and write the code in small steps. Before opening a pull request, I run the tests and review my own changes. After the code review, the pipeline deploys it automatically to the test environment.',
  },
  {
    id: 'sh-13',
    title: 'Learning something quickly',
    text: "Two weeks before a hackathon, our team decided to use React Native, and none of us had used it before. I divided the learning into small goals: one screen, then navigation, then calling an API. Every evening I built something tiny. By the day of the hackathon I was comfortable with it, and our app actually won second place.",
  },
  {
    id: 'sh-14',
    title: 'A team conflict',
    text: "During a project, two teammates disagreed about which database to use. The discussion was getting personal, so I suggested we list our requirements first and compare both options against them. It took about thirty minutes. In the end, the choice was obvious, and nobody felt that they had lost. I learned that structure can calm down a heated discussion.",
  },
  {
    id: 'sh-15',
    title: 'Questions for the interviewer',
    text: "Thank you, I do have a few questions. Could you tell me what a typical day looks like for someone in this team? I'd also like to know how new engineers are supported in their first few months. And finally, what would success look like for this role after one year? That would help me understand your expectations.",
  },
  {
    id: 'sh-16',
    title: 'Remote or office?',
    text: "I'd say a hybrid model works best for me. On the one hand, working from home helps me focus on deep tasks without interruptions. On the other hand, as a junior developer, I learn a lot by sitting next to experienced colleagues and asking quick questions. So two or three days in the office feels like the right balance.",
  },
  {
    id: 'sh-17',
    title: 'Describing my university',
    text: "I study computer engineering at a state university in the south-west of Turkey. It's not the biggest university, but the classes are small, so we can talk to our professors easily. What I like most is the student community. We organise coding workshops and small hackathons, and that's where I learned most of my practical skills.",
  },
  {
    id: 'sh-18',
    title: 'Explaining the cloud',
    text: "The cloud basically means using someone else's computers over the internet. Instead of buying expensive servers, a company rents computing power and storage from a provider and pays only for what it uses. If more customers arrive, the company can add more resources in minutes. That flexibility is the main reason so many businesses are moving to the cloud.",
  },
  {
    id: 'sh-19',
    title: 'A mistake I made',
    text: "During my internship, I accidentally ran a script on the wrong database and deleted some test data. I told my mentor immediately, even though I was embarrassed. Luckily there was a backup, and we restored everything in an hour. Since then, I always double-check the environment before running anything, and I suggested adding a warning message to the script.",
  },
  {
    id: 'sh-20',
    title: 'Why I chose computer science',
    text: "I became interested in computers when I was fourteen. I wanted to change the way a game worked, so I started reading about programming. The first time my code actually ran, I felt something like magic. Since then, I've enjoyed the feeling of solving a problem step by step. That's the main reason I chose computer science.",
  },
  {
    id: 'sh-21',
    title: 'Salary expectations',
    text: "Based on my research for junior developer roles in Istanbul, I'd expect a salary in the market range for this position. That said, salary is not the only thing that matters to me. The learning opportunities, the team, and the chance to work on real products are just as important. I'm sure we can find a number that works for both sides.",
  },
  {
    id: 'sh-22',
    title: 'Giving a status update',
    text: "Quick update from my side. Yesterday I finished the login screen and opened a pull request. Today I'm going to work on the password reset flow. I have one blocker: I still don't have access to the email service in the test environment. If someone can help me with that after the meeting, I'd really appreciate it.",
  },
  {
    id: 'sh-23',
    title: 'Explaining 5G simply',
    text: "5G is the newest generation of mobile networks. Compared to 4G, it's much faster, but the bigger change is lower latency, which means the delay is very small. It can also connect many more devices at the same time. That makes new things possible, such as smart factories, connected cars, and better video calls in crowded places.",
  },
  {
    id: 'sh-24',
    title: 'Asking for clarification',
    text: "Sorry, I'm not sure I fully understood the requirement. Do you mean that the report should be generated every night, or only when a user asks for it? I'm asking because the two options need quite different designs. If it's every night, I'd use a scheduled job. If it's on demand, we need to think about performance.",
  },
  {
    id: 'sh-25',
    title: 'Talking about a hobby',
    text: 'In my free time I really enjoy hiking. There are some beautiful mountains near my city, and every few weekends I go with a group of friends. It helps me disconnect from screens and clear my mind. Apart from that, it has taught me to plan carefully, because the weather in the mountains can change very quickly.',
  },
  {
    id: 'sh-26',
    title: 'How I learn new things',
    text: "When I learn something new, I try not to watch too many tutorials. Instead, I read the official documentation, then I build a small project as soon as possible. Making mistakes is part of the process. I also write short notes in my own words. If I can explain the topic to a friend, that's when I know I've really learned it.",
  },
  {
    id: 'sh-27',
    title: 'Disagreeing politely',
    text: "I see your point, and I agree that speed is important here. However, I'm a bit worried that if we skip the tests now, we'll spend more time fixing bugs later. What if we write tests only for the payment part, since that's the most critical? That way we can still deliver on Friday and reduce the biggest risk.",
  },
  {
    id: 'sh-28',
    title: 'AI and junior developers',
    text: "I think AI tools are very helpful for junior developers, but only if we use them carefully. They can explain code, suggest solutions and save a lot of time. The risk is that we copy answers without understanding them. Personally, I use AI to get unstuck, but I always make sure I can explain every line before I commit it.",
  },
  {
    id: 'sh-29',
    title: 'Closing an interview',
    text: "Thank you very much for your time today. I really enjoyed learning more about the team and the projects you're working on. This conversation has made me even more excited about the role. If you need any more information from me, please don't hesitate to get in touch. I look forward to hearing from you.",
  },
  {
    id: 'sh-30',
    title: 'Improving a process',
    text: "In our student club, we used to collect event registrations by hand, and it took hours to prepare the lists. I wrote a small script that read the online form results and created the lists automatically. It took me one evening to build. After that, preparation time went from three hours to about ten minutes, and there were no more typing errors.",
  },
  {
    id: 'sh-31',
    title: 'Describing a typical day',
    text: "On a typical weekday, I wake up around seven and take the bus to campus. I usually have classes until early afternoon. After lunch, I spend a few hours in the library working on assignments or my side project. In the evening I like to go for a short walk, and before bed I practise English for about twenty minutes.",
  },
  {
    id: 'sh-32',
    title: 'Talking about security',
    text: "When I build a login system, the first rule is never to store passwords in plain text. I use a strong hashing algorithm with a salt. I also make sure everything runs over HTTPS and limit the number of login attempts to stop brute-force attacks. For sensitive applications, adding two-factor authentication is one of the best improvements you can make.",
  },
]

export const PASSAGES_BY_ID: ReadonlyMap<string, Passage> = new Map(PASSAGES.map((ps) => [ps.id, ps]))
