const { Cluster } = require('puppeteer-cluster');
const puppeteer = require('puppeteer');
const puppeteerExtra = require('puppeteer-extra');
const stealth = require('puppeteer-extra-plugin-stealth');

puppeteerExtra.use(stealth());

(async() => {
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_PAGE,
        maxConcurrency: 5, // Set the maximum number of pages to scrape in parallel
    });

    const urls = ['https://example.com/page1', 'https://example.com/page2', 'https://example.com/page3'];

    await cluster.task(async({ page, data: url }) => {
        const browser = await puppeteerExtra.launch();

        await page.goto(url);

        // Additional scraping logic here

        await browser.close();
    });

    for (const url of urls) {
        cluster.queue(url);
    }

    await cluster.idle();
    await cluster.close();
})();