  // Format date from YYYYMMDD to TS Date to then string in format DD Month YYYY
const formatDateAsString = (dateNum?: number) => {
    if (!dateNum) return "Not specified"; // null or undefined 

    const dateStr = dateNum.toString();
    if (dateStr.length !== 8) return "Invalid date"; // Ensure YYYYMMDD format

    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    return new Date(`${year}-${month}-${day}`).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};


const formatDateAsDate = (dateNum: number): Date => {
    const dateStr = dateNum.toString();

    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    
    return new Date(`${year}-${month}-${day}`);
};

function formatDateAsNumber(date: Date): number {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-indexed
  const day = date.getDate().toString().padStart(2, "0");

  return parseInt(`${year}${month}${day}`, 10);
}

export default formatDateAsNumber;

function convertDateStringToNumber(dateString: string): number {
  // Remove all hyphens and convert to number
  const numericDate = parseInt(dateString.replace(/-/g, ''), 10);
  return numericDate;
}

function isValidDateString(dateStr: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateStr)) return false;

  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
}

function getCurrentDateAsNumber() {
    const now = new Date();
  
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
  
    return Number(`${year}${month}${day}`);
}


export {formatDateAsDate, formatDateAsString, formatDateAsNumber, convertDateStringToNumber, isValidDateString, getCurrentDateAsNumber}