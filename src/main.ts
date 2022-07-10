import { BrakeBanner } from "./brakebanner"

import "normalize.css"

window.onload = () => {
  const brakebanner = new BrakeBanner()
  brakebanner.mount("#brakebanner")
}
