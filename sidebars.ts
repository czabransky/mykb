import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
    foodSidebar: [
        'toronto/restaurants'
    ],
    frenchSidebar: [
        {
            type: 'category',
            label: 'Grammar',
            collapsible: false,
            collapsed: false,
            items: [
                'french/grammar/intro',
                'french/grammar/articles',
                'french/grammar/adjectives',
                'french/grammar/pronouns',
                'french/grammar/verbs',
            ],
        },
    ]
};

export default sidebars;
