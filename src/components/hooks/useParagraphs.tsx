import { useEffect, useState } from 'react';

type Paragraphs = Record<string, any[]>;

export interface Paragraph {
    chinese: string;
    pinyin: string;
    english: string;
    notes?: string;
    concept?: {
        label: string;
        link: string;
    };
}

const useParagraphs = (key: string | string[]) => {
    const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/mykb/data/paragraphs.json')
            .then(res => res.json())
            .then((data: Paragraphs) => {
                const keys = Array.isArray(key) ? key : [key];
                const filtered = keys
                    .map(k => data[`${k}`] || [])
                    .flat();
                setParagraphs(filtered);
                setLoading(false);
            });
    }, [key]);

    return { paragraphs, loading };
};

export default useParagraphs;
