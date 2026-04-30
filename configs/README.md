# configs/

Runtime configuration for the Chrysalis Lattice nexus.

## Files

- **`ideology_axes_training.json`** — *Input* to the ideology mapper. Each axis lists positive
  and negative example statements. No precomputed vectors. Edit this file to define the
  ideological dimensions you want to project speakers onto.
- **`ideology_axes.json`** — *Output* of training. Contains the same axes plus precomputed
  embedding vectors. Empty (`[]`) until you run training. The API reads this file at runtime
  via the `IDEOLOGY_AXES_PATH` environment variable.

## Training the axes

The mapper uses `sentence-transformers` (`all-MiniLM-L6-v2` by default) to encode the
positive/negative examples and compute one vector per axis. Run:

```bash
python -m src.models.ideology_mapper \
  --train \
  --data configs/ideology_axes_training.json \
  --output configs/ideology_axes.json
```

Or use the bundled pipeline script which trains every model the nexus needs:

```bash
bash scripts/train_models.sh
```

Set the env var so the API picks up the trained file:

```bash
export IDEOLOGY_AXES_PATH=configs/ideology_axes.json
```

## Adding a new axis

1. Append a new object to `axes` in `ideology_axes_training.json`:
   ```json
   {
     "name": "your_axis",
     "positive_examples": ["statement endorsing the axis", "..."],
     "negative_examples": ["statement opposing the axis", "..."]
   }
   ```
2. Re-run training. Aim for **3–10 examples per side** — fewer than 3 is noisy, more than 10
   shows diminishing returns at the embedding-mean step.
3. Restart the API so it reloads the file.

## Other config

The nexus also reads the following environment variables (see `.env.example`):

- `OVERTON_DATA_PATH` — JSON file for the Overton tracker timeline. Required for
  `GET /overton/track/{topic}` to return data instead of 404.
- `ANTHROPIC_API_KEY` — required for `POST /reconciliation/generate`.
- `OPENAI_API_KEY` — reserved for future endpoints; not currently called by the nexus.
