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


const formatDateAsDate = (dateNum?: number): string => {
    if (dateNum == undefined) return "Not specified"; // null or undefined 

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

export {formatDateAsDate, formatDateAsString}