export async function getEmbeddings(text: string) {
  const MAX_RETRIES = 5; // Increased from 3
  const INITIAL_DELAY = 10000; // Start with 10-second delay

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(
        process.env.HUGGINGFACE_TEI_URL!, // No "/embed" suffix
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          },
          body: JSON.stringify({
            inputs: text.replace(/\n/g, " "),
            options: {
              wait_for_model: true, // Crucial for hosted endpoint
              use_cache: false // Bypass cache issues
            }
          }),
        }
      );

      // Handle special 503 with model loading
      if (response.status === 503) {
        const delay = Math.min(INITIAL_DELAY * Math.pow(2, attempt), 120000);
        console.log(`Model loading (Attempt ${attempt}), retrying in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`);
      }

      return await response.json();
      
    } catch (error) {
      if (attempt === MAX_RETRIES) {
        console.error(`Failed after ${MAX_RETRIES} attempts:`, error);
        throw error;
      }
    }
  }
}