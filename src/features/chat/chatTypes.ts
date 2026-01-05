export interface ChatHistoryItem {
    name: string;     // tên user hoặc room
    type: 0 | 1;      // 0 = people, 1 = room
    actionTime?: string;
}

export interface Message {
    id?: number;
    name: string;
    to?: string;
    type?: number;
    mes: string;
    // createdAt?: number | string;
    createAt?: string;
    createdAt?: number;
}

