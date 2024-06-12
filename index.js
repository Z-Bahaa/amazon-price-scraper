const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/scrape-amazon-product', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).send("URL parameter is required");
    }

    const response = await axios.get(url);
    const html = response.data;
    const $ = cheerio.load(html);

    const price = $('span.a-price-whole').first().text().trim() +
      $('span.a-price-fraction').first().text().trim()
      + ' ' + $('span.a-price-symbol').first().text().trim(); // Update the selector based on the product page
    const title = $('#productTitle').text().trim(); // Update the selector based on the product page

    res.json({ title, price });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error scraping Amazon product data");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});