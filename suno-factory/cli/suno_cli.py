#!/usr/bin/env python3
"""
SunoForge CLI
Batch process text files into Suno-ready JSON packages.
"""

import argparse
import json
import time
from pathlib import Path

import requests
from rich.console import Console
from rich.progress import track

console = Console()
API_URL = "http://localhost:8000/api/v1/process"


def process_file(file_path: Path, output_dir: Path, instructions: str | None = None) -> None:
    console.print(f"[blue]Processing {file_path.name}...[/blue]")

    with open(file_path, "rb") as handle:
        files = {"file": (file_path.name, handle, "application/octet-stream")}
        data = {"instructions": instructions} if instructions else {}

        try:
            start_time = time.time()
            response = requests.post(API_URL, files=files, data=data, timeout=120)
            response.raise_for_status()
            package = response.json()
            duration = time.time() - start_time

            safe_title = "".join(
                [c for c in package["metadata"]["title"] if c.isalnum() or c in (" ", "-", "_")]
            ).strip().replace(" ", "_")
            output_file = output_dir / f"{safe_title}_suno.json"

            with open(output_file, "w", encoding="utf-8") as out:
                json.dump(package, out, indent=2)

            console.print(
                f"[green]✓ Success ({duration:.2f}s)[/green]: Saved to {output_file.name}"
            )

        except requests.exceptions.ConnectionError:
            console.print("[red]✗ Error:[/red] Could not connect to backend. Is it running?")
            raise SystemExit(1)
        except Exception as exc:
            console.print(f"[red]✗ Failed:[/red] {exc}")


def main() -> None:
    parser = argparse.ArgumentParser(description="SunoForge CLI - Text to Song Package")
    parser.add_argument("input", help="Input file or directory")
    parser.add_argument("-o", "--output", default="./output", help="Output directory")
    parser.add_argument("-i", "--instructions", help="Custom instructions for the AI")

    args = parser.parse_args()

    input_path = Path(args.input)
    output_path = Path(args.output)
    output_path.mkdir(parents=True, exist_ok=True)

    if input_path.is_file():
        process_file(input_path, output_path, args.instructions)
    elif input_path.is_dir():
        files = list(input_path.glob("*.txt")) + list(input_path.glob("*.pdf")) + list(
            input_path.glob("*.docx")
        )
        if not files:
            console.print("[yellow]No supported files found in directory.[/yellow]")
            return

        for file in track(files, description="Processing batch..."):
            process_file(file, output_path, args.instructions)
    else:
        console.print(f"[red]Error:[/red] Invalid input path {input_path}")


if __name__ == "__main__":
    main()
