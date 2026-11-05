// Board and leadership profiles mirrored from https://mubadalabio.ae/our-leadership/ (Nov 2026).
export type Leader = { name: string; role: string; photo: string; bio: string[] };

const people: (Leader & { group: 'board' | 'team' })[] = [
  {
    "group": "board",
    "name": "Dr. Bakheet Al Katheeri",
    "role": "Chairman",
    "photo": "https://mubadalabio.ae/wp-content/uploads/2025/10/bakheetbhai.png",
    "bio": [
      "Dr. Bakheet Al Katheeri is Chairman of Mubadala Bio and serves as Chief Executive Officer of Mubadala’s UAE Investments platform, the national investment arm responsible for building national champions, advancing strategic sectors, and accelerating the country’s economic diversification. In addition, he is a member of Mubadala’s Investment Committee.",
      "Dr. Bakheet oversees a diverse portfolio spanning energy, metals, aerospace, technology, healthcare, real estate, and infrastructure. In addition to being the Chairman of Mubadala Bio, he currently serves as Chairman of Mubadala Energy, Space42, and Tabreed, and is a board member of Masdar, Emirates Global Aluminium (EGA), among others.",
      "Previously, he was Executive Director of the UAE Industries Unit, managing a portfolio of industrial companies across renewables, conventional energy, metals, and utilities. Earlier in his career, he held several senior leadership roles at Mubadala Energy, including CEO, COO, and Chief Growth Officer, where he led strategy, operations, and M&A.",
      "Dr. Bakheet began his career at ADNOC, where he led production and facilities engineering across five operating companies covering all offshore operations in Abu Dhabi.",
      "He holds a BSc in Petroleum Engineering and Applied Mathematics from The University of Tulsa, USA, an MSc in Environmental Science from the United Arab Emirates University (UAEU), an Executive MBA from the Higher Colleges of Technology (HCT), and a Doctorate of Business Administration from UAEU."
    ]
  },
  {
    "group": "board",
    "name": "Dr. Abdulmajeed Alzubaidi",
    "role": "Board Member",
    "photo": "https://mubadalabio.ae/wp-content/uploads/2025/10/abdulmajeed-2.png",
    "bio": [
      "Dr. Abdulmajeed Alzubaidi is a Board Member of Mubadala Bio and a leading Interventional Cardiologist with more than three decades of clinical and leadership experience in cardiovascular medicine.",
      "He is a Fellow of the American College of Cardiology (FACC) and is widely recognized for advancing cardiac care and medical governance across the UAE’s premier healthcare institutions.",
      "Dr. Abdulmajeed has held several key leadership roles throughout his distinguished career, including Chief Medical Officer, Chair of Cardiac Sciences, and President of the Emirates Cardiac Society. He currently serves as Medical Advisor to the Presidential Court and as a Consultant Interventional Cardiologist at Sheikh Khalifa Medical City (SKMC) in Abu Dhabi.",
      "In recognition of his contributions to healthcare and public service, Dr. Abdulmajeed was awarded the Medal of the Chairman of the Executive Council in 2016 and the Abu Dhabi Award in 2019.",
      "He holds an MBBS from Cairo University, Egypt, and completed his Internal Medicine Residency, Cardiology Fellowship, and Interventional Cardiology Fellowship from the University of British Columbia, Canada."
    ]
  },
  {
    "group": "board",
    "name": "Ismail Ali Abdulla",
    "role": "Board Member",
    "photo": "https://mubadalabio.ae/wp-content/uploads/2025/10/ismail-1.png",
    "bio": [
      "Ismail Ali Abdulla is a Board Member of Mubadala Bio and serves as the Executive Director of the UAE Clusters unit within Mubadala’s UAE Investments platform. He is also the Managing Director of Strata. In this capacity, he has strategic oversight of a diverse portfolio of assets across key national sectors including technology, aerospace, Artificial Intelligence and healthcare.",
      "He plays a central role in driving investments that accelerate the UAE’s economic transformation, develop globally competitive national champions, and cultivate dynamic industrial and commercial clusters in partnership with world-class global entities.",
      "In addition to leading the UAE Clusters unit, Ismail oversees Strata’s operations and long-term strategy, strengthening the company’s global competitiveness in the aerospace sector while advancing the UAE’s position as a leading international hub for advanced manufacturing. Under his leadership, Strata has diversified into next-generation industries including advanced materials, automation and digital solutions.",
      "Ismail has been instrumental in shaping the development of the UAE’s aerospace ecosystem. He played a foundational role in the creation of Strata, initially serving as the company’s Asset Manager from 2009 before advancing to Chief Executive Officer and later Managing Director. He also led the development of the Nibras Al Ain Aerospace Park, a multifaceted industrial zone designed to support the long-term growth of a sustainable aerospace industry in Abu Dhabi.",
      "Since joining Mubadala in 2008, Ismail has contributed to numerous aerospace and engineering initiatives across the organization. He has held several roles within the Aerospace, Renewables, and ICT (AR&I) platform’s business development team, guiding major projects from early concept through execution and delivery.",
      "He is Chairman of the Strata–Solvay Advanced Materials Joint Venture and serves on the boards of Space42, Strata Manufacturing, Paragraf, and Oumolat Security Printing.",
      "Ismail holds a Master’s Degree in Project Management and a Bachelor’s Degree in Information and Communication Technology from Queen Mary University of London."
    ]
  },
  {
    "group": "board",
    "name": "Muhannad Al Qudah",
    "role": "Board Member",
    "photo": "https://mubadalabio.ae/wp-content/uploads/2025/10/muhannad-1.png",
    "bio": [
      "Muhannad Al Qudah is a Board Member of Mubadala Bio and the Chief Financial Officer of Mubadala’s UAE Investments platform, overseeing the financial operations of assets across aerospace manufacturing, telecommunications, satellites, mega data centers, utilities, and renewable energy. With over 20 years of experience, Muhannad is currently responsible for strategic financial planning, budgeting, performance scorecards, valuations, structured finance, management, and business performance analysis, as well as statutory reporting, controllership, and governance.",
      "With over 12 years at Mubadala, Muhannad has held several senior leadership positions, including Finance Manager, Senior Vice President of Finance, and Finance Director.",
      "Prior to joining Mubadala, he was a Finance Manager at Dubai Holding, overseeing real estate and hospitality investments. Before that, he worked with reputable telecommunications companies, including Du, Saudi Telecom Company, and Zain, where he managed accounting and finance.",
      "Muhannad holds an MBA from London Business School, is an American Certified Management Accountant (CMA) and American Certified Financial Manager (CFM), and holds a bachelor’s degree in accounting and finance."
    ]
  },
  {
    "group": "board",
    "name": "Abdulla Mohamed Shadid",
    "role": "Board Member",
    "photo": "https://mubadalabio.ae/wp-content/uploads/2025/10/abdulla-1.png",
    "bio": [
      "Abdulla Mohamed Shadid is a Board Member of Mubadala Bio and serves as the Head of the Energy and Sustainability business unit within Mubadala’s Private Equity platform. In this role, he oversees Mubadala’s global private equity investments in climate and sustainability, as well as its strategic relationships with key General Partners (GPs).",
      "In addition to being a board member at Mubadala Bio, Abdulla is also a board member of Moeve (formerly CEPSA) and a member of Mubadala’s Private Equity Investment Committee and Investment and Business Planning Committee.",
      "A long-standing member of Mubadala’s leadership team, Abdulla has served in various management roles during his 20+ year tenure, with a focus on diversified industrials. He was a member of the team that developed Mubadala’s first comprehensive investment strategy for the Aerospace sector and was subsequently engaged in its implementation and execution. In addition to various M&A and business development transactions, he worked on establishing foundational partnerships with leading global GPs and industrial leaders. In 2013, Abdulla served as Head of Aerospace, overseeing Mubadala’s global aerospace portfolio and driving monetization of several strategic assets. He later served as Executive Director in the Growth and M&A unit, and subsequently in the Industrials and Business Services unit, where he led Mubadala’s Impact Investing strategy in Private Equity.",
      "Between 2018 and 2020, Abdulla served as Managing Director, Cargo and Logistics Services at Etihad Aviation Group, where he played an active role in evolving Etihad Cargo’s business strategy and rolling out its ambitious transformation program.",
      "He holds a Bachelor of Engineering degree in Electronic and Electrical Engineering from University College London (UCL), United Kingdom."
    ]
  },
  {
    "group": "board",
    "name": "Ali Abdulrahman Alfahim",
    "role": "Board Member",
    "photo": "https://mubadalabio.ae/wp-content/uploads/2025/11/alfahim.png",
    "bio": [
      "Ali Abdulrahman Alfahim is a Board Member of Mubadala Bio and a seasoned legal professional with over 15 years of experience in corporate and commercial law. He currently serves as General Counsel for Mubadala’s UAE Investments platform, where he provides strategic legal oversight across a diverse portfolio spanning aerospace, technology, energy, healthcare, real estate, and advanced industries. In this role, he advises on complex transactions, structures strategic investments, and ensures regulatory alignment across the platform’s national and international operations.",
      "Since joining Mubadala in 2009, Ali has progressed through several leadership roles, demonstrating excellence in managing high-value deals and cross-border legal frameworks. His experience also extends to senior positions in Masdar, where he served as Deputy General Counsel, and Yahsat, where he served as General Counsel.",
      "Ali is a qualified solicitor in England & Wales and holds a Bachelor of Civil Law (BCL) from University College Cork, National University of Ireland."
    ]
  },
  {
    "group": "board",
    "name": "Michael P. Cleanis",
    "role": "Board Member",
    "photo": "https://mubadalabio.ae/wp-content/uploads/2025/10/michael.png",
    "bio": [
      "Michael Cleanis is a Board Member of Mubadala Bio and the Executive Director of Growth & Value Creation (GVC) within Mubadala’s UAE Investments platform. He is also a member of the platform’s Executive Leadership Team and Investment Committee, and serves on the Investment Committee of Mubadala’s Real Assets platform.",
      "In his role, Michael leads GVC, a centralized M&A and capital markets execution function that drives new investments, monetizations, and divestment activities. The unit develops platform-wide strategy, identifies new sectors, and cultivates partnerships with global investors to support existing assets, new ventures, and strategic transactions.",
      "Michael currently serves on several boards and strategic committees, including ARCC at M42 Health, Network International & Magnati, and Cleveland Clinic Abu Dhabi. He is also a member of Mubadala’s Strategy and Investment Committee, Abu Dhabi Catalyst Partners, the Finance Committee at Tabreed, and the Advisory Council of the Dubai International Chamber. Previously, he served as a Board Member of LeasePlan Emirates.",
      "With over 20 years of experience, Michael began his career in investment banking, holding roles at Deutsche Bank and Merrill Lynch across Brussels, London, and Dubai. Before joining Mubadala in 2022, he served as Head of Investment Banking for the Middle & North Africa at UBS and was a member of the regional group executive committee. He has over 17 years of experience in the Middle East and has led and advised on high-value M&A and capital markets transactions.Michael holds a Bachelor of Science in Economics, summa cum laude, from the Université Libre de Bruxelles, Belgium, and a Certificate in Corporate Governance from INSEAD."
    ]
  },
  {
    "group": "team",
    "name": "Dr. Essam Mohamed",
    "role": "Group Chief Executive Officer",
    "photo": "https://mubadalabio.ae/wp-content/uploads/2025/11/Dr-Essam.png",
    "bio": [
      "Dr. Essam Mohamed is the Group Chief Executive Officer at Mubadala Bio, overseeing the company’s strategic direction and operational performance. With over three decades of leadership experience in the pharmaceutical industry, he has a proven record of driving business transformation, operational excellence, and sustainable growth.",
      "Before joining Mubadala Bio, Dr. Essam served as Chief Executive Officer (CEO) of Julphar, where he led a comprehensive transformation that improved the company’s performance. His leadership was instrumental in expanding the business, enhancing regulatory compliance, and significantly broadening the product portfolio.",
      "Prior to Julphar, he served as CEO of MS Pharma and El Kendi Pharmaceuticals, where he led their establishment and guided their growth into leading pharmaceutical companies in the MENA region.",
      "Earlier in his career, Dr. Essam held senior roles at prominent regional and global organizations, including Julphar Germany, Sanofi, and GSK. He has also successfully managed companies at startup phase and led major turnaround initiatives for leading pharmaceutical companies across diverse international markets.",
      "Dr. Essam holds a Master’s degree in Pharmaceutical Chemistry and Molecular Biology and an MBA in Operations Management."
    ]
  },
  {
    "group": "team",
    "name": "Hamad Almarzooqi",
    "role": "Group Deputy Chief Executive Officer",
    "photo": "https://mubadalabio.ae/wp-content/uploads/2025/10/hamad-1-1.png",
    "bio": [
      "Hamad is the Group Deputy CEO at Mubadala Bio, bringing nearly two decades of investment and leadership experience across the UAE, Russia, Brazil, and the UK. He most recently led the Life Sciences Cluster under the UAE Investments Platform at Mubadala Investment Company, overseeing strategy development, deal origination and execution, portfolio management, and business turnaround.",
      "Hamad has held significant roles within Mubadala since joining in 2011. His roles have included serving as Senior Principal for UK Sovereign Investment Partnerships in 2021 and as Co-Head of the Mubadala Brazil Office in 2019. Previously, in 2016, Hamad served as Principal for the Russia Sovereign Investment Partnerships portfolio. Across these roles, Hamad has successfully managed complex transactions across diverse asset classes, building strategic partnerships and driving long-term value. Earlier in his career, he held roles at Invest AD and Morgan Stanley in London, where he supported large-cap M&A transactions.",
      "In his role as Deputy CEO of Mubadala Bio, Hamad builds on his proven track record to drive strategy execution, foster partnerships, and accelerate business growth, advancing the company’s vision of becoming a global leader in the life sciences industry.",
      "Hamad holds an MBA and a Bachelor of Science in Finance, both with honors, from Bentley University in Boston, USA. He is a Chartered Financial Analyst (CFA) and is fluent in Arabic and English, with basic proficiency in Portuguese."
    ]
  },
  {
    "group": "team",
    "name": "Atif Azeem",
    "role": "Group Chief Financial Officer",
    "photo": "https://mubadalabio.ae/wp-content/uploads/2025/11/Ateef-Asim.png",
    "bio": [
      "Atif Azeem is the Group Chief Financial Officer of Mubadala Bio, bringing over three decades of international experience across finance, investments, treasury, accounting, and auditing. He most recently served as Group Chief Financial Officer at YAS Holding LLC, overseeing financial operations across multiple sectors, including aviation, real estate, technology, healthcare, and food and agriculture. Throughout his career, he has led large teams, executed major mergers and divestments, and driven treasury optimization initiatives that have significantly enhanced profitability and shareholder value.",
      "Atif has held senior leadership roles across the UAE and Bahrain, including Chief Financial and Operations Officer at Eagle Hills Diyar, where he led finance, sales, marketing, and operations for the landmark Marassi Al Bahrain development. He has also served in key executive positions at Zone Parking Solutions, Emaar Properties, and Majid Al Futtaim Group. Earlier in his career, he worked in the oil and gas, power, and infrastructure sectors, and began his professional journey with PwC in audit and advisory services. Across these roles, he has established a proven track record in financial transformation, governance, and value creation.",
      "In his role as Group Chief Financial Officer at Mubadala Bio, Atif leverages his extensive experience to drive financial strategy, enhance governance, and support the company’s growth ambitions in the life sciences sector.",
      "Atif is a Fellow Member of the Institute of Chartered Accountants of Pakistan. He is fluent in English and Urdu."
    ]
  },
  {
    "group": "team",
    "name": "Khalid Abdalla Alkaf",
    "role": "General Manager – Pharma Logistics",
    "photo": "https://mubadalabio.ae/wp-content/uploads/2025/11/Khaled-Al-Khaf.png",
    "bio": [
      "Khalid Alkaf is the General Manager of Pharma Logistics at Mubadala Bio, bringing over two decades of leadership and operational experience across multiple industries. He has a distinguished record of driving business transformation, optimizing complex operations, and delivering sustained organizational performance through innovation, efficiency, and strategic governance.",
      "Before joining Mubadala Bio, Khalid served as Chief Operating Officer at Yahsat, where he led large-scale operational programs across Yahsat’s subsidiaries, including YahClick and Thuraya. In this capacity, he spearheaded initiatives that strengthened business continuity, enhanced cybersecurity, and improved operational resilience across global markets.",
      "Throughout his career, Khalid has held progressive leadership roles in e&- UAE, e&-Egypt, and Yahsat Government Solutions (YGS), where he successfully led strategic operations, procurement, and IT infrastructure development. His work has been recognized with multiple awards, including being named one of Mubadala’s Top 3 Business Transformation Leaders in 2022 and receiving the 2021 Mubadala Best IT Response to Pandemic Award.",
      "Khalid holds an Executive MBA from INSEAD Business School in France and a Bachelor’s degree in Computer Engineering from Khalifa University (Etisalat College of Engineering) in the UAE. He is fluent in Arabic and English."
    ]
  }
];

export const board: Leader[] = people.filter((p) => p.group === 'board');
export const team: Leader[] = people.filter((p) => p.group === 'team');
