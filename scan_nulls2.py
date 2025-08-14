import os, py_compile
base = r"C:\Users\nayel\Esim\backend"
lines=[]
bad=[]; errs=[]
for root,_,files in os.walk(base):
    for f in files:
        if f.endswith(".py"):
            p=os.path.join(root,f)
            try:
                with open(p,"rb") as fh:
                    data = fh.read()
                if b"\x00" in data:
                    lines.append(f"NULLBYTES {p}"); bad.append(p)
                py_compile.compile(p, doraise=True)
            except Exception as e:
                lines.append(f"COMPILEERR {p} {e}"); errs.append((p,str(e)))
with open(os.path.join(base,'scan_result.txt'),'w', encoding='utf-8') as out:
    out.write("\n".join(lines)+"\n")
    out.write(f"BADCOUNT {len(bad)}\n")
    out.write(f"ERRCOUNT {len(errs)}\n")
print('done')
