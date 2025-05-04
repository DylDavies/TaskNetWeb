export const formatBudget = (budgetMin?: number, budgetMax?: number) => {
    if (budgetMin === undefined) return "Budget min is NAN";
    if (budgetMax === undefined) return "Budget max is NAN";

    const formatValue = (value: number) => {
        return value >= 10000 ? `${value / 1000}k` : `${value}`;
    };

    return `$${formatValue(budgetMin)} - $${formatValue(budgetMax)}`;
};
