import getMdprImages from "./index"

const args = process.argv.slice(2)

if (args.length === 0) {
  console.error("Usage: mdp-js <url>")
  console.error("Example: mdp-js https://mdpr.jp/cinema/3928728")
  process.exit(1)
}

const url = args[0]

if (!url) {
  console.error("Error: URL is required")
  process.exit(1)
}

try {
  const images = await getMdprImages(url)
  if (images.length === 0) {
    console.log("No images found")
  } else {
    images.forEach((img) => console.log(img))
  }
} catch (error) {
  console.error("Error:", error instanceof Error ? error.message : error)
  process.exit(1)
}
