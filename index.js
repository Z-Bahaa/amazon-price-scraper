const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const port = 3000;

app.use(express.static('public'));

const selectors = {
  'amazon': {
    title: "#productTitle",
    price: {
      whole: "span.a-price-whole",
      fraction: "span.a-price-fraction",
      symbol: "span.a-price-symbol"
    }
  },
  'jumia': {
    title: "h1",
    price: {
      whole: "span.-b.-ubpt.-tal.-fs24.-prxs",
      fraction: "",
      symbol: ""
    }
  }
}

app.get('/scrape-product', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).send("URL parameter is required");
    }
    const store = url.split('.')[1];
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
      },
      timeout: 5000,
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const price = $(selectors[store].price.whole).first().text().trim() +
      $(selectors[store].price.fraction).first().text().trim()
      + ' ' + $(selectors[store].price.symbol).first().text().trim(); // Update the selector based on the product page
    const title = $(selectors[store].title).first().text().trim(); // Update the selector based on the product page

    res.json({
      title,
      price,
      store
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Error scraping Amazon product data");
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});