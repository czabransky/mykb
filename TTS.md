# Generating TTS

## Option A: Single Speaker (No Diarization)

Using my own discord bot, generate TTS through OpenAI's TTS models. This produces a .mp3 file which can be saved as a static asset and played directly.

## Option B: Multiple Speakers

Requirements:
- An audio file, possibly using [ElevenLabs Text-To-Dialogue API](https://elevenlabs.io/docs/overview/capabilities/text-to-dialogue) ($11/month)
    - `pip install elevenlabs`
    - provide api_key and voice_id
- WhisperX (`pip install whisperx`, which also installs pyannote-audio)
- Diarization model uses [Hugging Face](https://huggingface.co/), which requires a subscription ($9/month)


Run `whisperx my-audio.mp3 --model large-v2 --language zh`, include `--hf-token` for diarization.

### Troubleshooting

WhisperX supports proccessing on the GPU, so check if CUDA is enabled:

`python -c "import torch; print(torch.cuda.is_available())"`

#### float16 Compute Type Error

If you get: `ValueError: Requested float16 compute type, but the target device or backend do not support efficient float16 computation.`

Add the `--compute_type` flag:

```bash
# For CPU
whisperx audio.mp3 --model large-v2 --language zh --compute_type int8

# Or use float32 (slower but compatible)
whisperx audio.mp3 --model large-v2 --language zh --compute_type float32
```

#### Compute Type Options

| Type | Device | Speed | Notes |
|------|--------|-------|-------|
| `float16` | GPU (CUDA) | Fastest | Requires modern NVIDIA GPU |
| `int8` | CPU/GPU | Fast | Best for CPU, good accuracy |
| `float32` | CPU/GPU | Slowest | Most compatible |

#### Reinstall PyTorch with CUDA

If CUDA check returns False but you have an NVIDIA GPU:

```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

#### Recommended Command (CPU)

```bash
whisperx audio.mp3 --model medium --language zh --compute_type int8 --word_timestamps True
```

Using `medium` instead of `large-v2` is faster while still giving good results for Chinese.