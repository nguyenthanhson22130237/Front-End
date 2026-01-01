export const decodeMessage = (mes: string): string => {
    try {
        return decodeURIComponent(escape(atob(mes)));
    } catch {
        return mes;
    }
};
