// App labels in English and Arabic. Arabic wording comes from mubadalabio.ae/ar wherever the
// site has the same label; entries marked "app-only" are not on the site and were translated for the app.

const en = {
  languageSwitch: 'عربي',
  menu: 'Open menu',
  // Navigation
  home: 'Home',
  whoWeAre: 'Who we are',
  whatWeDo: 'What we do',
  media: 'Media',
  contact: 'Contact',
  contactUs: 'Contact Us',
  aboutMubadalaBio: 'About Mubadala Bio',
  boardOfDirectors: 'Board of Directors',
  leadershipTeam: 'Leadership Team',
  aboutMubadala: 'About Mubadala',
  companies: 'Companies',
  ourLeadership: 'Our Leadership',
  privacyPolicy: 'Privacy Policy',
  // Home
  heroLines: ['Delivering', 'better health,', 'closer for all.'],
  learnMore: 'Learn More',
  exploreMore: 'Explore More',
  videoTitle: 'Accelerating Life Sciences. Unlocking Innovation.',
  watchNow: 'Watch Now',
  impactHighlights: 'Impact Highlights',
  companiesIntro:
    'Mubadala Bio is dedicated to strengthening the life sciences sector in the UAE by enhancing the local supply of essential medications, while also ensuring timely and affordable access to key therapeutics both locally and internationally. We do this through two strategic verticals:',
  mediaIntro: 'Stay informed on Mubadala Bio’s milestones, partnerships, facility expansions, and thought leadership.',
  // About
  purposeTagline: 'Delivering better health, closer for all.',
  ourPurpose: 'Our Purpose',
  ourAspiration: 'Our Aspiration',
  ourValues: 'Our Values',
  // Companies
  companiesSubtitle: 'Strengthening the UAE’s life sciences sector through two strategic verticals.',
  goBack: 'Go back',
  // Leadership
  leadershipSubtitle: 'The people guiding Mubadala Bio’s strategy and growth.',
  readMore: 'Read More',
  // News
  pressRelease: 'Press Release',
  loadMore: 'Load more',
  share: 'Share',
  viewOnline: 'View online',
  // Contact
  contactSubtitle: 'How can we help?',
  name: 'Name*',
  email: 'Email*',
  mobile: 'Mobile',
  department: 'Department*',
  message: 'How can we help?*',
  submit: 'Submit',
  acceptPrefix: 'By submitting, you accept our ',
  officeLocation: 'Office Location',
  getDirections: 'Get directions',
  sentThanks: 'Thank you! Your message has been sent.',
  sendAnother: 'Send another',
  errName: 'Please enter your name',
  errEmail: 'Please enter a valid email',
  errDepartment: 'Please choose a department',
  errMessage: 'Please tell us how we can help',
  notConnectedTitle: 'Contact us',
  notConnectedText: 'Online submission is not connected yet. We’ll open our contact page instead.',
  cancel: 'Cancel',
  open: 'Open',
  errorTitle: 'Something went wrong',
  errorText: 'Please try again in a moment.',
  copyright: (year: number) => `© ${year} MubadalaBio`,
};

export type Strings = typeof en;

const ar: Strings = {
  languageSwitch: 'English',
  menu: 'فتح القائمة', // app-only
  home: 'الرئيسية', // app-only
  whoWeAre: 'من نحن',
  whatWeDo: 'ماذا نفعل',
  media: 'الأخبار',
  contact: 'للتواصل',
  contactUs: 'للتواصل',
  aboutMubadalaBio: 'نبذة حول مبادلة بايو',
  boardOfDirectors: 'مجلس الإدارة',
  leadershipTeam: 'فريق القيادة',
  aboutMubadala: 'حول مبادلة',
  companies: 'الشركات',
  ourLeadership: 'فريقنا',
  privacyPolicy: 'سياسة الخصوصية',
  heroLines: ['توفير حياة صحية', 'أفضل، للجميع.'],
  learnMore: 'تعرّف المزيد',
  exploreMore: 'اعرف المزيد',
  videoTitle: 'تطوير الصناعات الدوائية وتمكين البحث والابتكار',
  watchNow: 'شاهد الآن',
  impactHighlights: 'تأثيرنا',
  companiesIntro:
    'تلتزم مبادلة بايو بتعزيز قطاع الصناعات الدوائية في دولة الإمارات، عبر دعم الاحتياج المحلي للأدوية الأساسية، مع ضمان سهولة الوصول إلى العلاجات الرئيسية في الوقت المناسب وبأسعار معقولة، على الصعيدين المحلي والدولي. وذلك من خلال محورين استراتيجيين',
  mediaIntro:
    'تابع آخر مستجدات مبادلة بايو من إنجازات وشراكات وتوسّع في المنشآت، بالإضافة إلى أحدث المبادرات والأفكار الريادية.',
  purposeTagline: 'توفير حياة صحية أفضل، للجميع.',
  ourPurpose: 'مهمتنا',
  ourAspiration: 'طموحنا',
  ourValues: 'قيمنا',
  companiesSubtitle: 'تعزيز قطاع الصناعات الدوائية في دولة الإمارات من خلال محورين استراتيجيين.', // app-only
  goBack: 'رجوع', // app-only
  leadershipSubtitle: 'الفريق الذي يقود استراتيجية مبادلة بايو ونموها.', // app-only
  readMore: 'اقرأ المزيد',
  pressRelease: 'بيان صحفي', // app-only
  loadMore: 'عرض المزيد', // app-only
  share: 'مشاركة', // app-only
  viewOnline: 'عرض على الموقع', // app-only
  contactSubtitle: 'كيف يمكننا مساعدتك؟',
  name: 'الاسم*',
  email: 'البريد الإلكتروني*',
  mobile: 'رقم الهاتف',
  department: 'الأقسام*',
  message: 'كيف يمكننا مساعدتك؟*',
  submit: 'إرسال', // app-only
  acceptPrefix: 'من خلال الإرسال، فإنك توافق على ',
  officeLocation: 'موقع المكتب',
  getDirections: 'الاتجاهات', // app-only
  sentThanks: 'شكراً لك! تم إرسال رسالتك.', // app-only
  sendAnother: 'إرسال رسالة أخرى', // app-only
  errName: 'يرجى إدخال الاسم', // app-only
  errEmail: 'يرجى إدخال بريد إلكتروني صحيح', // app-only
  errDepartment: 'يرجى اختيار القسم', // app-only
  errMessage: 'يرجى إخبارنا كيف يمكننا مساعدتك', // app-only
  notConnectedTitle: 'للتواصل',
  notConnectedText: 'الإرسال عبر التطبيق غير متاح حالياً. سنفتح صفحة التواصل بدلاً من ذلك.', // app-only
  cancel: 'إلغاء', // app-only
  open: 'فتح', // app-only
  errorTitle: 'حدث خطأ ما', // app-only
  errorText: 'يرجى المحاولة مرة أخرى بعد قليل.', // app-only
  copyright: (year: number) => `© ${year} مبادلة بايو`,
};

export const strings = { en, ar };
