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
                'french/grammar/nouns',
                'french/grammar/articles',
                'french/grammar/adjectives',
            ],
        },
    ],
    chineseSidebar: [
        {
            type: 'category',
            label: 'Journey to Chinese',
            collapsible: false,
            collapsed: false,
            items: [
                'chinese/day1',
                'chinese/day2'
            ],
        },
    ]
};

export default sidebars;
