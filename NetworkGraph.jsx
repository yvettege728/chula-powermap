import { useEffect, useRef } from "react";

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

const NETWORK_STYLE = `

*{box-sizing:border-box;margin:0;padding:0}
:root{
 --bg-base:#2a2240; --bg-deep:#1a1428; --bg-card:#322848; --bg-card-2:#3a2e54;
 --bg-deep-firm:rgba(26,20,40,.82);
 --text-primary:#ede4f5; --text-secondary:#b8a3d8; --text-faint:rgba(237,228,245,.5);
 --line-soft:rgba(237,228,245,.1); --line-mid:rgba(237,228,245,.2); --line-strong:rgba(237,228,245,.32);
 --hl:#7dd1ab; --green:#5fb892;
 --f-display:"Fraunces","Noto Serif SC",serif;
 --f-body:"Inter Tight","Noto Sans Thai",system-ui,sans-serif;
 --f-mono:"JetBrains Mono",ui-monospace,monospace;
 --f-cn:"Noto Serif SC","Fraunces",serif;
}
body{background:var(--bg-deep);color:var(--text-primary);font-family:var(--f-body);padding:0 0 20px}
.wrap{max-width:1180px;margin:0 auto;padding:0 18px}
.meta-bar{display:flex;justify-content:space-between;padding:8px 18px;border-bottom:1px solid var(--line-soft);font-family:var(--f-mono);font-size:10px;color:var(--text-secondary);letter-spacing:.08em}
.meta-bar a{color:var(--text-secondary);text-decoration:none}
.meta-bar .dot{display:inline-block;width:4px;height:4px;border-radius:50%;background:var(--text-faint);margin:0 8px;vertical-align:2px}
.page-hero{padding:30px 0 6px}
.eyebrow{font-family:var(--f-mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--text-secondary);margin-bottom:14px}

.page-title{font-family:var(--f-display);font-weight:400;font-size:clamp(34px,5vw,58px);line-height:1.04;letter-spacing:-.02em;color:var(--text-primary)}
.page-title em{font-style:italic;color:var(--hl)}
.page-title .cn{display:block;font-family:var(--f-cn);font-size:.32em;color:var(--text-secondary);margin-top:8px}
.page-lead{max-width:760px;margin-top:16px;font-size:14.5px;line-height:1.6;color:var(--text-secondary)}
.page-lead strong{color:var(--text-primary);font-weight:600}
.page-lead em{font-style:italic;color:var(--text-primary)}
.section-block{padding-top:6px}
.nav-back{display:flex;gap:22px;flex-wrap:wrap;padding:18px 2px;font-family:var(--f-mono);font-size:11px}
.nav-back a{color:var(--text-secondary);text-decoration:none}
.nav-back a:hover{color:var(--hl)}
.dither-canvas{display:none}

  /* ===== stance palette (poster: threat → defender) tuned for dark plum bg ===== */
  :root{
    --st-threat:#8d6bdf;     --st-threat-fill:rgba(141,107,223,0.92);
    --st-complicit:#9a86c4;  --st-complicit-fill:rgba(154,134,196,0.42);
    --st-neutral:#8e8aa0;    --st-neutral-fill:rgba(142,138,160,0.38);
    --st-defender:#e6b54e;   --st-defender-fill:rgba(230,181,78,0.90);
    --st-shrine:#ee7d2f;     --st-shrine-fill:rgba(238,125,47,0.95);
    --hl:#7dd1ab;            /* jade highlight */
  }

  .net-toolbar{
    display:flex; flex-wrap:wrap; gap:8px; align-items:center;
    background:var(--bg-deep); padding:14px 18px;
    border:1px solid var(--line-mid); border-bottom:none; margin-top:32px;
  }
  .net-toolbar.row2{ border-top:none; }
  .net-toolbar-label{ font-family:var(--f-mono); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--text-secondary); margin-right:4px; }
  .net-chip{
    font-family:var(--f-mono); font-size:10px; letter-spacing:.10em; text-transform:uppercase;
    background:transparent; color:var(--text-primary); border:1px solid var(--line-mid);
    padding:7px 11px; cursor:pointer; font-weight:500; transition:all 160ms; border-radius:2px;
  }
  .net-chip:hover{ border-color:var(--hl); color:var(--hl); }
  .net-chip.active{ background:var(--hl); color:var(--bg-deep); border-color:var(--hl); font-weight:700; }
  .net-chip .sw{ display:inline-block; width:9px; height:9px; border-radius:50%; margin-right:6px; vertical-align:-1px; }
  .net-chip[data-stance="threat"] .sw{ background:var(--st-threat); }
  .net-chip[data-stance="complicit"] .sw{ background:var(--st-complicit); }
  .net-chip[data-stance="neutral"] .sw{ background:var(--st-neutral); }
  .net-chip[data-stance="defender"] .sw{ background:var(--st-defender); }
  .net-chip[data-stance="shrine"] .sw{ background:var(--st-shrine); }

  .net-search{
    font-family:var(--f-body); font-size:12px; color:var(--text-primary);
    background:var(--bg-card); border:1px solid var(--line-mid); border-radius:2px;
    padding:7px 10px; min-width:190px; outline:none;
  }
  .net-search:focus{ border-color:var(--hl); }
  .net-btn{
    font-family:var(--f-mono); font-size:10px; letter-spacing:.10em; text-transform:uppercase;
    background:var(--bg-card); color:var(--text-primary); border:1px solid var(--line-mid);
    padding:7px 11px; cursor:pointer; transition:all 160ms; border-radius:2px;
  }
  .net-btn:hover{ border-color:var(--hl); color:var(--hl); }

  .net-stage{ display:grid; grid-template-columns:1.7fr 1fr; gap:0; border:1px solid var(--line-mid); }
  .net-canvas-wrap{ background:radial-gradient(circle at 50% 42%, #221a38 0%, var(--bg-deep) 72%); position:relative; border-right:1px solid var(--line-mid); overflow:hidden; }
  #netSvg{ width:100%; height:680px; display:block; cursor:grab; touch-action:none; }
  #netSvg.dragging{ cursor:grabbing; }

  .net-hud{ position:absolute; left:14px; bottom:12px; font-family:var(--f-mono); font-size:9.5px; letter-spacing:.10em; color:var(--text-faint); line-height:1.7; pointer-events:none; }
  .net-hud b{ color:var(--text-secondary); font-weight:500; }
  .net-zoom{ position:absolute; right:12px; bottom:12px; display:flex; flex-direction:column; gap:6px; }
  .net-zoom button{ width:30px; height:30px; font-size:16px; line-height:1; background:var(--bg-deep-firm); color:var(--text-primary); border:1px solid var(--line-mid); cursor:pointer; border-radius:2px; }
  .net-zoom button:hover{ border-color:var(--hl); color:var(--hl); }

  .net-link{ stroke:rgba(184,163,216,0.14); stroke-width:1; fill:none; transition:stroke 200ms, stroke-width 200ms, opacity 200ms; }
  .net-link.highlighted{ stroke:var(--hl); stroke-width:1.8; opacity:1; }
  .net-link.dimmed{ stroke:rgba(184,163,216,0.04); }

  .net-node{ cursor:pointer; }
  .net-node-shape{ stroke-width:1.4; transition:stroke 180ms, stroke-width 180ms; }
  .net-node[data-stance="threat"]   .net-node-shape{ fill:var(--st-threat-fill);   stroke:var(--st-threat); }
  .net-node[data-stance="complicit"].net-node-shape, .net-node[data-stance="complicit"] .net-node-shape{ fill:var(--st-complicit-fill); stroke:var(--st-complicit); }
  .net-node[data-stance="neutral"]  .net-node-shape{ fill:var(--st-neutral-fill);  stroke:var(--st-neutral); }
  .net-node[data-stance="defender"] .net-node-shape{ fill:var(--st-defender-fill); stroke:var(--st-defender); }
  .net-node[data-stance="shrine"]   .net-node-shape{ fill:var(--st-shrine-fill);   stroke:var(--st-shrine); }
  .net-node.active .net-node-shape, .net-node:hover .net-node-shape{ stroke:var(--hl); stroke-width:2.6; }
  .net-node.dimmed{ opacity:0.18; }
  .net-node-code{ fill:var(--bg-deep); font-family:var(--f-mono); font-weight:600; font-size:8px; pointer-events:none; text-anchor:middle; }
  .net-node[data-stance="complicit"] .net-node-code, .net-node[data-stance="neutral"] .net-node-code{ fill:var(--text-primary); }
  .net-node-label{ fill:var(--text-faint); font-family:var(--f-body); font-size:9px; font-weight:500; pointer-events:none; text-anchor:middle; transition:fill 180ms; }
  .net-node:hover .net-node-label, .net-node.active .net-node-label{ fill:var(--text-primary); }
  .net-node.faded-label .net-node-label{ display:none; }

  /* analysis panel */
  .net-analysis{ background:var(--bg-card); padding:26px 22px; display:flex; flex-direction:column; min-height:680px; }
  .na-tag{ font-family:var(--f-mono); font-size:10px; letter-spacing:.18em; text-transform:uppercase; color:var(--text-secondary); margin-bottom:12px; }
  .na-badges{ display:flex; gap:6px; flex-wrap:wrap; margin-bottom:14px; }
  .na-badge{ font-family:var(--f-mono); font-size:9px; letter-spacing:.10em; text-transform:uppercase; padding:4px 8px; border-radius:2px; border:1px solid; }
  .na-badge.type{ color:var(--text-primary); border-color:var(--line-strong); }
  .na-badge.stance[data-stance="threat"]{ color:var(--st-threat); border-color:var(--st-threat); }
  .na-badge.stance[data-stance="complicit"]{ color:var(--st-complicit); border-color:var(--st-complicit); }
  .na-badge.stance[data-stance="neutral"]{ color:var(--st-neutral); border-color:var(--st-neutral); }
  .na-badge.stance[data-stance="defender"]{ color:var(--st-defender); border-color:var(--st-defender); }
  .na-badge.stance[data-stance="shrine"]{ color:var(--st-shrine); border-color:var(--st-shrine); }
  .na-badge.year{ color:var(--text-secondary); border-color:var(--line-mid); }
  .na-name{ font-family:var(--f-display); font-weight:400; font-size:25px; line-height:1.12; color:var(--text-primary); margin-bottom:5px; letter-spacing:-.015em; }
  .na-name em{ font-style:italic; color:var(--st-defender); }
  .na-cn{ font-family:var(--f-cn); font-size:14px; color:var(--text-secondary); margin-bottom:6px; }
  .na-section{ margin-top:16px; padding-top:14px; border-top:1px dashed var(--line-soft); }
  .na-section-label{ font-family:var(--f-mono); font-size:10px; letter-spacing:.14em; text-transform:uppercase; color:var(--text-secondary); margin-bottom:9px; }
  .na-section-body{ font-family:var(--f-body); font-size:13.5px; line-height:1.65; color:var(--text-primary); }
  .na-metrics{ display:flex; gap:18px; }
  .na-metric .v{ font-family:var(--f-display); font-size:26px; color:var(--hl); line-height:1; }
  .na-metric .k{ font-family:var(--f-mono); font-size:9px; letter-spacing:.12em; text-transform:uppercase; color:var(--text-faint); margin-top:4px; }
  .na-conns{ display:flex; flex-direction:column; gap:2px; max-height:230px; overflow:auto; }
  .na-conn{ display:grid; grid-template-columns:46px 1fr; gap:10px; padding:7px 4px; border-bottom:1px dashed var(--line-soft); align-items:baseline; cursor:pointer; transition:background 140ms; }
  .na-conn:hover{ background:var(--bg-card-2); }
  .na-conn .id{ font-family:var(--f-mono); font-size:10px; }
  .na-conn .id[data-stance="threat"]{ color:var(--st-threat); }
  .na-conn .id[data-stance="complicit"]{ color:var(--st-complicit); }
  .na-conn .id[data-stance="neutral"]{ color:var(--st-neutral); }
  .na-conn .id[data-stance="defender"]{ color:var(--st-defender); }
  .na-conn .id[data-stance="shrine"]{ color:var(--st-shrine); }
  .na-conn .name{ font-size:12.5px; color:var(--text-primary); }
  .na-empty{ flex:1; display:flex; align-items:center; justify-content:center; text-align:center; color:var(--text-faint); font-family:var(--f-mono); font-size:10px; letter-spacing:.18em; text-transform:uppercase; }

  @media (max-width:1024px){
    .net-stage{ grid-template-columns:1fr; }
    .net-canvas-wrap{ border-right:none; border-bottom:1px solid var(--line-mid); }
    #netSvg{ height:520px; }
    .net-analysis{ min-height:auto; }
  }

.cx-wrap{background:var(--bg-deep);border-radius:10px;overflow:hidden}
`;

const NETWORK_MARKUP = `
<div class="meta-bar">
  <div class="meta-bar-left">
    <a href="index.html">← Back to archive</a>
    <span class="dot"></span>
    <span>§ The network · 关系 · enriched</span>
  </div>
  <div class="meta-bar-right">
    <span class="meta-bar-coord" id="metaCount">— actors · — instruments · — events · — sites</span>
    <span class="meta-bar-coord">Bangkok · 2026.06</span>
  </div>
</div>



<header class="page-hero">
  <div class="wrap">
    <div class="eyebrow"><span>The network · power relations · 关系</span></div>
    <h1 class="page-title">
      Who is <em>always</em><br>in the room?
      <span class="cn">谁始终在场</span>
    </h1>
    <p class="page-lead">
      A property dispute is never just two parties. Every node — <strong>actor, instrument, event, or site</strong> — is coloured by where it stands, from <span style="color:var(--st-threat)">threat</span> to <span style="color:var(--st-defender)">defender</span>, around the <span style="color:var(--st-shrine)">shrine</span> at the centre. Hover, drag, search, or switch layouts. <em>The same names appear at every site. That is the system.</em>
    </p>
  </div>
</header>

<section class="section-block">
  <div class="wrap">
    <!-- toolbar row 1: type filter + search + layout -->
    <div class="net-toolbar">
      <span class="net-toolbar-label">Type</span>
      <button class="net-chip active" data-filter="all">All</button>
      <button class="net-chip" data-filter="actor">Actors</button>
      <button class="net-chip" data-filter="instrument">Instruments</button>
      <button class="net-chip" data-filter="event">Events</button>
      <button class="net-chip" data-filter="site">Sites</button>
      <span style="flex:1"></span>
      <input id="netSearch" class="net-search" type="text" placeholder="Search a node…  e.g. PMCU, shrine, lease" autocomplete="off">
      <button class="net-btn" id="layoutToggle">Layout · Force</button>
      <button class="net-btn" id="resetView">Reset</button>
    </div>
    <!-- toolbar row 2: stance legend / filter -->
    <div class="net-toolbar row2">
      <span class="net-toolbar-label">Stance</span>
      <button class="net-chip active" data-stancefilter="all">All</button>
      <button class="net-chip" data-stancefilter="threat" data-stance="threat"><span class="sw"></span>Threat</button>
      <button class="net-chip" data-stancefilter="complicit" data-stance="complicit"><span class="sw"></span>Complicit</button>
      <button class="net-chip" data-stancefilter="neutral" data-stance="neutral"><span class="sw"></span>Neutral</button>
      <button class="net-chip" data-stancefilter="defender" data-stance="defender"><span class="sw"></span>Defender</button>
      <button class="net-chip" data-stancefilter="shrine" data-stance="shrine"><span class="sw"></span>Shrine</button>
      <span style="flex:1"></span>
      <span class="net-toolbar-label" style="margin:0">○ actor &nbsp; ▢ instrument &nbsp; ◇ event &nbsp; ◉ site</span>
    </div>

    <div class="net-stage">
      <div class="net-canvas-wrap">
        <svg id="netSvg" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
          <g id="netViewport">
            <g id="netLinksLayer"></g>
            <g id="netNodesLayer"></g>
          </g>
        </svg>
        <div class="net-hud">
          <div><b id="hudFocus">S05 · Shrine</b></div>
          <div>drag node to pin · drag canvas to pan · scroll to zoom</div>
        </div>
        <div class="net-zoom">
          <button id="zoomIn">+</button>
          <button id="zoomOut">−</button>
        </div>
      </div>
      <aside class="net-analysis" id="analysisPanel">
        <div class="na-empty">Hover a node to read the analysis</div>
      </aside>
    </div>

    <div class="nav-back">
      <a href="index.html">← Back to archive</a>
      <a href="map.html">→ See the sites on the map</a>
      <a href="conflicts.html">→ See the conflict cases</a>
    </div>
  </div>
</section>
`;

/* network-graph.js — enriched force/concentric network for Chula Powermap
   Vanilla JS, no external libs. Pairs with network-data.js + network_rich.html */
function initGraph(root){
  const SVG_NS = "http://www.w3.org/2000/svg";
  const W = 1000, H = 720, CX = W / 2, CY = H / 2 - 6;

  const svg = root.querySelector("#netSvg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  const viewport = root.querySelector("#netViewport");
  const linksLayer = root.querySelector("#netLinksLayer");
  const nodesLayer = root.querySelector("#netNodesLayer");
  const panel = root.querySelector("#analysisPanel");
  const hudFocus = root.querySelector("#hudFocus");

  const nodes = NET_NODES.map(n => ({ ...n }));
  const nodeMap = Object.fromEntries(nodes.map(n => [n.id, n]));
  const links = NET_LINKS
    .filter(([a, b]) => nodeMap[a] && nodeMap[b])
    .map(([a, b]) => ({ a, b, sa: nodeMap[a], sb: nodeMap[b] }));

  // ---- degree (centrality) ----
  nodes.forEach(n => (n.deg = 0));
  links.forEach(l => { l.sa.deg++; l.sb.deg++; });
  const maxDeg = Math.max(...nodes.map(n => n.deg));

  // node radius by type + degree
  function radiusOf(n) {
    if (n.type === "site") return n.id === "S05" ? 30 : 19 + (n.deg / maxDeg) * 6;
    const base = { actor: 7, instrument: 7, event: 6 }[n.type] || 7;
    return base + (n.deg / maxDeg) * 13;
  }
  nodes.forEach(n => (n.r = radiusOf(n)));

  // ---- counts in meta bar ----
  const c = t => nodes.filter(n => n.type === t).length;
  root.querySelector("#metaCount").textContent =
    `${c("actor")} actors · ${c("instrument")} instruments · ${c("event")} events · ${c("site")} sites`;

  // ---- initial positions ----
  nodes.forEach((n, i) => {
    if (n.id === "S05") { n.x = CX; n.y = CY; }
    else {
      const ang = (i / nodes.length) * Math.PI * 2;
      n.x = CX + Math.cos(ang) * (120 + (i % 5) * 55);
      n.y = CY + Math.sin(ang) * (110 + (i % 5) * 45);
    }
    n.vx = 0; n.vy = 0; n.pinned = false;
  });

  // ---- concentric ring targets (poster order: instruments inner → actors → events → sites) ----
  const RING = { instrument: 130, actor: 235, event: 330, site: 430 };
  function assignRingAngles() {
    const byType = { instrument: [], actor: [], event: [], site: [] };
    nodes.forEach(n => { if (n.id !== "S05") byType[n.type] && byType[n.type].push(n); });
    Object.values(byType).forEach(arr => {
      // order by stance so colours group around the ring
      const order = { threat: 0, complicit: 1, neutral: 2, shrine: 3, defender: 4 };
      arr.sort((p, q) => (order[p.stance] - order[q.stance]) || p.id.localeCompare(q.id));
      arr.forEach((n, k) => { n.ringAng = (k / arr.length) * Math.PI * 2; });
    });
  }
  assignRingAngles();

  let layoutMode = "force"; // 'force' | 'concentric'

  // ---- simple force simulation ----
  let alpha = 1;
  function tick() {
    const k = alpha;
    // repulsion (O(n^2), n~105 fine)
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        let dx = a.x - b.x, dy = a.y - b.y;
        let d2 = dx * dx + dy * dy || 0.01;
        const minD = (a.r + b.r + 10);
        const rep = (layoutMode === "force" ? 2600 : 900) / d2;
        let f = rep;
        if (d2 < minD * minD) f += (minD * minD - d2) / d2 * 0.12; // collision
        const d = Math.sqrt(d2);
        const fx = (dx / d) * f, fy = (dy / d) * f;
        if (!a.pinned) { a.vx += fx; a.vy += fy; }
        if (!b.pinned) { b.vx -= fx; b.vy -= fy; }
      }
    }
    // link springs
    const target = layoutMode === "force" ? 78 : 60;
    links.forEach(l => {
      const a = l.sa, b = l.sb;
      let dx = b.x - a.x, dy = b.y - a.y;
      let d = Math.sqrt(dx * dx + dy * dy) || 0.01;
      const f = (d - target) * 0.02 * k;
      const fx = (dx / d) * f, fy = (dy / d) * f;
      if (!a.pinned) { a.vx += fx; a.vy += fy; }
      if (!b.pinned) { b.vx -= fx; b.vy -= fy; }
    });
    // positioning gravity
    nodes.forEach(n => {
      if (n.pinned) return;
      if (n.id === "S05") { n.x = CX; n.y = CY; n.vx = n.vy = 0; return; }
      if (layoutMode === "concentric") {
        const tx = CX + Math.cos(n.ringAng) * RING[n.type];
        const ty = CY + Math.sin(n.ringAng) * RING[n.type];
        n.vx += (tx - n.x) * 0.06;
        n.vy += (ty - n.y) * 0.06;
      } else {
        n.vx += (CX - n.x) * 0.0016;
        n.vy += (CY - n.y) * 0.0016;
      }
      n.vx *= 0.86; n.vy *= 0.86;
      n.x += n.vx; n.y += n.vy;
    });
    alpha *= 0.992;
    if (alpha < 0.02) alpha = 0.02;
  }

  // ---- build SVG elements ----
  const linkEls = links.map(l => {
    const el = document.createElementNS(SVG_NS, "path");
    el.setAttribute("class", "net-link");
    el.dataset.a = l.a; el.dataset.b = l.b;
    linksLayer.appendChild(el);
    l.el = el;
    return l;
  });

  const nodeEls = nodes.map(n => {
    const g = document.createElementNS(SVG_NS, "g");
    g.setAttribute("class", "net-node" + (n.flagship ? " flagship" : ""));
    g.dataset.id = n.id; g.dataset.type = n.type; g.dataset.stance = n.stance;

    let shape;
    if (n.type === "instrument") {
      shape = document.createElementNS(SVG_NS, "rect");
      shape.setAttribute("width", n.r * 1.9); shape.setAttribute("height", n.r * 1.9);
      shape.setAttribute("x", -n.r * 0.95); shape.setAttribute("y", -n.r * 0.95);
      shape.setAttribute("rx", 2);
    } else if (n.type === "event") {
      shape = document.createElementNS(SVG_NS, "polygon");
      const r = n.r * 1.15;
      shape.setAttribute("points", `0,${-r} ${r},0 0,${r} ${-r},0`);
    } else {
      shape = document.createElementNS(SVG_NS, "circle");
      shape.setAttribute("r", n.r);
    }
    shape.setAttribute("class", "net-node-shape");
    g.appendChild(shape);

    const code = document.createElementNS(SVG_NS, "text");
    code.setAttribute("class", "net-node-code");
    code.setAttribute("dy", "2.6");
    code.textContent = n.id;
    if (n.r >= 9) g.appendChild(code);

    const label = document.createElementNS(SVG_NS, "text");
    label.setAttribute("class", "net-node-label");
    label.setAttribute("dy", n.r + 11);
    label.textContent = shortName(n);
    g.appendChild(label);

    g.addEventListener("mouseenter", () => { if (!dragState.node) setActiveNode(n.id); });
    g.addEventListener("click", e => { e.stopPropagation(); setActiveNode(n.id); });
    addDrag(g, n);
    nodesLayer.appendChild(g);
    n.g = g; n.shapeEl = shape; n.labelEl = label;
    return n;
  });

  function shortName(n) {
    const s = n.name.replace(/\s*\(.*?\)\s*/g, " ").trim();
    return s.length > 22 ? s.slice(0, 20) + "…" : s;
  }

  function render() {
    linkEls.forEach(l => {
      const a = l.sa, b = l.sb;
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
      const dx = b.x - a.x, dy = b.y - a.y;
      const curve = 0.12;
      const cx = mx - dy * curve, cy = my + dx * curve;
      l.el.setAttribute("d", `M${a.x},${a.y} Q${cx},${cy} ${b.x},${b.y}`);
    });
    nodeEls.forEach(n => n.g.setAttribute("transform", `translate(${n.x},${n.y})`));
  }

  let rafId;
  function loop() { tick(); render(); rafId = requestAnimationFrame(loop); }
  // settle a bit before showing motion smoothly
  for (let i = 0; i < 120; i++) tick();
  render();
  loop();

  // ====================== INTERACTION ======================
  let activeId = null;
  let typeFilter = "all", stanceFilter = "all";

  function neighborsOf(id) {
    const set = new Set([id]);
    links.forEach(l => { if (l.a === id) set.add(l.b); if (l.b === id) set.add(l.a); });
    return set;
  }

  function passesFilter(n) {
    return (typeFilter === "all" || n.type === typeFilter) &&
           (stanceFilter === "all" || n.stance === stanceFilter);
  }

  function applyFilterDim() {
    nodeEls.forEach(n => {
      n.g.classList.toggle("dimmed", !passesFilter(n));
    });
    linkEls.forEach(l => {
      const vis = passesFilter(l.sa) && passesFilter(l.sb);
      l.el.classList.toggle("dimmed", !vis);
      l.el.classList.remove("highlighted");
    });
    if (activeId) setActiveNode(activeId, true);
  }

  function setActiveNode(id, keepFilter) {
    activeId = id;
    const n = nodeMap[id];
    const nb = neighborsOf(id);
    hudFocus.textContent = `${id} · ${n.name}`;

    nodeEls.forEach(m => {
      m.g.classList.toggle("active", m.id === id);
      const dim = !nb.has(m.id) || !passesFilter(m);
      m.g.classList.toggle("dimmed", dim);
      m.g.classList.toggle("faded-label", dim);
    });
    linkEls.forEach(l => {
      const conn = l.a === id || l.b === id;
      l.el.classList.toggle("highlighted", conn);
      l.el.classList.toggle("dimmed", !conn);
    });

    const conns = links.filter(l => l.a === id || l.b === id)
      .map(l => nodeMap[l.a === id ? l.b : l.a]);
    const typeName = { actor: "Actor · 行动者", instrument: "Instrument · 工具", event: "Event · 事件", site: "Site · 场域" }[n.type];
    const stanceName = { threat: "Threat", complicit: "Complicit", neutral: "Neutral", defender: "Defender", shrine: "Shrine" }[n.stance];

    panel.innerHTML = `
      <div class="na-tag">§ ${n.id}</div>
      <div class="na-badges">
        <span class="na-badge type">${typeName}</span>
        <span class="na-badge stance" data-stance="${n.stance}">${stanceName}</span>
        ${n.year ? `<span class="na-badge year">${n.year}</span>` : ""}
        ${n.flagship ? `<span class="na-badge year">★ flagship</span>` : ""}
      </div>
      <h3 class="na-name">${n.flagship ? `<em>${n.name}</em>` : n.name}</h3>
      <div class="na-cn">${n.cn || ""}</div>
      <div class="na-section">
        <div class="na-section-label">Analysis</div>
        <div class="na-section-body">${n.note}</div>
      </div>
      <div class="na-section">
        <div class="na-metrics">
          <div class="na-metric"><div class="v">${n.deg}</div><div class="k">connections</div></div>
          <div class="na-metric"><div class="v">${rankOf(n)}</div><div class="k">centrality rank</div></div>
        </div>
      </div>
      <div class="na-section" style="flex:1; display:flex; flex-direction:column;">
        <div class="na-section-label">Connected to · ${conns.length}</div>
        <div class="na-conns">
          ${conns.sort((a, b) => b.deg - a.deg).map(x => `
            <div class="na-conn" data-goto="${x.id}">
              <span class="id" data-stance="${x.stance}">${x.id}</span>
              <span class="name">${x.name}</span>
            </div>`).join("")}
        </div>
      </div>`;
    panel.querySelectorAll(".na-conn").forEach(el =>
      el.addEventListener("click", () => focusNode(el.dataset.goto)));
  }

  const degRank = [...nodes].sort((a, b) => b.deg - a.deg);
  function rankOf(n) { return "#" + (degRank.indexOf(n) + 1); }

  function focusNode(id) {
    setActiveNode(id);
    const n = nodeMap[id];
    // gently center the view on the node
    view.tx = CX - n.x * view.s;
    view.ty = CY - n.y * view.s;
    applyView();
  }

  // ---- type filter chips ----
  root.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener("click", () => {
      root.querySelectorAll('[data-filter]').forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      typeFilter = btn.dataset.filter;
      activeId ? setActiveNode(activeId, true) : applyFilterDim();
    });
  });
  // ---- stance filter chips ----
  root.querySelectorAll('[data-stancefilter]').forEach(btn => {
    btn.addEventListener("click", () => {
      root.querySelectorAll('[data-stancefilter]').forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      stanceFilter = btn.dataset.stancefilter;
      activeId ? setActiveNode(activeId, true) : applyFilterDim();
    });
  });

  // ---- search ----
  const search = root.querySelector("#netSearch");
  search.addEventListener("keydown", e => {
    if (e.key !== "Enter") return;
    const q = search.value.trim().toLowerCase();
    if (!q) return;
    const hit = nodes.find(n =>
      n.id.toLowerCase() === q ||
      n.name.toLowerCase().includes(q) ||
      (n.cn && n.cn.includes(q)));
    if (hit) { focusNode(hit.id); alpha = Math.max(alpha, 0.4); }
  });

  // ---- layout toggle ----
  const layoutBtn = root.querySelector("#layoutToggle");
  layoutBtn.addEventListener("click", () => {
    layoutMode = layoutMode === "force" ? "concentric" : "force";
    layoutBtn.textContent = "Layout · " + (layoutMode === "force" ? "Force" : "Concentric");
    nodes.forEach(n => (n.pinned = false));
    if (layoutMode === "concentric") assignRingAngles();
    alpha = 1;
  });

  // ---- click empty space clears focus ----
  svg.addEventListener("click", () => {
    activeId = null;
    nodeEls.forEach(m => m.g.classList.remove("active", "dimmed", "faded-label"));
    linkEls.forEach(l => l.el.classList.remove("highlighted", "dimmed"));
    hudFocus.textContent = "— hover a node —";
    applyFilterDim();
    panel.innerHTML = `<div class="na-empty">Hover a node to read the analysis</div>`;
  });

  // ====================== ZOOM / PAN ======================
  const view = { s: 1, tx: 0, ty: 0 };
  function applyView() { viewport.setAttribute("transform", `translate(${view.tx},${view.ty}) scale(${view.s})`); }
  function clientToSvg(cx, cy) {
    const r = svg.getBoundingClientRect();
    return { x: (cx - r.left) / r.width * W, y: (cy - r.top) / r.height * H };
  }
  svg.addEventListener("wheel", e => {
    e.preventDefault();
    const p = clientToSvg(e.clientX, e.clientY);
    const f = e.deltaY < 0 ? 1.12 : 1 / 1.12;
    const ns = Math.min(4, Math.max(0.4, view.s * f));
    view.tx = p.x - (p.x - view.tx) * (ns / view.s);
    view.ty = p.y - (p.y - view.ty) * (ns / view.s);
    view.s = ns; applyView();
  }, { passive: false });

  root.querySelector("#zoomIn").onclick = () => zoomBy(1.2);
  root.querySelector("#zoomOut").onclick = () => zoomBy(1 / 1.2);
  function zoomBy(f) {
    const ns = Math.min(4, Math.max(0.4, view.s * f));
    view.tx = CX - (CX - view.tx) * (ns / view.s);
    view.ty = CY - (CY - view.ty) * (ns / view.s);
    view.s = ns; applyView();
  }
  root.querySelector("#resetView").onclick = () => {
    view.s = 1; view.tx = 0; view.ty = 0; applyView();
    nodes.forEach(n => (n.pinned = false)); alpha = 1;
  };

  // ---- pan (drag background) ----
  let pan = null;
  svg.addEventListener("pointerdown", e => {
    if (e.target.closest(".net-node")) return;
    pan = { x: e.clientX, y: e.clientY, tx: view.tx, ty: view.ty };
    svg.classList.add("dragging"); svg.setPointerCapture(e.pointerId);
  });
  svg.addEventListener("pointermove", e => {
    if (!pan) return;
    const r = svg.getBoundingClientRect();
    view.tx = pan.tx + (e.clientX - pan.x) / r.width * W;
    view.ty = pan.ty + (e.clientY - pan.y) / r.height * H;
    applyView();
  });
  svg.addEventListener("pointerup", e => { pan = null; svg.classList.remove("dragging"); });

  // ---- node drag ----
  const dragState = { node: null };
  function addDrag(g, n) {
    g.addEventListener("pointerdown", e => {
      e.stopPropagation();
      dragState.node = n; n.pinned = true;
      g.setPointerCapture(e.pointerId);
    });
    g.addEventListener("pointermove", e => {
      if (dragState.node !== n) return;
      const p = clientToSvg(e.clientX, e.clientY);
      n.x = (p.x - view.tx) / view.s;
      n.y = (p.y - view.ty) / view.s;
      alpha = Math.max(alpha, 0.3);
    });
    g.addEventListener("pointerup", e => {
      if (dragState.node === n) dragState.node = null;
    });
  }

  // ---- start focused on the shrine ----
  setActiveNode("S05");
  return () => { if (rafId) cancelAnimationFrame(rafId); };

}

export default function NetworkGraph() {
  const ref = useRef(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    root.innerHTML = NETWORK_MARKUP;
    let cleanup;
    try { cleanup = initGraph(root); } catch (e) { console.error(e); }
    return () => { if (cleanup) cleanup(); };
  }, []);
  return (
    <>
      <style>{NETWORK_STYLE}</style>
      <div ref={ref} style={{ background: "#1a1428", color: "#ede4f5", borderRadius: 10, overflow: "hidden" }} />
    </>
  );
}
