import parse from 'node-html-parser'

class MdprMedia {
    url: string;
    constructor(url: string) {
        this.url = url;
    }

    private get_article_id(): string {
        const url: string = this.url.trim()
        if (url.includes("https://mdpr.jp")) {
            if (!url.includes("photo/details")) {
                let url_parts: string[] = url.split("/")
                let url_len: number = url_parts.length
                let article_id = url_parts[url_len - 1]
                if (article_id !== undefined) {
                    return article_id
                }
            }
        }
        return ""
    }

    async get_image_index(): Promise<string> {
        const MDPRHOST: string = "https://app2-mdpr.freetls.fastly.net"
        const USERAGENT: string = "Mozilla/5.0 (Linux; Android 7.1.1; E6533 Build/32.4.A.1.54; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/94.0.4606.85 Mobile Safari/537.36"
        const XREQUESTEDWITH: string = "jp.mdpr.mdprviewer"

        const aid = this.get_article_id()
        if (aid === "") {
            return ""
        }

        const mobileIndex = `${MDPRHOST}/articles/detail/${aid}`
        const headers = new Headers({
            "X-Requested-With": XREQUESTEDWITH,
            "User-Agent": USERAGENT
        });



        const response = await fetch(mobileIndex, { method: "get", headers: headers })
        const html = await response.text()
        const root = parse(html)
        const articleBody = root.querySelectorAll('.p-articleBody a')

        for (const i in articleBody) {
            const articleData = articleBody[i]
            if (articleData) {
                const mdprData = articleData.getAttribute('data-mdprapp-option')
                if (mdprData) {
                    const mdprJsonStr = decodeURIComponent(mdprData)
                    const mdprJson = JSON.parse(mdprJsonStr)
                    if (mdprJson.url.includes(aid)) {
                        return MDPRHOST + mdprJson.url
                    }
                }
            }
        }
        return ""
    }

    async get_image_urls(image_index: string): Promise<string[]> {
        let urls: string[] = []
        const USERAGENT = "okhttp/4.9.1"
        const MDPRUSER_AGENT = "sony; E653325; android; 7.1.1; 3.10.4838(66);"
        const headers = new Headers({
            "mdpr-user-agent": MDPRUSER_AGENT,
            "User-Agent": USERAGENT
        });

        const response = await fetch(image_index, { method: "get", headers: headers })
        const mdprImageData = await response.json()
        const mdprImageList = mdprImageData["list"]
        for (let i in mdprImageList) {
            const mdprImage = mdprImageList[i]
            const imgUrl = mdprImage["url"]
            urls.push(imgUrl)
        }
        return urls
    }
}

export const mdpr_images = async (url: string): Promise<string[]> => {
    const mdpr = new MdprMedia(url)
    const image_index = await mdpr.get_image_index()
    const image_urls = await mdpr.get_image_urls(image_index)
    return image_urls
}
