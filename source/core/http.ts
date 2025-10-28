import axios from "axios";

export const http = axios.create({
  timeout: 30_000,
  headers: {
    "Accept": "*/*",
    "User-Agent": "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:144.0) Gecko/20100101 Firefox/144.0",
  },
});
