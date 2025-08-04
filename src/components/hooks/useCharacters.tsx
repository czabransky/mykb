import {useEffect, useState} from 'react';

type Characters = Record<string, any[]>;

const useCharacters = (day: number | number[]) => {
    const [characters, setCharacters] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/mykb/data/characters.json')
            .then(res => res.json())
            .then((data: Characters) => {
                const days = Array.isArray(day) ? day : [day];
                const filtered = days
                    .map(d => data[`day${d}`] || [])
                    .flat();
                setCharacters(filtered);
                setLoading(false);
            });
    }, [day]);

    return {characters, loading};
};

export default useCharacters;