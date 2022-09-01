import { chromium } from "playwright";
import fs from 'fs/promises';

const url = "https://probaseballexperience.jcink.net/index.php?showforum=181";
const fileName = "draftees.csv";

interface Draftee {
    topicTitleText: string, 
    topicTitleHref: string,
    topicStarterHref: string,
    topicStarterText: string
}

(async () => {
    log("Starting...")
    const browser = await chromium.launch();

    log("Opening Browser...")
    const page = await browser.newPage();

    // 
    log(`Opening page... [ ${url} ]`)
    await page.goto(url, { waitUntil: "domcontentloaded" });
    const draftees  = await page.$$eval(".topic-row td:nth-of-type(3)", get_draftees_from_row_nodes);

    //
    log(`Found ${draftees.length} draftees.`)
    const csv = convert_draftees_to_csv(draftees)

    //
    log(`Saving to [ ${fileName} ]`)
    await fs.writeFile(fileName, csv);
    log(`Successfully wrote [ ${fileName} ]!`)

    //
    log("Done. Play ball!")
    await browser.close();
})();

function log(message: string) {
    console.log(`[⚾️] ${message}`)
}


function get_draftees_from_row_nodes(nodes: any[] ): Draftee[] {
    let draftees: any[] = [];

        for (const node of nodes) {
            // First, we need to get the topic title. 
            // Then, get the href and the actual text.
            const topicTitleElement: any = node.querySelector("td:nth-of-type(3) a");
            const topicTitleHref = topicTitleElement?.getAttribute("href");
            const topicTitleText = topicTitleElement?.innerText;

            // Let's do the same thing for topic starter.
            const topicStarterElement: any = node.querySelector("td:nth-of-type(3) a");
            const topicStarterHref = topicStarterElement?.getAttribute("href");
            const topicStarterText = topicStarterElement?.innerText;

            draftees.push({
                topicTitleHref,
                topicTitleText,
                topicStarterHref,
                topicStarterText
            })
        }

        return draftees
}

function convert_draftees_to_csv(draftees: Draftee[]): string {
    let lines = [];

    for (const {topicTitleText, topicTitleHref, topicStarterHref, topicStarterText} of draftees) {
        lines.push(`"${topicTitleText}", "${topicTitleHref}", "${topicStarterText}", "${topicStarterHref}"`)
    }

    return lines.join("\n")
}