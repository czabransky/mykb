---
title: Nominal Predicates (名词谓语)
---

import ComparisonBox from '@site/src/components/core/comparison-box';
import PatternBox from '@site/src/components/core/pattern-box';
import CardGrid from '@site/src/components/core/card-grid';
import Card from '@site/src/components/core/card';
import styles from '@site/src/components/core/comparison-box.module.css';

# Nominal Predicates

## Definition

A **nominal predicate** identifies or describes a subject using a noun or adjective **without** a copula verb like "is" or "are."

The **copula** (是 shì in Chinese, "is/are/am" in English) is a linking verb that connects the subject to its predicate.

<PatternBox
    title="English Pattern"
    pattern={[
        { part: 'Subject', label: 'Today' },
        { part: 'Copula', label: 'is' },
        { part: 'Predicate', label: 'Monday' }
    ]}
/>

---

## How Chinese Differs

Chinese often **omits** the copula 是 (shì) where English requires it, creating more natural expressions.

<ComparisonBox
    left={{
        label: 'Omit 是 (More Common)',
        accent: 'natural',
        content: (
            <div>
              <ul className={styles.comparisonList}>
                  <li>Dates and time expressions</li>
                  <li>Weather and temperature</li>
                  <li>Casual conversation</li>
              </ul>
            </div>
        )
    }}
    right={{
        label: 'Include 是 (When Needed)',
        accent: 'emphatic',
        content: (
            <div>
              <ul className={styles.comparisonList}>
                  <li>Identity statements</li>
                  <li>Emphasis required</li>
                  <li>Formal writing</li>
              </ul>
            </div>
        )
    }}
/>

### Dates and Time

<ComparisonBox
    left={{
        label: 'Natural (Without 是)',
        accent: 'natural',
        content: (
            <div>
                <div className={styles.comparisonChinese}>今天十二月二十二号</div>
                <div className={styles.comparisonEnglish}>Today December 22nd</div>
                <div className={styles.comparisonPinyin}>jīntiān shí'èr yuè èrshí'èr hào</div>
            </div>
        )
    }}
    right={{
        label: 'Emphatic (With 是)',
        accent: 'emphatic',
        content: (
            <div>
                <div className={styles.comparisonChinese}>今天是十二月二十二号</div>
                <div className={styles.comparisonEnglish}>Today <strong>IS</strong> December 22nd</div>
                <div className={styles.comparisonPinyin}>jīntiān shì shí'èr yuè èrshí'èr hào</div>
            </div>
        )
    }}
/>

---

## Examples

| Chinese | Pinyin | English | Pattern |
|---------|--------|---------|---------|
| 今天星期一 | jīntiān xīngqī yī | Today (is) Monday | Natural without 是 |
| 今天很热 | jīntiān hěn rè | Today (is) very hot | Adjective predicate |
| 现在三点 | xiànzài sān diǎn | Now (is) 3 o'clock | Time expression |
| 他是学生 | tā shì xuésheng | He is a student | Identity needs 是 |