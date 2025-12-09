export const TREE_ITEMS = {
    attention: [
        {
            label: 'attention',
            children: [
                {
                    label: 'MHA',
                    command: 'leetml.startPractice',
                    title: 'MHA1'
                },
                {
                    label: 'GQA',
                    command: 'leetml.startPractice',
                    title: 'GQA1'
                }
            ],
            collapsibleState: 'Collapsed'
        }
    ],
    loss: [
        {
            label: 'loss',
            children: [
                {
                    label: 'BCE',
                    command: 'leetml.startPractice',
                    title: 'BCE1'
                },
                {
                    label: 'CE',
                    command: 'leetml.startPractice',
                    title: 'CE1'
                }
            ],
            collapsibleState: 'Collapsed'
        }
    ]
}