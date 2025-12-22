import type { ReactNode } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  emoji: string;
  description: ReactNode;
  link?: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Daily Practice',
    emoji: '📝',
    description: (
      <>
        Track your Chinese learning journey with daily diary entries,
        building vocabulary and grammar skills one day at a time.
      </>
    ),
    link: '/docs/chinese/Logs/2025-12-22',
  },
  {
    title: 'Interactive Lessons',
    emoji: '🎓',
    description: (
      <>
        Engage with interactive flashcards and audio pronunciation.
        Learn characters, phrases, and essential grammar concepts.
      </>
    ),
  },
  {
    title: 'Grammar Concepts',
    emoji: '📚',
    description: (
      <>
        Deep dive into Chinese grammar with visual explanations and
        real-world examples. Master the fundamentals step by step.
      </>
    ),
    link: '/docs/chinese/Concepts/nominal-predicates',
  },
];

function Feature({ title, emoji, description, link }: FeatureItem) {
  const content = (
    <>
      <div className={styles.featureEmoji}>{emoji}</div>
      <div className={styles.featureContent}>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </>
  );

  if (link) {
    return (
      <Link to={link} className={clsx(styles.featureCard, styles.featureCardLink)}>
        {content}
      </Link>
    );
  }

  return (
    <div className={styles.featureCard}>
      {content}
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className={styles.container}>
        <Heading as="h2" className={styles.sectionTitle}>
          Start Your Chinese Learning Journey
        </Heading>
        <div className={styles.featureGrid}>
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
