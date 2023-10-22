import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer-core';

@Injectable()
export class AmazonService {
  async getProducts(products: string) {
    const browser = await puppeteer.launch();
    try {
      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(2 * 60 * 1000);
      await Promise.all([
        page.waitForNavigation(),
        page.goto('https://amazon.com'),
      ]);
      await page.type('#twotabsearchtextbox', products);
      await Promise.all([
        page.waitForNavigation(),
        page.click('#nav-search-submit-button'),
      ]);
      await page.$$eval(
        '.s-search-results .s-card-container',
        (searchResults) => {
          return searchResults.map((searchResult) => {
            const url = searchResult.querySelector('a').href;
            const title = searchResult.querySelector(
              '.s-title-instructions-style h2',
            )?.textContent;
            const price = searchResult.querySelector('a-price a-offscreen')
              ?.textContent;
            return {
              url,
              title,
              price,
            };
          });
        },
      );
    } finally {
      await browser.close();
    }
  }
}
