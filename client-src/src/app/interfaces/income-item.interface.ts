export interface IncomeItem {
    id: number;
    label: string;
    comment: string;
    price: number;
    evaluate: number; // broj ponavljanaj izmedu fromDate i toDate
    fromDate: string;
    toDate: string;
}
