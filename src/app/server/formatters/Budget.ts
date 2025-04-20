export const formatBudget = (budgetMin?: number, budgetMax?:number) => {
    if(budgetMin == undefined) return "Budget min is NAN";
    if(budgetMax == undefined) return "Budget max is NAN";

    return "R"+budgetMin.toString() + "k - " +"R"+budgetMax.toString()+"k";
};