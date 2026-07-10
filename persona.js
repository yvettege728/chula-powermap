/* ==============================================================
   persona.js · Persona picker → Lanyard → Story → Outcome
   Real history (2020-2023), 122M baht civil claim
   ============================================================== */

const PERSONAS = [
  {
    id: "som", seedKey: 1,
    name: "Som", cn: "颂阿姨", th: "ป้าสม",
    age: 67, role: "Block resident · keeps the morning altar",
    origin: "Third-generation · grandparents arrived 1923",
    home: "Block 33, Sam Yan",
    work: "Daily incense, festival meals, tea offerings",
    relation: "Her grandmother helped rebuild the shrine after the 1960 fire. She has lived 100m from the altar her entire life.",
    bio: "You are 67. Your hands know the smell of incense before they know the rest of the world. The letter on the altar table has been sitting there for three weeks."
  },
  {
    id: "chai", seedKey: 5,
    name: "Chai", cn: "猜叔", th: "ลุงชัย",
    age: 58, role: "Tea-stall operator · rents from the same landlord",
    origin: "Second-generation",
    home: "Adjacent block",
    work: "Tea stall · displaced once already in 2008",
    relation: "Lost his original shop in the 2008 clearance for what would become Samyan Mitrtown.",
    bio: "You've been displaced once. You know how it goes. You know which letter is the polite one and which is the last."
  },
  {
    id: "wan", seedKey: 11,
    name: "Wan", cn: "万姐", th: "คุณวรรณ",
    age: 43, role: "Office worker · community liaison on weekends",
    origin: "Third-generation",
    home: "Two houses from the altar",
    work: "Office work in Silom · trilingual",
    relation: "Speaks Mandarin, Teochew, and Thai. Holds the phone numbers of every household on the block.",
    bio: "You did not ask to be on a lawsuit. You organized one meeting. Now you carry a number — 122 million baht — that you cannot put down."
  },
  {
    id: "ploy", seedKey: 17,
    name: "Ploy", cn: "普洛", th: "พลอย",
    age: 31, role: "Junior officer · street-level property administration",
    origin: "Bangkok-born · CU alumna 2014",
    home: "Phaya Thai apartment, 30 min commute",
    work: "Mid-tier desk · processes lease renewals on a weekly cycle",
    relation: "Block 33 is one of forty-seven files on her desk. She has never been inside the shrine.",
    bio: "You are good at your job. You arrive at 8:42. You sign sixteen documents before lunch. The system runs through you. You did not design it."
  },
  {
    id: "anong", seedKey: 23,
    name: "Anong", cn: "安农", th: "อนงค์",
    age: 49, role: "Mid-level office · drafts the master plan language",
    origin: "Civil engineer · MA from Tokyo",
    home: "Sukhumvit condo",
    work: "Strategic framework documents · Smart City team",
    relation: "She has never written the word 'shrine' in any document. She writes 'cultural heritage zone' instead.",
    bio: "You write in passive voice. Your superiors approve. Your subordinates implement. The shrine appears in your documents only as a coordinate."
  },
  {
    id: "preecha", seedKey: 29,
    name: "Preecha", cn: "丕察", th: "ปรีชา",
    age: 56, role: "Senior legal officer · civil litigation portfolio",
    origin: "Thammasat law school 1992",
    home: "Ari, large house",
    work: "Drafted the 122 million baht damages claim",
    relation: "He has met no one from Block 33. The file references them only by ID number.",
    bio: "You wrote the number. You did not invent it; the methodology is standard. Each day of continued occupation produces a calculable loss. You are correct. You are not wrong. You are also the author of an unpayable debt."
  },
  {
    id: "tul", seedKey: 35,
    name: "Tul", cn: "图尔", th: "ตุล",
    age: 24, role: "Student · organises off-campus campaigns",
    origin: "First-generation university student",
    home: "Shared room near Hua Lamphong",
    work: "Independent journalism, student union, threatened with disciplinary action twice",
    relation: "He knows the shrine's caretakers by name. He has slept on the temple step.",
    bio: "You are 24. You sleep on the temple step three nights a week. You know that Scala fell, that Sam Yan Market fell, that being right is not the same as winning."
  },
  {
    id: "mai", seedKey: 41,
    name: "Mai", cn: "梅律师", th: "ทนายมาย",
    age: 38, role: "Heritage lawyer · works pro bono after hours",
    origin: "Chinese-Thai family · Yaowarat",
    home: "Hua Lamphong rental",
    work: "Day job at corporate firm · evenings on the shrine case",
    relation: "She represents the defendants for no fee. She watched Scala fall in 2021 and refused to watch it twice.",
    bio: "Your firm does not know how late you stay. You file each motion under your own name. You are good at this. You are also tired in a way no sleep fixes."
  },
  {
    id: "abby", seedKey: 47,
    name: "Abby", cn: "艾比", th: "แอบบี้",
    age: 35, role: "Foreign correspondent · arrived three months ago",
    origin: "Australian-born · Thai-language degree",
    home: "Thonglor, on assignment",
    work: "Architecture press · ASLA Awards beat",
    relation: "She came to write a feature on Centenary Park's award. She is now writing a different piece.",
    bio: "You arrived for one story. You found another. The shrine is two blocks from the park you came to praise."
  }
];

const LANGS = ["en", "zh", "th"];
let currentLang = localStorage.getItem("personaLang") || "en";
if (!LANGS.includes(currentLang)) currentLang = "en";

const UI_TEXT = {
  en: {
    metaBack: "← Back to archive",
    metaTitle: "§ Personal experience",
    metaJourneyLabel: "walking as",
    pickerEyebrow: "Choose a character to walk their experience",
    pickerTitleHtml: "Every <em>statistic</em><br>was a <em>somebody</em>.",
    pickerSubtitle: "Every person has a singular story.",
    pickerLead: "Press draw. The archive hands you a name, an age, a livelihood — <strong>not</strong> which side of this block you stand on. <em>That, you find out by walking.</em>",
    portraitLabelHtml: "The block has <em>faces</em>.",
    portraitCount: "96 faces · 9 with named paths · the draw chooses one",
    pickCtaTitle: "Walk the <em>experience</em>.",
    pickCtaBody: "The archive will assign you a position you might not have chosen. This is what fieldwork actually feels like.",
    randomPickBtn: "Draw a capsule",
    capsuleMetaScan: "§ scanning the block",
    capsuleMetaDecide: "§ the draw is deciding",
    capsuleMetaAssigned: "§ a name is assigned",
    capsuleDrop: "a capsule drops…",
    capsuleWho: "who will it be…",
    lanyardMetaTop: "§ A NAME HAS DROPPED",
    redrawTitle: "Draw another",
    lanyardBgMain: "drag the card, then step in",
    lanyardBgSub: "",
    lanyardBgFine: "",
    lanyardDragHint: "§ drag the card, then step in",
    dossierKicker: "§ who you'll walk as",
    dossierFoot: "[ composite character · based on community testimony ]",
    stepInBtn: "Step in",
    storyPathPrefix: "§ Path · Step",
    storyAsLabel: "walking as",
    storyBackBtn: "← back to picker",
    outcomeNum: "§ Outcome",
    outcomeTagText: "Your path is over · See what it reveals",
    outcomePathLabel: "In your path",
    outcomeChoiceSource: "From your choices",
    outcomeRealLabel: "In the real archive",
    outcomeMechanismLabel: "§ Mechanism revealed",
    outcomeClosingHtml: "This is not a game about win. It is a game to <em>reveal</em>.",
    outcomeRedrawBtn: "Walk another character",
    outcomeBackArchive: "← Back to archive",
    rows: { age: "AGE", role: "ROLE", origin: "ORIGIN", home: "HOME", work: "WORK", tie: "TIE" }
  },
  zh: {
    metaBack: "← 返回档案",
    metaTitle: "§ 个人经历",
    metaJourneyLabel: "扮演",
    pickerEyebrow: "选择一个人物了解ta的经历",
    pickerTitleHtml: "每一个<em>统计数字</em><br>都曾是<em>某个人</em>。",
    pickerSubtitle: "每个人都有独特的故事。",
    pickerLead: "按下抽取。档案会交给你一个名字、一个年龄、一份生计——<strong>但不会告诉你</strong>你站在这个街区的哪一侧。<em>那要由你走进去才知道。</em>",
    portraitLabelHtml: "这个街区有<em>面孔</em>。",
    portraitCount: "96 张面孔 · 9 条具名路径 · 抽取将选择其中一个",
    pickCtaTitle: "走入这段<em>经历</em>。",
    pickCtaBody: "档案会指派给你一个你也许不会主动选择的位置。这正是田野工作真实的感受。",
    randomPickBtn: "抽一个人物",
    capsuleMetaScan: "§ 正在检索街区",
    capsuleMetaDecide: "§ 抽取正在决定",
    capsuleMetaAssigned: "§ 身份已指派",
    capsuleDrop: "扭蛋落下……",
    capsuleWho: "会是谁……",
    lanyardMetaTop: "§ 身份卡掉落",
    redrawTitle: "再抽一次",
    lanyardBgMain: "拖动卡片进入故事",
    lanyardBgSub: "",
    lanyardBgFine: "",
    lanyardDragHint: "§ 拖动卡片进入故事",
    dossierKicker: "§ 你将成为",
    dossierFoot: "[ 合成人物 · 基于社区证词 ]",
    stepInBtn: "步入",
    storyPathPrefix: "§ 路径 · 第",
    storyAsLabel: "扮演",
    storyBackBtn: "← 返回选择器",
    outcomeNum: "§ 结局",
    outcomeTagText: "你的路径已结束 · 看看它揭示了什么",
    outcomePathLabel: "在你的路径中",
    outcomeChoiceSource: "来自你的选择",
    outcomeRealLabel: "在真实档案中",
    outcomeMechanismLabel: "§ 揭示的机制",
    outcomeClosingHtml: "这不是一场关于输赢的游戏。它是一场为了<em>揭示</em>的游戏。",
    outcomeRedrawBtn: "选择另一个人物",
    outcomeBackArchive: "← 返回档案",
    rows: { age: "年龄", role: "角色", origin: "来源", home: "住所", work: "工作", tie: "关联" }
  },
  th: {
    metaBack: "← กลับสู่คลัง",
    metaTitle: "§ ประสบการณ์ส่วนบุคคล",
    metaJourneyLabel: "กำลังสวมบทบาทเป็น",
    pickerEyebrow: "เลือกตัวละครเพื่อเดินผ่านประสบการณ์ของเขา/เธอ",
    pickerTitleHtml: "ทุก<em>สถิติ</em><br>เคยเป็น<em>ใครบางคน</em>.",
    pickerSubtitle: "ทุกคนมีเรื่องราวเฉพาะของตนเอง",
    pickerLead: "กดสุ่ม คลังจะมอบชื่อ อายุ และอาชีพให้คุณ — <strong>แต่ไม่บอก</strong>ว่าคุณยืนอยู่ฝั่งไหนของบล็อกนี้ <em>คุณจะพบคำตอบเมื่อเดินเข้าไป</em>",
    portraitLabelHtml: "บล็อกนี้มี<em>ใบหน้า</em>.",
    portraitCount: "96 ใบหน้า · 9 เส้นทางที่มีชื่อ · การสุ่มเลือกหนึ่งคน",
    pickCtaTitle: "เดินเข้าสู่<em>ประสบการณ์</em>.",
    pickCtaBody: "คลังจะมอบตำแหน่งหนึ่งให้คุณ ซึ่งอาจไม่ใช่ตำแหน่งที่คุณเลือกเอง นี่คือความรู้สึกของภาคสนามจริง ๆ",
    randomPickBtn: "สุ่มแคปซูล",
    capsuleMetaScan: "§ กำลังสแกนบล็อก",
    capsuleMetaDecide: "§ การสุ่มกำลังตัดสิน",
    capsuleMetaAssigned: "§ ชื่อถูกกำหนดแล้ว",
    capsuleDrop: "แคปซูลตกลงมา…",
    capsuleWho: "จะเป็นใคร…",
    lanyardMetaTop: "§ บัตรชื่อหล่นลงมา",
    redrawTitle: "สุ่มอีกครั้ง",
    lanyardBgMain: "ลากบัตร แล้วก้าวเข้าไป",
    lanyardBgSub: "",
    lanyardBgFine: "",
    lanyardDragHint: "§ ลากบัตร แล้วก้าวเข้าไป",
    dossierKicker: "§ คนที่คุณจะสวมบทบาทเป็น",
    dossierFoot: "[ ตัวละครสังเคราะห์ · อ้างอิงจากคำบอกเล่าของชุมชน ]",
    stepInBtn: "ก้าวเข้าไป",
    storyPathPrefix: "§ เส้นทาง · ขั้นที่",
    storyAsLabel: "สวมบทบาทเป็น",
    storyBackBtn: "← กลับไปเลือก",
    outcomeNum: "§ บทสรุป",
    outcomeTagText: "เส้นทางของคุณจบลงแล้ว · ดูว่ามันเผยอะไร",
    outcomePathLabel: "ในเส้นทางของคุณ",
    outcomeChoiceSource: "จากทางเลือกของคุณ",
    outcomeRealLabel: "ในคลังจริง",
    outcomeMechanismLabel: "§ กลไกที่ถูกเผย",
    outcomeClosingHtml: "นี่ไม่ใช่เกมว่าด้วยการชนะ แต่เป็นเกมเพื่อ<em>เผยให้เห็น</em>.",
    outcomeRedrawBtn: "เดินเป็นตัวละครอื่น",
    outcomeBackArchive: "← กลับสู่คลัง",
    rows: { age: "อายุ", role: "บทบาท", origin: "ที่มา", home: "บ้าน", work: "งาน", tie: "ความเชื่อมโยง" }
  }
};

const PERSONA_I18N = {
  som: {
    en: { name: "Som", role: "Block resident", origin: "Third-generation · grandparents arrived 1923", home: "Block 33, Sam Yan", work: "Daily incense, festival meals, tea offerings", relation: "Her grandmother helped rebuild the shrine after the 1960 fire. She has lived 100m from the altar her entire life.", bio: "You are 67. Your hands know the smell of incense before they know the rest of the world. The letter on the altar table has been sitting there for three weeks." },
    zh: { name: "颂阿姨", role: "街区居民", origin: "第三代 · 祖父母于 1923 年抵达", home: "33 街区，三燕", work: "每日上香、节日餐食、奉茶", relation: "她的祖母曾在 1960 年火灾后帮助重建神庙。她一生都住在距神龛 100 米的地方。", bio: "你 67 岁。你的双手在认识世界之前，先认识了香的气味。神龛桌上的那封信，已经放了三个星期。" },
    th: { name: "ป้าสม", role: "ผู้อยู่อาศัยในบล็อก", origin: "รุ่นที่สาม · ปู่ย่าตายายมาถึงปี 1923", home: "บล็อก 33 สามย่าน", work: "จุดธูปทุกวัน ทำอาหารในงานเทศกาล ถวายน้ำชา", relation: "ยายของเธอช่วยบูรณะศาลเจ้าหลังไฟไหม้ปี 1960 เธออาศัยอยู่ห่างจากแท่นบูชาเพียง 100 เมตรมาตลอดชีวิต", bio: "คุณอายุ 67 ปี มือของคุณรู้จักกลิ่นธูปก่อนจะรู้จักสิ่งอื่นใดในโลก จดหมายบนโต๊ะแท่นบูชาวางอยู่ตรงนั้นมาสามสัปดาห์แล้ว" }
  },
  chai: {
    en: { name: "Chai", role: "Tea-stall operator · rents from the same landlord", relation: "Lost his original shop in the 2008 clearance for what would become Samyan Mitrtown.", bio: "You've been displaced once. You know how it goes. You know which letter is the polite one and which is the last." },
    zh: { name: "猜叔", role: "茶摊摊主 · 向房东租赁", origin: "第二代", home: "邻近街区", work: "茶摊 · 已在 2008 年被迫迁过一次", relation: "他在 2008 年那场为后来的三聚同心商城而进行的清拆中，失去了自己原来的店铺。", bio: "你已经被迫迁过一次。你知道事情会怎样发展。你分得清哪封信是客气的，哪封是最后通牒。" },
    th: { name: "ลุงชัย", role: "เจ้าของแผงน้ำชา · เช่าจากเจ้าของที่ดินรายเดียวกัน", origin: "รุ่นที่สอง", home: "บล็อกข้างเคียง", work: "แผงน้ำชา · เคยถูกไล่ที่มาแล้วครั้งหนึ่งในปี 2008", relation: "เขาสูญเสียร้านเดิมไปในการรื้อถอนปี 2008 เพื่อเปิดทางให้สิ่งที่ต่อมากลายเป็นสามย่านมิตรทาวน์", bio: "คุณเคยถูกไล่ที่มาแล้วครั้งหนึ่ง คุณรู้ว่ามันเป็นอย่างไร คุณรู้ว่าจดหมายฉบับไหนคือฉบับสุภาพ และฉบับไหนคือฉบับสุดท้าย" }
  },
  wan: {
    en: { name: "Wan", role: "Office worker · community liaison on weekends", relation: "Speaks Mandarin, Teochew, and Thai. Holds the phone numbers of every household on the block.", bio: "You did not ask to be on a lawsuit. You organized one meeting. Now you carry a number — 122 million baht — that you cannot put down." },
    zh: { name: "万姐", role: "上班族 · 周末担任社区联络人", origin: "第三代", home: "离神龛两户人家", work: "在是隆上班 · 三语者", relation: "会说普通话、潮州话和泰语。她保存着街区里每一户人家的电话号码。", bio: "你并没有要求被卷进一场诉讼。你只是组织了一次会议。如今你背负着一个数字——一亿两千两百万泰铢——再也放不下。" },
    th: { name: "คุณวรรณ", role: "พนักงานออฟฟิศ · ผู้ประสานงานชุมชนในวันหยุด", origin: "รุ่นที่สาม", home: "ห่างจากแท่นบูชาสองหลัง", work: "งานออฟฟิศที่สีลม · พูดได้สามภาษา", relation: "พูดภาษาจีนกลาง แต้จิ๋ว และไทย เธอมีเบอร์โทรของทุกครัวเรือนในบล็อกนี้", bio: "คุณไม่ได้ขอให้ตัวเองตกเป็นจำเลย คุณแค่จัดการประชุมครั้งหนึ่ง ตอนนี้คุณกลับต้องแบกตัวเลข — 122 ล้านบาท — ที่วางลงไม่ได้" }
  },
  ploy: {
    en: { name: "Ploy", role: "Junior officer · street-level property administration", relation: "Block 33 is one of forty-seven files on her desk. She has never been inside the shrine.", bio: "You are good at your job. You arrive at 8:42. You sign sixteen documents before lunch. The system runs through you. You did not design it." },
    zh: { name: "普洛", role: "初级职员 · 基层物业管理", origin: "曼谷出生 · 朱拉 2014 届校友", home: "帕亚泰公寓，通勤 30 分钟", work: "中层办公桌 · 每周处理租约续签", relation: "33 街区只是她桌上四十七个案卷中的一个。她从未走进过那座庙。", bio: "你很擅长你的工作。你 8:42 到岗。午饭前你要签十六份文件。系统通过你运转。但系统不是你设计的。" },
    th: { name: "พลอย", role: "เจ้าหน้าที่ระดับต้น · งานบริหารทรัพย์สินระดับปฏิบัติการ", origin: "เกิดในกรุงเทพฯ · ศิษย์เก่าจุฬาฯ ปี 2014", home: "อพาร์ตเมนต์พญาไท เดินทาง 30 นาที", work: "โต๊ะงานระดับกลาง · จัดการต่อสัญญาเช่ารายสัปดาห์", relation: "บล็อก 33 เป็นเพียงหนึ่งในสี่สิบเจ็ดแฟ้มบนโต๊ะของเธอ เธอไม่เคยเข้าไปในศาลเจ้าเลย", bio: "คุณทำงานเก่ง คุณมาถึงเวลา 8:42 น. คุณเซ็นเอกสารสิบหกฉบับก่อนมื้อกลางวัน ระบบเดินผ่านมือคุณ แต่คุณไม่ใช่คนออกแบบมัน" }
  },
  anong: {
    en: { name: "Anong", role: "Mid-level office · drafts the master plan language", relation: "She has never written the word 'shrine' in any document. She writes 'cultural heritage zone' instead.", bio: "You write in passive voice. Your superiors approve. Your subordinates implement. The shrine appears in your documents only as a coordinate." },
    zh: { name: "安农", role: "中层职员 · 起草总体规划的措辞", origin: "土木工程师 · 东京硕士", home: "素坤逸公寓", work: "战略框架文件 · 智慧城市团队", relation: "她从未在任何文件里写过“庙”这个字。她写的是“文化遗产区”。", bio: "你用被动语态书写。上级批准，下级执行。在你的文件里，那座庙只是一个坐标。" },
    th: { name: "อนงค์", role: "เจ้าหน้าที่ระดับกลาง · ร่างถ้อยคำของแผนแม่บท", origin: "วิศวกรโยธา · ปริญญาโทจากโตเกียว", home: "คอนโดสุขุมวิท", work: "เอกสารกรอบยุทธศาสตร์ · ทีมสมาร์ตซิตี้", relation: "เธอไม่เคยเขียนคำว่า ‘ศาลเจ้า’ ในเอกสารใดเลย เธอเขียนว่า ‘เขตมรดกทางวัฒนธรรม’ แทน", bio: "คุณเขียนด้วยประโยคกรรมวาจก ผู้บังคับบัญชาอนุมัติ ผู้ใต้บังคับบัญชาดำเนินการ ศาลเจ้าปรากฏในเอกสารของคุณเพียงในฐานะพิกัดหนึ่งเท่านั้น" }
  },
  preecha: {
    en: { name: "Preecha", role: "Senior legal officer · civil litigation portfolio", relation: "He has met no one from Block 33. The file references them only by ID number.", bio: "You wrote the number. You did not invent it; the methodology is standard. Each day of continued occupation produces a calculable loss. You are correct. You are not wrong. You are also the author of an unpayable debt." },
    zh: { name: "丕察", role: "高级法务 · 负责民事诉讼", origin: "法政大学法学院 1992 届", home: "阿里区，大宅", work: "起草一亿两千两百万泰铢赔偿索赔", relation: "他没见过 33 街区的任何人。案卷里只用身份证号码来指称他们。", bio: "那个数字是你写下的。你并没有凭空捏造；计算方法是标准的。继续占用的每一天都产生可计算的损失。你没有做错什么，但你同时也是一笔无法偿还的债务的作者。" },
    th: { name: "ปรีชา", role: "นิติกรอาวุโส · ดูแลคดีแพ่ง", origin: "คณะนิติศาสตร์ ธรรมศาสตร์ รุ่น 1992", home: "บ้านหลังใหญ่ย่านอารีย์", work: "ร่างคำฟ้องเรียกค่าเสียหาย 122 ล้านบาท", relation: "เขาไม่เคยพบใครจากบล็อก 33 เลย แฟ้มคดีอ้างถึงพวกเขาด้วยเลขประจำตัวเท่านั้น", bio: "ตัวเลขนั้นคุณเป็นคนเขียน คุณไม่ได้คิดมันขึ้นเอง วิธีคำนวณเป็นมาตรฐาน ทุกวันที่ยังครอบครองอยู่ก่อให้เกิดความเสียหายที่คำนวณได้ คุณถูกต้อง คุณไม่ได้ผิด แต่คุณก็เป็นผู้เขียนหนี้ที่ไม่มีวันชำระได้เช่นกัน" }
  },
  tul: {
    en: { name: "Tul", role: "Student · organises off-campus campaigns", relation: "He knows the shrine's caretakers by name. He has slept on the temple step.", bio: "You are 24. You sleep on the temple step three nights a week. You know that Scala fell, that Sam Yan Market fell, that being right is not the same as winning." },
    zh: { name: "图尔", role: "学生 · 组织校外行动", origin: "第一代大学生", home: "华南蓬附近合租房", work: "独立新闻、学生会，曾两次受到纪律处分威胁", relation: "他能叫出庙里看护者的名字。他曾睡在庙宇的台阶上。", bio: "你 24 岁。你每周有三晚睡在庙宇的台阶上。你知道斯卡拉倒下了，三聚市场倒下了，知道有理并不等于会赢。" },
    th: { name: "ตุล", role: "นักศึกษา · จัดการรณรงค์นอกมหาวิทยาลัย", origin: "นักศึกษามหาวิทยาลัยรุ่นแรกของครอบครัว", home: "ห้องเช่าใกล้หัวลำโพง", work: "สื่ออิสระ สหภาพนักศึกษา เคยถูกขู่ดำเนินวินัยสองครั้ง", relation: "เขารู้จักผู้ดูแลศาลเจ้าเป็นรายชื่อ เขาเคยนอนบนขั้นบันไดศาลเจ้า", bio: "คุณอายุ 24 ปี คุณนอนบนขั้นบันไดศาลเจ้าสัปดาห์ละสามคืน คุณรู้ว่าสกาลาล่มไปแล้ว ตลาดสามย่านล่มไปแล้ว และการเป็นฝ่ายถูกไม่เหมือนกับการเป็นฝ่ายชนะ" }
  },
  mai: {
    en: { name: "Mai", role: "Heritage lawyer · works pro bono after hours", relation: "She represents the defendants for no fee. She watched Scala fall in 2021 and refused to watch it twice.", bio: "Your firm does not know how late you stay. You file each motion under your own name. You are good at this. You are also tired in a way no sleep fixes." },
    zh: { name: "梅律师", role: "文化遗产律师 · 下班后无偿办案", origin: "泰华家庭 · 耀华力", home: "华南蓬租屋", work: "白天在企业律所 · 晚上处理神庙案件", relation: "她无偿代理被告。她在 2021 年眼看着斯卡拉倒下，拒绝再目睹第二次。", bio: "你的律所不知道你熬到多晚。每一份动议你都以自己的名义递交。你很擅长这件事。你也疲惫到任何睡眠都无法修复。" },
    th: { name: "ทนายมาย", role: "ทนายด้านมรดกวัฒนธรรม · ว่าความโดยไม่คิดค่าจ้างนอกเวลางาน", origin: "ครอบครัวไทยเชื้อสายจีน · เยาวราช", home: "ห้องเช่าหัวลำโพง", work: "งานประจำที่สำนักงานกฎหมายธุรกิจ · ตอนเย็นทำคดีศาลเจ้า", relation: "เธอว่าความให้จำเลยโดยไม่คิดค่าจ้าง เธอเฝ้าดูสกาลาล่มในปี 2021 และปฏิเสธที่จะเห็นมันเกิดขึ้นอีกเป็นครั้งที่สอง", bio: "สำนักงานของคุณไม่รู้ว่าคุณอยู่ดึกแค่ไหน คุณยื่นคำร้องทุกฉบับในนามของตัวเอง คุณเก่งในเรื่องนี้ และคุณก็เหนื่อยล้าในแบบที่การนอนเท่าไรก็ไม่หาย" }
  },
  abby: {
    en: { name: "Abby", role: "Foreign correspondent · arrived three months ago", relation: "She came to write a feature on Centenary Park's award. She is now writing a different piece.", bio: "You arrived for one story. You found another. The shrine is two blocks from the park you came to praise." },
    zh: { name: "Abby", role: "外国记者 · 三个月前抵达", origin: "澳大利亚出生 · 泰语学位", home: "通罗，外派中", work: "建筑媒体 · ASLA 奖项报道线", relation: "她本是来写一篇关于百年纪念公园获奖的特稿。如今她在写另一篇报道。", bio: "你为一个故事而来，却发现了另一个。那座庙，离你前来赞美的公园只有两个街区。" },
    th: { name: "แอบบี้", role: "ผู้สื่อข่าวต่างประเทศ · เพิ่งมาถึงเมื่อสามเดือนก่อน", origin: "เกิดในออสเตรเลีย · จบด้านภาษาไทย", home: "ทองหล่อ ระหว่างปฏิบัติงาน", work: "สื่อสถาปัตยกรรม · สายข่าวรางวัล ASLA", relation: "เธอมาเพื่อเขียนสารคดีเกี่ยวกับรางวัลของอุทยาน 100 ปี ตอนนี้เธอกำลังเขียนเรื่องที่ต่างออกไป", bio: "คุณมาเพื่อเรื่องหนึ่ง แต่กลับพบอีกเรื่อง ศาลเจ้าอยู่ห่างจากอุทยานที่คุณตั้งใจมาชื่นชมเพียงสองบล็อก" }
  }
};

const STORY_I18N = {
  s1: {
    en: { scene: "Scene 01 · June 2020 · A Tuesday morning", prompt: "A letter arrives, on PMCU letterhead, in legal language. <em>An eviction order. You have been notified to vacate.</em>", sub: "What do you do first?", choices: [
      { text: "Walk into the shrine and light incense. You decide nothing today.", meta: "Time gained: 0 days · Cost: silence" },
      { text: "Take the train to the Association of Siamese Architects. Someone there might help.", meta: "Time gained: weeks · Cost: visibility" },
      { text: "Call family. Ask them to come this weekend. You need someone with a stable salary nearby.", meta: "Time gained: indefinite · Cost: family burden" }
    ] },
    zh: { scene: "场景 01 · 2020 年 6 月 · 一个周二的清晨", prompt: "一封信寄到了，印着 PMCU 的抬头，用着法律措辞。<em>一纸驱逐令。你已被通知腾退。</em>", sub: "你首先做什么？", choices: [
      { text: "走进庙里，点上一炷香。今天你什么都不决定。", meta: "争取到的时间：0 天 · 代价：沉默" },
      { text: "坐火车去暹罗建筑师协会。那里也许有人能帮忙。", meta: "争取到的时间：数周 · 代价：暴露" },
      { text: "给家人打电话。让他们这个周末过来。你需要身边有个收入稳定的人。", meta: "争取到的时间：无限期 · 代价：家庭负担" }
    ] },
    th: { scene: "ฉากที่ 01 · มิถุนายน 2020 · เช้าวันอังคารหนึ่ง", prompt: "จดหมายฉบับหนึ่งมาถึง บนหัวจดหมายของ PMCU เขียนด้วยภาษากฎหมาย <em>คำสั่งให้ออกจากพื้นที่ คุณได้รับแจ้งให้ย้ายออก</em>", sub: "คุณจะทำสิ่งใดก่อน?", choices: [
      { text: "เดินเข้าไปในศาลเจ้าแล้วจุดธูป วันนี้คุณยังไม่ตัดสินใจอะไร", meta: "เวลาที่ได้: 0 วัน · ราคา: ความเงียบ" },
      { text: "นั่งรถไฟไปสมาคมสถาปนิกสยาม อาจมีใครที่นั่นช่วยได้", meta: "เวลาที่ได้: หลายสัปดาห์ · ราคา: การเป็นที่จับตา" },
      { text: "โทรหาครอบครัว ขอให้มาช่วงสุดสัปดาห์นี้ คุณต้องการใครสักคนที่มีรายได้มั่นคงอยู่ใกล้ ๆ", meta: "เวลาที่ได้: ไม่จำกัด · ราคา: ภาระครอบครัว" }
    ] }
  },
  s2_quiet: {
    zh: { scene: "场景 02 · 2020 年 7 月 · 三周之后", prompt: "你已经连续二十一天每天清晨上香。<em>什么都没发生。</em>接着 PMCU 寄来第二封信——这次是正式的法律程序。", sub: "沉默让你付出了时间的代价。现在怎么办？", choices: [
      { text: "去法政大学找一家免费法律诊所。", meta: "遥远但有原则" },
      { text: "在耀华力区花钱请律师——老一辈人用过的那位。", meta: "耗尽你的积蓄" },
      { text: "完全拒绝回应。让他们来找你。", meta: "33 街区的方式" }
    ] },
    th: { scene: "ฉากที่ 02 · กรกฎาคม 2020 · สามสัปดาห์ต่อมา", prompt: "คุณจุดธูปทุกเช้ามายี่สิบเอ็ดวัน <em>ไม่มีอะไรเกิดขึ้น</em> จากนั้น PMCU ก็ส่งจดหมายฉบับที่สองมา — คราวนี้เป็นกระบวนการทางกฎหมายอย่างเป็นทางการ", sub: "ความเงียบทำให้คุณเสียเวลาไป แล้วตอนนี้ล่ะ?", choices: [
      { text: "ไปหาคลินิกกฎหมายฟรีที่มหาวิทยาลัยธรรมศาสตร์", meta: "ไกลแต่มีหลักการ" },
      { text: "จ้างทนายในเยาวราช — คนที่ครอบครัวรุ่นเก่าเคยใช้", meta: "ต้องควักเงินเก็บ" },
      { text: "ปฏิเสธที่จะตอบโต้ทั้งหมด ให้พวกเขามาหาคุณเอง", meta: "แบบฉบับบล็อก 33" }
    ] }
  },
  s2_appeal: {
    zh: { scene: "场景 02 · 2020 年 8 月 · 协会办公室", prompt: "他们承认这座庙的遗产价值。他们写了一封公开信。<em>但它没有法律效力。</em>1961 年《古迹法》看不见你的庙。", sub: "没有法律依据的遗产认定，能给你什么？", choices: [
      { text: "用这封信吸引媒体关注。", meta: "曝光 · 缓慢" },
      { text: "拿它上法庭，申请禁制令。", meta: "检验法律 · 80,000 泰铢" },
      { text: "就在庙前召开新闻发布会。", meta: "让缺席被看见" }
    ] },
    th: { scene: "ฉากที่ 02 · สิงหาคม 2020 · สำนักงานสมาคม", prompt: "พวกเขายอมรับคุณค่าเชิงมรดกของศาลเจ้า และเขียนจดหมายเปิดผนึก <em>แต่มันไม่มีน้ำหนักทางกฎหมาย</em> พระราชบัญญัติโบราณสถาน พ.ศ. 2504 (1961) มองไม่เห็นศาลเจ้าของคุณ", sub: "การยอมรับว่าเป็นมรดกแต่ไร้กฎหมายรองรับ ให้อะไรกับคุณ?", choices: [
      { text: "ใช้จดหมายดึงความสนใจจากสื่อ", meta: "เป็นที่จับตา · ช้า" },
      { text: "นำขึ้นศาลและยื่นขอคำสั่งคุ้มครองชั่วคราว", meta: "ทดสอบกฎหมาย · 80,000 บาท" },
      { text: "จัดแถลงข่าวที่ศาลเจ้าเอง", meta: "ทำให้การหายไปถูกมองเห็น" }
    ] }
  },
  s2_family: {
    zh: { scene: "场景 02 · 2020 年 7 月 · 周日午餐", prompt: "家人坐在你的餐桌旁。有薪水、有伴侣、有孩子。他们说：<em>“你怎么不搬来和我们一起住？那样会轻松些。”</em>", sub: "他们没有错。但是。", choices: [
      { text: "拒绝。总得有人留在这里。那个人就是你。", meta: "尊严的选择" },
      { text: "答应，但请他们资助庙的法律辩护。", meta: "家庭债务上升" },
      { text: "说你会考虑。其实你不会。", meta: "时间流逝" }
    ] },
    th: { scene: "ฉากที่ 02 · กรกฎาคม 2020 · มื้อกลางวันวันอาทิตย์", prompt: "ครอบครัวนั่งอยู่ที่โต๊ะของคุณ มีเงินเดือน มีคู่ชีวิต มีลูก พวกเขาพูดว่า <em>‘ทำไมไม่มาอยู่กับเราล่ะ จะได้สบายกว่า’</em>", sub: "พวกเขาไม่ได้ผิด แต่...", choices: [
      { text: "ปฏิเสธ ต้องมีใครสักคนอยู่ที่นี่ และคนคนนั้นคือคุณ", meta: "ทางเลือกแห่งศักดิ์ศรี" },
      { text: "ตกลง แต่ขอให้พวกเขาช่วยออกค่าต่อสู้คดีให้ศาลเจ้า", meta: "หนี้ครอบครัวเพิ่มขึ้น" },
      { text: "บอกว่าจะคิดดู แต่คุณไม่คิด", meta: "เวลาเลื่อนหลุดไป" }
    ] }
  },
  s3_thammasat: {
    zh: { scene: "场景 03 · 2020 年 10 月 · 塔帕昌校区", prompt: "一名法学生接下了案子。聪明，过劳。她坦率地说：<em>法律保护不了你所是的身份。</em>她的计划是拖延。", sub: "你能拖多久？", choices: [
      { text: "尽可能拖延。为社区争取组织起来的时间。", meta: "集体的时间" },
      { text: "转向——请她把你引荐给学生活动家的网络。", meta: "曝光" }
    ] },
    th: { scene: "ฉากที่ 03 · ตุลาคม 2020 · วิทยาเขตท่าพระจันทร์", prompt: "นักศึกษากฎหมายคนหนึ่งรับคดีไว้ เก่งแต่ทำงานหนักเกินตัว เธอพูดตรง ๆ ว่า <em>กฎหมายไม่คุ้มครองสิ่งที่คุณเป็น</em> แผนของเธอคือการประวิงเวลา", sub: "คุณประวิงเวลาได้นานแค่ไหน?", choices: [
      { text: "ประวิงให้นานที่สุด ซื้อเวลาให้ชุมชนได้รวมตัวกัน", meta: "เวลาแบบหมู่คณะ" },
      { text: "เปลี่ยนทิศ — ขอให้เธอเชื่อมคุณกับเครือข่ายนักกิจกรรมนักศึกษาแทน", meta: "การเป็นที่จับตา" }
    ] }
  },
  s3_paid: {
    zh: { scene: "场景 03 · 2020 年 12 月 · 耀华力区一间小办公室", prompt: "律师很称职。唯一现实的策略是谈判：搬迁补偿，也许还有一处新庙址。PMCU 的律师不谈遗产。<em>他们只谈钱。</em>", sub: "你谈判吗？", choices: [
      { text: "谈判。能拿多少是多少。保住神明，失去土地。", meta: "搬迁和解" },
      { text: "拒绝。土地就是庙。你无法把它搬走。", meta: "公开抗争" }
    ] },
    th: { scene: "ฉากที่ 03 · ธันวาคม 2020 · สำนักงานเล็ก ๆ ในเยาวราช", prompt: "ทนายมีความสามารถ กลยุทธ์เดียวที่เป็นไปได้คือการเจรจา: เงินย้ายที่ บางทีอาจมีที่ตั้งศาลเจ้าใหม่ ทนายของ PMCU ไม่คุยเรื่องมรดก <em>พวกเขาคุยเรื่องเงิน</em>", sub: "คุณจะเจรจาไหม?", choices: [
      { text: "เจรจา เอาเท่าที่จะได้ รักษาองค์เทพไว้ แต่เสียผืนดิน", meta: "ข้อตกลงย้ายที่" },
      { text: "ปฏิเสธ ผืนดินคือศาลเจ้า คุณย้ายมันไม่ได้", meta: "การขัดขืนอย่างเปิดเผย" }
    ] }
  },
  s3_refuse: {
    zh: { scene: "场景 03 · 2021 年 2 月 · 庙里的一个周六", prompt: "你不再拆信。信却不断寄来。然后，一纸传票到了——你的名字，还有另外四个人。<em>一亿两千两百万泰铢的赔偿。</em>", sub: "拒绝已经被点名。", choices: [
      { text: "当晚召开社区会议。每个人都说出，如果签字将会失去什么。", meta: "有组织的抵抗" },
      { text: "整夜独自坐在神龛前。为神明、为祖母、为其他人点香。", meta: "孤身的抗争" }
    ] },
    th: { scene: "ฉากที่ 03 · กุมภาพันธ์ 2021 · วันเสาร์หนึ่งที่ศาลเจ้า", prompt: "คุณเลิกเปิดจดหมาย แต่มันก็ยังมาเรื่อย ๆ จากนั้นหมายศาลก็มาถึง — ชื่อคุณ พร้อมอีกสี่คน <em>ค่าเสียหาย 122 ล้านบาท</em>", sub: "การปฏิเสธถูกระบุชื่อแล้ว", choices: [
      { text: "จัดประชุมชุมชนคืนนั้น ทุกคนบอกว่าจะสูญเสียอะไรหากลงนาม", meta: "การต่อต้านแบบมีองค์กร" },
      { text: "นั่งลำพังที่แท่นบูชาทั้งคืน จุดธูปให้องค์เทพ ให้ยายของคุณ ให้คนอื่น ๆ", meta: "การขัดขืนอย่างโดดเดี่ยว" }
    ] }
  },
  s3_press: {
    zh: { scene: "场景 03 · 2020 年 9 月 · 泰国公视前来拍摄", prompt: "一支纪录片团队到了。他们很温和。他们问起你的祖母，问起 1960 年的火灾。他们拍下你手持线香。<em>片子播出了。PMCU 没有回应。</em>", sub: "有曝光却无筹码——这能带来什么？", choices: [
      { text: "利用曝光直接向朱拉的管理层施压。", meta: "羞辱施压" },
      { text: "用它为法律辩护筹款。", meta: "付费抵抗" }
    ] },
    th: { scene: "ฉากที่ 03 · กันยายน 2020 · ไทยพีบีเอสมาถ่ายทำ", prompt: "ทีมสารคดีมาถึง พวกเขาอ่อนโยน ถามถึงยายของคุณ ถึงไฟไหม้ปี 1960 พวกเขาถ่ายภาพคุณถือธูป <em>สารคดีออกอากาศ PMCU ไม่ตอบสนอง</em>", sub: "การเป็นที่จับตาแต่ไร้อำนาจต่อรอง — มันให้ผลอะไร?", choices: [
      { text: "ใช้การเป็นที่จับตากดดันฝ่ายบริหารของจุฬาฯ โดยตรง", meta: "การประจาน" },
      { text: "ใช้มันระดมทุนเพื่อต่อสู้คดี", meta: "การต่อต้านแบบมีทุน" }
    ] }
  },
  s4_collective: { zh: { scene: "场景 04 · 2023 年 8 月 · 终局", prompt: "你和十二位邻居站在门槛上。法院已判你败诉。<em>你仍然留下。</em>", sub: "你没有赢。但你揭示了他们无法在法律上迅速做到的事。" }, th: { scene: "ฉากที่ 04 · สิงหาคม 2023 · บทอวสาน", prompt: "คุณยืนอยู่ที่ธรณีประตูพร้อมเพื่อนบ้านสิบสองคน ศาลตัดสินให้คุณแพ้ <em>แต่คุณก็ยังอยู่</em>", sub: "คุณไม่ได้ชนะ แต่คุณเผยให้เห็นสิ่งที่พวกเขาไม่อาจทำได้รวดเร็วตามกฎหมาย" } },
  s4_activist: { zh: { scene: "场景 04 · 2023 · #SaveTheMazuShrine", prompt: "这个话题标签疯传。朱拉的国际声誉开始受损。<em>PMCU 暂停了一切强制行动——悄无声息，无限期地。</em>", sub: "你没有赢。但你让沉默变得太过昂贵。" }, th: { scene: "ฉากที่ 04 · 2023 · #SaveTheMazuShrine", prompt: "แฮชแท็กแพร่ไปทั่ว ชื่อเสียงระดับนานาชาติของจุฬาฯ เริ่มเสียหาย <em>PMCU หยุดการบังคับทุกอย่างไว้ — อย่างเงียบ ๆ และไม่มีกำหนด</em>", sub: "คุณไม่ได้ชนะ แต่คุณทำให้ความเงียบมีราคาแพงเกินไป" } },
  s4_relocate: { zh: { scene: "场景 04 · 2022 · 百年纪念公园附近的新址", prompt: "PMCU 在百年纪念公园旁建了一座小小的新庙，照片拍得很好，以仪式开光。<em>社区拒绝搬迁。</em>神明留在人们所在的地方。", sub: "你没有输。你被悄悄地收编了。" }, th: { scene: "ฉากที่ 04 · 2022 · ที่ตั้งใหม่ใกล้อุทยาน 100 ปี", prompt: "PMCU สร้างศาลเจ้าใหม่หลังเล็กติดกับอุทยาน 100 ปี ถ่ายรูปสวยงาม เปิดด้วยพิธีกรรม <em>ชุมชนปฏิเสธที่จะย้าย</em> องค์เทพอยู่ที่ที่ผู้คนอยู่", sub: "คุณไม่ได้แพ้ แต่คุณถูกกลืนเข้าระบบอย่างเงียบ ๆ" } },
  s4_defiance: { zh: { scene: "场景 04 · 2023 年 8 月 · 法院判决", prompt: "一审法院判 PMCU 胜诉。赔偿成立。<em>你留下的每一天，都是你欠得更多的一天。</em>", sub: "你没有输掉官司。你失去的是不至于倾家荡产地拒绝的权利。" }, th: { scene: "ฉากที่ 04 · สิงหาคม 2023 · คำพิพากษา", prompt: "ศาลชั้นต้นตัดสินให้ PMCU ชนะ ค่าเสียหายมีผล <em>ทุกวันที่คุณอยู่คือวันที่คุณเป็นหนี้มากขึ้น</em>", sub: "คุณไม่ได้แพ้คดี แต่คุณเสียสิทธิที่จะปฏิเสธโดยไม่ต้องล่มจม" } }
};

const END_CHOICE_I18N = {
  en: "End your path — see what this reveals.",
  zh: "结束你的路径——看看它揭示了什么。",
  th: "จบเส้นทางของคุณ — ดูสิ่งที่มันเผยให้เห็น"
};

/* ----- portrait files (folder uses mixed capitalisation) ----- */
const PERSONA_IMG = {
  som: "som.png", chai: "chai.png", wan: "wan.png", ploy: "Ploy.png",
  anong: "anong.png", preecha: "Preecha.png", tul: "Tul.png", mai: "mai.png",
  abby: "abby.png"
};
PERSONAS.forEach(p => { p.img = "persona_pics/" + (PERSONA_IMG[p.id] || (p.id + ".png")); });

/* ----- load an <img>, resolve null on failure (so we fall back to the pixel face) ----- */
function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) { resolve(null); return; }
    const im = new Image();
    im.onload = () => resolve(im);
    im.onerror = () => resolve(null);
    im.src = src;
  });
}

const STORY = {
  start: "s1",
  nodes: {
    s1: {
      scene: "Scene 01 · June 2020 · A Tuesday morning",
      prompt: "A letter arrives, on PMCU letterhead, in legal language. <em>An eviction order. You have been notified to vacate.</em>",
      sub: "What do you do first?",
      choices: [
        { letter: "A", text: "Walk into the shrine and light incense. You decide nothing today.", meta: "Time gained: 0 days · Cost: silence", next: "s2_quiet" },
        { letter: "B", text: "Take the train to the Association of Siamese Architects. Someone there might help.", meta: "Time gained: weeks · Cost: visibility", next: "s2_appeal" },
        { letter: "C", text: "Call family. Ask them to come this weekend. You need someone with a stable salary nearby.", meta: "Time gained: indefinite · Cost: family burden", next: "s2_family" }
      ]
    },
    s2_quiet: {
      scene: "Scene 02 · July 2020 · Three weeks later",
      prompt: "You have lit incense every morning for twenty-one days. <em>Nothing happens.</em> Then PMCU sends a second letter — now formal legal proceedings.",
      sub: "The silence cost you time. What now?",
      choices: [
        { letter: "A", text: "Find a free legal clinic at Thammasat University.", meta: "Distant but principled", next: "s3_thammasat" },
        { letter: "B", text: "Pay for a lawyer in Yaowarat — someone the older families used.", meta: "Costs your savings", next: "s3_paid" },
        { letter: "C", text: "Refuse to engage at all. Let them come to you.", meta: "The Block 33 way", next: "s3_refuse" }
      ]
    },
    s2_appeal: {
      scene: "Scene 02 · August 2020 · The Association's office",
      prompt: "They acknowledge the shrine's heritage value. They write a public letter. <em>It has no legal weight.</em> The 1961 Ancient Monuments Act does not see your shrine.",
      sub: "What does heritage recognition without statute give you?",
      choices: [
        { letter: "A", text: "Use the letter to attract press attention.", meta: "Visibility · slow", next: "s3_press" },
        { letter: "B", text: "Take it to court and file for an injunction.", meta: "Test the statute · 80,000 baht", next: "s3_paid" },
        { letter: "C", text: "Hold a press conference at the shrine itself.", meta: "Make absence visible", next: "s3_press" }
      ]
    },
    s2_family: {
      scene: "Scene 02 · July 2020 · Sunday lunch",
      prompt: "Family sits at your table. Salary, partner, child. They say: <em>'Why don't you come live with us? It would be easier.'</em>",
      sub: "They are not wrong. But.",
      choices: [
        { letter: "A", text: "Refuse. Someone needs to be here. You are that someone.", meta: "Choice of dignity", next: "s3_refuse" },
        { letter: "B", text: "Agree, but ask them to fund the shrine's legal defence.", meta: "Family debt rises", next: "s3_paid" },
        { letter: "C", text: "Say you'll think about it. You don't.", meta: "Time slips", next: "s3_refuse" }
      ]
    },
    s3_thammasat: {
      scene: "Scene 03 · October 2020 · Tha Prachan campus",
      prompt: "A law student takes the case. Brilliant, overworked. She says frankly: <em>the law does not protect what you are.</em> Her plan is to delay.",
      sub: "How long can you delay?",
      choices: [
        { letter: "A", text: "Delay as long as possible. Buy time for the community to organise.", meta: "Path: collective time", next: "s4_collective" },
        { letter: "B", text: "Pivot — ask her to connect you with student activist networks instead.", meta: "Path: visibility", next: "s4_activist" }
      ]
    },
    s3_paid: {
      scene: "Scene 03 · December 2020 · A small office in Yaowarat",
      prompt: "The lawyer is competent. The only realistic strategy is to negotiate: relocation funds, perhaps a new shrine site. PMCU's lawyers will not engage on heritage. <em>They engage on money.</em>",
      sub: "Do you negotiate?",
      choices: [
        { letter: "A", text: "Negotiate. Take what you can get. Save the deities, lose the ground.", meta: "Path: relocation settlement", next: "s4_relocate" },
        { letter: "B", text: "Refuse. The ground is the shrine. You cannot move it.", meta: "Path: open defiance", next: "s4_defiance" }
      ]
    },
    s3_refuse: {
      scene: "Scene 03 · February 2021 · A Saturday at the shrine",
      prompt: "You stop opening the letters. They keep coming. Then a court summons arrives — your name, four others. <em>122 million baht in damages.</em>",
      sub: "The refusal has been named.",
      choices: [
        { letter: "A", text: "Hold a community meeting that night. Everyone names what they will lose if they sign.", meta: "Path: organised resistance", next: "s4_collective" },
        { letter: "B", text: "Sit alone at the altar all night. Light incense for the gods, for your grandmother, for the others.", meta: "Path: solitary defiance", next: "s4_defiance" }
      ]
    },
    s3_press: {
      scene: "Scene 03 · September 2020 · Thai PBS comes to film",
      prompt: "A documentary team arrives. They are gentle. They ask about your grandmother, about the 1960 fire. They film you holding incense. <em>The piece airs. PMCU does not respond.</em>",
      sub: "Visibility without leverage — what does it produce?",
      choices: [
        { letter: "A", text: "Use the visibility to pressure CU's administration directly.", meta: "Path: shaming", next: "s4_activist" },
        { letter: "B", text: "Use it to fundraise for legal defence.", meta: "Path: paid resistance", next: "s4_collective" }
      ]
    },
    s4_collective: {
      scene: "Scene 04 · August 2023 · Endgame",
      prompt: "You stand on the threshold with twelve neighbours. The court has ruled against you. <em>You stay anyway.</em>",
      sub: "You did not win. You revealed what they could not legally do quickly.",
      choices: [{ letter: "▸", text: "End your path — see what this reveals.", meta: "", next: "OUTCOME_COLLECTIVE" }]
    },
    s4_activist: {
      scene: "Scene 04 · 2023 · #SaveTheMazuShrine",
      prompt: "The hashtag goes viral. CU's international reputation begins to take damage. <em>PMCU pauses any forced action — quietly, indefinitely.</em>",
      sub: "You did not win. You made the silence too expensive.",
      choices: [{ letter: "▸", text: "End your path — see what this reveals.", meta: "", next: "OUTCOME_VISIBILITY" }]
    },
    s4_relocate: {
      scene: "Scene 04 · 2022 · A new site near Centenary Park",
      prompt: "PMCU builds a small new shrine adjacent to Centenary Park, photographed well, opened with ritual. <em>The community refuses to move.</em> The deities stay where the people are.",
      sub: "You did not lose. You were quietly enrolled.",
      choices: [{ letter: "▸", text: "End your path — see what this reveals.", meta: "", next: "OUTCOME_LAUNDERED" }]
    },
    s4_defiance: {
      scene: "Scene 04 · August 2023 · The court ruling",
      prompt: "The lower court rules for PMCU. The damages stand. <em>Each day you stay is a day you owe more.</em>",
      sub: "You did not lose the case. You lost the right to refuse without ruin.",
      choices: [{ letter: "▸", text: "End your path — see what this reveals.", meta: "", next: "OUTCOME_DEBT" }]
    }
  }
};

const OUTCOMES = {
  OUTCOME_COLLECTIVE: {
    title: "You held the threshold.",
    lead: "Twelve bodies, one altar, one wall. You did not win the lawsuit. You won time. PMCU's machinery is fast in offices and slow in public.",
    path: { headline: "Collective <em>resistance</em>", body: "By organising the community before PMCU could pick individuals off one by one, you turned a property dispute into a political confrontation. The institutional grammar — which depends on quiet expirations — stalled when forced to operate visibly." },
    real: { headline: "The Scala <em>precedent</em>", body: "Scala Cinema's defenders attempted a similar collective stance in 2021. They lost the building but won the discourse. Netiwit Chotiphatphaisal explicitly invoked Scala when joining the Mazu shrine campaign — and turned the precedent into a warning.", source: "Source · Netiwit statements 2021–23" },
    mech: { name: "§ M02 · Institutional Grammar — interrupted", cn: "制度语法 · 被中断", body: "PMCU's pattern depends on each non-renewal looking like an isolated administrative event. <strong>Collective refusal forces the pattern to become visible as a pattern.</strong> The lawsuit continues — but every news cycle that names it adds friction the system was not designed to absorb." }
  },
  OUTCOME_VISIBILITY: {
    title: "You made the silence too expensive.",
    lead: "#SaveTheMazuShrine did not change the law. It changed what the law cost to enforce.",
    path: { headline: "Reputational <em>leverage</em>", body: "You raised the institutional cost of eviction above its institutional benefit. PMCU paused — not legally, but pragmatically. The case sits in limbo, which is a kind of victory that is not a victory." },
    real: { headline: "International press <em>does</em> move CU", body: "Centenary Park's ASLA Honor Award is part of CU's international brand. Critical foreign coverage — particularly The Guardian's 2023 piece — produced internal CU pressure that domestic coverage alone did not.", source: "Source · The Guardian, June 2023; Khaosod 2020" },
    mech: { name: "§ M05 · Displacement Silence — broken", cn: "位移沉默 · 被打破", body: "PMCU's Smart City framework does not name displaced communities. <strong>When the displaced community names itself loudly enough, the silence stops working as cover.</strong> The mechanism is exposed but not dismantled — the next block will be cleared more quietly, with lessons learned." }
  },
  OUTCOME_LAUNDERED: {
    title: "You were quietly enrolled.",
    lead: "PMCU built a respectful new shrine. The community refused to move. The deities stayed where the people are.",
    path: { headline: "Negotiated <em>relocation</em>", body: "PMCU's relocation plan promised continuity — proper ritual, running water, a place inside Centenary Park's 'cultural heritage zone.' Accepting would have preserved the deities and ritual. It would also have erased the diasporic geography that made the shrine what it was." },
    real: { headline: "The <em>relocation refused</em>", body: "PMCU did build a replacement shrine on the edge of Centenary Park. The Sam Yan community did not move there. The original shrine remains in place. The 'cultural heritage zone' became a designation without inhabitants.", source: "Source · Bangkok Post 2023; New Mandala 2025" },
    mech: { name: "§ M04 · Awards-as-Laundering", cn: "奖项洗白", body: "International design awards (like Centenary Park's ASLA Honor) do not require disclosure of social displacement. <strong>A 'relocated' shrine becomes a heritage feature; the cleared community disappears into the citation.</strong> The award is not given despite the displacement — it is given because good design has made the displacement invisible." }
  },
  OUTCOME_DEBT: {
    title: "You lost the right to refuse without ruin.",
    lead: "The court did not order you to leave. It ordered that staying costs 122 million baht. Refusal is now a financial act.",
    path: { headline: "Defiance under <em>damages</em>", body: "By refusing to engage with PMCU's offers, you forced the institution to formalise its threat. The threat is now law: every day you remain, you owe more. The shrine stands. The defendants are not in jail. They are simply ruined." },
    real: { headline: "The real <em>122 million baht</em> claim", body: "PMCU filed civil damages against Penprapa Ployseesuay — fourth-generation caretaker — and others personally. The lower court ruled for PMCU in August 2023. The case continues; the damages accrue. Penprapa said: <em>'I will fight until the end.'</em>", source: "Source · Bangkok Civil Court filings 2021–23" },
    mech: { name: "§ M03 · Civil Litigation — staying becomes debt", cn: "民事诉讼 · 留下变成债务", body: "The lawsuit's purpose is not to evict. <strong>It is to convert the act of remaining from a moral position into a financial liability.</strong> Eviction is brutal and visible; debt is quiet and continuous. The shrine can stand for another decade while the people inside it are made bankrupt by their own dignity." }
  }
};

const OUTCOME_I18N = {
  OUTCOME_COLLECTIVE: {
    en: {
      title: "You held the threshold.",
      lead: "You did not win the lawsuit. You won time. PMCU's machinery is fast in offices and slow in public.",
      path: { headline: "Collective <em>resistance</em>", body: "By organising the community before PMCU could pick individuals off one by one, you turned a property dispute into a political confrontation. The institutional grammar — which depends on quiet expirations — stalled when forced to operate visibly." },
      real: { headline: "The Scala <em>precedent</em>", body: "Scala Cinema's defenders attempted a similar collective stance in 2021. They lost the building but won the discourse. Netiwit Chotiphatphaisal explicitly invoked Scala when joining the Mazu shrine campaign — and turned the precedent into a warning.", source: "Source · Netiwit statements 2021–23" },
      mech: { name: "§ M02 · Institutional Grammar — interrupted", cn: "Institutional Grammar · interrupted", body: "PMCU's pattern depends on each non-renewal looking like an isolated administrative event. <strong>Collective refusal forces the pattern to become visible as a pattern.</strong> The lawsuit continues — but every news cycle that names it adds friction the system was not designed to absorb." }
    },
    zh: {
      title: "你守住了。",
      lead: "你或许没有赢得官司。但至少你赢得了时间。PMCU 的机器在办公室里很快，在公众面前很慢。",
      path: { headline: "集体<em>抵抗</em>", body: "在 PMCU 还来不及逐个击破之前，你把社区组织了起来，把一场物业纠纷变成了一场政治对峙。那套依赖悄然到期的制度语法，一旦被迫公开运作便陷入停滞。" },
      real: { headline: "斯卡拉影院的<em>先例</em>", body: "斯卡拉影院的守护者们在 2021 年采取了类似的集体立场。他们失去了建筑，却赢得了话语。Netiwit Chotiphatphaisal 在加入妈祖庙运动时明确援引斯卡拉，把这一先例变成了一记警告。", source: "来源 · Netiwit 2021–23 年言论" },
      mech: { name: "§ M02 · 制度语法——被中断", cn: "制度语法 · 被中断", body: "PMCU 的模式依赖于每一次不续约都看似孤立的行政事件。<strong>集体的拒绝迫使这一模式作为“模式”被看见。</strong>官司仍在继续，但每一轮点名它的新闻周期，都在为这个本不设计来吸收阻力的系统增添摩擦。" }
    },
    th: {
      title: "คุณยืนหยัดที่ธรณีประตู",
      lead: "คุณไม่ได้ชนะคดี แต่คุณชนะเวลา กลไกของ PMCU รวดเร็วในสำนักงานแต่เชื่องช้าในที่สาธารณะ",
      path: { headline: "<em>การต่อต้าน</em>แบบหมู่คณะ", body: "ด้วยการรวมตัวชุมชนก่อนที่ PMCU จะเก็บทีละคนได้ คุณเปลี่ยนข้อพิพาทเรื่องทรัพย์สินให้กลายเป็นการเผชิญหน้าทางการเมือง ไวยากรณ์เชิงสถาบัน ซึ่งอาศัยการหมดอายุอย่างเงียบ ๆ ก็สะดุดลงเมื่อถูกบังคับให้ทำงานอย่างเปิดเผย" },
      real: { headline: "บรรทัดฐาน<em>สกาลา</em>", body: "ผู้ปกป้องโรงหนังสกาลาเคยใช้ท่าทีแบบหมู่คณะคล้ายกันในปี 2021 พวกเขาเสียอาคารไปแต่ชนะในเชิงวาทกรรม เนติวิทย์ โชติภัทร์ไพศาล อ้างถึงสกาลาอย่างชัดเจนเมื่อเข้าร่วมการรณรงค์ศาลเจ้าแม่ทับทิม และเปลี่ยนบรรทัดฐานนั้นให้เป็นคำเตือน", source: "ที่มา · คำให้สัมภาษณ์ของเนติวิทย์ 2021–23" },
      mech: { name: "§ M02 · ไวยากรณ์เชิงสถาบัน — ถูกขัดจังหวะ", cn: "ไวยากรณ์เชิงสถาบัน · ถูกขัดจังหวะ", body: "รูปแบบของ PMCU อาศัยการไม่ต่อสัญญาแต่ละครั้งให้ดูเหมือนเหตุการณ์ทางปกครองที่แยกขาดจากกัน <strong>การปฏิเสธแบบหมู่คณะบังคับให้รูปแบบนั้นถูกมองเห็นว่าเป็นรูปแบบ</strong> คดียังดำเนินต่อ แต่ทุกรอบข่าวที่เอ่ยถึงมันเพิ่มแรงเสียดทานที่ระบบไม่ได้ออกแบบมาให้รองรับ" }
    }
  },
  OUTCOME_VISIBILITY: {
    en: {
      title: "You raise the voice for the shrine.",
      lead: "#SaveTheMazuShrine did not change the law. It changed what the law cost to enforce.",
      path: { headline: "Reputational <em>leverage</em>", body: "You raised the institutional cost of eviction above its institutional benefit. PMCU paused — not legally, but pragmatically. The case sits in limbo, which is a kind of victory that is not a victory." },
      real: { headline: "International press <em>does</em> move CU", body: "Centenary Park's ASLA Honor Award is part of CU's international brand. Critical foreign coverage, particularly The Guardian's 2023 piece, produced internal CU pressure that domestic coverage alone did not.", source: "Source · The Guardian, June 2023; Khaosod 2020" },
      mech: { name: "§ Break the silence", cn: "Displacement Silence · broken", body: "PMCU's Smart City framework does not name displaced communities. <strong>When the displaced community names itself loudly enough, the silence stops working as cover.</strong> The mechanism is exposed but not dismantled — the next block will be cleared more quietly, with lessons learned." }
    },
    zh: {
      title: "你让发声成为更多人的选择。",
      lead: "#SaveTheMazuShrine 没有改变法律。它改变的是执行法律的代价。",
      path: { headline: "声誉<em>杠杆</em>", body: "你把驱逐的制度成本抬高到超过它的制度收益。PMCU 暂停了——不是出于法律，而是出于务实。案件悬而未决，这是一种不算胜利的胜利。" },
      real: { headline: "国际媒体确实能<em>撼动朱拉</em>", body: "百年纪念公园的 ASLA 荣誉奖是朱拉国际品牌的一部分。而批判性的外媒报道，尤其是《卫报》2023 年那篇，制造了仅靠本地报道无法形成的内部压力。", source: "来源 · 《卫报》2023 年 6 月；Khaosod 2020" },
      mech: { name: "§ 打破沉默", cn: "位移沉默 · 被打破", body: "PMCU 的智慧城市框架从不指称被迫迁的社区。<strong>当被迫迁的社区把自己的名字喊得足够响，沉默便不再能充当掩护。</strong>机制被暴露，但并未被拆除——下一个街区会被更安静地清空，带着这次学到的教训。" }
    },
    th: {
      title: "คุณทำให้การส่งเสียงเพื่อศาลเจ้าเป็นทางเลือกของผู้คนมากขึ้น",
      lead: "#SaveTheMazuShrine ไม่ได้เปลี่ยนกฎหมาย แต่เปลี่ยนต้นทุนในการบังคับใช้กฎหมายนั้น",
      path: { headline: "อำนาจต่อรองเชิง<em>ชื่อเสียง</em>", body: "คุณทำให้ต้นทุนเชิงสถาบันของการไล่ที่สูงกว่าผลประโยชน์ที่สถาบันจะได้ PMCU หยุดไว้ ไม่ใช่ทางกฎหมาย แต่ด้วยความสมจริง คดีค้างเติ่งอยู่ ซึ่งเป็นชัยชนะชนิดที่ไม่ใช่ชัยชนะ" },
      real: { headline: "สื่อต่างประเทศ<em>ขยับจุฬาฯ</em> ได้จริง", body: "รางวัล ASLA Honor Award ของอุทยาน 100 ปีเป็นส่วนหนึ่งของแบรนด์ระดับนานาชาติของจุฬาฯ การรายงานเชิงวิพากษ์จากต่างประเทศ โดยเฉพาะบทความของ The Guardian ปี 2023 สร้างแรงกดดันภายในจุฬาฯ ที่การรายงานในประเทศเพียงอย่างเดียวทำไม่ได้", source: "ที่มา · The Guardian มิ.ย. 2023; ข่าวสด 2020" },
      mech: { name: "§ ทำลายความเงียบ", cn: "ความเงียบของการขับไล่ · ถูกทำลาย", body: "กรอบสมาร์ตซิตี้ของ PMCU ไม่เอ่ยชื่อชุมชนที่ถูกขับไล่ <strong>เมื่อชุมชนที่ถูกขับไล่เปล่งเสียงชื่อตัวเองดังพอ ความเงียบก็เลิกทำหน้าที่เป็นเครื่องบังหน้า</strong> กลไกถูกเปิดโปงแต่ไม่ได้ถูกรื้อ บล็อกต่อไปจะถูกเคลียร์อย่างเงียบกว่าเดิม โดยได้บทเรียนแล้ว" }
    }
  },
  OUTCOME_LAUNDERED: {
    en: OUTCOMES.OUTCOME_LAUNDERED,
    zh: {
      title: "你被悄悄地收编了。",
      lead: "PMCU 建了一座体面的新庙。社区拒绝搬迁。神明留在人们所在的地方。",
      path: { headline: "协商<em>搬迁</em>", body: "PMCU 的搬迁方案承诺延续性——正规的仪式、自来水、百年纪念公园“文化遗产区”里的一席之地。接受它本可保住神明与仪式，但也会抹去那让这座庙成其为庙的离散地理。" },
      real: { headline: "被拒绝的<em>搬迁</em>", body: "PMCU 确实在百年纪念公园边缘建了一座替代庙。三聚社区没有搬过去。原来的庙仍在原地。那个“文化遗产区”成了一个没有居民的称号。", source: "来源 · 《曼谷邮报》2023；New Mandala 2025" },
      mech: { name: "§ M04 · 奖项洗白", cn: "奖项洗白", body: "国际设计奖项（如百年纪念公园的 ASLA 荣誉奖）并不要求披露社会迫迁。<strong>一座“搬迁后”的庙成了遗产景观；被清空的社区消失在颁奖词里。</strong>这个奖不是不顾迫迁而颁出，而是因为出色的设计让迫迁变得不可见，才被颁出。" }
    },
    th: {
      title: "คุณถูกกลืนเข้าระบบอย่างเงียบ ๆ",
      lead: "PMCU สร้างศาลเจ้าใหม่อย่างให้เกียรติ ชุมชนปฏิเสธที่จะย้าย องค์เทพอยู่ที่ที่ผู้คนอยู่",
      path: { headline: "การย้ายที่โดย<em>การเจรจา</em>", body: "แผนย้ายที่ของ PMCU สัญญาถึงความต่อเนื่อง พิธีกรรมที่ถูกต้อง น้ำประปา และที่ทางภายในเขตมรดกทางวัฒนธรรมของอุทยาน 100 ปี การยอมรับจะรักษาองค์เทพและพิธีกรรมไว้ได้ แต่ก็จะลบภูมิศาสตร์ของผู้พลัดถิ่นที่ทำให้ศาลเจ้าเป็นศาลเจ้าไปด้วย" },
      real: { headline: "การย้ายที่ที่<em>ถูกปฏิเสธ</em>", body: "PMCU สร้างศาลเจ้าทดแทนขึ้นที่ขอบอุทยาน 100 ปีจริง แต่ชุมชนสามย่านไม่ได้ย้ายไป ศาลเจ้าเดิมยังอยู่ที่เดิม เขตมรดกทางวัฒนธรรมกลายเป็นการขนานนามที่ไร้ผู้อยู่อาศัย", source: "ที่มา · Bangkok Post 2023; New Mandala 2025" },
      mech: { name: "§ M04 · การฟอกขาวด้วยรางวัล", cn: "การฟอกขาวด้วยรางวัล", body: "รางวัลออกแบบระดับนานาชาติ เช่น ASLA Honor ของอุทยาน 100 ปี ไม่กำหนดให้เปิดเผยการขับไล่ทางสังคม <strong>ศาลเจ้าที่ถูกย้ายแล้วกลายเป็นองค์ประกอบเชิงมรดก ชุมชนที่ถูกเคลียร์หายไปในคำประกาศรางวัล</strong> รางวัลไม่ได้มอบให้ทั้งที่มีการขับไล่ แต่มอบให้เพราะการออกแบบที่ดีทำให้การขับไล่มองไม่เห็น" }
    }
  },
  OUTCOME_DEBT: {
    en: {
      title: "You lost the right to refuse without ruin.",
      lead: "The court did not order you to leave. It ordered that staying costs 122 million baht. Refusal is now a financial act.",
      path: { headline: "Defiance under <em>damages</em>", body: "By refusing to engage with PMCU's offers, you forced the institution to formalise its threat. The threat is now law: every day you remain, you owe more. The shrine stands. The defendants are not in jail. They are simply ruined." },
      real: { headline: "The real <em>122 million baht</em> claim", body: "PMCU filed civil damages against Penprapa Ployseesuay — fourth-generation caretaker — and others personally. The lower court ruled for PMCU in August 2023. The case continues; the damages accrue. Penprapa said: <em>'I will fight until the end.'</em>", source: "Source · Bangkok Civil Court filings 2021–23" },
      mech: { name: "§ M03 · Civil Litigation — staying in your place becomes a debt", cn: "Civil Litigation · staying becomes debt", body: "The lawsuit's purpose is not to evict. <strong>It is to convert the act of remaining from a moral position into a financial liability.</strong> Eviction is brutal and visible; debt is quiet and continuous. The shrine can stand for another decade while the people inside it are made bankrupt by their own dignity." }
    },
    zh: {
      title: "你失去了不至于倾家荡产地拒绝的权利。",
      lead: "法院没有命令你离开。它判定的是：留下，要付一亿两千两百万泰铢。拒绝如今成了一种财务行为。",
      path: { headline: "赔偿之下的<em>抗争</em>", body: "由于拒绝回应 PMCU 的提议，你迫使这个机构把它的威胁正式化。威胁如今成了法律：你留下的每一天，都欠得更多。庙仍立着。被告没有入狱。他们只是倾家荡产。" },
      real: { headline: "真实的一亿两千两百万泰铢<em>索赔</em>", body: "PMCU 对第四代看护者 Penprapa Ployseesuay 等人提起个人民事赔偿。一审法院于 2023 年 8 月判 PMCU 胜诉。案件仍在继续；赔偿不断累积。Penprapa 说：<em>“我会战斗到底。”</em>", source: "来源 · 曼谷民事法院文件 2021–23" },
      mech: { name: "§ M03 · 民事诉讼——留下变成债务", cn: "民事诉讼 · 留下变成债务", body: "这场官司的目的不是驱逐。<strong>而是把“留下”这一行为，从道德立场转化为财务负债。</strong>驱逐是粗暴而显眼的；债务是安静而持续的。庙可以再立十年，而庙里的人却因自己的尊严而破产。" }
    },
    th: {
      title: "คุณเสียสิทธิที่จะปฏิเสธโดยไม่ต้องล่มจม",
      lead: "ศาลไม่ได้สั่งให้คุณออกไป แต่สั่งว่าการอยู่ต่อมีราคา 122 ล้านบาท การปฏิเสธจึงกลายเป็นการกระทำทางการเงิน",
      path: { headline: "การขัดขืนภายใต้<em>ค่าเสียหาย</em>", body: "ด้วยการปฏิเสธที่จะเจรจาข้อเสนอของ PMCU คุณบังคับให้สถาบันทำให้คำขู่ของมันเป็นทางการ คำขู่นั้นกลายเป็นกฎหมาย: ทุกวันที่คุณอยู่ คุณเป็นหนี้มากขึ้น ศาลเจ้ายังตั้งอยู่ จำเลยไม่ได้ติดคุก พวกเขาเพียงแค่ล่มจม" },
      real: { headline: "คดีเรียกค่าเสียหาย <em>122 ล้านบาท</em> ของจริง", body: "PMCU ฟ้องเรียกค่าเสียหายทางแพ่งจากเพ็ญประภา พลอยสีสุข ผู้ดูแลรุ่นที่สี่ และคนอื่น ๆ เป็นการส่วนตัว ศาลชั้นต้นตัดสินให้ PMCU ชนะในเดือนสิงหาคม 2023 คดียังดำเนินอยู่ ค่าเสียหายสะสมเพิ่มขึ้น เพ็ญประภากล่าวว่า <em>‘ฉันจะสู้จนถึงที่สุด’</em>", source: "ที่มา · เอกสารศาลแพ่งกรุงเทพฯ 2021–23" },
      mech: { name: "§ M03 · คดีแพ่ง — การอยู่ต่อกลายเป็นหนี้", cn: "คดีแพ่ง · การอยู่ต่อกลายเป็นหนี้", body: "จุดประสงค์ของคดีไม่ใช่การไล่ที่ <strong>แต่คือการเปลี่ยนการกระทำของการอยู่ต่อ จากจุดยืนทางศีลธรรมให้กลายเป็นภาระทางการเงิน</strong> การไล่ที่นั้นโหดร้ายและมองเห็นได้ ส่วนหนี้นั้นเงียบและต่อเนื่อง ศาลเจ้าอาจตั้งอยู่ได้อีกสิบปี ขณะที่ผู้คนข้างในถูกทำให้ล้มละลายด้วยศักดิ์ศรีของตนเอง" }
    }
  }
};

/* ===================== STATE ===================== */
let currentPersona = null;
let storyHistory = [];
let currentOutcomeId = null;
let lanyardScene = null;

function getText(map, key) {
  return (map[currentLang] && map[currentLang][key]) || (map.en && map.en[key]) || "";
}
function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value == null ? "" : value;
}
function setHtml(id, value) {
  const el = document.getElementById(id);
  if (el) el.innerHTML = value == null ? "" : value;
}
function personaField(persona, key) {
  const byLang = PERSONA_I18N[persona.id] || {};
  return (byLang[currentLang] && byLang[currentLang][key]) ||
    (byLang.en && byLang.en[key]) ||
    persona[key] ||
    "";
}
function personaName(persona) { return personaField(persona, "name") || persona.name; }
function personaRole(persona) { return personaField(persona, "role") || persona.role; }
function localStoryNode(nodeId) {
  const base = STORY.nodes[nodeId];
  const loc = (STORY_I18N[nodeId] && STORY_I18N[nodeId][currentLang]) || {};
  const node = { ...base, ...loc };
  node.choices = base.choices.map((choice, i) => {
    const locChoice = loc.choices && loc.choices[i] ? loc.choices[i] : {};
    return { ...choice, ...locChoice };
  });
  if (nodeId.startsWith("s4_") && node.choices[0]) {
    node.choices[0].text = END_CHOICE_I18N[currentLang] || END_CHOICE_I18N.en;
  }
  return node;
}
function localOutcome(outcomeId) {
  const byLang = OUTCOME_I18N[outcomeId] || {};
  return byLang[currentLang] || byLang.en || OUTCOMES[outcomeId];
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function setJourneyMeta(name) {
  const bar = document.getElementById("metaJourney");
  if (name) { bar.classList.add("show"); document.getElementById("metaJourneyName").textContent = name; }
  else bar.classList.remove("show");
}
function applyStaticLanguage(options = {}) {
  const t = UI_TEXT[currentLang] || UI_TEXT.en;
  document.documentElement.lang = currentLang === "zh" ? "zh-CN" : currentLang;
  document.body.classList.toggle("lang-en", currentLang === "en");
  document.body.classList.toggle("lang-zh", currentLang === "zh");
  document.body.classList.toggle("lang-th", currentLang === "th");
  document.querySelectorAll("#langSwitch button").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.lang === currentLang);
  });

  setText("metaBack", t.metaBack);
  setText("metaTitle", t.metaTitle);
  setText("metaJourneyLabel", t.metaJourneyLabel);
  setText("pickerEyebrow", t.pickerEyebrow);
  setHtml("pickerTitleHtml", t.pickerTitleHtml);
  setText("pickerSubtitle", t.pickerSubtitle);
  setText("pickCtaBody", t.pickCtaBody);
  setText("randomPickBtn", t.randomPickBtn);
  setText("lanyardMetaTop", t.lanyardMetaTop);
  const redrawBtn = document.getElementById("lanyardRedrawBtn");
  if (redrawBtn) redrawBtn.title = t.redrawTitle;
  setText("lanyardBgMain", t.lanyardBgMain);
  setText("lanyardBgSub", t.lanyardBgSub);
  setText("lanyardBgFine", t.lanyardBgFine);
  setText("lanyardDragHint", t.lanyardDragHint);
  setText("stepInBtn", t.stepInBtn);
  setText("storyAsLabel", t.storyAsLabel);
  setText("storyBackBtn", t.storyBackBtn);
  setText("outcomeNum", t.outcomeNum);
  setText("outcomeTagText", t.outcomeTagText);
  setText("outcomePathLabel", t.outcomePathLabel);
  setText("outcomeChoiceSource", t.outcomeChoiceSource);
  setText("outcomeRealLabel", t.outcomeRealLabel);
  setText("outcomeMechanismLabel", t.outcomeMechanismLabel);
  setHtml("outcomeClosingHtml", t.outcomeClosingHtml);
  setText("outcomeRedrawBtn", t.outcomeRedrawBtn);
  setText("outcomeBackArchive", t.outcomeBackArchive);

  if (currentPersona) {
    setJourneyMeta(personaName(currentPersona));
    populateDossier(currentPersona);
    setText("storyAsName", personaName(currentPersona));
  }
  const lanyardActive = document.getElementById("lanyardScreen")?.classList.contains("active");
  if (lanyardActive && currentPersona && lanyardScene) {
    lanyardScene.stop();
    lanyardScene = null;
    launchLanyardScene(currentPersona, currentPersona.seedKey);
  }
  updateProgress();
  if (options.rerender && storyHistory.length && document.getElementById("screenStory").classList.contains("active")) {
    renderStoryNode(storyHistory[storyHistory.length - 1]);
  }
  if (currentOutcomeId && document.getElementById("screenOutcome").classList.contains("active")) {
    showOutcome(currentOutcomeId);
  }
}

/* ----- legible HTML dossier beside the swinging card (source of truth for the info) ----- */
function populateDossier(persona) {
  const labels = (UI_TEXT[currentLang] || UI_TEXT.en).rows;
  setText("dossierName", personaName(persona));
  setText("dossierAltName", personaRole(persona));
  const rows = [
    [labels.age, String(persona.age)],
    [labels.role, personaRole(persona)],
    [labels.origin, personaField(persona, "origin")],
    [labels.home, personaField(persona, "home")],
    [labels.work, personaField(persona, "work")],
    [labels.tie, personaField(persona, "relation")]
  ];
  const rowsEl = document.getElementById("dossierRows");
  if (rowsEl) rowsEl.innerHTML = rows.map(([k, v]) => `<div class="k">${k}</div><div class="v">${v}</div>`).join("");
  setText("dossierBio", personaField(persona, "bio"));
  const fig = document.getElementById("dossierFigure");
  if (fig) fig.style.backgroundImage = persona.img ? `url("${persona.img}")` : "none";
  populateLanyardFallback(persona);
}
function populateLanyardFallback(persona) {
  setText("lanyardFallbackName", personaName(persona));
  setText("lanyardFallbackRole", personaRole(persona));
  const photo = document.getElementById("lanyardFallbackPhoto");
  if (photo) photo.style.backgroundImage = persona.img ? `url("${persona.img}")` : "none";
}
function restartDossierAnim() {
  const d = document.getElementById("lanyardDossier");
  if (!d) return;
  d.style.animation = "none"; void d.offsetWidth; d.style.animation = "";
}

/* ===================== PICKER ===================== */
(function buildPool() {
  const grid = document.getElementById("portraitGrid");
  if (!grid) return;
  for (let i = 0; i < 96; i++) {
    const cell = document.createElement("div");
    cell.className = "portrait-cell";
    const canvas = document.createElement("canvas");
    cell.appendChild(canvas);
    drawFace(canvas, i + 1);
    // grid is a non-interactive "scan" backdrop now — the draw chooses the character
    grid.appendChild(cell);
  }
})();

document.getElementById("langSwitch")?.addEventListener("click", (event) => {
  const btn = event.target.closest("button[data-lang]");
  if (!btn) return;
  currentLang = btn.dataset.lang;
  localStorage.setItem("personaLang", currentLang);
  applyStaticLanguage({ rerender: true });
});
applyStaticLanguage();

document.getElementById("randomPickBtn").addEventListener("click", () => {
  const cells = document.querySelectorAll(".portrait-cell");
  const btn = document.getElementById("randomPickBtn");
  btn.disabled = true;
  const persona = PERSONAS[Math.floor(Math.random() * PERSONAS.length)];
  const pick = cells[Math.floor(Math.random() * cells.length)];
  if (pick) {
    pick.classList.add("picked");
    setTimeout(() => pick.classList.remove("picked"), 520);
  }
  startCapsule(persona, persona.seedKey);
  setTimeout(() => { btn.disabled = false; }, 600);
});

(function handleEntryParams() {
  const params = new URLSearchParams(window.location.search);
  if (params.has("random")) {
    setTimeout(() => {
      const persona = PERSONAS[Math.floor(Math.random() * PERSONAS.length)];
      startCapsule(persona, persona.seedKey);
    }, 500);
  } else if (params.has("seed")) {
    const seed = parseInt(params.get("seed"), 10);
    if (!isNaN(seed)) {
      const persona = PERSONAS[(seed - 1) % PERSONAS.length];
      setTimeout(() => startCapsule(persona, seed), 500);
    }
  }
})();

function launchLanyardScene(persona, seed) {
  const screen = document.getElementById("lanyardScreen");
  if (screen) screen.classList.remove("webgl-ready", "webgl-failed");
  populateLanyardFallback(persona);
  initLanyardScene(persona, seed).catch((err) => {
    console.warn("[lanyard] WebGL scene failed; showing DOM card fallback.", err);
    if (screen) screen.classList.add("webgl-failed");
  });
}

/* ===================== CAPSULE · gachapon draw ===================== */
/* DRAW A CHARACTER → capsule drops / shakes / opens
   → persona assigned → ID card drops out → hand off to the lanyard scene. */
function startCapsule(persona, seed) {
  const scr   = document.getElementById("capsuleScreen");
  const cap   = document.getElementById("capsuleEl");
  const card  = document.getElementById("capsuleCard");
  const flash = document.getElementById("capsuleFlash");
  if (!scr) { beginLanyardTransition(persona, seed); return; }

  const reset = () => { cap.className = "capsule"; card.className = "capsule-card"; flash.className = "capsule-flash"; };
  reset();

  // load the assigned face onto the mini ID card
  const photo = document.getElementById("capCardPhoto");
  if (photo) photo.style.backgroundImage = persona.img ? `url("${persona.img}")` : "none";
  document.getElementById("capCardName").textContent = personaName(persona);
  document.getElementById("capCardAlt").textContent = personaRole(persona);

  scr.classList.add("active");

  requestAnimationFrame(() => cap.classList.add("drop"));

  // shake / rattle
  setTimeout(() => {
    cap.classList.remove("drop"); cap.classList.add("shake");
  }, 840);

  // assign + flash + crack open
  setTimeout(() => {
    cap.classList.remove("shake");
    flash.classList.add("go");
    cap.classList.add("open");
  }, 1800);

  // the card drops out of the capsule
  setTimeout(() => {
    card.classList.add("show");
  }, 2180);

  // hand off directly so the picker never flashes back between overlays
  setTimeout(() => {
    beginLanyardTransition(persona, seed, { instant: true });
    scr.classList.remove("active");
    reset();
  }, 3220);
  setTimeout(() => {
    scr.classList.remove("active");
  }, 4200);
}

/* ==============================================================
   LANYARD · Rapier physics + meshline ribbon + card.glb
   Ported from ReactBits (react-three-rapier + meshline + drei)
   to vanilla three.js for static-site use.
   ============================================================== */
function beginLanyardTransition(persona, seed, opts = {}) {
  currentPersona = persona;
  currentOutcomeId = null;
  setJourneyMeta(personaName(persona));
  populateDossier(persona);
  const lanyard = document.getElementById("lanyardScreen");
  if (opts.instant) {
    document.getElementById("lanyardBlackout").classList.remove("active");
    lanyard.classList.add("active");
    launchLanyardScene(persona, seed);
    return;
  }
  const blackout = document.getElementById("lanyardBlackout");
  blackout.classList.add("active");
  setTimeout(() => {
    blackout.classList.remove("active");
    lanyard.classList.add("active");
    launchLanyardScene(persona, seed);
  }, 400);
}

function endLanyard() {
  document.getElementById("lanyardScreen").classList.remove("active");
  if (lanyardScene) { lanyardScene.stop(); lanyardScene = null; }
  storyHistory = [];
  setText("storyAsName", personaName(currentPersona));
  showScreen("screenStory");
  startStory(STORY.start);
}

document.getElementById("stepInBtn").addEventListener("click", endLanyard);

document.getElementById("lanyardRedrawBtn").addEventListener("click", () => {
  if (lanyardScene) { lanyardScene.stop(); lanyardScene = null; }
  const blackout = document.getElementById("lanyardBlackout");
  blackout.classList.add("active");
  setTimeout(() => {
    blackout.classList.remove("active");
    const persona = PERSONAS[Math.floor(Math.random() * PERSONAS.length)];
    currentPersona = persona;
    currentOutcomeId = null;
    setJourneyMeta(personaName(persona));
    populateDossier(persona);
    restartDossierAnim();
    launchLanyardScene(persona, persona.seedKey);
  }, 320);
});

/* ----- ribbon texture: deep-ink band with repeating ✿ flowers ----- */
function makeRibbonTexture() {
  const W = 256, H = 1024;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#0c0a14"; ctx.fillRect(0, 0, W, H);
  // weave noise
  for (let i = 0; i < 4000; i++) {
    const x = Math.random() * W, y = Math.random() * H;
    ctx.fillStyle = `rgba(168, 149, 199, ${Math.random() * 0.08})`;
    ctx.fillRect(x, y, 1, 1);
  }
  // soft edge darkening — fabric look
  const edge = ctx.createLinearGradient(0, 0, W, 0);
  edge.addColorStop(0, "rgba(0,0,0,0.55)");
  edge.addColorStop(0.5, "rgba(255,255,255,0.04)");
  edge.addColorStop(1, "rgba(0,0,0,0.55)");
  ctx.fillStyle = edge; ctx.fillRect(0, 0, W, H);
  // repeating ✿ flower glyphs
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  const glyphCount = 8;
  for (let i = 0; i < glyphCount; i++) {
    const y = (i + 0.5) * (H / glyphCount);
    ctx.save();
    ctx.translate(W / 2, y);
    drawFlowerGlyph(ctx, 26);
    ctx.restore();
  }
  return c;
}
function drawFlowerGlyph(ctx, r) {
  ctx.fillStyle = "rgba(245, 241, 232, 0.92)";
  for (let p = 0; p < 5; p++) {
    const a = (p / 5) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.42, r * 0.28, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(12, 10, 20, 0.9)";
  ctx.beginPath(); ctx.arc(0, 0, r * 0.22, 0, Math.PI * 2); ctx.fill();
}

/* ----- try several urls, resolve with the first .glb that loads ----- */
function loadFirstGLB(loader, urls) {
  return new Promise((resolve, reject) => {
    let i = 0;
    const tryNext = () => {
      if (i >= urls.length) { reject(new Error("no card.glb found")); return; }
      const url = urls[i++];
      loader.load(url, resolve, undefined, () => tryNext());
    };
    tryNext();
  });
}

/* ----- main scene ----- */
async function initLanyardScene(persona, seed) {
  const THREE = await import("https://esm.sh/three@0.160.0");
  const { GLTFLoader } = await import("https://esm.sh/three@0.160.0/examples/jsm/loaders/GLTFLoader.js");
  const RAPIER = (await import("https://esm.sh/@dimforge/rapier3d-compat@0.14.0")).default;
  const { MeshLineGeometry, MeshLineMaterial } = await import("https://esm.sh/meshline@3.3.1?deps=three@0.160.0");

  await RAPIER.init();
  // make sure the brand fonts are ready before we bake them into the card texture
  try { await document.fonts.ready; } catch {}
  // Real head crop on the swinging card. PERSONA_FACE_DATA holds base64 data URLs
  // (pre-cropped head squares) which do NOT taint the canvas — so the real photo
  // renders even under file://. Falls back to the on-disk PNG, then the pixel face.
  const faceData = (typeof PERSONA_FACE_DATA !== "undefined") ? PERSONA_FACE_DATA[persona.id] : null;
  const portraitPreCropped = !!faceData;
  const portraitImg = await loadImage(faceData || persona.img);

  const canvas = document.getElementById("lanyardCanvas");
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.5;   // pale card art was clipping to white

  // camera matches the ReactBits sample (fov 20, position z≈20 → small object in the middle)
  const aspect = canvas.clientWidth / canvas.clientHeight;
  const camera = new THREE.PerspectiveCamera(20, aspect, 0.1, 1000);
  camera.position.set(0, 0, 20);

  const scene = new THREE.Scene();

  // lighting — toned down so the pale card reads without blowing out to white
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const rect1 = new THREE.RectAreaLight(0xffffff, 0.8, 100, 0.1);
  rect1.position.set(0, -1, 5); rect1.rotation.z = Math.PI / 3; scene.add(rect1);
  const rect2 = new THREE.RectAreaLight(0xffffff, 1.1, 100, 0.1);
  rect2.position.set(-1, -1, 1); rect2.rotation.z = Math.PI / 3; scene.add(rect2);
  const rect3 = new THREE.RectAreaLight(0xffffff, 1.1, 100, 0.1);
  rect3.position.set(1, 1, 1); rect3.rotation.z = Math.PI / 3; scene.add(rect3);
  const rect4 = new THREE.RectAreaLight(0xffffff, 3, 100, 10);
  rect4.position.set(-10, 0, 14); rect4.lookAt(0, 0, 0); scene.add(rect4);

  /* ----- physics world ----- */
  const world = new RAPIER.World({ x: 0, y: -24, z: 0 });
  const segmentProps = { angularDamping: 16, linearDamping: 12 };

  // bodies — replicate the original: fixed anchor, then 3 spheres, then card
  function makeRBody(type, x, y, z) {
    let desc;
    if (type === "fixed") desc = RAPIER.RigidBodyDesc.fixed();
    else if (type === "kinematic") desc = RAPIER.RigidBodyDesc.kinematicPositionBased();
    else desc = RAPIER.RigidBodyDesc.dynamic();
    desc.setTranslation(x, y, z);
    desc.setAngularDamping(segmentProps.angularDamping);
    desc.setLinearDamping(segmentProps.linearDamping);
    desc.setCanSleep(true);
    return world.createRigidBody(desc);
  }

  // Begin nearly vertical so the lanyard settles instead of snapping across the frame.
  const groupOffsetY = 3.7;
  const fixed = makeRBody("fixed", 0, groupOffsetY, 0);
  const j1 = makeRBody("dynamic", 0.18, groupOffsetY - 0.72, 0);
  const j2 = makeRBody("dynamic", 0.34, groupOffsetY - 1.42, 0);
  const j3 = makeRBody("dynamic", 0.48, groupOffsetY - 2.12, 0);
  const cardBody = makeRBody("dynamic", 0.48, groupOffsetY - 3.42, 0);

  // colliders — small balls on the 3 segments, cuboid on the card
  const ballRadius = 0.1;
  world.createCollider(RAPIER.ColliderDesc.ball(ballRadius), j1);
  world.createCollider(RAPIER.ColliderDesc.ball(ballRadius), j2);
  world.createCollider(RAPIER.ColliderDesc.ball(ballRadius), j3);
  world.createCollider(RAPIER.ColliderDesc.cuboid(0.8, 1.125, 0.01), cardBody);

  // joints — rope length 1 between successive points, spherical at card top
  function ropeJoint(b1, b2, len) {
    const params = RAPIER.JointData.rope(len, { x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 0 });
    world.createImpulseJoint(params, b1, b2, true);
  }
  ropeJoint(fixed, j1, 0.86);
  ropeJoint(j1, j2, 0.86);
  ropeJoint(j2, j3, 0.86);
  // spherical joint at the top of the card — anchor [0,1.5,0] in card local space
  const sphParams = RAPIER.JointData.spherical({ x: 0, y: 0, z: 0 }, { x: 0, y: 1.5, z: 0 });
  world.createImpulseJoint(sphParams, j3, cardBody, true);

  /* ----- load card.glb (try a few filenames so it works regardless of how it was saved) ----- */
  const gltfLoader = new GLTFLoader();
  let cardGroup;
  try {
    const gltf = await loadFirstGLB(gltfLoader, ["card.glb", "card (1).glb", "assets/card.glb"]);
    cardGroup = new THREE.Group();
    // mirror the original: <group scale={2.25} position={[0,-1.2,-0.05]}>
    const inner = new THREE.Group();
    inner.scale.setScalar(2.25);
    inner.position.set(0, -1.2, -0.05);
    // walk scene and pick up meshes by name
    gltf.scene.traverse((obj) => {
      if (obj.isMesh) {
        const name = obj.name;
        if (name === "card") {
          // paint THIS persona onto the card face — the dropped card is genuinely theirs,
          // not the generic baked art that shipped with the model.
          const personaTex = new THREE.CanvasTexture(makeCardTexture(persona, seed, portraitImg, portraitPreCropped));
          personaTex.colorSpace = THREE.SRGBColorSpace;
          personaTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
          personaTex.needsUpdate = true;
          const newMat = new THREE.MeshPhysicalMaterial({
            map: personaTex,
            side: THREE.DoubleSide,
            clearcoat: 0.25,         // was 1 — heavy clearcoat added a white sheen
            clearcoatRoughness: 0.6,
            roughness: 0.85,
            metalness: 0.0           // low metalness keeps the dossier text readable
          });
          obj.material = newMat;
        } else if (name === "clip" || name === "clamp") {
          if (obj.material) {
            obj.material.roughness = name === "clip" ? 0.3 : (obj.material.roughness ?? 0.5);
            obj.material.metalness = 0.9;
          }
        }
        inner.add(obj.clone());
      }
    });
    cardGroup.add(inner);
    scene.add(cardGroup);
  } catch (err) {
    console.warn("[lanyard] card.glb load failed, falling back to canvas card:", err);
    // fallback: textured plane
    const cardTex = new THREE.CanvasTexture(makeCardTexture(persona, seed, portraitImg, portraitPreCropped));
    cardTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    cardTex.needsUpdate = true;
    cardGroup = new THREE.Mesh(
      new THREE.PlaneGeometry(1.6, 2.25),
      new THREE.MeshStandardMaterial({ map: cardTex, side: THREE.DoubleSide, roughness: 0.6 })
    );
    scene.add(cardGroup);
  }

  /* ----- ribbon (meshline) ----- */
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()
  ]);
  curve.curveType = "chordal";

  const ribbonTex = new THREE.CanvasTexture(makeRibbonTexture());
  ribbonTex.wrapS = ribbonTex.wrapT = THREE.RepeatWrapping;
  ribbonTex.anisotropy = renderer.capabilities.getMaxAnisotropy();

  const lineGeo = new MeshLineGeometry();
  const lineMat = new MeshLineMaterial({
    color: new THREE.Color(0xffffff),
    map: ribbonTex,
    useMap: 1,
    lineWidth: 1,
    repeat: new THREE.Vector2(-4, 1),
    resolution: new THREE.Vector2(canvas.clientWidth, canvas.clientHeight),
    depthTest: false,
    transparent: true,
    sizeAttenuation: 1
  });
  const ribbonMesh = new THREE.Mesh(lineGeo, lineMat);
  scene.add(ribbonMesh);

  /* ----- interaction (pointer-based drag) ----- */
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  let dragged = null; // THREE.Vector3 offset, or null
  let hovered = false;

  function setNDC(cx, cy) {
    const rect = canvas.getBoundingClientRect();
    ndc.x = ((cx - rect.left) / rect.width) * 2 - 1;
    ndc.y = -((cy - rect.top) / rect.height) * 2 + 1;
  }
  function pointerWorld(cx, cy) {
    setNDC(cx, cy);
    const v = new THREE.Vector3(ndc.x, ndc.y, 0.5).unproject(camera);
    const dir = v.sub(camera.position).normalize();
    // project to z=0 plane (matches original logic: vec.add(dir.multiplyScalar(camera.position.length())))
    const camLen = camera.position.length();
    return camera.position.clone().add(dir.multiplyScalar(camLen));
  }
  canvas.addEventListener("pointerdown", (e) => {
    setNDC(e.clientX, e.clientY);
    raycaster.setFromCamera(ndc, camera);
    const hits = raycaster.intersectObject(cardGroup, true);
    if (hits.length > 0) {
      const t = cardBody.translation();
      const w = pointerWorld(e.clientX, e.clientY);
      dragged = new THREE.Vector3(w.x - t.x, w.y - t.y, w.z - t.z);
      // switch card to kinematic for drag (matches original `type={dragged?'kinematicPosition':'dynamic'}`)
      cardBody.setBodyType(RAPIER.RigidBodyType.KinematicPositionBased, true);
      canvas.setPointerCapture(e.pointerId);
      canvas.style.cursor = "grabbing";
    }
  });
  canvas.addEventListener("pointermove", (e) => {
    if (dragged) {
      const w = pointerWorld(e.clientX, e.clientY);
      cardBody.setNextKinematicTranslation({ x: w.x - dragged.x, y: w.y - dragged.y, z: w.z - dragged.z });
      [cardBody, j1, j2, j3, fixed].forEach(b => b.wakeUp());
    } else {
      setNDC(e.clientX, e.clientY);
      raycaster.setFromCamera(ndc, camera);
      const hits = raycaster.intersectObject(cardGroup, true);
      const nowHover = hits.length > 0;
      if (nowHover !== hovered) {
        hovered = nowHover;
        canvas.style.cursor = hovered ? "grab" : "default";
      }
    }
  });
  function releaseDrag(e) {
    if (dragged) {
      dragged = null;
      cardBody.setBodyType(RAPIER.RigidBodyType.Dynamic, true);
      try { canvas.releasePointerCapture(e.pointerId); } catch {}
      canvas.style.cursor = hovered ? "grab" : "default";
    }
  }
  canvas.addEventListener("pointerup", releaseDrag);
  canvas.addEventListener("pointerleave", (e) => { releaseDrag(e); });

  /* ----- render loop ----- */
  let running = true;
  let lastT = performance.now();
  // lerped positions for j1/j2 — matches the original's smoothing logic
  const lerped = { j1: null, j2: null };

  function tick() {
    if (!running) return;
    const now = performance.now();
    const delta = Math.min((now - lastT) / 1000, 0.033);
    lastT = now;

    world.step();

    // smooth j1/j2 positions (matches the lerped/clampedDistance logic in original)
    [["j1", j1], ["j2", j2]].forEach(([key, body]) => {
      const t = body.translation();
      if (!lerped[key]) lerped[key] = new THREE.Vector3(t.x, t.y, t.z);
      const target = new THREE.Vector3(t.x, t.y, t.z);
      const clamped = Math.max(0.1, Math.min(1, lerped[key].distanceTo(target)));
      const maxSpeed = 16, minSpeed = 0;   // gentler follow → ribbon stops snapping/jittering
      lerped[key].lerp(target, delta * (minSpeed + clamped * (maxSpeed - minSpeed)));
    });

    // build curve from j3 → j2 → j1 → fixed
    const tJ3 = j3.translation();
    const tFixed = fixed.translation();
    curve.points[0].set(tJ3.x, tJ3.y, tJ3.z);
    curve.points[1].copy(lerped.j2);
    curve.points[2].copy(lerped.j1);
    curve.points[3].set(tFixed.x, tFixed.y, tFixed.z);
    const pts = curve.getPoints(32);
    lineGeo.setPoints(pts);

    // damp card spin and keep the card from jittering at the end of the band
    const av = cardBody.angvel();
    const rot = cardBody.rotation();
    cardBody.setAngvel({
      x: av.x * 0.9 - rot.x * 0.1,
      y: av.y * 0.9 - rot.y * 0.1,
      z: av.z * 0.9 - rot.z * 0.1
    }, true);

    // sync visual card group to physics body
    const tC = cardBody.translation();
    const rC = cardBody.rotation();
    cardGroup.position.set(tC.x, tC.y, tC.z);
    cardGroup.quaternion.set(rC.x, rC.y, rC.z, rC.w);

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }
  tick();
  document.getElementById("lanyardScreen")?.classList.add("webgl-ready");

  function onResize() {
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    lineMat.resolution.set(canvas.clientWidth, canvas.clientHeight);
  }
  window.addEventListener("resize", onResize);

  lanyardScene = {
    stop: () => {
      running = false;
      window.removeEventListener("resize", onResize);
      try { world.free(); } catch {}
      lineGeo.dispose(); lineMat.dispose(); ribbonTex.dispose();
      renderer.dispose();
    }
  };
}

/* ----- wrap a string to N lines inside maxW; returns extra height used beyond line 1 ----- */
function wrapCanvasText(ctx, text, x, y, maxW, lineH, maxLines) {
  const words = String(text).split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; if (lines.length === maxLines) break; }
    else line = test;
  }
  if (line && lines.length < maxLines) lines.push(line);
  if (lines.length === maxLines) {
    let last = lines[maxLines - 1];
    if (ctx.measureText(last).width > maxW) {
      while (ctx.measureText(last + "…").width > maxW && last.length) last = last.slice(0, -1);
      lines[maxLines - 1] = last + "…";
    }
  }
  lines.forEach((ln, i) => ctx.fillText(ln, x, y + i * lineH));
  return (lines.length - 1) * lineH;
}

/* ----- card face texture · painted onto the card.glb (or the fallback plane) -----
   High-res so the name + dossier read crisply on the swinging 3D card. ----- */
function makeCardTexture(persona, seed, portraitImg, preCropped) {
  const W = 1024, H = 1440;          // 0.711 aspect — matches the card collider/UV
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const ctx = c.getContext("2d");

  // --- base: pale lavender-bone laminate with faint grain ---
  ctx.fillStyle = "#f3ecff"; ctx.fillRect(0, 0, W, H);
  for (let i = 0; i < 4200; i++) {
    ctx.fillStyle = `rgba(42, 27, 61, ${Math.random() * 0.04})`;
    ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
  }
  ctx.strokeStyle = "rgba(42, 27, 61, 0.22)"; ctx.lineWidth = 3;
  ctx.strokeRect(36, 36, W - 72, H - 72);

  // --- punch slot at the top (where the clip bites) ---
  ctx.fillStyle = "#2a1b3d";
  ctx.fillRect(W / 2 - 72, 58, 144, 16);

  // --- slim header: keep the dropped card closer to the simple nameplate reference ---
  const bandY = 122, bandH = 58;
  ctx.fillStyle = "rgba(95, 184, 146, 0.12)";
  ctx.fillRect(64, bandY, W - 128, bandH);
  ctx.fillStyle = "rgba(42, 27, 61, 0.68)";
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.font = "600 24px 'JetBrains Mono', monospace";
  ctx.fillText("§ PERSONA · BLOCK 33", 86, bandY + bandH / 2);

  // --- portrait: real head crop if available, else the pixel face, on a dark inset ---
  const pSize = 520;
  const pX = (W - pSize) / 2, pY = bandY + bandH + 64;
  ctx.fillStyle = "#3e3367"; ctx.fillRect(pX - 14, pY - 14, pSize + 28, pSize + 28);
  if (portraitImg && portraitImg.width) {
    ctx.save();
    ctx.beginPath(); ctx.rect(pX, pY, pSize, pSize); ctx.clip();
    ctx.fillStyle = "#e8def5"; ctx.fillRect(pX, pY, pSize, pSize);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = "high";
    if (preCropped) {
      // PERSONA_FACE_DATA is already a head square — paint it straight in.
      ctx.drawImage(portraitImg, pX, pY, pSize, pSize);
    } else {
      // crop a square around the head (top-centre) from the full-body portrait.
      // tweak hc.x / hc.y / hc.w (fractions of the source image) to reframe a head.
      const hc = (persona.headCrop || { x: 0.315, y: 0.025, w: 0.37 });
      const iw = portraitImg.width, ih = portraitImg.height;
      const sw = iw * hc.w, sh = sw;            // square crop
      const sx = iw * hc.x, sy = ih * hc.y;
      ctx.drawImage(portraitImg, sx, sy, sw, sh, pX, pY, pSize, pSize);
    }
    ctx.restore();
  } else {
    const tmp = document.createElement("canvas");
    drawFace(tmp, seed || persona.seedKey);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(tmp, pX, pY, pSize, pSize);
    ctx.imageSmoothingEnabled = true;
  }
  ctx.strokeStyle = "#5fb892"; ctx.lineWidth = 7;
  ctx.strokeRect(pX - 14, pY - 14, pSize + 28, pSize + 28);

  // --- name ---
  let ny = pY + pSize + 126;
  ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
  ctx.fillStyle = "#1a1428"; ctx.font = "italic 92px 'Fraunces', serif";
  ctx.fillText(personaName(persona), W / 2, ny);
  ctx.fillStyle = "#6b577e";
  ctx.font = currentLang === "th" ? "400 40px 'Noto Sans Thai', sans-serif" : "400 40px 'Noto Serif SC', serif";
  wrapCanvasText(ctx, personaRole(persona), W / 2, ny + 62, W - 170, 48, 2);

  // --- footer · composite-character disclosure ---
  ctx.fillStyle = "rgba(95, 184, 146, 0.12)";
  ctx.fillRect(96, H - 158, W - 192, 48);
  ctx.textAlign = "center"; ctx.fillStyle = "#6b577e";
  ctx.font = "500 22px 'JetBrains Mono', monospace";
  ctx.fillText((UI_TEXT[currentLang] || UI_TEXT.en).dossierFoot, W / 2, H - 126);

  return c;
}

/* ===================== TYPEWRITER ===================== */
function typeWrite(target, html, opts = {}) {
  const speed = opts.speed || 32;
  const onDone = opts.onDone || (() => {});
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  const items = [];
  function walk(node, em) {
    for (const ch of node.childNodes) {
      if (ch.nodeType === 3) for (const c of ch.textContent) items.push({ char: c, em });
      else if (ch.nodeType === 1) walk(ch, em || ch.tagName.toLowerCase() === "em");
    }
  }
  walk(tmp, false);
  target.innerHTML = '<span class="typed"></span><span class="typewriter-cursor"></span>';
  const typedEl = target.querySelector(".typed");
  const cursorEl = target.querySelector(".typewriter-cursor");
  let i = 0, currentEm = false, emBuffer = "", normalBuffer = "";
  function flush() {
    if (normalBuffer) { typedEl.appendChild(document.createTextNode(normalBuffer)); normalBuffer = ""; }
    if (emBuffer) { const e = document.createElement("em"); e.textContent = emBuffer; typedEl.appendChild(e); emBuffer = ""; }
  }
  function step() {
    if (i >= items.length) { flush(); cursorEl.classList.add("done"); onDone(); return; }
    const it = items[i];
    if (it.em !== currentEm) { flush(); currentEm = it.em; }
    if (currentEm) emBuffer += it.char; else normalBuffer += it.char;
    flush();
    i++;
    const ch = it.char;
    let delay = speed;
    if (ch === "." || ch === "," || ch === ";" || ch === ":") delay = speed * 2.2;
    else if (ch === " ") delay = speed * 0.35;
    setTimeout(step, delay);
  }
  step();
}

/* ===================== STORY ===================== */
function startStory(nodeId) { storyHistory.push(nodeId); renderStoryNode(nodeId); }
function renderStoryNode(nodeId) {
  const node = localStoryNode(nodeId);
  if (!node) return;
  const card = document.getElementById("storyCard");
  card.classList.add("exiting");
  setTimeout(() => {
    card.classList.remove("exiting");
    const tickSvg = `<span class="choice-tick"><svg viewBox="0 0 22 22"><path d="M5 11 L9.5 15 L17 7"/></svg></span>`;
    const choicesHtml = node.choices.map(c => `
      <button class="story-choice" data-letter="${c.letter}" data-next="${c.next}">
        <span class="choice-box">${tickSvg}</span>
        <span class="choice-letter">${c.letter}</span>
        <span class="choice-text">${c.text}${c.meta ? `<span class="choice-meta">${c.meta}</span>` : ""}</span>
      </button>
    `).join("");
    card.innerHTML = `
      <div class="story-card-scene">${node.scene}</div>
      <h3 class="story-card-prompt" id="storyPromptText"></h3>
      <p class="story-card-subprompt" id="storySubprompt">${node.sub || ""}</p>
      <div class="story-choices" id="storyChoices">${choicesHtml}</div>
    `;
    const promptEl = document.getElementById("storyPromptText");
    const subEl = document.getElementById("storySubprompt");
    const choiceEls = card.querySelectorAll(".story-choice");

    choiceEls.forEach(btn => {
      btn.addEventListener("click", () => {
        choiceEls.forEach(b => { b.disabled = true; if (b !== btn) b.classList.add("dimmed"); });
        btn.classList.add("selected");
        const next = btn.dataset.next;
        setTimeout(() => {
          if (next.startsWith("OUTCOME_")) showOutcome(next);
          else { storyHistory.push(next); updateProgress(); renderStoryNode(next); }
        }, 720);
      });
    });

    typeWrite(promptEl, node.prompt, {
      speed: 11,
      onDone: () => {
        setTimeout(() => {
          subEl.classList.add("in");
          setTimeout(() => {
            choiceEls.forEach((el, i) => setTimeout(() => el.classList.add("in"), i * 110));
          }, 160);
        }, 120);
      }
    });
    updateProgress();
  }, 240);
}
function updateProgress() {
  const steps = document.querySelectorAll(".story-progress-step");
  const stepNum = storyHistory.length;
  const label = String(stepNum).padStart(2, "0");
  const t = UI_TEXT[currentLang] || UI_TEXT.en;
  setHtml("storyPathMeta", `${t.storyPathPrefix} <span id="storyStepNum">${label}</span> / 04`);
  steps.forEach((step, i) => {
    step.classList.remove("active", "current");
    if (i < stepNum - 1) step.classList.add("active");
    else if (i === stepNum - 1) step.classList.add("current");
  });
}
document.getElementById("storyBackBtn").addEventListener("click", () => {
  currentOutcomeId = null; setJourneyMeta(null); showScreen("screenPicker");
});

/* ===================== OUTCOME ===================== */
function showOutcome(outcomeId) {
  currentOutcomeId = outcomeId;
  const o = localOutcome(outcomeId);
  if (!o) return;
  document.getElementById("outcomeTitle").textContent = o.title;
  document.getElementById("outcomeLead").textContent = o.lead;
  document.getElementById("outcomePathHeadline").innerHTML = o.path.headline;
  document.getElementById("outcomePathBody").textContent = o.path.body;
  document.getElementById("outcomeRealHeadline").innerHTML = o.real.headline;
  document.getElementById("outcomeRealBody").innerHTML = o.real.body;
  document.getElementById("outcomeRealSource").textContent = o.real.source;
  document.getElementById("outcomeMechName").textContent = o.mech.name;
  document.getElementById("outcomeMechCn").textContent = o.mech.cn;
  document.getElementById("outcomeMechBody").innerHTML = o.mech.body;
  showScreen("screenOutcome");
}
document.getElementById("outcomeRedrawBtn").addEventListener("click", () => {
  currentOutcomeId = null; setJourneyMeta(null); showScreen("screenPicker");
});
