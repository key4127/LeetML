interface ClickData {
    treeId: string;
    itemId: string;
    extraData: any
}

export interface EditCodeService {
    editCode: (mainTitle: string, sectionTitle: string, docName?: string) => Promise<void>;
}