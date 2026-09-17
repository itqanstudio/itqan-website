export interface Testimonial {
  quote: string;
  name: string;
  company: string;
  image?: string;
}

export const testimonials: Testimonial[] = [
  {
    quote:
      'Itqan transformed our complex systems into clean, intuitive designs that finally make sense. Fast, clear and genuinely impressive work.',
    name: 'Adel Habib',
    company: 'Medacs & ShadowFly',
    image: '/images/testimonials/adel-habib.jpeg',
  },
  {
    quote:
      'Itqan brought fresh ideas, flawless execution and real ownership to every task. The improvements to our user experience were immediate.',
    name: 'Abderisak Adam',
    company: 'Avidnote',
    image: '/images/testimonials/abderisak-adam.jpeg',
  },
  {
    quote:
      'Itqan rebuilt our entire product design with speed and precision. The result is functional, beautiful and perfectly aligned with our goals.',
    name: 'Abdi Mohamud',
    company: 'Nexilink',
    image: '/images/testimonials/abdi-mohamud.jpeg',
  },
];
