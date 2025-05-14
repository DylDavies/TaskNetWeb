import UserData from "@/app/interfaces/UserData.interface";

//This function takes in the user data and the new rating for the users performance and returns true if the new value is an outlier and false if it is not
const isRatingOutlier = (data: Partial<UserData>, newRating: number): boolean => {
    const ratings = data.ratings || [];
    
    // Need at least 5 ratings to reliably detect outliers
    if (ratings.length < 5) {
        return false;
    }
    
    const sortedRatings = [...ratings].sort((a, b) => a - b);
    const mid = Math.floor(sortedRatings.length / 2);
    
    const q1 = getMedian(sortedRatings.slice(0, mid));
    const q3 = getMedian(sortedRatings.slice(-mid));
    const iqr = q3 - q1;
    
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return newRating < lowerBound || newRating > upperBound;
};

// Helper function moved outside for clarity
const getMedian = (arr: number[]): number => {
    if (arr.length === 0) return 0;
    const mid = Math.floor(arr.length / 2);
    return arr.length % 2 === 0 ? (arr[mid - 1] + arr[mid]) / 2 : arr[mid];
};

const newRatingCalculation = (data: Partial<UserData>, newRating: number): number => {
    const currentRating = data.ratingAverage ?? 0;
    const numRatings = data.ratingCount ?? 0;
    const weight = 0.7; // Adjusted to be less severe
    
    // Handle first rating case
    if (numRatings === 0) {
        return newRating;
    }
    
    // Handle normal rating
    if (!isRatingOutlier(data, newRating)) {
        return ((currentRating * numRatings) + newRating) / (numRatings + 1);
    }
    
    // Handle outlier with weighted adjustment
    return ((currentRating * numRatings) + (weight * newRating)) / (numRatings + weight);
};
export {newRatingCalculation}
   
