import type { Lang } from './types';

export interface BookingCopy {
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  title: readonly [string, string, string?];
  lead: string;
  securityLead: string;
  points: readonly string[];
  steps: { day: string; time: string; details: string };
  tzLabel: string;
  tzChange: string;
  loading: string;
  loadError: string;
  retry: string;
  noSlots: string;
  noSlotsDay: string;
  prevWeek: string;
  nextWeek: string;
  back: string;
  selected: string;
  fields: {
    name: string;
    email: string;
    emailHint: string;
    company: string;
    role: string;
    industry: string;
    message: string;
    messageHint: string;
    optional: string;
  };
  industries: Record<'manufacturing' | 'retail' | 'fnb' | 'other', string>;
  privacy: string;
  privacyLink: string;
  submit: string;
  submitting: string;
  errors: { taken: string; invalid: string; rate: string; limit: string; server: string; network: string };
  done: {
    title: string;
    body: string;
    sent: string;
    calendar: string;
    emailFailed: string;
    home: string;
  };
  cancel: {
    metaTitle: string;
    title: string;
    body: string;
    button: string;
    working: string;
    doneTitle: string;
    doneBody: string;
    already: string;
    past: string;
    notFound: string;
    rebook: string;
  };
  email: {
    subject: string;
    hello: string;
    confirmed: string;
    when: string;
    with: string;
    link: string;
    linkPending: string;
    prepare: string;
    cancelLine: string;
    signoff: string;
    cancelSubject: string;
    cancelledByYou: string;
    cancelledByUs: string;
    rebook: string;
  };
}

export const bookingCopy: Record<Lang, BookingCopy> = {
  en: {
    metaTitle: 'Book a briefing',
    metaDescription: 'Pick a time for a free 30-minute briefing with Itqan about AI in manufacturing, retail or food and beverage.',
    kicker: 'Executive briefing',
    // U+2011 non-breaking hyphen keeps "30-minute" on one line in the large heading.
    title: ['Pick a time for your ', '30‑minute briefing.'],
    lead: 'A video call with Ibrahim Shareef, our founder. We ask where the hours go in your operation and tell you plainly whether an agent would help.',
    securityLead: 'Tell us it is for a security review and we will bring the architecture, the data-flow diagram, the data processing agreement and our list of controls.',
    points: ['Free, 30 minutes, on video', 'English, Arabic or Swedish', 'Times shown in your time zone'],
    steps: { day: '1. Pick a day', time: '2. Pick a time', details: '3. Your details' },
    tzLabel: 'Times in',
    tzChange: 'Change time zone',
    loading: 'Loading free times…',
    loadError: 'We could not load the free times.',
    retry: 'Try again',
    noSlots: 'There are no free times in the next weeks. Write to ibrahim@itqanstudio.com and we will find one.',
    noSlotsDay: 'No free times on this day.',
    prevWeek: 'Earlier days',
    nextWeek: 'Later days',
    back: 'Change time',
    selected: 'Your time',
    fields: {
      name: 'Your name',
      email: 'Work email',
      emailHint: 'We send the confirmation here.',
      company: 'Company',
      role: 'Your role',
      industry: 'Industry',
      message: 'What should an agent take off your team first?',
      messageHint: 'One or two sentences is plenty.',
      optional: 'optional',
    },
    industries: { manufacturing: 'Manufacturing', retail: 'Retail', fnb: 'Food and beverage', other: 'Something else' },
    privacy: 'We use these details to hold the call and delete them 12 months after it. ',
    privacyLink: 'Privacy policy',
    submit: 'Book the briefing',
    submitting: 'Booking…',
    errors: {
      taken: 'Someone booked that time a moment ago. Pick another one.',
      invalid: 'Check the fields marked above and try again.',
      rate: 'Too many attempts from this connection. Wait ten minutes and try again.',
      limit: 'You already have a briefing booked. To move it, use the cancel link in your confirmation email, then pick a new time.',
      server: 'Something went wrong on our side. Your time is not booked yet. Try again, or write to ibrahim@itqanstudio.com.',
      network: 'The connection dropped. Your time is not booked yet. Try again.',
    },
    done: {
      title: 'Booked.',
      body: 'Your briefing is on',
      sent: 'We sent the details and a calendar file to',
      calendar: 'Add to calendar (.ics)',
      emailFailed:
        'Your time is held, but our confirmation email did not go out. Save the calendar file below, and write to ibrahim@itqanstudio.com if you need to move or cancel it.',
      home: 'Back to the site',
    },
    cancel: {
      metaTitle: 'Cancel a briefing',
      title: 'Cancel your briefing?',
      body: 'Your briefing is on',
      button: 'Cancel the briefing',
      working: 'Cancelling…',
      doneTitle: 'Cancelled.',
      doneBody: 'Your briefing is cancelled and the time is free again.',
      already: 'This briefing was already cancelled.',
      past: 'This briefing has already taken place.',
      notFound: 'We could not find this booking. The link may be old.',
      rebook: 'Pick a new time',
    },
    email: {
      subject: 'Your Itqan briefing',
      hello: 'Hello',
      confirmed: 'Your 30-minute briefing with Itqan is booked.',
      when: 'When',
      with: 'With',
      link: 'Video call',
      linkPending: 'Ibrahim will send the video link before the call.',
      prepare: 'If you can, bring one process that eats your team’s hours. That is where we start.',
      cancelLine: 'Need to cancel? Use this link:',
      signoff: 'Ibrahim Shareef, Itqan',
      cancelSubject: 'Your Itqan briefing is cancelled',
      cancelledByYou: 'You cancelled your briefing on',
      cancelledByUs: 'We had to cancel your briefing on',
      rebook: 'Pick a new time here:',
    },
  },
  ar: {
    metaTitle: 'احجز جلسة تعريفية',
    metaDescription: 'اختر موعداً لجلسة تعريفية مجانية مدتها 30 دقيقة مع إتقان عن الذكاء الاصطناعي في التصنيع أو التجزئة أو الأغذية والمشروبات.',
    kicker: 'جلسة تعريفية للإدارة',
    title: ['اختر موعداً لجلسة تعريفية ', 'مدتها 30 دقيقة.'],
    lead: 'مكالمة فيديو مع إبراهيم شريف، مؤسس إتقان. نسأل أين يذهب الوقت في عملياتكم، ونقول لكم بوضوح إن كان وكيل ذكاء اصطناعي سيساعد.',
    securityLead: 'أخبرنا أنها لمراجعة الأمان، وسنحضر البنية ومخطط تدفق البيانات واتفاقية معالجة البيانات وقائمة ضوابطنا.',
    points: ['مجانية، 30 دقيقة، عبر الفيديو', 'بالعربية أو الإنجليزية أو السويدية', 'المواعيد بتوقيتك'],
    steps: { day: '1. اختر اليوم', time: '2. اختر الوقت', details: '3. بياناتك' },
    tzLabel: 'المواعيد بتوقيت',
    tzChange: 'تغيير المنطقة الزمنية',
    loading: 'جارٍ تحميل المواعيد المتاحة…',
    loadError: 'تعذّر تحميل المواعيد المتاحة.',
    retry: 'حاول مجدداً',
    noSlots: 'لا مواعيد متاحة في الأسابيع القادمة. راسلنا على ibrahim@itqanstudio.com وسنجد موعداً.',
    noSlotsDay: 'لا مواعيد متاحة في هذا اليوم.',
    prevWeek: 'أيام سابقة',
    nextWeek: 'أيام لاحقة',
    back: 'تغيير الوقت',
    selected: 'موعدك',
    fields: {
      name: 'اسمك',
      email: 'بريد العمل',
      emailHint: 'نرسل التأكيد إلى هذا البريد.',
      company: 'الشركة',
      role: 'منصبك',
      industry: 'الصناعة',
      message: 'ما المهمة التي تريد أن يتولاها وكيل عن فريقك أولاً؟',
      messageHint: 'جملة أو جملتان تكفيان.',
      optional: 'اختياري',
    },
    industries: { manufacturing: 'التصنيع', retail: 'التجزئة', fnb: 'الأغذية والمشروبات', other: 'مجال آخر' },
    privacy: 'نستخدم هذه البيانات لعقد المكالمة، ونحذفها بعد 12 شهراً منها. ',
    privacyLink: 'سياسة الخصوصية (بالإنجليزية)',
    submit: 'احجز الجلسة',
    submitting: 'جارٍ الحجز…',
    errors: {
      taken: 'حجز أحدهم هذا الموعد قبل لحظات. اختر موعداً آخر.',
      invalid: 'راجع الحقول المشار إليها أعلاه ثم حاول مجدداً.',
      rate: 'محاولات كثيرة من هذا الاتصال. انتظر عشر دقائق ثم حاول مجدداً.',
      limit: 'لديك جلسة محجوزة بالفعل. لتغيير موعدها، استخدم رابط الإلغاء في رسالة التأكيد ثم اختر موعداً جديداً.',
      server: 'حدث خطأ لدينا ولم يُحجز موعدك بعد. حاول مجدداً أو راسلنا على ibrahim@itqanstudio.com.',
      network: 'انقطع الاتصال ولم يُحجز موعدك بعد. حاول مجدداً.',
    },
    done: {
      title: 'تم الحجز.',
      body: 'جلستك التعريفية في',
      sent: 'أرسلنا التفاصيل وملف التقويم إلى',
      calendar: 'أضف إلى التقويم (.ics)',
      emailFailed:
        'موعدك محجوز، لكن رسالة التأكيد لم تُرسل. احفظ ملف التقويم أدناه، وراسلنا على ibrahim@itqanstudio.com إن احتجت إلى تغيير الموعد أو إلغائه.',
      home: 'العودة إلى الموقع',
    },
    cancel: {
      metaTitle: 'إلغاء جلسة تعريفية',
      title: 'هل تريد إلغاء جلستك التعريفية؟',
      body: 'جلستك التعريفية في',
      button: 'ألغِ الجلسة',
      working: 'جارٍ الإلغاء…',
      doneTitle: 'تم الإلغاء.',
      doneBody: 'أُلغيت جلستك وأصبح الموعد متاحاً من جديد.',
      already: 'أُلغيت هذه الجلسة من قبل.',
      past: 'انعقدت هذه الجلسة بالفعل.',
      notFound: 'لم نجد هذا الحجز. ربما يكون الرابط قديماً.',
      rebook: 'اختر موعداً جديداً',
    },
    email: {
      subject: 'جلستك التعريفية مع إتقان',
      hello: 'مرحباً',
      confirmed: 'تم حجز جلستك التعريفية مع إتقان، ومدتها 30 دقيقة.',
      when: 'الموعد',
      with: 'مع',
      link: 'مكالمة الفيديو',
      linkPending: 'سيرسل إبراهيم رابط الفيديو قبل المكالمة.',
      prepare: 'إن أمكن، أحضر معك عملية واحدة تستهلك ساعات فريقك. من هناك نبدأ.',
      cancelLine: 'تحتاج إلى الإلغاء؟ استخدم هذا الرابط:',
      signoff: 'إبراهيم شريف، إتقان',
      cancelSubject: 'أُلغيت جلستك التعريفية مع إتقان',
      cancelledByYou: 'ألغيت جلستك التعريفية في',
      cancelledByUs: 'اضطررنا إلى إلغاء جلستك التعريفية في',
      rebook: 'اختر موعداً جديداً من هنا:',
    },
  },
};

/** Long date and time of an instant in a zone, in the reader's language. */
export function formatWhen(iso: string, timezone: string, lang: Lang): string {
  const locale = lang === 'en' ? 'en-GB' : 'ar-u-nu-latn';
  const d = new Date(iso);
  const date = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: timezone }).format(d);
  const time = new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: timezone }).format(d);
  return `${date}${lang === 'ar' ? '،' : ','} ${time} (${timezone.replace(/_/g, ' ')})`;
}
