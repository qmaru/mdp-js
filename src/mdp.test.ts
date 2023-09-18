import { mdpr_images } from "./index"

test("get images ok", async () => {
    const image_urls = await mdpr_images("https://mdpr.jp/cinema/3928728")
    const image_len = image_urls.length
    console.log(image_len)
    expect(image_len).toEqual(50)
})
