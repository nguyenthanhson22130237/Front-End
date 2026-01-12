export interface ChatHistoryItem {
    name: string;
    type: 0 | 1;
    actionTime?: string;
}

export interface Message {
    id?: number;
    name: string;
    to?: string;
    type?: number;
    mes: string;
    createAt?: string;
}

