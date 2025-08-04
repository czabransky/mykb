import {useEffect, useState} from 'react';

type Phrases = Record<string, any[]>;

const usePhrases = (day: number | number[]) => {
    const [phrases, setPhrases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/mykb/data/phrases.json')
            .then(res => res.json())
            .then((data: Phrases) => {
                const days = Array.isArray(day) ? day : [day];
                const filtered = days
                    .map(d => data[`day${d}`] || [])
                    .flat();
                setPhrases(filtered);
                setLoading(false);
            });
    }, [day]);

    return {phrases, loading};
};

export default usePhrases;
