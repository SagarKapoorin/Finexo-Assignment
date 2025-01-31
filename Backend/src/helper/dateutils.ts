export const dateUtils = {
    //for checking current month 
    isWithinCurrentMonth(date: Date): boolean {
      const currentDate = new Date();
      return (
        date.getMonth() === currentDate.getMonth() &&
        date.getFullYear() === currentDate.getFullYear()
      );
    },
  
    //for chekcing within months months
    isWithinMonths(date: Date, months: number): boolean {
      const currentDate = new Date();
      const minDate = new Date();
      minDate.setMonth(currentDate.getMonth() - months);
      
      return date >= minDate && date <= currentDate;
    },
  
//    parsing excel date to matching date
    parseExcelDate(excelDate: number | string): Date {
      if (typeof excelDate === 'number') {
        // Excel serial date (days since 1900-01-01)
        const utcDays = Math.floor(excelDate - 25569);
        return new Date(utcDays * 86400000);
      }
      return new Date(excelDate);
    },
  
    //validating date format
    isValidDateFormat(dateString: string, format: string): boolean {
      const formatParts = format.split(/[-\/]/);
      const dateParts = dateString.split(/[-\/]/);
      if (formatParts.length !== dateParts.length) return false;
      try {
        const dayIndex = formatParts.indexOf('DD');
        const monthIndex = formatParts.indexOf('MM');
        const yearIndex = formatParts.indexOf('YYYY');
  
        const day = parseInt(dateParts[dayIndex]);
        const month = parseInt(dateParts[monthIndex]) - 1;
        const year = parseInt(dateParts[yearIndex]);
  
        const testDate = new Date(year, month, day);
        return (
          testDate.getDate() === day &&
          testDate.getMonth() === month &&
          testDate.getFullYear() === year
        );
      } catch {
        return false;
      }
    },
  
    //formatting date to string
    formatDate(date: Date, format: string): string {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return format
        .replace('DD', pad(date.getDate()))
        .replace('MM', pad(date.getMonth() + 1))
        .replace('YYYY', date.getFullYear().toString());
    }
  };
  
  // Type exports
  export type DateUtils = typeof dateUtils;