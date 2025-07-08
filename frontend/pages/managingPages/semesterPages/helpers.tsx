// Helper function to get ordinal numbers (1st, 2nd, 3rd, 4th)
const getOrdinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

// Generate the list of semester names
export const semesterNameOptions: string[] = [];
for (let year = 1; year <= 4; year++) {
  for (let semester = 1; semester <= 2; semester++) {
    semesterNameOptions.push(
      `${getOrdinal(year)} Year ${getOrdinal(semester)} Semester`
    );
  }
}

// Helper function to generate shortname from full semester name
export const generateShortnameFromName = (name: string): string => {
  if (!name) return "";
  const numbers = name.match(/\d+/g); // Finds all sequences of digits
  if (numbers && numbers.length >= 2) {
    return `${numbers[0]}-${numbers[1]}`;
  }
  return ""; // Return empty string if format is unexpected
};