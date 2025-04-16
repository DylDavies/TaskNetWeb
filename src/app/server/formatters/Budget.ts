export const formatBudget = (budgetMin?: number, budgetMax?:number) => {
    if(!budgetMin) return "Budget min is NAN";
    if(!budgetMax) return "Budget max is NAN";

    return "R"+budgetMin.toString() + "k - " +"R"+budgetMax.toString()+"k";
};