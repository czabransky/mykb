import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
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
