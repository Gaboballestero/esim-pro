import os, py_compile
base = r"C:\Users\nayel\Esim\backend"
bad=[]; errs=[]
for root,_,files in os.walk(base):
    for f in files:
        if f.endswith(".py"):
            p=os.path.join(root,f)
            try:
                with open(p,"rb") as fh:
                    data = fh.read()
                if b"\x00" in data:
                    print("NULLBYTES", p); bad.append(p)
                py_compile.compile(p, doraise=True)
            except Exception as e:
                print("COMPILEERR", p, e); errs.append((p,str(e)))
print("BADCOUNT", len(bad)); print("ERRCOUNT", len(errs))
