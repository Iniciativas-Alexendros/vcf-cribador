# Benchmarks GUI/API (Fase 6)

Objetivo: fixtures sintéticos de ~1k / 10k / 50k contactos.

```bash
# Generar corpus sintético (ejemplo)
# cargo run -p zedazo -- cribar corpus_1k.vcf -o /tmp/out.vcf -a /tmp/a.tsv

# API local
ZEDAZO_DATA_DIR=./data cargo run -p zedazo-api

# Medir upload+job con curl/time; anotar RSS del proceso api
```

Criterios beta: sin bloqueos de UI en wizard, cancelación cooperativa, encoding ISO OK, exportaciones equivalentes a CLI.
