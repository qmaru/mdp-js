import getMdprImages from "./index"

test("get images ok", async () => {
  const image_urls = await getMdprImages("https://mdpr.jp/cinema/3928728")
  const image_len = image_urls.length
  expect(image_len).toEqual(50)
})
