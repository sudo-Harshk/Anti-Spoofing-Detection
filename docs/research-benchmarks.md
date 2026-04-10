# Research Benchmarks & Metrics

## Overview

This document contains the research-oriented benchmarking capabilities and academic evaluation metrics for the Axon Anti-Spoofing Detection Platform.

## Benchmark CLI

The system includes a comprehensive benchmarking tool for academic evaluation using standard anti-spoofing metrics.

### Usage

From the `backend/` directory, with images organized in local folders:

```bash
# Consensus mode evaluation
python benchmark.py --live-dir ../datasets/live --spoof-dir ../datasets/spoof --mode consensus

# Individual model evaluation
python benchmark.py --live-dir ../datasets/live --spoof-dir ../datasets/spoof --mode vit_only
python benchmark.py --live-dir ../datasets/live --spoof-dir ../datasets/spoof --mode yolo_only

# Export results to CSV
python benchmark.py --live-dir ../datasets/live --spoof-dir ../datasets/spoof --mode yolo_only --out-csv ../results_ablation.csv
```

## Evaluation Metrics

### Primary Metrics

#### APCER (Attack Presentation Classification Error Rate)
- **Definition**: False negative rate for spoof attacks
- **Formula**: `APCER = (False Spoof) / (Total Spoof)`
- **Lower is better**: Indicates ability to detect attacks

#### BPCER (Bona Fide Presentation Classification Error Rate)  
- **Definition**: False positive rate for real faces
- **Formula**: `BPCER = (False Real) / (Total Real)`
- **Lower is better**: Indicates user experience impact

#### ACER (Average Classification Error Rate)
- **Definition**: Average of APCER and BPCER
- **Formula**: `ACER = (APCER + BPCER) / 2`
- **Lower is better**: Overall system performance

### Secondary Metrics

#### Inconclusive Rate
- **Definition**: Percentage of samples with no definitive verdict
- **Cause**: YOLO detection failures or confidence thresholds
- **Not included** in primary metric denominators

#### Error Rate
- **Definition**: Percentage of API or processing failures
- **Cause**: Network issues, model loading errors
- **Not included** in primary metric denominators

## Dataset Organization

### Required Structure
```
datasets/
  live/
    real_face_1.jpg
    real_face_2.jpg
    ...
  spoof/
    printed_photo_1.jpg
    replay_attack_1.jpg
    3d_mask_1.jpg
    deepfake_1.jpg
    ...
```

### Supported Attack Types
- **Printed Photos**: High-quality printed facial images
- **Replay Attacks**: Video replay on digital screens
- **3D Masks**: Physical mask presentations
- **Digital Deepfakes**: AI-generated synthetic faces

## Model Performance Analysis

### Consensus Mode Advantages
- **Higher accuracy**: Dual-model verification
- **Reduced false positives**: Cross-validation between models
- **Explainability**: Grad-CAM insights for verification

### Individual Model Characteristics
- **ViT Strengths**: 
  - Superior deepfake detection
  - Detailed texture analysis
  - Explainable reasoning
- **YOLO Strengths**:
  - Fast processing
  - Excellent for obvious attacks
  - Lower computational requirements

## Ablation Studies

The benchmark tool supports systematic ablation studies:

### Mode Comparison
```bash
# Run all modes for comparison
python benchmark.py --live-dir ../datasets/live --spoof-dir ../datasets/spoof --mode consensus --out-csv consensus_results.csv
python benchmark.py --live-dir ../datasets/live --spoof-dir ../datasets/spoof --mode vit_only --out-csv vit_results.csv  
python benchmark.py --live-dir ../datasets/live --spoof-dir ../datasets/spoof --mode yolo_only --out-csv yolo_results.csv
```

### Threshold Analysis
- **Confidence Thresholds**: Adjustable sensitivity levels
- **Impact Trade-offs**: Security vs. user experience
- **Optimization**: Find optimal operating points

## Research Applications

### Thesis Evaluation
- **Standard Metrics**: APCER/BPCER/ACER for academic papers
- **Comparative Studies**: Model performance analysis
- **Ablation Results**: Component contribution analysis

### System Validation
- **Performance Baselines**: Establish capability standards
- **Regression Testing**: Ensure model updates don't degrade performance
- **Production Monitoring**: Track real-world performance

## Results Interpretation

### Performance Targets
- **APCER**: <5% for production deployment
- **BPCER**: <2% for acceptable user experience  
- **ACER**: <3.5% for overall system quality

### Error Analysis
- **High APCER**: Indicates attack detection weaknesses
- **High BPCER**: Suggests overly strict thresholds
- **High Inconclusive**: May indicate confidence calibration issues

## Advanced Features

### Statistical Analysis
- **Confidence Intervals**: Statistical significance testing
- **Cross-validation**: Robust performance estimation
- **Bootstrapping**: Uncertainty quantification

### Visualization Support
- **ROC Curves**: Threshold optimization
- **Confusion Matrices**: Detailed error analysis
- **Performance Trends**: Long-term monitoring

## Integration with Research Workflows

### Continuous Evaluation
- **Automated Testing**: CI/CD pipeline integration
- **Performance Tracking**: Historical comparison
- **Model Registry**: Version-controlled evaluation

### Publication Support
- **Reproducible Results**: Standardized evaluation protocol
- **Comparative Studies**: Baseline establishment
- **Method Validation**: Rigorous performance assessment
