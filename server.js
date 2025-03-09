const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const puppeteer = require("puppeteer");
const path = require("path");

const app = express();
const PORT = 3000;

// Serve static files (Frontend)
app.use(express.static(path.join(__dirname, "public")));

// Product URLs
const PRODUCT_URLS = {
    amazon: "https://www.amazon.in/Jordan-Mens-Sneaker-White-Black-sail/dp/B0CH1WTFHZ/",
    flipkart: "https://www.flipkart.com/nike-full-force-low-sneakers-men/p/itm90e4293b6188a"
};

// Scraping Amazon price
const scrapeAmazon = async () => {
    try {
        const { data } = await axios.get(PRODUCT_URLS.amazon, {
            headers: { "User-Agent": "Mozilla/5.0" }
        });
        const $ = cheerio.load(data);
        let price = $("span.a-price-whole").first().text().trim();
        return price || "Price not found";
    } catch (error) {
        console.error("Error scraping Amazon:", error.message);
        return "Error fetching price";
    }
};

// Scraping Flipkart price using Puppeteer
const scrapeFlipkart = async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    try {
        await page.goto(PRODUCT_URLS.flipkart, { waitUntil: "domcontentloaded" });
        await page.waitForSelector("div._30jeq3", { timeout: 5000 });
        let price = await page.$eval("div._30jeq3", el => el.innerText.trim());
        await browser.close();
        return price;
    } catch (error) {
        console.error("Error scraping Flipkart:", error.message);
        await browser.close();
        return "Error fetching price";
    }
};

// API Endpoint to fetch prices
app.get("/prices", async (req, res) => {
    const amazonPrice = await scrapeAmazon();
    const flipkartPrice = await scrapeFlipkart();
    
    res.json({ amazon: amazonPrice, flipkart: flipkartPrice });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
