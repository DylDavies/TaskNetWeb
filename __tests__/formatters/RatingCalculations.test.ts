import { newRatingCalculation } from '@/app/server/formatters/RatingCalculations';
import UserData from '@/app/interfaces/UserData.interface'; // Used for type only

describe('newRatingCalculation Formatter', () => {
  describe('First Rating Scenarios', () => {
    it('should return the new rating if ratingCount is 0', () => {
      const userData: Partial<UserData> = { ratingCount: 0, ratings: [] };
      expect(newRatingCalculation(userData, 4.5)).toBe(4.5);
    });

    it('should return the new rating if ratingCount is undefined (treated as first rating)', () => {
      const userData: Partial<UserData> = { ratings: [] };
      expect(newRatingCalculation(userData, 3)).toBe(3);
    });

    it('should return the new rating if ratingAverage is undefined (treated as first rating, assuming ratingCount is also 0 or undefined)', () => {
      const userData: Partial<UserData> = { ratingCount: 0, ratings: [] };
      expect(newRatingCalculation(userData, 5)).toBe(5);
    });
  });

  describe('Normal Ratings (Non-Outliers)', () => {
    const userDataNonOutlierBase: Partial<UserData> = {
      ratings: [3, 3.5, 4, 4.5, 5],
      ratingAverage: (3 + 3.5 + 4 + 4.5 + 5) / 5, // 4.0
      ratingCount: 5,
    };

    it('should calculate the new average for a non-outlier rating when ratings.length >= 5', () => {
      const newRating = 4.2;
      const currentAvg = userDataNonOutlierBase.ratingAverage!;
      const currentCount = userDataNonOutlierBase.ratingCount!;
      const expectedNewAvg = ((currentAvg * currentCount) + newRating) / (currentCount + 1);
      expect(newRatingCalculation(userDataNonOutlierBase, newRating)).toBeCloseTo(expectedNewAvg);
    });

    it('should calculate the new average when ratings array is small (less than 5, always treated as non-outlier)', () => {
      const userDataSmallRatings: Partial<UserData> = {
        ratings: [4, 5],
        ratingAverage: 4.5,
        ratingCount: 2,
      };
      const newRating = 1;
      const currentAvg = userDataSmallRatings.ratingAverage!;
      const currentCount = userDataSmallRatings.ratingCount!;
      const expectedNewAvg = ((currentAvg * currentCount) + newRating) / (currentCount + 1);
      expect(newRatingCalculation(userDataSmallRatings, newRating)).toBeCloseTo(expectedNewAvg);
    });
  });

  describe('Outlier Ratings (ratings.length >= 5)', () => {
    const userDataForOutlierCheck: Partial<UserData> = {
      ratings: [3, 3.5, 4, 4.5, 5],
      ratingAverage: 4.0,
      ratingCount: 5,
    };
    const weight = 0.7;

    it('should apply weighted adjustment for a low outlier rating', () => {
      const newOutlierRating = 0.5;
      const currentAvg = userDataForOutlierCheck.ratingAverage!;
      const currentCount = userDataForOutlierCheck.ratingCount!;
      const expectedNewAvg = ((currentAvg * currentCount) + (weight * newOutlierRating)) / (currentCount + weight);
      expect(newRatingCalculation(userDataForOutlierCheck, newOutlierRating)).toBeCloseTo(expectedNewAvg);
    });

    it('should apply weighted adjustment for a high outlier rating', () => {
      const newOutlierRating = 8;
      const currentAvg = userDataForOutlierCheck.ratingAverage!;
      const currentCount = userDataForOutlierCheck.ratingCount!;
      const expectedNewAvg = ((currentAvg * currentCount) + (weight * newOutlierRating)) / (currentCount + weight);
      expect(newRatingCalculation(userDataForOutlierCheck, newOutlierRating)).toBeCloseTo(expectedNewAvg);
    });
  });

  describe('Edge Cases for Median Calculation (indirectly tested)', () => {
    it('should handle empty ratings array (numRatings > 0 but ratings array empty, isRatingOutlier returns false)', () => {
      const userData: Partial<UserData> = {
        ratings: [],
        ratingAverage: 3,
        ratingCount: 2,
      };
      const newRating = 5;
      const expectedNewAvg = ((3 * 2) + 5) / (2 + 1); // (6+5)/3 = 11/3
      expect(newRatingCalculation(userData, newRating)).toBeCloseTo(expectedNewAvg);
    });

    it('should handle ratings array with one element for Q1/Q3 median calculation (if mid > 0)', () => {
      const userData: Partial<UserData> = {
        ratings: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        ratingAverage: 5.5,
        ratingCount: 10,
      };
      const newRatingNonOutlier = 0;
      const expectedNonOutlierAvg = ((5.5 * 10) + newRatingNonOutlier) / (10 + 1); // 55/11 = 5
      expect(newRatingCalculation(userData, newRatingNonOutlier)).toBeCloseTo(expectedNonOutlierAvg);

      const newRatingOutlier = 20;
      const weight = 0.7;
      const expectedOutlierAvg = ((5.5 * 10) + (weight * newRatingOutlier)) / (10 + weight); // (55 + 14) / 10.7 = 69 / 10.7
      expect(newRatingCalculation(userData, newRatingOutlier)).toBeCloseTo(69 / 10.7);
    });

    it('should handle ratings array with two elements for Q1/Q3 median calculation (if mid results in 2-element slice)', () => {
      const userData: Partial<UserData> = {
        ratings: [1, 2, 3, 4, 5, 6],
        ratingAverage: 3.5,
        ratingCount: 6,
      };
      const newRatingNonOutlier = 0;
      const expectedNonOutlierAvg = ((3.5 * 6) + newRatingNonOutlier) / (6 + 1); // 21/7 = 3
      expect(newRatingCalculation(userData, newRatingNonOutlier)).toBeCloseTo(expectedNonOutlierAvg);

      const newRatingOutlierHigh = 10;
      const weight = 0.7;
      const expectedOutlierHighAvg = ((3.5 * 6) + (weight * newRatingOutlierHigh)) / (6 + weight); // (21+7)/6.7 = 28/6.7
      expect(newRatingCalculation(userData, newRatingOutlierHigh)).toBeCloseTo(expectedOutlierHighAvg);

      const newRatingOutlierLow = -3;
      const expectedOutlierLowAvg = ((3.5 * 6) + (weight * newRatingOutlierLow)) / (6 + weight); // (21-2.1)/6.7 = 18.9/6.7
      expect(newRatingCalculation(userData, newRatingOutlierLow)).toBeCloseTo(expectedOutlierLowAvg);
    });
  });
});