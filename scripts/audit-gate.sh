#!/bin/bash
# CI security gate.
#
# Two traps in the old `yarn audit --level critical` line:
#   1. Yarn 1 exits non-zero whenever ANY advisory exists, and --level does not
#      filter (verified: --level critical, --level high and --level moderate all
#      print the same 1 Low | 5 Moderate summary). So the gate could never
#      distinguish "a critical ships to users" from "a dev tool has a CVE".
#   2. It scanned devDependencies, so test tooling noise masked the real question.
#
# This gate reads the JSON stream and decides on the data:
#   - production dependencies: no critical or high  -> hard fail
#   - full tree (incl. dev):   no high              -> hard fail
#   - every remaining moderate is reported, never silent
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1

summarize() {
  local groups="$1"
  yarn audit --json ${groups:+--groups "$groups"} 2>/dev/null |
    node -e '
      let raw = "";
      process.stdin.on("data", (c) => (raw += c));
      process.stdin.on("end", () => {
        const bySeverity = {};
        const details = [];
        for (const line of raw.split(/\r?\n/)) {
          if (!line.trim()) continue;
          let evt;
          try { evt = JSON.parse(line); } catch { continue; }
          if (evt.type !== "auditAdvisory") continue;
          const a = evt.data.advisory;
          bySeverity[a.severity] = (bySeverity[a.severity] || 0) + 1;
          details.push(`${a.severity}\t${a.module_name}\t${a.title}`);
        }
        const count = (s) => bySeverity[s] || 0;
        console.log(JSON.stringify({ critical: count("critical"), high: count("high"), moderate: count("moderate"), low: count("low"), details }));
      });
    '
}

fail=0

echo "== Production dependencies (what ships) =="
prod=$(summarize dependencies)
critical=$(printf '%s' "$prod" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>console.log(JSON.parse(d).critical))')
high=$(printf '%s' "$prod" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>console.log(JSON.parse(d).high))')
echo "critical=$critical high=$high"
if [ "$critical" != "0" ] || [ "$high" != "0" ]; then
  echo "FAIL: critical/high vulnerability in production dependencies."
  fail=1
else
  echo "OK: production dependencies are clean at critical and high."
fi

echo
echo "== Full dependency tree (incl. dev) =="
all=$(summarize "")
allhigh=$(printf '%s' "$all" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>console.log(JSON.parse(d).high))')
allmod=$(printf '%s' "$all" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>console.log(JSON.parse(d).moderate))')
echo "high=$allhigh moderate=$allmod"
if [ "$allhigh" != "0" ]; then
  echo "FAIL: high-severity vulnerability in the dependency tree."
  printf '%s' "$all" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{for(const l of JSON.parse(d).details){if(l.startsWith("high\t"))console.log("  - "+l.split("\t").slice(1).join(" :: "))}})'
  fail=1
else
  echo "OK: no high-severity vulnerabilities anywhere."
fi

if [ "$allmod" != "0" ]; then
  echo
  echo "NOTE: $allmod moderate advisories remain (not blocking):"
  printf '%s' "$all" | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{for(const l of JSON.parse(d).details){if(l.startsWith("moderate\t"))console.log("  - "+l.split("\t").slice(1).join(" :: "))}})'
fi

exit $fail
