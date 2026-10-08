import type { Metadata } from 'next';
import { MOTION_TOKENS } from '@/data/brand-spec';
import { Callout, PortalPageBody, RuleGrid, Section, SpecTable } from '@/components/brand/primitives';

export const metadata: Metadata = {
  title: 'Motion',
  description: 'How Itqan Studio moves: under 400ms, settle rather than bounce, interruptible throughout.',
};

export default function MotionPage() {
  return (
    <PortalPageBody href="/brand/motion"
      heroImage="/images/portfolio/project-you/cover.webp"
    >
      <Section>
        <p className="text-[1.0625rem] leading-relaxed text-[var(--color-text-secondary)]">
          Motion explains where something came from and where it went. Nothing
          here runs longer than 400ms, and nothing bounces — overshoot reads as
          playful, and this brand is composed.
        </p>
      </Section>

      <Section title="Tokens">
        <SpecTable
          columns={['Role', 'Value', 'Notes']}
          rows={MOTION_TOKENS.map(([role, value, token]) => [role, value, token])}
        />
      </Section>

      <Section
        title="The two easings"
        intro="Enter settles like a physical object coming to rest. Hover is sharper, because a pointer response that takes 400ms feels broken."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { name: 'Enter', ease: 'cubic-bezier(0.22, 1, 0.36, 1)', ms: 400 },
            { name: 'Hover', ease: 'cubic-bezier(0.32, 0.72, 0, 1)', ms: 200 },
          ].map((e) => (
            <div key={e.name} className="rounded-xl border border-[var(--color-border)] p-5">
              <p className="text-[0.9375rem] font-medium">{e.name}</p>
              <code className="mt-1 block font-[family-name:var(--font-mono)] text-[0.6875rem] text-[var(--color-muted)]">
                {e.ease}
              </code>
              <div
                className="mt-4 h-1 w-full overflow-hidden rounded-full"
                style={{ backgroundColor: 'rgba(255,251,245,0.10)' }}
              >
                <span
                  className="block h-full rounded-full bg-[var(--color-accent)] motion-safe:animate-[brand-sweep_2.4s_infinite]"
                  style={{
                    width: '34%',
                    animationTimingFunction: e.ease,
                    animationDuration: `${e.ms * 4}ms`,
                  }}
                />
              </div>
              <p className="mt-3 text-[0.8125rem] text-[var(--color-text-secondary)]">{e.ms}ms</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="The catalogue">
        <SpecTable
          columns={['Interaction', 'Behaviour', 'Duration']}
          rows={[
            ['Page enter', 'Subtle fade in', '400ms'],
            ['Scroll reveal', 'Slide up with opacity, staggered', '400ms, 60ms stagger'],
            ['Card hover', 'scale(1.02)', '200ms'],
            ['Button hover', 'Colour transition only', '200ms'],
            ['Press', 'Responds on pointer-down, not on click', 'immediate'],
            ['Scroll', 'Smooth behaviour, never hijacked', 'native'],
          ]}
        />
      </Section>

      <Callout tone="warning" title="Interruptible, always">
        Every animation starts from the value currently on screen and can be
        reversed mid-flight. Nothing waits for a transition to finish before it
        will accept input.
      </Callout>

      <Section title="Reduced motion">
        <p className="mb-6 text-[0.9375rem] leading-relaxed text-[var(--color-text-secondary)]">
          Under{' '}
          <code className="font-[family-name:var(--font-mono)] text-[0.8125rem]">
            prefers-reduced-motion: reduce
          </code>{' '}
          the site removes movement through space and keeps only opacity.
          Autoplaying video does not start. This is honoured everywhere,
          including the portal you are reading.
        </p>
        <RuleGrid
          rules={[
            { kind: 'do', text: 'Animate opacity and transform only. Both are compositor-friendly.' },
            { kind: 'do', text: 'Keep hover and press feedback under 200ms.' },
            { kind: 'do', text: 'Start from the current value, not from a hardcoded origin.' },
            { kind: 'do', text: 'Keep every animation under 400ms — elegant, not flashy.' },
            { kind: 'dont', text: 'Do not animate width, height, top or left. They force layout.' },
            { kind: 'dont', text: 'Do not bounce or overshoot.' },
            { kind: 'dont', text: 'Do not hijack scrolling.' },
            { kind: 'dont', text: 'Do not block interaction while something is animating.' },
          ]}
        />
      </Section>
    </PortalPageBody>
  );
}
