import React from 'react';
import styles from './rule-checklist.module.css';

interface RuleItem {
    rule: string;
    why?: string;
    right?: string;
    wrong?: string;
}

interface RuleChecklistProps {
    title: string;
    rules: RuleItem[];
}

export default function RuleChecklist({ title, rules }: RuleChecklistProps) {
    return (
        <section className={styles.container}>
            <h3 className={styles.title}>{title}</h3>
            <div className={styles.list}>
                {rules.map((item, index) => (
                    <article key={index} className={styles.ruleCard}>
                        <div className={styles.ruleHeading}>Rule {index + 1}</div>
                        <div className={styles.ruleText}>{item.rule}</div>
                        {item.why && <div className={styles.why}>{item.why}</div>}
                        {(item.right || item.wrong) && (
                            <div className={styles.examples}>
                                {item.right && (
                                    <div className={styles.rightExample}>
                                        <strong>Use:</strong> {item.right}
                                    </div>
                                )}
                                {item.wrong && (
                                    <div className={styles.wrongExample}>
                                        <strong>Avoid:</strong> {item.wrong}
                                    </div>
                                )}
                            </div>
                        )}
                    </article>
                ))}
            </div>
        </section>
    );
}
