export interface User{
    user: string;
}

export interface Room{
    name: string;
}

export interface Message {
    from: string;
    mes: string;
    time?: string;
}
