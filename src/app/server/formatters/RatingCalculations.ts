import UserData from "@/app/interfaces/UserData.interface";

//This function takes in the user data and the new rating for the users performance and returns true if the new value is an outlier and false if it is not
const isRatingOutlier = (data: Partial<UserData>, newRating: number): boolean =>{
    const ratings = data.ratings;

    if (!ratings || ratings.length < 4) {
        return false;
      }
    
      const ratingsArr = [...ratings].sort((a, b) => a - b);
    
      const getMedian = (arr: number[]): number => {
        const mid = Math.floor(arr.length / 2);
        return arr.length % 2 === 0
          ? (arr[mid - 1] + arr[mid]) / 2
          : arr[mid];
      };
    
      const lowerHalf = ratingsArr.slice(0, Math.floor(ratingsArr.length / 2));
      const upperHalf = ratingsArr.slice(Math.ceil(ratingsArr.length / 2));
    
      const q1 = getMedian(lowerHalf);
      const q3 = getMedian(upperHalf);
      const iqr = q3 - q1;
    
      const lowerBound = q1 - 1.5 * iqr;
      const upperBound = q3 + 1.5 * iqr;
    
      return newRating < lowerBound || newRating > upperBound;
};

//This function takes in the existing user data (the existing rating average) and the new user rating and updates the user rating with the value from the new one weighted according to whether it is an outlier or not
const newRatingCalculation = (data: Partial<UserData>,newRating: number): number =>{
    
    const currentRating = data.ratingAverage ?? 0;
    const numRatings = data.ratingCount ?? 0;
    const weight = 0.5;
    let newAveRating = 0;
    
    if(!isRatingOutlier(data, newRating)){
        newAveRating = ((currentRating*numRatings)+ newRating)/(numRatings+1)
    }
    else{
        newAveRating = ((currentRating*numRatings)+ (weight*newRating))/(numRatings+ weight)
    }
    return newAveRating;
}

export {newRatingCalculation}
   
