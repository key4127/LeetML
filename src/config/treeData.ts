export const TREE_ITEMS = {
    attention: [
        {
            label: 'attention',
            children: [
                {
                    label: 'MHA',
                    command: 'leetml.openDocument',
                    title: 'MHA1'
                },
                {
                    label: 'GQA',
                    command: 'leetml.openDocument',
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
                    command: 'leetml.openDocument',
                    title: 'BCE1'
                },
                {
                    label: 'CE',
                    command: 'leetml.openDocument',
                    title: 'CE1'
                }
            ],
            collapsibleState: 'Collapsed'
        }
    ]
}