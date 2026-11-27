import json

with open(r'C:\Users\Admin\.gemini\antigravity\brain\df4ae428-8651-40d9-a2f3-88792a12deea\.system_generated\steps\7161\output.txt', 'r', encoding='utf-8', errors='ignore') as f:
    for line in f:
        line = line.strip()
        if not line or not line.startswith('{'):
            continue
        try:
            entry = json.loads(line)
            req_path = entry.get('requestPath', '')
            if 'mcp' in req_path:
                ts = entry.get('timestamp')
                method = entry.get('requestMethod')
                status = entry.get('responseStatusCode')
                src = entry.get('source')
                msg = entry.get('message', '')
                print(f"{ts} | {method} {req_path} -> {status} | src={src} | msg={msg}")
        except Exception as e:
            pass
