export const formatBudget = (budgetMin?: number, budgetMax?:number) => {
    if(!budgetMin) return "Budget min is NAN";
    if(!budgetMax) return "Budget max is NAN";
    
    if(budgetMin >= 10000 && budgetMax >= 10000){
        budgetMin = budgetMin/1000;
        budgetMax = budgetMax/ 1000;
        return "R"+budgetMin.toString() + "k - " +"R"+budgetMax.toString()+"k";
    }

    return "R"+budgetMin.toString() + " - " +"R"+budgetMax.toString();
};