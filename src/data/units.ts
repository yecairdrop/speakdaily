import type { Unit, VocabItem, VocabKind } from '../types'

/**
 * 12 vocabulary units — one per program week. Each unit has 15 chunks (words, collocations,
 * connectors) for a computer-science student heading into corporate interviews, from A2/B1
 * ("I major in…") up to B2 ("take responsibility", "a good fit for this role").
 * Every example sentence contains its term (or one of `alt`) — enforced by a unit test.
 */

type RawItem = [term: string, tr: string, example: string, exampleTr: string, kind?: VocabKind, alt?: string[]]

interface RawUnit extends Omit<Unit, 'items'> {
  items: RawItem[]
}

function build(raw: RawUnit): Unit {
  return {
    ...raw,
    items: raw.items.map(([term, tr, example, exampleTr, kind = 'phrase', alt], i): VocabItem => ({
      id: `u${raw.id}-${String(i + 1).padStart(2, '0')}`,
      unitId: raw.id,
      term,
      tr,
      example,
      exampleTr,
      kind,
      ...(alt ? { alt } : {}),
    })),
  }
}

const W: VocabKind = 'word'
const C: VocabKind = 'connector'

const RAW_UNITS: RawUnit[] = [
  {
    id: 1,
    title: { tr: 'Kendini tanıtmak', en: 'Introducing yourself' },
    goal: {
      tr: 'Kendini, bölümünü ve ilgi alanlarını 1 dakikada anlatabileceksin.',
      en: 'Introduce yourself, your studies and your interests in one minute.',
    },
    promptId: 'int-01',
    items: [
      ['major in', '…bölümünde okumak', 'I major in computer engineering.', 'Bilgisayar mühendisliği okuyorum.'],
      ['final-year student', 'son sınıf öğrencisi', "I'm a final-year student at a state university.", 'Bir devlet üniversitesinde son sınıf öğrencisiyim.'],
      ['graduate from', '…den mezun olmak', 'I will graduate from university next June.', 'Gelecek haziranda üniversiteden mezun olacağım.'],
      ['be interested in', '…ile ilgilenmek', "I'm especially interested in backend development.", 'Özellikle backend geliştirmeyle ilgileniyorum.', 'phrase', ['interested in']],
      ['hometown', 'memleket, doğduğun şehir', 'My hometown is a small city near the sea.', 'Memleketim denize yakın küçük bir şehir.', W],
      ['grow up', 'büyümek, yetişmek', 'I grew up in a small town in the south of Turkey.', "Türkiye'nin güneyinde küçük bir kasabada büyüdüm.", 'phrase', ['grew up']],
      ['in my free time', 'boş zamanlarımda', 'In my free time, I play the guitar and go hiking.', 'Boş zamanlarımda gitar çalarım ve yürüyüşe giderim.'],
      ['passionate about', '…konusunda tutkulu', "I'm passionate about building useful apps.", 'İşe yarar uygulamalar geliştirmeye tutkuyla bağlıyım.'],
      ['currently', 'şu anda', "I'm currently working on my graduation project.", 'Şu anda bitirme projem üzerinde çalışıyorum.', W],
      ['gain experience', 'deneyim kazanmak', 'I want to gain experience in a real software team.', 'Gerçek bir yazılım ekibinde deneyim kazanmak istiyorum.'],
      ['hard-working', 'çalışkan', "My friends say I'm hard-working and patient.", 'Arkadaşlarım çalışkan ve sabırlı olduğumu söyler.', W],
      ['a quick learner', 'hızlı öğrenen biri', "I'm a quick learner, so new tools don't scare me.", 'Hızlı öğrenirim, bu yüzden yeni araçlar beni korkutmaz.'],
      ['look for', '…aramak', "I'm looking for a junior developer position.", 'Junior geliştirici pozisyonu arıyorum.'],
      ['first of all', 'her şeyden önce', 'First of all, thank you for inviting me.', 'Her şeyden önce, beni davet ettiğiniz için teşekkürler.', C],
      ['apart from that', 'bunun dışında', 'Apart from that, I enjoy reading about new technologies.', 'Bunun dışında, yeni teknolojiler hakkında okumayı severim.', C],
    ],
    modelText:
      "Hi, I'm Can. First of all, thank you for having me. I'm a final-year student and I major in computer engineering. I grew up in a small town, and my hometown is very close to the sea. I'm especially interested in backend development, and I'm passionate about building useful apps. I'm currently working on my graduation project, a mobile app for students. Apart from that, I go hiking in my free time. My friends say I'm hard-working and a quick learner. I will graduate from university next summer, so I'm looking for a junior developer role where I can gain experience.",
    modelSummaryTr: 'Can kendini tanıtıyor: son sınıf bilgisayar mühendisliği öğrencisi, backend ile ilgileniyor ve junior bir rol arıyor.',
  },
  {
    id: 2,
    title: { tr: 'Günlük rutin ve okul hayatı', en: 'Daily routine & university' },
    goal: {
      tr: 'Gününü, derslerini ve alışkanlıklarını rahatça anlatabileceksin.',
      en: 'Describe your day, your classes and your habits with ease.',
    },
    promptId: 'day-02',
    items: [
      ['wake up', 'uyanmak', 'I usually wake up at seven on weekdays.', 'Hafta içi genelde yedide uyanırım.', 'phrase', ['woke up']],
      ['on weekdays', 'hafta içi', 'On weekdays, I take the bus to campus.', 'Hafta içi kampüse otobüsle giderim.'],
      ['take the bus', 'otobüse binmek', "I take the bus because it's cheaper than a taxi.", 'Otobüse binerim çünkü taksiden ucuz.', 'phrase', ['took the bus']],
      ['attend classes', 'derslere girmek', 'I attend classes until two o’clock.', 'Saat ikiye kadar derslere girerim.'],
      ['assignment', 'ödev', 'We have a programming assignment every week.', 'Her hafta bir programlama ödevimiz var.', W],
      ['deadline', 'teslim tarihi', 'The deadline for the project is next Friday.', 'Projenin teslim tarihi gelecek cuma.', W],
      ['study for', '…e çalışmak (sınav)', "I'm studying for my database exam this week.", 'Bu hafta veritabanı sınavıma çalışıyorum.'],
      ['spend time', 'zaman geçirmek', 'I like to spend time with my friends at the weekend.', 'Hafta sonu arkadaşlarımla zaman geçirmeyi severim.', 'phrase', ['spent time']],
      ['get tired', 'yorulmak', 'I get tired quickly during exam weeks.', 'Sınav haftalarında çabuk yorulurum.', 'phrase', ['got tired', 'getting tired']],
      ['usually', 'genellikle', 'I usually have lunch at the university cafeteria.', 'Genellikle üniversite kafeteryasında öğle yemeği yerim.', W],
      ['once a week', 'haftada bir', 'I go to the gym once a week.', 'Haftada bir spor salonuna giderim.'],
      ['busy', 'yoğun, meşgul', 'Mondays are always busy for me.', 'Pazartesileri benim için hep yoğundur.', W],
      ['keep up with', '…e yetişmek, geri kalmamak', "It's hard to keep up with all my courses.", 'Bütün derslerime yetişmek zor.', 'phrase', ['kept up with']],
      ["that's why", 'bu yüzden', "I live far from campus. That's why I wake up early.", 'Kampüse uzak oturuyorum. Bu yüzden erken kalkıyorum.', C],
      ['in the end', 'sonunda', 'It was a long day, but in the end I finished my assignment.', 'Uzun bir gündü ama sonunda ödevimi bitirdim.', C],
    ],
    modelText:
      "On weekdays, I usually wake up at seven. I take the bus to campus because I live quite far away. That's why I'm often tired in the morning. I attend classes until two o'clock, and then I spend time in the library. We have an assignment almost every week, and the deadline is always on Friday, so my weeks are really busy. During exam weeks I get tired quickly, and it's hard to keep up with everything. I go to the gym once a week to relax. In the end, I think a good routine is the secret of success.",
    modelSummaryTr: 'Bir öğrencinin hafta içi rutini: erken kalkmak, dersler, haftalık ödevler ve yoğun sınav haftaları.',
  },
  {
    id: 3,
    title: { tr: 'Hobiler ve deneyimler', en: 'Free time & experiences' },
    goal: {
      tr: 'Hobilerini ve geçmiş deneyimlerini geçmiş zamanla anlatabileceksin.',
      en: 'Talk about your hobbies and past experiences in the past tense.',
    },
    promptId: 'day-03',
    items: [
      ['enjoy', 'keyif almak, sevmek', 'I really enjoy cooking for my friends.', 'Arkadaşlarıma yemek yapmaktan gerçekten keyif alırım.', W],
      ['take up', '(bir hobiye) başlamak', 'I took up running last year.', 'Geçen yıl koşuya başladım.', 'phrase', ['took up']],
      ['go on a trip', 'geziye çıkmak', 'Last summer we went on a trip to Cappadocia.', "Geçen yaz Kapadokya'ya bir geziye çıktık.", 'phrase', ['went on a trip']],
      ['unforgettable', 'unutulmaz', 'It was an unforgettable experience.', 'Unutulmaz bir deneyimdi.', W],
      ['the best part', 'en güzel kısmı', 'The best part was the sunrise over the valley.', 'En güzel kısmı vadinin üstündeki gün doğumuydu.'],
      ['try something new', 'yeni bir şey denemek', 'I like to try something new every month.', 'Her ay yeni bir şey denemeyi severim.', 'phrase', ['tried something new']],
      ['relax', 'rahatlamak, dinlenmek', 'Music helps me relax after a long day.', 'Müzik uzun bir günün ardından rahatlamama yardım eder.', W],
      ['join', 'katılmak (kulüp, grup)', "I decided to join the university's coding club.", 'Üniversitenin kodlama kulübüne katılmaya karar verdim.', W],
      ['be good at', '…de iyi olmak', "I'm not very good at drawing, but I enjoy it.", 'Resim çizmede pek iyi değilim ama keyif alıyorum.', 'phrase', ['good at']],
      ['worth it', 'değer, değdi', 'The hike was hard, but it was worth it.', 'Yürüyüş zordu ama değdi.'],
      ['ago', '(zaman) önce', 'I started playing chess three years ago.', 'Üç yıl önce satranç oynamaya başladım.', W],
      ['used to', 'eskiden …ardı', 'I used to play basketball when I was in high school.', 'Lisedeyken eskiden basketbol oynardım.'],
      ['have fun', 'eğlenmek', 'We had fun at the concert last night.', 'Dün akşam konserde eğlendik.', 'phrase', ['had fun']],
      ['to be honest', 'açıkçası', "To be honest, I don't have much free time.", 'Açıkçası pek boş vaktim yok.', C],
      ['for example', 'örneğin', 'I like outdoor sports, for example hiking and cycling.', 'Açık hava sporlarını severim, örneğin yürüyüş ve bisiklet.', C],
    ],
    modelText:
      "To be honest, I don't have much free time, but I try to use it well. I really enjoy cooking, and last year I took up running. I'm not very good at it yet, but it helps me relax. I used to play basketball in high school. Two years ago, I decided to join a hiking group, and last summer we went on a trip to Cappadocia. It was an unforgettable experience. The best part was the sunrise over the valley. We walked for hours, for example from one village to another, and we had fun all the time. It was tiring, but it was worth it. I always want to try something new.",
    modelSummaryTr: 'Hobiler ve bir Kapadokya gezisi: koşuya başlamak, yürüyüş grubu ve unutulmaz bir gün doğumu.',
  },
  {
    id: 4,
    title: { tr: 'Teknoloji temelleri', en: 'Tech basics' },
    goal: {
      tr: 'Kullandığın teknolojileri ve basit teknik işleri anlatabileceksin.',
      en: 'Talk about the technologies you use and simple technical work.',
    },
    promptId: 'tech-02',
    items: [
      ['software', 'yazılım', 'I want to work in software development.', 'Yazılım geliştirme alanında çalışmak istiyorum.', W],
      ['feature', 'özellik (üründe)', 'We added a new search feature to the app.', 'Uygulamaya yeni bir arama özelliği ekledik.', W],
      ['bug', 'hata (yazılımda)', 'I found a bug on the login page.', 'Giriş sayfasında bir hata buldum.', W],
      ['fix', 'düzeltmek', 'It took me two hours to fix the problem.', 'Sorunu düzeltmem iki saatimi aldı.', W],
      ['user', 'kullanıcı', 'The app has more than a thousand users.', 'Uygulamanın binden fazla kullanıcısı var.', W],
      ['tool', 'araç', 'Git is the tool I use every day.', 'Git her gün kullandığım araç.', W],
      ['database', 'veritabanı', 'We store all the orders in a database.', 'Tüm siparişleri bir veritabanında saklıyoruz.', W],
      ['deploy', 'canlıya almak, yayına almak', 'We deploy the new version every Friday.', 'Yeni sürümü her cuma canlıya alıyoruz.', W],
      ['update', 'güncellemek; güncelleme', "Don't forget to update your dependencies.", 'Bağımlılıklarını güncellemeyi unutma.', W],
      ['test', 'test etmek', 'I always test my code before I push it.', 'Kodumu push etmeden önce her zaman test ederim.', W],
      ['framework', 'framework, çatı', 'React is my favourite frontend framework.', 'React en sevdiğim frontend framework’ü.', W],
      ['work on', '…üzerinde çalışmak', "I'm working on a small chat application.", 'Küçük bir sohbet uygulaması üzerinde çalışıyorum.'],
      ['set up', 'kurmak (ortam, sistem)', 'I set up a test server for our team.', 'Ekibimiz için bir test sunucusu kurdum.'],
      ['in other words', 'başka bir deyişle', "An API is a contract. In other words, it's a set of rules.", 'API bir sözleşmedir. Başka bir deyişle, bir kurallar bütünüdür.', C],
      ['what I mean is', 'demek istediğim şu', "The code works, but what I mean is that it's hard to read.", 'Kod çalışıyor ama demek istediğim, okuması zor.', C],
    ],
    modelText:
      "I'm working on a small web application with two friends. We use React as our frontend framework and PostgreSQL as our database. Last week a user reported a bug: the search feature was very slow. In other words, the app was almost useless for big lists. I found the problem in one query, and it took me a few hours to fix it. Before we deploy a new version, I always test the code carefully. We also set up an automatic update for our dependencies. Git is the tool that saves us every day. What I mean is, good tools make software development much easier.",
    modelSummaryTr: 'Küçük bir web uygulaması: bir kullanıcı yavaş arama hatası bildiriyor, sorun bulunup düzeltiliyor.',
  },
  {
    id: 5,
    title: { tr: 'Projeni anlatmak', en: 'Describing a project' },
    goal: {
      tr: 'Bir projeyi amacı, zorluğu ve sonucuyla baştan sona anlatabileceksin.',
      en: 'Describe a project from start to finish: goal, challenge and outcome.',
    },
    promptId: 'int-18',
    items: [
      ['goal', 'amaç, hedef', 'The goal of the project was to help students find study partners.', 'Projenin amacı öğrencilerin çalışma arkadaşı bulmasına yardım etmekti.', W],
      ['be responsible for', '…den sorumlu olmak', 'I was responsible for the backend.', "Backend'den ben sorumluydum.", 'phrase', ['responsible for']],
      ['challenge', 'zorluk', 'The biggest challenge was the performance.', 'En büyük zorluk performanstı.', W],
      ['solve', 'çözmek', 'We solved it by adding a cache.', 'Bir önbellek ekleyerek çözdük.', W],
      ['come up with', '(fikir, çözüm) bulmak', 'I came up with a simpler design.', 'Daha basit bir tasarım buldum.', 'phrase', ['came up with']],
      ['make a decision', 'karar vermek', 'We had to make a decision quickly.', 'Hızlıca bir karar vermemiz gerekiyordu.', 'phrase', ['made a decision']],
      ['build', 'geliştirmek, inşa etmek', 'We built the first version in four weeks.', 'İlk sürümü dört haftada geliştirdik.', W, ['built']],
      ['outcome', 'sonuç, netice', 'The outcome was better than we expected.', 'Sonuç beklediğimizden iyiydi.', W],
      ['improve', 'iyileştirmek', 'We improved the loading time by 40 percent.', 'Yüklenme süresini yüzde 40 iyileştirdik.', W],
      ['on time', 'zamanında', 'We delivered the project on time.', 'Projeyi zamanında teslim ettik.'],
      ['feedback', 'geri bildirim', 'We collected feedback from twenty users.', 'Yirmi kullanıcıdan geri bildirim topladık.', W],
      ['step by step', 'adım adım', 'I explained the architecture step by step.', 'Mimariyi adım adım anlattım.'],
      ['as a result', 'sonuç olarak', 'As a result, more people used the app.', 'Sonuç olarak uygulamayı daha çok kişi kullandı.', C],
      ['the main reason is', 'asıl sebep şu', 'The main reason is that the old system was too slow.', 'Asıl sebep, eski sistemin çok yavaş olmasıydı.', C],
      ['in my experience', 'benim tecrübeme göre', 'In my experience, small teams make decisions faster.', 'Tecrübeme göre küçük ekipler daha hızlı karar verir.', C],
    ],
    modelText:
      "Let me tell you about my graduation project. The goal was to help students find study partners. I was responsible for the backend, and I built the API with Node.js. The biggest challenge was the matching logic, because it had to be fast. After a few tests, I came up with a simpler design, and we solved the problem with a cache. We had to make a decision quickly, because the deadline was close. The main reason is that we wanted feedback from real users early. We tested the app with forty students and improved it step by step. As a result, we finished on time, and the outcome was better than we expected. In my experience, early feedback saves a lot of time.",
    modelSummaryTr: 'Bitirme projesi: amaç, backend sorumluluğu, eşleştirme zorluğu, çözüm ve zamanında biten sonuç.',
  },
  {
    id: 6,
    title: { tr: 'Takım çalışması', en: 'Teamwork & communication' },
    goal: {
      tr: 'Bir ekipte nasıl çalıştığını, anlaşmazlıkları ve çözümleri anlatabileceksin.',
      en: 'Explain how you work in a team, how you disagree and how you solve it.',
    },
    promptId: 'int-28',
    items: [
      ['work as a team', 'takım olarak çalışmak', 'We worked as a team from day one.', 'İlk günden itibaren takım olarak çalıştık.', 'phrase', ['worked as a team']],
      ['collaborate', 'iş birliği yapmak', 'I collaborated with designers and testers.', 'Tasarımcılar ve testçilerle iş birliği yaptım.', W],
      ['share', 'paylaşmak', 'We share our progress in a short daily meeting.', 'İlerlememizi kısa bir günlük toplantıda paylaşırız.', W],
      ['disagree', 'aynı fikirde olmamak', 'Sometimes we disagree about technical choices.', 'Bazen teknik seçimlerde aynı fikirde olmayız.', W],
      ['find a compromise', 'orta yolu bulmak', 'In the end, we found a compromise.', 'Sonunda bir orta yol bulduk.', 'phrase', ['found a compromise']],
      ['listen to', 'dinlemek', 'I try to listen to everyone before I decide.', 'Karar vermeden önce herkesi dinlemeye çalışırım.'],
      ['support', 'desteklemek', 'We always support each other before deadlines.', 'Teslim tarihlerinden önce hep birbirimizi destekleriz.', W],
      ['communicate', 'iletişim kurmak', "It's important to communicate problems early.", 'Sorunları erken iletmek önemli.', W],
      ['divide the work', 'işi bölüşmek', 'We divided the work into small tasks.', 'İşi küçük görevlere böldük.', 'phrase', ['divided the work']],
      ['take responsibility', 'sorumluluk almak', 'Everyone took responsibility for their part.', 'Herkes kendi kısmının sorumluluğunu aldı.', 'phrase', ['took responsibility']],
      ['misunderstanding', 'yanlış anlaşılma', 'There was a small misunderstanding about the requirements.', 'Gereksinimler konusunda küçük bir yanlış anlaşılma oldu.', W],
      ['point of view', 'bakış açısı', 'I understood his point of view after we talked.', 'Konuştuktan sonra onun bakış açısını anladım.'],
      ['get along with', '…ile iyi anlaşmak', 'I get along with people from different backgrounds.', 'Farklı geçmişlerden insanlarla iyi anlaşırım.', 'phrase', ['got along with']],
      ['on the other hand', 'öte yandan', 'Remote work is flexible. On the other hand, it can feel lonely.', 'Uzaktan çalışma esnek. Öte yandan, yalnız hissettirebilir.', C],
      ["I'd say", 'bence, diyebilirim ki', "I'd say communication is more important than talent.", 'Bence iletişim yetenekten daha önemli.', C],
    ],
    modelText:
      "In my last group project, we were five people, and we worked as a team from day one. First, we divided the work into small tasks, and everyone took responsibility for their part. We shared our progress in a ten-minute meeting every day. Of course, we sometimes disagreed. Once there was a misunderstanding about the database design. I listened to both sides and tried to understand each point of view. On the other hand, we didn't have much time, so we had to find a compromise quickly. In the end, we found a compromise and supported each other until the deadline. I'd say I get along with most people, because I communicate openly.",
    modelSummaryTr: 'Beş kişilik bir grup projesi: işi bölüşmek, bir anlaşmazlık, orta yolu bulmak ve birbirini desteklemek.',
  },
  {
    id: 7,
    title: { tr: 'Güçlü ve zayıf yönler', en: 'Strengths & weaknesses' },
    goal: {
      tr: 'Kendini olumlu ama dürüst bir şekilde, örneklerle tarif edebileceksin.',
      en: 'Describe yourself positively but honestly, with examples.',
    },
    promptId: 'int-14',
    items: [
      ['strength', 'güçlü yön', 'My biggest strength is that I learn quickly.', 'En büyük güçlü yönüm hızlı öğrenmem.', W],
      ['weakness', 'zayıf yön', "One weakness I'm working on is public speaking.", 'Üzerinde çalıştığım zayıf yönlerden biri topluluk önünde konuşmak.', W],
      ['reliable', 'güvenilir', "My teammates know I'm reliable.", 'Takım arkadaşlarım güvenilir olduğumu bilir.', W],
      ['detail-oriented', 'detaycı, ayrıntıya dikkat eden', "I'm detail-oriented, so I rarely miss small bugs.", 'Detaycıyım, bu yüzden küçük hataları nadiren kaçırırım.', W],
      ['patient', 'sabırlı', 'You have to be patient when you teach someone.', 'Birine bir şey öğretirken sabırlı olmalısın.', W],
      ['struggle with', '…de zorlanmak', 'I sometimes struggle with saying no.', 'Bazen hayır demekte zorlanırım.'],
      ['get better at', '…de daha iyi olmak', "I'm getting better at managing my time.", 'Zamanımı yönetmekte giderek daha iyi oluyorum.', 'phrase', ['getting better at', 'got better at']],
      ['under pressure', 'baskı altında', 'I stay calm under pressure.', 'Baskı altında sakin kalırım.'],
      ['pay attention to', '…e dikkat etmek', "I pay attention to the user's experience.", 'Kullanıcının deneyimine dikkat ederim.', 'phrase', ['paid attention to']],
      ['organised', 'düzenli, planlı', 'I keep my tasks organised in a simple to-do list.', 'Görevlerimi basit bir yapılacaklar listesinde düzenli tutarım.', W, ['organized']],
      ['self-motivated', 'kendi kendini motive edebilen', "I'm self-motivated and I don't need constant supervision.", 'Kendi kendimi motive ederim, sürekli denetime ihtiyacım olmaz.', W],
      ['ask for help', 'yardım istemek', "I'm not afraid to ask for help when I'm stuck.", 'Takıldığımda yardım istemekten çekinmem.'],
      ['tend to', '…e eğilimli olmak', 'I tend to spend too long on small details.', 'Küçük ayrıntılara fazla zaman harcama eğilimindeyim.'],
      ['as far as I know', 'bildiğim kadarıyla', 'As far as I know, this role needs strong communication skills.', 'Bildiğim kadarıyla bu rol güçlü iletişim becerisi gerektiriyor.', C],
      ['the thing is', 'mesele şu ki', 'The thing is, perfect code takes too much time.', 'Mesele şu ki mükemmel kod çok fazla zaman alıyor.', C],
    ],
    modelText:
      "My biggest strength is that I'm reliable. When I promise something, my teammates know it will be done. I'm also detail-oriented, and I pay attention to small things that others miss. I stay calm under pressure and I keep my tasks organised. As for my weakness, I tend to spend too long on small details. The thing is, perfect code takes a lot of time. I struggled with this in my internship, so now I set a time limit and I ask for help earlier. I'm getting better at it every month. I'd describe myself as patient and self-motivated. As far as I know, these are important qualities for this role.",
    modelSummaryTr: 'Güçlü yönler (güvenilir, detaycı, baskıya dayanıklı) ve üzerinde çalışılan zayıf yön: mükemmeliyetçilik.',
  },
  {
    id: 8,
    title: { tr: 'Hatalar ve problem çözme', en: 'Mistakes & problem solving' },
    goal: {
      tr: 'Bir hatanı ya da problemi STAR yapısıyla, dürüstçe anlatabileceksin.',
      en: 'Tell the story of a mistake or problem honestly, using STAR.',
    },
    promptId: 'star-01',
    items: [
      ['make a mistake', 'hata yapmak', 'I made a mistake in my first week.', 'İlk haftamda bir hata yaptım.', 'phrase', ['made a mistake']],
      ['realise', 'fark etmek', 'I realised the problem too late.', 'Sorunu çok geç fark ettim.', W, ['realize', 'realized']],
      ['admit', 'kabul etmek, itiraf etmek', 'I admitted my mistake to my manager.', 'Hatamı yöneticime itiraf ettim.', W, ['admitted']],
      ['root cause', 'kök neden', 'We spent a day looking for the root cause.', 'Kök nedeni aramak için bir gün harcadık.'],
      ['figure out', 'çözmek, anlamak', 'Finally, I figured out why the tests were failing.', 'Sonunda testlerin neden başarısız olduğunu çözdüm.'],
      ['prevent', 'önlemek', 'We added a check to prevent the same error.', 'Aynı hatayı önlemek için bir kontrol ekledik.', W],
      ['lesson learned', 'alınan ders', 'The lesson learned was to always back up the data.', 'Alınan ders, verileri her zaman yedeklemekti.'],
      ['handle', 'başa çıkmak, halletmek', 'I handled the situation calmly.', 'Durumu sakin bir şekilde hallettim.', W],
      ['go wrong', 'ters gitmek', 'Everything went wrong on the day of the demo.', 'Demo günü her şey ters gitti.', 'phrase', ['went wrong']],
      ['situation', 'durum (STAR: S)', 'The situation was stressful for everyone.', 'Durum herkes için stresliydi.', W],
      ['task', 'görev (STAR: T)', 'My task was to migrate the old data.', 'Görevim eski verileri taşımaktı.', W],
      ['action', 'eylem (STAR: A)', 'The first action I took was to inform the team.', 'Yaptığım ilk şey ekibi bilgilendirmekti.', W],
      ['result', 'sonuç (STAR: R)', 'The result was a 30 percent faster process.', 'Sonuç yüzde 30 daha hızlı bir süreçti.', W],
      ['after that', 'ondan sonra', 'After that, I wrote a short guide for the team.', 'Ondan sonra ekip için kısa bir kılavuz yazdım.', C],
      ['luckily', 'neyse ki', 'Luckily, we had a backup.', 'Neyse ki bir yedeğimiz vardı.', C],
    ],
    modelText:
      'Situation: during my internship, I made a mistake. I ran a script on the wrong database and deleted some test data. Task: I had to fix it before the team noticed any problems. Action: first, I admitted my mistake to my mentor. Luckily, we had a backup, so we restored everything in an hour. After that, I wanted to figure out the root cause. I realised the script didn’t show which environment it was using. To prevent the same problem, I added a warning message. Result: nothing like this went wrong again. The lesson learned was simple: always check the situation before you act, and handle mistakes honestly.',
    modelSummaryTr: 'STAR yapısında bir hata hikâyesi: yanlış veritabanı, dürüstçe kabul etmek, kök neden ve alınan ders.',
  },
  {
    id: 9,
    title: { tr: 'İş dünyası ve şirketler', en: 'Jobs & companies' },
    goal: {
      tr: 'Bir pozisyona neden başvurduğunu ve şirketten ne beklediğini anlatabileceksin.',
      en: 'Explain why you are applying for a role and what you expect from a company.',
    },
    promptId: 'int-13',
    items: [
      ['apply for', '…e başvurmak', "I'm applying for junior developer positions.", 'Junior geliştirici pozisyonlarına başvuruyorum.', 'phrase', ['applied for']],
      ['position', 'pozisyon', 'This position matches my skills.', 'Bu pozisyon becerilerime uyuyor.', W],
      ['job description', 'iş tanımı, ilan metni', 'I read the job description carefully.', 'İş tanımını dikkatlice okudum.'],
      ['requirement', 'aranan şart, gereksinim', 'One requirement is good English.', 'Aranan şartlardan biri iyi İngilizce.', W],
      ['career', 'kariyer', 'I want to build my career in telecommunications.', 'Kariyerimi telekomünikasyon alanında kurmak istiyorum.', W],
      ['opportunity', 'fırsat', 'This internship is a great opportunity for me.', 'Bu staj benim için harika bir fırsat.', W],
      ['salary', 'maaş', "Salary is important, but it's not everything.", 'Maaş önemli ama her şey değil.', W],
      ['customer', 'müşteri', 'Millions of customers use your mobile app.', 'Mobil uygulamanızı milyonlarca müşteri kullanıyor.', W],
      ['company culture', 'şirket kültürü', 'I like your company culture because it supports learning.', 'Şirket kültürünüzü seviyorum çünkü öğrenmeyi destekliyor.'],
      ['internship', 'staj', 'I did my internship at a software company.', 'Stajımı bir yazılım şirketinde yaptım.', W],
      ['hire', 'işe almak', 'Why should we hire you?', 'Sizi neden işe almalıyız?', W],
      ['work remotely', 'uzaktan çalışmak', "Some days I'd like to work remotely.", 'Bazı günler uzaktan çalışmak isterim.'],
      ['promotion', 'terfi', 'A promotion is not my main goal right now.', 'Terfi şu an ana hedefim değil.', W],
      ['as well as', '…nın yanı sıra', 'I know Java as well as Python.', "Python'ın yanı sıra Java da biliyorum.", C],
      ['because of this', 'bu nedenle', 'Because of this, I applied for this role.', 'Bu nedenle bu role başvurdum.', C],
    ],
    modelText:
      "I'm applying for the junior developer position at your company. I read the job description carefully, and I meet most of the requirements. I did my internship at a software company, where I worked with real customers as well as other developers. Your company is a great opportunity for my career, because millions of customers use your services every day. I also like your company culture, because it supports learning. Because of this, I see myself here for many years. Of course, salary is important, but a promotion is not my main goal right now. I want to learn first. Why should you hire me? Because I'm ready to learn fast. I'm happy to work in the office, but some days I'd like to work remotely.",
    modelSummaryTr: 'Junior pozisyona başvuru: iş tanımı, staj deneyimi, şirket kültürü, kariyer ve maaş.',
  },
  {
    id: 10,
    title: { tr: 'Fikir bildirmek', en: 'Giving opinions' },
    goal: {
      tr: 'Bir konuda fikrini artı ve eksileriyle, dengeli şekilde savunabileceksin.',
      en: 'Give a balanced opinion with pros, cons and a clear conclusion.',
    },
    promptId: 'op-02',
    items: [
      ['in my opinion', 'bence, bana göre', 'In my opinion, remote work is good for experienced developers.', 'Bence uzaktan çalışma deneyimli geliştiriciler için iyi.'],
      ['agree with', '…e katılmak', 'I partly agree with that idea.', 'O fikre kısmen katılıyorum.'],
      ['advantage', 'avantaj', 'The biggest advantage is flexibility.', 'En büyük avantaj esneklik.', W],
      ['disadvantage', 'dezavantaj', 'One disadvantage is that you can feel lonely.', 'Dezavantajlardan biri yalnız hissedebilmen.', W],
      ['it depends on', '…e bağlı', 'It depends on the type of job.', 'İşin türüne bağlı.', 'phrase', ['depends on']],
      ['on the one hand', 'bir yandan', 'On the one hand, AI saves time.', 'Bir yandan yapay zekâ zaman kazandırıyor.', C],
      ['however', 'ancak, fakat', 'However, it can make us lazy.', 'Ancak bizi tembelleştirebilir.', C],
      ['point out', 'belirtmek, dikkat çekmek', "I'd like to point out one more thing.", 'Bir şeye daha dikkat çekmek istiyorum.', 'phrase', ['pointed out']],
      ['benefit', 'fayda', 'Online courses have many benefits.', 'Online kursların birçok faydası var.', W],
      ['drawback', 'olumsuz yan, sakınca', 'The main drawback is the lack of feedback.', 'Asıl sakıncası geri bildirim eksikliği.', W],
      ["I'm not sure", 'emin değilim', "I'm not sure that's always true.", 'Bunun her zaman doğru olduğundan emin değilim.'],
      ['overall', 'genel olarak', "Overall, I think it's a positive change.", 'Genel olarak olumlu bir değişiklik bence.', W],
      ['convince', 'ikna etmek', "It's not easy to convince me without data.", 'Veri olmadan beni ikna etmek kolay değil.', W],
      ['to sum up', 'özetle', 'To sum up, both options have pros and cons.', 'Özetle, iki seçeneğin de artıları ve eksileri var.', C],
      ['for instance', 'örneğin', 'For instance, many startups work fully remotely.', 'Örneğin birçok girişim tamamen uzaktan çalışıyor.', C],
    ],
    modelText:
      "Is AI good for junior developers? In my opinion, it depends on how you use it. On the one hand, AI tools have clear benefits. For instance, they explain code and save a lot of time. That's a big advantage when you're stuck. However, there is also a serious drawback. If you copy answers without understanding them, you don't really learn. I'd like to point out that companies still test our fundamentals in interviews. Some people say AI will replace junior developers, but I'm not sure I agree with that. It's hard to convince me without real data. Overall, I think AI is a great assistant, not a replacement. To sum up, the disadvantage is real, but we can manage it.",
    modelSummaryTr: 'Yapay zekâ junior geliştiriciler için iyi mi? Faydalar, sakıncalar ve dengeli bir sonuç.',
  },
  {
    id: 11,
    title: { tr: 'Hedefler ve gelecek', en: 'Goals & the future' },
    goal: {
      tr: 'Kısa ve uzun vadeli hedeflerini net ve inandırıcı şekilde anlatabileceksin.',
      en: 'Present your short- and long-term goals clearly and convincingly.',
    },
    promptId: 'int-16',
    items: [
      ['plan to', '…meyi planlamak', "I'm planning to get a cloud certificate.", 'Bir bulut sertifikası almayı planlıyorum.', 'phrase', ['planning to', 'planned to']],
      ['in five years', 'beş yıl içinde', 'In five years, I see myself as a senior engineer.', 'Beş yıl içinde kendimi kıdemli bir mühendis olarak görüyorum.'],
      ['achieve', 'başarmak, ulaşmak', 'I want to achieve this goal step by step.', 'Bu hedefe adım adım ulaşmak istiyorum.', W],
      ['long-term', 'uzun vadeli', 'My long-term goal is to lead a small team.', 'Uzun vadeli hedefim küçük bir ekibi yönetmek.', W],
      ['develop my skills', 'becerilerimi geliştirmek', 'I want to develop my skills in cloud computing.', 'Bulut bilişimde becerilerimi geliştirmek istiyorum.'],
      ['grow', 'büyümek, gelişmek', 'I want to grow with the company.', 'Şirketle birlikte büyümek istiyorum.', W, ['grew']],
      ['focus on', '…e odaklanmak', 'Right now I want to focus on backend development.', "Şu an backend geliştirmeye odaklanmak istiyorum.", 'phrase', ['focused on']],
      ['become', '…olmak (dönüşmek)', "I'd like to become an expert in data engineering.", 'Veri mühendisliğinde uzman olmak isterim.', W, ['became']],
      ['look forward to', 'dört gözle beklemek', 'I look forward to working with experienced engineers.', 'Deneyimli mühendislerle çalışmayı dört gözle bekliyorum.'],
      ['dream job', 'hayalimdeki iş', 'My dream job is to work on systems that millions of people use.', 'Hayalimdeki iş, milyonlarca insanın kullandığı sistemler üzerinde çalışmak.'],
      ['certificate', 'sertifika', "I'm studying for a cloud certificate.", 'Bir bulut sertifikası için çalışıyorum.', W],
      ['lead', 'yönetmek, liderlik etmek', "One day I'd like to lead a team.", 'Bir gün bir ekibi yönetmek isterim.', W, ['led']],
      ['make progress', 'ilerleme kaydetmek', "I make progress every week, even if it's slow.", 'Yavaş olsa da her hafta ilerleme kaydediyorum.', 'phrase', ['made progress']],
      ['eventually', 'nihayetinde, zamanla', "Eventually, I'd like to mentor new developers.", 'Zamanla yeni geliştiricilere mentorluk yapmak isterim.', C],
      ['in the meantime', 'bu arada, o zamana kadar', "In the meantime, I'm practising my English every day.", 'Bu arada her gün İngilizce pratik yapıyorum.', C],
    ],
    modelText:
      "In five years, I see myself as a strong backend engineer. Right now, I want to focus on cloud technologies, so I'm planning to get a certificate this year. My long-term goal is to lead a small team. To achieve that, I need to develop my skills in system design and communication. I look forward to working with experienced engineers, because I want to grow with the company. My dream job is to work on systems that millions of people use. I know it will take time, but I make progress every week. In the meantime, I'm practising my English every day. Eventually, I'd like to become a mentor for new developers.",
    modelSummaryTr: 'Beş yıllık plan: bulut sertifikası, ekip liderliği, becerileri geliştirmek ve mentor olmak.',
  },
  {
    id: 12,
    title: { tr: 'Mülakat dili', en: 'Interview language' },
    goal: {
      tr: 'Mülakatta zaman kazanmayı, örnek vermeyi ve sonunda soru sormayı öğreneceksin.',
      en: 'Learn to buy time, give examples and ask good questions in an interview.',
    },
    promptId: 'int-17',
    items: [
      ['thank you for', '…için teşekkürler', 'Thank you for inviting me today.', 'Bugün beni davet ettiğiniz için teşekkürler.'],
      ['could you repeat', 'tekrar eder misiniz', 'Sorry, could you repeat the question?', 'Pardon, soruyu tekrar eder misiniz?'],
      ['let me think', 'bir düşüneyim', "That's interesting. Let me think for a second.", 'İlginç. Bir saniye düşüneyim.'],
      ["that's a good question", 'güzel bir soru', "That's a good question, and I'd like to answer it honestly.", 'Güzel bir soru, dürüstçe cevaplamak isterim.'],
      ['as I mentioned', 'bahsettiğim gibi', 'As I mentioned, I worked with Docker in my internship.', "Bahsettiğim gibi stajımda Docker ile çalıştım."],
      ['to give you an example', 'size bir örnek vermem gerekirse', 'To give you an example, I reduced the build time by half.', 'Bir örnek vermem gerekirse, derleme süresini yarıya indirdim.'],
      ["I'm not familiar with", '…e aşina değilim', "I'm not familiar with Kotlin, but I learn quickly.", "Kotlin'e aşina değilim ama hızlı öğrenirim."],
      ["I'd be happy to", 'memnuniyetle …rim', "I'd be happy to show you my GitHub projects.", 'GitHub projelerimi size memnuniyetle gösteririm.'],
      ['in addition', 'ek olarak, buna ek olarak', 'In addition, I have a cloud certificate.', 'Buna ek olarak bir bulut sertifikam var.', C],
      ['what does success look like', 'başarı nasıl görünür', 'What does success look like in this role?', 'Bu rolde başarı nasıl görünüyor?'],
      ['next steps', 'sonraki adımlar', 'Could you tell me about the next steps?', 'Sonraki adımlardan bahseder misiniz?'],
      ['contribute to', '…e katkı sağlamak', 'I believe I can contribute to your mobile team.', 'Mobil ekibinize katkı sağlayabileceğime inanıyorum.', 'phrase', ['contributed to']],
      ['a good fit', 'uygun biri, iyi bir uyum', "I think I'm a good fit for this role.", 'Bu role uygun biri olduğumu düşünüyorum.'],
      ['to put it simply', 'basitçe söylemek gerekirse', 'To put it simply, I enjoy solving problems.', 'Basitçe söylemek gerekirse problem çözmeyi seviyorum.', C],
      ['get back to me', 'bana dönüş yapmak', 'When can I expect you to get back to me?', 'Bana ne zaman dönüş yapmanızı bekleyebilirim?'],
    ],
    modelText:
      "Thank you for inviting me today. That's a good question. Let me think for a second. As I mentioned, I worked with Docker during my internship. To give you an example, I reduced our test setup time from one hour to ten minutes. I'm not familiar with Kubernetes yet, but I'd be happy to learn it. In addition, I have strong communication skills. To put it simply, I think I'm a good fit for this role, and I believe I can contribute to your team. I have two questions: what does success look like in the first year, and could you tell me about the next steps? Sorry, could you repeat the last part? And when can I expect you to get back to me?",
    modelSummaryTr: 'Gerçek bir mülakattan kesitler: zaman kazanmak, örnek vermek, bilmediğini kabul etmek ve sonda soru sormak.',
  },
]

export const UNITS: Unit[] = RAW_UNITS.map(build)

export const UNITS_BY_ID: ReadonlyMap<number, Unit> = new Map(UNITS.map((u) => [u.id, u]))

export const ALL_ITEMS: VocabItem[] = UNITS.flatMap((u) => u.items)

export const ITEMS_BY_ID: ReadonlyMap<string, VocabItem> = new Map(ALL_ITEMS.map((i) => [i.id, i]))
