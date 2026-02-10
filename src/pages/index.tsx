import type { ReactNode } from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

const SECTIONS = [
  {
    emoji: '🔍',
    title: 'Rotator Worker',
    description: 'Architecture, core logic, data models, modules, services, and UI components of the original Flutter admin app.',
    link: '/docs/rotator-worker/',
  },
  {
    emoji: '📋',
    title: 'Technical Inventory',
    description: 'Complete inventory of screens, widgets, and dependencies from the legacy codebase.',
    link: '/docs/legacy-flutter/technical-inventory',
  },
  {
    emoji: '🏛️',
    title: 'Architecture Analysis',
    description: 'Deep-dive into the legacy architecture, state management, and data flow patterns.',
    link: '/docs/legacy-flutter/architecture-analysis',
  },
  {
    emoji: '🗺️',
    title: 'Migration Plan',
    description: 'The original plan for migrating from Flutter to the modern Next.js platform.',
    link: '/docs/legacy-flutter/original-migration-plan',
  },
];

const SIBLINGS = [
  { label: 'Receptor Technical Docs', href: 'https://docs.commonbond.au/receptor/', emoji: '⚙️' },
  { label: 'Corporate & Governance', href: 'https://docs.commonbond.au/corporate/', emoji: '🏛️' },
];

function HeroSection() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={styles.hero}>
      <div className={styles.heroInner}>
        <div className={styles.archiveBadge}>📦 Archive</div>
        <Heading as="h1" className={styles.heroTitle}>
          {siteConfig.title}
        </Heading>
        <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
        <div className={styles.heroActions}>
          <Link className={styles.heroPrimary} to="/docs/intro">
            Browse Archive
          </Link>
          <Link className={styles.heroSecondary} to="/docs/rotator-worker/">
            🔍 Rotator Worker Docs
          </Link>
        </div>
      </div>
    </header>
  );
}

function SectionCard({ emoji, title, description, link }: typeof SECTIONS[0]) {
  return (
    <Link to={link} className={styles.sectionCard}>
      <span className={styles.cardEmoji}>{emoji}</span>
      <Heading as="h3" className={styles.cardTitle}>{title}</Heading>
      <p className={styles.cardDescription}>{description}</p>
    </Link>
  );
}

export default function Home(): ReactNode {
  return (
    <Layout
      title="Home"
      description="Forensic documentation archive for the legacy Rotator Flutter application.">
      <HeroSection />
      <main className={styles.main}>
        <section className={styles.grid}>
          {SECTIONS.map((section) => (
            <SectionCard key={section.title} {...section} />
          ))}
        </section>

        <section className={styles.siblings}>
          <Heading as="h2" className={styles.siblingsTitle}>Active Documentation Sites</Heading>
          <div className={styles.siblingLinks}>
            {SIBLINGS.map((s) => (
              <a key={s.label} href={s.href} className={styles.siblingCard}>
                <span className={styles.cardEmoji}>{s.emoji}</span>
                <span>{s.label}</span>
              </a>
            ))}
          </div>
        </section>
      </main>
    </Layout>
  );
}
