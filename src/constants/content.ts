// Content mirrored from mubadalabio.ae (Nov 2026). The site's WordPress REST API
// requires authentication, so content is bundled until a public feed is available.

export const SITE = 'https://mubadalabio.ae';
const UP = `${SITE}/wp-content/uploads`;

export const media = {
  heroImage: `${UP}/2025/10/mb.jpg`,
  videoPoster: `${UP}/2025/11/mubadala-banner-md.jpg`,
  video: `${UP}/2025/10/mubadala-video-2.mp4`,
};

export const social = [
  { icon: 'facebook' as const, url: 'https://www.facebook.com/mubadalabio/' },
  { icon: 'instagram' as const, url: 'https://www.instagram.com/mubadalabio/' },
  { icon: 'twitter' as const, url: 'https://x.com/mubadalabio' },
];

export const intro = [
  'Mubadala Bio is a life sciences company dedicated to pursuing better health outcomes for the UAE and beyond. As a catalyst for progress and innovation, we are accelerating the growth of the life sciences ecosystem by enhancing drug security and expanding access to affordable, essential treatments.',
  'With a growing footprint across the UAE, Asia, Africa, and Europe, we operate through two core verticals: Integrated Biopharma and Pharma Logistics, driving impact both locally and globally.',
];

export type Stat = { prefix?: string; value: number; decimals?: number; suffix: string; label: string };

export const stats: Stat[] = [
  { value: 2.5, decimals: 1, suffix: 'B', label: 'capsules produced annually' },
  { value: 120, suffix: 'M', label: 'IVs and injectables manufactured annually' },
  { value: 10, suffix: 'K+', label: 'SKUs manufactured and distributed' },
  { value: 3, suffix: 'K+', label: 'FTEs' },
  { value: 10, suffix: '', label: 'sites across UAE, Asia, Africa, and Europe' },
  { value: 100, suffix: '+', label: 'countries served' },
];

export const about = {
  paragraphs: [
    intro[0],
    'Operating through two core verticals, Integrated Biopharma and Pharma Logistics, we are advancing local pharmaceutical manufacturing while ensuring timely access to critical and lifesaving medications. With a growing footprint across Asia, Africa, and Europe, we are driving impact both locally and globally.',
    'Our portfolio focuses on key therapy areas that address some of the world’s most pressing health needs, supporting the full continuum of care. Headquartered in Abu Dhabi and wholly owned by Mubadala Investment Company, we are fostering innovation, cultivating local talent, and helping build a knowledge-based economy – delivering better health, closer for all.',
  ],
  aspiration:
    'To become a global leader in life sciences – advancing innovation, driving partnerships, and delivering transformative health outcomes for the UAE and beyond.',
  values: [
    { icon: 'shield-checkmark-outline' as const, title: 'Integrity', text: 'We uphold the highest level of honesty, transparency, and ethical decision-making in all that we do.' },
    { icon: 'checkmark-done-outline' as const, title: 'Accountability', text: 'We take full ownership of our actions, decisions, and outcomes.' },
    { icon: 'people-outline' as const, title: 'Partnership', text: 'We build strong, trust-based relationships by collaborating openly, communicating effectively, and supporting each other’s success.' },
    { icon: 'flash-outline' as const, title: 'Drive', text: 'We approach every challenge with passion, determination, and a relentless pursuit of excellence.' },
  ],
  aboutMubadalaUrl: 'https://www.mubadala.com/',
};

export type Subsidiary = { name: string; logo: string; paragraphs: string[]; highlights: string[] };
export type Vertical = {
  slug: 'integrated-biopharma' | 'pharma-logistics';
  title: string;
  summary: string;
  color: string;
  banner: string;
  subsidiaries: Subsidiary[];
};

export const verticals: Vertical[] = [
  {
    slug: 'integrated-biopharma',
    title: 'Integrated Biopharma',
    color: '#1c80fa',
    banner: `${UP}/2025/10/intergrated.jpg`,
    summary:
      'Advancing the development and local production of high-quality, essential drugs by expanding the UAE’s pharmaceutical manufacturing capabilities and enabling local manufacturing of key therapies through partnerships with international organizations.',
    subsidiaries: [
      {
        name: 'Bioventure Healthcare (BVH)',
        logo: `${UP}/2025/10/bioventure-1.png`,
        paragraphs: [
          'Bioventure Healthcare (BVH), is the region’s largest manufacturer of soft gelatin capsules for pharmaceutical and supplement products. BVH delivers world-class solutions with a strong focus on quality, compliance, and innovation.',
          'The company operates a state-of-the-art facility spanning 23,000 square meters, with an annual capacity of 1.5 billion capsules and blister/bottle packaging lines.',
          'BVH maintains the highest international certifications, fully adhering to cGMP and 21 CFR Part 11 standards. The facility features advanced technologies, including no-fill detection systems, serialization with track-and-trace, and a comprehensive quality control and microbiology lab.',
        ],
        highlights: [
          'Largest soft-gel capsule manufacturer in the region.',
          'EU and US GMP Certified, enabling exports to Europe and North America.',
          'First in the region to launch high-demand therapies as soft-gel capsules for faster absorption.',
        ],
      },
      {
        name: 'WellPharma',
        logo: `${UP}/2025/10/wellpharma.png`,
        paragraphs: [
          'Based in Abu Dhabi and established in 2013, Wellpharma is a market-leading pharmaceutical manufacturer specializing in intravenous (IV) fluids and dialysis solutions in Non-PVC bags, and a broad portfolio of therapeutic products encompassing over 50 formulations.',
          'Operating a fully automated facility equipped with advanced pharmaceutical production technology, Wellpharma adheres to the highest international quality standards. With a production capacity of 11 million bags in various forms and sizes, the company plays a vital role in supporting healthcare systems across the UAE and international markets.',
        ],
        highlights: ['Only UAE facility producing sterile IV bag solutions in Non-PVC bags.'],
      },
      {
        name: 'Gulf Inject',
        logo: `${UP}/2025/10/gulfinject-1.png`,
        paragraphs: [
          'Gulf Inject is a specialized manufacturer of sterile fluid management therapies, parenteral treatments, and a broad range of sterile healthcare solutions.',
          'With a state-of-the-art facility featuring Blow Fill-Seal machines and advanced, internationally accredited aseptic processing technology, Gulf Inject delivers high-quality products including local anesthetics, antibiotics, antimicrobials, antifungals, anticoagulants, NSAIDs, general IV solutions, hypertonic, and inhalation solutions.',
          'As it expands into injectables, ophthalmology, amino acids and respiratory care, Gulf Inject remains the preferred provider of sterile solutions for leading hospitals and clinics across the region.',
        ],
        highlights: [
          'Only UAE pharmaceutical manufacturer to produce single-use eye, ear, and oral drops.',
          'Only UAE facility with Blow-Fill-Seal (BFS) technology for contact-free sterile production.',
          'First in the UAE to produce generic Paracetamol injectables in LDPE bottles & ampoules.',
        ],
      },
      {
        name: 'DiabTec',
        logo: `${UP}/2025/11/DiabTec-d-Logo-scaled.png`,
        paragraphs: [
          'DiabTec is a state-of-the-art biomanufacturing facility equipped with 10,000 litre drug substance reactors and a dedicated cartridge fill finish line for biologics. Built to EU and US FDA standards, it is currently the only facility of its kind in the GCC.',
          'The plant offers complete capabilities to support the full production cycle of biopharmaceuticals, from drug substance manufacturing to final formulation and fill finish.',
          'The facility is designed to meet the MENA region’s demand for insulin-based therapies, including human insulin and all types of insulin analogues. With infrastructure for GLP1 products, DiabTec strengthens its position as a cornerstone in the region’s biologics manufacturing landscape.',
        ],
        highlights: [],
      },
    ],
  },
  {
    slug: 'pharma-logistics',
    title: 'Pharma Logistics',
    color: '#00b2a9',
    banner: `${UP}/2025/11/pharma-logi-banner.jpg`,
    summary:
      'Improving access and availability of essential and lifesaving medications and medical devices, in a cost-efficient and timely manner, enabling vertical integration with our manufacturing capabilities.',
    subsidiaries: [
      {
        name: 'Al Ittihad Drug Store (IDS)',
        logo: `${UP}/2026/08/IDS_LOGO_COLORED.svg`,
        paragraphs: [
          'Al Ittihad Drug Store (IDS) is a leading UAE-based distributor of essential pharmaceuticals, health, and wellness products, serving hospitals, pharmacies, cooperatives, and supermarkets nationwide since 1987.',
          'With partnerships established with top global pharmaceutical brands, IDS brings a wide range of therapies to the UAE market. IDS provides full-service commercialization support, including regulatory approval, marketing, sales, and logistics, ensuring seamless market access and delivery.',
          'With nationwide distribution coverage, dedicated therapeutic sales teams, automated logistics systems, and business intelligence, IDS is the trusted partner for launching and growing healthcare brands in the UAE.',
        ],
        highlights: [
          '100% hospital coverage and supply to 3,000+ pharmacies, e-commerce platforms, and wholesale channels, with 12–48-hour delivery.',
          'GWP- and GDP-compliant, ISO 9001-certified facility.',
          '7,000-pallet capacity and full cold-chain management.',
        ],
      },
      {
        name: 'Global Medical Supply Chain (GMSC)',
        logo: `${UP}/2026/08/gmsc-logo-1.svg`,
        paragraphs: [
          'Global Medical Supply Chain (GMSC) has rapidly become the trusted partner for healthcare providers across the UAE, ensuring the timely delivery of essential medicines and medical equipment. GMSC offers a full suite of supply chain services, including medical procurement, warehousing, distribution, equipment servicing, and asset management.',
          'By partnering with top global brands, GMSC brings in-demand pharmaceuticals, medical consumables, surgical tools, and diagnostic devices to the UAE market.',
          'With a strong logistics infrastructure, advanced inventory management, and a dedicated team, GMSC delivers seamless, data-driven supply solutions that support hospitals, clinics, and pharmacies nationwide.',
        ],
        highlights: [
          'Strategic supply chain partner to the UAE healthcare system since 2014, serving institutions including the Ministry of Defense and University Hospital Sharjah.',
          'Managing 10,000 active SKUs and 7,000 pallet positions, with exclusive life-saving products.',
          'Delivered 100-bed mobile hospitals and supported overseas humanitarian missions.',
          'Serving 190+ hospitals and clinics across more than 200 storage points in the UAE.',
        ],
      },
    ],
  },
];

/** A press release. `badge` defaults to "Press Release"; `url` (View online) may be empty for admin-added posts. */
export type Article = { id: string; title: string; date: string; image: string; url: string; body: string[]; badge?: string };

export const departments = ['General & Media', 'Business Development', 'Supply Chain', 'Legal', 'Careers'];

export const office = {
  address: '1st Floor, Mubadala Tower, Abu Dhabi, United Arab Emirates',
  mapsUrl: 'https://www.google.com/maps/dir/?api=1&destination=24.463364413104713,54.3882306429075',
};
