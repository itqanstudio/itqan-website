import Link from 'next/link';
import type { Lang } from '@/content/v3/types';
import { Symbol } from './brand';

const COPY = {
  en: { title: 'This page does not exist.', body: 'The site changed in October 2026. Most old pages now live on the home page.', home: 'Go to the home page', book: 'Book a briefing' },
  ar: { title: 'هذه الصفحة غير موجودة.', body: 'تغيّر الموقع في أكتوبر 2026، ومعظم الصفحات القديمة صارت أقساماً في الصفحة الرئيسية.', home: 'إلى الصفحة الرئيسية', book: 'احجز جلسة تعريفية' },
} as const;

export function NotFound({ lang }: { lang: Lang }) {
  const t = COPY[lang];
  const prefix = lang === 'en' ? '' : '/ar';
  return (
    <section className="nf">
      <div className="wrap">
        <span className="sym">
          <Symbol gid={`nf-sym-${lang}`} />
        </span>
        <p className="k">
          <b>404</b>
        </p>
        <h1>{t.title}</h1>
        <p className="lead">{t.body}</p>
        <div className="btns">
          <Link className="btn pri" href={prefix || '/'}>
            {t.home}
          </Link>
          <Link className="btn" href={`${prefix}/book`}>
            {t.book}
          </Link>
        </div>
      </div>
    </section>
  );
}
