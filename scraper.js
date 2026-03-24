const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

// Delay function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// CSV save function
function saveCSV(books) {
    const header = 'Title,Price,Rating,Availability\n';
    const rows = books.map(book =>
        `"${book.title}","${book.price}","${book.rating}","${book.availability}"`
    ).join('\n');

    fs.writeFileSync('./data/books.csv', header + rows);
    console.log('✅ CSV saved!');
}

async function scrapePage(pageNum) {
    const url = `https://books.toscrape.com/catalogue/page-${pageNum}.html`;

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });

        const $ = cheerio.load(response.data);
        const books = [];

        $('article.product_pod').each((index, element) => {
            const title = $(element).find('h3 a').attr('title');
            const price = $(element).find('.price_color').text();
            const rating = $(element).find('p.star-rating').attr('class').replace('star-rating ', '');
            const availability = $(element).find('.availability').text().trim();

            books.push({ title, price, rating, availability });
        });

        return books;

    } catch (error) {
        console.log(`❌ Error on page ${pageNum}:`, error.message);
        return [];
    }
}

async function scrapeAllPages() {
    const allBooks = [];

    for (let i = 1; i <= 50; i++) {
        console.log(`Scraping page ${i}...`);
        const books = await scrapePage(i);
        allBooks.push(...books);
        await sleep(2000); // 2 second delay
    }

    // Save both formats
    fs.writeFileSync('./data/books.json', JSON.stringify(allBooks, null, 2));
    saveCSV(allBooks);

    console.log(`✅ Done! ${allBooks.length} books saved in JSON & CSV!`);
}

scrapeAllPages();