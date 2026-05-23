export async function handler() {
  try {
    await fetch("https://ralucabeauty.ro/api/reminders");

    return {
      statusCode: 200,
      body: "Reminder cron executed",
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: "Reminder cron failed",
    };
  }
}
