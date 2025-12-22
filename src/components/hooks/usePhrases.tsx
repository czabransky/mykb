import { useEffect, useState } from 'react';

type Phrases = Record<string, any[]>;

const usePhrases = (key: string | string[]) => {
    const [phrases, setPhrases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/mykb/data/phrases.json')
            .then(res => res.json())
            .then((data: Phrases) => {
                const keys = Array.isArray(key) ? key : [key];
                const filtered = keys
                    .map(k => data[`${k}`] || [])
                    .flat();
                setPhrases(filtered);
                setLoading(false);
            });
    }, [key]);

    return { phrases, loading };
};

export default usePhrases;
