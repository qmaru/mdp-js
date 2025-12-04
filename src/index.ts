import { parse } from "node-html-parser"

interface MdprImageData {
  list: Array<{ url: string }>
}

interface MdprJsonData {
  url: string
}

class MdprMedia {
  url: string
  constructor(url: string) {
    this.url = url
  }

  private getArticleId(): string {
    const url = this.url.trim()
    if (!url.includes("https://mdpr.jp") || url.includes("photo/details")) {
      return ""
    }
    const lastSlashIndex = url.lastIndexOf("/")
    return lastSlashIndex !== -1 ? url.substring(lastSlashIndex + 1) : ""
  }

  async getImageIndex(): Promise<string> {
    const MDPR_HOST: string = "https://app2-mdpr.freetls.fastly.net"
    const aid = this.getArticleId()
    if (!aid) return ""

    const response = await fetch(`${MDPR_HOST}/articles/detail/${aid}`, {
      method: "get",
      headers: {
        "X-Requested-With": "jp.mdpr.mdprviewer",
        "User-Agent":
          "Mozilla/5.0 (Linux Android 7.1.1 E6533 Build/32.4.A.1.54 wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/94.0.4606.85 Mobile Safari/537.36",
      },
    })
    const html = await response.text()
    const root = parse(html)
    const articleBody = root.querySelectorAll(".p-articleBody a[data-mdprapp-option]")

    for (const articleData of articleBody) {
      const mdprData = articleData.getAttribute("data-mdprapp-option")
      if (!mdprData) continue

      const mdprJsonStr = decodeURIComponent(mdprData)
      const mdprJson: MdprJsonData = JSON.parse(mdprJsonStr)
      if (mdprJson.url.includes(aid)) {
        return MDPR_HOST + mdprJson.url
      }
    }
    return ""
  }

  async getImageUrls(image_index: string): Promise<string[]> {
    const USER_AGENT = "okhttp/4.9.1"
    const MDPRUSER_AGENT = "sony E653325 android 7.1.1 3.10.4838(66)"
    const headers = new Headers({
      "mdpr-user-agent": MDPRUSER_AGENT,
      "User-Agent": USER_AGENT,
    })

    const response = await fetch(image_index, { method: "get", headers: headers })
    const mdprImageData = (await response.json()) as MdprImageData
    return mdprImageData.list.map((item) => item.url)
  }
}

const getMdprImages = async (url: string): Promise<string[]> => {
  const mdpr = new MdprMedia(url)
  const imageIndex = await mdpr.getImageIndex()
  return imageIndex ? await mdpr.getImageUrls(imageIndex) : []
}

export default getMdprImages
