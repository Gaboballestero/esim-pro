import os

BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

fixed = []
skipped = []
errors = []

def maybe_fix(path: str):
    try:
        with open(path, 'rb') as f:
            data = f.read()
        if b"\x00" not in data:
            return False
        # Try common encodings that introduce NUL bytes
        for enc in ('utf-16', 'utf-16-le', 'utf-16-be', 'utf-32', 'utf-32-le', 'utf-32-be'):
            try:
                text = data.decode(enc)
                # If decode succeeded, re-write as UTF-8
                with open(path, 'w', encoding='utf-8', newline='') as out:
                    out.write(text)
                return True
            except Exception:
                continue
        # If none decoded, skip
        skipped.append(path)
        return False
    except Exception as e:
        errors.append((path, str(e)))
        return False

for root, _, files in os.walk(BASE):
    for f in files:
        if f.endswith('.py'):
            p = os.path.join(root, f)
            if maybe_fix(p):
                fixed.append(p)

print('Fixed files:', len(fixed))
for p in fixed:
    print('FIXED', p)
print('Skipped files (undecodable with utf-16/32):', len(skipped))
for p in skipped:
    print('SKIPPED', p)
print('Errors:', len(errors))
for p, e in errors:
    print('ERROR', p, e)
