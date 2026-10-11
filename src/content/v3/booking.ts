import type { Lang } from './types';

/*
 * Booking copy, English and Arabic. Placeholders: {n} is the call length in
 * minutes (the CRM's studio rule), {host} the person taking the call, {when}
 * a formatted date and time. Fill them with `fill()`.
 */
export interface BookingCopy {
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  /** Heading when the call length is known. */
  title: readonly [string, string, string?];
  /** Heading when it is not (the CRM did not answer before the page rendered). */
  titleNoLength: readonly [string, string, string?];
  lead: string;
  securityLead: string;
  pointLength: string;
  pointNoLength: string;
  points: readonly string[];
  withHost: string;
  steps: { day: string; time: string; details: string };
  tzLabel: string;
  tzChange: string;
  loading: string;
  loadError: string;
  retry: string;
  paused: string;
  noSlots: string;
  noSlotsDay: string;
  prevWeek: string;
  nextWeek: string;
  back: string;
  selected: string;
  chooseOne: string;
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
  /** `unconfirmed`: the booking system's answer did not arrive or could not be read; the time may be booked. */
  errors: { taken: string; invalid: string; rate: string; limit: string; server: string; network: string; paused: string; unconfirmed: string };
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
    ask: string;
    /** The optional reason box: its label, the line under it, the character count ({n} used). */
    reasonLabel: string;
    reasonHint: string;
    reasonCount: string;
    reasonTooLong: string;
    /** The quiet way out: back to the site with the booking kept. */
    keep: string;
    button: string;
    working: string;
    doneTitle: string;
    doneBody: string;
    doneBodyNoTime: string;
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
    metaDescription: 'Pick a time for a free video briefing with Itqan about AI in manufacturing, retail or food and beverage.',
    kicker: 'Executive briefing',
    // U+2011 non-breaking hyphen keeps "30-minute" on one line in the large heading.
    title: ['Pick a time for your ', '{n}‑minute briefing.'],
    titleNoLength: ['Pick a time for your ', 'briefing.'],
    lead: 'A video call with Ibrahim or Bisma, the founders. We ask where the hours go in your operation and tell you plainly whether an agent would help.',
    securityLead: 'Tell us it is for a security review and we will bring the architecture, the data-flow diagram, the data processing agreement and our list of controls.',
    pointLength: 'Free, {n} minutes, on video',
    pointNoLength: 'Free, on video',
    points: ['English, Arabic or Swedish', 'Times shown in your time zone'],
    withHost: 'Your call is with {host}.',
    steps: { day: '1. Pick a day', time: '2. Pick a time', details: '3. Your details' },
    tzLabel: 'Times in',
    tzChange: 'Change time zone',
    loading: 'Loading free times…',
    loadError: 'We could not load the free times.',
    retry: 'Try again',
    paused: 'Booking is paused for a moment. Email hello@itqanstudio.com and we will find a time.',
    noSlots: 'There are no free times in the next weeks. Write to hello@itqanstudio.com and we will find one.',
    noSlotsDay: 'No free times on this day.',
    prevWeek: 'Earlier days',
    nextWeek: 'Later days',
    back: 'Change time',
    selected: 'Your time',
    chooseOne: 'Choose one',
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
    privacy:
      'We keep these details in our CRM to hold the call and delete the booking 12 months after it. Your name, email and company are also saved there as a business contact. ',
    privacyLink: 'Privacy policy',
    submit: 'Book the briefing',
    submitting: 'Booking…',
    errors: {
      taken: 'Someone booked that time a moment ago. Pick another one.',
      invalid: 'Check the fields marked above and try again.',
      rate: 'Too many attempts from this connection. Wait ten minutes and try again.',
      limit: 'You already have a briefing booked. To move it, use the cancel link in your confirmation email, then pick a new time.',
      server: 'Something went wrong on our side. Your time is not booked yet. Try again, or write to hello@itqanstudio.com.',
      network: 'The connection dropped. Your time is not booked yet. Try again.',
      paused: 'Booking is paused for a moment. Email hello@itqanstudio.com and we will find a time.',
      unconfirmed:
        'We did not get a clear answer from our booking system, so your briefing may already be booked. Check your email before you try again. If nothing from us has arrived, write to hello@itqanstudio.com and we will confirm your time.',
    },
    done: {
      title: 'Booked.',
      body: 'Your briefing with {host} is on',
      sent: 'We sent the details and a calendar file to',
      calendar: 'Add to calendar (.ics)',
      emailFailed:
        'Your time is held, but our confirmation email did not go out. Save the calendar file below, and write to hello@itqanstudio.com if you need to move or cancel it.',
      home: 'Back to the site',
    },
    cancel: {
      metaTitle: 'Cancel a briefing',
      title: 'Cancel your briefing?',
      ask: 'This cancels the briefing booked with this link and frees the time for someone else.',
      reasonLabel: 'Reason (optional)',
      reasonHint: 'Only the Itqan team sees it.',
      reasonCount: '{n} of 500 characters',
      reasonTooLong: 'Keep the reason to 500 characters.',
      keep: 'Keep my booking',
      button: 'Cancel the briefing',
      working: 'Cancelling…',
      doneTitle: 'Cancelled.',
      doneBody: 'Your briefing on {when} is cancelled and the time is free again.',
      doneBodyNoTime: 'Your briefing is cancelled and the time is free again.',
      already: 'This briefing was already cancelled.',
      past: 'This briefing has already taken place.',
      notFound: 'We could not find this booking, or the link has expired. Reply to your confirmation email and we will cancel it for you.',
      rebook: 'Pick a new time',
    },
    email: {
      subject: 'Your Itqan briefing',
      hello: 'Hello',
      confirmed: 'Your {n}-minute briefing with Itqan is booked.',
      when: 'When',
      with: 'With',
      link: 'Video call',
      linkPending: '{host} will send the video link before the call.',
      prepare: 'If you can, bring one process that eats your team’s hours. That is where we start.',
      cancelLine: 'Need to cancel? Use this link:',
      signoff: '{host}, Itqan',
      cancelSubject: 'Your Itqan briefing is cancelled',
      cancelledByYou: 'You cancelled your briefing on',
      cancelledByUs: 'We had to cancel your briefing on',
      rebook: 'Pick a new time here:',
    },
  },
  ar: {
    metaTitle: 'احجز جلسة تعريفية',
    metaDescription: 'اختر موعداً لجلسة تعريفية مجانية عبر الفيديو مع إتقان عن الذكاء الاصطناعي في التصنيع أو التجزئة أو الأغذية والمشروبات.',
    kicker: 'جلسة تعريفية للإدارة',
    title: ['اختر موعداً لجلسة تعريفية ', 'مدتها {n} دقيقة.'],
    titleNoLength: ['اختر موعداً ', 'لجلستك التعريفية.'],
    lead: 'مكالمة فيديو مع إبراهيم أو بسمة، مؤسسَي إتقان. نسأل أين يذهب الوقت في عملياتكم، ونقول لكم بوضوح إن كان وكيل ذكاء اصطناعي سيساعد.',
    securityLead: 'أخبرنا أنها لمراجعة الأمان، وسنحضر البنية ومخطط تدفق البيانات واتفاقية معالجة البيانات وقائمة ضوابطنا.',
    pointLength: 'مجانية، {n} دقيقة، عبر الفيديو',
    pointNoLength: 'مجانية، عبر الفيديو',
    points: ['بالعربية أو الإنجليزية أو السويدية', 'المواعيد بتوقيتك'],
    withHost: 'مكالمتك مع {host}.',
    steps: { day: '1. اختر اليوم', time: '2. اختر الوقت', details: '3. بياناتك' },
    tzLabel: 'المواعيد بتوقيت',
    tzChange: 'تغيير المنطقة الزمنية',
    loading: 'جارٍ تحميل المواعيد المتاحة…',
    loadError: 'تعذّر تحميل المواعيد المتاحة.',
    retry: 'حاول مجدداً',
    paused: 'الحجز متوقف مؤقتاً. راسلنا على hello@itqanstudio.com وسنجد لك موعداً.',
    noSlots: 'لا مواعيد متاحة في الأسابيع القادمة. راسلنا على hello@itqanstudio.com وسنجد موعداً.',
    noSlotsDay: 'لا مواعيد متاحة في هذا اليوم.',
    prevWeek: 'أيام سابقة',
    nextWeek: 'أيام لاحقة',
    back: 'تغيير الوقت',
    selected: 'موعدك',
    chooseOne: 'اختر',
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
    privacy:
      'نحفظ هذه البيانات في نظام إدارة العملاء لدينا لعقد المكالمة، ونحذف الحجز بعد 12 شهراً منها. ويُحفظ اسمك وبريدك واسم شركتك فيه أيضاً جهةَ اتصال تجارية. ',
    privacyLink: 'سياسة الخصوصية (بالإنجليزية)',
    submit: 'احجز الجلسة',
    submitting: 'جارٍ الحجز…',
    errors: {
      taken: 'حجز أحدهم هذا الموعد قبل لحظات. اختر موعداً آخر.',
      invalid: 'راجع الحقول المشار إليها أعلاه ثم حاول مجدداً.',
      rate: 'محاولات كثيرة من هذا الاتصال. انتظر عشر دقائق ثم حاول مجدداً.',
      limit: 'لديك جلسة محجوزة بالفعل. لتغيير موعدها، استخدم رابط الإلغاء في رسالة التأكيد ثم اختر موعداً جديداً.',
      server: 'حدث خطأ لدينا ولم يُحجز موعدك بعد. حاول مجدداً أو راسلنا على hello@itqanstudio.com.',
      network: 'انقطع الاتصال ولم يُحجز موعدك بعد. حاول مجدداً.',
      paused: 'الحجز متوقف مؤقتاً. راسلنا على hello@itqanstudio.com وسنجد لك موعداً.',
      unconfirmed:
        'لم يصلنا رد واضح من نظام الحجز، لذا قد تكون جلستك محجوزة بالفعل. تحقّق من بريدك قبل أن تحاول مجدداً، وإن لم تصلك رسالة منا فراسلنا على hello@itqanstudio.com وسنؤكد لك الموعد.',
    },
    done: {
      title: 'تم الحجز.',
      body: 'جلستك التعريفية مع {host} في',
      sent: 'أرسلنا التفاصيل وملف التقويم إلى',
      calendar: 'أضف إلى التقويم (.ics)',
      emailFailed:
        'موعدك محجوز، لكن رسالة التأكيد لم تُرسل. احفظ ملف التقويم أدناه، وراسلنا على hello@itqanstudio.com إن احتجت إلى تغيير الموعد أو إلغائه.',
      home: 'العودة إلى الموقع',
    },
    cancel: {
      metaTitle: 'إلغاء جلسة تعريفية',
      title: 'هل تريد إلغاء جلستك التعريفية؟',
      ask: 'يلغي هذا الجلسة المحجوزة بهذا الرابط، ويصبح موعدها متاحاً لغيرك.',
      reasonLabel: 'سبب الإلغاء (اختياري)',
      reasonHint: 'لا يطّلع عليه إلا فريق إتقان.',
      reasonCount: '{n} من 500 حرف',
      reasonTooLong: 'يجب ألا يتجاوز السبب 500 حرف.',
      keep: 'احتفظ بحجزي',
      button: 'ألغِ الجلسة',
      working: 'جارٍ الإلغاء…',
      doneTitle: 'تم الإلغاء.',
      doneBody: 'أُلغيت جلستك التعريفية في {when}، وأصبح الموعد متاحاً من جديد.',
      doneBodyNoTime: 'أُلغيت جلستك وأصبح الموعد متاحاً من جديد.',
      already: 'أُلغيت هذه الجلسة من قبل.',
      past: 'انعقدت هذه الجلسة بالفعل.',
      notFound: 'لم نجد هذا الحجز، أو انتهت صلاحية الرابط. ردّ على رسالة التأكيد وسنلغيه لك.',
      rebook: 'اختر موعداً جديداً',
    },
    email: {
      subject: 'جلستك التعريفية مع إتقان',
      hello: 'مرحباً',
      confirmed: 'تم حجز جلستك التعريفية مع إتقان، ومدتها {n} دقيقة.',
      when: 'الموعد',
      with: 'مع',
      link: 'مكالمة الفيديو',
      linkPending: 'يصلك رابط الفيديو من {host} قبل المكالمة.',
      prepare: 'إن أمكن، أحضر معك عملية واحدة تستهلك ساعات فريقك. من هناك نبدأ.',
      cancelLine: 'تحتاج إلى الإلغاء؟ استخدم هذا الرابط:',
      signoff: '{host}، إتقان',
      cancelSubject: 'أُلغيت جلستك التعريفية مع إتقان',
      cancelledByYou: 'ألغيت جلستك التعريفية في',
      cancelledByUs: 'اضطررنا إلى إلغاء جلستك التعريفية في',
      rebook: 'اختر موعداً جديداً من هنا:',
    },
  },
};

export { fill, formatWhen, localHostName, splitAt } from './booking-format';
