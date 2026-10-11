#!/usr/bin/env python3
"""怨氣發電廠 worker 打包腳本。
worker.js = index.html + api-routes.js 的拼接產物（build artifact），
直接改 worker.js 會被下次打包蓋掉。

關鍵：index.html 是包在 template literal (`...`) 裡的，
必須先把反斜線跳脫（\\ -> \\\\），否則 \'、\\n 這類 JS 跳脫會被
template literal 先吃掉，送到瀏覽器時變成斷掉的字串
（2026-10-11 血淚教訓：I can\\'t 變成 can't，全站 JS parse 失敗）。
"""
import sys

SRC = "/home/hatch/workspace/yuanqi"

def main():
    html = open(f"{SRC}/index.html", encoding="utf-8").read()
    api = open(f"{SRC}/api-routes.js", encoding="utf-8").read()
    # 先跳脫反斜線，再處理反引號與 ${（順序不可換）
    esc = html.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")
    worker = (
        "const HTML = `" + esc + "`;\n\n"
        + "// ===== API routes (from api-routes.js) =====\n"
        + api
        + "\n\nexport default {\n"
        + "  async fetch(request, env) {\n"
        + "    var url = new URL(request.url);\n"
        + "    if (url.pathname.indexOf('/api/') === 0) return handleApi(request, env);\n"
        + "    return new Response(HTML, { headers: { 'content-type': 'text/html; charset=utf-8' } });\n"
        + "  }\n"
        + "};\n"
    )
    open(f"{SRC}/worker.js", "w", encoding="utf-8").write(worker)
    print(f"worker.js rebuilt: {len(worker.encode('utf-8'))} bytes")

if __name__ == "__main__":
    main()
