const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const semesterMappings = {
    "1st year 1st semester": "1-1",
    "1st year 2nd semester": "1-2",
    "2nd year 1st semester": "2-1",
    "2nd year 2nd semester": "2-2",
    "3rd year 1st semester": "3-1",
    "3rd year 2nd semester": "3-2",
    "4th year 1st semester": "4-1",
    "4th year 2nd semester": "4-2",
    // Add more mappings as needed
  };

  console.log("Starting semester shortname update...");

  for (const [fullName, shortName] of Object.entries(semesterMappings)) {
    try {
      const updatedSemester = await prisma.semester.updateMany({
        where: {
          name: fullName,
          shortname: null // Only update if shortname is not already set
        },
        data: {
          shortname: shortName
        }
      });
      console.log(`Updated ${updatedSemester.count} semester(s) for "${fullName}" to shortname "${shortName}"`);
    } catch (error) {
      console.error(`Error updating semester "${fullName}":`, error);
    }
  }

  console.log("Semester shortname update complete.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });