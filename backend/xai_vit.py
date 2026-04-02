"""
Grad-CAM saliency overlay for the Hugging Face ViT (explainability / thesis XAI section).
"""
from __future__ import annotations

import base64
import io
from functools import partial
from typing import Any

import numpy as np
import torch
import torch.nn as nn
from PIL import Image


def _reshape_transform_vit(tensor: torch.Tensor, height: int, width: int) -> torch.Tensor:
    # Drop CLS token, grid patches to spatial map (B, C, H, W)
    result = tensor[:, 1:, :].reshape(tensor.size(0), height, width, tensor.size(2))
    return result.transpose(2, 3).transpose(1, 2)


class _ViTLogitsWrapper(nn.Module):
    """
    pytorch-grad-cam iterates `model(input)` when building the loss; HF returns a
    ModelOutput that iterates to string keys ('logits', ...), which breaks
    ClassifierOutputTarget (str has no attribute 'shape'). This wrapper returns logits only.
    """

    def __init__(self, vit_model: nn.Module):
        super().__init__()
        self.vit = vit_model

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.vit(pixel_values=x).logits


def _to_2d_cam(arr: Any) -> np.ndarray:
    a = arr.detach().cpu().numpy() if torch.is_tensor(arr) else np.asarray(arr, dtype=np.float32)
    a = np.squeeze(a).astype(np.float32)
    if a.ndim != 2:
        raise ValueError(f"Expected 2D CAM, got shape {a.shape}")
    return a


def gradcam_overlay_base64(hf_pipe: Any, image_bytes: bytes) -> dict[str, Any]:
    from pytorch_grad_cam import GradCAM
    from pytorch_grad_cam.utils.image import show_cam_on_image
    from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget

    inner = hf_pipe.model
    processor = hf_pipe.image_processor
    inner.eval()
    device = next(inner.parameters()).device

    pil = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    inputs = processor(images=pil, return_tensors="pt")
    input_tensor = inputs["pixel_values"].to(device)

    _, _, h, w = input_tensor.shape
    side = int(h)
    patch = int(getattr(inner.config, "patch_size", 16))
    grid = max(side // patch, 1)

    if not hasattr(inner, "vit"):
        raise RuntimeError("Expected ViTForImageClassification (model.vit missing).")

    wrapped = _ViTLogitsWrapper(inner).to(device)
    wrapped.eval()

    last_block = inner.vit.encoder.layer[-1]
    target_layer = getattr(last_block, "layernorm_before", last_block)
    target_layers = [target_layer]
    cam = GradCAM(
        model=wrapped,
        target_layers=target_layers,
        reshape_transform=partial(_reshape_transform_vit, height=grid, width=grid),
    )

    with torch.enable_grad():
        logits = wrapped(input_tensor)
        pred_idx = int(logits.argmax(dim=1).item())
        targets = [ClassifierOutputTarget(pred_idx)]
        grayscale_cam = cam(input_tensor=input_tensor, targets=targets)
        grayscale_cam = _to_2d_cam(grayscale_cam[0])

    pil_resized = pil.resize((side, side), Image.Resampling.BILINEAR)
    rgb = np.asarray(pil_resized).astype(np.float32) / 255.0
    visualization = show_cam_on_image(rgb, grayscale_cam, use_rgb=True)
    vis_pil = Image.fromarray(visualization)
    buf = io.BytesIO()
    vis_pil.save(buf, format="PNG")
    b64 = base64.standard_b64encode(buf.getvalue()).decode("ascii")

    id2label = getattr(inner.config, "id2label", {}) or {}
    label = id2label.get(pred_idx) or id2label.get(str(pred_idx)) or str(pred_idx)

    return {
        "overlay_base64": b64,
        "predicted_class_index": pred_idx,
        "predicted_label": label,
    }
