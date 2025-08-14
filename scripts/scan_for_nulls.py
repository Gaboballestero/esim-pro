import os
import py_compile

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
report_path = os.path.join(BASE, 'scan_report.txt')

lines = []
bad = []
errs = []

for root, _, files in os.walk(BASE):
    for f in files:
        if f.endswith('.py'):
            p = os.path.join(root, f)
            try:
                with open(p, 'rb') as fh:
                    data = fh.read()
                if b"\x00" in data:
                    lines.append(f"NULLBYTES {p}")
                    bad.append(p)
                # try compile too
                py_compile.compile(p, doraise=True)
            except Exception as e:
                lines.append(f"COMPILEERR {p} {e}")
                errs.append((p, str(e)))

with open(report_path, 'w', encoding='utf-8') as out:
    out.write("\n".join(lines) + ("\n" if lines else ""))
    out.write(f"BADCOUNT {len(bad)}\n")
    out.write(f"ERRCOUNT {len(errs)}\n")

print(f"Scan complete. Report written to: {report_path}")
