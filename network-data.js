/* network-data.js — enriched Chula Powermap network
   Extracted from the chula0412 relational board.
   type: actor | instrument | event | site
   stance: threat | complicit | neutral | defender | shrine   (poster colour scale)
   year: optional (events)
*/
const NET_NODES = [
  /* ===================== SITES ===================== */
  { id:"S05", type:"site", stance:"shrine", name:"Sanjao Mae Thapthim Shrine", cn:"妈祖庙 · 33街区", flagship:true,
    note:"The ~150-year-old Teochew shrine at the centre of every line on this board. It predates Chulalongkorn University itself (founded 1917), yet sits on a parcel (Block 33) PMCU has marked for commercial conversion. <em>Everything else is arranged around whether it stays.</em>" },
  { id:"S01", type:"site", stance:"neutral", name:"Scala Theatre", cn:"斯卡拉影院",
    note:"Modernist 1969 cinema. Lease not renewed, demolished 2021 — the rehearsal case activists now invoke as a warning for the shrine." },
  { id:"S02", type:"site", stance:"neutral", name:"Two Kings Monument", cn:"二王纪念碑",
    note:"Civic monument node within the Sam Yan corridor." },
  { id:"S03", type:"site", stance:"neutral", name:"Chamchuri Square", cn:"占猜里广场",
    note:"CU commercial tower with a troubled 1990s build, rescued by PMCU funds — an early demonstration of CU acting as developer." },
  { id:"S04", type:"site", stance:"neutral", name:"Samyan Mitrtown", cn:"三聚同心商城",
    note:"Flagship 9-billion-baht mixed-use mall (opened 2019) on land cleared of the old Sam Yan market. ~80,000 daily visitors; original vendors largely absent." },
  { id:"S06", type:"site", stance:"neutral", name:"I-House", cn:"国际学舍",
    note:"International House residence within the CU estate." },
  { id:"S07", type:"site", stance:"neutral", name:"Former Church Area", cn:"旧教堂区",
    note:"Cleared religious/community site in the corridor." },
  { id:"S08", type:"site", stance:"neutral", name:"Comm/Edu Faculty · Block 33", cn:"传媒/教育学院 · 33街区",
    note:"Faculty buildings on the Block 33 redevelopment footprint immediately around the shrine." },
  { id:"S09", type:"site", stance:"neutral", name:"Centenary Park", cn:"百年公园",
    note:"Award-winning 28-rai park (2017) on cleared Teochew shophouses. The ASLA citation centres ecology, not displacement." },
  { id:"S10", type:"site", stance:"neutral", name:"Suanluang Square", cn:"苏安隆广场",
    note:"Former Sieng Kong Teochew shophouse hub, cleared mid-2010s ahead of the park." },

  /* ===================== ACTORS — institutional / threat side ===================== */
  { id:"A01", type:"actor", stance:"threat", name:"PMCU", cn:"朱拉物业", flagship:true,
    note:"Property Management of Chulalongkorn University. Files the lawsuits, declines lease renewals, signs the commercial leases. <em>The operational hub of every case on this board.</em>" },
  { id:"A02", type:"actor", stance:"threat", name:"CU Admin", cn:"朱拉行政",
    note:"University administration; sets the institutional policy PMCU executes." },
  { id:"A21", type:"actor", stance:"threat", name:"Bangkok South Civil Court", cn:"曼谷南区民事法院",
    note:"Forum for the damages claim; ruled for PMCU in the lower court (2023)." },
  { id:"A28", type:"actor", stance:"complicit", name:"Charoen Sirivadhanabhakdi", cn:"苏旭明",
    note:"Billionaire owner of TCC Group / Frasers — capital behind the Mitrtown development." },
  { id:"A47", type:"actor", stance:"complicit", name:"TCC Group", cn:"TCC集团",
    note:"Charoen's conglomerate; parent of the Mitrtown developer." },
  { id:"A03", type:"actor", stance:"complicit", name:"Frasers Property Thailand", cn:"Frasers 泰国",
    note:"Absorbed GOLD (2019); develops and operates Samyan Mitrtown." },
  { id:"A30", type:"actor", stance:"complicit", name:"Golden Land Property Dev (GOLD)", cn:"金色置地",
    note:"Original Mitrtown developer before being folded into Frasers." },
  { id:"A31", type:"actor", stance:"complicit", name:"Central Pattana (CPN)", cn:"尚泰置地",
    note:"Took over the Scala site lease in 2021 after demolition." },
  { id:"A05", type:"actor", stance:"complicit", name:"MBK Group", cn:"MBK集团",
    note:"Adjacent commercial landlord/operator in the corridor." },
  { id:"A35", type:"actor", stance:"complicit", name:"Apex Group", cn:"Apex集团",
    note:"Former Scala / Siam-area cinema operator." },
  { id:"A06", type:"actor", stance:"complicit", name:"CB Richard Ellis (CBRE)", cn:"世邦魏理仕",
    note:"Real-estate advisory valuing the land at 'highest and best use'." },
  { id:"A09", type:"actor", stance:"complicit", name:"Khun Preecha Khunakridatikarn", cn:"坤普利查",
    note:"Property-side figure in the redevelopment." },
  { id:"A10", type:"actor", stance:"complicit", name:"N7A", cn:"N7A",
    note:"Project / architecture firm in the developer chain." },
  { id:"A32", type:"actor", stance:"complicit", name:"True Corp / DTAC", cn:"True / DTAC",
    note:"Anchor commercial tenant of the new developments." },
  { id:"A33", type:"actor", stance:"complicit", name:"Ruam Nakhon Construction", cn:"楼盘承建商",
    note:"Primary (p1) contractor." },
  { id:"A34", type:"actor", stance:"complicit", name:"Powerline Engineering PCL", cn:"Powerline 工程",
    note:"Secondary (p2) contractor / MEP." },
  { id:"A36", type:"actor", stance:"complicit", name:"CU UddC (Urban Design & Dev Center)", cn:"朱拉城市设计中心",
    note:"Designs the master-plan vision that frames clearance as 'upgrade'." },
  { id:"A45", type:"actor", stance:"complicit", name:"Sasin (CU Business School)", cn:"萨辛商学院",
    note:"Business-school logic underwriting the land-value argument." },
  { id:"A48", type:"actor", stance:"complicit", name:"Privy Council", cn:"枢密院",
    note:"Royal advisory body; lends institutional weight to CU's landholding." },
  { id:"A24", type:"actor", stance:"complicit", name:"Thai Government", cn:"泰国政府",
    note:"Sets the Thailand 4.0 / smart-city policy the projects align to." },
  { id:"A29", type:"actor", stance:"complicit", name:"Pathumwan District Office", cn:"巴吞旺区办事处",
    note:"Local authority issuing permits within the district." },
  { id:"A23", type:"actor", stance:"complicit", name:"Thai Green Building Institute", cn:"泰国绿建协会",
    note:"Green-certification body lending eco-credibility to redevelopment." },
  { id:"A11", type:"actor", stance:"complicit", name:"Landprocess (Kotchakorn Voraakhom)", cn:"土地工序",
    note:"Landscape architects of Centenary Park; ASLA-awarded. Narrative emphasises ecology, not displacement." },

  /* ===================== ACTORS — neutral / state ===================== */
  { id:"A18", type:"actor", stance:"neutral", name:"BMA (Bangkok Metropolitan Admin)", cn:"曼谷都市管理局",
    note:"City government; building control and infrastructure." },
  { id:"A19", type:"actor", stance:"neutral", name:"Fine Arts Department", cn:"艺术厅",
    note:"Administers the 1961 Ancient Monuments Act. Notably absent for Chinese-diaspora vernacular heritage." },
  { id:"A20", type:"actor", stance:"neutral", name:"Central Administrative Court", cn:"中央行政法院",
    note:"Forum for administrative-law challenges." },
  { id:"A37", type:"actor", stance:"neutral", name:"Enforcement Directorate", cn:"执行局",
    note:"Carries out court-ordered enforcement." },
  { id:"A44", type:"actor", stance:"neutral", name:"Crown Property / Privy Purse Bureau", cn:"王室财产局",
    note:"Crown-land steward, structurally adjacent to CU's royal grant." },

  /* ===================== ACTORS — defender side ===================== */
  { id:"A12", type:"actor", stance:"defender", name:"Khun Nok (Penprapa Ployseesuay)", cn:"庙看护者 潘普拉帕", flagship:true,
    note:"Fourth-generation caretaker of the shrine and named defendant in the civil claim. Public figure since 2020. <em>'I will fight until the end.'</em>" },
  { id:"A15", type:"actor", stance:"defender", name:"Thai-Chinese (Teochew) community", cn:"潮州华人社群", flagship:true,
    note:"The diaspora community whose living vernacular heritage is at stake across Sam Yan, Suan Luang and the shrine." },
  { id:"A13", type:"actor", stance:"defender", name:"Netiwit Chotiphatphaisal", cn:"纳缇维",
    note:"Student activist; founded Sam Yan Press; explicitly invokes Scala as the warning case." },
  { id:"A14", type:"actor", stance:"defender", name:"CU Students", cn:"朱拉学生",
    note:"Student movement backing the shrine and pressing the administration." },
  { id:"A17", type:"actor", stance:"defender", name:"Sam Yan Press", cn:"三聚出版",
    note:"Independent outlet documenting the corridor's clearances." },
  { id:"A25", type:"actor", stance:"defender", name:"International Media", cn:"国际媒体",
    note:"Outside coverage that raised the reputational cost of clearance." },
  { id:"A22", type:"actor", stance:"defender", name:"Assoc. of Siamese Architects (ASA)", cn:"暹罗建筑师协会",
    note:"Professional body issuing heritage recognition — culturally weighty, but with no statutory teeth." },
  { id:"A26", type:"actor", stance:"defender", name:"Duangrit Bunnag", cn:"杜安格里·布纳",
    note:"Prominent architect voicing preservation arguments publicly." },
  { id:"A27", type:"actor", stance:"defender", name:"Thammasat University", cn:"法政大学",
    note:"Academic ally producing critical scholarship on the case." },
  { id:"A38", type:"actor", stance:"defender", name:"Educational Institutions (GSD et al)", cn:"学术机构 (GSD等)",
    note:"Harvard GSD and others critiquing the redevelopment model." },
  { id:"A40", type:"actor", stance:"defender", name:"Chatri Prakitnonthakan", cn:"查特里",
    note:"Architectural historian writing on the corridor's heritage." },
  { id:"A41", type:"actor", stance:"defender", name:"Wasana Wongsurawat", cn:"瓦萨纳",
    note:"Historian of Chinese Thailand contextualising the diaspora claim." },
  { id:"A42", type:"actor", stance:"defender", name:"Pongwarin Sarachai", cn:"蓬瓦林",
    note:"Public advocate amplifying the shrine campaign." },
  { id:"A43", type:"actor", stance:"defender", name:"Sulak Sivaraksa", cn:"苏拉克",
    note:"Engaged-Buddhism critic naming structural violence in the language of dharma." },

  /* ===================== INSTRUMENTS ===================== */
  { id:"I07", type:"instrument", stance:"threat", name:"CU long-term land-lease system", cn:"朱拉土地租赁制度", flagship:true,
    note:"The master mechanism: renewable long leases CU can simply decline. Non-renewal is administrative, not adversarial — which is exactly what lets it stack into a pattern across every site." },
  { id:"I03", type:"instrument", stance:"threat", name:"122M baht civil suit + arrest request", cn:"1.22亿民事诉讼",
    note:"Personal civil-damages claim against the caretakers. <em>The purpose is not eviction but the financial unmaking of refusal.</em>" },
  { id:"I02", type:"instrument", stance:"threat", name:"Civil and Commercial Code", cn:"民商法典",
    note:"Statutory basis for converting continued occupancy into calculable, accruing damages." },
  { id:"I06", type:"instrument", stance:"complicit", name:"Samyan Mitrtown long-term lease", cn:"三聚长期租约",
    note:"30-year commercial lease enabling the Mitrtown development." },
  { id:"I04", type:"instrument", stance:"complicit", name:"Block 33 construction permit + EIA", cn:"33街区许可+环评",
    note:"Permits the residential + retail redevelopment around the shrine." },
  { id:"I05", type:"instrument", stance:"neutral", name:"Building Control Act", cn:"建筑管制法",
    note:"Regulates construction; used as procedural lever." },
  { id:"I01", type:"instrument", stance:"neutral", name:"Act on Ancient Monuments B.E. 2504 (1961)", cn:"1961古迹法",
    note:"Defines 'national heritage' narrowly. <em>Excludes vernacular and Chinese-diaspora heritage by definitional architecture</em> — so the shrine has no statutory shield." },
  { id:"I10", type:"instrument", stance:"complicit", name:"Samyan Smart City branding", cn:"三聚智慧城叙事",
    note:"Branding instrument that reframes 'we are clearing this block' as 'we are modernising the corridor'." },
  { id:"I11", type:"instrument", stance:"complicit", name:"CU2040 Master Plan", cn:"CU2040总体规划",
    note:"Long-range plan zoning the corridor for commercial use." },
  { id:"I12", type:"instrument", stance:"complicit", name:"Thailand 4.0 / DEPA pilot", cn:"泰国4.0 / DEPA试点",
    note:"National policy halo legitimising the smart-city framing." },
  { id:"I25", type:"instrument", stance:"complicit", name:"THE University Rankings", cn:"THE大学排名",
    note:"Global-ranking pressure driving the 'world-class campus' rationale." },
  { id:"I20", type:"instrument", stance:"complicit", name:"ASLA 2019 Honor Award", cn:"ASLA荣誉奖",
    note:"Design award for Centenary Park. <em>Criteria do not require disclosure of social displacement</em> — it becomes a reputational alibi." },
  { id:"I21", type:"instrument", stance:"complicit", name:"WLA Awards 2019", cn:"WLA奖",
    note:"World Landscape Architecture award performing the same laundering function." },
  { id:"I13", type:"instrument", stance:"shrine", name:"Mazu devotion / ritual ecology", cn:"妈祖信仰 / 仪式生态",
    note:"The living religious practice anchoring the community to this exact place — the thing a relocation offer cannot move." },
  { id:"I15", type:"instrument", stance:"defender", name:"50,000+ petition", cn:"五万人请愿",
    note:"Mass petition (50k signatures in three weeks) raising political cost." },
  { id:"I16", type:"instrument", stance:"defender", name:"Human-chain action", cn:"人链行动",
    note:"Embodied protest physically encircling the shrine." },
  { id:"I18", type:"instrument", stance:"defender", name:"Suphannahong National Film Award", cn:"金天鹅奖",
    note:"National recognition for the 'Last of Sam Yan' documentary — turning the case into public culture." },
  { id:"I19", type:"instrument", stance:"defender", name:"Outstanding Heritage Conservation Award (2012)", cn:"杰出遗产保护奖",
    note:"ASA award granting cultural legitimacy to preservation claims (incl. Scala)." },
  { id:"I23", type:"instrument", stance:"defender", name:"Khun Nok autobiography", cn:"庙看护者自传",
    note:"The caretaker's published testimony as a counter-archive to the official narrative." },
  { id:"I24", type:"instrument", stance:"defender", name:"International media coverage", cn:"国际媒体报道",
    note:"Reputational-pressure instrument circulating the case beyond Thailand." },

  /* ===================== EVENTS ===================== */
  /* S05 shrine spine */
  { id:"E12", type:"event", stance:"shrine", name:"Shrine founding era (Rama V)", cn:"建庙时期", year:1871,
    note:"The shrine's founding era — decades before Chulalongkorn University existed." },
  { id:"E13", type:"event", stance:"shrine", name:"Shrine fire + community rebuild", cn:"火灾后社区重建", year:1960,
    note:"After a fire, the Teochew community rebuilds the shrine itself." },
  { id:"E14", type:"event", stance:"shrine", name:"Current shrine structure built", cn:"现庙建成", year:1970,
    note:"The present shrine structure, raised by community subscription." },
  { id:"E15", type:"event", stance:"threat", name:"PMCU eviction order + 4.6B baht suit", cn:"清退令+46亿诉讼", year:2020,
    note:"PMCU issues the eviction order and files a civil suit; the mechanism moves from administrative to financial." },
  { id:"E17", type:"event", stance:"complicit", name:"Replica shrine opens", cn:"替代庙开放", year:2020,
    note:"PMCU offers a new shrine near Centenary Park. The community refuses to move; it stands as a designation without inhabitants." },
  { id:"E16", type:"event", stance:"defender", name:"'Last of Sam Yan' wins Suphannahong", cn:"《三聚最后一口气》获金天鹅", year:2023,
    note:"The documentary's national award converts the dispute into widely shared public memory." },
  { id:"E19", type:"event", stance:"threat", name:"Lower court rules for PMCU", cn:"一审 PMCU 胜诉", year:2023,
    note:"Damages stand; defendants appeal. The mechanism is now case law." },
  { id:"E20", type:"event", stance:"complicit", name:"PMCU revised plan", cn:"PMCU 修订方案", year:2024,
    note:"A revised redevelopment plan keeps the commercial frame intact." },
  { id:"E21", type:"event", stance:"defender", name:"50k petition in 3 weeks", cn:"三周五万请愿", year:2024,
    note:"Rapid signature drive demonstrating breadth of public support." },
  { id:"E22", type:"event", stance:"defender", name:"ASA Heritage Award", cn:"ASA 遗产奖", year:2024,
    note:"Professional heritage recognition for the shrine." },
  /* S04 Mitrtown */
  { id:"E35", type:"event", stance:"shrine", name:"Sam Yan Market established", cn:"三聚市场建立", year:1960,
    note:"The original Teochew market community takes root." },
  { id:"E30", type:"event", stance:"threat", name:"Sam Yan Market relocated for redevelopment", cn:"市场为开发迁移", year:2008,
    note:"Vendors served notices as the block is cleared ahead of Mitrtown." },
  { id:"E37", type:"event", stance:"complicit", name:"GOLD begins Samyan Mitrtown development", cn:"GOLD 启动开发", year:2014,
    note:"Construction of the flagship mixed-use complex begins." },
  { id:"E38", type:"event", stance:"threat", name:"Original shophouses demolished", cn:"老店屋拆除", year:2016,
    note:"The last of the original Sam Yan fabric is removed." },
  { id:"E05", type:"event", stance:"complicit", name:"Samyan Mitrtown opens", cn:"三聚开业", year:2019,
    note:"Opens 20 Sep 2019; ~80,000 daily visitors, original vendors largely absent." },
  { id:"E39", type:"event", stance:"complicit", name:"GOLD absorbed into Frasers Property Thailand", cn:"GOLD 并入 Frasers", year:2019,
    note:"Developer consolidation folds GOLD into Frasers." },
  /* S01 Scala */
  { id:"E24", type:"event", stance:"shrine", name:"Scala opens", cn:"斯卡拉开业", year:1969,
    note:"The modernist cinema opens — later a 2012 conservation-award winner." },
  { id:"E25", type:"event", stance:"neutral", name:"Scala closes", cn:"斯卡拉停业", year:2020,
    note:"Lease ends; the cinema closes." },
  { id:"E26", type:"event", stance:"threat", name:"PMCU leases Block A to CPN for 5.9B", cn:"PMCU 出租 Block A", year:2021,
    note:"The Scala site passes to Central Pattana for retail." },
  { id:"E27", type:"event", stance:"threat", name:"Scala demolition without notice", cn:"斯卡拉无预警拆除", year:2021,
    note:"Demolition begins despite a prior preservation promise; activists collect bricks as memorabilia." },
  /* S03 Chamchuri */
  { id:"E01", type:"event", stance:"complicit", name:"CU Hi-tech Square construction begins", cn:"高科技广场动工", year:1994,
    note:"Early CU commercial tower project begins." },
  { id:"E02", type:"event", stance:"neutral", name:"Construction halts at 13th floor", cn:"13层停工", year:1996,
    note:"The build stalls amid the financial crisis." },
  { id:"E03", type:"event", stance:"complicit", name:"PMCU rescue allocates 300M CU funds", cn:"PMCU 注资3亿救场", year:2002,
    note:"PMCU steps in financially — CU acting as developer." },
  { id:"E04", type:"event", stance:"complicit", name:"Phase 2 reconstruction (2.7B baht)", cn:"二期重建 (27亿)", year:2008,
    note:"Reconstruction completes the commercial tower." },
  /* S09 / S10 park */
  { id:"E06", type:"event", stance:"shrine", name:"Suan Luang = Teochew hub", cn:"苏安隆 潮州枢纽", year:1961,
    note:"Suan Luang is the heart of the Sieng Kong Teochew community." },
  { id:"E07", type:"event", stance:"threat", name:"Suan Luang shophouses demolished; Sieng Kong move out", cn:"店屋拆除·社区迁出", year:2016,
    note:"The Teochew shophouse district is cleared ahead of the park." },
  { id:"E08", type:"event", stance:"complicit", name:"Centenary Park opens", cn:"百年公园开放", year:2017,
    note:"Opened for CU's 100th anniversary on the cleared land." },
  { id:"E10", type:"event", stance:"complicit", name:"ASLA + WLA awards", cn:"ASLA+WLA 获奖", year:2019,
    note:"International design awards crown the park — citations omit the cleared families." },
  { id:"E11", type:"event", stance:"defender", name:"Prachatai / Harvard GSD critique", cn:"Prachatai/GSD 批评", year:2026,
    note:"Press and academic critique reframes the award as displacement laundering." },
];

const NET_LINKS = [
  /* PMCU institutional hub */
  ["A01","A02"],["A01","A36"],["A01","A24"],["A01","A48"],["A01","A44"],["A01","A29"],["A01","A45"],["A01","A23"],["A01","A18"],
  ["A01","A33"],["A01","A34"],["A01","A32"],["A01","A05"],["A01","A06"],["A01","A10"],["A01","A35"],
  ["A01","I07"],["A01","I06"],["A01","I04"],["A01","I03"],["A01","I10"],["A01","I11"],["A01","I02"],["A01","I05"],["A01","I12"],["A01","I25"],
  ["A01","S01"],["A01","S03"],["A01","S04"],["A01","S05"],["A01","S06"],["A01","S07"],["A01","S08"],["A01","S09"],["A01","S10"],["A01","S02"],
  ["A02","A45"],["A02","I25"],["A02","A14"],
  ["A36","I11"],["A36","I10"],["A36","A38"],["I10","I11"],["I12","A24"],["I12","I10"],
  /* developer chain */
  ["A47","A28"],["A47","A30"],["A30","A03"],["A28","A03"],["A03","S04"],["A30","S04"],["A06","A30"],["A10","S04"],["I06","S04"],["I10","S04"],
  ["A47","I06"],
  /* contractors / tenants */
  ["A33","S04"],["A34","S04"],["A32","S04"],["A32","S03"],["A05","S03"],["A05","S01"],
  /* Scala */
  ["S01","E24"],["S01","E25"],["S01","E26"],["S01","E27"],["E26","A31"],["E27","A31"],["A31","S01"],["A35","S01"],["A13","S01"],["I19","S01"],["A19","S01"],["A22","S01"],
  /* Chamchuri */
  ["S03","E01"],["S03","E02"],["S03","E03"],["S03","E04"],["E03","A01"],
  /* Mitrtown events */
  ["S04","E35"],["S04","E30"],["S04","E37"],["S04","E38"],["S04","E05"],["S04","E39"],["E37","A30"],["E39","A03"],["E30","A15"],["E38","A15"],["E35","A15"],
  /* Centenary park / Suan Luang */
  ["S09","E08"],["S09","E10"],["S10","E06"],["S10","E07"],["S09","S10"],["E08","A11"],["E10","I20"],["E10","I21"],["I20","S09"],["I21","S09"],["E07","A15"],["A11","S09"],["S10","A15"],["E11","A38"],["S09","E11"],["A11","A23"],
  /* shrine spine + core */
  ["S05","E12"],["S05","E13"],["S05","E14"],["S05","E15"],["S05","E17"],["S05","E16"],["S05","E19"],["S05","E20"],["S05","E21"],["S05","E22"],
  ["S05","A12"],["S05","A15"],["S05","I13"],["S05","I01"],["S05","I03"],["S05","A19"],["S05","A22"],["S05","S08"],["S08","I04"],["I04","A01"],
  ["A12","I03"],["A12","E15"],["A12","E19"],["E15","A01"],["E19","A21"],["A21","I03"],["A21","I02"],["A20","A37"],["A37","A01"],["A37","E19"],
  ["A12","I23"],["I23","A12"],["A15","I13"],["A12","A15"],
  /* heritage law */
  ["I01","A19"],["I01","S01"],["A19","A22"],
  /* defender web */
  ["A12","A13"],["A13","A14"],["A13","A17"],["A13","A25"],["A25","I24"],["A12","A43"],["A43","A12"],
  ["A22","I19"],["A22","E22"],["A40","A41"],["A40","A38"],["A41","A15"],["A26","A22"],["A27","A38"],["A42","A12"],["A27","A15"],
  ["I15","E21"],["I16","S05"],["I18","E16"],["I24","A25"],["A14","I15"],["A13","I16"],["A40","S05"],["A41","S05"],
  /* property advisory */
  ["A09","A01"],["A09","A30"],["A06","A01"],
];

/* ===================== LOCALIZED NODE TEXT =====================
   English is kept from the canonical node data above. Chinese and Thai
   are attached here so the graph can render one language at a time. */
const NET_TRANSLATIONS = {};
function addTr(id, zhNote, thName, thNote, zhName) {
  NET_TRANSLATIONS[id] = { zh: { name: zhName || null, note: zhNote }, th: { name: thName, note: thNote } };
}

addTr("S05", "这座约150年的潮州妈祖庙位于整张关系图的中心。它早于1917年成立的朱拉隆功大学，却坐落在PMCU标记为商业转用的33街区。其他所有关系都围绕一个问题展开：它能否留下。", "ศาลเจ้าแม่ทับทิม", "ศาลเจ้าแต้จิ๋วอายุราว 150 ปีคือศูนย์กลางของแผนผังนี้ มีมาก่อนจุฬาลงกรณ์มหาวิทยาลัย แต่ตั้งอยู่บนบล็อก 33 ที่ PMCU กำหนดให้เปลี่ยนเป็นพื้นที่พาณิชย์ ความสัมพันธ์ทั้งหมดจึงวนอยู่กับคำถามว่า ศาลเจ้าจะอยู่ต่อได้หรือไม่");
addTr("S01", "1969年建成的现代主义影院。租约未获续期，并于2021年拆除；如今它被行动者反复引用，作为妈祖庙可能遭遇的预演。", "โรงภาพยนตร์สกาลา", "โรงภาพยนตร์สมัยใหม่ที่เปิดในปี 1969 สัญญาเช่าไม่ได้รับการต่ออายุและถูกรื้อในปี 2021 กรณีนี้กลายเป็นคำเตือนที่นักกิจกรรมใช้พูดถึงชะตาของศาลเจ้า");
addTr("S02", "三燕走廊中的公共纪念碑节点。", "อนุสาวรีย์สองกษัตริย์", "โหนดอนุสาวรีย์สาธารณะภายในแนวพื้นที่สามย่าน");
addTr("S03", "朱拉的商业塔楼项目，1990年代建设受阻，后来由PMCU资金挽救。它较早显示出大学如何以开发商身份行动。", "จามจุรีสแควร์", "อาคารพาณิชย์ของจุฬาฯ ที่ก่อสร้างติดขัดในทศวรรษ 1990 ก่อนถูกกู้ด้วยเงินของ PMCU เป็นตัวอย่างแรก ๆ ของมหาวิทยาลัยที่ทำหน้าที่เหมือนผู้พัฒนาอสังหาริมทรัพย์");
addTr("S04", "2019年开业的90亿泰铢旗舰混合商业综合体，建在旧三燕市场被清空的土地上。每天约8万人到访，但原有摊贩大多缺席。", "สามย่านมิตรทาวน์", "ศูนย์การค้าผสมมูลค่า 9 พันล้านบาท เปิดปี 2019 บนที่ดินที่เคยเป็นตลาดสามย่านเดิม มีผู้มาเยือนราว 80,000 คนต่อวัน แต่ผู้ค้าดั้งเดิมส่วนใหญ่ไม่อยู่ในภาพ");
addTr("S06", "位于朱拉土地资产中的国际学舍。", "ไอเฮาส์", "หอพัก International House ภายในที่ดินของจุฬาฯ");
addTr("S07", "走廊中被清空的宗教/社区地点。", "พื้นที่โบสถ์เดิม", "พื้นที่ศาสนาและชุมชนในแนวทางเดินที่ถูกเคลียร์ออก");
addTr("S08", "位于33街区再开发范围内、紧邻妈祖庙的传媒与教育学院建筑。", "คณะนิเทศ/ครุศาสตร์ · บล็อก 33", "อาคารคณะในรอยเท้าโครงการพัฒนาบล็อก 33 รอบศาลเจ้าโดยตรง");
addTr("S09", "2017年开放、占地28莱的获奖公园，建在被清空的潮州店屋之上。ASLA的叙事强调生态，而非迁 displacement。", "อุทยาน 100 ปี", "สวน 28 ไร่ที่ได้รับรางวัล เปิดปี 2017 บนพื้นที่ตึกแถวแต้จิ๋วที่ถูกเคลียร์ คำประกาศรางวัลของ ASLA เน้นนิเวศ ไม่ใช่การพลัดถิ่น");
addTr("S10", "原先是Sieng Kong潮州店屋枢纽，在2010年代中期为公园建设被清空。", "สวนหลวงสแควร์", "อดีตศูนย์กลางตึกแถวแต้จิ๋วเซียงกง ถูกเคลียร์ช่วงกลางทศวรรษ 2010 ก่อนการสร้างสวน");

addTr("A01", "朱拉隆功大学物业管理处。它提起诉讼、拒绝续租、签署商业租约，是图中每个案例的执行中枢。", "PMCU", "สำนักงานจัดการทรัพย์สินจุฬาฯ เป็นผู้ยื่นฟ้อง ปฏิเสธการต่อสัญญา และลงนามสัญญาเชิงพาณิชย์ จึงเป็นศูนย์ปฏิบัติการของทุกกรณีในแผนผัง");
addTr("A02", "大学行政体系，制定由PMCU执行的机构政策。", "ฝ่ายบริหารจุฬาฯ", "ฝ่ายบริหารมหาวิทยาลัยเป็นผู้กำหนดนโยบายเชิงสถาบันที่ PMCU นำไปปฏิบัติ");
addTr("A21", "损害赔偿案的审理场域；2023年一审判PMCU胜诉。", "ศาลแพ่งกรุงเทพใต้", "พื้นที่พิจารณาคดีเรียกค่าเสียหาย และศาลชั้นต้นตัดสินให้ PMCU ชนะในปี 2023");
addTr("A28", "TCC集团/Frasers背后的亿万富豪所有者，是三燕同心商城开发背后的资本。", "เจริญ สิริวัฒนภักดี", "มหาเศรษฐีเจ้าของ TCC Group และ Frasers เป็นทุนที่อยู่เบื้องหลังการพัฒนาสามย่านมิตรทาวน์");
addTr("A47", "苏旭明的商业集团，也是Mitrtown开发商的母公司。", "กลุ่ม TCC", "กลุ่มธุรกิจของเจริญ และเป็นบริษัทแม่ของผู้พัฒนา Mitrtown");
addTr("A03", "2019年吸收GOLD，开发并运营Samyan Mitrtown。", "Frasers Property Thailand", "รับ GOLD เข้ามาในปี 2019 และเป็นผู้พัฒนาและบริหารสามย่านมิตรทาวน์");
addTr("A30", "在并入Frasers之前，GOLD是Mitrtown的原始开发商。", "Golden Land Property Development", "ผู้พัฒนา Mitrtown เดิม ก่อนถูกผนวกเข้า Frasers");
addTr("A31", "2021年Scala拆除后接手该地块租约。", "เซ็นทรัลพัฒนา", "รับช่วงสัญญาเช่าพื้นที่สกาลาหลังการรื้อถอนในปี 2021");
addTr("A05", "走廊周边的商业业主与运营者。", "กลุ่ม MBK", "เจ้าของและผู้ดำเนินการเชิงพาณิชย์ที่อยู่ติดกับแนวพื้นที่");
addTr("A35", "Scala及暹罗片区曾经的影院运营者。", "กลุ่ม Apex", "อดีตผู้ดำเนินกิจการโรงภาพยนตร์สกาลาและพื้นที่สยาม");
addTr("A06", "房地产顾问，以最高最佳使用来估算土地价值。", "CBRE", "ที่ปรึกษาอสังหาริมทรัพย์ที่ประเมินที่ดินด้วยกรอบการใช้ประโยชน์สูงสุดและดีที่สุด");
addTr("A09", "再开发过程中的物业方人物。", "คุณปรีชา คุณากริดติกาญจน์", "บุคคลฝ่ายทรัพย์สินในกระบวนการพัฒนาใหม่");
addTr("A10", "开发链条中的项目/建筑事务所。", "N7A", "บริษัทโครงการและสถาปัตยกรรมในห่วงโซ่ผู้พัฒนา");
addTr("A32", "新开发项目中的主要商业租户。", "True Corp / DTAC", "ผู้เช่าหลักเชิงพาณิชย์ของโครงการพัฒนาใหม่");
addTr("A33", "主要承包商。", "Ruam Nakhon Construction", "ผู้รับเหมาหลักของโครงการ");
addTr("A34", "次级承包商与机电工程方。", "Powerline Engineering PCL", "ผู้รับเหมาช่วงและฝ่ายงานระบบอาคาร");
addTr("A36", "设计总体规划愿景，将清空包装为升级。", "ศูนย์ออกแบบและพัฒนาเมือง จุฬาฯ", "ออกแบบวิสัยทัศน์แผนแม่บทที่ทำให้การเคลียร์พื้นที่ถูกเล่าเป็นการยกระดับ");
addTr("A45", "以商学院逻辑支撑土地价值论证。", "สถาบันศศินทร์", "ตรรกะของโรงเรียนธุรกิจที่รองรับข้อโต้แย้งเรื่องมูลค่าที่ดิน");
addTr("A48", "王室顾问机构，为朱拉的土地持有提供制度重量。", "องคมนตรี", "องค์กรที่ปรึกษาพระมหากษัตริย์ ซึ่งเพิ่มน้ำหนักเชิงสถาบันให้การถือครองที่ดินของจุฬาฯ");
addTr("A24", "制定泰国4.0与智慧城市政策，为项目提供政策框架。", "รัฐบาลไทย", "กำหนดนโยบาย Thailand 4.0 และสมาร์ตซิตี้ที่โครงการต่าง ๆ นำไปอ้างอิง");
addTr("A29", "负责区内许可发放的地方行政机构。", "สำนักงานเขตปทุมวัน", "หน่วยงานท้องถิ่นที่ออกใบอนุญาตภายในเขต");
addTr("A23", "绿色建筑认证机构，为再开发提供生态信誉。", "สถาบันอาคารเขียวไทย", "องค์กรรับรองอาคารเขียวที่ให้ความน่าเชื่อถือทางนิเวศแก่การพัฒนาใหม่");
addTr("A11", "百年公园的景观建筑师，获得ASLA奖项。相关叙事强调生态，而非迁 displacement。", "Landprocess (กชกร วรอาคม)", "ภูมิสถาปนิกของอุทยาน 100 ปี ผู้ได้รับรางวัล ASLA เรื่องเล่าหลักเน้นนิเวศ ไม่ใช่การพลัดถิ่น");
addTr("A18", "城市政府，涉及建筑管制与基础设施。", "กรุงเทพมหานคร", "รัฐบาลเมืองที่เกี่ยวข้องกับการควบคุมอาคารและโครงสร้างพื้นฐาน");
addTr("A19", "执行1961年古迹法。它在华人侨民与民间遗产议题上显著缺席。", "กรมศิลปากร", "หน่วยงานผู้ดูแลพระราชบัญญัติโบราณสถานปี 1961 แต่แทบไม่ปรากฏในมรดกพื้นถิ่นของชาวไทยเชื้อสายจีน");
addTr("A20", "行政法挑战的审理场域。", "ศาลปกครองกลาง", "พื้นที่สำหรับการท้าทายทางกฎหมายปกครอง");
addTr("A37", "执行法院命令的机构。", "กรมบังคับคดี", "หน่วยงานที่ดำเนินการตามคำสั่งศาล");
addTr("A44", "王室土地管理机构，在结构上邻近朱拉的王室授地。", "สำนักงานทรัพย์สินพระมหากษัตริย์ / พระคลังข้างที่", "ผู้ดูแลที่ดินของสถาบันกษัตริย์ ซึ่งอยู่ใกล้เคียงเชิงโครงสร้างกับที่ดินพระราชทานของจุฬาฯ");
addTr("A12", "妈祖庙第四代看护者，也是民事索赔中的具名被告。她自2020年以来成为公共人物，表明会抗争到底。", "คุณนก (เพ็ญประภา พลอยสีสุข)", "ผู้ดูแลศาลเจ้ารุ่นที่สี่และจำเลยที่ถูกระบุชื่อในคดีแพ่ง เป็นบุคคลสาธารณะตั้งแต่ปี 2020 และยืนยันว่าจะสู้จนถึงที่สุด");
addTr("A15", "这个侨民社群的生活化民间遗产，正横跨三燕、苏安隆和妈祖庙而受到威胁。", "ชุมชนไทยจีนแต้จิ๋ว", "ชุมชนพลัดถิ่นที่มรดกพื้นถิ่นที่ยังมีชีวิตกำลังถูกเดิมพันในสามย่าน สวนหลวง และศาลเจ้า");
addTr("A13", "学生行动者，创办Sam Yan Press，并明确把Scala作为妈祖庙的警示案例。", "เนติวิทย์ โชติภัทร์ไพศาล", "นักกิจกรรมนักศึกษา ผู้ก่อตั้ง Sam Yan Press และยกกรณีสกาลาเป็นคำเตือนโดยตรงต่อศาลเจ้า");
addTr("A14", "支持妈祖庙并向校方施压的学生运动。", "นิสิตจุฬาฯ", "ขบวนการนิสิตที่สนับสนุนศาลเจ้าและกดดันฝ่ายบริหาร");
addTr("A17", "记录走廊清空过程的独立出版与媒体。", "Sam Yan Press", "สื่ออิสระที่บันทึกการเคลียร์พื้นที่ในแนวสามย่าน");
addTr("A25", "外部报道提高了清空行为的声誉成本。", "สื่อต่างประเทศ", "การรายงานจากภายนอกเพิ่มต้นทุนด้านชื่อเสียงของการเคลียร์พื้นที่");
addTr("A22", "发出遗产认可的专业机构，文化分量很高，但没有法定约束力。", "สมาคมสถาปนิกสยาม", "องค์กรวิชาชีพที่ออกการรับรองด้านมรดก มีน้ำหนักทางวัฒนธรรมแต่ไม่มีอำนาจตามกฎหมาย");
addTr("A26", "公开提出保存论点的重要建筑师。", "ดวงฤทธิ์ บุนนาค", "สถาปนิกคนสำคัญที่ออกเสียงสนับสนุนการอนุรักษ์ต่อสาธารณะ");
addTr("A27", "围绕此案生产批判性研究的学术盟友。", "มหาวิทยาลัยธรรมศาสตร์", "พันธมิตรทางวิชาการที่ผลิตงานวิจารณ์กรณีนี้");
addTr("A38", "哈佛GSD等教育机构，批判这一再开发模式。", "สถาบันการศึกษา (รวม GSD)", "Harvard GSD และสถาบันอื่น ๆ ที่วิจารณ์โมเดลการพัฒนาใหม่");
addTr("A40", "书写走廊遗产议题的建筑史学者。", "ชาตรี ประกิตนนทการ", "นักประวัติศาสตร์สถาปัตยกรรมที่เขียนถึงมรดกในแนวพื้นที่นี้");
addTr("A41", "研究泰国华人历史的学者，为侨民诉求提供语境。", "วาสนา วงศ์สุรวัฒน์", "นักประวัติศาสตร์ไทยเชื้อสายจีนที่ช่วยวางบริบทให้ข้อเรียกร้องของชุมชนพลัดถิ่น");
addTr("A42", "放大妈祖庙运动的公共倡议者。", "พงศ์วรินทร์ สารชัย", "ผู้สนับสนุนสาธารณะที่ช่วยขยายการรณรงค์ของศาลเจ้า");
addTr("A43", "入世佛教批评者，用佛法语言命名结构性暴力。", "สุลักษณ์ ศิวรักษ์", "นักวิจารณ์พุทธศาสนาเพื่อสังคมที่ตั้งชื่อความรุนแรงเชิงโครงสร้างด้วยภาษาธรรมะ");

addTr("I07", "核心机制：朱拉可以拒绝续期的长期可续租制度。不续约看似行政行为而非对抗行为，正因此能在每个地点叠加成模式。", "ระบบเช่าที่ดินระยะยาวของจุฬาฯ", "กลไกหลักคือสัญญาเช่าระยะยาวที่มหาวิทยาลัยสามารถปฏิเสธการต่ออายุได้ การไม่ต่อสัญญาดูเป็นงานปกครอง ไม่ใช่ความขัดแย้ง จึงสะสมเป็นรูปแบบซ้ำในทุกพื้นที่");
addTr("I03", "针对看护者个人的民事损害赔偿。目的不是单纯驱逐，而是从财务上瓦解拒绝搬离的能力。", "คดีแพ่ง 122 ล้านบาทและคำขอจับกุม", "การเรียกค่าเสียหายทางแพ่งต่อผู้ดูแลเป็นการส่วนตัว จุดมุ่งหมายไม่ใช่แค่การไล่ที่ แต่คือการทำให้การปฏิเสธย้ายออกพังทลายทางการเงิน");
addTr("I02", "把继续占用转化为可计算、会累积的损害赔偿的法定基础。", "ประมวลกฎหมายแพ่งและพาณิชย์", "ฐานกฎหมายที่เปลี่ยนการอยู่อาศัยต่อให้เป็นค่าเสียหายที่คำนวณและสะสมได้");
addTr("I06", "支撑Mitrtown开发的30年商业租约。", "สัญญาเช่าระยะยาวสามย่านมิตรทาวน์", "สัญญาเชิงพาณิชย์ 30 ปีที่ทำให้โครงการ Mitrtown เกิดขึ้นได้");
addTr("I04", "允许围绕妈祖庙进行住宅与零售再开发的许可工具。", "ใบอนุญาตก่อสร้างและ EIA บล็อก 33", "เครื่องมืออนุญาตที่เปิดทางให้การพัฒนาที่อยู่อาศัยและค้าปลีกรอบศาลเจ้า");
addTr("I05", "管制建设，并可作为程序性杠杆使用。", "พระราชบัญญัติควบคุมอาคาร", "กฎหมายควบคุมการก่อสร้างที่ถูกใช้เป็นคันโยกเชิงขั้นตอน");
addTr("I01", "以狭窄方式定义国家遗产。它在定义上排除了民间与华人侨民遗产，使妈祖庙没有法定保护。", "พระราชบัญญัติโบราณสถาน พ.ศ. 2504", "นิยามมรดกชาติอย่างคับแคบ จนมรดกพื้นถิ่นและมรดกชาวจีนโพ้นทะเลหลุดออกจากกรอบ ทำให้ศาลเจ้าไม่มีเกราะตามกฎหมาย");
addTr("I10", "将清空街区重新叙述为现代化走廊的品牌工具。", "แบรนด์สามย่านสมาร์ตซิตี้", "เครื่องมือสร้างแบรนด์ที่เปลี่ยนคำว่าเคลียร์พื้นที่ให้กลายเป็นการทำให้แนวทางเดินทันสมัย");
addTr("I11", "把走廊划向商业用途的长期总体规划。", "แผนแม่บท CU2040", "แผนระยะยาวที่กำหนดพื้นที่แนวนี้ไปสู่การใช้ประโยชน์เชิงพาณิชย์");
addTr("I12", "国家政策光环，使智慧城市框架获得合法性。", "Thailand 4.0 / โครงการนำร่อง DEPA", "รัศมีของนโยบายระดับชาติที่ทำให้กรอบสมาร์ตซิตี้ดูชอบธรรม");
addTr("I25", "全球大学排名压力推动世界级校园的论证。", "การจัดอันดับมหาวิทยาลัย THE", "แรงกดดันจากการจัดอันดับโลกที่ผลักเหตุผลเรื่องวิทยาเขตระดับโลก");
addTr("I20", "百年公园的设计奖项。评奖标准不要求披露社会迁 displacement，因此成为声誉遮蔽。", "รางวัล ASLA Honor Award 2019", "รางวัลออกแบบของอุทยาน 100 ปี เกณฑ์ไม่ได้บังคับให้เปิดเผยการพลัดถิ่นทางสังคม จึงกลายเป็นข้ออ้างด้านชื่อเสียง");
addTr("I21", "发挥同样洗白功能的世界景观建筑奖项。", "รางวัล WLA 2019", "รางวัลภูมิสถาปัตยกรรมโลกที่ทำหน้าที่ฟอกภาพในแบบเดียวกัน");
addTr("I13", "把社区锚定在这个具体地点的生活宗教实践，也是搬迁方案无法搬走的东西。", "ศรัทธาแม่ทับทิม / นิเวศพิธีกรรม", "ศาสนปฏิบัติที่มีชีวิตและผูกชุมชนไว้กับสถานที่เฉพาะนี้ เป็นสิ่งที่ข้อเสนอให้ย้ายไม่สามารถย้ายไปได้");
addTr("I15", "三周内五万签名的群众请愿，提高政治成本。", "คำร้องกว่า 50,000 รายชื่อ", "คำร้องมวลชนห้าหมื่นรายชื่อในสามสัปดาห์ เพิ่มต้นทุนทางการเมือง");
addTr("I16", "以身体行动围住妈祖庙的抗议形式。", "กิจกรรมโซ่มนุษย์", "การประท้วงทางกายภาพที่ล้อมศาลเจ้าด้วยร่างกายของผู้คน");
addTr("I18", "纪录片《三燕最后一口气》的国家认可，把案件转化为公共文化。", "รางวัลภาพยนตร์แห่งชาติสุพรรณหงส์", "การยอมรับระดับชาติของสารคดี Last of Sam Yan ที่เปลี่ยนกรณีนี้ให้เป็นวัฒนธรรมสาธารณะ");
addTr("I19", "ASA奖项给予保存诉求文化合法性，包括Scala，但没有法定牙齿。", "รางวัลอนุรักษ์มรดกดีเด่น 2012", "รางวัล ASA ที่ให้ความชอบธรรมทางวัฒนธรรมแก่ข้อเรียกร้องการอนุรักษ์ รวมถึงสกาลา แต่ไม่มีอำนาจตามกฎหมาย");
addTr("I23", "看护者出版的证词，作为对官方叙事的反档案。", "อัตชีวประวัติคุณนก", "คำให้การที่ผู้ดูแลตีพิมพ์ เป็นคลังความทรงจำโต้กลับเรื่องเล่าทางการ");
addTr("I24", "把案件传播到泰国之外的声誉压力工具。", "การรายงานของสื่อต่างประเทศ", "เครื่องมือกดดันด้านชื่อเสียงที่ทำให้กรณีเดินทางออกนอกประเทศไทย");

addTr("E12", "建庙时期，比朱拉隆功大学的存在早了数十年。", "ยุคก่อตั้งศาลเจ้า (รัชกาลที่ 5)", "ยุคก่อตั้งศาลเจ้า เกิดขึ้นหลายทศวรรษก่อนจุฬาลงกรณ์มหาวิทยาลัย");
addTr("E13", "火灾之后，潮州社区自行重建妈祖庙。", "ไฟไหม้ศาลเจ้าและชุมชนสร้างใหม่", "หลังเหตุไฟไหม้ ชุมชนแต้จิ๋วร่วมกันสร้างศาลเจ้าขึ้นใหม่ด้วยตนเอง");
addTr("E14", "现有庙体由社区集资建成。", "อาคารศาลเจ้าปัจจุบันสร้างขึ้น", "โครงสร้างศาลเจ้าปัจจุบันถูกสร้างด้วยเงินสมทบของชุมชน");
addTr("E15", "PMCU发布清退令并提起民事诉讼，机制从行政手段转入财务压力。", "คำสั่งไล่ที่และคดี 4.6 พันล้านบาทของ PMCU", "PMCU ออกคำสั่งให้ออกและยื่นคดีแพ่ง ทำให้กลไกเปลี่ยนจากงานปกครองเป็นแรงกดดันทางการเงิน");
addTr("E17", "PMCU在百年公园附近提供一座新庙。社区拒绝搬迁，因此它成为没有信众居住的指定替代物。", "ศาลเจ้าจำลองเปิด", "PMCU เสนอศาลเจ้าใหม่ใกล้อุทยาน 100 ปี แต่ชุมชนปฏิเสธที่จะย้าย ที่นั่นจึงเป็นเพียงสถานที่แทนที่ที่ไม่มีชีวิตชุมชน");
addTr("E16", "纪录片获得国家奖项，使争议进入更广泛的公共记忆。", "Last of Sam Yan ได้รางวัลสุพรรณหงส์", "รางวัลระดับชาติของสารคดีทำให้ข้อพิพาทกลายเป็นความทรงจำสาธารณะที่กว้างขึ้น");
addTr("E19", "损害赔偿成立，被告上诉。机制由此进入判例层面。", "ศาลชั้นต้นตัดสินให้ PMCU ชนะ", "ค่าเสียหายยังคงอยู่และจำเลยอุทธรณ์ กลไกจึงกลายเป็นบรรทัดฐานทางคดี");
addTr("E20", "修订后的再开发方案仍保留商业框架。", "แผนปรับปรุงของ PMCU", "แผนพัฒนาใหม่ฉบับปรับปรุงยังคงกรอบเชิงพาณิชย์ไว้");
addTr("E21", "快速签名行动显示公共支持的广度。", "คำร้อง 50,000 รายชื่อใน 3 สัปดาห์", "การรวบรวมรายชื่ออย่างรวดเร็วแสดงให้เห็นความกว้างของแรงสนับสนุนสาธารณะ");
addTr("E22", "专业机构给予妈祖庙遗产认可。", "รางวัลมรดกจาก ASA", "การรับรองด้านมรดกจากองค์กรวิชาชีพให้แก่ศาลเจ้า");
addTr("E35", "原有潮州市场社区在此扎根。", "ตลาดสามย่านก่อตั้ง", "ชุมชนตลาดแต้จิ๋วดั้งเดิมเริ่มหยั่งราก");
addTr("E30", "在Mitrtown开发前，摊贩收到通知，街区被清空。", "ตลาดสามย่านย้ายเพื่อการพัฒนา", "ผู้ค้าได้รับหนังสือแจ้งขณะที่พื้นที่ถูกเคลียร์ก่อนโครงการ Mitrtown");
addTr("E37", "旗舰混合商业综合体开始建设。", "GOLD เริ่มพัฒนาสามย่านมิตรทาวน์", "การก่อสร้างศูนย์ผสมระดับเรือธงเริ่มขึ้น");
addTr("E38", "旧三燕最后的原有城市肌理被移除。", "ตึกแถวดั้งเดิมถูกรื้อ", "ผืนผ้าเมืองดั้งเดิมชุดสุดท้ายของสามย่านถูกเอาออก");
addTr("E05", "2019年9月20日开业；每日约8万人到访，原有摊贩大多缺席。", "สามย่านมิตรทาวน์เปิด", "เปิดวันที่ 20 กันยายน 2019 มีผู้มาเยือนราว 80,000 คนต่อวัน แต่ผู้ค้าดั้งเดิมส่วนใหญ่ไม่อยู่ในพื้นที่");
addTr("E39", "开发商整合使GOLD并入Frasers。", "GOLD ถูกรวมเข้า Frasers Property Thailand", "การควบรวมผู้พัฒนาทำให้ GOLD ถูกพับเข้า Frasers");
addTr("E24", "现代主义影院开业，后来获得2012年保护奖。", "สกาลาเปิด", "โรงภาพยนตร์สมัยใหม่เปิดทำการ และต่อมาได้รับรางวัลอนุรักษ์ปี 2012");
addTr("E25", "租约结束，影院关闭。", "สกาลาปิด", "สัญญาเช่าสิ้นสุดและโรงภาพยนตร์ปิดตัว");
addTr("E26", "Scala地块转交给Central Pattana发展零售。", "PMCU ให้ CPN เช่าบล็อก A มูลค่า 5.9 พันล้าน", "พื้นที่สกาลาถูกส่งต่อให้ Central Pattana เพื่อพัฒนาเป็นค้าปลีก");
addTr("E27", "尽管曾有保存承诺，拆除仍然开始；行动者收集砖块作为记忆物。", "สกาลาถูกรื้อโดยไม่แจ้งล่วงหน้า", "การรื้อเริ่มขึ้นแม้เคยมีคำมั่นว่าจะอนุรักษ์ นักกิจกรรมจึงเก็บอิฐไว้เป็นวัตถุความทรงจำ");
addTr("E01", "早期朱拉商业塔楼项目启动。", "เริ่มก่อสร้าง CU Hi-tech Square", "โครงการอาคารพาณิชย์ยุคแรกของจุฬาฯ เริ่มขึ้น");
addTr("E02", "金融危机期间，工程停在第13层。", "การก่อสร้างหยุดที่ชั้น 13", "งานก่อสร้างชะงักท่ามกลางวิกฤตการเงิน");
addTr("E03", "PMCU以资金介入，显示朱拉作为开发商行动。", "PMCU จัดสรรเงิน 300 ล้านเพื่อกู้โครงการ", "PMCU เข้ามาอุดหนุนทางการเงิน แสดงให้เห็นจุฬาฯ ในฐานะผู้พัฒนา");
addTr("E04", "二期重建完成商业塔楼。", "การก่อสร้างระยะ 2 มูลค่า 2.7 พันล้านบาท", "การก่อสร้างใหม่ระยะสองทำให้อาคารพาณิชย์เสร็จสมบูรณ์");
addTr("E06", "苏安隆是Sieng Kong潮州社群的核心。", "สวนหลวงคือศูนย์กลางแต้จิ๋ว", "สวนหลวงเป็นหัวใจของชุมชนแต้จิ๋วเซียงกง");
addTr("E07", "潮州店屋区在公园建设前被清空。", "ตึกแถวสวนหลวงถูกรื้อและเซียงกงย้ายออก", "ย่านตึกแถวแต้จิ๋วถูกเคลียร์ก่อนการสร้างสวน");
addTr("E08", "公园在被清空的土地上为朱拉百年校庆开放。", "อุทยาน 100 ปีเปิด", "เปิดในวาระครบรอบ 100 ปีจุฬาฯ บนพื้นที่ที่ถูกเคลียร์");
addTr("E10", "国际设计奖项加冕公园，但颁奖文本省略被清空的家庭。", "รางวัล ASLA และ WLA", "รางวัลออกแบบระดับนานาชาติยกย่องสวน แต่คำประกาศรางวัลละเว้นครอบครัวที่ถูกเคลียร์");
addTr("E11", "媒体与学术批评把该奖项重新解释为对迁 displacement 的洗白。", "คำวิจารณ์จาก Prachatai / Harvard GSD", "สื่อและงานวิชาการวิจารณ์รางวัลนี้ว่าเป็นการฟอกภาพการพลัดถิ่น");

NET_NODES.forEach(n => {
  const tr = NET_TRANSLATIONS[n.id] || { zh: { name: n.cn || n.name, note: n.note }, th: { name: n.name, note: n.note } };
  n.i18n = {
    en: { name: n.name, note: n.note },
    zh: { name: tr.zh.name || n.cn || n.name, note: tr.zh.note },
    th: { name: tr.th.name || n.name, note: tr.th.note }
  };
});
