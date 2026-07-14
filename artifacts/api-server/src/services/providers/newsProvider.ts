import axios from "axios";

export async function getMarketNews() {
  try {
    const url =
      "https://newsapi.org/v2/everything?q=stock%20market&language=en&pageSize=10&sortBy=publishedAt";

    const response = await axios.get(url, {
      headers: {
        "X-Api-Key": process.env.NEWS_API_KEY,
      },
    });

    return response.data.articles;
  } catch (error) {
    console.error("News API Error:", error);
    return [];
  }
}
