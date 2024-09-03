import json

# 读取原始 JSON 文件
with open("./bankcode.json", "r", encoding="utf-8") as f:
    data = json.load(f)

# 转换数据
result = []
for bank_id, bank_info in data.items():
    for bank in bank_info:
        result.append({"logo": f"/bank/logo/{bank_id}.png", "name": bank["name"]})

# 将结果写入新的 JSON 文件
with open("output.json", "w", encoding="utf-8") as f:
    json.dump(result, f, ensure_ascii=False, indent=2)

print("转换完成，结果已保存到 output.json")
