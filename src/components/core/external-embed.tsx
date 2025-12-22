import React from 'react';

interface ExternalEmbedProps {
    url: string;
    height?: string;
    title?: string;
}

const ExternalEmbed: React.FC<ExternalEmbedProps> = ({
    url,
    height = '500px',
    title = 'External Content'
}) => {
    return (
        <div style={{
            width: '100%',
            height: height,
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            overflow: 'hidden'
        }}>
            <iframe
                src={url}
                title={title}
                style={{
                    width: '100%',
                    height: '100%',
                    border: 'none'
                }}
                sandbox="allow-scripts allow-same-origin"
                loading="lazy"
            />
        </div>
    );
};

export default ExternalEmbed;
