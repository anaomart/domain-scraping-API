const puppeteer = require('puppeteer-extra');
const { Cluster } = require('puppeteer-cluster');
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
puppeteer.use(StealthPlugin())
const delay = (delayInms) => {
    return new Promise(resolve => setTimeout(resolve, delayInms))
};
const blueHostSettings = {
    image: "https://i.pcmag.com/imagery/reviews/03RxM1ADIa6LeeeSg8mrfiN-1.fit_scale.size_1028x578.v1635256883.jpg",
    site: 'https://www.bluehost.com/',
    searchBarSelector: '.search-input',
    availableSelector: '.remove-cart-text',
    priceSelector: '.suggestion-price.au-suggestion-price '
}
const nameCheapSettings = {
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ_MB87ax8PdsV-e_ibKQbKqNbX5BbkreQ9RaI0EF-CqWNPVwx5DbBAxJewpzZxiOf_FrA&usqp=CAU",
    site: 'https://www.namecheap.com/',
    searchBarSelector: '[type="search"]',
    availableSelector: '.standard .available',
    priceSelector: '.price strong '
}

const OVHCloudSettings = {
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTS_D5VbWX9kGIwJmAEkXZUII4Y8a2SiQeyt9soh4Q14J3PdqAnr1hFrhHJxHIzt1zzJZk&usqp=CAU',
    site: 'https://www.ovhcloud.com/en/',
    searchBarSelector: '#edit-domain-name',
    availableSelector: `[data-table-id="'main-available-domains'"] [data-translate="domain_table_available_button"]`,
    priceSelector: `[data-table-id="'main-available-domains'"] .real-price`
}
const goDaddySettings = {
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT7KKiouvxtRsp7XXylEYKZmfAkY1lt3SosfYzOeald-iezJEh4qgfiY5bDKsU7BYkNo_0&usqp=CAU',
    site: 'https://ae.godaddy.com/',
    searchBarSelector: '[type="search"]',
    availableSelector: `[data-cy="exact-match"]`,
    priceSelector: '.pricing-main-price'
}
const hostingerSettings = {
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgmGbTISe1TkfL1wOpSmgh2D9at5kWoKphP5yx9IJto_whUe4Bg_SNAP76KEXEMRqgnmM&usqp=CAU',
    site: 'https://www.hostinger.com/domain-name-search',
    searchBarSelector: '#h-domain-finder-header-input',
    availableSelector: '.h-found-domain-cards-item__header.h-found-domain-cards-item__header--primary.h-found-domain-cards-item__header--font-light',
    priceSelector: '.h-price.h-price--text-meteorite-dark'
}
const dreamHostSettings = {
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQf921RIg-enklFGMaufnx1nkS83mDCgn6zzRR9u5HhLermcs3DAI6_e3-tMpQDT42mMQY&usqp=CAU",
    site: 'https://www.dreamhost.com/domains/?domain=',
    searchBarSelector: '#domain-search-input',
    availableSelector: '#search-banner a',
    priceSelector: '#search-banner > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > span:nth-child(2)'
}
const nameComSettings = {
    image: 'https://www.name.com/media/favicon/apple-touch-icon.png',
    site: 'https://www.name.com/',
    searchBarSelector: '#search-keyword',
    availableSelector: '#resultsContainer .colordarkgreen.proximanovabold',
    priceSelector: 'div.resultsrow:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > span:nth-child(2)'
}
const hostGatorSettings = {
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0lpQPeXK6_Ss0nCo-jkyq3fPZkTU-bSV_oPtUFldZCY93pJGqzktdbM1OfBIbwjqoNf0&usqp=CAU',
    site: 'https://www.hostgator.com/domains',
    searchBarSelector: '.domainSearch__input',
    availableSelector: '.notification.available',
    priceSelector: '.effective_price'
}
const listOfProviders = [
    blueHostSettings, nameCheapSettings,
    goDaddySettings,
    OVHCloudSettings, hostingerSettings,
    dreamHostSettings, nameComSettings,
    hostGatorSettings
]
const getElement = async(page, selector) => {
    try {
        const element = await page.waitForSelector(selector, { timeout: 10000 })
        return element
    } catch (error) {}

}
let result = []
const scrape = async(page, settings, domain) => {
    const { site, searchBarSelector, availableSelector, priceSelector, image } = settings;
    await delay(2000)
    const searchInput = await getElement(page, searchBarSelector)
    await searchInput.type(domain)
    await delay(400)
    await searchInput.press('Enter')
    await delay(1000)
    const available = await getElement(page, availableSelector)
    if (!available) {
        result.push({
            site: site.slice(12),
            domain: domain,
            available: !!available,
        })
        console.log("domain is taken")
        return "domain is taken"
    }
    const price = await getElement(page, priceSelector)
    const priceText = await page.evaluate((ele) => ele.textContent.trim(), price)
    const regex = /\b(\d+(?:[\.,]\d+)?)\b/g;
    const matches = priceText.match(regex);

    result.push({
        image: image,
        site: site.slice(12),
        domain: domain,
        available: !!available,
        price: matches[0],
    })
}
exports.main = async(domain, cores) => {
    result = []
    const myCluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_PAGE,
        defaultViewport: false,
        maxConcurrency: +cores,
        puppeteer,
        puppeteerOptions: {
            headless: true,
            userDataDir: './tmp',
            // executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
        }
    });

    myCluster.on('taskerror', (err, data) => {
        console.log(err)
    })

    await myCluster.task(async({ page, data: { settings, domain } }) => {
        await page.goto(settings.site, { waitUntil: 'domcontentloaded' })
        await scrape(page, settings, domain)
    });

    listOfProviders.forEach(provider => myCluster.queue({ settings: provider, domain: domain }))

    await myCluster.idle();
    await myCluster.close();
    console.log({ theResultIs: result })
    return result
}






console.log({ result })