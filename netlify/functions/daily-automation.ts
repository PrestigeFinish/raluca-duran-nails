export default async () => {
  try {
    await fetch("https://ralucabeauty.ro/api/automations/daily");

    return {
      statusCode: 200,
      body: "Automation executed",
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: "Automation failed",
    };
  }
};
