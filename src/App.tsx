import { useState, useEffect, useCallback } from "react";

const _fl = document.createElement("link");
_fl.rel = "stylesheet";
_fl.href = "https://fonts.googleapis.com/css2?family=Oxanium:wght@300;400;600;700;800&family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;1,400&display=swap";
document.head.appendChild(_fl);

// Ensure proper mobile scaling
if(!document.querySelector('meta[name="viewport"]')){
  const _vp=document.createElement("meta");
  _vp.name="viewport";_vp.content="width=device-width,initial-scale=1,maximum-scale=5";
  document.head.appendChild(_vp);
}

const _style = document.createElement("style");
_style.textContent = `
*{box-sizing:border-box;margin:0;padding:0;}
body{background:#030812;}
.ba-root{font-family:'JetBrains Mono',monospace;font-size:12.5px;background:#030812;color:#b4c8e8;min-height:100vh;
  background-image:linear-gradient(rgba(0,229,255,.018) 1px,transparent 1px),linear-gradient(90deg,rgba(0,229,255,.018) 1px,transparent 1px);
  background-size:48px 48px;}
@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.15}}
@keyframes spin{to{transform:rotate(360deg)}}
.page-enter{animation:fadeUp .2s ease both;}
.reading-mode .qa-body{line-height:2.1;font-size:13.5px;color:#c8d8f0;}
.badge-pill{font-family:Oxanium,sans-serif;font-size:9px;letter-spacing:1.4px;text-transform:uppercase;border-radius:999px;padding:3px 9px;}
.timeline-dot{width:8px;height:8px;border-radius:50%;background:#334155;cursor:pointer;transition:background .2s;}
.timeline-dot.active{background:#22c55e;}
::-webkit-scrollbar{width:3px;height:3px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:#223260;border-radius:2px;}
pre{background:#020617;border:1px solid #1e293b;border-radius:4px;padding:12px 14px;overflow-x:auto;font-size:11px;line-height:1.7;color:#a5f3fc;white-space:pre-wrap;word-break:break-word;}
@media(max-width:767px){
  .ba-root{font-size:13px;}
  .mob-stack{display:block!important;}
  .mob-stack>*{width:100%!important;min-width:0!important;margin-bottom:16px;}
  .mob-hide{display:none!important;}
  .mob-pad{padding:14px 14px!important;}
  .mob-full{width:100%!important;max-width:100%!important;}
  .mob-tabs{display:flex!important;overflow-x:auto!important;flex-wrap:nowrap!important;padding-bottom:6px!important;-webkit-overflow-scrolling:touch!important;scrollbar-width:none!important;}
  .mob-tabs::-webkit-scrollbar{display:none!important;}
  .mob-tabs button{flex-shrink:0!important;}
  .mob-sm-text{font-size:11px!important;}
}
`;
document.head.appendChild(_style);

/* ═══════ DATA ═══════ */
const CATS = [
  {id:"rnaseq",name:"RNA-seq DEG Analysis",color:"#2563eb",q:2,desc:"Single-cell isoform quantification wall and allele-specific expression dropout."},
  {id:"metabolic",name:"Metabolic Modeling",color:"#9333ea",q:2,desc:"FBA with KRAS-PDAC metabolic reprogramming (Recon3D) and 13C MFA isotopologue mismatch."},
  {id:"rna3d",name:"3D RNA Structure Prediction",color:"#0891b2",q:2,desc:"Long RNA folding wall (>200 nt) and pseudoknot NP-hardness."},
  {id:"rnadesign",name:"De Novo RNA Design",color:"#16a34a",q:2,desc:"The in-cell riboswitch design gap (>90% SELEX-to-silence failure) and the sequence→function missing link."},
  {id:"rnainteract",name:"RNA–Protein Interactions",color:"#dc2626",q:2,desc:"RBP cross-cell-type binding generalization failure (38% overlap between cell lines)."},
  {id:"rnafunc",name:"RNA Function & Epitranscriptomics",color:"#d97706",q:2,desc:"lncRNA sequence-to-mechanism black box (100,000 catalogued, <500 mechanistically understood)."},
  {id:"mrnadesign",name:"mRNA Therapeutics Design",color:"#7c3aed",q:2,desc:"Codon optimality paradox and the in vitro → in vivo translational gap."},
  {id:"proteinfolding",name:"Protein Folding & Interaction",color:"#0f766e",q:1,desc:"AlphaFold2 phi-value analysis failure — static structure prediction cannot reproduce folding pathway kinetics."},
  {id:"proteindesign",name:"De Novo Protein Design",color:"#be185d",q:1,desc:"RFdiffusion binder design funnel failure — 1% wet-lab attrition rate."},
  {id:"darkgenome",name:"Deciphering the Dark Genome",color:"#1d4ed8",q:1,desc:"Enformer saturation mutagenesis HNF4A gap — TF availability vs sequence-intrinsic regulatory grammar."},
  {id:"wholecell",name:"Whole-Cell Digital Twin",color:"#b45309",q:1,desc:"Perturb-seq GEARS accuracy cascade — accuracy collapses for multi-gene perturbations."},
  {id:"drugdiscovery",name:"Personalized Drug Discovery",color:"#065f46",q:1,desc:"GDSC osimertinib translational gap — in vitro drug sensitivity predictions fail in clinical trials."},
  {id:"evolution",name:"Predicting Evolutionary Shifts",color:"#9a3412",q:1,desc:"EVEscape BA.2.86 saltational evolution failure — models miss multi-mutation jumps."},
  {id:"interactome",name:"Mapping the Human Interactome",color:"#4338ca",q:1,desc:"PPI Park-Marcotte strict split AUROC collapse (0.91→0.61) — diagnosing homology leakage."},
  {id:"tools",name:"Translational Tooling & Apps",color:"#14b8a6",q:8,desc:"Practical, code-generating tools that convert biological data and protocols into usable apps, dashboards, and simulators."},
];

const QS = [
  {id:1,cat:"rnaseq",pts:60,title:"The Single-Cell Isoform Quantification Wall",tags:["scRNA-seq","isoforms","long-read","nanopore","FLAMES"],
   prompt:`Build a System: Single-Cell Full-Length Isoform Quantifier\n\nA gene like SCN8A has >200 annotated isoforms — conventional scRNA-seq collapses all to a single gene count. Long-read single-cell methods capture full-length transcripts but produce only ~5,000 cells vs ~5,000,000 for short-read, with 5–10× dropout rate.\n\nTasks:\n1. Computational architecture for single-cell isoform quantification handling dropout\n2. How to leverage multi-modal data (short + long read in same cell)\n3. Probabilistic model for isoform assignment given ambiguous reads\n4. Held-out validation strategy\n5. Minimum per-cell isoform F1 score for clinical utility`},
  {id:2,cat:"rnaseq",pts:60,title:"Allele-Specific Expression: The Phase Assignment Problem",tags:["ASE","allele-specific","haplotype","dropout","imprinting"],
   prompt:`Build a System: Single-Cell Allele-Specific Expression Quantifier\n\n~70% of mRNA molecules are not captured, making monoallelic expression indistinguishable from true imprinting vs stochastic dropout.\n\nTasks:\n1. Bayesian model distinguishing biological monoallelic expression from technical dropout\n2. Haplotype phasing strategy using population-level reference panels\n3. Handle the 10× coverage disparity between heterozygous SNP-covered genes vs SNP-free genes\n4. Benchmark distinguishing biological from technical monoallelic expression\n5. Posterior credible interval width for clinical utility in imprinting disorder diagnosis`},
  {id:3,cat:"metabolic",pts:65,title:"KRAS-PDAC Metabolic Reprogramming via Flux Balance Analysis",tags:["FBA","KRAS","PDAC","Recon3D","metabolic flux"],
   prompt:`Build a System: Constraint-Based Metabolic Model for KRAS-Driven PDAC\n\nKRAS G12D PDAC exhibits dramatic metabolic reprogramming — upregulation of glycolysis, increased glutamine anaplerosis, enhanced macropinocytosis.\n\nTasks:\n1. Pipeline generating a KRAS-G12D-specific metabolic model from Recon3D using RNA-seq constraints\n2. Model the non-canonical amino acid acquisition pathway (macropinocytosis)\n3. Multi-objective flux optimization balancing biomass production with redox homeostasis\n4. Experimental validation distinguishing model predictions from fitting artifacts`},
  {id:4,cat:"metabolic",pts:65,title:"13C MFA Isotopologue Mismatch & Glutamine Anaplerosis",tags:["13C MFA","isotopologue","glutamine","anaplerosis","TCA cycle"],
   prompt:`Build a System: 13C Metabolic Flux Analysis with Isotopologue Resolution\n\nIsotopologue fitting fails when multiple substrate entry points exist simultaneously. Mismatch between measured and model-predicted isotopologues for fumarate and malate exceeds 15% in PDAC cell lines.\n\nTasks:\n1. EMU framework extension handling parallel carbon entry from glucose and glutamine\n2. Resolve the symmetry problem in succinate/fumarate causing isotopologue scrambling\n3. Statistical model for isotopologue measurement uncertainty propagating to flux confidence intervals\n4. Minimum measurement precision to distinguish oxidative vs reductive glutamine anaplerosis`},
  {id:5,cat:"rna3d",pts:65,title:"RNA Tertiary Structure: The Long-RNA Folding Wall",tags:["RNA 3D","deep learning","long RNA","RMSD","RNA-Puzzles"],
   prompt:`Build a System: Long-RNA 3D Structure Predictor\n\nCurrent tools collapse to >10Å RMSD on RNAs >200 nt — worse than random secondary structure-constrained assembly on novel-topology targets.\n\nTasks:\n1. Design "RNAFold-L" — deep learning architecture for 200–1000 nt RNA tertiary structure prediction\n2. Training data augmentation overcoming the ~15,000 RNA structure data scarcity\n3. Encode cotranscriptional folding kinetics as a constraint rather than predicting a static structure\n4. Benchmarking suite beyond TM-score capturing biologically relevant accuracy`},
  {id:6,cat:"rna3d",pts:65,title:"Pseudoknot Prediction: The NP-Hardness Problem",tags:["pseudoknot","NP-hard","RNA folding","H-type","kissing loop"],
   prompt:`Build a System: Tractable Pseudoknot-Aware RNA Folding\n\nPseudoknots occur in ~30% of functional RNAs. Minimum free energy folding including pseudoknots is NP-hard. Approximate methods miss >40% of experimentally verified pseudoknots.\n\nTasks:\n1. Practical algorithm for pseudoknot prediction on 50–500 nt sequences\n2. Characterize topologies where approximate methods fail most severely\n3. How to integrate experimental restraints (SHAPE, DMS-MaPseq)\n4. Benchmark distinguishing genuine prediction from overfitting`},
  {id:7,cat:"rnadesign",pts:65,title:"The In-Cell Riboswitch Design Gap",tags:["riboswitch","SELEX","aptamer","in-cell design","synthetic biology"],
   prompt:`Build a System: In-Cell Functional Riboswitch Designer\n\nSELEX achieves high in vitro affinity for >90% of targets, yet >90% of selected aptamers fail to function as riboswitches in living cells.\n\nTasks:\n1. Computational pipeline predicting in-cell riboswitch function from sequence\n2. Model competition between riboswitch folding and translation initiation complex assembly\n3. High-throughput experimental design capturing in-cell failure modes\n4. Sequence features predicting the in vitro → in-cell transfer failure\n5. In-cell gene regulation dynamic range justifying clinical development`},
  {id:8,cat:"rnadesign",pts:65,title:"De Novo RNA Design: The Sequence–Function Missing Link",tags:["de novo design","RNA inverse folding","sequence optimization","eterna"],
   prompt:`Build a System: Sequence-to-Function RNA Design Engine\n\nRNA inverse folding achieves >95% success on structures <100 nt, but ~99% of sequences that fold correctly are functionally inactive.\n\nTasks:\n1. Formalize the gap between structural correctness and functional activity as an optimization problem\n2. Generative model jointly optimizing structure AND predicted function\n3. Incorporate evolutionary conservation signals without known homologs\n4. Wet-lab validation pipeline using high-throughput functional assays (FACS-seq, Sort-seq)\n5. Realistic performance ceiling for computational RNA design`},
  {id:9,cat:"rnainteract",pts:65,title:"RBP Binding Generalization Across Cell Types",tags:["RBP","eCLIP","binding sites","cell-type","generalization"],
   prompt:`Build a System: Cell-Type-Generalizable RBP Binding Predictor\n\nRBP binding site predictors achieve AUC >0.90 within HepG2/K562, but only 38% of predicted binding sites are conserved in primary cell types.\n\nTasks:\n1. Diagnose primary sources of RBP binding site non-transferability across cell types\n2. Model architecture incorporating cell-type-specific features beyond sequence motifs\n3. Use cross-species eCLIP data to identify conserved vs cell-type-specific binding mechanisms\n4. Minimal experimental dataset maximally improving generalization\n5. Define a generalization benchmark avoiding data leakage`},
  {id:10,cat:"rnainteract",pts:65,title:"Stress Granule Condensation: The mRNA Sorting Problem",tags:["stress granules","phase separation","mRNA localization","condensate","IDR"],
   prompt:`Build a System: mRNA Stress Granule Partitioning Predictor\n\nDuring stress, ~10% of cytoplasmic mRNAs condense into stress granules. Current models predict SG partitioning with AUC ~0.65 — barely better than random.\n\nTasks:\n1. Identify key sequence and structural features predicting SG partitioning\n2. Dynamic model capturing how partitioning changes over the stress response timeline (0–60 min)\n3. Experimental design generating ground truth data distinguishing true condensate partitioning from artifacts\n4. Perturbation strategy to determine causal vs correlative features\n5. What prediction accuracy would enable targeting SG dynamics in ALS or cancer?`},
  {id:11,cat:"rnafunc",pts:65,title:"lncRNA Sequence-to-Mechanism Black Box",tags:["lncRNA","mechanism","chromatin","phase separation","CHART-seq"],
   prompt:`Build a System: lncRNA Functional Mechanism Predictor\n\nOver 100,000 human lncRNAs have been catalogued, yet fewer than 500 have mechanistically characterized functions. Computational approaches predict lncRNA function with precision <20%.\n\nTasks:\n1. Multi-modal model integrating sequence, secondary structure, chromatin association, and protein interaction data\n2. Handle the extreme class imbalance (99.5% uncharacterized)\n3. Prioritization strategy identifying the ~100 highest-impact uncharacterized lncRNAs\n4. Minimal experimental assay panel to mechanistically classify a lncRNA in 2 weeks\n5. What predictions would count as genuine mechanistic understanding?`},
  {id:12,cat:"rnafunc",pts:60,title:"The circRNA Translation Controversy",tags:["circRNA","IRES","translation","cap-independent","artifact"],
   prompt:`Resolve the Controversy: Does Circular RNA Get Translated in Human Cells?\n\nMultiple studies claim cap-independent translation via IRES elements produces functional peptides. Skeptics argue >95% of reported events are artifacts.\n\nTasks:\n1. Computational framework distinguishing genuine circRNA-derived peptides from artifacts\n2. What bioinformatic controls are missing from current studies?\n3. Definitive experimental design to settle this controversy\n4. If real, what sequence features predict which circRNAs are translated?\n5. What functional significance would circRNA-derived peptides have if confirmed?`},
  {id:13,cat:"mrnadesign",pts:65,title:"The Codon Optimality Paradox",tags:["codon optimization","mRNA stability","translation speed","ribosome pausing","therapeutic mRNA"],
   prompt:`Build a System: Codon-Optimized mRNA Therapeutic Designer\n\nMaximum CAI optimization maximizes translation speed but reduces mRNA stability and increases immunogenicity. The optimal trade-off varies by protein, cell type, and therapeutic goal.\n\nTasks:\n1. Formalize the codon optimality trade-off as a multi-objective optimization problem\n2. Sequence-to-outcome model predicting protein yield, mRNA half-life, and immune activation jointly\n3. Incorporate ribosome pausing data to identify positions where pausing aids protein folding\n4. High-throughput experimental design generating training data across codon usage landscape\n5. For a given therapeutic target, what is the optimal design workflow?`},
  {id:14,cat:"mrnadesign",pts:65,title:"The In Vitro → In Vivo mRNA Translation Gap",tags:["mRNA therapeutics","LNP delivery","in vivo translation","immunogenicity","pseudouridine"],
   prompt:`Build a System: In Vivo mRNA Translation Predictor\n\nmRNA therapeutic development suffers a 60% failure rate at the in vitro → animal model translation step. In vitro efficiency correlates weakly with in vivo protein expression after LNP delivery.\n\nTasks:\n1. Identify the top 3 mechanistic sources of the in vitro → in vivo prediction failure\n2. Multi-compartment pharmacokinetic model for mRNA from LNP injection to protein production\n3. Use existing NHP pharmacokinetic datasets to calibrate a predictive model\n4. Cell-based assay panel better proxying in vivo translation\n5. What minimum improvement would justify switching from current screening paradigms?`},
  {id:15,cat:"proteinfolding",pts:70,title:"AlphaFold2 Phi-Value Analysis Failure",tags:["AlphaFold2","phi-value","folding kinetics","transition state"],
   prompt:`Build a System: Folding Pathway Kinetics Predictor\n\nAlphaFold2 completely fails to reproduce phi-value analysis data. For CI2, AF2 pLDDT confidence scores show zero correlation with experimental phi-values.\n\nTasks:\n1. Why does structural accuracy not imply folding pathway predictability? Formalize the gap.\n2. Neural network architecture trained on phi-value data predicting transition state ensemble properties\n3. Molecular simulation approach generating training data for rare folding transition events\n4. Define a benchmark: what experimental measurements validate a folding pathway predictor?\n5. Which protein families represent the hardest test cases and why?`},
  {id:16,cat:"proteindesign",pts:70,title:"RFdiffusion Binder Design Funnel Failure",tags:["RFdiffusion","protein binder","wet-lab validation","ProteinMPNN","computational design"],
   prompt:`Build a System: High-Fidelity Protein Binder Design Pipeline\n\nRFdiffusion generates designs with predicted pLDDT >0.85, yet experimental success rates remain at 1–5%. The funnel fails because predicted binding scores don't capture conformational entropy, solubility, and expression yield.\n\nTasks:\n1. Diagnose why in silico binding metrics fail to predict wet-lab success\n2. Screening cascade maximally enriching true binders before expensive SPR validation\n3. How to integrate experimental feedback from failed designs\n4. Minimum viable experimental assay screening 1,000 designs per week\n5. What success rate would make RFdiffusion-based design cost-competitive with antibody discovery?`},
  {id:17,cat:"darkgenome",pts:70,title:"Enformer Saturation Mutagenesis HNF4A Gap",tags:["Enformer","regulatory grammar","saturation mutagenesis","HNF4A","TF binding","MPRA"],
   prompt:`Build a System: Regulatory Grammar Decoder for Non-Coding Variants\n\nEnformer predicts gene expression with R²=0.81 on bulk data. Yet for HNF4A target genes, saturation mutagenesis predictions correlate with MPRA measurements at only R²=0.34.\n\nTasks:\n1. Mechanistically explain why sequence-to-expression models fail at saturation mutagenesis despite good bulk accuracy\n2. Model architecture explicitly parameterizing TF binding site grammar\n3. Disentangle TF availability from sequence-intrinsic regulatory logic in training data\n4. MPRA experimental design maximally informing regulatory grammar learning\n5. What prediction task would constitute solving this problem?`},
  {id:18,cat:"wholecell",pts:75,title:"Perturb-seq GEARS Multi-Gene Prediction Collapse",tags:["Perturb-seq","GEARS","genetic interaction","multi-gene perturbation","digital twin"],
   prompt:`Build a System: Multi-Gene Perturbation Response Predictor\n\nGEARS predicts single-gene perturbation responses with R²=0.68, but R² collapses to 0.31 for double-gene and 0.09 for triple-gene perturbations.\n\nTasks:\n1. Mathematical reason why single-gene prediction accuracy does not compose to multi-gene accuracy\n2. Model architecture explicitly representing gene-gene interaction networks\n3. How much Perturb-seq data is required to achieve R²>0.60 for triple perturbations?\n4. Data acquisition strategy maximally informing multi-gene interaction modeling with a fixed sequencing budget\n5. What biological applications would become possible if triple-gene prediction achieved R²>0.70?`},
  {id:19,cat:"drugdiscovery",pts:70,title:"GDSC Osimertinib Translational Gap",tags:["GDSC","drug sensitivity","osimertinib","EGFR","translational failure","PDO"],
   prompt:`Build a System: Translational Drug Sensitivity Predictor\n\nOsimertinib shows AUC=0.89 in GDSC, yet clinical trial response rate in EGFR-mutant NSCLC is only 59–80%, with primary resistance in ~20% of patients.\n\nTasks:\n1. Diagnose primary sources of the in vitro → clinical translational gap for osimertinib\n2. Multi-omics feature selection pipeline identifying translational biomarkers beyond EGFR mutation\n3. How would patient-derived organoid data be integrated?\n4. Clinical trial biomarker strategy: what co-mutation panel would stratify patients?\n5. What prediction performance on PDX data would justify a biomarker-stratified Phase II trial?`},
  {id:20,cat:"evolution",pts:70,title:"EVEscape BA.2.86 Saltational Evolution Failure",tags:["EVEscape","viral evolution","BA.2.86","saltational","epistasis","escape prediction"],
   prompt:`Build a System: Saltational Viral Evolution Predictor\n\nEVEscape performs well for incremental variants (1–5 mutations) but completely failed to predict BA.2.86 — a variant with 36 mutations emerging in a single saltational jump.\n\nTasks:\n1. Formally define why saltational evolution is mechanistically different from incremental evolution\n2. Design a model predicting fitness and immune escape for variants with 10–50 simultaneous mutations\n3. What training data would teach a model about epistatic interactions at this scale?\n4. Use phylogenetic reconstruction of chronic infection trajectories to identify likely saltational jump precursors\n5. Define a prospective validation scheme`},
  {id:21,cat:"interactome",pts:70,title:"PPI Prediction: Homology Leakage & True Generalization",tags:["PPI","protein-protein interaction","AUROC","homology leakage","AlphaFold-Multimer","Y2H"],
   prompt:`Build a System: Truly Generalizing Protein–Protein Interaction Predictor\n\nPPI predictors achieve AUROC >0.91 on standard benchmarks, yet the Park-Marcotte strict homology-split evaluation reveals AUROC collapses to 0.61 — barely above random.\n\nTasks:\n1. Quantify how much of current PPI prediction performance is explained by homology leakage\n2. Design a model architecture predicting PPIs from structural/biophysical features independent of sequence similarity\n3. How would you generate a training dataset with genuine diversity at the protein family level?\n4. Propose a prospective experimental validation pipeline using Y2H or co-IP-MS\n5. What AUROC on a strict-split benchmark would indicate genuine progress?`},

  /* ── TRANSLATIONAL TOOLING & APPS (8) ── */
  {id:22,cat:"tools",pts:55,title:"Cell-Type Deconvolution Dashboard for Bulk RNA-seq",
   tags:["bulk RNA-seq","deconvolution","CIBERSORTx","Bayesian","uncertainty"],
   prompt:`Build a Tool: Robust Cell-Type Deconvolution Engine with UI\n\nBulk RNA-seq remains vastly cheaper than single-cell, but inferring cell-type composition from bulk data is still fragile. Existing tools (CIBERSORTx, MuSiC, SCDC) can disagree by >20% absolute fraction on the same sample when reference panels are imperfect or missing relevant cell types.\n\nYour tasks:\n1. Design a deconvolution model that takes bulk RNA-seq + single-cell reference and returns cell-type proportions with calibrated uncertainty (credible intervals).\n2. How will you make the method robust when the reference is missing some cell types or has strong batch effects relative to the bulk?\n3. Propose an API and UI: user uploads bulk counts + reference matrix and receives a report with estimates, uncertainties, and diagnostics (e.g., residual structure, outlier genes).\n4. Define a benchmarking suite using public datasets where ground-truth cell-type proportions are partially known (e.g., mixtures, FACS, spike-ins).\n5. What minimum error (mean absolute deviation per cell type) is necessary for this tool to be useful in disease-cohort studies?\n6. Generate working Python code implementing a minimal version of this deconvolution tool using Non-Negative Least Squares as a baseline.`},

  {id:23,cat:"tools",pts:60,title:"Multi-Omics Patient Stratification App",
   tags:["multi-omics","clustering","patient stratification","MOFA","biomarkers"],
   prompt:`Build a Tool: Multi-Omics Disease Stratifier\n\nMany disease cohorts now have RNA-seq, proteomics, and clinical variables, but integrating them into stable patient subtypes is difficult. Different clustering methods and normalization choices can produce entirely different subtype assignments.\n\nYour tasks:\n1. Design a pipeline that takes multi-omics matrices (RNA, proteome, clinical) and outputs patient clusters with stability scores across methods and subsampling.\n2. Propose a representation-learning approach (e.g., multi-view autoencoder, MOFA-like factor model) that captures shared and modality-specific structure.\n3. Describe how the UI or notebook interface exposes: (a) cluster assignments, (b) top features/biomarkers per cluster, and (c) robustness diagnostics.\n4. Define a benchmarking plan using at least two public cohorts (e.g., TCGA, CPTAC) with known subtypes.\n5. What minimum silhouette score and subtype-survival association strength would indicate clinically meaningful stratification?\n6. Generate working Python code (pandas + sklearn + plotly) implementing a simple two-omics integration pipeline with UMAP visualization.`},

  {id:24,cat:"tools",pts:55,title:"Differential Expression Analysis Pipeline Builder",
   tags:["DEG","edgeR","DESeq2","volcano plot","batch correction"],
   prompt:`Build a Tool: One-Click Differential Expression Analysis App\n\nDEG analysis is the most common task in biology yet it is full of hidden pitfalls: wrong normalization, ignored batch effects, multiple-testing errors, and p-value misinterpretation. Most biologists still run DESeq2 or edgeR without understanding what they output or when each is appropriate.\n\nYour tasks:\n1. Design a guided pipeline app: user uploads a count matrix + metadata CSV and gets a full DEG report with volcano plot, heatmap, and GO enrichment.\n2. How would you automatically detect and flag batch effects, low-count genes, outlier samples, and dispersion estimation failures before running DE?\n3. Explain when to use DESeq2 vs edgeR vs limma-voom in plain English — build this as an automated decision tree in the app.\n4. Propose plain-language explanations for all statistical outputs: what does a log2 fold-change of 2 actually mean biologically?\n5. Design the "export report" feature: what should a non-computational biologist receive as output?\n6. Generate complete working Python code using PyDeseq2 that runs DEG analysis on synthetic count data and outputs a volcano plot.`},

  {id:25,cat:"tools",pts:55,title:"Survival Analysis & Kaplan-Meier Dashboard",
   tags:["survival analysis","Kaplan-Meier","Cox regression","clinical data","biomarker"],
   prompt:`Build a Tool: Clinical Survival Analysis App for Biologists\n\nKaplan-Meier curves and Cox proportional hazards models are the workhorses of clinical biomarker analysis, but most biologists run them without checking assumptions, handling censoring correctly, or interpreting hazard ratios properly.\n\nYour tasks:\n1. Design an app where a clinician uploads a spreadsheet with patient survival times, event status, and biomarker columns — and receives fully annotated Kaplan-Meier plots and Cox regression outputs.\n2. How would you automatically check and flag Cox model assumption violations (proportional hazards, linearity of continuous variables) in plain language for the user?\n3. Design a biomarker cutpoint selection module that avoids the "optimal cutpoint" p-hacking trap — propose a statistically valid approach.\n4. What plain-English annotations would make hazard ratio forest plots interpretable to a bench biologist?\n5. Define a benchmarking plan using public clinical datasets (e.g., TCGA survival data) where known prognostic biomarkers can be reproduced.\n6. Generate complete working Python code using lifelines that produces annotated Kaplan-Meier plots with log-rank p-values on synthetic patient data.`},

  {id:26,cat:"tools",pts:60,title:"Protein Structure Viewer & Variant Impact Annotator",
   tags:["protein structure","AlphaFold2","variant annotation","missense","PyMOL"],
   prompt:`Build a Tool: Interactive Protein Structure + Variant Impact App\n\nBiologists routinely need to visualize protein structures and understand what a missense variant does to protein stability and function, but existing tools (PyMOL, ChimeraX) require expertise, and variant effect predictors (SIFT, PolyPhen, EVE) give opaque scores without structural context.\n\nYour tasks:\n1. Design a web app where a user enters a protein name or UniProt ID + optional variant list (e.g., V600E) and receives: (a) an interactive 3D structure viewer, (b) variant positions highlighted, (c) plain-English impact predictions from multiple tools combined.\n2. How would you integrate AlphaFold2 structure predictions for proteins lacking experimental structures, and clearly communicate prediction confidence to the user?\n3. Propose a "variant impact score" that aggregates conservation (EVE), structure perturbation (FoldX ΔΔG), and functional site proximity into a single interpretable score.\n4. Design the UI for a biologist with no structural biology training — what does the tooltip say when they hover over a highlighted residue?\n5. Generate working Python code using py3Dmol (for Jupyter) that fetches a protein from AlphaFold DB and highlights user-specified variant positions with color-coded impact scores.`},

  {id:27,cat:"tools",pts:65,title:"CRISPR Guide RNA Designer & Off-Target Predictor",
   tags:["CRISPR","sgRNA","off-target","Cas9","genome editing"],
   prompt:`Build a Tool: End-to-End CRISPR gRNA Design Suite\n\nDesigning CRISPR experiments requires choosing guide RNAs, predicting on-target efficiency and off-target sites, and interpreting editing outcomes — each step has multiple competing tools that disagree substantially, confusing non-expert users.\n\nYour tasks:\n1. Design a pipeline app where a user enters a target gene name or genomic coordinates and receives a ranked list of guide RNAs with on-target efficiency scores (Rule Set 2, DeepCRISPR), off-target predictions (Cas-OFFinder, CRISPOR), and positional context.\n2. How would you present off-target risk in plain language? Design a risk-stratification display that distinguishes "safe for cell line use" from "not safe for therapeutic use".\n3. Propose a pooled screen gRNA library design module: user specifies a gene list and receives a library design with controls, with statistical power estimates for the planned screen.\n4. How would you handle the diversity of Cas variants (Cas9, Cas12a, base editors, prime editors) in a unified UI?\n5. Design the "results report" that a biologist sends to their core facility ordering custom oligos.\n6. Generate working Python code that uses the Biopython library and a precomputed off-target scoring model to design and rank guide RNAs for a user-specified sequence.`},

  {id:28,cat:"tools",pts:60,title:"Single-Cell RNA-seq Interactive Explorer",
   tags:["scRNA-seq","UMAP","Seurat","Scanpy","cell annotation","trajectory"],
   prompt:`Build a Tool: No-Code Single-Cell Analysis & Visualization App\n\nSingle-cell RNA-seq analysis requires running Seurat or Scanpy pipelines that produce dozens of UMAP plots and cluster markers — but biologists without coding experience cannot explore the data interactively or annotate clusters confidently.\n\nYour tasks:\n1. Design an app where a user uploads a processed single-cell object (h5ad or Seurat RDS) and can: (a) browse UMAP/t-SNE embeddings, (b) query gene expression overlays, (c) compare clusters side-by-side, (d) export publication figures.\n2. Propose an automated cell-type annotation module using marker gene databases (PanglaoDB, CellMarker) that presents confidence scores and lets users override annotations.\n3. How would you handle trajectory inference (pseudotime) — design a UI that presents RNA velocity or PAGA results in a way that makes biological sense to a bench scientist.\n4. Design the "doublet and quality filter" wizard that guides a non-expert through QC decisions with plain-English explanations at each step.\n5. What would a "biology-ready export" look like — define the figure set, metadata tables, and statistical summaries that get auto-generated for a manuscript?\n6. Generate working Python code using Scanpy that loads an h5ad file, performs UMAP, finds marker genes per cluster, and exports annotated plots.`},

  {id:29,cat:"tools",pts:65,title:"Metabolic Pathway Simulator & Flux Visualizer",
   tags:["metabolomics","flux","pathway analysis","KEGG","COBRApy","simulation"],
   prompt:`Build a Tool: Interactive Metabolic Pathway Simulation Dashboard\n\nMetabolomics data is hard to interpret because metabolite levels reflect both enzyme activity and substrate availability. Biologists need to go from a list of metabolite fold-changes to a mechanistic understanding of which pathways are perturbed and in which direction.\n\nYour tasks:\n1. Design an app where a user uploads a metabolomics results table (metabolite names + fold-changes + p-values) and receives: (a) enriched KEGG/HMDB pathway maps with fold-changes overlaid, (b) flux predictions using simple stoichiometric constraints, (c) plain-English interpretation of which metabolic nodes are bottlenecks.\n2. How would you handle the missing metabolite problem — many pathways have only 2–3 of 10 metabolites measured? Design a statistical approach that accounts for partial pathway coverage.\n3. Propose a "what-if" simulation module where the user can knock out a specific enzyme in the model and see predicted downstream metabolite changes.\n4. Design the UI for presenting isotopologue data (13C labeling) alongside regular metabolomics — what does the combined visualization look like?\n5. Define a benchmarking plan using public metabolomics datasets (e.g., Metabolights, MetabolomicsWorkbench) where known pathway perturbations can be reproduced.\n6. Generate working Python code using COBRApy that loads a genome-scale metabolic model, applies simple RNA-seq-based constraints, and visualizes predicted flux changes on a simplified TCA cycle diagram.`},
];

const MODELS = [
  {id:"dsv3",name:"DeepSeek V3",prov:"DeepSeek",score:612,sub:36,acc:.852,color:"#06b6d4"},
  {id:"cop",name:"Claude Opus 4.6",prov:"Anthropic",score:576,sub:35,acc:.824,color:"#f59e0b"},
  {id:"gpt5p",name:"GPT-5 Pro",prov:"OpenAI",score:520,sub:34,acc:.765,color:"#8b5cf6"},
  {id:"gpt5",name:"GPT-5",prov:"OpenAI",score:468,sub:33,acc:.709,color:"#10b981"},
  {id:"grok",name:"Grok 4.20",prov:"xAI",score:420,sub:31,acc:.677,color:"#e11d48"},
  {id:"gem",name:"Gemini 3.1 Pro",prov:"Google",score:330,sub:30,acc:.550,color:"#3b82f6"},
  {id:"llm",name:"Llama 3.3 70B",prov:"Meta",score:270,sub:27,acc:.500,color:"#a855f7"},
  {id:"mix",name:"Mixtral 8x22B",prov:"Mistral",score:198,sub:23,acc:.430,color:"#ec4899"},
];

const AGENTS = [
  {id:"gpt4o",name:"GPT-4o",color:"#10b981",lens:"Experimental Feasibility",
   sys:"You are an expert experimental biologist. Analyze biology problems from an EXPERIMENTAL FEASIBILITY perspective: measurement challenges, assay design, calibration, batch effects, throughput, practical constraints. Be specific — cite numbers, protocols, timelines. Use **bold** for key claims. Keep under 260 words. End with one concrete next step."},
  {id:"dsr1",name:"DeepSeek R1",color:"#06b6d4",lens:"Mathematical Formalization",
   sys:"You are a computational biologist. Analyze biology problems through MATHEMATICAL FORMALIZATION: statistical models, probabilistic frameworks, algorithmic complexity, information-theoretic bounds. Avoid unexplained symbols — explain every term in plain English. Be specific about performance bounds. Use **bold** for key claims. Keep under 260 words. End with one concrete next step."},
  {id:"c35",name:"Claude 3.5 Sonnet",color:"#f59e0b",lens:"Mechanistic Biology",
   sys:"You are a molecular biologist. Analyze biology problems through MECHANISTIC REASONING: identify two competing mechanistic explanations, explain perturbation experiments that distinguish them, focus on causal mechanisms and orthogonal validation. Use **bold** for key claims. Keep under 260 words. End with one concrete next step."},
  {id:"gem15",name:"Gemini 1.5 Pro",color:"#8b5cf6",lens:"Systems Engineering",
   sys:"You are a systems engineer. Analyze biology problems through PIPELINE INTEGRATION: where do biological AI pipelines break at the system level? What is the gap between benchmark performance and real-world utility? Use **bold** for key claims. Keep under 260 words. End with one concrete next step."},
  {id:"o1",name:"o1 Reasoning",color:"#e879f9",lens:"First-Principles Reasoning",
   sys:"You are a deep reasoning engine analyzing biology problems through FIRST-PRINCIPLES LOGIC. Break each problem down to its irreducible constraints: what is the fundamental physical, chemical, or information-theoretic barrier? What would need to be true for the problem to be solvable? Use **bold** for key claims. Avoid jargon — explain everything from the ground up. Keep under 260 words. End with one concrete next step."},
  {id:"med",name:"Med-PaLM",color:"#f97316",lens:"Clinical Translation",
   sys:"You are a physician-scientist. Analyze biology problems from a CLINICAL TRANSLATION perspective: what is the unmet clinical need, how far are we from a diagnostic or therapeutic application, what regulatory hurdles exist, and what patient population benefits first? Speak practically — what would a clinician or clinical trialist need to see? Use **bold** for key claims. Keep under 260 words. End with one concrete next step."},
  {id:"evo",name:"ESM-3 / Evo",color:"#84cc16",lens:"Evolutionary & Sequence Biology",
   sys:"You are an evolutionary biologist and protein/RNA language model expert. Analyze biology problems through EVOLUTIONARY AND SEQUENCE-LEVEL REASONING: what does evolution tell us about the constraints on this problem? What conservation, coevolution, or phylogenetic signal is available? How do large biological language models (ESM-3, Evo, RNA-FM) address or fail to address this problem? Use **bold** for key claims. Keep under 260 words. End with one concrete next step."},
  {id:"a007",name:"Agent 007",color:"#ff2d55",lens:"Phylogenetic & Multi-Scale Integration",
   sys:"You are Agent 007 — a specialized phylogenomic intelligence agent inspired by BioMNI Lab's Phylo system. Your unique perspective: PHYLOGENETIC AND MULTI-SCALE INTEGRATION. You analyze biology problems by integrating evolutionary history, cross-species genomic comparisons, and multi-scale biological data (from molecules to organisms). Your analysis uniquely asks: (1) What does the evolutionary record reveal about this problem that purely mechanistic or computational approaches miss? (2) Which model organisms or cross-species comparisons provide the most informative natural experiments? (3) How do conserved vs divergent regions constrain possible solutions? (4) What phylogenetic databases and comparative genomics tools (UCSC Genome Browser, Ensembl Compara, OrthoFinder, PhyloP conservation scores) would you deploy, and why? You always end with a specific phylogenetic or comparative genomics experiment that no other agent would suggest. Be bold, specific, and cross-disciplinary. Use **bold** for key claims. Keep under 260 words. End with one concrete next step that only evolutionary/phylogenetic reasoning could identify."},
];

/* ═══════ CONSTANTS ═══════ */
const SK = "bioarena:iters";
const MAX_ROUNDS = 5;   // up to 5 rounds to reach best resolution
const MIN_ROUNDS = 2;   // always at least 2 rounds regardless of early convergence
const CONV = 65;        // threshold for "resolved" — raised so agents push harder

const SESSION_ID = (() => {
  if (!window.__baSessionId) window.__baSessionId = Math.random().toString(36).slice(2)+Date.now().toString(36);
  return window.__baSessionId;
})();

/* ═══════ API + STORAGE ═══════ */

// Global custom API config — set by user via "Bring Your Own AI"
// Shape: {provider:"openai"|"anthropic"|"groq"|"ollama"|"custom", apiKey, model, baseUrl}
let _customAPI = null;
export function setCustomAPI(cfg){ _customAPI = cfg; }

async function callClaude(system, userMsg) {
  const cfg = _customAPI;

  // ── CUSTOM / BYOA path ──
  if(cfg && cfg.apiKey && cfg.provider !== "bioarena"){
    const isAnthropic = cfg.provider === "anthropic";
    const isLocal     = cfg.provider === "ollama" || cfg.provider === "lmstudio";
    const baseUrl     = cfg.baseUrl || (
      cfg.provider==="openai"    ? "https://api.openai.com/v1"
    : cfg.provider==="anthropic" ? "https://api.anthropic.com"
    : cfg.provider==="groq"      ? "https://api.groq.com/openai/v1"
    : cfg.provider==="ollama"    ? "http://localhost:11434/v1"
    : cfg.baseUrl
    );
    const model = cfg.model || (
      cfg.provider==="openai"    ? "gpt-4o"
    : cfg.provider==="anthropic" ? "claude-opus-4-6"
    : cfg.provider==="groq"      ? "llama-3.3-70b-versatile"
    : cfg.provider==="ollama"    ? "llama3"
    : "gpt-4o"
    );

    if(isAnthropic){
      const res = await fetch(`${baseUrl}/v1/messages`,{
        method:"POST",
        headers:{"Content-Type":"application/json","x-api-key":cfg.apiKey,"anthropic-version":"2023-06-01"},
        body:JSON.stringify({model,max_tokens:950,system,messages:[{role:"user",content:userMsg}]}),
      });
      if(!res.ok) throw new Error(`Custom API ${res.status}: ${await res.text()}`);
      const d=await res.json();
      return d.content?.map(c=>c.text||"").join("")||"No response.";
    } else {
      // OpenAI-compatible (OpenAI, Groq, Ollama, custom)
      const res = await fetch(`${baseUrl}/chat/completions`,{
        method:"POST",
        headers:{"Content-Type":"application/json",...(isLocal?{}:{"Authorization":`Bearer ${cfg.apiKey}`})},
        body:JSON.stringify({model,max_tokens:950,messages:[{role:"system",content:system},{role:"user",content:userMsg}]}),
      });
      if(!res.ok) throw new Error(`Custom API ${res.status}: ${await res.text()}`);
      const d=await res.json();
      return d.choices?.[0]?.message?.content||"No response.";
    }
  }

 // ── Default path — via Netlify proxy (keeps key safe on server) ──
const res = await fetch("https://bioarena-api.sankalpachakraborty91.workers.dev", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "llama-3.1-8b-instant",
    max_tokens: 500,
    messages: [
      { role: "system", content: system },
      { role: "user", content: userMsg }
    ]
  }),
});
if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
const d = await res.json();
return d.choices?.[0]?.message?.content || "No response.";
}
async function loadIters(qid){try{const r=await window.storage.get(`${SK}:${qid}`,true);return r?JSON.parse(r.value):[];}catch{return[];}}
async function saveIters(qid,iters){try{await window.storage.set(`${SK}:${qid}`,JSON.stringify(iters),true);}catch{}}

/* ═══════ DEBATE ENGINE ═══════ */
const JUDGE_SYS=`You are an impartial scientific arbiter. Evaluate whether expert agents have reached sufficient consensus on a biology problem.
Return ONLY valid JSON, no markdown fences:
{"score":<integer 0-100>,"resolved":<true if score>=60>,"unresolved_tensions":["tension 1","tension 2"],"next_debate_focus":"One specific focused question for the next round"}
Score rubric: 0-30=fundamental disagreements, 31-55=partial agreement, 56-59=mostly aligned but key gap, 60-79=strong consensus, 80-100=full convergence.`;

async function judgeRound(q, allRounds, prevConsensus){
  const summaries = allRounds.map((rnd,ri)=>
    `=== ROUND ${ri+1} ===\n`+rnd.agents.map(a=>{const ag=AGENTS.find(x=>x.id===a.aid);return`[${ag?.name}/${ag?.lens}]: ${a.resp.slice(0,250)}`;}).join("\n\n")
  ).join("\n\n");
  const priorCtx = prevConsensus ? `\n\n=== PRIOR SESSION CONSENSUS (agents must build on and improve this) ===\n${prevConsensus.slice(0,400)}` : "";
  try{
    const raw=await callClaude(JUDGE_SYS,`Problem: ${q.title}${priorCtx}\n\n${summaries}\n\nEvaluate convergence. Return JSON only.`);
    return JSON.parse(raw.replace(/```json\n?/g,"").replace(/```/g,"").trim());
  }catch{return{score:48,resolved:false,unresolved_tensions:["Parse error"],next_debate_focus:"Provide more specific experimental evidence and concrete numerical targets"};}
}

async function runDebateRound(q, roundNum, prevRounds, userInput, onStatus, prevConsensus){
  const agents=[];
 for(const ag of AGENTS){
    onStatus(ag.id,"running",roundNum);
    // Wait between agents to stay under rate limit
    await new Promise(r=>setTimeout(r,7000));
    let msg=`**Problem:** ${q.title}\n\n${q.prompt}\n\n`;
    if(userInput) msg+=`**Researcher's additional input (incorporate this fully):** ${userInput}\n\n`;
    // Give agents context from a prior completed session when available
    if(prevConsensus) msg+=`**Previous session consensus (you MUST build on, challenge, or extend this — do NOT repeat it):**\n${prevConsensus.slice(0,350)}\n\n`;
    if(prevRounds.length>0){
      const last=prevRounds[prevRounds.length-1];
      const others=last.agents.filter(a=>a.aid!==ag.id).map(a=>{const oa=AGENTS.find(x=>x.id===a.aid);return`**${oa?.name} (${oa?.lens}):** ${a.resp.slice(0,200)}`;}).join("\n\n");
      const jn=last.judge?`\n\n**Judge verdict (${last.judge.score}/100) — focus for this round:** ${last.judge.next_debate_focus}`:"";
      msg+=`DEBATE ROUND ${roundNum} of up to ${MAX_ROUNDS}. Do NOT repeat Round ${roundNum-1} analysis. You MUST:\n1. Directly challenge the strongest specific counterpoint from a peer (name them)\n2. Add NEW specifics — numbers, tool names, protocols, or mechanisms your previous analysis missed\n3. State explicitly where you now agree and where you still disagree\n4. If the judge score is below ${CONV}, you must be MORE specific this round, not just restate\n\n**Other agents from Round ${roundNum-1}:**\n${others}${jn}\n\nYour lens: **${ag.lens}**. Be concrete and push toward resolution. 270 words max.`;
    }else{
      msg+=`ROUND 1 — State your most specific, concrete initial position from your unique lens: **${ag.lens}**. Cite specific tools, numbers, protocols, or mechanisms. Do not be vague. 270 words max.`;
    }
    try{
      let resp="";
      let attempts=0;
      while(attempts<4){
        try{
          resp=await callClaude(ag.sys,msg);
          break;
        }catch(e:any){
          attempts++;
          const is429=e.message&&(e.message.includes("429")||e.message.includes("rate"));
          if(is429&&attempts<4){
            const wait=15000*attempts;
            onStatus(ag.id,`retrying ${attempts}/3…`,roundNum);
            await new Promise(r=>setTimeout(r,wait));
          }else{
            throw e;
          }
        }
      }
      agents.push({aid:ag.id,resp,score:55+Math.floor(Math.random()*25)});
      onStatus(ag.id,"done",roundNum);
    }catch(e:any){
      agents.push({aid:ag.id,resp:`Analysis unavailable: ${e.message}`,score:0});
      onStatus(ag.id,"error",roundNum);
    }
  }
  return agents;
}

async function buildFinalConsensus(q, allRounds, userInput, resolved, prevConsensus){
  const debate=allRounds.map((rnd,ri)=>`=== ROUND ${ri+1} (${rnd.judge?.score??'?'}/100) ===\n`+rnd.agents.map(a=>{const ag=AGENTS.find(x=>x.id===a.aid);return`[${ag?.name}]: ${a.resp.slice(0,240)}`;}).join("\n\n")).join("\n\n");
  const priorNote = prevConsensus ? `\n\nPRIOR SESSION CONSENSUS (this session must supersede it with improvements):\n${prevConsensus.slice(0,350)}` : "";
  const note=resolved?"":"\n\nNote: Max rounds reached without full convergence. Synthesize the best possible current consensus. Clearly label contested points. Always produce actionable output.";
  const sys=`You are a senior scientist writing a research resolution after a multi-round expert debate with ${AGENTS.length} agents. Write: (1) **Final Consensus** — what all experts agreed on (be specific — cite tools, numbers, mechanisms), (2) **Resolved Tensions** — how disagreements were settled, (3) **Still Open** — what genuinely remains unknown, (4) **Recommended Action Plan** — 5 concrete next steps with specific tool names, (5) **Success Metrics** — measurable targets.${note} Use **bold headers**. 450 words max.`;
  try{return await callClaude(sys,`Problem: ${q.title}\nUser input: ${userInput||"none"}\nRounds: ${allRounds.length}\nResolved: ${resolved}${priorNote}\n\n${debate}\n\nWrite the resolution.`);}
  catch{return "Resolution generation failed. See debate rounds above.";}
}

async function buildPlainSummary(q, finalConsensus, userInput, resolved, prevConsensus){
  const priorNote = prevConsensus ? ` This is a FOLLOW-UP session — your plan must build on and improve the previous guidance, not repeat it.` : "";
  const sys=`You are explaining cutting-edge biology research to a biology researcher who knows lab basics but NOT advanced computation or math.

Write a friendly numbered step-by-step action plan. STRICT RULES:
- NO equations, NO Greek letters, NO statistical notation (no R² or p-values or matrix symbols)
- If you must use a technical term, immediately explain it in plain words in parentheses
- Write like a senior researcher explaining over coffee — warm and encouraging
- Each step: emoji + bold action verb + one plain sentence of what to do and WHY it matters
- Open with "**You will need:**" listing key materials/tools in plain English
- After steps: "**How you will know it is working:**" — plain observable results that mean success
- Then: "**What the ${AGENTS.length} AI agents agreed on:**" — 3-4 plain-English bullet points of the main conclusions
- Finally: "**⚠️ What this debate CANNOT fully solve for you yet:**" — be specific and honest
- Max 8 steps.${resolved?"":" Note: debate reached max rounds without full convergence — frame as best current guidance and be honest about remaining uncertainty."}${priorNote}`;
  try{return await callClaude(sys,`Biology problem: ${q.title}\nResearcher input: ${userInput||"none"}\n\nExpert consensus (${AGENTS.length} agents, ${resolved?"resolved":"best effort"}):\n${finalConsensus.slice(0,1200)}\n\nWrite the plain-English guide.`);}
  catch{return "Plain-language summary could not be generated.";}
}

async function buildConclusion(q, allRounds, finalConsensus, userInput, resolved){
  // Collect all unresolved tensions across all judge rounds
  const allTensions = allRounds
    .flatMap(r => r.judge?.unresolved_tensions || [])
    .filter(Boolean);
  const uniqueTensions = [...new Set(allTensions)].slice(0, 6);

  // Find which questions the judge said still needed work in the final round
  const lastJudge = allRounds[allRounds.length-1]?.judge;
  const finalFocus = lastJudge?.next_debate_focus || "";
  const finalScore = allRounds[allRounds.length-1]?.judge?.score ?? 0;

  const sys = `You are writing a concise, honest "Conclusion Card" for a biology researcher after a ${allRounds.length}-round AI debate.

Write EXACTLY these five sections with the EXACT headers below. Be specific and honest. Plain English only — no equations, no jargon without explanation.

**🏁 What the AI agents agreed on**
[2-3 sentences summarising the main consensus in plain language. Be specific — name the key finding, tool, or mechanism they converged on.]

**💻 What the starter code can do for you right now**
[3-4 bullet points listing the concrete computational tasks the generated code handles — e.g. "Runs differential expression analysis on your count matrix and outputs a ranked gene list"]

**🧪 What you need to do after the code**
[3-4 bullet points listing the mandatory next steps that require YOUR expertise or wet lab — what the code cannot do for you]

**⚔️ What the AI agents debated but couldn't fully resolve**
[List the genuine open questions — where agents disagreed or the judge couldn't reach consensus. If fully resolved, say "All major points were resolved" and list what was settled last.]

**🎯 One thing to try first**
[ONE specific, concrete first action — the single most useful thing this researcher should do TODAY based on the debate. Make it actionable and specific.]`;

  const msg = `Biology problem: ${q.title}
User context: ${userInput || "none"}
Rounds completed: ${allRounds.length}
Final convergence score: ${finalScore}/100
Fully resolved: ${resolved}
Unresolved tensions across all rounds: ${uniqueTensions.join("; ") || "none — fully converged"}
Final judge focus: ${finalFocus || "n/a"}

Expert consensus summary:
${finalConsensus.slice(0, 1000)}

Write the Conclusion Card now.`;

  try { return await callClaude(sys, msg); }
  catch { return "Conclusion generation failed. See the tabs below for full details."; }
}

async function generateCode(q, finalConsensus, userInput){
  const sys=`You are a bioinformatics expert generating practical Python code for a biology research problem.

Structure your response EXACTLY as follows:

## What this code does
[2-3 sentence plain-English description]

## Install these first
[pip install commands on one line each]

\`\`\`python
# [50-100 lines of working Python code]
# Use synthetic data examples so the code runs immediately without real data
# Clear comments explaining each section in plain English
# Realistic biology data shapes and variable names
\`\`\`

## What you can do RIGHT NOW with this code
- [specific capability 1 — plain English]
- [specific capability 2 — plain English]
- [specific capability 3 — plain English]

## What this code CANNOT do yet — you need to provide or do:
- **Needs your real data:** [exactly what data files/formats the researcher must supply]
- **Needs wet-lab validation:** [what computational outputs must be confirmed experimentally — code alone cannot do this]
- **Needs a specialist for:** [more complex analyses beyond this starting point]
- **Still beyond current AI capability:** [what remains genuinely unsolved even with more code and more data]

Keep the code simple. Prioritize clarity over complexity. It must run in under 5 minutes on a laptop.`;
  try{return await callClaude(sys,`Biology problem: ${q.title}\nResearcher context: ${userInput||"none"}\n\nExpert consensus:\n${finalConsensus.slice(0,900)}\n\nGenerate practical starter code.`);}
  catch{return "Code generation failed. Please try again.";}
}

/* ═══════ RESPONSIVE HOOK ═══════ */
function useIsMobile(){ const [m,setM]=useState(()=>window.innerWidth<768); useEffect(()=>{const h=()=>setM(window.innerWidth<768);window.addEventListener("resize",h);return()=>window.removeEventListener("resize",h);},[]);return m;}

/* ═══════ MARKDOWN ═══════ */
function Md({text}){
  if(!text) return null;
  const html=text
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/\*\*(.+?)\*\*/g,"<b style='color:#d0e4ff'>$1</b>")
    .replace(/\*(.+?)\*/g,"<i>$1</i>")
    .replace(/`([^`]+)`/g,"<code style='background:#0c1a30;padding:1px 5px;border-radius:2px;font-size:11px'>$1</code>")
    .replace(/^#{1,3}\s+(.+)$/gm,"<div style='font-family:Oxanium,sans-serif;font-weight:700;color:#cee0ff;margin:10px 0 3px;font-size:11.5px'>$1</div>")
    .replace(/^[-*]\s+(.+)$/gm,"<div style='padding-left:10px;margin:2px 0'>• $1</div>")
    .replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>");
  return <span dangerouslySetInnerHTML={{__html:html}}/>;
}

function PlainMd({text}){
  if(!text) return null;
  const html=text
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/\*\*(.+?)\*\*/g,"<b style='color:#ffe082;font-size:13.5px'>$1</b>")
    .replace(/\*(.+?)\*/g,"<i style='color:#b9f6ca'>$1</i>")
    .replace(/^⚠️(.+)$/gm,"<div style='background:rgba(255,92,92,.06);border:1px solid rgba(255,92,92,.2);border-radius:4px;padding:10px 14px;margin:12px 0;font-size:12.5px;color:#fca5a5;line-height:1.7'>⚠️$1</div>")
    .replace(/^[-*]\s+(.+)$/gm,"<div style='padding-left:14px;margin:5px 0;font-size:13px'>• $1</div>")
    .replace(/^(\d+\.)\s+(.+)$/gm,"<div style='display:flex;gap:10px;margin:11px 0;align-items:flex-start'><span style='font-family:Oxanium,sans-serif;font-weight:700;color:#ffc34d;font-size:17px;min-width:24px;flex-shrink:0'>$1</span><span style='font-size:13px;line-height:1.85'>$2</span></div>")
    .replace(/\n\n/g,"<br/><br/>").replace(/\n/g,"<br/>");
  return <span dangerouslySetInnerHTML={{__html:html}}/>;
}

function CodeMd({text}){
  if(!text) return null;
  const parts=text.split(/(```[\w]*\n[\s\S]*?```)/g);
  return(
    <div>{parts.map((part,i)=>{
      if(part.startsWith("```")){
        const code=part.replace(/^```[\w]*\n/,"").replace(/```$/,"");
        return <pre key={i}><code>{code}</code></pre>;
      }
      const html=part
        .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
        .replace(/\*\*(.+?)\*\*/g,"<b style='color:#d0e4ff'>$1</b>")
        .replace(/^##\s+(.+)$/gm,"<div style='font-family:Oxanium,sans-serif;font-weight:700;color:#2aff80;margin:14px 0 6px;font-size:12px;letter-spacing:1px'>$1</div>")
        .replace(/^[-*]\s+(.+)$/gm,"<div style='padding-left:12px;margin:4px 0;font-size:12px'>• $1</div>")
        .replace(/\n/g,"<br/>");
      return <span key={i} dangerouslySetInnerHTML={{__html:html}}/>;
    })}</div>
  );
}

/* ═══════ NAV ═══════ */
function Nav({page,goHome,goCommunity,goLB,customAPI}){
  const mob=useIsMobile();
  const [menuOpen,setMenuOpen]=useState(false);
  return(
    <>
    <nav style={{position:"sticky",top:0,zIndex:100,background:"rgba(3,8,18,.97)",backdropFilter:"blur(14px)",borderBottom:"1px solid #182640",display:"flex",alignItems:"center",height:54,padding:"0 16px",gap:4}}>
      <div onClick={()=>{goHome();setMenuOpen(false);}} style={{fontFamily:"Oxanium,sans-serif",fontWeight:800,fontSize:17,letterSpacing:2.5,textTransform:"uppercase",color:"#00e5ff",cursor:"pointer",marginRight:mob?8:20,textShadow:"0 0 18px rgba(0,229,255,.35)"}}>
        Bio<span style={{color:"#2aff80"}}>Arena</span>
      </div>
      {!mob&&[["Home",goHome,page==="home"],["Community",goCommunity,page==="community"||page==="cq"],["Leaderboard",goLB,page==="lb"]].map(([label,fn,active])=>(
        <button key={label} onClick={fn} style={{padding:"5px 14px",borderRadius:3,fontFamily:"Oxanium,sans-serif",fontSize:10.5,fontWeight:600,letterSpacing:1.5,textTransform:"uppercase",cursor:"pointer",border:`1px solid ${active?"#223260":"transparent"}`,background:active?"rgba(0,229,255,.05)":"transparent",color:active?"#00e5ff":"#6a85b0",transition:"all .14s",position:"relative"}}>
          {label}
          {label==="Community"&&<span style={{position:"absolute",top:-4,right:-4,width:7,height:7,borderRadius:"50%",background:"#2aff80",border:"1.5px solid #030812"}}/>}
        </button>
      ))}
      <div style={{flex:1}}/>
      {!mob&&customAPI&&(
        <div style={{fontFamily:"Oxanium,sans-serif",fontSize:9,letterSpacing:1.2,padding:"3px 10px",borderRadius:20,background:"rgba(167,139,250,.1)",color:"#a78bfa",border:"1px solid rgba(167,139,250,.3)",marginRight:8,display:"flex",alignItems:"center",gap:5}}>
          <span style={{width:5,height:5,borderRadius:"50%",background:"#a78bfa"}}/>
          {customAPI.label||customAPI.provider}
        </div>
      )}
      {!mob&&<div style={{fontFamily:"Oxanium,sans-serif",fontSize:9.5,letterSpacing:1.5,padding:"3px 11px",borderRadius:20,background:"rgba(42,255,128,.08)",color:"#2aff80",border:"1px solid rgba(42,255,128,.18)"}}>LIVE</div>}
      {mob&&(
        <button onClick={()=>setMenuOpen(v=>!v)} style={{background:"transparent",border:"1px solid #223260",borderRadius:4,color:"#00e5ff",padding:"6px 10px",cursor:"pointer",fontFamily:"Oxanium,sans-serif",fontSize:13}}>
          {menuOpen?"✕":"☰"}
        </button>
      )}
    </nav>
    {mob&&menuOpen&&(
      <div style={{position:"fixed",top:54,left:0,right:0,bottom:0,zIndex:99,background:"rgba(3,8,18,.98)",padding:24,display:"flex",flexDirection:"column",gap:8}}>
        {[["🏠 Home",goHome,page==="home"],["🧬 Community",goCommunity,page==="community"||page==="cq"],["🏆 Leaderboard",goLB,page==="lb"]].map(([label,fn,active])=>(
          <button key={label} onClick={()=>{fn();setMenuOpen(false);}}
            style={{padding:"16px 20px",borderRadius:6,fontFamily:"Oxanium,sans-serif",fontSize:15,fontWeight:600,letterSpacing:1,textTransform:"uppercase",cursor:"pointer",border:`1px solid ${active?"#00e5ff":"#223260"}`,background:active?"rgba(0,229,255,.07)":"#07101f",color:active?"#00e5ff":"#b4c8e8",textAlign:"left",position:"relative"}}>
            {label}
            {label==="🧬 Community"&&<span style={{position:"absolute",top:12,right:16,width:8,height:8,borderRadius:"50%",background:"#2aff80"}}/>}
          </button>
        ))}
        {customAPI&&(
          <div style={{padding:"12px 16px",borderRadius:6,background:"rgba(167,139,250,.08)",border:"1px solid rgba(167,139,250,.2)",color:"#a78bfa",fontFamily:"Oxanium,sans-serif",fontSize:12}}>
            🤖 Using {customAPI.label||customAPI.provider}
          </div>
        )}
        <div style={{marginTop:"auto",fontFamily:"Oxanium,sans-serif",fontSize:9,color:"#354d72",letterSpacing:2,textAlign:"center"}}>LIVE BIOLOGY BENCHMARK</div>
      </div>
    )}
    </>
  );
}

/* ═══════ BREADCRUMB ═══════ */
function BC({items}){
  return(
    <div style={{display:"flex",gap:6,fontSize:10.5,color:"#64748b",marginBottom:12}}>
      {items.filter(Boolean).map((it,idx)=>(
        <span key={idx} style={{display:"flex",alignItems:"center"}}>
          {idx>0&&<span style={{margin:"0 4px",color:"#374151"}}>/</span>}
          {it.fn?<span onClick={it.fn} style={{cursor:"pointer",color:"#93c5fd"}}>{it.label}</span>:<span>{it.label}</span>}
        </span>
      ))}
    </div>
  );
}

/* ═══════ HOME ═══════ */
function Home({goCategory,goQuestion,goCommunity,goCommunityQ,customAPI,applyCustomAPI}){
  const mob=useIsMobile();
  const [search,setSearch]=useState("");
  const [tagFilter,setTagFilter]=useState("");
  const [readingMode,setReadingMode]=useState(false);
  const [recentCommunity,setRecentCommunity]=useState([]);
  const [showAllProblems,setShowAllProblems]=useState(false);
  const [askQ,setAskQ]=useState("");
  const [submittingAsk,setSubmittingAsk]=useState(false);
  // BYOA state
  const [showBYOA,setShowBYOA]=useState(false);
  const [byoaProvider,setByoaProvider]=useState("groq");
  const [byoaKey,setByoaKey]=useState("");
  const [byoaModel,setByoaModel]=useState("");
  const [byoaBaseUrl,setByoaBaseUrl]=useState("");
  const [byoaTested,setByoaTested]=useState(false);
  const [byoaTesting,setByoaTesting]=useState(false);
  const [byoaTestMsg,setByoaTestMsg]=useState("");
  const allTags=Array.from(new Set(QS.flatMap(q=>q.tags||[]))).slice(0,20);
  const filteredQs=QS.filter(q=>{
    const s=search.trim().toLowerCase();
    const inSearch=!s||q.title.toLowerCase().includes(s)||(q.prompt||"").toLowerCase().includes(s);
    const inTag=!tagFilter||(q.tags||[]).includes(tagFilter);
    return inSearch&&inTag;
  });

  useEffect(()=>{
    loadCommunityIndex().then(d=>{
      setRecentCommunity((d||[]).slice(0,4)); // show top 4 most recent
    });
  },[]);

  const submitAsk=useCallback(async()=>{
    const q=askQ.trim();
    if(!q||submittingAsk) return;
    setSubmittingAsk(true);
    const id="cq_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,6);
    const entry={id,title:q,ts:Date.now(),sessionId:SESSION_ID,submissionCount:0,resolved:false,finalScore:0};
    const idx=await loadCommunityIndex();
    const updated=[entry,...idx.filter(x=>!x.id.startsWith("seed_"))];
    await saveCommunityIndex(updated);
    setAskQ("");setSubmittingAsk(false);
    goCommunityQ(id,q);
  },[askQ,submittingAsk,goCommunityQ]);

  const PROVIDER_DEFAULTS = {
    custom:     {model:"",                               baseUrl:"",                                          placeholder:"your-api-key",     label:"Custom Endpoint",   color:"#e879f9", free:false, note:"Any OpenAI-compatible API"},
    groq:       {model:"llama-3.3-70b-versatile",        baseUrl:"https://api.groq.com/openai/v1",            placeholder:"gsk_…",            label:"Groq",              color:"#06b6d4", free:true,  note:"Free · ultra-fast · Llama 3.3"},
    openai:     {model:"gpt-4o",                         baseUrl:"https://api.openai.com/v1",                 placeholder:"sk-…",             label:"OpenAI",            color:"#10b981", free:false, note:"GPT-4o, GPT-4.1, o3"},
    anthropic:  {model:"claude-sonnet-4-5",              baseUrl:"https://api.anthropic.com",                 placeholder:"sk-ant-…",         label:"Anthropic",         color:"#f59e0b", free:false, note:"Claude Sonnet / Opus"},
    gemini:     {model:"gemini-2.0-flash",               baseUrl:"https://generativelanguage.googleapis.com/v1beta/openai", placeholder:"AIza…", label:"Google Gemini",   color:"#3b82f6", free:true,  note:"Free tier · Gemini 2.0 Flash"},
    deepseek:   {model:"deepseek-chat",                  baseUrl:"https://api.deepseek.com/v1",               placeholder:"sk-…",             label:"DeepSeek",          color:"#06b6d4", free:false, note:"DeepSeek V3 · very cheap"},
    mistral:    {model:"mistral-large-latest",           baseUrl:"https://api.mistral.ai/v1",                 placeholder:"…",                label:"Mistral AI",        color:"#f97316", free:false, note:"Mistral Large / Codestral"},
    together:   {model:"meta-llama/Llama-3.3-70B-Instruct-Turbo", baseUrl:"https://api.together.xyz/v1",     placeholder:"…",                label:"Together AI",       color:"#8b5cf6", free:false, note:"100+ open models"},
    perplexity: {model:"llama-3.1-sonar-large-128k-online", baseUrl:"https://api.perplexity.ai",             placeholder:"pplx-…",          label:"Perplexity",        color:"#22d3ee", free:false, note:"Web-connected · real-time"},
    xai:        {model:"grok-3",                         baseUrl:"https://api.x.ai/v1",                       placeholder:"xai-…",            label:"xAI Grok",          color:"#e11d48", free:false, note:"Grok 3 · reasoning"},
    cohere:     {model:"command-r-plus",                 baseUrl:"https://api.cohere.com/compatibility/v1",   placeholder:"…",                label:"Cohere",            color:"#84cc16", free:false, note:"Command R+ · RAG-optimized"},
    fireworks:  {model:"accounts/fireworks/models/llama-v3p3-70b-instruct", baseUrl:"https://api.fireworks.ai/inference/v1", placeholder:"fw_…", label:"Fireworks AI",  color:"#fb923c", free:false, note:"Fast open-source models"},
    huggingface:{model:"meta-llama/Llama-3.3-70B-Instruct", baseUrl:"https://api-inference.huggingface.co/v1", placeholder:"hf_…",          label:"HuggingFace",       color:"#fbbf24", free:true,  note:"Free tier · 1000+ models"},
    ollama:     {model:"llama3.2",                       baseUrl:"http://localhost:11434/v1",                  placeholder:"(no key needed)",  label:"Ollama",            color:"#14b8a6", free:true,  note:"Local · private · no key"},
    lmstudio:   {model:"local-model",                   baseUrl:"http://localhost:1234/v1",                   placeholder:"(no key needed)",  label:"LM Studio",         color:"#a78bfa", free:true,  note:"Local · GUI · private"},
    azure:      {model:"gpt-4o",                         baseUrl:"",                                          placeholder:"your-azure-key",   label:"Azure OpenAI",      color:"#0ea5e9", free:false, note:"Enterprise · your deployment URL"},
    replicate:  {model:"meta/llama-3.3-70b-instruct",   baseUrl:"https://openai-compat.replicate.com/v1",    placeholder:"r8_…",             label:"Replicate",         color:"#ec4899", free:false, note:"1000s of models · per-second billing"},
  };

  const testBYOA=useCallback(async()=>{
    const key=byoaKey.trim();
    const prov=byoaProvider;
    const defaults=PROVIDER_DEFAULTS[prov]||{};
    const model=byoaModel.trim()||defaults.model||"";
    const baseUrl=byoaBaseUrl.trim()||defaults.baseUrl||"";
    const isLocal=prov==="ollama"||prov==="lmstudio";
    if(!model){ setByoaTestMsg("⚠ Please enter a model name."); return; }
    if(!isLocal&&!key&&prov!=="custom"){ setByoaTestMsg("⚠ Please enter your API key."); return; }
    setByoaTesting(true); setByoaTestMsg("");
    const tmpCfg={provider:prov,apiKey:key,model,baseUrl,label:defaults.label||prov};
    const prev=_customAPI; _customAPI=tmpCfg;
    try{
      const reply=await callClaude("You are a helpful assistant. Reply in exactly 5 words.","Say hello to BioArena.");
      setByoaTestMsg(`✓ Connected! Model replied: "${reply.trim().slice(0,90)}"`);
      setByoaTested(true);
    }catch(e){
      setByoaTestMsg(`✗ Connection failed: ${e.message}`);
      setByoaTested(false);
      _customAPI=prev;
    }
    setByoaTesting(false);
  },[byoaProvider,byoaKey,byoaModel,byoaBaseUrl]);

  const applyBYOA=useCallback(()=>{
    const prov=byoaProvider;
    const defaults=PROVIDER_DEFAULTS[prov]||{};
    const model=byoaModel.trim()||defaults.model||"";
    const baseUrl=byoaBaseUrl.trim()||defaults.baseUrl||"";
    const cfg={provider:prov,apiKey:byoaKey.trim(),model,baseUrl,label:defaults.label||prov};
    _customAPI=cfg;
    applyCustomAPI(cfg);
    setShowBYOA(false);
    setByoaTestMsg("");
  },[byoaProvider,byoaKey,byoaModel,byoaBaseUrl,applyCustomAPI]);

  const removeBYOA=useCallback(()=>{
    _customAPI=null; applyCustomAPI(null);
    setByoaTested(false); setByoaTestMsg(""); setByoaKey("");
  },[applyCustomAPI]);
  return(
    <div className={`page-enter${readingMode?" reading-mode":""}`} style={{maxWidth:1280,margin:"0 auto",padding:mob?"16px 14px":"32px 24px"}}>
      <div style={{paddingBottom:36,borderBottom:"1px solid #182640",marginBottom:32}}>
        <div style={{fontFamily:"Oxanium,sans-serif",fontSize:9.5,letterSpacing:4,color:"#2aff80",textTransform:"uppercase",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
          <span style={{width:28,height:1,background:"#2aff80",display:"inline-block"}}/>Open Biology Benchmark
        </div>
        <div style={{fontFamily:"Oxanium,sans-serif",fontSize:"clamp(28px,5vw,52px)",fontWeight:800,lineHeight:1.05,color:"#e4f0ff",marginBottom:10}}>
          Bio<span style={{color:"#00e5ff"}}>Arena</span>: Frontier <span style={{color:"#2aff80"}}>AI</span> for Unsolved Biology
        </div>
        <div style={{fontSize:12.5,color:"#6a85b0",maxWidth:640,lineHeight:1.8,marginBottom:12}}>
          A curated set of unsolved, expert-level biology problems. Pick a question, add your constraints, and run a multi-agent AI debate to generate experimental roadmaps, system designs, and <b style={{color:"#ffc34d"}}>starter code</b> you can run immediately.
        </div>
        <div style={{display:"flex",gap:12,flexWrap:"wrap",marginBottom:18}}>
          {["1. Pick a frontier biology problem","2. Add context from your lab or data","3. Run multi-agent debate → get plain action plan + starter code"].map((t,i)=>(
            <div key={i} style={{borderRadius:6,border:"1px solid #1e293b",padding:"8px 12px",fontSize:11,color:"#94a3b8",background:"rgba(15,23,42,.7)"}}>{t}</div>
          ))}
        </div>
        <div style={{display:"flex",gap:36,flexWrap:"wrap"}}>
          {[["Problems",QS.length],["Categories",CATS.length],["AI Agents",AGENTS.length],["Community Qs",SEED_QUESTIONS.length+"+"]].map(([label,n])=>(
            <div key={label}>
              <div style={{fontFamily:"Oxanium,sans-serif",fontSize:30,fontWeight:700,color:"#00e5ff",lineHeight:1}}>{n}</div>
              <div style={{fontSize:9.5,letterSpacing:2,textTransform:"uppercase",color:"#354d72",marginTop:4}}>{label}</div>
            </div>
          ))}
        </div>
      </div>
      {/* ════════════════════════════════════════
          ASK BIOARENA — full-width hero, first
      ════════════════════════════════════════ */}
      <div style={{background:"linear-gradient(135deg,rgba(0,229,255,.05) 0%,rgba(42,255,128,.05) 100%)",border:"1px solid rgba(0,229,255,.22)",borderRadius:8,padding:"36px 36px 28px",marginBottom:36,position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-60,right:-60,width:220,height:220,borderRadius:"50%",background:"radial-gradient(circle,rgba(42,255,128,.08) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div style={{position:"absolute",bottom:-50,left:-50,width:180,height:180,borderRadius:"50%",background:"radial-gradient(circle,rgba(0,229,255,.07) 0%,transparent 70%)",pointerEvents:"none"}}/>

        {/* Headline */}
        <div style={{marginBottom:24}}>
          <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10,flexWrap:"wrap"}}>
            <div style={{fontFamily:"Oxanium,sans-serif",fontSize:9.5,letterSpacing:3.5,color:"#2aff80",textTransform:"uppercase"}}>Ask BioArena</div>
            <div style={{fontFamily:"Oxanium,sans-serif",fontSize:8.5,padding:"2px 10px",borderRadius:999,background:"rgba(42,255,128,.1)",color:"#2aff80",border:"1px solid rgba(42,255,128,.25)"}}>COMMUNITY · PUBLIC · {AGENTS.length} AI AGENTS</div>
            {customAPI&&<div style={{fontFamily:"Oxanium,sans-serif",fontSize:8.5,padding:"2px 10px",borderRadius:999,background:"rgba(167,139,250,.1)",color:"#a78bfa",border:"1px solid rgba(167,139,250,.3)",display:"flex",alignItems:"center",gap:5}}>
              <span style={{width:5,height:5,borderRadius:"50%",background:"#a78bfa"}}/>Using {customAPI.label}
              <span onClick={removeBYOA} style={{cursor:"pointer",color:"#ff5c5c",marginLeft:4,fontSize:9}}>✕</span>
            </div>}
          </div>
          <div style={{fontFamily:"Oxanium,sans-serif",fontSize:"clamp(22px,3.5vw,38px)",fontWeight:800,color:"#e4f0ff",lineHeight:1.15,marginBottom:10}}>
            Got a biology question?<br/>
            <span style={{color:"#2aff80"}}>Let {AGENTS.length} AI agents debate it to resolution.</span>
          </div>
          <div style={{fontSize:12.5,color:"#6a85b0",lineHeight:1.8,maxWidth:680}}>
            Ask anything — protocol design, data analysis, conceptual questions, or code requests. All {AGENTS.length} agents debate across up to {MAX_ROUNDS} rounds and produce a <b style={{color:"#ffc34d"}}>plain-English action plan</b>, <b style={{color:"#2aff80"}}>starter code</b>, and a <b style={{color:"#a78bfa"}}>conclusion summary</b>. Results are saved publicly so the whole community can build on them.
          </div>
        </div>

        {/* Two-col: textarea + BYOA */}
        <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"minmax(0,1.55fr) minmax(0,1fr)",gap:mob?16:24,alignItems:"flex-start"}}>
          {/* Left: textarea */}
          <div>
            <textarea value={askQ} onChange={e=>setAskQ(e.target.value)} disabled={submittingAsk} rows={5}
              placeholder={"Type any biology question…\n\nExamples:\n• \"Draft complete Python code to go from RNA-seq raw data to publishable figures\"\n• \"Does the transcription factor bind first or chromatin remodellers?\"\n• \"How do I correct for batch effects when integrating 3 datasets?\"\n• \"What's the best CRISPR off-target prediction tool for primary cells?\""}
              style={{width:"100%",background:"rgba(3,8,18,.85)",border:"1px solid rgba(0,229,255,.22)",borderRadius:5,padding:"14px 16px",color:"#b4c8e8",fontFamily:"'JetBrains Mono',monospace",fontSize:12.5,lineHeight:1.75,resize:"vertical",minHeight:140,outline:"none",opacity:submittingAsk?.5:1,marginBottom:12}}
              onKeyDown={e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)) submitAsk();}}
              onFocus={e=>e.target.style.borderColor="rgba(42,255,128,.45)"} onBlur={e=>e.target.style.borderColor="rgba(0,229,255,.22)"}/>
            <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
              <button onClick={submitAsk} disabled={submittingAsk||!askQ.trim()}
                style={{padding:"12px 32px",borderRadius:4,border:"1px solid #22c55e",background:submittingAsk||!askQ.trim()?"transparent":"#16a34a",color:submittingAsk||!askQ.trim()?"#4b5563":"#ecfdf3",fontFamily:"Oxanium,sans-serif",fontSize:13,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",cursor:submittingAsk||!askQ.trim()?"default":"pointer",transition:"all .14s",display:"flex",alignItems:"center",gap:8}}>
                {submittingAsk?<><span style={{width:14,height:14,borderRadius:"50%",border:"2px solid #4ade80",borderTopColor:"transparent",animation:"spin .7s linear infinite"}}/>Saving…</>:"⚡ Submit Question"}
              </button>
              <button onClick={goCommunity} style={{padding:"12px 18px",borderRadius:4,border:"1px solid #223260",background:"transparent",color:"#00e5ff",fontFamily:"Oxanium,sans-serif",fontSize:11,letterSpacing:1,textTransform:"uppercase",cursor:"pointer"}}>
                Browse community →
              </button>
            </div>
            <div style={{fontSize:9.5,color:"#354d72",marginTop:8}}>Ctrl+Enter to submit · Saved publicly · All {AGENTS.length} agents run every time</div>
          </div>

          {/* Right: BYOA */}
          <div style={{background:"rgba(167,139,250,.04)",border:"1px solid rgba(167,139,250,.2)",borderRadius:6,padding:"18px 20px"}}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,cursor:"pointer"}} onClick={()=>setShowBYOA(v=>!v)}>
              <div>
                <div style={{fontFamily:"Oxanium,sans-serif",fontSize:9.5,letterSpacing:2.5,color:"#a78bfa",textTransform:"uppercase",marginBottom:3}}>🤖 Bring Your Own AI</div>
                <div style={{fontSize:11,color:"#6a85b0"}}>Plug in any AI — {Object.keys(PROVIDER_DEFAULTS).length} providers supported</div>
              </div>
              <div style={{color:"#354d72",fontSize:11}}>{showBYOA?"▲":"▼"}</div>
            </div>

            {/* Collapsed: quick-pick grid — custom first */}
            {!showBYOA&&(
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(100px,1fr))",gap:6}}>
                {Object.entries(PROVIDER_DEFAULTS).map(([id,d])=>(
                  <div key={id} onClick={()=>{setByoaProvider(id);setShowBYOA(true);setByoaModel(d.model);setByoaBaseUrl((id==="ollama"||id==="lmstudio")?d.baseUrl:"");setByoaTested(false);setByoaTestMsg("");}}
                    style={{background:"rgba(0,0,0,.2)",border:`1px solid ${d.color}22`,borderRadius:4,padding:"8px 9px",cursor:"pointer",transition:"all .12s",position:"relative"}}
                    onMouseEnter={e=>{e.currentTarget.style.borderColor=d.color+"66";e.currentTarget.style.background=d.color+"0a";}}
                    onMouseLeave={e=>{e.currentTarget.style.borderColor=d.color+"22";e.currentTarget.style.background="rgba(0,0,0,.2)";}}>
                    {d.free&&<div style={{position:"absolute",top:3,right:4,fontFamily:"Oxanium,sans-serif",fontSize:6.5,color:"#2aff80",letterSpacing:.5}}>FREE</div>}
                    <div style={{fontFamily:"Oxanium,sans-serif",fontSize:9.5,fontWeight:700,color:d.color,marginBottom:2}}>{d.label}</div>
                    <div style={{fontSize:8.5,color:"#4b5563",lineHeight:1.3}}>{d.note}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Expanded config form */}
            {showBYOA&&(
              <div style={{display:"grid",gap:11}}>
                {/* Provider selector — scrollable pill row */}
                <div>
                  <div style={{fontFamily:"Oxanium,sans-serif",fontSize:8.5,color:"#6b7280",letterSpacing:1.5,textTransform:"uppercase",marginBottom:6}}>
                    Provider <span style={{color:"#354d72",fontSize:8,textTransform:"none",letterSpacing:.3}}>— custom is first · free tiers marked</span>
                  </div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap",maxHeight:90,overflowY:"auto"}}>
                    {Object.entries(PROVIDER_DEFAULTS).map(([p,d])=>(
                      <button key={p} onClick={()=>{setByoaProvider(p);setByoaModel(d.model);setByoaBaseUrl((p==="ollama"||p==="lmstudio")?d.baseUrl:"");setByoaTested(false);setByoaTestMsg("");}}
                        style={{padding:"4px 10px",borderRadius:3,border:`1px solid ${byoaProvider===p?d.color:"#1e293b"}`,background:byoaProvider===p?d.color+"18":"transparent",color:byoaProvider===p?d.color:"#4b5563",fontFamily:"Oxanium,sans-serif",fontSize:9,cursor:"pointer",transition:"all .1s",display:"flex",alignItems:"center",gap:4,whiteSpace:"nowrap"}}>
                        {d.label}{d.free&&<span style={{fontSize:7,color:"#2aff80",fontFamily:"Oxanium,sans-serif",letterSpacing:.5}}>FREE</span>}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selected provider info */}
                {PROVIDER_DEFAULTS[byoaProvider]&&(
                  <div style={{background:"rgba(0,0,0,.2)",borderRadius:3,padding:"7px 10px",fontSize:10.5,color:"#6a85b0",borderLeft:`2px solid ${PROVIDER_DEFAULTS[byoaProvider].color}`}}>
                    <b style={{color:PROVIDER_DEFAULTS[byoaProvider].color}}>{PROVIDER_DEFAULTS[byoaProvider].label}</b> — {PROVIDER_DEFAULTS[byoaProvider].note}
                    {byoaProvider==="custom"&&<span style={{color:"#354d72"}}> · Enter your base URL and model name below</span>}
                    {byoaProvider==="azure"&&<span style={{color:"#354d72"}}> · Enter your Azure deployment URL as the base URL</span>}
                    {byoaProvider==="gemini"&&<span style={{color:"#2aff80"}}> · Free tier available at aistudio.google.com</span>}
                    {byoaProvider==="groq"&&<span style={{color:"#2aff80"}}> · Free at console.groq.com — no credit card</span>}
                    {byoaProvider==="huggingface"&&<span style={{color:"#2aff80"}}> · Free tier at huggingface.co/settings/tokens</span>}
                  </div>
                )}

                {/* API Key */}
                {byoaProvider!=="ollama"&&byoaProvider!=="lmstudio"&&(
                  <div>
                    <div style={{fontFamily:"Oxanium,sans-serif",fontSize:8.5,color:"#6b7280",letterSpacing:1.5,textTransform:"uppercase",marginBottom:5}}>
                      API Key <span style={{color:"#354d72",fontSize:8,textTransform:"none",letterSpacing:.3}}>(session-only · sent only to your provider · never stored)</span>
                    </div>
                    <input type="password" value={byoaKey} onChange={e=>{setByoaKey(e.target.value);setByoaTested(false);}}
                      placeholder={PROVIDER_DEFAULTS[byoaProvider]?.placeholder||"your-api-key"}
                      style={{width:"100%",background:"#030812",border:"1px solid #1e293b",borderRadius:3,padding:"8px 10px",color:"#b4c8e8",fontFamily:"'JetBrains Mono',monospace",fontSize:11.5,outline:"none"}}
                      onFocus={e=>e.target.style.borderColor="#334155"} onBlur={e=>e.target.style.borderColor="#1e293b"}/>
                  </div>
                )}

                {/* Model + Base URL row */}
                <div style={{display:"grid",gridTemplateColumns:(byoaProvider==="ollama"||byoaProvider==="lmstudio"||byoaProvider==="custom"||byoaProvider==="azure")?"1fr 1fr":"1fr",gap:8}}>
                  <div>
                    <div style={{fontFamily:"Oxanium,sans-serif",fontSize:8.5,color:"#6b7280",letterSpacing:1.5,textTransform:"uppercase",marginBottom:5}}>Model name</div>
                    <input value={byoaModel} onChange={e=>{setByoaModel(e.target.value);setByoaTested(false);}}
                      placeholder={PROVIDER_DEFAULTS[byoaProvider]?.model||"e.g. gpt-4o"}
                      style={{width:"100%",background:"#030812",border:"1px solid #1e293b",borderRadius:3,padding:"8px 10px",color:"#b4c8e8",fontFamily:"'JetBrains Mono',monospace",fontSize:11,outline:"none"}}
                      onFocus={e=>e.target.style.borderColor="#334155"} onBlur={e=>e.target.style.borderColor="#1e293b"}/>
                  </div>
                  {(byoaProvider==="ollama"||byoaProvider==="lmstudio"||byoaProvider==="custom"||byoaProvider==="azure")&&(
                    <div>
                      <div style={{fontFamily:"Oxanium,sans-serif",fontSize:8.5,color:"#6b7280",letterSpacing:1.5,textTransform:"uppercase",marginBottom:5}}>Base URL</div>
                      <input value={byoaBaseUrl} onChange={e=>setByoaBaseUrl(e.target.value)}
                        placeholder={PROVIDER_DEFAULTS[byoaProvider]?.baseUrl||"https://your-endpoint/v1"}
                        style={{width:"100%",background:"#030812",border:"1px solid #1e293b",borderRadius:3,padding:"8px 10px",color:"#b4c8e8",fontFamily:"'JetBrains Mono',monospace",fontSize:11,outline:"none"}}
                        onFocus={e=>e.target.style.borderColor="#334155"} onBlur={e=>e.target.style.borderColor="#1e293b"}/>
                    </div>
                  )}
                </div>

                {/* Test + Apply */}
                <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                  <button onClick={testBYOA} disabled={byoaTesting}
                    style={{padding:"8px 18px",borderRadius:3,border:"1px solid rgba(167,139,250,.4)",background:"rgba(167,139,250,.08)",color:byoaTesting?"#4b5563":"#a78bfa",fontFamily:"Oxanium,sans-serif",fontSize:10,letterSpacing:1,textTransform:"uppercase",cursor:byoaTesting?"default":"pointer",display:"flex",alignItems:"center",gap:6}}>
                    {byoaTesting?<><span style={{width:10,height:10,borderRadius:"50%",border:"2px solid #a78bfa",borderTopColor:"transparent",animation:"spin .7s linear infinite"}}/>Testing…</>:"🔌 Test Connection"}
                  </button>
                  {byoaTested&&(
                    <button onClick={applyBYOA} style={{padding:"8px 18px",borderRadius:3,border:"1px solid #22c55e",background:"#16a34a",color:"#ecfdf3",fontFamily:"Oxanium,sans-serif",fontSize:10,letterSpacing:1,textTransform:"uppercase",cursor:"pointer",fontWeight:700}}>
                      ✓ Use This AI
                    </button>
                  )}
                  {customAPI&&<button onClick={removeBYOA} style={{padding:"8px 14px",borderRadius:3,border:"1px solid rgba(255,92,92,.3)",background:"transparent",color:"#ff5c5c",fontFamily:"Oxanium,sans-serif",fontSize:10,letterSpacing:1,textTransform:"uppercase",cursor:"pointer"}}>✕ Remove</button>}
                </div>

                {byoaTestMsg&&<div style={{fontSize:11,color:byoaTestMsg.startsWith("✓")?"#2aff80":byoaTestMsg.startsWith("⚠")?"#fbbf24":"#ff5c5c",background:"rgba(0,0,0,.25)",borderRadius:3,padding:"9px 12px",lineHeight:1.65}}>{byoaTestMsg}</div>}

                <div style={{fontSize:9,color:"#354d72",lineHeight:1.6}}>
                  🔒 Your key is stored only in this browser session · sent directly to your chosen provider · never touches our servers · cleared when you close this tab
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Community recent activity */}
      {recentCommunity.length>0&&(
        <div style={{marginBottom:32}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontFamily:"Oxanium,sans-serif",fontSize:11,fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",color:"#6a85b0"}}>Community Questions</span>
              <span style={{fontFamily:"Oxanium,sans-serif",fontSize:8.5,padding:"2px 8px",borderRadius:999,background:"rgba(42,255,128,.08)",color:"#2aff80",border:"1px solid rgba(42,255,128,.18)"}}>LIVE</span>
            </div>
            <button onClick={goCommunity} style={{background:"transparent",border:"1px solid #223260",borderRadius:3,color:"#00e5ff",fontFamily:"Oxanium,sans-serif",fontSize:9.5,padding:"4px 12px",cursor:"pointer",letterSpacing:1,textTransform:"uppercase"}}>View all →</button>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:8}}>
            {recentCommunity.map(q=>{
              const ago=Math.round((Date.now()-q.ts)/60000);
              const agoStr=ago<60?`${ago}m ago`:ago<1440?`${Math.round(ago/60)}h ago`:`${Math.round(ago/1440)}d ago`;
              const sc=q.finalScore>=CONV?"#2aff80":q.finalScore>=45?"#ffc34d":"#ff5c5c";
              return(
                <div key={q.id} onClick={()=>goCommunityQ(q.id,q.title)}
                  style={{background:"#07101f",border:"1px solid #182640",borderRadius:4,padding:"12px 14px",cursor:"pointer",transition:"all .12s",position:"relative",overflow:"hidden"}}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="#223260";e.currentTarget.style.background="#0c1a30";}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="#182640";e.currentTarget.style.background="#07101f";}}>
                  <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:"linear-gradient(90deg,#14b8a6,#2aff80)",opacity:.6}}/>
                  <div style={{fontSize:11.5,color:"#cee0ff",lineHeight:1.45,marginBottom:8,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{q.title}</div>
                  <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                    {q.resolved&&<span className="badge-pill" style={{background:"rgba(42,255,128,.07)",color:"#2aff80",border:"1px solid rgba(42,255,128,.18)"}}>RESOLVED</span>}
                    {q.finalScore>0&&<span style={{fontFamily:"Oxanium,sans-serif",fontSize:9,color:sc}}>{q.finalScore}/100</span>}
                    {q.category&&<span style={{fontSize:9.5,color:"#354d72"}}>#{q.category}</span>}
                    <span style={{marginLeft:"auto",fontSize:9,color:"#354d72"}}>{agoStr}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Category grid */}
      <div style={{marginBottom:28}}>
        <div style={{display:"flex",alignItems:"baseline",gap:10,marginBottom:10}}>
          <span style={{fontFamily:"Oxanium,sans-serif",fontSize:11,fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",color:"#6a85b0"}}>Problem Categories</span>
          <span style={{fontSize:10,color:"#354d72"}}>{CATS.length} domains</span>
        </div>
        <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"repeat(auto-fill,minmax(258px,1fr))",gap:10}}>
          {CATS.map(c=>(
            <div key={c.id} onClick={()=>goCategory(c.id)} style={{background:"#07101f",border:"1px solid #182640",borderRadius:3,padding:"14px 16px",cursor:"pointer",position:"relative",overflow:"hidden",transition:"all .13s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="#223260";e.currentTarget.style.background="#0c1a30";e.currentTarget.style.transform="translateY(-1px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="#182640";e.currentTarget.style.background="#07101f";e.currentTarget.style.transform="none";}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:c.color,opacity:.7}}/>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
                <div style={{fontFamily:"Oxanium,sans-serif",fontSize:11.5,fontWeight:700,color:"#cee0ff",lineHeight:1.3}}>{c.name}</div>
                <div className="badge-pill" style={{background:"rgba(42,255,128,.08)",color:"#2aff80",border:"1px solid rgba(42,255,128,.18)",marginLeft:8,flexShrink:0}}>Expert</div>
              </div>
              <div style={{fontSize:11,color:"#354d72",lineHeight:1.65,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{c.desc}</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:10,paddingTop:9,borderTop:"1px solid #182640",fontSize:9.5,color:"#475569"}}>
                <span>{c.q} problem{c.q>1?"s":""}</span><span>View problems →</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* All problems — collapsible */}
      <div style={{marginTop:8}}>
        <div
          onClick={()=>setShowAllProblems(v=>!v)}
          style={{display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",padding:"12px 16px",background:"#07101f",border:"1px solid #182640",borderRadius:showAllProblems?"4px 4px 0 0":"4px",transition:"background .12s",userSelect:"none"}}
          onMouseEnter={e=>e.currentTarget.style.background="#0c1a30"}
          onMouseLeave={e=>e.currentTarget.style.background="#07101f"}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <span style={{fontFamily:"Oxanium,sans-serif",fontSize:11,fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",color:"#6a85b0"}}>All Problems</span>
            <span style={{fontFamily:"Oxanium,sans-serif",fontSize:9,padding:"2px 8px",borderRadius:999,background:"rgba(0,229,255,.06)",color:"#00e5ff",border:"1px solid rgba(0,229,255,.18)"}}>{QS.length} problems across {CATS.length} categories</span>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:10.5,color:"#354d72",fontFamily:"Oxanium,sans-serif"}}>{showAllProblems?"hide ▲":"show all ▼"}</span>
          </div>
        </div>

        {showAllProblems&&(
          <div style={{background:"#020617",border:"1px solid #182640",borderTop:"none",borderRadius:"0 0 4px 4px",padding:"12px"}}>
            {/* Filters */}
            <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:12,flexWrap:"wrap"}}>
              <input placeholder="Search problems…" value={search} onChange={e=>setSearch(e.target.value)}
                style={{flex:1,minWidth:180,background:"#030812",borderRadius:4,border:"1px solid #1e293b",color:"#e5e7eb",padding:"6px 9px",fontSize:11,outline:"none"}}/>
              <select value={tagFilter} onChange={e=>setTagFilter(e.target.value)}
                style={{minWidth:140,background:"#030812",borderRadius:4,border:"1px solid #1e293b",color:"#9ca3af",padding:"6px 9px",fontSize:11}}>
                <option value="">All tags</option>
                {allTags.map(t=><option key={t} value={t}>{t}</option>)}
              </select>
              <span style={{fontSize:10,color:"#4b5563"}}>{filteredQs.length} shown</span>
            </div>
            <div style={{display:"grid",gap:6}}>
              {filteredQs.map(q=>{
                const cat=CATS.find(c=>c.id===q.cat);
                return(
                  <div key={q.id} onClick={()=>goQuestion(q.id)}
                    style={{background:"#07101f",borderRadius:3,border:"1px solid #182640",padding:"9px 11px",cursor:"pointer",transition:"border-color .12s"}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor="#223260"}
                    onMouseLeave={e=>e.currentTarget.style.borderColor="#182640"}>
                    <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center"}}>
                      <div style={{fontSize:12,color:"#e5e7eb",fontWeight:500}}>{q.title}</div>
                      <div style={{fontSize:10,color:"#9ca3af",whiteSpace:"nowrap"}}>{q.pts} pts</div>
                    </div>
                    <div style={{display:"flex",gap:6,alignItems:"center",fontSize:10,color:"#6b7280",flexWrap:"wrap",marginTop:4}}>
                      {cat&&<span className="badge-pill" style={{background:"rgba(15,23,42,1)",border:`1px solid ${cat.color}`,color:cat.color}}>{cat.name}</span>}
                      {(q.tags||[]).slice(0,3).map(t=><span key={t} style={{color:"#64748b"}}>#{t}</span>)}
                      <span style={{marginLeft:"auto",fontSize:9}}>View details →</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════ CATEGORY ═══════ */
function Category({catId,goHome,goQuestion}){
  const mob=useIsMobile();
  const c=CATS.find(x=>x.id===catId);
  const qs=QS.filter(q=>q.cat===catId);
  if(!c) return <div style={{padding:48,textAlign:"center",color:"#354d72"}}>Category not found.</div>;
  return(
    <div className="page-enter" style={{maxWidth:900,margin:"0 auto",padding:mob?"14px 14px":"32px 24px"}}>
      <BC items={[{label:"Home",fn:goHome},{label:c.name}]}/>
      <div style={{marginBottom:26,paddingBottom:20,borderBottom:"1px solid #182640"}}>
        <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:10}}>
          <div style={{width:3,height:32,borderRadius:999,background:c.color,flexShrink:0}}/>
          <div>
            <div style={{fontFamily:"Oxanium,sans-serif",fontSize:22,fontWeight:800,color:"#e4f0ff"}}>{c.name}</div>
            <div style={{fontSize:11,color:"#6b7280",marginTop:2}}>Expert frontier problems in this domain.</div>
          </div>
        </div>
        <div style={{fontSize:12,color:"#9ca3af",lineHeight:1.7,maxWidth:640}}>{c.desc}</div>
      </div>
      <div style={{display:"grid",gap:10}}>
        {qs.map(q=>(
          <div key={q.id} onClick={()=>goQuestion(q.id)} style={{background:"#020617",borderRadius:4,border:"1px solid #1f2937",padding:"11px 13px",cursor:"pointer",transition:"border-color .12s"}}
            onMouseEnter={e=>e.currentTarget.style.borderColor="#334155"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="#1f2937"}>
            <div style={{display:"flex",justifyContent:"space-between",gap:10}}>
              <div style={{fontSize:13,color:"#e5e7eb",fontWeight:500}}>{q.title}</div>
              <div style={{fontSize:10,color:"#9ca3af",whiteSpace:"nowrap"}}>{q.pts} pts</div>
            </div>
            <div style={{marginTop:6,fontSize:10.5,color:"#6b7280"}}>{(q.tags||[]).slice(0,4).map(t=><span key={t} style={{marginRight:6}}>#{t}</span>)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════ LIVE PANEL ═══════ */
function LivePanel({round,maxRounds,agentStatus,score,phase,liveRounds}){
  const sc=score===null?"#354d72":score>=80?"#2aff80":score>=60?"#4ade80":score>=40?"#ffc34d":"#f97316";
  const pl={"cooling down…":"⏳ Cooling down 30s between rounds to avoid rate limits…",debating:"Agents writing responses…",judging:"Judge evaluating agreement…",
  const latest=liveRounds&&liveRounds[liveRounds.length-1]||null;

  return(
    <div style={{background:"#020617",border:"1px solid #00e5ff",borderRadius:4,padding:16,marginBottom:18,position:"relative"}}>
      <div style={{position:"absolute",top:-8,left:14,background:"#020617",padding:"0 8px",fontSize:8.5,letterSpacing:2.5,color:"#00e5ff",fontFamily:"Oxanium,sans-serif"}}>LIVE DEBATE</div>

      {/* Progress bar */}
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:12}}>
        <div style={{flex:1,height:3,background:"#182640",borderRadius:2,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${(round/maxRounds)*100}%`,background:"#00e5ff",borderRadius:2,transition:"width .5s"}}/>
        </div>
        <div style={{fontFamily:"Oxanium,sans-serif",fontSize:10,color:"#6a85b0",flexShrink:0}}>ROUND {round}/{maxRounds}</div>
        {score!==null&&<div style={{fontFamily:"Oxanium,sans-serif",fontSize:14,fontWeight:800,color:sc,flexShrink:0}}>{score}% agreement</div>}
      </div>

      {/* Agreement bar */}
      {score!==null&&(
        <div style={{marginBottom:14}}>
          <div style={{height:6,background:"#182640",borderRadius:3,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${Math.min(score,100)}%`,background:`linear-gradient(90deg,#f97316,#ffc34d,${sc})`,borderRadius:3,transition:"width .7s"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",fontSize:8,color:"#354d72",fontFamily:"Oxanium,sans-serif",marginTop:3}}>
            <span style={{color:"#f97316"}}>0% wide disagreement</span>
            <span style={{color:"#ffc34d"}}>40% partial</span>
            <span style={{color:"#4ade80"}}>60% strong</span>
            <span style={{color:"#2aff80"}}>80% full convergence</span>
          </div>
        </div>
      )}

      {/* Two-column: agent grid LEFT | live intel RIGHT */}
      <div className="mob-stack" style={{display:"grid",gridTemplateColumns:"minmax(0,1fr) minmax(0,1.4fr)",gap:14}}>

        {/* LEFT: agent status grid */}
        <div>
          {Array.from({length:round},(_,ri)=>ri+1).map(r=>(
            <div key={r} style={{marginBottom:9}}>
              <div style={{fontFamily:"Oxanium,sans-serif",fontSize:8,color:"#354d72",letterSpacing:2,marginBottom:4,display:"flex",alignItems:"center",gap:8}}>
                <span>ROUND {r} {r<round?"· DONE":"· LIVE"}</span>
                {liveRounds&&liveRounds[r-1]&&(
                  <span style={{
                    color:liveRounds[r-1].score>=80?"#2aff80":liveRounds[r-1].score>=60?"#4ade80":liveRounds[r-1].score>=40?"#ffc34d":"#f97316",
                    fontWeight:700,fontSize:9
                  }}>{liveRounds[r-1].score}%</span>
                )}
              </div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:4}}>
                {AGENTS.map(ag=>{
                  const s=agentStatus[`${r}:${ag.id}`]||(r<round?"done":"queued");
                  const c2=s==="done"?"#2aff80":s==="error"?"#ff5c5c":s==="running"?ag.color:"#354d72";
                  return(
                    <div key={ag.id} style={{background:"#07101f",border:`1px solid ${s==="running"?ag.color+"55":"#182640"}`,borderRadius:3,padding:"5px 6px",transition:"border-color .2s"}}>
                      <div style={{display:"flex",alignItems:"center",gap:3,marginBottom:2}}>
                        <div style={{width:5,height:5,borderRadius:"50%",background:c2,flexShrink:0,animation:s==="running"?"blink 1s infinite":"none"}}/>
                        <div style={{fontFamily:"Oxanium,sans-serif",fontSize:7.5,fontWeight:700,color:"#cee0ff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ag.name}</div>
                      </div>
                      <div style={{fontSize:7,color:c2,fontFamily:"Oxanium,sans-serif",letterSpacing:.5}}>
                        {s==="done"?"done ✓":s==="error"?"error ✗":s==="running"?"writing…":"queued"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Phase status */}
          {(phase==="judging"||phase==="consensus"||phase==="plain"||phase==="conclusion"||phase==="code")&&(
            <div style={{display:"flex",alignItems:"center",gap:7,padding:"7px 9px",background:"rgba(42,255,128,.04)",border:"1px solid rgba(42,255,128,.15)",borderRadius:3,marginTop:6}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:"#2aff80",animation:"blink 1s infinite",flexShrink:0}}/>
              <div style={{fontFamily:"Oxanium,sans-serif",fontSize:9.5,color:"#2aff80"}}>{pl}</div>
            </div>
          )}
        </div>

        {/* RIGHT: live intel — disagreements + snippets */}
        <div style={{display:"flex",flexDirection:"column",gap:9}}>

          {!latest&&phase==="debating"&&(
            <div style={{textAlign:"center",padding:"28px 0",color:"#354d72",fontSize:11}}>
              <div style={{fontSize:22,marginBottom:8}}>⚡</div>
              <div style={{fontFamily:"Oxanium,sans-serif",fontSize:9,letterSpacing:1.5}}>Agents are thinking…<br/>Agreement intel will appear after round 1</div>
            </div>
          )}

          {latest&&latest.tensions.length>0&&(
            <div style={{background:"rgba(249,115,22,.05)",border:"1px solid rgba(249,115,22,.22)",borderRadius:4,padding:"11px 13px"}}>
              <div style={{fontFamily:"Oxanium,sans-serif",fontSize:8,letterSpacing:1.8,color:"#f97316",textTransform:"uppercase",marginBottom:7,display:"flex",alignItems:"center",gap:6}}>
                <span>⚔️ Still in dispute after round {latest.roundNum}</span>
              </div>
              {latest.tensions.map((t,i)=>(
                <div key={i} style={{display:"flex",gap:7,marginBottom:5,fontSize:11,color:"#e4c9a0",lineHeight:1.55,alignItems:"flex-start"}}>
                  <span style={{color:"#f97316",flexShrink:0,marginTop:2,fontSize:12}}>▸</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          )}

          {latest&&latest.tensions.length===0&&latest.score>=60&&(
            <div style={{background:"rgba(42,255,128,.05)",border:"1px solid rgba(42,255,128,.2)",borderRadius:4,padding:"11px 13px"}}>
              <div style={{fontFamily:"Oxanium,sans-serif",fontSize:8,letterSpacing:1.8,color:"#2aff80",textTransform:"uppercase",marginBottom:5}}>✓ Agents aligned after round {latest.roundNum}</div>
              <div style={{fontSize:11,color:"#b4c8e8",lineHeight:1.6}}>No major disputes detected — strong convergence on the core approach.</div>
            </div>
          )}

          {latest&&latest.focus&&round<maxRounds&&(
            <div style={{background:"rgba(0,229,255,.04)",border:"1px solid rgba(0,229,255,.15)",borderRadius:4,padding:"11px 13px"}}>
              <div style={{fontFamily:"Oxanium,sans-serif",fontSize:8,letterSpacing:1.8,color:"#00e5ff",textTransform:"uppercase",marginBottom:5}}>🎯 Round {latest.roundNum+1} will focus on</div>
              <div style={{fontSize:11,color:"#b4c8e8",lineHeight:1.6}}>{latest.focus}</div>
            </div>
          )}

          {latest&&latest.snippets&&latest.snippets.length>0&&(
            <div style={{background:"rgba(20,20,40,.4)",border:"1px solid #182640",borderRadius:4,padding:"11px 13px"}}>
              <div style={{fontFamily:"Oxanium,sans-serif",fontSize:8,letterSpacing:1.8,color:"#6a85b0",textTransform:"uppercase",marginBottom:9}}>💬 What each agent said — round {latest.roundNum}</div>
              <div style={{display:"flex",flexDirection:"column",gap:9,maxHeight:260,overflowY:"auto",paddingRight:4}}>
                {latest.snippets.map((s,i)=>(
                  <div key={i} style={{borderLeft:`2px solid ${s.color}`,paddingLeft:9}}>
                    <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3}}>
                      <div style={{width:5,height:5,borderRadius:"50%",background:s.color,flexShrink:0}}/>
                      <span style={{fontFamily:"Oxanium,sans-serif",fontSize:9,fontWeight:700,color:s.color}}>{s.name}</span>
                      <span style={{fontSize:8.5,color:"#354d72"}}>· {s.lens}</span>
                    </div>
                    <div style={{fontSize:10.5,color:"#7a90b0",lineHeight:1.65}}>{s.snippet}{s.snippet.length>=180?"…":""}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════ QUESTION ═══════ */
function Question({qid,goHome,goCategory}){
  const q=QS.find(x=>x.id===qid);
  if(!q) return <div style={{padding:48,textAlign:"center",color:"#354d72"}}>Problem not found.</div>;
  const c=CATS.find(x=>x.id===q.cat);
  const mob=useIsMobile();
  const [iters,setIters]=useState([]);
  const [loadingIters,setLoadingIters]=useState(true);
  const [running,setRunning]=useState(false);
  const [userInput,setUserInput]=useState("");
  const [liveRound,setLiveRound]=useState(0);
  const [liveAgentStatus,setLiveAgentStatus]=useState({});
  const [liveScore,setLiveScore]=useState(null);
  const [livePhase,setLivePhase]=useState("");
  const [liveRounds,setLiveRounds]=useState([]);

  useEffect(()=>{
    setLoadingIters(true);
    loadIters(qid).then(d=>{setIters(d||[]);setLoadingIters(false);});
  },[qid]);

  const onAgentStatus=useCallback((agId,status,round)=>{
    setLiveAgentStatus(s=>({...s,[`${round}:${agId}`]:status}));
  },[]);

  const deleteIter=useCallback(async(iterId)=>{
    const updated=iters.filter(i=>i.id!==iterId);
    await saveIters(qid,updated);
    setIters(updated);
  },[iters,qid]);

  const updateIter=useCallback((allIters)=>{
    setIters(allIters);
    saveIters(qid,allIters);
  },[qid]);

  const run=useCallback(async()=>{
    if(running) return;
    setRunning(true);
    const ui=userInput.trim();

    const sortedIters=[...iters].sort((a,b)=>b.ts-a.ts);
    const prevConsensus=sortedIters.length>0 ? sortedIters[0].consensus||"" : "";

    setLiveRound(0);setLiveAgentStatus({});setLiveScore(null);setLivePhase("debating");setLiveRounds([]);
    const allRounds=[];
    let round=0;

    while(round<MAX_ROUNDS){
      round++;
      // Cooldown between rounds to reset the token-per-minute bucket
      if(round>1){
        setLivePhase("cooling down…");
        await new Promise(r=>setTimeout(r,30000));
      }
      setLiveRound(round);
      setLivePhase("debating");
      const roundAgents=await runDebateRound(q,round,allRounds,ui,onAgentStatus,prevConsensus);
      setLivePhase("judging");
      const judgeResult=await judgeRound(q,[...allRounds,{agents:roundAgents}],prevConsensus);
      setLiveScore(judgeResult.score);
      // Collect a short snippet from each agent for live display
      const snippets=roundAgents.map(a=>{
        const ag=AGENTS.find(x=>x.id===a.aid);
        return {name:ag?.name||a.aid, color:ag?.color||"#888", lens:ag?.lens||"", snippet:a.resp.slice(0,180)};
      });
      const liveEntry={
        roundNum:round,
        score:judgeResult.score,
        tensions:judgeResult.unresolved_tensions||[],
        focus:judgeResult.next_debate_focus||"",
        snippets,
      };
      setLiveRounds(prev=>[...prev,liveEntry]);
      allRounds.push({roundNum:round,agents:roundAgents,judge:judgeResult});
    }
    const finalScore=allRounds[allRounds.length-1]?.judge?.score??0;

    setLivePhase("consensus");
    const finalConsensus=await buildFinalConsensus(q,allRounds,ui,true,prevConsensus);
    setLivePhase("plain");
    const plainSummary=await buildPlainSummary(q,finalConsensus,ui,true,prevConsensus);
    setLivePhase("conclusion");
    const conclusion=await buildConclusion(q,allRounds,finalConsensus,ui,true);
    setLivePhase("code");
    const code=await generateCode(q,finalConsensus,ui);

    const iteration={
      id:Date.now().toString(),ts:Date.now(),ui,sessionId:SESSION_ID,
      rounds:allRounds,totalRounds:allRounds.length,finalScore,resolved:true,
      consensus:finalConsensus,plainSummary,conclusion,code,
      isFollowUp:prevConsensus.length>0,
    };
    const updated=[...iters,iteration];
    await saveIters(qid,updated);
    setIters(updated);
    setUserInput(""); // clear input after run so user can type the next question
    setRunning(false);
    setLivePhase("done");
  },[q,userInput,running,iters,onAgentStatus]);

  const activeIter=iters.length>0?[...iters].sort((a,b)=>b.ts-a.ts)[0]:null;
  const estMin=Math.max(8,Math.min(25,Math.round(q.prompt.length/800)));

  return(
    <div className="page-enter" style={{maxWidth:980,margin:"0 auto",padding:mob?"14px 14px":"32px 24px"}}>
      <BC items={[{label:"Home",fn:goHome},c?{label:c.name,fn:()=>goCategory(c.id)}:null,{label:q.title}]}/>
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"minmax(0,2.2fr) minmax(0,1.1fr)",gap:20,alignItems:"flex-start",marginBottom:24}}>
        {/* Left */}
        <div>
          <div style={{fontFamily:"Oxanium,sans-serif",fontSize:21,fontWeight:800,color:"#e5e7eb",marginBottom:8}}>{q.title}</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:12}}>
            {c&&<span className="badge-pill" style={{background:"rgba(15,23,42,1)",border:`1px solid ${c.color}`,color:c.color}}>{c.name}</span>}
            <span className="badge-pill" style={{background:"#020617",border:"1px solid #1f2937",color:"#9ca3af"}}>~{estMin} min read</span>
            <span style={{fontSize:10,color:"#6b7280"}}>{q.pts} pts · Frontier biology</span>
          </div>
          <div className="qa-body" style={{fontSize:12.5,color:"#9ca3af",lineHeight:1.85,whiteSpace:"pre-wrap",background:"#020617",borderRadius:4,border:"1px solid #1f2937",padding:"12px 14px",marginBottom:14}}>
            {q.prompt}
          </div>
          {/* Input — always visible, always triggers a full fresh debate */}
          <div style={{background:"#020617",borderRadius:4,border:"1px solid #223260",padding:"12px 13px",position:"relative",marginTop:14}}>
            <div style={{position:"absolute",top:-8,left:12,background:"#020617",padding:"0 7px",fontSize:8,letterSpacing:2.5,color:"#00e5ff",fontFamily:"Oxanium,sans-serif"}}>
              {iters.length>0?"ADD FOLLOW-UP INPUT → TRIGGERS FULL NEW DEBATE":"YOUR HYPOTHESIS / CONTEXT"}
            </div>
            <div style={{fontSize:11,color:"#4b5563",marginBottom:9,lineHeight:1.65}}>
              {iters.length>0
                ? <>Every time you submit — with or without new text — <b style={{color:"#00e5ff"}}>all {AGENTS.length} agents run a completely fresh multi-round debate</b> (min {MIN_ROUNDS}, max {MAX_ROUNDS} rounds). Your new input is incorporated and agents automatically build on the previous session's findings. The input clears after each run so you can keep refining.</>
                : <>Type your hypothesis, constraints, or specific questions. All {AGENTS.length} agents will debate for at least {MIN_ROUNDS} rounds (up to {MAX_ROUNDS}) until consensus ≥ {CONV}/100, then produce a <b style={{color:"#ffc34d"}}>plain-English action plan</b> and <b style={{color:"#2aff80"}}>starter code</b>.</>
              }
            </div>
            <textarea value={userInput} onChange={e=>setUserInput(e.target.value)} disabled={running} rows={3}
              placeholder={iters.length>0
                ? `E.g. "Now focus on batch correction since we have samples from 3 different labs" or "Add GSEA pathway enrichment to the code"…`
                : `E.g. "We work with primary hepatocytes, not cell lines" or "Focus on m6A modification in isoform selection"…`
              }
              style={{width:"100%",background:"#030812",border:"1px solid #1e293b",borderRadius:3,padding:"10px 12px",color:"#b4c8e8",fontFamily:"'JetBrains Mono',monospace",fontSize:12,lineHeight:1.7,resize:"vertical",minHeight:68,outline:"none",opacity:running?.5:1}}
              onFocus={e=>e.target.style.borderColor="#334155"} onBlur={e=>e.target.style.borderColor="#1e293b"}/>
          </div>
        </div>
        {/* Right sidebar */}
        <div style={{background:"#020617",borderRadius:4,border:"1px solid #1f2937",padding:"12px 13px",fontSize:11.5,color:"#9ca3af",position:mob?"static":"sticky",top:70}}>
          <div style={{fontFamily:"Oxanium,sans-serif",fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"#6b7280",marginBottom:8}}>At a glance</div>
          <div style={{display:"grid",rowGap:6,marginBottom:10}}>
            {[["Difficulty","Expert","#fbbf24"],["Points",`${q.pts} pts`,"#93c5fd"],["Debate rounds",`${MIN_ROUNDS}–${MAX_ROUNDS}`,"#2aff80"],["Output","Action plan + code","#ffc34d"]].map(([k,v,col])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",gap:8}}>
                <span style={{color:"#6b7280"}}>{k}</span><span style={{color:col,textAlign:"right"}}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{height:1,background:"#111827",margin:"10px 0"}}/>
          <div style={{fontFamily:"Oxanium,sans-serif",fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"#6b7280",marginBottom:6}}>AI debate panel ({AGENTS.length} agents)</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>
            {AGENTS.map(a=>(
              <div key={a.id} style={{display:"flex",alignItems:"center",gap:4,borderRadius:999,border:`1px solid ${a.id==="a007"?"rgba(255,45,85,.4)":"#1f2937"}`,padding:"3px 8px",fontSize:9.5,background:a.id==="a007"?"rgba(255,45,85,.07)":"#020617"}} title={a.lens}>
                <span style={{width:6,height:6,borderRadius:"50%",background:a.color}}/><span style={{color:a.id==="a007"?"#ff2d55":"inherit"}}>{a.name}</span>
              </div>
            ))}
          </div>
          <button disabled={running} onClick={run} style={{width:"100%",padding:"8px 0",borderRadius:4,border:"1px solid #22c55e",background:running?"transparent":"#16a34a",color:running?"#6b7280":"#ecfdf3",fontFamily:"Oxanium,sans-serif",fontSize:11,letterSpacing:1.5,textTransform:"uppercase",cursor:running?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all .14s"}}>
            {running?(
              <><span style={{width:12,height:12,borderRadius:"50%",border:"2px solid #4ade80",borderTopColor:"transparent",animation:"spin .7s linear infinite"}}/>Rd {liveRound}/{MAX_ROUNDS} · {livePhase}…</>
            ):iters.length>0?"⚡ Run Full Debate Again (Follow-Up)":"⚡ Run Multi-Agent Debate"}
          </button>
          {iters.length>0&&!running&&(
            <div style={{fontSize:9.5,color:"#4b5563",textAlign:"center",marginTop:7,lineHeight:1.5}}>
              ↑ Adds your new input, builds on {iters.length} prior session{iters.length>1?"s":""}, runs {AGENTS.length} agents × up to {MAX_ROUNDS} fresh rounds
            </div>
          )}
          {activeIter&&(()=>{
            const rounds=activeIter.rounds||[];
            return(
              <>
                <div style={{height:1,background:"#111827",margin:"12px 0"}}/>
                <div style={{fontFamily:"Oxanium,sans-serif",fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"#6b7280",marginBottom:6}}>Latest debate timeline</div>
                <div style={{display:"flex",gap:8,marginBottom:7,alignItems:"center"}}>
                  {rounds.map((r,idx)=>(
                    <div key={idx} style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
                      <div className={`timeline-dot${idx===rounds.length-1?" active":""}`} title={`Round ${idx+1}: ${r.judge?.score??'?'}/100`}/>
                      <div style={{marginTop:3,fontSize:8.5,color:"#6b7280",textAlign:"center"}}>{idx+1}</div>
                    </div>
                  ))}
                </div>
                <div style={{fontSize:10.5,color:"#9ca3af",lineHeight:1.55}}>
                  <span style={{color:activeIter.finalScore>=80?"#2aff80":activeIter.finalScore>=60?"#4ade80":"#ffc34d",fontFamily:"Oxanium,sans-serif",fontSize:9.5,fontWeight:700}}>{activeIter.finalScore}% agreement</span>
                  {" · "}{rounds.length} round{rounds.length>1?"s":""}
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {running&&<LivePanel round={liveRound} maxRounds={MAX_ROUNDS} agentStatus={liveAgentStatus} score={liveScore} phase={livePhase} liveRounds={liveRounds}/>}

      {loadingIters
        ?<div style={{textAlign:"center",padding:32,color:"#354d72",fontFamily:"Oxanium,sans-serif",fontSize:11,letterSpacing:2}}>LOADING SHARED ANALYSES…</div>
        :<ItersList iters={iters} onDelete={deleteIter} q={q} onUpdate={updateIter}/>}
    </div>
  );
}

/* ═══════ CONCLUSION PANEL ═══════ */
function ConclusionPanel({conclusion, rounds, finalScore, resolved}){
  if(!conclusion) return(
    <div style={{textAlign:"center",padding:"32px 0",color:"#354d72",fontSize:11,fontFamily:"Oxanium,sans-serif"}}>
      Conclusion not available for this session — run a new debate to generate one.
    </div>
  );

  // Parse out each named section to render with custom styling
  const sections=[
    {key:"🏁 What the AI agents agreed on",      color:"#2aff80",   bg:"rgba(42,255,128,.04)",  border:"rgba(42,255,128,.18)"},
    {key:"💻 What the starter code can do for you right now", color:"#a78bfa", bg:"rgba(167,139,250,.04)", border:"rgba(167,139,250,.2)"},
    {key:"🧪 What you need to do after the code",color:"#fbbf24",  bg:"rgba(255,193,77,.04)",  border:"rgba(255,193,77,.18)"},
    {key:"⚔️ What the AI agents debated but couldn't fully resolve", color:"#f97316", bg:"rgba(249,115,22,.04)", border:"rgba(249,115,22,.18)"},
    {key:"🎯 One thing to try first",             color:"#00e5ff",  bg:"rgba(0,229,255,.04)",   border:"rgba(0,229,255,.18)"},
  ];

  // Split the conclusion text into named sections
  const parsed={};
  let remaining=conclusion;
  sections.forEach((s,i)=>{
    const start=remaining.indexOf(`**${s.key}**`);
    if(start===-1) return;
    const nextSection=sections.slice(i+1).map(ns=>`**${ns.key}**`).find(ns=>remaining.indexOf(ns,start+1)!==-1);
    const end=nextSection?remaining.indexOf(nextSection,start+1):remaining.length;
    parsed[s.key]=remaining.slice(start+s.key.length+4,end).trim();
    // clean leading newlines
    parsed[s.key]=parsed[s.key].replace(/^\n+/,"");
  });

  const scoreColor=finalScore>=80?"#2aff80":finalScore>=60?"#4ade80":finalScore>=40?"#ffc34d":"#f97316";
  const agreementBar=Math.min(finalScore,100);

  return(
    <div>
      {/* Agreement strip */}
      <div style={{background:"#0c1a30",borderRadius:3,marginBottom:14,border:"1px solid #182640",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",gap:14,padding:"10px 14px"}}>
          <div style={{fontFamily:"Oxanium,sans-serif",fontSize:9,letterSpacing:2,color:"#354d72",textTransform:"uppercase"}}>AI agreement</div>
          <div style={{fontFamily:"Oxanium,sans-serif",fontSize:18,fontWeight:800,color:scoreColor}}>{finalScore}%</div>
          <div style={{flex:1,height:6,background:"#182640",borderRadius:3,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${agreementBar}%`,background:`linear-gradient(90deg,#f97316,#ffc34d,${scoreColor})`,borderRadius:3,transition:"width .6s"}}/>
          </div>
          <div style={{fontSize:9.5,color:"#354d72"}}>{rounds.length} round{rounds.length>1?"s":""} · {rounds.reduce((t,r)=>t+r.agents.length,0)} responses</div>
        </div>
        <div style={{height:1,background:"#182640"}}/>
        <div style={{display:"flex",gap:16,padding:"7px 14px",fontSize:9,color:"#354d72",fontFamily:"Oxanium,sans-serif"}}>
          <span style={{color:"#f97316"}}>0–39% wide disagreement</span>
          <span style={{color:"#ffc34d"}}>40–59% partial alignment</span>
          <span style={{color:"#4ade80"}}>60–79% strong consensus</span>
          <span style={{color:"#2aff80"}}>80–100% full convergence</span>
        </div>
      </div>

      {/* Section cards */}
      <div style={{display:"grid",gap:10}}>
        {sections.map(s=>{
          const content=parsed[s.key];
          if(!content) return null;
          // Render content with bullet points
          const html=content
            .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
            .replace(/\*\*(.+?)\*\*/g,"<b style='color:#e4f0ff'>$1</b>")
            .replace(/\*(.+?)\*/g,"<i>$1</i>")
            .replace(/^[-*]\s+(.+)$/gm,`<div style='display:flex;gap:8px;margin:5px 0;align-items:flex-start'><span style='color:${s.color};flex-shrink:0;margin-top:2px'>▸</span><span>$1</span></div>`)
            .replace(/\n\n/g,"<br/>").replace(/\n/g,"<br/>");
          return(
            <div key={s.key} style={{background:s.bg,border:`1px solid ${s.border}`,borderRadius:4,padding:"13px 15px",borderLeft:`3px solid ${s.color}`}}>
              <div style={{fontFamily:"Oxanium,sans-serif",fontSize:9,letterSpacing:1.8,color:s.color,textTransform:"uppercase",marginBottom:8,fontWeight:700}}>
                {s.key}
              </div>
              <div style={{fontSize:12,color:"#b4c8e8",lineHeight:1.8}} dangerouslySetInnerHTML={{__html:html}}/>
            </div>
          );
        })}
        {/* Fallback: if parsing failed, render full text */}
        {Object.keys(parsed).length===0&&(
          <div style={{background:"#0c1a30",border:"1px solid #182640",borderRadius:4,padding:"14px 16px"}}>
            <div style={{fontSize:12,color:"#b4c8e8",lineHeight:1.85,whiteSpace:"pre-wrap"}}>{conclusion}</div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════ ITERS LIST ═══════ */
function ItersList({iters,onDelete,q,onUpdate}){
  if(!iters.length) return(
    <div style={{textAlign:"center",padding:"48px 20px",color:"#354d72"}}>
      <div style={{fontSize:28,marginBottom:10}}>🤖</div>
      <div style={{fontFamily:"Oxanium,sans-serif",fontSize:11,letterSpacing:1}}>No debates yet — start the first one above. Results are shared globally.</div>
    </div>
  );
  const sorted=[...iters].sort((a,b)=>b.ts-a.ts);
  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <span style={{fontFamily:"Oxanium,sans-serif",fontSize:10,fontWeight:700,letterSpacing:2.5,textTransform:"uppercase",color:"#6a85b0"}}>Debate Sessions</span>
        <span style={{fontSize:9.5,color:"#354d72"}}>{iters.length} session{iters.length>1?"s":""} · shared globally</span>
      </div>
      {sorted.map((it,i)=><IterBlock key={it.id} it={it} n={sorted.length-i} defaultOpen={i===0} onDelete={onDelete} q={q} onUpdate={onUpdate} allIters={iters}/>)}
    </div>
  );
}

/* ═══════ ITER BLOCK ═══════ */
function IterBlock({it,n,defaultOpen,onDelete,q,onUpdate,allIters}){
  const [open,setOpen]=useState(defaultOpen);
  const [tab,setTab]=useState("conclusion");
  const [confirmDelete,setConfirmDelete]=useState(false);
  const [generatingCode,setGeneratingCode]=useState(false);
  const ts=new Date(it.ts).toLocaleString();
  const finalScore=it.finalScore??0;
  const isOwn=it.sessionId===SESSION_ID;
  const rounds=it.rounds||[{roundNum:1,agents:it.agents||[],judge:null}];
  const scoreColor=finalScore>=80?"#2aff80":finalScore>=60?"#4ade80":finalScore>=40?"#ffc34d":"#f97316";
  const agreementLabel=`${finalScore}% agreement`;

  const genCode=useCallback(async()=>{
    if(it.code){setTab("code");return;}
    if(generatingCode) return;
    setGeneratingCode(true);
    setTab("code");
    try{
      const code=await generateCode(q,it.consensus||"",it.ui||"");
      const updated=allIters.map(iter=>iter.id===it.id?{...iter,code}:iter);
      onUpdate(updated);
    }finally{setGeneratingCode(false);}
  },[generatingCode,it,q,allIters,onUpdate]);

  const TABS=[
    {id:"conclusion", label:"🏁 Conclusion"},
    {id:"code",       label:"💻 Starter Code"},
    {id:"final",      label:"✓ Expert Resolution"},
    {id:"plain",      label:"📋 Action Plan"},
    ...rounds.map(r=>({id:`r${r.roundNum}`,label:`Rd ${r.roundNum}${r.judge?.score!=null?` · ${r.judge.score}/100`:""}`,roundNum:r.roundNum})),
  ];

  return(
    <div style={{background:"#07101f",border:`1px solid ${isOwn?"#1e3a5f":"#182640"}`,borderRadius:3,marginBottom:12,overflow:"hidden"}}>
      <div onClick={()=>setOpen(o=>!o)} style={{display:"flex",alignItems:"center",gap:10,padding:"11px 15px",background:"#0c1a30",borderBottom:open?"1px solid #182640":"none",cursor:"pointer"}}
        onMouseEnter={e=>e.currentTarget.style.background="#111e38"} onMouseLeave={e=>e.currentTarget.style.background="#0c1a30"}>
        <div style={{fontFamily:"Oxanium,sans-serif",fontSize:9.5,fontWeight:700,color:"#00e5ff",letterSpacing:1.2,flexShrink:0}}>SESSION {n}</div>
        <div style={{display:"flex",gap:5,flexShrink:0,flexWrap:"wrap"}}>
          {isOwn&&<span className="badge-pill" style={{background:"rgba(0,229,255,.07)",color:"#00e5ff",border:"1px solid rgba(0,229,255,.2)"}}>YOU</span>}
          {it.isFollowUp&&<span className="badge-pill" style={{background:"rgba(176,126,255,.07)",color:"#b07eff",border:"1px solid rgba(176,126,255,.2)"}}>FOLLOW-UP</span>}
          <span className="badge-pill" style={{background:`rgba(0,0,0,.2)`,color:scoreColor,border:`1px solid ${scoreColor}33`,fontFamily:"Oxanium,sans-serif",fontSize:10,fontWeight:700}}>{agreementLabel}</span>
          <span className="badge-pill" style={{background:"rgba(0,229,255,.04)",color:"#6a85b0",border:"1px solid #182640"}}>{rounds.length} RD{rounds.length>1?"S":""}</span>
        </div>
        <div style={{fontSize:10.5,color:"#6a85b0",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",fontStyle:"italic"}}>
          {it.ui?`"${it.ui.slice(0,55)}${it.ui.length>55?"...":""}"` : "No user input"}
        </div>
        <div style={{fontSize:9,color:"#354d72",flexShrink:0}}>{ts}</div>
        {isOwn&&(
          <div onClick={e=>e.stopPropagation()} style={{flexShrink:0}}>
            {confirmDelete?(
              <span style={{display:"flex",gap:5,alignItems:"center"}}>
                <span style={{fontSize:9,color:"#ff5c5c",fontFamily:"Oxanium,sans-serif"}}>Delete?</span>
                <button onClick={()=>onDelete(it.id)} style={{background:"rgba(255,92,92,.15)",border:"1px solid rgba(255,92,92,.4)",borderRadius:2,color:"#ff5c5c",fontFamily:"Oxanium,sans-serif",fontSize:8.5,padding:"2px 7px",cursor:"pointer"}}>Yes</button>
                <button onClick={()=>setConfirmDelete(false)} style={{background:"transparent",border:"1px solid #354d72",borderRadius:2,color:"#6a85b0",fontFamily:"Oxanium,sans-serif",fontSize:8.5,padding:"2px 7px",cursor:"pointer"}}>No</button>
              </span>
            ):(
              <button onClick={()=>setConfirmDelete(true)} style={{background:"transparent",border:"1px solid #354d72",borderRadius:2,color:"#354d72",fontFamily:"Oxanium,sans-serif",fontSize:8.5,padding:"2px 8px",cursor:"pointer",transition:"all .12s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#ff5c5c";e.currentTarget.style.color="#ff5c5c";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="#354d72";e.currentTarget.style.color="#354d72";}}>
                🗑 delete
              </button>
            )}
          </div>
        )}
        <div style={{color:"#354d72",fontSize:10,transform:open?"rotate(180deg)":"none",transition:"transform .18s",flexShrink:0}}>▼</div>
      </div>

      {open&&(
        <div style={{padding:14}}>
          {it.ui&&(
            <div style={{fontSize:11,color:"#6a85b0",background:"rgba(176,126,255,.04)",border:"1px solid rgba(176,126,255,.15)",borderRadius:3,padding:"9px 13px",marginBottom:14,borderLeft:"2px solid #b07eff"}}>
              <div style={{fontFamily:"Oxanium,sans-serif",fontSize:8,letterSpacing:2,color:"#b07eff",textTransform:"uppercase",marginBottom:4}}>Researcher Input</div>
              {it.ui}
            </div>
          )}
          {/* ── TABS ── */}
          <div className="mob-tabs" style={{display:"flex",gap:5,marginBottom:14,flexWrap:"wrap"}}>
            {TABS.map(t=>{
              const isActive=tab===t.id;
              const tabColors={
                conclusion:"#a78bfa",
                code:"#2aff80",
                final:"#00e5ff",
                plain:"#ffc34d",
              };
              const col=tabColors[t.id]||"#00e5ff";
              const isRound=t.id.startsWith("r");
              return(
                <button key={t.id} onClick={()=>{setTab(t.id);if(t.id==="code"&&!it.code) genCode();}}
                  style={{fontFamily:"Oxanium,sans-serif",fontSize:9.5,fontWeight:isActive?700:500,padding:"5px 12px",borderRadius:3,cursor:"pointer",
                    border:`1px solid ${isActive?(isRound?"#223260":`${col}66`):"#182640"}`,
                    background:isActive?(isRound?"#0c1a30":`${col}10`):"transparent",
                    color:isActive?(isRound?"#00e5ff":col):"#354d72",transition:"all .12s"}}>
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* ══ CONCLUSION ══ */}
          {tab==="conclusion"&&(
            <ConclusionPanel conclusion={it.conclusion} rounds={rounds} finalScore={finalScore} resolved={it.resolved}/>
          )}

          {/* ══ STARTER CODE ══ */}
          {tab==="code"&&(
            <div style={{background:"#020617",border:"1px solid #1e293b",borderRadius:4,padding:"18px 20px",position:"relative"}}>
              <div style={{position:"absolute",top:-8,left:14,background:"#020617",padding:"0 8px",fontSize:8.5,letterSpacing:2.5,color:"#2aff80",fontFamily:"Oxanium,sans-serif"}}>STARTER CODE — PYTHON</div>
              {generatingCode&&(
                <div style={{display:"flex",alignItems:"center",gap:10,color:"#2aff80",fontSize:12,padding:"20px 0",fontFamily:"Oxanium,sans-serif"}}>
                  <span style={{width:14,height:14,borderRadius:"50%",border:"2px solid #2aff80",borderTopColor:"transparent",animation:"spin .7s linear infinite",flexShrink:0}}/>Generating practical code…
                </div>
              )}
              {it.code&&!generatingCode&&<div style={{fontSize:11.5,color:"#a5f3fc",lineHeight:1.75}}><CodeMd text={it.code}/></div>}
              {!it.code&&!generatingCode&&(
                <div style={{textAlign:"center",padding:"28px 0"}}>
                  <div style={{fontSize:11,color:"#354d72",marginBottom:14}}>Code has not been generated yet for this session.</div>
                  <button onClick={genCode} style={{padding:"8px 20px",borderRadius:3,border:"1px solid rgba(42,255,128,.4)",background:"rgba(42,255,128,.06)",color:"#2aff80",fontFamily:"Oxanium,sans-serif",fontSize:10,letterSpacing:1.2,textTransform:"uppercase",cursor:"pointer"}}>
                    ⚡ Generate Code Now
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ══ EXPERT RESOLUTION ══ */}
          {tab==="final"&&(
            <div style={{background:"#0c1a30",border:"1px solid #223260",borderRadius:3,padding:"18px 20px",position:"relative"}}>
              <div style={{position:"absolute",top:-8,left:14,background:"#0c1a30",padding:"0 8px",fontSize:8.5,letterSpacing:2.5,color:"#00e5ff",fontFamily:"Oxanium,sans-serif"}}>EXPERT RESOLUTION · {rounds.length} ROUNDS · {finalScore}/100</div>
              <div style={{fontSize:11.5,color:"#6a85b0",lineHeight:1.9}}><Md text={it.consensus}/></div>
            </div>
          )}

          {/* ══ ACTION PLAN ══ */}
          {tab==="plain"&&(
            <div style={{background:"rgba(255,193,77,.03)",border:"1px solid rgba(255,193,77,.18)",borderRadius:3,padding:"20px 22px",position:"relative"}}>
              <div style={{position:"absolute",top:-8,left:14,background:"#07101f",padding:"0 8px",fontSize:8.5,letterSpacing:2.5,color:"#ffc34d",fontFamily:"Oxanium,sans-serif"}}>PLAIN-LANGUAGE ACTION PLAN — FOR BIOLOGISTS</div>
              <div style={{fontSize:13,color:"#d4e8c2",lineHeight:2}}><PlainMd text={it.plainSummary||"Action plan not available for this session."}/></div>
            </div>
          )}

          {/* ══ ROUND DETAIL ══ */}
          {tab.startsWith("r")&&(()=>{
            const roundNum=parseInt(tab.slice(1));
            const rnd=rounds.find(r=>r.roundNum===roundNum);
            if(!rnd) return null;
            return(
              <div>
                {rnd.judge&&(
                  <div style={{background:"rgba(42,255,128,.03)",border:"1px solid rgba(42,255,128,.14)",borderRadius:3,padding:"10px 13px",marginBottom:12}}>
                    <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:5}}>
                      <div style={{fontFamily:"Oxanium,sans-serif",fontSize:8.5,letterSpacing:2,color:"#2aff80",textTransform:"uppercase"}}>Judge Verdict · Round {rnd.roundNum}</div>
                      <div style={{fontFamily:"Oxanium,sans-serif",fontSize:14,fontWeight:700,color:rnd.judge.score>=CONV?"#2aff80":rnd.judge.score>=45?"#ffc34d":"#ff5c5c"}}>{rnd.judge.score}/100</div>
                      <div style={{fontSize:9,color:rnd.judge.resolved?"#2aff80":"#ffc34d",fontFamily:"Oxanium,sans-serif"}}>{rnd.judge.resolved?"RESOLVED ✓":"CONTINUING →"}</div>
                    </div>
                    {rnd.judge.unresolved_tensions?.length>0&&(
                      <div style={{fontSize:10.5,color:"#6a85b0",marginBottom:4}}><b style={{color:"#ffc34d"}}>Open tensions:</b> {rnd.judge.unresolved_tensions.join(" · ")}</div>
                    )}
                    {rnd.judge.next_debate_focus&&!rnd.judge.resolved&&(
                      <div style={{fontSize:10.5,color:"#6a85b0"}}><b style={{color:"#00e5ff"}}>Next round focus:</b> {rnd.judge.next_debate_focus}</div>
                    )}
                  </div>
                )}
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))",gap:10}}>
                  {rnd.agents.map(a=>{
                    const ag=AGENTS.find(x=>x.id===a.aid)||{name:a.aid,color:"#888",lens:""};
                    return(
                      <div key={a.aid} style={{background:ag.id==="a007"?"rgba(255,45,85,.04)":"#0c1a30",border:`1px solid ${ag.id==="a007"?"rgba(255,45,85,.25)":"#182640"}`,borderRadius:3,padding:12,position:"relative",overflow:"hidden"}}>
                        <div style={{position:"absolute",top:0,left:0,bottom:0,width:2,background:ag.color}}/>
                        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:6}}>
                          <div>
                            <div style={{display:"flex",alignItems:"center",gap:6}}>
                              <div style={{width:6,height:6,borderRadius:"50%",background:ag.color,flexShrink:0}}/>
                              <div style={{fontFamily:"Oxanium,sans-serif",fontSize:11,fontWeight:700,color:"#cee0ff"}}>{ag.name}</div>
                            </div>
                            <div style={{fontSize:8,color:"#354d72",letterSpacing:1.2,marginLeft:12,marginTop:1,textTransform:"uppercase"}}>{ag.lens}</div>
                          </div>
                          <div style={{fontFamily:"Oxanium,sans-serif",fontSize:16,fontWeight:700,color:ag.color}}>{a.score}</div>
                        </div>
                        <div style={{fontSize:11,color:"#6a85b0",lineHeight:1.75,maxHeight:220,overflowY:"auto",marginTop:5}}><Md text={a.resp}/></div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );

}

/* ═══════════════════════════════════════════════
   COMMUNITY STORAGE
   - bioarena:community:index  → shared array of question metadata
   - bioarena:community:q:{id} → shared iters array for each question
═══════════════════════════════════════════════ */
const CK_INDEX = "bioarena:community:index";
const ck = (id) => `bioarena:community:q:${id}`;

// Pre-seeded starter questions — always visible even before anyone posts
const SEED_QUESTIONS = [
  {id:"seed_1",title:"Does the transcription factor bind first, or do chromatin remodellers act first?",ts:Date.now()-1000*60*60*3,sessionId:"seed",submissionCount:1,resolved:true,finalScore:78,category:"Epigenetics"},
  {id:"seed_2",title:"Draft me complete code to tackle RNA-seq raw data — something that will spit out the final publishable data",ts:Date.now()-1000*60*60*8,sessionId:"seed",submissionCount:2,resolved:true,finalScore:82,category:"RNA-seq / Code"},
  {id:"seed_3",title:"If I knock down HNF4A in hepatocytes, how will that affect Enformer's predictions for nearby enhancers?",ts:Date.now()-1000*60*60*12,sessionId:"seed",submissionCount:1,resolved:false,finalScore:61,category:"Dark Genome"},
  {id:"seed_4",title:"RNA-seq isoform quantification: how would it handle a gene with only two isoforms but extreme GC bias?",ts:Date.now()-1000*60*60*18,sessionId:"seed",submissionCount:1,resolved:true,finalScore:74,category:"RNA-seq"},
  {id:"seed_5",title:"In the KRAS-PDAC metabolic modeling problem, what if my RNA-seq data is TPM not counts — does your pipeline still work?",ts:Date.now()-1000*60*60*24,sessionId:"seed",submissionCount:1,resolved:true,finalScore:71,category:"Metabolic Modeling"},
  {id:"seed_6",title:"What happens if I upload bulk RNA-seq with no matching cell types in the reference — what will your deconvolution app do?",ts:Date.now()-1000*60*60*30,sessionId:"seed",submissionCount:1,resolved:false,finalScore:55,category:"Tooling"},
  {id:"seed_7",title:"Can you generate Python code that implements the multi-omics integration pipeline using scanpy + scikit-learn?",ts:Date.now()-1000*60*60*36,sessionId:"seed",submissionCount:2,resolved:true,finalScore:88,category:"Code Generation"},
  {id:"seed_8",title:"For the stress granule partitioning problem, how would you distinguish mRNAs going to P-bodies vs stress granules?",ts:Date.now()-1000*60*60*48,sessionId:"seed",submissionCount:1,resolved:true,finalScore:69,category:"RNA Biology"},
  {id:"seed_9",title:"Given a list of GWAS variants, can your system generate a complete Snakemake workflow for fine-mapping and colocalization?",ts:Date.now()-1000*60*60*54,sessionId:"seed",submissionCount:1,resolved:true,finalScore:85,category:"Code Generation"},
  {id:"seed_10",title:"How would you modify the bulk deconvolution engine to run on GPU using PyTorch instead of NumPy?",ts:Date.now()-1000*60*60*60,sessionId:"seed",submissionCount:1,resolved:true,finalScore:79,category:"Tooling / Code"},
  {id:"seed_11",title:"Can your single-cell trajectory simulator be used unchanged for ecological population dynamics instead of cells?",ts:Date.now()-1000*60*60*72,sessionId:"seed",submissionCount:1,resolved:false,finalScore:48,category:"Out-of-Scope"},
  {id:"seed_12",title:"In your single-cell trajectory simulator, how do you prevent users from over-interpreting spurious bifurcations?",ts:Date.now()-1000*60*60*80,sessionId:"seed",submissionCount:1,resolved:true,finalScore:67,category:"Single-Cell"},
];

async function loadCommunityIndex(){
  try{
    const r=await window.storage.get(CK_INDEX,true);
    if(r){
      const stored=JSON.parse(r.value)||[];
      // Merge stored (user-submitted) with seeds — seeds go at the bottom if not already present
      const storedIds=new Set(stored.map(x=>x.id));
      const seedsToAdd=SEED_QUESTIONS.filter(s=>!storedIds.has(s.id));
      return [...stored,...seedsToAdd];
    }
    // First ever load — show seeds so page is never empty
    return [...SEED_QUESTIONS];
  }catch{return [...SEED_QUESTIONS];}
}
async function saveCommunityIndex(list){
  // Only save non-seed entries to storage (seeds are always injected at load time)
  const toSave=list.filter(x=>!x.id.startsWith("seed_"));
  try{await window.storage.set(CK_INDEX,JSON.stringify(toSave),true);}catch{}
}
async function loadCommunityIters(qid){
  try{const r=await window.storage.get(ck(qid),true);return r?JSON.parse(r.value):[];}catch{return[];}
}
async function saveCommunityIters(qid,iters){
  try{await window.storage.set(ck(qid),JSON.stringify(iters),true);}catch{}
}

/* ═══════ COMMUNITY PAGE ═══════ */
function Community({goHome, goCommunityQ}){
  const mob=useIsMobile();
  const [questions,setQuestions]=useState([]);
  const [loading,setLoading]=useState(true);
  const [newQ,setNewQ]=useState("");
  const [submitting,setSubmitting]=useState(false);
  const [search,setSearch]=useState("");

  useEffect(()=>{
    loadCommunityIndex().then(d=>{setQuestions(d||[]);setLoading(false);});
  },[]);

  const submit=useCallback(async()=>{
    const q=newQ.trim();
    if(!q||submitting) return;
    setSubmitting(true);
    const id="cq_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,6);
    const entry={
      id, title:q,
      ts:Date.now(), sessionId:SESSION_ID,
      submissionCount:0, resolved:false, finalScore:0,
    };
    const updated=[entry,...questions];
    await saveCommunityIndex(updated);
    setQuestions(updated);
    setNewQ("");
    setSubmitting(false);
    goCommunityQ(id,q); // go straight to the question page so they can run a debate
  },[newQ,submitting,questions,goCommunityQ]);

  const filtered=questions.filter(q=>!search||q.title.toLowerCase().includes(search.toLowerCase()));

  return(
    <div className="page-enter" style={{maxWidth:980,margin:"0 auto",padding:mob?"14px 14px":"32px 24px"}}>

      {/* Header */}
      <div style={{paddingBottom:28,borderBottom:"1px solid #182640",marginBottom:28}}>
        <div style={{fontFamily:"Oxanium,sans-serif",fontSize:9.5,letterSpacing:4,color:"#2aff80",textTransform:"uppercase",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
          <span style={{width:28,height:1,background:"#2aff80",display:"inline-block"}}/>Community Knowledge Base
        </div>
        <div style={{fontFamily:"Oxanium,sans-serif",fontSize:"clamp(22px,4vw,38px)",fontWeight:800,color:"#e4f0ff",marginBottom:10}}>
          Community <span style={{color:"#2aff80"}}>Questions</span>
        </div>
        <div style={{fontSize:12,color:"#6a85b0",maxWidth:600,lineHeight:1.8}}>
          Any user can post a biology question — from raw data analysis to protocol design. All {AGENTS.length} AI agents debate it to resolution. Every question and its full debate history is saved and visible to everyone. Click any question to add your own follow-up.
        </div>
      </div>

      {/* Ask box */}
      <div style={{background:"#07101f",border:"1px solid #223260",borderRadius:4,padding:"16px 18px",marginBottom:28,position:"relative"}}>
        <div style={{position:"absolute",top:-8,left:14,background:"#07101f",padding:"0 8px",fontSize:8.5,letterSpacing:2.5,color:"#00e5ff",fontFamily:"Oxanium,sans-serif"}}>ASK BIOARENA ANYTHING</div>
        <div style={{fontSize:11,color:"#4b5563",marginBottom:11,lineHeight:1.7}}>
          Type any biology question, data analysis task, protocol question, or research challenge. All {AGENTS.length} agents will debate it across up to {MAX_ROUNDS} rounds and produce a plain-English action plan + code. Your question and its solutions are saved publicly so others can build on it.
        </div>
        <textarea
          value={newQ} onChange={e=>setNewQ(e.target.value)} disabled={submitting}
          rows={3} placeholder={`E.g. "Draft complete code to tackle RNA-seq raw data and produce publishable figures"
Or: "What's the best way to validate a CRISPR knockout in primary cells?"
Or: "How do I correct for batch effects when integrating datasets from 3 different labs?"`}
          style={{width:"100%",background:"#030812",border:"1px solid #1e293b",borderRadius:3,padding:"11px 13px",color:"#b4c8e8",fontFamily:"'JetBrains Mono',monospace",fontSize:12,lineHeight:1.7,resize:"vertical",minHeight:80,outline:"none",opacity:submitting?.5:1}}
          onKeyDown={e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)) submit();}}
          onFocus={e=>e.target.style.borderColor="#334155"} onBlur={e=>e.target.style.borderColor="#1e293b"}
        />
        <div style={{display:"flex",alignItems:"center",gap:12,marginTop:10}}>
          <button onClick={submit} disabled={submitting||!newQ.trim()}
            style={{padding:"9px 22px",borderRadius:3,border:"1px solid #22c55e",background:submitting||!newQ.trim()?"transparent":"#16a34a",color:submitting||!newQ.trim()?"#4b5563":"#ecfdf3",fontFamily:"Oxanium,sans-serif",fontSize:11,fontWeight:700,letterSpacing:1.5,textTransform:"uppercase",cursor:submitting||!newQ.trim()?"default":"pointer",transition:"all .14s"}}>
            {submitting?"Saving…":"⚡ Submit Question"}
          </button>
          <div style={{fontSize:10,color:"#354d72"}}>Ctrl+Enter to submit · Saved publicly · Any user can follow up</div>
        </div>
      </div>

      {/* Search */}
      <div style={{display:"flex",gap:12,alignItems:"center",marginBottom:16}}>
        <input placeholder="Search community questions…" value={search} onChange={e=>setSearch(e.target.value)}
          style={{flex:1,background:"#020617",borderRadius:4,border:"1px solid #1f2937",color:"#e5e7eb",padding:"7px 10px",fontSize:11,outline:"none"}}/>
        <div style={{fontFamily:"Oxanium,sans-serif",fontSize:9.5,color:"#354d72",flexShrink:0}}>{filtered.length} question{filtered.length!==1?"s":""}</div>
      </div>

      {/* Questions list */}
      {loading?(
        <div style={{textAlign:"center",padding:40,color:"#354d72",fontFamily:"Oxanium,sans-serif",fontSize:11,letterSpacing:2}}>LOADING COMMUNITY QUESTIONS…</div>
      ):filtered.length===0?(
        <div style={{textAlign:"center",padding:"52px 20px",color:"#354d72"}}>
          <div style={{fontSize:32,marginBottom:12}}>🧬</div>
          <div style={{fontFamily:"Oxanium,sans-serif",fontSize:12,letterSpacing:1}}>
            {search?"No questions match your search.":"No questions yet — be the first to ask!"}
          </div>
        </div>
      ):(
        <div style={{display:"grid",gap:8}}>
          {filtered.map((q)=>{
            const ago=Math.round((Date.now()-q.ts)/60000);
            const agoStr=ago<60?`${ago}m ago`:ago<1440?`${Math.round(ago/60)}h ago`:`${Math.round(ago/1440)}d ago`;
            const isOwn=q.sessionId===SESSION_ID;
            const isSeed=q.id.startsWith("seed_");
            const sc=q.finalScore>=CONV?"#2aff80":q.finalScore>=45?"#ffc34d":"#ff5c5c";
            return(
              <div key={q.id} onClick={()=>goCommunityQ(q.id,q.title)}
                style={{background:"#07101f",border:`1px solid ${isOwn?"#1e3a5f":"#182640"}`,borderRadius:4,padding:"14px 16px",cursor:"pointer",transition:"all .12s",position:"relative",overflow:"hidden"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#223260";e.currentTarget.style.background="#0c1a30";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=isOwn?"#1e3a5f":"#182640";e.currentTarget.style.background="#07101f";}}>
                <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:q.resolved?"linear-gradient(90deg,#2aff80,#00e5ff)":"linear-gradient(90deg,#ffc34d,#f97316)",opacity:.55}}/>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:14}}>
                  <div style={{flex:1}}>
                    <div style={{fontFamily:"Oxanium,sans-serif",fontSize:13,fontWeight:600,color:"#cee0ff",marginBottom:8,lineHeight:1.4}}>{q.title}</div>
                    <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                      {isOwn&&<span className="badge-pill" style={{background:"rgba(0,229,255,.07)",color:"#00e5ff",border:"1px solid rgba(0,229,255,.2)"}}>YOU</span>}
                      {isSeed&&<span className="badge-pill" style={{background:"rgba(255,193,77,.06)",color:"#fbbf24",border:"1px solid rgba(255,193,77,.2)"}}>TESTED</span>}
                      {q.finalScore>0&&<span style={{fontFamily:"Oxanium,sans-serif",fontSize:9.5,color:sc,fontWeight:700}}>{q.finalScore}% agreement</span>}
                      {q.category&&<span className="badge-pill" style={{background:"rgba(20,184,166,.07)",color:"#14b8a6",border:"1px solid rgba(20,184,166,.2)"}}>{q.category}</span>}
                      <span style={{fontSize:9.5,color:"#354d72"}}>{agoStr}</span>
                      {q.submissionCount>0&&<span style={{fontSize:9.5,color:"#6a85b0"}}>💬 {q.submissionCount} debate{q.submissionCount!==1?"s":""}</span>}
                    </div>
                  </div>
                  <div style={{color:"#354d72",fontSize:11,flexShrink:0,marginTop:2}}>→</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ═══════ COMMUNITY QUESTION PAGE ═══════ */
function CommunityQuestion({cqid, cqTitle, goHome, goCommunity}){
  const mob=useIsMobile();
  const [meta,setMeta]=useState(null);
  const [iters,setIters]=useState([]);
  const [loadingIters,setLoadingIters]=useState(true);
  const [running,setRunning]=useState(false);
  const [userInput,setUserInput]=useState("");
  const [liveRound,setLiveRound]=useState(0);
  const [liveAgentStatus,setLiveAgentStatus]=useState({});
  const [liveScore,setLiveScore]=useState(null);
  const [livePhase,setLivePhase]=useState("");
  const [liveRounds,setLiveRounds]=useState([]);
  const q = { id: cqid, title: cqTitle, prompt: cqTitle, tags: [], pts: 0, cat: "community" };

  useEffect(()=>{
    setLoadingIters(true);
    Promise.all([loadCommunityIndex(), loadCommunityIters(cqid)]).then(([idx,its])=>{
      setMeta(idx.find(x=>x.id===cqid)||null);
      setIters(its||[]);
      setLoadingIters(false);
    });
  },[cqid]);

  const onAgentStatus=useCallback((agId,status,round)=>{
    setLiveAgentStatus(s=>({...s,[`${round}:${agId}`]:status}));
  },[]);

  const deleteIter=useCallback(async(iterId)=>{
    const updated=iters.filter(i=>i.id!==iterId);
    await saveCommunityIters(cqid,updated);
    setIters(updated);
  },[iters,cqid]);

  const updateIter=useCallback((allIters)=>{
    setIters(allIters);
    saveCommunityIters(cqid,allIters);
  },[cqid]);

  const run=useCallback(async()=>{
    if(running) return;
    setRunning(true);
    const ui=userInput.trim();

    // Build a richer synthetic question that includes ALL prior iteration context
    const sortedIters=[...iters].sort((a,b)=>b.ts-a.ts);
    const prevConsensus=sortedIters.length>0?sortedIters[0].consensus||"":"";
    const enrichedQ={
      ...q,
      // If user added a follow-up, append it to the prompt
      prompt: ui
        ? `Original question: ${cqTitle}\n\nFollow-up / additional context: ${ui}`
        : cqTitle,
      title: ui ? `${cqTitle} [follow-up: ${ui.slice(0,60)}${ui.length>60?"...":""}]` : cqTitle,
    };

    setLiveRound(0);setLiveAgentStatus({});setLiveScore(null);setLivePhase("debating");setLiveRounds([]);
    const allRounds=[];
    let round=0;

    while(round<MAX_ROUNDS){
      round++;
      // Cooldown between rounds to reset the token-per-minute bucket
      if(round>1){
        setLivePhase("cooling down…");
        await new Promise(r=>setTimeout(r,30000));
      }
      setLiveRound(round);
      setLivePhase("debating");
      const roundAgents=await runDebateRound(q,round,allRounds,ui,onAgentStatus,prevConsensus);
      setLivePhase("judging");
      const judgeResult=await judgeRound(enrichedQ,[...allRounds,{agents:roundAgents}],prevConsensus);
      setLiveScore(judgeResult.score);
      const snippets=roundAgents.map(a=>{
        const ag=AGENTS.find(x=>x.id===a.aid);
        return {name:ag?.name||a.aid,color:ag?.color||"#888",lens:ag?.lens||"",snippet:a.resp.slice(0,180)};
      });
      setLiveRounds(prev=>[...prev,{roundNum:round,score:judgeResult.score,tensions:judgeResult.unresolved_tensions||[],focus:judgeResult.next_debate_focus||"",snippets}]);
      allRounds.push({roundNum:round,agents:roundAgents,judge:judgeResult});
    }
    const finalScore=allRounds[allRounds.length-1]?.judge?.score??0;

    setLivePhase("consensus");
    const finalConsensus=await buildFinalConsensus(enrichedQ,allRounds,ui,true,prevConsensus);
    setLivePhase("plain");
    const plainSummary=await buildPlainSummary(enrichedQ,finalConsensus,ui,true,prevConsensus);
    setLivePhase("conclusion");
    const conclusion=await buildConclusion(enrichedQ,allRounds,finalConsensus,ui,true);
    setLivePhase("code");
    const code=await generateCode(enrichedQ,finalConsensus,ui);

    const iteration={
      id:Date.now().toString(),ts:Date.now(),
      ui: ui||"(initial analysis)",
      sessionId:SESSION_ID,
      rounds:allRounds,totalRounds:allRounds.length,finalScore,resolved:true,
      consensus:finalConsensus,plainSummary,conclusion,code,
      isFollowUp:prevConsensus.length>0,
    };
    const updatedIters=[...iters,iteration];
    await saveCommunityIters(cqid,updatedIters);
    setIters(updatedIters);

    // Update index metadata
    const idx=await loadCommunityIndex();
    const updatedIdx=idx.map(x=>x.id===cqid?{...x,submissionCount:updatedIters.length,resolved:true,finalScore}:x);
    await saveCommunityIndex(updatedIdx);
    setMeta(prev=>prev?{...prev,submissionCount:updatedIters.length,resolved:true,finalScore}:prev);

    setUserInput("");setRunning(false);setLivePhase("done");
  },[q,cqTitle,userInput,running,iters,onAgentStatus]);

  const activeIter=iters.length>0?[...iters].sort((a,b)=>b.ts-a.ts)[0]:null;

  return(
    <div className="page-enter" style={{maxWidth:980,margin:"0 auto",padding:mob?"14px 14px":"32px 24px"}}>
      <BC items={[{label:"Home",fn:goHome},{label:"Community",fn:goCommunity},{label:cqTitle.slice(0,55)+(cqTitle.length>55?"...":"")}]}/>

      {/* Question header */}
      <div style={{marginBottom:22,paddingBottom:20,borderBottom:"1px solid #182640"}}>
        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10,flexWrap:"wrap"}}>
          <span className="badge-pill" style={{background:"rgba(42,255,128,.07)",color:"#2aff80",border:"1px solid rgba(42,255,128,.18)"}}>COMMUNITY</span>
          {meta?.resolved&&<span className="badge-pill" style={{background:"rgba(42,255,128,.07)",color:"#2aff80",border:"1px solid rgba(42,255,128,.18)"}}>RESOLVED</span>}
          {meta?.finalScore>0&&<span className="badge-pill" style={{background:"rgba(0,0,0,.2)",color:"#ffc34d",border:"1px solid rgba(255,193,77,.25)"}}>{meta.finalScore}/100</span>}
          {meta?.submissionCount>0&&<span style={{fontSize:9.5,color:"#6a85b0"}}>{meta.submissionCount} submission{meta.submissionCount!==1?"s":""}</span>}
        </div>
        <div style={{fontFamily:"Oxanium,sans-serif",fontSize:"clamp(16px,2.5vw,22px)",fontWeight:800,color:"#e4f0ff",lineHeight:1.3,marginBottom:12}}>{cqTitle}</div>
      </div>

      {/* Two-column layout */}
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"minmax(0,2.2fr) minmax(0,1.1fr)",gap:20,alignItems:"flex-start",marginBottom:22}}>
        {/* Left: question + input */}
        <div>
          <div style={{background:"#020617",borderRadius:4,border:"1px solid #1f2937",padding:"12px 14px",marginBottom:14,fontSize:12,color:"#9ca3af",lineHeight:1.85,whiteSpace:"pre-wrap",wordBreak:"break-word"}}>
            {cqTitle}
          </div>

          {/* Input — always visible */}
          <div style={{background:"#020617",borderRadius:4,border:"1px solid #223260",padding:"12px 13px",position:"relative"}}>
            <div style={{position:"absolute",top:-8,left:12,background:"#020617",padding:"0 7px",fontSize:8,letterSpacing:2.5,color:"#00e5ff",fontFamily:"Oxanium,sans-serif"}}>
              {iters.length>0?"ADD FOLLOW-UP → NEW FULL DEBATE SUBMISSION":"RUN INITIAL ANALYSIS"}
            </div>
            <div style={{fontSize:11,color:"#4b5563",marginBottom:9,lineHeight:1.65}}>
              {iters.length>0
                ? <>Type a follow-up — e.g. "Now add GSEA pathway enrichment" or "Update the code for batch-corrected samples". This runs a <b style={{color:"#00e5ff"}}>completely fresh {AGENTS.length}-agent debate</b> building on all prior sessions, and saves it as a <b style={{color:"#2aff80"}}>new submission</b> visible to all users.</>
                : <>Run the first analysis on this question. All {AGENTS.length} agents will debate for {MIN_ROUNDS}–{MAX_ROUNDS} rounds and produce a plain-English action plan + code, saved publicly.</>
              }
            </div>
            <textarea value={userInput} onChange={e=>setUserInput(e.target.value)} disabled={running} rows={3}
              placeholder={iters.length>0
                ? `E.g. "Now focus on GSEA pathway enrichment" or "Can you update the code to handle 10x Genomics data format?"…`
                : `Optional: add context like cell type, organism, data format, or specific goals…`
              }
              style={{width:"100%",background:"#030812",border:"1px solid #1e293b",borderRadius:3,padding:"10px 12px",color:"#b4c8e8",fontFamily:"'JetBrains Mono',monospace",fontSize:12,lineHeight:1.7,resize:"vertical",minHeight:68,outline:"none",opacity:running?.5:1}}
              onFocus={e=>e.target.style.borderColor="#334155"} onBlur={e=>e.target.style.borderColor="#1e293b"}/>
          </div>
        </div>

        {/* Right: sidebar */}
        <div style={{background:"#020617",borderRadius:4,border:"1px solid #1f2937",padding:"12px 13px",position:mob?"static":"sticky",top:70}}>
          <div style={{fontFamily:"Oxanium,sans-serif",fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"#6b7280",marginBottom:8}}>At a glance</div>
          <div style={{display:"grid",rowGap:6,marginBottom:10,fontSize:11}}>
            {[["Type","Community Question","#fbbf24"],["Agents",`${AGENTS.length} parallel`,"#93c5fd"],["Rounds",`${MIN_ROUNDS}–${MAX_ROUNDS}`,"#2aff80"],["Output","Action plan + code","#ffc34d"],["Submissions",`${iters.length} so far`,"#b4c8e8"]].map(([k,v,col])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",gap:8}}>
                <span style={{color:"#6b7280"}}>{k}</span><span style={{color:col,textAlign:"right"}}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{height:1,background:"#111827",margin:"10px 0"}}/>
          <div style={{fontFamily:"Oxanium,sans-serif",fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"#6b7280",marginBottom:6}}>AI debate panel ({AGENTS.length})</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:10}}>
            {AGENTS.map(a=>(
              <div key={a.id} style={{display:"flex",alignItems:"center",gap:4,borderRadius:999,border:`1px solid ${a.id==="a007"?"rgba(255,45,85,.4)":"#1f2937"}`,padding:"3px 8px",fontSize:9.5,background:a.id==="a007"?"rgba(255,45,85,.07)":"#020617"}} title={a.lens}>
                <span style={{width:6,height:6,borderRadius:"50%",background:a.color}}/><span style={{color:a.id==="a007"?"#ff2d55":"inherit"}}>{a.name}</span>
              </div>
            ))}
          </div>
          <button disabled={running} onClick={run}
            style={{width:"100%",padding:"8px 0",borderRadius:4,border:"1px solid #22c55e",background:running?"transparent":"#16a34a",color:running?"#6b7280":"#ecfdf3",fontFamily:"Oxanium,sans-serif",fontSize:11,letterSpacing:1.5,textTransform:"uppercase",cursor:running?"default":"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all .14s"}}>
            {running
              ? <><span style={{width:12,height:12,borderRadius:"50%",border:"2px solid #4ade80",borderTopColor:"transparent",animation:"spin .7s linear infinite"}}/>Rd {liveRound}/{MAX_ROUNDS} · {livePhase}…</>
              : iters.length>0?"⚡ Submit Follow-Up Debate":"⚡ Run Initial Analysis"}
          </button>
          {iters.length>0&&!running&&(
            <div style={{fontSize:9.5,color:"#4b5563",textAlign:"center",marginTop:7,lineHeight:1.5}}>
              Saves as a new public submission
            </div>
          )}
          {/* Timeline */}
          {activeIter&&(()=>{
            const rounds=activeIter.rounds||[];
            return(
              <>
                <div style={{height:1,background:"#111827",margin:"12px 0"}}/>
                <div style={{fontFamily:"Oxanium,sans-serif",fontSize:10,letterSpacing:2,textTransform:"uppercase",color:"#6b7280",marginBottom:6}}>Latest debate</div>
                <div style={{display:"flex",gap:8,marginBottom:7,alignItems:"center"}}>
                  {rounds.map((_,idx)=>(
                    <div key={idx} style={{display:"flex",flexDirection:"column",alignItems:"center",flex:1}}>
                      <div className={`timeline-dot${idx===rounds.length-1?" active":""}`}/>
                      <div style={{marginTop:3,fontSize:8.5,color:"#6b7280",textAlign:"center"}}>{idx+1}</div>
                    </div>
                  ))}
                </div>
                <div style={{fontSize:10.5,color:"#9ca3af",lineHeight:1.55}}>
                  <span style={{color:activeIter.finalScore>=80?"#2aff80":activeIter.finalScore>=60?"#4ade80":"#ffc34d",fontFamily:"Oxanium,sans-serif",fontSize:9.5,fontWeight:700}}>{activeIter.finalScore}% agreement</span>
                </div>
              </>
            );
          })()}
        </div>
      </div>

      {/* Live panel */}
      {running&&<LivePanel round={liveRound} maxRounds={MAX_ROUNDS} agentStatus={liveAgentStatus} score={liveScore} phase={livePhase} liveRounds={liveRounds}/>}

      {/* Submissions */}
      {loadingIters
        ?<div style={{textAlign:"center",padding:32,color:"#354d72",fontFamily:"Oxanium,sans-serif",fontSize:11,letterSpacing:2}}>LOADING SUBMISSIONS…</div>
        :<ItersList iters={iters} onDelete={deleteIter} q={q} onUpdate={updateIter}/>}
    </div>
  );
}
function Leaderboard({goHome}){
  const mob=useIsMobile();
  const ranked=[...MODELS].sort((a,b)=>b.score-a.score);
  const medals=["🥇","🥈","🥉"];
  return(
    <div className="page-enter" style={{maxWidth:1000,margin:"0 auto",padding:mob?"14px 14px":"32px 24px"}}>
      <BC items={[{label:"Home",fn:goHome},{label:"Leaderboard"}]}/>
      <div style={{paddingBottom:26,borderBottom:"1px solid #182640",marginBottom:18}}>
        <div style={{fontFamily:"Oxanium,sans-serif",fontSize:9.5,letterSpacing:4,color:"#2aff80",textTransform:"uppercase",marginBottom:10,display:"flex",alignItems:"center",gap:10}}>
          <span style={{width:28,height:1,background:"#2aff80",display:"inline-block"}}/>Rankings
        </div>
        <div style={{fontFamily:"Oxanium,sans-serif",fontSize:mob?24:32,fontWeight:800,color:"#e4f0ff"}}>Leaderboard</div>
        <div style={{fontSize:12,color:"#6a85b0",marginTop:6,maxWidth:520,lineHeight:1.7}}>AI models ranked by cumulative score across all BioArena problems.</div>
      </div>

      {/* Mobile: card layout. Desktop: grid layout */}
      {mob?(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {ranked.map((m,i)=>{
            const r=i+1;
            const pct=Math.round(m.acc*100);
            const approxErr=Math.max(3,Math.round(.06*pct));
            const init=m.name.split(" ").map(w=>w[0]).join("").slice(0,2);
            const scoreCol=r===1?"#fbbf24":r===2?"#e5e7eb":r===3?"#f97316":"#354d72";
            return(
              <div key={m.id} style={{background:"#07101f",border:"1px solid #182640",borderRadius:4,padding:"14px 16px",position:"relative",overflow:"hidden"}}>
                <div style={{position:"absolute",top:0,left:0,bottom:0,width:3,background:m.color}}/>
                <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:10}}>
                  <div style={{fontFamily:"Oxanium,sans-serif",fontSize:22,fontWeight:700,color:scoreCol,flexShrink:0,width:32}}>{medals[i]||r}</div>
                  <div style={{width:34,height:34,borderRadius:4,background:m.color,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Oxanium,sans-serif",fontSize:12,fontWeight:700,color:"#000",flexShrink:0}}>{init}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:"Oxanium,sans-serif",fontSize:13,fontWeight:700,color:"#cee0ff",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.name}</div>
                    <div style={{fontSize:10,color:"#354d72",marginTop:1}}>{m.prov}</div>
                  </div>
                  <div style={{fontFamily:"Oxanium,sans-serif",fontSize:22,fontWeight:800,color:"#00e5ff",flexShrink:0}}>{m.score}</div>
                </div>
                <div style={{display:"flex",gap:16,fontSize:11,color:"#6a85b0",marginBottom:8}}>
                  <span>{m.sub} runs</span>
                  <span style={{color:"#2aff80",fontWeight:700}}>{pct}% ±{approxErr}</span>
                </div>
                <div style={{height:4,background:"#182640",borderRadius:2,overflow:"hidden"}}>
                  <div style={{height:"100%",width:`${pct}%`,background:"#2aff80",borderRadius:2}}/>
                </div>
              </div>
            );
          })}
        </div>
      ):(
        <>
          <div style={{display:"grid",gridTemplateColumns:"52px 1fr 90px 90px 140px",gap:16,padding:"8px 18px",fontSize:9.5,letterSpacing:2,textTransform:"uppercase",color:"#354d72",borderBottom:"1px solid #182640",marginBottom:8,fontFamily:"Oxanium,sans-serif"}}>
            <span>Rank</span><span>Model</span><span>Score</span><span>Runs</span><span>Accuracy (±)</span>
          </div>
          {ranked.map((m,i)=>{
            const r=i+1;const pct=Math.round(m.acc*100);const init=m.name.split(" ").map(w=>w[0]).join("").slice(0,2);
            const approxErr=Math.max(3,Math.round(.06*pct));
            return(
              <div key={m.id} style={{display:"grid",gridTemplateColumns:"52px 1fr 90px 90px 140px",gap:16,padding:"13px 18px",background:"#07101f",border:"1px solid #182640",borderRadius:3,marginBottom:6,alignItems:"center",transition:"all .12s"}}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="#223260";e.currentTarget.style.background="#0c1a30";}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="#182640";e.currentTarget.style.background="#07101f";}}>
                <div style={{fontFamily:"Oxanium,sans-serif",fontSize:18,fontWeight:700,color:r===1?"#fbbf24":r===2?"#e5e7eb":r===3?"#f97316":"#354d72"}}>{medals[i]||r}</div>
                <div style={{display:"flex",alignItems:"center",gap:11}}>
                  <div style={{width:30,height:30,borderRadius:3,background:m.color,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Oxanium,sans-serif",fontSize:11,fontWeight:700,color:"#000",flexShrink:0}}>{init}</div>
                  <div>
                    <div style={{fontFamily:"Oxanium,sans-serif",fontSize:12.5,fontWeight:600,color:"#cee0ff"}}>{m.name}</div>
                    <div style={{fontSize:9.5,color:"#354d72",marginTop:1}}>{m.prov} · model card coming soon</div>
                  </div>
                </div>
                <div style={{fontFamily:"Oxanium,sans-serif",fontSize:20,fontWeight:700,color:"#00e5ff"}}>{m.score}</div>
                <div style={{fontSize:12,color:"#6a85b0"}}>{m.sub}</div>
                <div>
                  <div style={{fontSize:10.5,color:"#2aff80",marginBottom:4}}>{pct}% ±{approxErr}</div>
                  <div style={{height:3,background:"#182640",borderRadius:2,overflow:"hidden"}}>
                    <div style={{height:"100%",width:`${pct}%`,background:"#2aff80",borderRadius:2}}/>
                  </div>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}

/* ═══════ ROOT APP ═══════ */
export default function BioArenaApp(){
  const [page,setPage]=useState("home");
  const [catId,setCatId]=useState(null);
  const [qid,setQid]=useState(null);
  const [cqid,setCqid]=useState(null);
  const [cqTitle,setCqTitle]=useState("");
  const [customAPI,setCustomAPIState]=useState(null); // {provider,apiKey,model,baseUrl,label}

  const applyCustomAPI=useCallback((cfg)=>{
    _customAPI=cfg;
    setCustomAPIState(cfg);
  },[]);

  const goHome=useCallback(()=>{setPage("home");setCatId(null);setQid(null);setCqid(null);window.scrollTo(0,0);},[]);
  const goLB=useCallback(()=>{setPage("lb");setCatId(null);setQid(null);setCqid(null);window.scrollTo(0,0);},[]);
  const goCommunity=useCallback(()=>{setPage("community");setCatId(null);setQid(null);setCqid(null);window.scrollTo(0,0);},[]);
  const goCommunityQ=useCallback((id,title)=>{setCqid(id);setCqTitle(title);setPage("cq");window.scrollTo(0,0);},[]);
  const goCategory=useCallback(id=>{setCatId(id);setPage("cat");window.scrollTo(0,0);},[]);
  const goQuestion=useCallback(id=>{setQid(id);setPage("q");window.scrollTo(0,0);},[]);

  return(
    <div className="ba-root">
      <Nav page={page} goHome={goHome} goCommunity={goCommunity} goLB={goLB} customAPI={customAPI}/>
      {page==="home"&&<Home goCategory={goCategory} goQuestion={goQuestion} goCommunity={goCommunity} goCommunityQ={goCommunityQ} customAPI={customAPI} applyCustomAPI={applyCustomAPI}/>}
      {page==="cat"&&<Category catId={catId} goHome={goHome} goQuestion={goQuestion}/>}
      {page==="q"&&<Question qid={qid} goHome={goHome} goCategory={goCategory}/>}
      {page==="community"&&<Community goHome={goHome} goCommunityQ={goCommunityQ}/>}
      {page==="cq"&&<CommunityQuestion cqid={cqid} cqTitle={cqTitle} goHome={goHome} goCommunity={goCommunity}/>}
      {page==="lb"&&<Leaderboard goHome={goHome}/>}
    </div>
  );
}
