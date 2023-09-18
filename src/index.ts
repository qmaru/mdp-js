import parse from 'node-html-parser'

class MdprMedia {
    url: string;
    constructor(url: string) {
        this.url = url;
    }

    private getArticleId(): string {
        const url: string = this.url.trim()
        if (url.includes("https://mdpr.jp")) {
            if (!url.includes("photo/details")) {
                let urlParts: string[] = url.split("/")
                let urlLen: number = urlParts.length
                let articleId = urlParts[urlLen - 1]
                if (articleId !== undefined) {
                    return articleId
                }
            }
        }
        return ""
    }

    async getImageIndex(): Promise<string> {
        const MDPR_HOST: string = "https://app2-mdpr.freetls.fastly.net"
        const USER_AGENT: string = "Mozilla/5.0 (Linux; Android 7.1.1; E6533 Build/32.4.A.1.54; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/94.0.4606.85 Mobile Safari/537.36"
        const X_REQUESTED_WITH: string = "jp.mdpr.mdprviewer"

        const aid = this.getArticleId()
        if (aid === "") {
            return ""
        }

        const mobileIndex = `${MDPR_HOST}/articles/detail/${aid}`
        const headers = new Headers({
            "X-Requested-With": X_REQUESTED_WITH,
            "User-Agent": USER_AGENT
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
                        return MDPR_HOST + mdprJson.url
                    }
                }
            }
        }
        return ""
    }

    async getImageUrls(image_index: string): Promise<string[]> {
        let urls: string[] = []
        const USER_AGENT = "okhttp/4.9.1"
        const MDPRUSER_AGENT = "sony; E653325; android; 7.1.1; 3.10.4838(66);"
        const headers = new Headers({
            "mdpr-user-agent": MDPRUSER_AGENT,
            "User-Agent": USER_AGENT
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

export const getMdprImages = async (url: string): Promise<string[]> => {
    const mdpr = new MdprMedia(url)
    const imageIndex = await mdpr.getImageIndex()
    const imageUrls = await mdpr.getImageUrls(imageIndex)
    return imageUrls
}
