#!/data/data/com.termux/files/usr/bin/bash
set -euo pipefail
python3 - << 'PY'
import os, json, hashlib, datetime, subprocess

DIR = "/data/data/com.termux/files/home/.local/share/remote-viewer/contribution"
FILE = DIR + "/events.jsonl"
OUT_DIR = DIR + "/commitments"
os.makedirs(OUT_DIR, exist_ok=True)

verify = os.getcwd() + "/modules/contribution/verify.sh"
subprocess.check_call(["bash", verify])

with open(FILE) as f:
    lines = [l.strip() for l in f if l.strip()]

last = json.loads(lines[-1])
tip = last["sha"]
n = len(lines)
ts = datetime.datetime.now().astimezone().isoformat()

body = {
    "type": "ledger_tip",
    "ts": ts,
    "event_count": n,
    "tip_sha": tip
}

body_str = json.dumps(body, separators=(",", ":"))
commit = hashlib.sha256(body_str.encode()).hexdigest()
body["commit"] = commit

out = OUT_DIR + "/tip-" + datetime.datetime.now().strftime("%Y%m%dT%H%M%S") + ".json"
with open(out, "w") as f:
    json.dump(body, f)
os.chmod(out, 0o600)

print("Commitment written:", out)
print("tip_sha=" + tip)
print("commit=" + commit)
print("events=" + str(n))
PY
