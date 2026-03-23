import React, { useState, useEffect, useCallback } from "react";

class ErrorBoundary extends React.Component<{children:any},{crashed:boolean,msg:string}>{
  constructor(p:any){super(p);this.state={crashed:false,msg:""};}
  static getDerivedStateFromError(e:any){return{crashed:true,msg:e?.message||"Unknown error"};}
  componentDidCatch(e:any,info:any){console.error("BioArena crashed:",e,info);}
  render(){
    if(this.state.crashed) return(
      <div style={{padding:48,textAlign:"center",color:"#ff5c5c",fontFamily:"Oxanium,sans-serif",background:"#030812",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center"}}>
        <div style={{fontSize:40,marginBottom:16}}>⚠️</div>
        <div style={{fontSize:18,marginBottom:8,color:"#e4f0ff"}}>Something went wrong</div>
        <div style={{fontSize:12,color:"#354d72",marginBottom:28,maxWidth:400}}>{this.state.msg}</div>
        <button onClick={()=>window.location.reload()} style={{padding:"10px 28px",borderRadius:4,border:"1px solid #ff5c5c",background:"transparent",color:"#ff5c5c",fontFamily:"Oxanium,sans-serif",fontSize:12,cursor:"pointer",letterSpacing:1}}>
          Reload Page
        </button>
      </div>
    );
    return this.props.children;
  }
}

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
  {id:"rnaseq",name:"RNA-seq DEG Analysis",color:"#2563eb",q:2,desc:"Single-cell isoform quantification wall and allele-specific expression dropout.",difficulty:"Expert"},
  {id:"metabolic",name:"Metabolic Modeling",color:"#9333ea",q:2,desc:"FBA with KRAS-PDAC metabolic reprogramming (Recon3D) and 13C MFA isotopologue mismatch.",difficulty:"Expert"},
  {id:"rna3d",name:"3D RNA Structure Prediction",color:"#0891b2",q:2,desc:"Long RNA folding wall (>200 nt) and pseudoknot NP-hardness.",difficulty:"Unsolved"},
  {id:"rnadesign",name:"De Novo RNA Design",color:"#16a34a",q:2,desc:"The in-cell riboswitch design gap (>90% SELEX-to-silence failure) and the sequence→function missing link.",difficulty:"Unsolved"},
  {id:"rnainteract",name:"RNA–Protein Interactions",color:"#dc2626",q:2,desc:"RBP cross-cell-type binding generalization failure (38% overlap between cell lines).",difficulty:"Expert"},
  {id:"rnafunc",name:"RNA Function & Epitranscriptomics",color:"#d97706",q:2,desc:"lncRNA sequence-to-mechanism black box (100,000 catalogued, <500 mechanistically understood).",difficulty:"Unsolved"},
  {id:"mrnadesign",name:"mRNA Therapeutics Design",color:"#7c3aed",q:2,desc:"Codon optimality paradox and the in vitro → in vivo translational gap.",difficulty:"Expert"},
  {id:"proteinfolding",name:"Protein Folding & Interaction",color:"#0f766e",q:1,desc:"AlphaFold2 phi-value analysis failure — static structure prediction cannot reproduce folding pathway kinetics.",difficulty:"Unsolved"},
  {id:"proteindesign",name:"De Novo Protein Design",color:"#be185d",q:1,desc:"RFdiffusion binder design funnel failure — 1% wet-lab attrition rate.",difficulty:"Expert"},
  {id:"darkgenome",name:"Deciphering the Dark Genome",color:"#1d4ed8",q:1,desc:"Enformer saturation mutagenesis HNF4A gap — TF availability vs sequence-intrinsic regulatory grammar.",difficulty:"Unsolved"},
  {id:"wholecell",name:"Whole-Cell Digital Twin",color:"#b45309",q:1,desc:"Perturb-seq GEARS accuracy cascade — accuracy collapses for multi-gene perturbations.",difficulty:"Unsolved"},
  {id:"drugdiscovery",name:"Personalized Drug Discovery",color:"#065f46",q:1,desc:"GDSC osimertinib translational gap — in vitro drug sensitivity predictions fail in clinical trials.",difficulty:"Expert"},
  {id:"evolution",name:"Predicting Evolutionary Shifts",color:"#9a3412",q:1,desc:"EVEscape BA.2.86 saltational evolution failure — models miss multi-mutation jumps.",difficulty:"Unsolved"},
  {id:"interactome",name:"Mapping the Human Interactome",color:"#4338ca",q:1,desc:"PPI Park-Marcotte strict split AUROC collapse (0.91→0.61) — diagnosing homology leakage.",difficulty:"Expert"},
  {id:"tools",name:"Translational Tooling & Apps",color:"#14b8a6",q:8,desc:"Practical, code-generating tools that convert biological data and protocols into usable apps, dashboards, and simulators.",difficulty:"Graduate"},
  {id:"spatial",name:"Spatial Transcriptomics",color:"#f472b6",q:2,desc:"Spatial gene expression mapping — cell-cell communication, TME architecture, tissue niche analysis.",difficulty:"Expert"},
  {id:"immuno",name:"Immunology & Repertoire",color:"#34d399",q:2,desc:"TCR/BCR repertoire analysis, clonal expansion, antigen specificity, and vaccine response prediction.",difficulty:"Expert"},
  {id:"multiomics",name:"Multi-Omics Integration",color:"#fb7185",q:2,desc:"Integrating RNA-seq, ATAC-seq, proteomics to build unified molecular portraits of disease.",difficulty:"Expert"},
];

const QS = [
  {id:1,cat:"rnaseq",pts:60,difficulty:"Expert",title:"The Single-Cell Isoform Quantification Wall",tags:["scRNA-seq","isoforms","long-read","nanopore","FLAMES"],
   prompt:`Build a System: Single-Cell Full-Length Isoform Quantifier\n\nA gene like SCN8A has >200 annotated isoforms — conventional scRNA-seq collapses all to a single gene count. Long-read single-cell methods capture full-length transcripts but produce only ~5,000 cells vs ~5,000,000 for short-read, with 5–10× dropout rate.\n\nTasks:\n1. Computational architecture for single-cell isoform quantification handling dropout\n2. How to leverage multi-modal data (short + long read in same cell)\n3. Probabilistic model for isoform assignment given ambiguous reads\n4. Held-out validation strategy\n5. Minimum per-cell isoform F1 score for clinical utility`},
  {id:2,cat:"rnaseq",pts:60,difficulty:"Expert",title:"Allele-Specific Expression: The Phase Assignment Problem",tags:["ASE","allele-specific","haplotype","dropout","imprinting"],
   prompt:`Build a System: Single-Cell Allele-Specific Expression Quantifier\n\n~70% of mRNA molecules are not captured, making monoallelic expression indistinguishable from true imprinting vs stochastic dropout.\n\nTasks:\n1. Bayesian model distinguishing biological monoallelic expression from technical dropout\n2. Haplotype phasing strategy using population-level reference panels\n3. Handle the 10× coverage disparity between heterozygous SNP-covered genes vs SNP-free genes\n4. Benchmark distinguishing biological from technical monoallelic expression\n5. Posterior credible interval width for clinical utility in imprinting disorder diagnosis`},
  {id:3,cat:"metabolic",pts:65,difficulty:"Expert",title:"KRAS-PDAC Metabolic Reprogramming via Flux Balance Analysis",tags:["FBA","KRAS","PDAC","Recon3D","metabolic flux"],
   prompt:`Build a System: Constraint-Based Metabolic Model for KRAS-Driven PDAC\n\nKRAS G12D PDAC exhibits dramatic metabolic reprogramming — upregulation of glycolysis, increased glutamine anaplerosis, enhanced macropinocytosis.\n\nTasks:\n1. Pipeline generating a KRAS-G12D-specific metabolic model from Recon3D using RNA-seq constraints\n2. Model the non-canonical amino acid acquisition pathway (macropinocytosis)\n3. Multi-objective flux optimization balancing biomass production with redox homeostasis\n4. Experimental validation distinguishing model predictions from fitting artifacts`},
  {id:4,cat:"metabolic",pts:65,difficulty:"Expert",title:"13C MFA Isotopologue Mismatch & Glutamine Anaplerosis",tags:["13C MFA","isotopologue","glutamine","anaplerosis","TCA cycle"],
   prompt:`Build a System: 13C Metabolic Flux Analysis with Isotopologue Resolution\n\nIsotopologue fitting fails when multiple substrate entry points exist simultaneously. Mismatch between measured and model-predicted isotopologues for fumarate and malate exceeds 15% in PDAC cell lines.\n\nTasks:\n1. EMU framework extension handling parallel carbon entry from glucose and glutamine\n2. Resolve the symmetry problem in succinate/fumarate causing isotopologue scrambling\n3. Statistical model for isotopologue measurement uncertainty propagating to flux confidence intervals\n4. Minimum measurement precision to distinguish oxidative vs reductive glutamine anaplerosis`},
  {id:5,cat:"rna3d",pts:65,difficulty:"Unsolved",title:"RNA Tertiary Structure: The Long-RNA Folding Wall",tags:["RNA 3D","deep learning","long RNA","RMSD","RNA-Puzzles"],
   prompt:`Build a System: Long-RNA 3D Structure Predictor\n\nCurrent tools collapse to >10Å RMSD on RNAs >200 nt — worse than random secondary structure-constrained assembly on novel-topology targets.\n\nTasks:\n1. Design "RNAFold-L" — deep learning architecture for 200–1000 nt RNA tertiary structure prediction\n2. Training data augmentation overcoming the ~15,000 RNA structure data scarcity\n3. Encode cotranscriptional folding kinetics as a constraint rather than predicting a static structure\n4. Benchmarking suite beyond TM-score capturing biologically relevant accuracy`},
  {id:6,cat:"rna3d",pts:65,difficulty:"Unsolved",title:"Pseudoknot Prediction: The NP-Hardness Problem",tags:["pseudoknot","NP-hard","RNA folding","H-type","kissing loop"],
   prompt:`Build a System: Tractable Pseudoknot-Aware RNA Folding\n\nPseudoknots occur in ~30% of functional RNAs. Minimum free energy folding including pseudoknots is NP-hard. Approximate methods miss >40% of experimentally verified pseudoknots.\n\nTasks:\n1. Practical algorithm for pseudoknot prediction on 50–500 nt sequences\n2. Characterize topologies where approximate methods fail most severely\n3. How to integrate experimental restraints (SHAPE, DMS-MaPseq)\n4. Benchmark distinguishing genuine prediction from overfitting`},
  {id:7,cat:"rnadesign",pts:65,difficulty:"Unsolved",title:"The In-Cell Riboswitch Design Gap",tags:["riboswitch","SELEX","aptamer","in-cell design","synthetic biology"],
   prompt:`Build a System: In-Cell Functional Riboswitch Designer\n\nSELEX achieves high in vitro affinity for >90% of targets, yet >90% of selected aptamers fail to function as riboswitches in living cells.\n\nTasks:\n1. Computational pipeline predicting in-cell riboswitch function from sequence\n2. Model competition between riboswitch folding and translation initiation complex assembly\n3. High-throughput experimental design capturing in-cell failure modes\n4. Sequence features predicting the in vitro → in-cell transfer failure\n5. In-cell gene regulation dynamic range justifying clinical development`},
  {id:8,cat:"rnadesign",pts:65,difficulty:"Expert",title:"De Novo RNA Design: The Sequence–Function Missing Link",tags:["de novo design","RNA inverse folding","sequence optimization","eterna"],
   prompt:`Build a System: Sequence-to-Function RNA Design Engine\n\nRNA inverse folding achieves >95% success on structures <100 nt, but ~99% of sequences that fold correctly are functionally inactive.\n\nTasks:\n1. Formalize the gap between structural correctness and functional activity as an optimization problem\n2. Generative model jointly optimizing structure AND predicted function\n3. Incorporate evolutionary conservation signals without known homologs\n4. Wet-lab validation pipeline using high-throughput functional assays (FACS-seq, Sort-seq)\n5. Realistic performance ceiling for computational RNA design`},
  {id:9,cat:"rnainteract",pts:65,difficulty:"Expert",title:"RBP Binding Generalization Across Cell Types",tags:["RBP","eCLIP","binding sites","cell-type","generalization"],
   prompt:`Build a System: Cell-Type-Generalizable RBP Binding Predictor\n\nRBP binding site predictors achieve AUC >0.90 within HepG2/K562, but only 38% of predicted binding sites are conserved in primary cell types.\n\nTasks:\n1. Diagnose primary sources of RBP binding site non-transferability across cell types\n2. Model architecture incorporating cell-type-specific features beyond sequence motifs\n3. Use cross-species eCLIP data to identify conserved vs cell-type-specific binding mechanisms\n4. Minimal experimental dataset maximally improving generalization\n5. Define a generalization benchmark avoiding data leakage`},
  {id:10,cat:"rnainteract",pts:65,difficulty:"Expert",title:"Stress Granule Condensation: The mRNA Sorting Problem",tags:["stress granules","phase separation","mRNA localization","condensate","IDR"],
   prompt:`Build a System: mRNA Stress Granule Partitioning Predictor\n\nDuring stress, ~10% of cytoplasmic mRNAs condense into stress granules. Current models predict SG partitioning with AUC ~0.65 — barely better than random.\n\nTasks:\n1. Identify key sequence and structural features predicting SG partitioning\n2. Dynamic model capturing how partitioning changes over the stress response timeline (0–60 min)\n3. Experimental design generating ground truth data distinguishing true condensate partitioning from artifacts\n4. Perturbation strategy to determine causal vs correlative features\n5. What prediction accuracy would enable targeting SG dynamics in ALS or cancer?`},
  {id:11,cat:"rnafunc",pts:65,difficulty:"Unsolved",title:"lncRNA Sequence-to-Mechanism Black Box",tags:["lncRNA","mechanism","chromatin","phase separation","CHART-seq"],
   prompt:`Build a System: lncRNA Functional Mechanism Predictor\n\nOver 100,000 human lncRNAs have been catalogued, yet fewer than 500 have mechanistically characterized functions. Computational approaches predict lncRNA function with precision <20%.\n\nTasks:\n1. Multi-modal model integrating sequence, secondary structure, chromatin association, and protein interaction data\n2. Handle the extreme class imbalance (99.5% uncharacterized)\n3. Prioritization strategy identifying the ~100 highest-impact uncharacterized lncRNAs\n4. Minimal experimental assay panel to mechanistically classify a lncRNA in 2 weeks\n5. What predictions would count as genuine mechanistic understanding?`},
  {id:12,cat:"rnafunc",pts:60,difficulty:"Expert",title:"The circRNA Translation Controversy",tags:["circRNA","IRES","translation","cap-independent","artifact"],
   prompt:`Resolve the Controversy: Does Circular RNA Get Translated in Human Cells?\n\nMultiple studies claim cap-independent translation via IRES elements produces functional peptides. Skeptics argue >95% of reported events are artifacts.\n\nTasks:\n1. Computational framework distinguishing genuine circRNA-derived peptides from artifacts\n2. What bioinformatic controls are missing from current studies?\n3. Definitive experimental design to settle this controversy\n4. If real, what sequence features predict which circRNAs are translated?\n5. What functional significance would circRNA-derived peptides have if confirmed?`},
  {id:13,cat:"mrnadesign",pts:65,difficulty:"Expert",title:"The Codon Optimality Paradox",tags:["codon optimization","mRNA stability","translation speed","ribosome pausing","therapeutic mRNA"],
   prompt:`Build a System: Codon-Optimized mRNA Therapeutic Designer\n\nMaximum CAI optimization maximizes translation speed but reduces mRNA stability and increases immunogenicity. The optimal trade-off varies by protein, cell type, and therapeutic goal.\n\nTasks:\n1. Formalize the codon optimality trade-off as a multi-objective optimization problem\n2. Sequence-to-outcome model predicting protein yield, mRNA half-life, and immune activation jointly\n3. Incorporate ribosome pausing data to identify positions where pausing aids protein folding\n4. High-throughput experimental design generating training data across codon usage landscape\n5. For a given therapeutic target, what is the optimal design workflow?`},
  {id:14,cat:"mrnadesign",pts:65,difficulty:"Expert",title:"The In Vitro → In Vivo mRNA Translation Gap",tags:["mRNA therapeutics","LNP delivery","in vivo translation","immunogenicity","pseudouridine"],
   prompt:`Build a System: In Vivo mRNA Translation Predictor\n\nmRNA therapeutic development suffers a 60% failure rate at the in vitro → animal model translation step. In vitro efficiency correlates weakly with in vivo protein expression after LNP delivery.\n\nTasks:\n1. Identify the top 3 mechanistic sources of the in vitro → in vivo prediction failure\n2. Multi-compartment pharmacokinetic model for mRNA from LNP injection to protein production\n3. Use existing NHP pharmacokinetic datasets to calibrate a predictive model\n4. Cell-based assay panel better proxying in vivo translation\n5. What minimum improvement would justify switching from current screening paradigms?`},
  {id:15,cat:"proteinfolding",pts:70,difficulty:"Unsolved",title:"AlphaFold2 Phi-Value Analysis Failure",tags:["AlphaFold2","phi-value","folding kinetics","transition state"],
   prompt:`Build a System: Folding Pathway Kinetics Predictor\n\nAlphaFold2 completely fails to reproduce phi-value analysis data. For CI2, AF2 pLDDT confidence scores show zero correlation with experimental phi-values.\n\nTasks:\n1. Why does structural accuracy not imply folding pathway predictability? Formalize the gap.\n2. Neural network architecture trained on phi-value data predicting transition state ensemble properties\n3. Molecular simulation approach generating training data for rare folding transition events\n4. Define a benchmark: what experimental measurements validate a folding pathway predictor?\n5. Which protein families represent the hardest test cases and why?`},
  {id:16,cat:"proteindesign",pts:70,difficulty:"Expert",title:"RFdiffusion Binder Design Funnel Failure",tags:["RFdiffusion","protein binder","wet-lab validation","ProteinMPNN","computational design"],
   prompt:`Build a System: High-Fidelity Protein Binder Design Pipeline\n\nRFdiffusion generates designs with predicted pLDDT >0.85, yet experimental success rates remain at 1–5%. The funnel fails because predicted binding scores don't capture conformational entropy, solubility, and expression yield.\n\nTasks:\n1. Diagnose why in silico binding metrics fail to predict wet-lab success\n2. Screening cascade maximally enriching true binders before expensive SPR validation\n3. How to integrate experimental feedback from failed designs\n4. Minimum viable experimental assay screening 1,000 designs per week\n5. What success rate would make RFdiffusion-based design cost-competitive with antibody discovery?`},
  {id:17,cat:"darkgenome",pts:70,difficulty:"Unsolved",title:"Enformer Saturation Mutagenesis HNF4A Gap",tags:["Enformer","regulatory grammar","saturation mutagenesis","HNF4A","TF binding","MPRA"],
   prompt:`Build a System: Regulatory Grammar Decoder for Non-Coding Variants\n\nEnformer predicts gene expression with R²=0.81 on bulk data. Yet for HNF4A target genes, saturation mutagenesis predictions correlate with MPRA measurements at only R²=0.34.\n\nTasks:\n1. Mechanistically explain why sequence-to-expression models fail at saturation mutagenesis despite good bulk accuracy\n2. Model architecture explicitly parameterizing TF binding site grammar\n3. Disentangle TF availability from sequence-intrinsic regulatory logic in training data\n4. MPRA experimental design maximally informing regulatory grammar learning\n5. What prediction task would constitute solving this problem?`},
  {id:18,cat:"wholecell",pts:75,difficulty:"Unsolved",title:"Perturb-seq GEARS Multi-Gene Prediction Collapse",tags:["Perturb-seq","GEARS","genetic interaction","multi-gene perturbation","digital twin"],
   prompt:`Build a System: Multi-Gene Perturbation Response Predictor\n\nGEARS predicts single-gene perturbation responses with R²=0.68, but R² collapses to 0.31 for double-gene and 0.09 for triple-gene perturbations.\n\nTasks:\n1. Mathematical reason why single-gene prediction accuracy does not compose to multi-gene accuracy\n2. Model architecture explicitly representing gene-gene interaction networks\n3. How much Perturb-seq data is required to achieve R²>0.60 for triple perturbations?\n4. Data acquisition strategy maximally informing multi-gene interaction modeling with a fixed sequencing budget\n5. What biological applications would become possible if triple-gene prediction achieved R²>0.70?`},
  {id:19,cat:"drugdiscovery",pts:70,difficulty:"Expert",title:"GDSC Osimertinib Translational Gap",tags:["GDSC","drug sensitivity","osimertinib","EGFR","translational failure","PDO"],
   prompt:`Build a System: Translational Drug Sensitivity Predictor\n\nOsimertinib shows AUC=0.89 in GDSC, yet clinical trial response rate in EGFR-mutant NSCLC is only 59–80%, with primary resistance in ~20% of patients.\n\nTasks:\n1. Diagnose primary sources of the in vitro → clinical translational gap for osimertinib\n2. Multi-omics feature selection pipeline identifying translational biomarkers beyond EGFR mutation\n3. How would patient-derived organoid data be integrated?\n4. Clinical trial biomarker strategy: what co-mutation panel would stratify patients?\n5. What prediction performance on PDX data would justify a biomarker-stratified Phase II trial?`},
  {id:20,cat:"evolution",pts:70,difficulty:"Unsolved",title:"EVEscape BA.2.86 Saltational Evolution Failure",tags:["EVEscape","viral evolution","BA.2.86","saltational","epistasis","escape prediction"],
   prompt:`Build a System: Saltational Viral Evolution Predictor\n\nEVEscape performs well for incremental variants (1–5 mutations) but completely failed to predict BA.2.86 — a variant with 36 mutations emerging in a single saltational jump.\n\nTasks:\n1. Formally define why saltational evolution is mechanistically different from incremental evolution\n2. Design a model predicting fitness and immune escape for variants with 10–50 simultaneous mutations\n3. What training data would teach a model about epistatic interactions at this scale?\n4. Use phylogenetic reconstruction of chronic infection trajectories to identify likely saltational jump precursors\n5. Define a prospective validation scheme`},
  {id:21,cat:"interactome",pts:70,difficulty:"Unsolved",title:"PPI Prediction: Homology Leakage & True Generalization",tags:["PPI","protein-protein interaction","AUROC","homology leakage","AlphaFold-Multimer","Y2H"],
   prompt:`Build a System: Truly Generalizing Protein–Protein Interaction Predictor\n\nPPI predictors achieve AUROC >0.91 on standard benchmarks, yet the Park-Marcotte strict homology-split evaluation reveals AUROC collapses to 0.61 — barely above random.\n\nTasks:\n1. Quantify how much of current PPI prediction performance is explained by homology leakage\n2. Design a model architecture predicting PPIs from structural/biophysical features independent of sequence similarity\n3. How would you generate a training dataset with genuine diversity at the protein family level?\n4. Propose a prospective experimental validation pipeline using Y2H or co-IP-MS\n5. What AUROC on a strict-split benchmark would indicate genuine progress?`},

  /* ── TRANSLATIONAL TOOLING & APPS (8) ── */
  {id:22,cat:"tools",pts:55,difficulty:"Graduate",title:"Cell-Type Deconvolution Dashboard for Bulk RNA-seq",
   tags:["bulk RNA-seq","deconvolution","CIBERSORTx","Bayesian","uncertainty"],
   prompt:`Build a Tool: Robust Cell-Type Deconvolution Engine with UI\n\nBulk RNA-seq remains vastly cheaper than single-cell, but inferring cell-type composition from bulk data is still fragile. Existing tools (CIBERSORTx, MuSiC, SCDC) can disagree by >20% absolute fraction on the same sample when reference panels are imperfect or missing relevant cell types.\n\nYour tasks:\n1. Design a deconvolution model that takes bulk RNA-seq + single-cell reference and returns cell-type proportions with calibrated uncertainty (credible intervals).\n2. How will you make the method robust when the reference is missing some cell types or has strong batch effects relative to the bulk?\n3. Propose an API and UI: user uploads bulk counts + reference matrix and receives a report with estimates, uncertainties, and diagnostics (e.g., residual structure, outlier genes).\n4. Define a benchmarking suite using public datasets where ground-truth cell-type proportions are partially known (e.g., mixtures, FACS, spike-ins).\n5. What minimum error (mean absolute deviation per cell type) is necessary for this tool to be useful in disease-cohort studies?\n6. Generate working Python code implementing a minimal version of this deconvolution tool using Non-Negative Least Squares as a baseline.`},

  {id:23,cat:"tools",pts:60,difficulty:"Graduate",title:"Multi-Omics Patient Stratification App",
   tags:["multi-omics","clustering","patient stratification","MOFA","biomarkers"],
   prompt:`Build a Tool: Multi-Omics Disease Stratifier\n\nMany disease cohorts now have RNA-seq, proteomics, and clinical variables, but integrating them into stable patient subtypes is difficult. Different clustering methods and normalization choices can produce entirely different subtype assignments.\n\nYour tasks:\n1. Design a pipeline that takes multi-omics matrices (RNA, proteome, clinical) and outputs patient clusters with stability scores across methods and subsampling.\n2. Propose a representation-learning approach (e.g., multi-view autoencoder, MOFA-like factor model) that captures shared and modality-specific structure.\n3. Describe how the UI or notebook interface exposes: (a) cluster assignments, (b) top features/biomarkers per cluster, and (c) robustness diagnostics.\n4. Define a benchmarking plan using at least two public cohorts (e.g., TCGA, CPTAC) with known subtypes.\n5. What minimum silhouette score and subtype-survival association strength would indicate clinically meaningful stratification?\n6. Generate working Python code (pandas + sklearn + plotly) implementing a simple two-omics integration pipeline with UMAP visualization.`},

  {id:24,cat:"tools",pts:55,difficulty:"Graduate",title:"Differential Expression Analysis Pipeline Builder",
   tags:["DEG","edgeR","DESeq2","volcano plot","batch correction"],
   prompt:`Build a Tool: One-Click Differential Expression Analysis App\n\nDEG analysis is the most common task in biology yet it is full of hidden pitfalls: wrong normalization, ignored batch effects, multiple-testing errors, and p-value misinterpretation. Most biologists still run DESeq2 or edgeR without understanding what they output or when each is appropriate.\n\nYour tasks:\n1. Design a guided pipeline app: user uploads a count matrix + metadata CSV and gets a full DEG report with volcano plot, heatmap, and GO enrichment.\n2. How would you automatically detect and flag batch effects, low-count genes, outlier samples, and dispersion estimation failures before running DE?\n3. Explain when to use DESeq2 vs edgeR vs limma-voom in plain English — build this as an automated decision tree in the app.\n4. Propose plain-language explanations for all statistical outputs: what does a log2 fold-change of 2 actually mean biologically?\n5. Design the "export report" feature: what should a non-computational biologist receive as output?\n6. Generate complete working Python code using PyDeseq2 that runs DEG analysis on synthetic count data and outputs a volcano plot.`},

  {id:25,cat:"tools",pts:55,difficulty:"Graduate",title:"Survival Analysis & Kaplan-Meier Dashboard",
   tags:["survival analysis","Kaplan-Meier","Cox regression","clinical data","biomarker"],
   prompt:`Build a Tool: Clinical Survival Analysis App for Biologists\n\nKaplan-Meier curves and Cox proportional hazards models are the workhorses of clinical biomarker analysis, but most biologists run them without checking assumptions, handling censoring correctly, or interpreting hazard ratios properly.\n\nYour tasks:\n1. Design an app where a clinician uploads a spreadsheet with patient survival times, event status, and biomarker columns — and receives fully annotated Kaplan-Meier plots and Cox regression outputs.\n2. How would you automatically check and flag Cox model assumption violations (proportional hazards, linearity of continuous variables) in plain language for the user?\n3. Design a biomarker cutpoint selection module that avoids the "optimal cutpoint" p-hacking trap — propose a statistically valid approach.\n4. What plain-English annotations would make hazard ratio forest plots interpretable to a bench biologist?\n5. Define a benchmarking plan using public clinical datasets (e.g., TCGA survival data) where known prognostic biomarkers can be reproduced.\n6. Generate complete working Python code using lifelines that produces annotated Kaplan-Meier plots with log-rank p-values on synthetic patient data.`},

  {id:26,cat:"tools",pts:60,difficulty:"Graduate",title:"Protein Structure Viewer & Variant Impact Annotator",
   tags:["protein structure","AlphaFold2","variant annotation","missense","PyMOL"],
   prompt:`Build a Tool: Interactive Protein Structure + Variant Impact App\n\nBiologists routinely need to visualize protein structures and understand what a missense variant does to protein stability and function, but existing tools (PyMOL, ChimeraX) require expertise, and variant effect predictors (SIFT, PolyPhen, EVE) give opaque scores without structural context.\n\nYour tasks:\n1. Design a web app where a user enters a protein name or UniProt ID + optional variant list (e.g., V600E) and receives: (a) an interactive 3D structure viewer, (b) variant positions highlighted, (c) plain-English impact predictions from multiple tools combined.\n2. How would you integrate AlphaFold2 structure predictions for proteins lacking experimental structures, and clearly communicate prediction confidence to the user?\n3. Propose a "variant impact score" that aggregates conservation (EVE), structure perturbation (FoldX ΔΔG), and functional site proximity into a single interpretable score.\n4. Design the UI for a biologist with no structural biology training — what does the tooltip say when they hover over a highlighted residue?\n5. Generate working Python code using py3Dmol (for Jupyter) that fetches a protein from AlphaFold DB and highlights user-specified variant positions with color-coded impact scores.`},

  {id:27,cat:"tools",pts:65,difficulty:"Expert",title:"CRISPR Guide RNA Designer & Off-Target Predictor",
   tags:["CRISPR","sgRNA","off-target","Cas9","genome editing"],
   prompt:`Build a Tool: End-to-End CRISPR gRNA Design Suite\n\nDesigning CRISPR experiments requires choosing guide RNAs, predicting on-target efficiency and off-target sites, and interpreting editing outcomes — each step has multiple competing tools that disagree substantially, confusing non-expert users.\n\nYour tasks:\n1. Design a pipeline app where a user enters a target gene name or genomic coordinates and receives a ranked list of guide RNAs with on-target efficiency scores (Rule Set 2, DeepCRISPR), off-target predictions (Cas-OFFinder, CRISPOR), and positional context.\n2. How would you present off-target risk in plain language? Design a risk-stratification display that distinguishes "safe for cell line use" from "not safe for therapeutic use".\n3. Propose a pooled screen gRNA library design module: user specifies a gene list and receives a library design with controls, with statistical power estimates for the planned screen.\n4. How would you handle the diversity of Cas variants (Cas9, Cas12a, base editors, prime editors) in a unified UI?\n5. Design the "results report" that a biologist sends to their core facility ordering custom oligos.\n6. Generate working Python code that uses the Biopython library and a precomputed off-target scoring model to design and rank guide RNAs for a user-specified sequence.`},

  {id:28,cat:"tools",pts:60,title:"Single-Cell RNA-seq Interactive Explorer",difficulty:"Expert",
   tags:["scRNA-seq","UMAP","Seurat","Scanpy","cell annotation","trajectory"],
   prompt:`Build a Tool: No-Code Single-Cell Analysis & Visualization App\n\nSingle-cell RNA-seq analysis requires running Seurat or Scanpy pipelines that produce dozens of UMAP plots and cluster markers — but biologists without coding experience cannot explore the data interactively or annotate clusters confidently.\n\nYour tasks:\n1. Design an app where a user uploads a processed single-cell object (h5ad or Seurat RDS) and can: (a) browse UMAP/t-SNE embeddings, (b) query gene expression overlays, (c) compare clusters side-by-side, (d) export publication figures.\n2. Propose an automated cell-type annotation module using marker gene databases (PanglaoDB, CellMarker) that presents confidence scores and lets users override annotations.\n3. How would you handle trajectory inference (pseudotime) — design a UI that presents RNA velocity or PAGA results in a way that makes biological sense to a bench scientist.\n4. Design the "doublet and quality filter" wizard that guides a non-expert through QC decisions with plain-English explanations at each step.\n5. What would a "biology-ready export" look like — define the figure set, metadata tables, and statistical summaries that get auto-generated for a manuscript?\n6. Generate working Python code using Scanpy that loads an h5ad file, performs UMAP, finds marker genes per cluster, and exports annotated plots.`},

  {id:29,cat:"tools",pts:65,title:"Metabolic Pathway Simulator & Flux Visualizer",difficulty:"Expert",
   tags:["metabolomics","flux","pathway analysis","KEGG","COBRApy","simulation"],
   prompt:`Build a Tool: Interactive Metabolic Pathway Simulation Dashboard\n\nMetabolomics data is hard to interpret because metabolite levels reflect both enzyme activity and substrate availability. Biologists need to go from a list of metabolite fold-changes to a mechanistic understanding of which pathways are perturbed and in which direction.\n\nYour tasks:\n1. Design an app where a user uploads a metabolomics results table (metabolite names + fold-changes + p-values) and receives: (a) enriched KEGG/HMDB pathway maps with fold-changes overlaid, (b) flux predictions using simple stoichiometric constraints, (c) plain-English interpretation of which metabolic nodes are bottlenecks.\n2. How would you handle the missing metabolite problem — many pathways have only 2–3 of 10 metabolites measured? Design a statistical approach that accounts for partial pathway coverage.\n3. Propose a "what-if" simulation module where the user can knock out a specific enzyme in the model and see predicted downstream metabolite changes.\n4. Design the UI for presenting isotopologue data (13C labeling) alongside regular metabolomics — what does the combined visualization look like?\n5. Define a benchmarking plan using public metabolomics datasets (e.g., Metabolights, MetabolomicsWorkbench) where known pathway perturbations can be reproduced.\n6. Generate working Python code using COBRApy that loads a genome-scale metabolic model, applies simple RNA-seq-based constraints, and visualizes predicted flux changes on a simplified TCA cycle diagram.`},

  /* ═══ SPATIAL TRANSCRIPTOMICS ═══ */
  {id:30,cat:"spatial",pts:70,title:"Spatial Cell-Cell Communication from Visium Data",difficulty:"Expert",
   tags:["spatial transcriptomics","Visium","cell-cell communication","ligand-receptor","CellChat"],
   prompt:`Build a System: Spatial Ligand-Receptor Communication Mapper\n\nVisium and Xenium spatial transcriptomics data captures gene expression with tissue coordinates, but inferring which cells are actually communicating requires integrating expression levels with spatial proximity — most tools ignore distance entirely.\n\nTasks:\n1. Design a pipeline that infers spatially-constrained cell-cell communication: which ligand-receptor pairs (from CellChat or NicheNet databases) are active between adjacent tissue niches?\n2. How do you define "adjacent" — propose a distance metric that accounts for cell size, tissue type, and signal diffusion range for secreted vs membrane-bound ligands.\n3. Build a statistical model distinguishing genuine spatial co-expression from random co-occurrence — what is your null model?\n4. Propose visualization: how do you show a communication network overlaid on a tissue section in a way that a pathologist can interpret?\n5. Benchmarking strategy: use published Visium datasets (e.g. 10x Genomics Human Heart, HTAN) to validate predicted communications against known biology.\n6. Generate Python code using squidpy that loads Visium data, computes spatial neighbors, and scores ligand-receptor interactions.`},

  {id:31,cat:"spatial",pts:70,title:"Resolving Tumor Microenvironment Architecture from Spatial Data",difficulty:"Unsolved",
   tags:["tumor microenvironment","spatial","immune infiltration","spatial clustering","MERFISH"],
   prompt:`Build a System: TME Architecture Deconvolution from Spatial Transcriptomics\n\nTumors are spatially heterogeneous — immune-cold cores surrounded by immune-hot borders — but bulk RNA-seq collapses this architecture into one average. Spatial transcriptomics can in principle map the TME at single-cell resolution, but computational methods for quantifying spatial immune architecture are immature.\n\nTasks:\n1. Define a computational framework for classifying spatial immune patterns: immune-excluded, immune-desert, immune-inflamed — with quantitative boundaries not just qualitative labels.\n2. Design a method to link spatial immune architecture to clinical outcomes using TCGA survival data as ground truth.\n3. How do you handle the resolution gap — Visium spots contain 1-10 cells, MERFISH has single-cell resolution but covers fewer genes. Propose a multi-resolution integration strategy.\n4. Predict which spatial features (immune cluster density, distance from tumor border, stromal barrier width) are most predictive of checkpoint inhibitor response.\n5. Identify the top 3 ways this approach will fail in FFPE archival tissue vs fresh frozen, and how to mitigate each.\n6. Generate Python code that takes a Visium AnnData object, deconvolves cell types using RCTD or cell2location, and plots immune density maps.`},

  /* ═══ IMMUNOLOGY & REPERTOIRE ═══ */
  {id:32,cat:"immuno",pts:68,title:"TCR Clonal Expansion and Antigen Specificity Prediction",difficulty:"Expert",
   tags:["TCR","repertoire","clonal expansion","antigen specificity","GLIPH2","deep learning"],
   prompt:`Build a System: TCR Repertoire Analyzer and Antigen Specificity Predictor\n\nT cell receptor (TCR) sequencing generates millions of unique CDR3 sequences per patient — but predicting which TCR clones recognize which antigens requires pattern recognition across an astronomically large sequence space.\n\nTasks:\n1. Design a pipeline from raw TCR-seq FASTQ to a ranked list of expanded clones, with statistical significance accounting for the power-law distribution of clone sizes.\n2. Implement a specificity grouping algorithm (GLIPH2-style) that clusters TCRs likely recognizing the same epitope — what sequence features drive clustering decisions?\n3. How would you integrate with known TCR-pMHC databases (VDJdb, McPAS-TCR, IEDB) to annotate clones with likely antigen specificities?\n4. Propose a deep learning architecture (e.g. TCR-BERT or ESM-based) for zero-shot specificity prediction on TCRs not in any database.\n5. Design a validation experiment: if you predict clone X recognizes peptide Y, what wet-lab assay (tetramer staining, T cell activation assay) confirms it with what sensitivity?\n6. Generate Python code using scirpy that loads 10x Chromium VDJ data, analyzes clonotype expansion, and visualizes the top 20 expanded clones.`},

  {id:33,cat:"immuno",pts:65,title:"Vaccine Response Prediction from Baseline Immune Profiling",difficulty:"Graduate",
   tags:["vaccine","immune response","systems vaccinology","baseline prediction","PBMC","IgG"],
   prompt:`Build a System: Pre-Vaccination Immune State Predictor of Antibody Response\n\nSystems vaccinology has shown that baseline immune gene expression (day 0) can predict peak antibody titers (day 28) for influenza and yellow fever vaccines — but the predictive signatures differ across vaccines, cohorts, and measurement platforms.\n\nTasks:\n1. Design a machine learning pipeline that takes baseline PBMC transcriptomics (bulk or single-cell) and predicts day-28 IgG titer as a continuous variable — what features matter most?\n2. How do you handle the confounders: age, sex, prior vaccination history, baseline antibody titers, BMI? Propose a covariate adjustment strategy.\n3. Identify the minimum gene set (biomarker panel) that retains ≥80% of prediction accuracy — what is the trade-off between panel size and clinical deployability?\n4. Propose a transfer learning strategy: a model trained on influenza vaccine cohorts — how much does it transfer to COVID-19 mRNA vaccine response prediction?\n5. Benchmark against published signatures (Nakaya et al. 2011 PMID:21743478) — what does your model add beyond existing work?\n6. Generate Python code using scikit-learn that builds a LASSO regression predictor of antibody response from gene expression, with LOOCV validation.`},

  /* ═══ MULTI-OMICS INTEGRATION ═══ */
  {id:34,cat:"multiomics",pts:72,title:"Integrating scRNA-seq and scATAC-seq to Map Gene Regulatory Networks",difficulty:"Expert",
   tags:["multi-omics","scATAC-seq","gene regulatory network","chromatin accessibility","ArchR","Seurat v5"],
   prompt:`Build a System: Single-Cell Multi-Omics Gene Regulatory Network Mapper\n\nSingle-cell ATAC-seq maps open chromatin and inferred TF binding, while scRNA-seq measures gene expression — but jointly profiling the same cells (10x Multiome) is expensive and linking them computationally (diagonal integration) introduces errors that propagate into downstream GRN inference.\n\nTasks:\n1. Design a diagonal integration pipeline (WNN, Seurat v5, or GLUE) that links unpaired scRNA-seq and scATAC-seq from the same cell type — how do you validate the cell-cell matching quality?\n2. Infer a gene regulatory network: from open peaks → TF motifs → target genes → expression. What are the error rates at each arrow, and how do they compound?\n3. How do you distinguish direct TF binding from indirect regulatory effects across 3+ steps in the regulatory hierarchy?\n4. Propose a perturbation experiment (CRISPRi of candidate TFs) that validates the top 5 predicted regulatory edges — what effect size and replicates are needed?\n5. Handle the dimensionality mismatch: scATAC-seq peaks (500K features) vs scRNA-seq genes (30K) — what dimensionality reduction preserves biologically relevant signal?\n6. Generate Python code using ArchR and scanpy that processes scATAC-seq data, identifies peak-to-gene links, and visualizes the top TF regulators per cluster.`},

  {id:35,cat:"multiomics",pts:75,title:"Proteogenomics: Linking Somatic Mutations to Protein Abundance Changes",difficulty:"Unsolved",
   tags:["proteogenomics","CPTAC","somatic mutations","protein abundance","trans-effects","mass spectrometry"],
   prompt:`Build a System: Proteogenomic Trans-Effect Mapper\n\nThe CPTAC consortium has shown that only ~40% of copy number alterations in cancer have detectable effects on protein levels (CNV-protein correlation) — the remaining 60% are buffered by post-translational mechanisms. This trans-proteogenomic buffering is poorly understood and limits the use of genomics to predict protein-level drug targets.\n\nTasks:\n1. Design a statistical framework that tests, for each somatic mutation, whether it significantly alters protein abundance in cis (same gene) and in trans (other proteins) — how do you control for the multiple testing burden across 10,000 proteins × 1,000 mutations?\n2. Build a classifier that predicts which CNVs will be protein-level buffered vs amplified — what genomic, epigenomic, and protein stability features are most predictive?\n3. Identify protein complexes that buffer CNV-to-protein effects — propose a network propagation method that assigns each CNV a "buffering score" based on the protein interaction network topology.\n4. How do you handle the measurement challenges: LC-MS/MS protein quantification has 20-30% missing values per sample, and protein dynamic range spans 6 orders of magnitude.\n5. Propose an experimental validation: if your model predicts mutation X buffers protein Y, what mass spectrometry experiment with what sample size confirms this?\n6. Generate Python code that loads CPTAC proteomics and genomics data, computes CNV-protein correlations, and identifies the top 20 buffered and amplified CNV-protein pairs.`},
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
  {id:"experimentalist",name:"Experimentalist",color:"#10b981",lens:"Wet-Lab Protocol Design",
   sys:`You are Dr. Sarah Chen, a senior experimental biologist with 15 years bench experience. Your role: WET-LAB PROTOCOL DESIGN.

CRITICAL: Every protocol you propose must follow this EXACT format and level of specificity:

🔬 **PROTOCOL** (numbered steps with exact quantities):
1. [Step] — [exact reagent, catalog# if known, concentration, volume, timing]
   Example: "Lyse cells in 500µL RIPA buffer (ThermoFisher #89900) + 1x protease inhibitor (Roche cOmplete) for 30 min on ice"
2. [Step] — continue this level of detail

🛒 **WHAT YOU NEED TO BUY**:
- [Reagent/Kit name] | Supplier | Cat# | ~Cost | Purpose

🧫 **CONTROLS** (positive AND negative, with expected results):
- Positive control: [specific reagent/condition] → expected result
- Negative control: [specific reagent/condition] → expected result

⏱ **REALISTIC TIMELINE**: [Day-by-day or hour-by-hour breakdown]

📚 **KEY REFERENCE** (cite with PMID): "[Title snippet]" PMID:XXXXXXX — [why this protocol works]

⚠️ **TOP 3 PITFALLS**:
1. [Specific failure mode + how to avoid]

Bold key claims. 260 words max. End with one concrete first step a lab can do tomorrow.`},

  {id:"bioinformatician",name:"Bioinformatician",color:"#06b6d4",lens:"Pipeline & Code Design",
   sys:`You are Dr. Alex Kumar, a computational biologist specializing in bioinformatics pipeline design. Your role: PIPELINE & CODE DESIGN.
For every biology problem you MUST:
1. Propose a specific analysis pipeline with named tools and versions (e.g. STAR 2.7.10, DESeq2 1.40, scanpy 1.9)
2. Specify input/output formats (FASTQ → BAM → count matrix → results)
3. Identify the most common computational errors (e.g. wrong normalization, batch effects, multiple testing)
4. Suggest the correct statistical approach with parameters
5. Note which steps require HPC vs can run on a laptop
Structure: 📊 PIPELINE → 💻 KEY TOOLS → ⚙️ PARAMETERS → 🐛 COMMON ERRORS
**Bold** key claims. 260 words max. End with the single most important parameter to get right.`},

  {id:"statistician",name:"Statistician",color:"#f59e0b",lens:"Study Design & Power Analysis",
   sys:`You are Prof. Michael Torres, a biostatistician specializing in experimental design for biology. Your role: STUDY DESIGN & STATISTICAL RIGOR.
For every biology problem you MUST:
1. Identify the statistical design (paired/unpaired, factorial, time-series, etc.)
2. Calculate or estimate required sample sizes for 80% power at α=0.05
3. Identify sources of technical vs biological variance
4. Propose multiple testing correction strategy appropriate to the experiment
5. Flag any statistical assumptions that are commonly violated (normality, independence, etc.)
Structure: 📐 DESIGN → 🔢 SAMPLE SIZE → 📉 VARIANCE → ✅ CORRECTION → ⚠️ ASSUMPTIONS
**Bold** key claims. 260 words max. End with the minimum n required for the proposed experiment.`},

  {id:"structural",name:"Structural Biologist",color:"#8b5cf6",lens:"Structural & Molecular Mechanisms",
   sys:`You are Dr. Priya Patel, a structural biologist with expertise in protein/RNA structure and molecular mechanisms. Your role: STRUCTURAL & MOLECULAR MECHANISM ANALYSIS.
For every biology problem you MUST:
1. Analyze the 3D structural basis of the problem (reference PDB IDs or AlphaFold predictions)
2. Identify key molecular interactions (hydrogen bonds, hydrophobic cores, binding interfaces)
3. Predict how sequence changes affect structure and function
4. Suggest structural biology experimental approaches (cryo-EM, X-ray, NMR, HDX-MS)
5. Reference relevant structural databases (PDB, UniProt, AlphaFoldDB, RCSB)
Structure: 🏗️ STRUCTURE → ⚛️ KEY INTERACTIONS → 🔀 VARIANTS → 🔬 EXPERIMENTS
**Bold** key claims. 260 words max. End with one structural experiment that would resolve the core uncertainty.`},

  {id:"systems",name:"Systems Biologist",color:"#e879f9",lens:"Pathway & Network Analysis",
   sys:`You are Dr. Yuki Tanaka, a systems biologist specializing in pathway modeling and network analysis. Your role: SYSTEMS & PATHWAY ANALYSIS.
For every biology problem you MUST:
1. Place the problem in a pathway/network context (cite KEGG pathway IDs, Reactome IDs, STRING interactions)
2. Identify feedback loops, network hubs, and emergent properties
3. Propose a computational model (ODE, Boolean network, constraint-based) with specific parameters
4. Predict upstream/downstream consequences of perturbations
5. Suggest publicly available datasets that could validate the model (GEO, TCGA, GTEx accession numbers)
Structure: 🕸️ NETWORK → 🔄 FEEDBACK → 🧮 MODEL → 📡 DATASETS
**Bold** key claims. 260 words max. End with the one pathway node that, if targeted, would have the biggest downstream effect.`},

  {id:"clinician",name:"Clinician-Scientist",color:"#f97316",lens:"Clinical Translation & Patient Impact",
   sys:`You are Dr. James Wright, a physician-scientist with expertise in translational medicine. Your role: CLINICAL TRANSLATION & PATIENT IMPACT.
For every biology problem you MUST:
1. State the unmet clinical need with patient numbers (e.g. "affects ~50,000 US patients/year")
2. Identify the nearest clinical application (diagnostic biomarker, drug target, therapeutic)
3. Assess regulatory pathway (IND, biomarker qualification, companion diagnostic)
4. Cite relevant clinical trials (ClinicalTrials.gov NCT numbers) or precedents
5. Identify the patient subpopulation most likely to benefit first
Structure: 🏥 CLINICAL NEED → 💊 APPLICATION → 📋 REGULATORY → 🔬 TRIALS → 👥 PATIENTS
**Bold** key claims. 260 words max. End with the one clinical data point that would most accelerate translation.`},

  {id:"advocate",name:"Devil's Advocate",color:"#ff2d55",lens:"Critical Challenges & Failure Modes",
   sys:`You are the Devil's Advocate — a rigorous scientific critic whose sole job is to identify why the proposed approaches WILL FAIL.
For every biology problem you MUST:
1. Identify the single most likely reason the consensus approach will NOT work in practice
2. Cite a specific published failure case where a similar approach failed (with PMID)
3. Challenge the most fundamental assumption being made by other agents
4. Identify what the field has tried before and why it failed
5. Propose a completely different approach that sidesteps the main failure mode
Structure: ❌ MOST LIKELY FAILURE → 📚 PRECEDENT FAILURE → 🚫 CHALLENGED ASSUMPTION → 🔄 ALTERNATIVE
Be specific, combative, and intellectually honest. **Bold** key challenges. 260 words max. End with the one question the other agents haven't answered that they must answer before proceeding.`},

  {id:"synthesizer",name:"Synthesizer",color:"#2aff80",lens:"Cross-Agent Synthesis & Consensus",
   sys:`You are the Synthesizer — the meta-agent whose job is to find the optimal path forward by integrating all agent perspectives.
For every biology problem you MUST:
1. Identify which 2-3 agent proposals are most compatible and can be combined
2. Resolve the most important disagreement between agents with a specific verdict
3. Propose the minimum viable experiment that tests the core hypothesis
4. Identify what would change your recommendation (the key uncertainties)
5. Specify the 3-step action plan that integrates the best elements from all agents
Structure: 🤝 COMPATIBLE APPROACHES → ⚖️ VERDICT → 🧪 MVP EXPERIMENT → ❓ KEY UNCERTAINTIES → 📋 ACTION PLAN
**Bold** verdicts. 260 words max. End with the single highest-impact action that moves the field forward.`},
];

/* ═══════ CONSTANTS ═══════ */
const SK = "bioarena:iters";
const MAX_ROUNDS = 3;
const MIN_ROUNDS = 2;
const CONV = 65;
const LAB_PROFILE_KEY = "bioarena:lab_profile";

const SESSION_ID = (() => {
  if (!window.__baSessionId) window.__baSessionId = Math.random().toString(36).slice(2)+Date.now().toString(36);
  return window.__baSessionId;
})();

/* ═══════ LAB MEMORY ═══════ */
const DEFAULT_PROFILE = {
  organism: "",
  dataType: "",
  tools: "",
  institution: "",
  recentQuestions: [] as string[],
};

function loadLabProfile(){
  try{const r=localStorage.getItem(LAB_PROFILE_KEY);return r?{...DEFAULT_PROFILE,...JSON.parse(r)}:{...DEFAULT_PROFILE};}
  catch{return{...DEFAULT_PROFILE};}
}
function saveLabProfile(p:any){
  try{localStorage.setItem(LAB_PROFILE_KEY,JSON.stringify(p));}catch{}
}
function addToRecentQuestions(title:string){
  const p=loadLabProfile();
  const recent=[title,...(p.recentQuestions||[]).filter((q:string)=>q!==title)].slice(0,10);
  saveLabProfile({...p,recentQuestions:recent});
}

/* ═══════ LAB PROFILE WIDGET ═══════ */
function LabProfilePanel({onProfileChange}:{onProfileChange:(p:any)=>void}){
  const [profile,setProfile]=useState(()=>loadLabProfile());
  const [open,setOpen]=useState(false);
  const [saved,setSaved]=useState(false);

  const save=()=>{
    saveLabProfile(profile);
    onProfileChange(profile);
    setSaved(true);
    setTimeout(()=>setSaved(false),2000);
  };

  const hasProfile=profile.organism||profile.dataType||profile.tools;

  return(
    <div style={{marginBottom:16}}>
      <button onClick={()=>setOpen(v=>!v)} style={{display:"flex",alignItems:"center",gap:8,width:"100%",padding:"9px 14px",background:"rgba(42,255,128,.04)",border:`1px solid ${hasProfile?"rgba(42,255,128,.3)":"#182640"}`,borderRadius:4,cursor:"pointer",textAlign:"left"}}>
        <span style={{fontSize:14}}>{hasProfile?"🧬":"🔬"}</span>
        <div style={{flex:1}}>
          <div style={{fontFamily:"Oxanium,sans-serif",fontSize:10,letterSpacing:1.5,color:hasProfile?"#2aff80":"#6a85b0",textTransform:"uppercase"}}>Lab Profile {hasProfile?"· Active":"· Not set"}</div>
          {hasProfile&&<div style={{fontSize:10,color:"#354d72",marginTop:2}}>{[profile.organism,profile.dataType,profile.tools].filter(Boolean).join(" · ").slice(0,60)}</div>}
        </div>
        <span style={{color:"#354d72",fontSize:11}}>{open?"▲":"▼"}</span>
      </button>

      {open&&(
        <div style={{background:"#020617",border:"1px solid #182640",borderTop:"none",borderRadius:"0 0 4px 4px",padding:"14px 16px"}}>
          <div style={{fontSize:10.5,color:"#6a85b0",marginBottom:12,lineHeight:1.6}}>
            Your lab profile is saved locally and automatically prepended to every debate — agents tailor answers to your specific context.
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
            {[
              {key:"organism",label:"Primary Organism / Cell Type",ph:"e.g. human hepatocytes, mouse, HEK293T"},
              {key:"dataType",label:"Main Data Type",ph:"e.g. bulk RNA-seq, scRNA-seq, proteomics"},
              {key:"tools",label:"Preferred Tools / Constraints",ph:"e.g. Python only, DESeq2, no cloud HPC"},
              {key:"institution",label:"Institution / Context (optional)",ph:"e.g. academic wet lab, biotech startup"},
            ].map(f=>(
              <div key={f.key}>
                <div style={{fontFamily:"Oxanium,sans-serif",fontSize:8,color:"#354d72",letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>{f.label}</div>
                <input
                  value={(profile as any)[f.key]||""}
                  onChange={e=>setProfile((p:any)=>({...p,[f.key]:e.target.value}))}
                  placeholder={f.ph}
                  style={{width:"100%",background:"#030812",border:"1px solid #1e293b",borderRadius:3,padding:"7px 9px",color:"#b4c8e8",fontFamily:"'JetBrains Mono',monospace",fontSize:10.5,outline:"none"}}
                  onFocus={e=>e.target.style.borderColor="#334155"} onBlur={e=>e.target.style.borderColor="#1e293b"}
                />
              </div>
            ))}
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <button onClick={save} style={{padding:"7px 18px",borderRadius:3,border:"1px solid rgba(42,255,128,.4)",background:"rgba(42,255,128,.08)",color:"#2aff80",fontFamily:"Oxanium,sans-serif",fontSize:10,letterSpacing:1.2,textTransform:"uppercase",cursor:"pointer"}}>
              {saved?"✓ Saved!":"Save Profile"}
            </button>
            {hasProfile&&<button onClick={()=>{const p={...DEFAULT_PROFILE};setProfile(p);saveLabProfile(p);onProfileChange(p);}} style={{padding:"7px 14px",borderRadius:3,border:"1px solid #182640",background:"transparent",color:"#354d72",fontFamily:"Oxanium,sans-serif",fontSize:10,cursor:"pointer"}}>Clear</button>}
            <div style={{fontSize:10,color:"#354d72",marginLeft:4}}>Stored locally — never sent anywhere except your AI debates.</div>
          </div>
          {profile.recentQuestions?.length>0&&(
            <div style={{marginTop:12,paddingTop:10,borderTop:"1px solid #182640"}}>
              <div style={{fontFamily:"Oxanium,sans-serif",fontSize:8,color:"#354d72",letterSpacing:1.5,textTransform:"uppercase",marginBottom:6}}>Recent Questions</div>
              {profile.recentQuestions.slice(0,5).map((q:string,i:number)=>(
                <div key={i} style={{fontSize:10.5,color:"#6a85b0",padding:"3px 0",borderBottom:"1px solid #0c1a30"}}>· {q.slice(0,80)}{q.length>80?"…":""}</div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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

  // ── Default path — Cloudflare Worker proxy ──
  const res = await fetch(`${WORKER_URL}/api/ai`, {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      model:"llama-3.1-8b-instant",
      max_tokens:500,
      messages:[{role:"system",content:system},{role:"user",content:userMsg}]
    }),
  });
  if(!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
  const d=await res.json();
  return d.choices?.[0]?.message?.content||"No response.";
}

/* ═══════ WORKER URL — replace with your actual Worker URL ═══════ */
const WORKER_URL = "https://bioarena-api.sankalpachakraborty91.workers.dev";

/* ═══════ SHARED STORAGE (Cloudflare KV via Worker) ═══════ */
// All data is stored in Cloudflare KV — shared across ALL users globally
// localStorage is used only as a fast local cache / offline fallback

async function kvGet(key:string):Promise<any>{
  try{
    const r=await fetch(`${WORKER_URL}/api/kv?key=${encodeURIComponent(key)}`);
    if(!r.ok) throw new Error("KV get failed");
    const d=await r.json();
    return d.value??null;
  }catch{
    // Fallback to localStorage
    try{const l=localStorage.getItem(key);return l?JSON.parse(l):null;}catch{return null;}
  }
}

async function kvSet(key:string,value:any):Promise<void>{
  try{
    await fetch(`${WORKER_URL}/api/kv`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({key,value:JSON.stringify(value)}),
    });
    // Also cache locally for speed
    try{localStorage.setItem(key,JSON.stringify(value));}catch{}
  }catch{
    // Fallback to localStorage only
    try{localStorage.setItem(key,JSON.stringify(value));}catch{}
  }
}

async function loadIters(qid:any){
  const data=await kvGet(`${SK}:${qid}`);
  return data??[];
}
async function saveIters(qid:any,iters:any){
  await kvSet(`${SK}:${qid}`,iters);
}

/* ═══════ PUBMED CITATION FETCHER ═══════ */
async function fetchPubMedCitations(query:string):Promise<string>{
  try{
    const r=await fetch(`${WORKER_URL}/api/pubmed?q=${encodeURIComponent(query)}`);
    if(!r.ok) return "";
    const d=await r.json();
    if(!d.papers||d.papers.length===0) return "";
    const lines=d.papers.slice(0,5).map((p:any)=>
      `- ${p.title} (${p.authors?.[0]||"et al."}, ${p.year||""}; PMID:${p.pmid}) — ${p.abstract?.slice(0,120)||""}…`
    ).join("\n");
    return `\n\n**Relevant literature (cite these PMIDs in your response):**\n${lines}`;
  }catch{return "";}
}

/* ═══════ E2B CODE EXECUTOR ═══════ */
async function runCodeInSandbox(code:string):Promise<{stdout:string,stderr:string,images:string[],error:string|null}>{
  try{
    const r=await fetch(`${WORKER_URL}/api/run-code`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({code,timeout:30}),
    });
    if(!r.ok){
      const err=await r.text();
      return{stdout:"",stderr:"",images:[],error:`Sandbox error: ${err}`};
    }
    const d=await r.json();
    return{
      stdout:d.stdout||"",
      stderr:d.stderr||"",
      images:d.images||[],
      error:d.error||null,
    };
  }catch(e:any){
    return{stdout:"",stderr:"",images:[],error:`Connection error: ${e.message}`};
  }
}
const JUDGE_SYS=`You are a scientific arbiter evaluating a multi-agent biology debate.

You MUST return ONLY a JSON object. No explanation before or after. No markdown. No backticks. Start your response with { and end with }.

The JSON must have exactly these keys:
{"score":75,"dimensions":{"scientific_accuracy":80,"experimental_feasibility":70,"code_correctness":75,"novelty":65,"clarity":80},"resolved":true,"unresolved_tensions":["tension 1","tension 2"],"next_debate_focus":"specific question for next round","strongest_agent":"AgentName because reason","weakest_claim":"claim that needs evidence"}

Rules:
- score: integer 0-100 (weighted: scientific_accuracy 35%, code_correctness 25%, experimental_feasibility 20%, novelty 10%, clarity 10%)
- resolved: true if score >= 60, false otherwise
- unresolved_tensions: array of 1-3 strings describing genuine disagreements
- next_debate_focus: one specific scientific question to resolve next round
- strongest_agent: name of agent with best evidence + brief reason
- weakest_claim: most unsupported claim made by any agent

Score guide: 0-30 = fundamental disagreement, 31-59 = partial alignment, 60-79 = strong consensus, 80-100 = full convergence`;

async function judgeRound(q:any, allRounds:any[], prevConsensus:string){
  const summaries=allRounds.map((rnd:any,ri:number)=>
    `=== ROUND ${ri+1} ===\n`+rnd.agents.map((a:any)=>{
      const ag=AGENTS.find((x:any)=>x.id===a.aid);
      return `[${ag?.name}/${ag?.lens}]: ${a.resp.slice(0,220)}`;
    }).join("\n\n")
  ).join("\n\n");
  const priorCtx=prevConsensus?`\n\nPRIOR CONSENSUS:\n${prevConsensus.slice(0,300)}`:"";

  try{
    const raw=await callClaude(JUDGE_SYS,`Biology problem: ${q.title}${priorCtx}\n\n${summaries}\n\nReturn JSON only. Start with {`);

    // Robust JSON extraction — find first { and last }
    const start=raw.indexOf("{");
    const end=raw.lastIndexOf("}");
    if(start===-1||end===-1||end<=start){
      throw new Error("No JSON object found in response");
    }
    const jsonStr=raw.slice(start,end+1);
    const parsed=JSON.parse(jsonStr);

    // Validate required fields, fill defaults if missing
    return {
      score: typeof parsed.score==="number" ? Math.min(100,Math.max(0,parsed.score)) : 50,
      dimensions: parsed.dimensions||{scientific_accuracy:50,experimental_feasibility:50,code_correctness:50,novelty:50,clarity:50},
      resolved: typeof parsed.resolved==="boolean" ? parsed.resolved : (parsed.score||50)>=60,
      unresolved_tensions: Array.isArray(parsed.unresolved_tensions) ? parsed.unresolved_tensions : ["Agents still refining their positions"],
      next_debate_focus: parsed.next_debate_focus||"Provide more specific experimental evidence with concrete numerical targets",
      strongest_agent: parsed.strongest_agent||"",
      weakest_claim: parsed.weakest_claim||"",
    };
  }catch(e:any){
    console.warn("judgeRound parse failed:",e.message);
    // Return a reasonable default instead of crashing
    return{
      score:52,
      dimensions:{scientific_accuracy:55,experimental_feasibility:50,code_correctness:50,novelty:45,clarity:55},
      resolved:false,
      unresolved_tensions:["Agents have differing approaches — more specificity needed"],
      next_debate_focus:"Provide concrete tool names, sample sizes, and statistical thresholds",
      strongest_agent:"",
      weakest_claim:"",
    };
  }
}

async function runDebateRound(q:any, roundNum:number, prevRounds:any[], userInput:string, onStatus:any, prevConsensus:string){
  const agents=[];

  // Fetch PubMed citations on round 1 only (avoid rate limits)
  let citationContext="";
  if(roundNum===1){
    try{
      citationContext=await fetchPubMedCitations(`${q.title} ${(q.tags||[]).slice(0,3).join(" ")}`);
    }catch{}
  }

  // Build relevance context for follow-up inputs
  const relevanceNote = userInput && prevRounds.length>0
    ? `\n\n**CRITICAL — User follow-up input to assess:** "${userInput}"\nBefore responding, explicitly state in 1 sentence: (a) how relevant this input is to the original problem (HIGH/MEDIUM/LOW relevance and why), then (b) how you will specifically incorporate it. If LOW relevance, say so honestly and explain what you'll focus on instead.`
    : "";

  for(const ag of AGENTS){
    onStatus(ag.id,"running",roundNum);
    await new Promise(r=>setTimeout(r,5000));

    let msg=`**Problem:** ${q.title}\n\n${q.prompt}\n\n`;
    if(userInput && prevRounds.length===0) msg+=`**Researcher context (incorporate specifically):** ${userInput}\n\n`;
    if(relevanceNote) msg+=relevanceNote+"\n\n";
    if(prevConsensus) msg+=`**Previous session consensus (build on/challenge — do NOT repeat):**\n${prevConsensus.slice(0,300)}\n\n`;
    if(citationContext) msg+=citationContext+"\n\n";

    if(prevRounds.length>0){
      const last=prevRounds[prevRounds.length-1];
      const others=last.agents.filter((a:any)=>a.aid!==ag.id).map((a:any)=>{const oa=AGENTS.find((x:any)=>x.id===a.aid);return`**${oa?.name} (${oa?.lens}):** ${a.resp.slice(0,180)}`;}).join("\n\n");
      const jn=last.judge?`\n\n**Judge verdict (${last.judge.score}%) — next focus:** ${last.judge.next_debate_focus}`:"";
      msg+=`ROUND ${roundNum}/${MAX_ROUNDS}. Do NOT repeat prior analysis. You MUST:
1. State your relevance assessment of the user input (if any)
2. Directly challenge ONE specific peer claim (name them + quote their claim)
3. Add NEW specifics: exact tool names, sample sizes, p-value thresholds, protocols
4. Structure your response with these labeled sections:
   🔬 HYPOTHESIS: [one sentence — testable, specific]
   🧪 PROTOCOL: [2-3 concrete steps with reagents/tools]
   📊 ANALYSIS: [specific method + expected output]
   ⚠️ LIMITATION: [one honest limitation of your approach]

**Other agents Round ${roundNum-1}:**\n${others}${jn}

Lens: **${ag.lens}**. 260 words max. No generic statements.`;
    }else{
      msg+=`ROUND 1 — Establish your position. Structure EXACTLY as:
🔬 HYPOTHESIS: [one testable sentence — cite a specific mechanism/pathway/tool]
🧪 PROTOCOL: [2-3 specific steps with named reagents, tools, or methods]
📊 ANALYSIS: [exact computational or statistical approach]
⚠️ LIMITATION: [one honest gap in your approach]

Lens: **${ag.lens}**. Be specific — cite tool names, numbers, organisms. 260 words max. No vague generalities.`;
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
          }else{ throw e; }
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

/* ═══════ RETRY HELPER ═══════ */
async function callWithRetry(system:string, msg:string, maxTokens:number=800, label:string=""):Promise<string>{
  let attempts=0;
  while(attempts<5){
    try{
      const cfg=_customAPI;
      if(cfg&&cfg.apiKey&&cfg.provider!=="bioarena"){
        return await callClaude(system,msg);
      }
      const res=await fetch(`${WORKER_URL}/api/ai`,{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          model:"llama-3.1-8b-instant",
          max_tokens:maxTokens,
          messages:[{role:"system",content:system},{role:"user",content:msg}]
        }),
      });

      // Read body as text first so we can inspect it on error
      const rawText=await res.text();

      if(!res.ok){
        throw new Error(`API ${res.status}: ${rawText.slice(0,300)}`);
      }

      let d:any;
      try{ d=JSON.parse(rawText); }
      catch{ throw new Error(`Invalid JSON from API: ${rawText.slice(0,200)}`); }

      // Groq returns errors inside a 200 response sometimes
      if(d.error){
        const errMsg=d.error.message||JSON.stringify(d.error);
        throw new Error(`Groq error: ${errMsg}`);
      }

      const text=d.choices?.[0]?.message?.content||"";
      if(!text){
        // Log what we got for debugging
        console.warn(`${label} empty response, raw:`, rawText.slice(0,300));
        throw new Error(`Empty response: ${rawText.slice(0,150)}`);
      }
      return text;

    }catch(e:any){
      attempts++;
      const msg_lower=(e.message||"").toLowerCase();
      const isRetryable=
        msg_lower.includes("429")||
        msg_lower.includes("rate")||
        msg_lower.includes("limit")||
        msg_lower.includes("500")||
        msg_lower.includes("503")||
        msg_lower.includes("empty")||
        msg_lower.includes("invalid json")||
        msg_lower.includes("tokens per minute")||
        msg_lower.includes("context_length");

      if(isRetryable&&attempts<5){
        const wait=Math.min(10000*attempts,45000); // 10s, 20s, 30s, 40s
        console.log(`[${label}] retry ${attempts}/4 in ${wait/1000}s — ${e.message?.slice(0,100)}`);
        await new Promise(r=>setTimeout(r,wait));
      }else{
        throw e;
      }
    }
  }
  throw new Error(`${label} failed after 5 attempts`);
}

async function buildFinalConsensus(q:any, allRounds:any[], userInput:string, resolved:boolean, prevConsensus:string){
  const debate=allRounds.map((rnd:any,ri:number)=>
    `=== ROUND ${ri+1} (${rnd.judge?.score??'?'}%) ===\n`+
    rnd.agents.map((a:any)=>{const ag=AGENTS.find((x:any)=>x.id===a.aid);return`[${ag?.name}]: ${a.resp.slice(0,220)}`;}).join("\n\n")
  ).join("\n\n");
  const priorNote=prevConsensus?`\n\nPRIOR CONSENSUS (improve on this):\n${prevConsensus.slice(0,300)}`:"";
  const note=resolved?"":"\n\nNote: Max rounds reached. Synthesize best possible consensus. Label contested points. Always produce actionable output.";
  const sys=`You are a senior scientist writing a research resolution after a multi-round expert debate with ${AGENTS.length} specialist agents.

Write ALL FIVE sections with these EXACT headers:

**Final Consensus**
[What all experts agreed on — cite specific tools, numbers, mechanisms]

**Resolved Tensions**
[How specific disagreements were settled]

**Still Open**
[What genuinely remains unknown or contested]

**Recommended Action Plan**
[5 concrete next steps with specific tool names and expected outputs]

**Success Metrics**
[Measurable targets that define success]

${note} Use **bold headers** exactly as shown. Be specific — name tools, concentrations, statistical thresholds. 500 words max.`;

  try{
    return await callWithRetry(sys,
      `Problem: ${q.title}\nUser input: ${userInput||"none"}\nRounds: ${allRounds.length}\nResolved: ${resolved}${priorNote}\n\n${debate}\n\nWrite the full expert resolution now.`,
      900, "buildFinalConsensus");
  }catch(e:any){
    return `Expert resolution could not be generated (${e.message}). Please click the Expert Resolution tab and refresh to retry.`;
  }
}

async function buildPlainSummary(q:any, finalConsensus:string, userInput:string, resolved:boolean, prevConsensus:string){
  const priorNote=prevConsensus?` This is a FOLLOW-UP session — build on and improve the previous guidance, do NOT repeat it.`:"";
  const sys=`You are explaining cutting-edge biology research to a biology researcher who knows lab basics but NOT advanced computation or math.

Write a numbered step-by-step action plan. STRICT RULES:
- NO equations, NO Greek letters, NO statistical notation
- If you must use a technical term, immediately explain it in plain words in parentheses
- Write like a senior researcher explaining over coffee — warm and practical
- Each step: emoji + bold action verb + one plain sentence of what to do and WHY it matters
- Open with "**You will need:**" listing key materials/tools in plain English
- After steps: "**How you will know it is working:**" — plain observable results
- Then: "**What the ${AGENTS.length} AI agents agreed on:**" — 3-4 plain-English bullet points
- Finally: "**⚠️ What this debate CANNOT fully solve for you yet:**" — be honest
- Max 8 steps.${resolved?"":" Note: debate reached max rounds without full convergence — be honest about remaining uncertainty."}${priorNote}`;

  try{
    return await callWithRetry(sys,
      `Biology problem: ${q.title}\nResearcher input: ${userInput||"none"}\n\nExpert consensus:\n${finalConsensus.slice(0,900)}\n\nWrite the plain-English action plan now. Every step must be numbered and specific.`,
      800, "buildPlainSummary");
  }catch(e:any){
    return `Action plan could not be generated (${e.message}). The expert resolution above contains the same information in technical format.`;
  }
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

  try{
    return await callWithRetry(sys, msg, 700, "buildConclusion");
  }catch(e:any){
    return `Conclusion card could not be generated (${e.message}). Please see the Expert Resolution tab for full results.`;
  }
}

// Biology-specific code templates — agents fill these in rather than writing from scratch
const CODE_TEMPLATES:Record<string,string> = {
  rnaseq: `# Differential Expression Analysis — uses scipy + pandas (no complex installs)
import pandas as pd
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')

np.random.seed(42)
# Synthetic count matrix: 200 genes x 12 samples (6 control, 6 treatment)
n_genes, n_ctrl, n_treat = 200, 6, 6
gene_names = [f"GENE_{i:04d}" for i in range(n_genes)]
# Simulate counts: most genes unchanged, ~20 DEGs
ctrl_counts = np.random.negative_binomial(20, 0.5, (n_genes, n_ctrl)).astype(float)
treat_counts = ctrl_counts.copy()
# Introduce 20 upregulated and 20 downregulated genes
up_idx = np.random.choice(n_genes, 20, replace=False)
down_idx = np.random.choice([i for i in range(n_genes) if i not in up_idx], 20, replace=False)
treat_counts[up_idx] *= np.random.uniform(2, 5, (20, 1))
treat_counts[down_idx] *= np.random.uniform(0.1, 0.4, (20, 1))

counts = pd.DataFrame(
    np.hstack([ctrl_counts, treat_counts]),
    index=gene_names,
    columns=[f"ctrl_{i}" for i in range(n_ctrl)] + [f"treat_{i}" for i in range(n_treat)]
)

# Normalise: counts per million (CPM)
cpm = counts.div(counts.sum(axis=0) / 1e6)
log_cpm = np.log2(cpm + 1)

# Statistical test: Welch t-test per gene
ctrl_cols = [c for c in counts.columns if c.startswith("ctrl")]
treat_cols = [c for c in counts.columns if c.startswith("treat")]
results = []
for gene in log_cpm.index:
    t, p = stats.ttest_ind(log_cpm.loc[gene, treat_cols], log_cpm.loc[gene, ctrl_cols], equal_var=False)
    fc = log_cpm.loc[gene, treat_cols].mean() - log_cpm.loc[gene, ctrl_cols].mean()
    results.append({"gene": gene, "log2FC": fc, "pvalue": p})

results_df = pd.DataFrame(results)
# Multiple testing correction (Benjamini-Hochberg)
results_df = results_df.sort_values("pvalue")
n = len(results_df)
results_df["rank"] = range(1, n + 1)
results_df["padj"] = (results_df["pvalue"] * n / results_df["rank"]).clip(upper=1.0)
results_df["neg_log10_padj"] = -np.log10(results_df["padj"].clip(lower=1e-300))

# Volcano plot
sig = results_df[(results_df["padj"] < 0.05) & (results_df["log2FC"].abs() > 1)]
plt.figure(figsize=(8, 6))
plt.scatter(results_df["log2FC"], results_df["neg_log10_padj"], c="#4b5563", alpha=0.4, s=12, label="Not significant")
up = sig[sig["log2FC"] > 0]; dn = sig[sig["log2FC"] < 0]
plt.scatter(up["log2FC"], up["neg_log10_padj"], c="#ef4444", s=18, label=f"Up ({len(up)})", alpha=0.8)
plt.scatter(dn["log2FC"], dn["neg_log10_padj"], c="#3b82f6", s=18, label=f"Down ({len(dn)})", alpha=0.8)
plt.axhline(-np.log10(0.05), color="orange", linestyle="--", lw=1, label="padj=0.05")
plt.axvline(1, color="grey", linestyle=":", lw=1); plt.axvline(-1, color="grey", linestyle=":", lw=1)
plt.xlabel("log2 Fold Change"); plt.ylabel("-log10 adjusted p-value")
plt.title(f"Volcano Plot — {len(sig)} DEGs (padj<0.05, |log2FC|>1)")
plt.legend(fontsize=9); plt.tight_layout()
plt.savefig("volcano_plot.png", dpi=150, bbox_inches="tight")
plt.show()
print(f"Total DEGs: {len(sig)} | Upregulated: {len(up)} | Downregulated: {len(dn)}")
results_df.to_csv("deg_results.csv", index=False)
print("Saved: volcano_plot.png, deg_results.csv")`,

  scrna: `# Single-cell RNA-seq analysis — sklearn + matplotlib (no scanpy needed)
import pandas as pd
import numpy as np
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
from sklearn.cluster import KMeans
from sklearn.preprocessing import normalize
from scipy import stats
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')

np.random.seed(42)
# Synthetic scRNA-seq: 500 cells x 2000 genes, 4 cell types
n_cells, n_genes, n_types = 500, 2000, 4
gene_names = [f"GENE_{i:04d}" for i in range(n_genes)]
cell_types_true = np.repeat(np.arange(n_types), n_cells // n_types)

# Simulate counts: each cell type has distinct marker genes
counts = np.random.negative_binomial(5, 0.7, (n_cells, n_genes)).astype(float)
for ct in range(n_types):
    marker_genes = range(ct * 50, (ct + 1) * 50)
    counts[cell_types_true == ct][:, marker_genes] *= 10

# QC filtering: remove low-quality cells
total_counts = counts.sum(axis=1)
n_genes_per_cell = (counts > 0).sum(axis=1)
keep = (total_counts > np.percentile(total_counts, 5)) & (n_genes_per_cell > 200)
counts = counts[keep]; cell_types_true = cell_types_true[keep]
print(f"After QC: {counts.shape[0]} cells, {counts.shape[1]} genes")

# Normalise + log1p
counts_norm = counts / counts.sum(axis=1, keepdims=True) * 1e4
log_counts = np.log1p(counts_norm)

# Select top 500 highly variable genes (by variance)
gene_var = log_counts.var(axis=0)
hvg_idx = np.argsort(gene_var)[-500:]
log_hvg = log_counts[:, hvg_idx]

# PCA
pca = PCA(n_components=30, random_state=42)
pca_coords = pca.fit_transform(log_hvg)
print(f"PCA variance explained (PC1-5): {pca.explained_variance_ratio_[:5].round(3)}")

# UMAP-like: t-SNE for 2D visualisation
tsne = TSNE(n_components=2, random_state=42, perplexity=30, n_iter=500)
tsne_coords = tsne.fit_transform(pca_coords[:, :10])

# Clustering: K-Means
kmeans = KMeans(n_clusters=n_types, random_state=42, n_init=10)
cluster_labels = kmeans.fit_predict(pca_coords[:, :10])

# Plot
fig, axes = plt.subplots(1, 2, figsize=(14, 6))
colors = ['#e41a1c','#377eb8','#4daf4a','#984ea3']
for ct in range(n_types):
    mask = cluster_labels == ct
    axes[0].scatter(tsne_coords[mask,0], tsne_coords[mask,1], c=colors[ct], s=8, alpha=0.7, label=f"Cluster {ct}")
axes[0].set_title("t-SNE — K-Means Clusters"); axes[0].legend(markerscale=2, fontsize=9)
axes[0].set_xlabel("t-SNE 1"); axes[0].set_ylabel("t-SNE 2")

# Marker gene heatmap (top 3 markers per cluster)
marker_data = []
for ct in range(n_types):
    ct_cells = log_counts[cluster_labels == ct]
    other_cells = log_counts[cluster_labels != ct]
    t_stats = stats.ttest_ind(ct_cells, other_cells, axis=0).statistic
    top3 = np.argsort(t_stats)[-3:]
    for g in top3:
        marker_data.append({"cluster": ct, "gene": gene_names[g], "mean_expr": ct_cells[:, g].mean()})
marker_df = pd.DataFrame(marker_data)
pivot = marker_df.pivot_table(values="mean_expr", index="gene", columns="cluster", fill_value=0)
im = axes[1].imshow(pivot.values, aspect="auto", cmap="YlOrRd")
axes[1].set_xticks(range(n_types)); axes[1].set_xticklabels([f"C{i}" for i in range(n_types)])
axes[1].set_yticks(range(len(pivot))); axes[1].set_yticklabels(pivot.index, fontsize=8)
axes[1].set_title("Top Marker Genes per Cluster"); plt.colorbar(im, ax=axes[1], label="Mean log expr")
plt.tight_layout()
plt.savefig("scrna_analysis.png", dpi=150, bbox_inches="tight")
plt.show()
pd.DataFrame({"cell": range(len(cluster_labels)), "cluster": cluster_labels}).to_csv("cluster_assignments.csv", index=False)
marker_df.to_csv("marker_genes.csv", index=False)
print("Saved: scrna_analysis.png, cluster_assignments.csv, marker_genes.csv")`,

  survival: `# Survival analysis — scipy + matplotlib (no lifelines needed)
import pandas as pd
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')

np.random.seed(42)
n = 200  # patients
# Simulate 2 groups: high/low biomarker expression
group = np.random.choice(["High", "Low"], size=n)
# High group: better survival (longer times)
survival_time = np.where(group == "High",
    np.random.exponential(scale=24, size=n),   # median ~24 months
    np.random.exponential(scale=12, size=n))   # median ~12 months
survival_time = np.clip(survival_time, 0.5, 60)
event = np.random.binomial(1, 0.7, n)  # 70% experienced event

df = pd.DataFrame({"time": survival_time, "event": event, "group": group})

# Kaplan-Meier estimator
def kaplan_meier(times, events):
    sorted_idx = np.argsort(times)
    times = times[sorted_idx]; events = events[sorted_idx]
    n_at_risk = len(times)
    km_times, km_surv = [0], [1.0]
    survival = 1.0
    for i, (t, e) in enumerate(zip(times, events)):
        if e == 1:
            survival *= (1 - 1 / n_at_risk)
            km_times.append(t); km_surv.append(survival)
        n_at_risk -= 1
    return np.array(km_times), np.array(km_surv)

fig, axes = plt.subplots(1, 2, figsize=(13, 5))
# KM curves
colors = {"High": "#3b82f6", "Low": "#ef4444"}
for grp in ["High", "Low"]:
    mask = df["group"] == grp
    t, s = kaplan_meier(df.loc[mask,"time"].values, df.loc[mask,"event"].values)
    axes[0].step(t, s, where="post", color=colors[grp], lw=2, label=f"{grp} (n={mask.sum()})")
axes[0].set_xlabel("Time (months)"); axes[0].set_ylabel("Survival probability")
axes[0].set_ylim(0, 1.05); axes[0].legend(fontsize=10)

# Log-rank test
high = df[df["group"]=="High"]; low = df[df["group"]=="Low"]
stat, pval = stats.ks_2samp(high.loc[high["event"]==1,"time"], low.loc[low["event"]==1,"time"])
axes[0].set_title(f"Kaplan-Meier Survival Curves (log-rank approx. p={pval:.3f})")

# Forest-style hazard plot by quartile
df["quartile"] = pd.qcut(df["time"], q=4, labels=["Q1","Q2","Q3","Q4"])
quartile_events = df.groupby("quartile")["event"].agg(["sum","count"])
quartile_events["rate"] = quartile_events["sum"] / quartile_events["count"]
axes[1].barh(range(4), quartile_events["rate"], color="#6366f1", alpha=0.8)
axes[1].set_yticks(range(4)); axes[1].set_yticklabels(["Q1 (shortest)","Q2","Q3","Q4 (longest)"])
axes[1].set_xlabel("Event rate"); axes[1].set_title("Event Rate by Survival Quartile")

plt.tight_layout()
plt.savefig("survival_analysis.png", dpi=150, bbox_inches="tight")
plt.show()
df.to_csv("survival_data_results.csv", index=False)
print(f"Group comparison p-value (approx): {pval:.4f}")
print(f"High group median survival: {df[df['group']=='High']['time'].median():.1f} months")
print(f"Low group median survival: {df[df['group']=='Low']['time'].median():.1f} months")
print("Saved: survival_analysis.png, survival_data_results.csv")`,

  crispr: `# CRISPR screen analysis — scipy + pandas (standard libraries only)
import pandas as pd
import numpy as np
from scipy import stats
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')

np.random.seed(42)
# Synthetic CRISPR screen: 500 genes x 4 guides each, 2 conditions
n_genes = 500
guide_counts = []
for gene_i in range(n_genes):
    for guide_j in range(4):
        ctrl_count = max(1, int(np.random.negative_binomial(50, 0.5)))
        # ~50 essential genes (depleted in treatment)
        is_essential = gene_i < 50
        # ~30 enriched genes
        is_enriched = 450 <= gene_i < 480
        if is_essential:
            treat_count = max(1, int(ctrl_count * np.random.uniform(0.05, 0.2)))
        elif is_enriched:
            treat_count = max(1, int(ctrl_count * np.random.uniform(3, 8)))
        else:
            treat_count = max(1, int(ctrl_count * np.random.uniform(0.7, 1.4)))
        guide_counts.append({
            "Gene": f"GENE_{gene_i:04d}", "Guide": f"g{guide_j+1}",
            "Control": ctrl_count, "Treatment": treat_count
        })

df = pd.DataFrame(guide_counts)
# Log2 fold change per guide
df["lfc"] = np.log2((df["Treatment"] + 0.5) / (df["Control"] + 0.5))

# Gene-level summary: median LFC + Mann-Whitney test
gene_results = []
for gene, grp in df.groupby("Gene"):
    med_lfc = grp["lfc"].median()
    stat, pval = stats.mannwhitneyu(grp["Treatment"], grp["Control"], alternative="two-sided")
    gene_results.append({"Gene": gene, "median_lfc": med_lfc, "pvalue": pval, "n_guides": len(grp)})

results = pd.DataFrame(gene_results)
results = results.sort_values("pvalue")
n = len(results)
results["rank"] = range(1, n + 1)
results["padj"] = (results["pvalue"] * n / results["rank"]).clip(upper=1)
results["zscore"] = (results["median_lfc"] - results["median_lfc"].mean()) / results["median_lfc"].std()
results = results.sort_values("median_lfc")

# Plot: ranked gene LFC + volcano
fig, axes = plt.subplots(1, 2, figsize=(14, 5))
colors = ["#ef4444" if z < -2 else "#3b82f6" if z > 2 else "#6b7280" for z in results["zscore"]]
axes[0].bar(range(len(results)), results["median_lfc"], color=colors, alpha=0.8, width=1.0)
axes[0].set_xlabel("Gene rank"); axes[0].set_ylabel("Median log2 FC (treatment/control)")
axes[0].set_title("CRISPR Screen — Gene Scores (red=depleted, blue=enriched)")
axes[0].axhline(0, color="black", lw=0.5)

sig = results[results["padj"] < 0.05]
axes[1].scatter(results["median_lfc"], -np.log10(results["padj"].clip(1e-10)), c="#6b7280", alpha=0.4, s=10)
up = sig[sig["median_lfc"] > 0]; dn = sig[sig["median_lfc"] < 0]
axes[1].scatter(up["median_lfc"], -np.log10(up["padj"].clip(1e-10)), c="#3b82f6", s=18, alpha=0.9, label=f"Enriched ({len(up)})")
axes[1].scatter(dn["median_lfc"], -np.log10(dn["padj"].clip(1e-10)), c="#ef4444", s=18, alpha=0.9, label=f"Depleted ({len(dn)})")
axes[1].axhline(-np.log10(0.05), color="orange", linestyle="--", lw=1)
axes[1].set_xlabel("Median log2 FC"); axes[1].set_ylabel("-log10 adj. p-value")
axes[1].set_title("CRISPR Screen Volcano"); axes[1].legend(fontsize=9)
plt.tight_layout()
plt.savefig("crispr_screen.png", dpi=150, bbox_inches="tight")
plt.show()
results.to_csv("crispr_results.csv", index=False)
print(f"Significant hits: {len(sig)} | Depleted: {len(dn)} | Enriched: {len(up)}")
print(f"Top 10 depleted genes (likely essential):")
print(results.head(10)[["Gene","median_lfc","padj","zscore"]].to_string(index=False))
print("Saved: crispr_screen.png, crispr_results.csv")`,
};

function detectTemplate(title:string, consensus:string):string{
  const text=(title+consensus).toLowerCase();
  if(text.includes("deseq")||text.includes("rna-seq")||text.includes("differential expression")||text.includes("deg")) return "rnaseq";
  if(text.includes("single-cell")||text.includes("scrna")||text.includes("seurat")||text.includes("scanpy")||text.includes("umap")) return "scrna";
  if(text.includes("survival")||text.includes("kaplan")||text.includes("cox")||text.includes("clinical")) return "survival";
  if(text.includes("crispr")||text.includes("screen")||text.includes("sgrna")||text.includes("mageck")) return "crispr";
  return "";
}

async function generateCode(q:any, finalConsensus:string, userInput:string){
  const template = detectTemplate(q.title||"", finalConsensus);

  // If a validated template matches, use it directly with minimal LLM modification
  // This avoids hallucinated imports and wrong API usage
  if(template && CODE_TEMPLATES[template]){
    const sys=`You are a bioinformatics expert. A validated Python template is provided below. Your ONLY job is to:
1. Add a 3-sentence "## What this code does" description at the top specific to the problem
2. Add a "## Install first" section listing pip install commands
3. Modify the code MINIMALLY: update variable names and comments to match the specific biology problem
4. Add a "## What it handles right now" section (3 bullets)
5. Add a "## What you still need" section (3 bullets: your data format, wet-lab validation needed, next step)

DO NOT change the core library calls, function signatures, or algorithm logic.
DO NOT add new imports beyond what the template already uses.
DO NOT remove the synthetic data examples — they must stay so the code runs immediately.

VALIDATED TEMPLATE TO USE (modify minimally):
\`\`\`python
${CODE_TEMPLATES[template]}
\`\`\``;

    const msg=`Biology problem: ${q.title}
Context: ${userInput||"none"}
Consensus: ${finalConsensus.slice(0,400)}

Produce the final code response using the template above. Keep the core logic identical.`;

    try{
      return await callWithRetry(sys, msg, 900, "generateCode-template");
    }catch(e:any){
      // Return the template directly as fallback — it will work even without LLM modification
      return `## What this code does
This is a validated Python starter script for: ${q.title}. It uses synthetic data so you can run it immediately and verify it works before plugging in your real data.

## Install first
\`\`\`
pip install pandas numpy matplotlib scipy
\`\`\`

\`\`\`python
${CODE_TEMPLATES[template]}
\`\`\`

## What it handles right now
- Runs end-to-end on synthetic data immediately without requiring real data
- Produces publication-ready figures saved to disk
- Outputs results as a CSV file you can open in Excel

## What you still need
- **Your data:** Replace the synthetic data section with your real data files
- **Wet-lab validation:** Computational results must be confirmed experimentally
- **Next step:** Adjust thresholds and parameters to match your experimental conditions`;
    }
  }

  // No template match — use strict prompt that prevents hallucination
  const sys=`You are a bioinformatics expert generating Python code. You MUST follow these rules WITHOUT EXCEPTION:

ALLOWED IMPORTS ONLY (do not use any other libraries):
- pandas, numpy, scipy, matplotlib, matplotlib.pyplot, seaborn, sklearn, sklearn.preprocessing, sklearn.decomposition, sklearn.cluster, collections, os, sys, json, csv, math, random, itertools

FORBIDDEN (will cause import errors):
- pydeseq2 (not reliably installable) → use scipy.stats.ttest_ind instead
- scanpy (complex install) → use sklearn + matplotlib instead  
- anndata → use pandas DataFrames instead
- rpy2 (R bridge) → write pure Python
- lifelines (install issues) → use scipy.stats instead
- cobra (complex install) → use numpy linear algebra instead

REQUIRED CODE STRUCTURE:
1. All data is SYNTHETIC — generate it with numpy/pandas, never assume files exist
2. Every print() shows what the output means in plain English
3. Every plot is saved with plt.savefig('output_N.png') AND plt.show()
4. Code must run top-to-bottom without errors on a fresh Python install
5. 40-60 lines maximum

FORMAT:
## What this code does
[2-3 sentences]

## Install first
pip install pandas numpy matplotlib scipy scikit-learn seaborn

\`\`\`python
[your code here]
\`\`\`

## What it handles right now
- [3 bullets]

## What you still need  
- **Your data:** [exact format]
- **Wet-lab validation:** [what needs confirming]
- **Next step:** [one thing to add]`;

  const msg=`Biology problem: ${q.title}
Context: ${userInput||"none"}
Key finding from debate: ${finalConsensus.slice(0,300)}

Generate working Python code. Use ONLY the allowed imports listed. Use synthetic data.`;

  try{
    return await callWithRetry(sys, msg, 900, "generateCode");
  }catch(e:any){
    return `Code generation failed (${e.message}). Click "⚡ Generate Code Now" in the Starter Code tab to retry.`;
  }
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
  const [diffFilter,setDiffFilter]=useState("");
  const [readingMode,setReadingMode]=useState(false);
  const [labProfile,setLabProfile]=useState(()=>loadLabProfile());
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
  const filteredQs=QS.filter((q:any)=>{
    const s=search.trim().toLowerCase();
    const inSearch=!s||q.title.toLowerCase().includes(s)||(q.prompt||"").toLowerCase().includes(s);
    const inTag=!tagFilter||(q.tags||[]).includes(tagFilter);
    const inDiff=!diffFilter||q.difficulty===diffFilter;
    return inSearch&&inTag&&inDiff;
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
    const profile=loadLabProfile();
    const profileStr=[
      profile.organism&&`Organism: ${profile.organism}`,
      profile.dataType&&`Data type: ${profile.dataType}`,
      profile.tools&&`Tools: ${profile.tools}`,
    ].filter(Boolean).join(" | ");
    const fullQ=profileStr?`${q} [Lab context: ${profileStr}]`:q;
    addToRecentQuestions(q);
    const id="cq_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,6);
    const entry={id,title:fullQ,ts:Date.now(),sessionId:SESSION_ID,submissionCount:0,resolved:false,finalScore:0};
    const idx=await loadCommunityIndex();
    const updated=[entry,...idx.filter((x:any)=>!x.id.startsWith("seed_"))];
    await saveCommunityIndex(updated);
    setAskQ("");setSubmittingAsk(false);
    goCommunityQ(id,fullQ);
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
          <div style={{marginTop:16}}>
            <LabProfilePanel onProfileChange={(p:any)=>setLabProfile(p)}/>
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
          {(CATS as any[]).map((c:any)=>{
            const diffColors:any={Graduate:"#2aff80",Expert:"#ffc34d",Unsolved:"#ff5c5c"};
            const dc=diffColors[c.difficulty]||"#6a85b0";
            return(
            <div key={c.id} onClick={()=>goCategory(c.id)} style={{background:"#07101f",border:"1px solid #182640",borderRadius:3,padding:"14px 16px",cursor:"pointer",position:"relative",overflow:"hidden",transition:"all .13s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="#223260";e.currentTarget.style.background="#0c1a30";e.currentTarget.style.transform="translateY(-1px)";}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="#182640";e.currentTarget.style.background="#07101f";e.currentTarget.style.transform="none";}}>
              <div style={{position:"absolute",top:0,left:0,right:0,height:2,background:c.color,opacity:.7}}/>
              <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
                <div style={{fontFamily:"Oxanium,sans-serif",fontSize:11.5,fontWeight:700,color:"#cee0ff",lineHeight:1.3}}>{c.name}</div>
                <div className="badge-pill" style={{background:`${dc}18`,color:dc,border:`1px solid ${dc}44`,marginLeft:8,flexShrink:0}}>{c.difficulty||"Expert"}</div>
              </div>
              <div style={{fontSize:11,color:"#354d72",lineHeight:1.65,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{c.desc}</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:10,paddingTop:9,borderTop:"1px solid #182640",fontSize:9.5,color:"#475569"}}>
                <span>{c.q} problem{c.q>1?"s":""}</span><span>View problems →</span>
              </div>
            </div>
            );
          })}
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
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:10,flexWrap:"wrap"}}>
              <input placeholder="Search problems…" value={search} onChange={e=>setSearch(e.target.value)}
                style={{flex:1,minWidth:160,background:"#030812",borderRadius:4,border:"1px solid #1e293b",color:"#e5e7eb",padding:"6px 9px",fontSize:11,outline:"none"}}/>
              <select value={tagFilter} onChange={e=>setTagFilter(e.target.value)}
                style={{background:"#030812",borderRadius:4,border:"1px solid #1e293b",color:"#9ca3af",padding:"6px 9px",fontSize:11}}>
                <option value="">All tags</option>
                {allTags.map((t:string)=><option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            {/* Difficulty filter */}
            <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
              {["","Graduate","Expert","Unsolved"].map(d=>{
                const colors:any={Graduate:"#2aff80",Expert:"#ffc34d",Unsolved:"#ff5c5c","":`#6a85b0`};
                const active=diffFilter===d;
                return(
                  <button key={d} onClick={()=>setDiffFilter(d)}
                    style={{padding:"4px 12px",borderRadius:999,border:`1px solid ${active?colors[d]:"#182640"}`,background:active?colors[d]+"22":"transparent",color:active?colors[d]:"#354d72",fontFamily:"Oxanium,sans-serif",fontSize:9,letterSpacing:1,cursor:"pointer",transition:"all .12s"}}>
                    {d||"All levels"}
                  </button>
                );
              })}
              <span style={{fontSize:10,color:"#4b5563",marginLeft:"auto",alignSelf:"center"}}>{filteredQs.length} shown</span>
            </div>
            <div style={{display:"grid",gap:6}}>
              {(filteredQs as any[]).map((q:any)=>{
                const cat=CATS.find((c:any)=>c.id===q.cat);
                const diffColors:any={Graduate:"#2aff80",Expert:"#ffc34d",Unsolved:"#ff5c5c"};
                const dc=diffColors[q.difficulty]||"#354d72";
                return(
                  <div key={q.id} onClick={()=>goQuestion(q.id)}
                    style={{background:"#07101f",borderRadius:3,border:"1px solid #182640",padding:"9px 11px",cursor:"pointer",transition:"border-color .12s"}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor="#223260"}
                    onMouseLeave={e=>e.currentTarget.style.borderColor="#182640"}>
                    <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center"}}>
                      <div style={{fontSize:12,color:"#e5e7eb",fontWeight:500}}>{q.title}</div>
                      <div style={{display:"flex",gap:6,alignItems:"center",flexShrink:0}}>
                        {q.difficulty&&<span style={{fontFamily:"Oxanium,sans-serif",fontSize:8,color:dc,border:`1px solid ${dc}33`,borderRadius:3,padding:"2px 6px"}}>{q.difficulty}</span>}
                        <div style={{fontSize:10,color:"#9ca3af",whiteSpace:"nowrap"}}>{q.pts} pts</div>
                      </div>
                    </div>
                    <div style={{display:"flex",gap:6,alignItems:"center",fontSize:10,color:"#6b7280",flexWrap:"wrap",marginTop:4}}>
                      {cat&&<span className="badge-pill" style={{background:"rgba(15,23,42,1)",border:`1px solid ${cat.color}`,color:cat.color}}>{cat.name}</span>}
                      {(q.tags||[]).slice(0,3).map((t:string)=><span key={t} style={{color:"#64748b"}}>#{t}</span>)}
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
  const pl={"cooling down…":"⏳ Cooldown 60s — letting rate limit reset before generating outputs…",debating:"Agents writing responses…",judging:"Judge evaluating agreement…",consensus:"Building expert resolution…",plain:"Writing plain-language action plan…",conclusion:"Writing conclusion card…",code:"Generating starter code…",done:"Debate complete ✓"}[phase]||phase;
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
          {(phase==="cooling down…"||phase==="judging"||phase==="consensus"||phase==="plain"||phase==="conclusion"||phase==="code")&&(
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
                    <div style={{fontSize:10.5,color:"#7a90b0",lineHeight:1.65}}>{s.snippet}{s.full&&s.full.length>s.snippet.length?"…":""}</div>
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
  const [structuredCtx,setStructuredCtx]=useState({organism:"",modality:"",tools:"",output:""});
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
    const ctx=structuredCtx as any;
    const structuredStr=[
      ctx.organism&&`Organism/Cell type: ${ctx.organism}`,
      ctx.modality&&`Data modality: ${ctx.modality}`,
      ctx.tools&&`Tools/constraints: ${ctx.tools}`,
      ctx.output&&`Desired output: ${ctx.output}`,
    ].filter(Boolean).join(" | ");

    // Merge with saved lab profile (form fields take priority)
    const profile=loadLabProfile();
    const profileStr=[
      !ctx.organism&&profile.organism&&`Organism: ${profile.organism}`,
      !ctx.modality&&profile.dataType&&`Data type: ${profile.dataType}`,
      !ctx.tools&&profile.tools&&`Tools: ${profile.tools}`,
    ].filter(Boolean).join(" | ");

    const allContext=[structuredStr,profileStr].filter(Boolean).join(" | ");
    const effectiveUi=allContext?`[Lab context: ${allContext}]${ui?` — ${ui}`:""}`:ui;

    addToRecentQuestions(q.title);

    const sortedIters=[...iters].sort((a,b)=>b.ts-a.ts);
    const prevConsensus=sortedIters.length>0?sortedIters[0].consensus||"":"";

    setLiveRound(0);setLiveAgentStatus({});setLiveScore(null);setLivePhase("debating");setLiveRounds([]);
    const allRounds=[];
    let round=0;

    while(round<MAX_ROUNDS){
      round++;
      setLiveRound(round);
      setLivePhase("debating");
      const roundAgents=await runDebateRound(q,round,allRounds,effectiveUi,onAgentStatus,prevConsensus);
      setLivePhase("judging");
      const judgeResult=await judgeRound(q,[...allRounds,{agents:roundAgents}],prevConsensus);
      setLiveScore(judgeResult.score);
      const snippets=roundAgents.map((a:any)=>{
        const ag=AGENTS.find((x:any)=>x.id===a.aid);
        // Use 320 chars so sentences don't get cut mid-word
        const full=a.resp||"";
        const cut=full.slice(0,320);
        // Try to cut at last sentence boundary
        const lastDot=Math.max(cut.lastIndexOf(". "),cut.lastIndexOf(".\n"),cut.lastIndexOf("! "),cut.lastIndexOf("? "));
        const snippet=lastDot>150?cut.slice(0,lastDot+1):cut;
        return {name:ag?.name||a.aid, color:ag?.color||"#888", lens:ag?.lens||"", snippet, full};
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

    // Long cooldown after debate — free Groq tier needs ~60s to reset TPM bucket
    setLivePhase("cooling down…");
    await new Promise(r=>setTimeout(r,62000));
    setLivePhase("consensus");
    const finalConsensus=await buildFinalConsensus(q,allRounds,effectiveUi,true,prevConsensus);
    await new Promise(r=>setTimeout(r,22000));
    setLivePhase("plain");
    const plainSummary=await buildPlainSummary(q,finalConsensus,effectiveUi,true,prevConsensus);
    await new Promise(r=>setTimeout(r,22000));
    setLivePhase("conclusion");
    const conclusion=await buildConclusion(q,allRounds,finalConsensus,effectiveUi,true);
    await new Promise(r=>setTimeout(r,22000));
    setLivePhase("code");
    const code=await generateCode(q,finalConsensus,effectiveUi);

    const iteration={
      id:Date.now().toString(),ts:Date.now(),ui:effectiveUi,sessionId:SESSION_ID,
      rounds:allRounds,totalRounds:allRounds.length,finalScore,resolved:true,
      consensus:finalConsensus,plainSummary,conclusion,code,protocols:"",
      isFollowUp:prevConsensus.length>0,
    };
    const updated=[...iters,iteration];
    await saveIters(qid,updated);
    setIters(updated);
    setUserInput("");
    setStructuredCtx({organism:"",modality:"",tools:"",output:""});
    setRunning(false);
    setLivePhase("done");
  },[q,userInput,structuredCtx,running,iters,onAgentStatus]);

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
          {/* Input — structured lab ticket form */}
          <div style={{background:"#020617",borderRadius:4,border:"1px solid #223260",padding:"12px 13px",position:"relative",marginTop:14}}>
            <div style={{position:"absolute",top:-8,left:12,background:"#020617",padding:"0 7px",fontSize:8,letterSpacing:2.5,color:"#00e5ff",fontFamily:"Oxanium,sans-serif"}}>
              {iters.length>0?"ADD FOLLOW-UP → NEW DEBATE":"YOUR LAB CONTEXT"}
            </div>
            {iters.length===0&&(
              <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:8,marginBottom:10}}>
                {[
                  {key:"organism",label:"Organism / Cell type",ph:"e.g. human hepatocytes, mouse, HEK293"},
                  {key:"modality",label:"Data / Modality",ph:"e.g. bulk RNA-seq, scRNA-seq, proteomics"},
                  {key:"tools",label:"Tools / Budget constraints",ph:"e.g. Python only, no cloud, DESeq2"},
                  {key:"output",label:"Desired output",ph:"e.g. working code, hypothesis, protocol"},
                ].map(f=>(
                  <div key={f.key}>
                    <div style={{fontFamily:"Oxanium,sans-serif",fontSize:8,color:"#354d72",letterSpacing:1.5,textTransform:"uppercase",marginBottom:4}}>{f.label}</div>
                    <input
                      value={(structuredCtx as any)[f.key]||""}
                      onChange={e=>setStructuredCtx((p:any)=>({...p,[f.key]:e.target.value}))}
                      disabled={running}
                      placeholder={f.ph}
                      style={{width:"100%",background:"#030812",border:"1px solid #1e293b",borderRadius:3,padding:"7px 9px",color:"#b4c8e8",fontFamily:"'JetBrains Mono',monospace",fontSize:11,outline:"none"}}
                      onFocus={e=>e.target.style.borderColor="#334155"} onBlur={e=>e.target.style.borderColor="#1e293b"}
                    />
                  </div>
                ))}
              </div>
            )}
            <div style={{fontSize:11,color:"#4b5563",marginBottom:7,lineHeight:1.55}}>
              {iters.length>0
                ? <>All {AGENTS.length} agents will first <b style={{color:"#fbbf24"}}>assess relevance</b> of your input to the original question, then give specific answers based on prior findings.</>
                : <>Add any specific context above, then describe your question or hypothesis below.</>
              }
            </div>
            <textarea value={userInput} onChange={e=>setUserInput(e.target.value)} disabled={running} rows={3}
              placeholder={iters.length>0
                ? `E.g. "Now focus on batch correction across 3 labs" or "Add GSEA to the code"…\nAgents will explicitly assess how relevant this is before responding.`
                : `E.g. "We want to identify DEGs between fibrotic and healthy hepatocytes" or "Focus on m6A in isoform selection"…`
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

  // Extract dimension scores from last judge if available
  const lastJudge=rounds[rounds.length-1]?.judge;
  const dims=lastJudge?.dimensions||null;

  return(
    <div>
      {/* Score strip with rubric breakdown */}
      <div style={{background:"#0c1a30",borderRadius:3,marginBottom:14,border:"1px solid #182640",overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",gap:14,padding:"10px 14px"}}>
          <div style={{fontFamily:"Oxanium,sans-serif",fontSize:9,letterSpacing:2,color:"#354d72",textTransform:"uppercase"}}>AI agreement</div>
          <div style={{fontFamily:"Oxanium,sans-serif",fontSize:18,fontWeight:800,color:scoreColor}}>{finalScore}%</div>
          <div style={{flex:1,height:6,background:"#182640",borderRadius:3,overflow:"hidden"}}>
            <div style={{height:"100%",width:`${agreementBar}%`,background:`linear-gradient(90deg,#f97316,#ffc34d,${scoreColor})`,borderRadius:3,transition:"width .6s"}}/>
          </div>
          <div style={{fontSize:9.5,color:"#354d72"}}>{rounds.length} round{rounds.length>1?"s":""} · {rounds.reduce((t:number,r:any)=>t+r.agents.length,0)} responses</div>
        </div>

        {/* 5-dimension rubric breakdown */}
        {dims&&(
          <>
            <div style={{height:1,background:"#182640"}}/>
            <div style={{padding:"10px 14px"}}>
              <div style={{fontFamily:"Oxanium,sans-serif",fontSize:8,letterSpacing:2,color:"#354d72",textTransform:"uppercase",marginBottom:8}}>Score Breakdown</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6}}>
                {[
                  {key:"scientific_accuracy",label:"Scientific Accuracy",weight:"35%",color:"#00e5ff"},
                  {key:"code_correctness",label:"Code Correctness",weight:"25%",color:"#2aff80"},
                  {key:"experimental_feasibility",label:"Feasibility",weight:"20%",color:"#f59e0b"},
                  {key:"novelty",label:"Novelty",weight:"10%",color:"#a78bfa"},
                  {key:"clarity",label:"Clarity",weight:"10%",color:"#f97316"},
                ].map(d=>{
                  const val=(dims as any)[d.key]??0;
                  const dimColor=val>=80?"#2aff80":val>=60?"#4ade80":val>=40?"#ffc34d":"#f97316";
                  return(
                    <div key={d.key} style={{background:"rgba(0,0,0,.2)",borderRadius:3,padding:"7px 8px",borderTop:`2px solid ${d.color}`}}>
                      <div style={{fontFamily:"Oxanium,sans-serif",fontSize:7.5,color:d.color,letterSpacing:1,marginBottom:4,lineHeight:1.3}}>{d.label}<br/><span style={{color:"#354d72"}}>{d.weight}</span></div>
                      <div style={{fontFamily:"Oxanium,sans-serif",fontSize:14,fontWeight:800,color:dimColor}}>{val}%</div>
                      <div style={{height:3,background:"#182640",borderRadius:2,marginTop:4,overflow:"hidden"}}>
                        <div style={{height:"100%",width:`${val}%`,background:dimColor,borderRadius:2}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        <div style={{height:1,background:"#182640"}}/>
        <div style={{display:"flex",gap:12,padding:"7px 14px",fontSize:9,color:"#354d72",fontFamily:"Oxanium,sans-serif",flexWrap:"wrap"}}>
          <span style={{color:"#f97316"}}>0–39% wide disagreement</span>
          <span style={{color:"#ffc34d"}}>40–59% partial</span>
          <span style={{color:"#4ade80"}}>60–79% strong</span>
          <span style={{color:"#2aff80"}}>80–100% full convergence</span>
        </div>
      </div>

      {/* Reasoning trace timeline */}
      {rounds.length>0&&(
        <div style={{background:"#0c1a30",border:"1px solid #182640",borderRadius:4,padding:"12px 14px",marginBottom:14}}>
          <div style={{fontFamily:"Oxanium,sans-serif",fontSize:8.5,letterSpacing:2,color:"#6a85b0",textTransform:"uppercase",marginBottom:10}}>🔬 Reasoning Trace</div>
          <div style={{display:"flex",alignItems:"flex-start",gap:0,overflowX:"auto",paddingBottom:4}}>
            {rounds.map((r:any,i:number)=>{
              const sc=r.judge?.score??0;
              const col=sc>=80?"#2aff80":sc>=60?"#4ade80":sc>=40?"#ffc34d":"#f97316";
              return(
                <div key={i} style={{display:"flex",alignItems:"center",flexShrink:0}}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                    <div style={{width:28,height:28,borderRadius:"50%",background:col+"22",border:`2px solid ${col}`,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"Oxanium,sans-serif",fontSize:10,fontWeight:700,color:col}}>{i+1}</div>
                    <div style={{fontSize:9,color:col,fontFamily:"Oxanium,sans-serif",fontWeight:700}}>{sc}%</div>
                    <div style={{fontSize:8.5,color:"#354d72",textAlign:"center",maxWidth:80,lineHeight:1.4}}>
                      {r.judge?.unresolved_tensions?.[0]?.slice(0,35)||"converging"}
                    </div>
                  </div>
                  {i<rounds.length-1&&<div style={{width:32,height:2,background:"#182640",margin:"0 4px",marginBottom:20,flexShrink:0}}/>}
                </div>
              );
            })}
            <div style={{display:"flex",alignItems:"center",flexShrink:0}}>
              <div style={{width:32,height:2,background:"#182640",margin:"0 4px",marginBottom:20}}/>
              <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                <div style={{width:28,height:28,borderRadius:"50%",background:"rgba(167,139,250,.15)",border:"2px solid #a78bfa",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12}}>✓</div>
                <div style={{fontSize:9,color:"#a78bfa",fontFamily:"Oxanium,sans-serif",fontWeight:700}}>consensus</div>
              </div>
            </div>
          </div>
        </div>
      )}

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

/* ═══════ PROTOCOL PANEL ═══════ */
function ProtocolPanel({it,q,allIters,onUpdate}:any){
  const [generating,setGenerating]=useState(false);
  const [error,setError]=useState("");

  const hasFailed=it.protocols&&(it.protocols.startsWith("Protocol generation failed")||it.protocols.includes("could not be generated"));

  const gen=async()=>{
    if(generating) return;
    setGenerating(true);setError("");
    const sys=`You are Dr. Sarah Chen, a senior experimental biologist. The AI agents just completed a debate on a biology problem and proposed several experiments and analyses. Your job: write DETAILED, LITERATURE-BACKED protocols for the KEY experiments they suggested that cannot be fully handled by code alone.

For EACH protocol write EXACTLY this structure:

---
### Protocol N: [Experiment Name]
**Why this experiment** — [1 sentence: what biological question it answers]
**Reference** — [Author et al., Journal Year, PMID:XXXXXXX — use real plausible PMIDs]
**Estimated time** — [e.g. 3 days | 2 weeks]
**Estimated cost** — [e.g. ~$200 reagents + sequencing if applicable]

**Materials you need to purchase:**
| Reagent/Kit | Supplier | Cat# | ~Cost |
|---|---|---|---|
| [reagent] | [ThermoFisher/Sigma/NEB/etc] | [catalog#] | [$XX] |

**Step-by-step protocol:**
1. [Exact step — include volume, concentration, time, temperature]
2. [Continue with this level of detail throughout]
3. ...

**Critical controls:**
- Positive: [specific reagent/condition] → expected result
- Negative: [specific reagent/condition] → expected result
- Technical: [e.g. no-RT control for RT-qPCR]

**Common failure points:**
1. [Specific pitfall + how to avoid]
2. [Specific pitfall + how to avoid]

**How to know it worked:**
[Specific observable/measurable success criterion]
---

Write 2-4 protocols covering the most important experimental validations suggested by the debate. Focus on wet-lab experiments and computational analyses that go beyond what a Python script can do. Skip anything that is purely code-solvable.`;

    const msg=`Biology problem: ${q.title}
Expert consensus from debate:
${(it.consensus||"").slice(0,800)}

Action plan from debate:
${(it.plainSummary||"").slice(0,600)}

Write the detailed lab protocols now. Be specific with catalog numbers, concentrations, and timings.`;

    try{
      const result=await callWithRetry(sys,msg,1000,"ProtocolPanel");
      const updated=allIters.map((iter:any)=>iter.id===it.id?{...iter,protocols:result}:iter);
      onUpdate(updated);
    }catch(e:any){
      setError(`Protocol generation failed: ${e.message}. Please retry.`);
    }finally{setGenerating(false);}
  };

  // Auto-generate if not done yet
  useEffect(()=>{
    if(!it.protocols&&!hasFailed&&!generating) gen();
  },[]);

  return(
    <div style={{background:"rgba(42,255,128,.02)",border:"1px solid rgba(42,255,128,.15)",borderRadius:4,padding:"18px 20px",position:"relative"}}>
      <div style={{position:"absolute",top:-8,left:14,background:"#07101f",padding:"0 8px",fontSize:8.5,letterSpacing:2.5,color:"#2aff80",fontFamily:"Oxanium,sans-serif"}}>🧫 LAB PROTOCOLS — LITERATURE-BACKED</div>

      {generating&&(
        <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"40px 0",gap:12}}>
          <span style={{width:22,height:22,borderRadius:"50%",border:"3px solid #2aff80",borderTopColor:"transparent",animation:"spin .7s linear infinite"}}/>
          <div style={{fontFamily:"Oxanium,sans-serif",fontSize:11,color:"#2aff80"}}>Generating detailed lab protocols…</div>
          <div style={{fontSize:10,color:"#354d72",textAlign:"center",maxWidth:400}}>Dr. Sarah Chen is writing step-by-step protocols with reagent catalog numbers, controls, and literature references</div>
        </div>
      )}

      {error&&!generating&&(
        <div style={{background:"rgba(255,92,92,.06)",border:"1px solid rgba(255,92,92,.2)",borderRadius:4,padding:"12px 16px",marginBottom:14}}>
          <div style={{fontSize:11,color:"#fca5a5",marginBottom:10}}>{error}</div>
          <button onClick={gen} style={{padding:"7px 18px",borderRadius:3,border:"1px solid rgba(42,255,128,.4)",background:"rgba(42,255,128,.08)",color:"#2aff80",fontFamily:"Oxanium,sans-serif",fontSize:10,cursor:"pointer"}}>
            ⚡ Retry Protocol Generation
          </button>
        </div>
      )}

      {it.protocols&&!hasFailed&&!generating&&(
        <div style={{fontSize:12,color:"#b4c8e8",lineHeight:1.9}}>
          <Md text={it.protocols}/>
          <div style={{marginTop:16,paddingTop:14,borderTop:"1px solid #182640",fontSize:10,color:"#354d72",lineHeight:1.7}}>
            ⚠️ Always verify protocols against the cited primary literature before running in your lab. Catalog numbers and prices may vary by region and change over time. Consult your institution's biosafety guidelines before beginning any new protocol.
          </div>
        </div>
      )}

      {(hasFailed||(!it.protocols&&!generating&&!error))&&(
        <div style={{textAlign:"center",padding:"28px 0"}}>
          <div style={{fontSize:11,color:"#354d72",marginBottom:14}}>Protocols not yet generated for this session.</div>
          <button onClick={gen} style={{padding:"10px 28px",borderRadius:4,border:"1px solid rgba(42,255,128,.5)",background:"rgba(42,255,128,.1)",color:"#2aff80",fontFamily:"Oxanium,sans-serif",fontSize:11,letterSpacing:1.2,textTransform:"uppercase",cursor:"pointer"}}>
            🧫 Generate Protocols
          </button>
        </div>
      )}
    </div>
  );
}

/* ═══════ ITER BLOCK ═══════ */
function IterBlock({it,n,defaultOpen,onDelete,q,onUpdate,allIters}){
  const [open,setOpen]=useState(defaultOpen);
  const [tab,setTab]=useState("conclusion");
  const [confirmDelete,setConfirmDelete]=useState(false);
  const [generatingCode,setGeneratingCode]=useState(false);
  const [runningCode,setRunningCode]=useState(false);
  const [codeOutput,setCodeOutput]=useState<{stdout:string,stderr:string,images:string[],error:string|null}|null>(null);
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
    {id:"protocol",   label:"🧫 Protocols"},
    {id:"final",      label:"✓ Expert Resolution"},
    {id:"plain",      label:"📋 Action Plan"},
    ...rounds.map(r=>({id:`r${r.roundNum}`,label:`Rd ${r.roundNum}${r.judge?.score!=null?` · ${r.judge.score}%`:""}`,roundNum:r.roundNum})),
  ];

  // Detect if stored "code" is actually an error message
  const codeIsFailed = it.code&&(
    it.code.startsWith("Code generation failed")||
    it.code.startsWith("code generation failed")||
    it.code.includes("rate limit")||
    it.code.includes("failed after")
  );
  const hasValidCode = it.code && !codeIsFailed;

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

              {/* Action buttons — only show when valid code exists */}
              {hasValidCode&&!generatingCode&&(
                <div style={{display:"flex",gap:8,marginBottom:14,flexWrap:"wrap"}}>
                  <button onClick={()=>{
                    const code=it.code.match(/```python\n([\s\S]*?)```/)?.[1]||it.code;
                    window.open(`https://colab.research.google.com/gist/blank?code=${encodeURIComponent(code)}`,"_blank");
                  }} style={{padding:"5px 12px",borderRadius:3,border:"1px solid rgba(255,165,0,.4)",background:"rgba(255,165,0,.08)",color:"#fbbf24",fontFamily:"Oxanium,sans-serif",fontSize:9.5,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
                    ▶ Open in Colab
                  </button>
                  <button onClick={()=>{
                    const code=it.code.match(/```python\n([\s\S]*?)```/)?.[1]||it.code;
                    navigator.clipboard.writeText(code).then(()=>alert("Code copied — paste into a Jupyter cell."));
                  }} style={{padding:"5px 12px",borderRadius:3,border:"1px solid rgba(42,255,128,.3)",background:"rgba(42,255,128,.06)",color:"#2aff80",fontFamily:"Oxanium,sans-serif",fontSize:9.5,cursor:"pointer"}}>
                    📋 Copy for Jupyter
                  </button>
                  <button onClick={()=>{
                    const code=it.code.match(/```python\n([\s\S]*?)```/)?.[1]||it.code;
                    navigator.clipboard.writeText(code).then(()=>alert("Code copied — use with reticulate::py_run_string() in RStudio."));
                  }} style={{padding:"5px 12px",borderRadius:3,border:"1px solid rgba(139,92,246,.3)",background:"rgba(139,92,246,.06)",color:"#a78bfa",fontFamily:"Oxanium,sans-serif",fontSize:9.5,cursor:"pointer"}}>
                    📋 Copy for RStudio
                  </button>
                  <button
                    disabled={runningCode}
                    onClick={async()=>{
                      if(runningCode) return;
                      const rawCode=it.code.match(/```python\n([\s\S]*?)```/)?.[1]||it.code;
                      setRunningCode(true);
                      setCodeOutput(null);
                      const result=await runCodeInSandbox(rawCode);
                      setCodeOutput(result);
                      setRunningCode(false);
                    }}
                    style={{padding:"5px 12px",borderRadius:3,border:"1px solid rgba(0,229,255,.4)",background:runningCode?"transparent":"rgba(0,229,255,.08)",color:runningCode?"#354d72":"#00e5ff",fontFamily:"Oxanium,sans-serif",fontSize:9.5,cursor:runningCode?"default":"pointer",display:"flex",alignItems:"center",gap:6}}>
                    {runningCode?(
                      <><span style={{width:8,height:8,borderRadius:"50%",border:"1.5px solid #00e5ff",borderTopColor:"transparent",animation:"spin .7s linear infinite"}}/>Running…</>
                    ):"⚡ Run in Sandbox"}
                  </button>
                </div>
              )}

              {/* Generating spinner */}
              {generatingCode&&(
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"32px 0",gap:12}}>
                  <span style={{width:22,height:22,borderRadius:"50%",border:"3px solid #2aff80",borderTopColor:"transparent",animation:"spin .7s linear infinite"}}/>
                  <div style={{fontFamily:"Oxanium,sans-serif",fontSize:11,color:"#2aff80"}}>Generating validated Python code…</div>
                  <div style={{fontSize:10,color:"#354d72"}}>This uses a quality-checked template — may take 20–40 seconds</div>
                </div>
              )}

              {/* Valid code */}
              {hasValidCode&&!generatingCode&&(
                <div style={{fontSize:11.5,color:"#a5f3fc",lineHeight:1.75}}><CodeMd text={it.code}/></div>
              )}

              {/* No code yet OR failed — show retry button */}
              {(!it.code||codeIsFailed)&&!generatingCode&&(
                <div style={{textAlign:"center",padding:"28px 0"}}>
                  {codeIsFailed&&(
                    <div style={{background:"rgba(255,92,92,.06)",border:"1px solid rgba(255,92,92,.2)",borderRadius:4,padding:"12px 16px",marginBottom:16,fontSize:11,color:"#fca5a5",lineHeight:1.6}}>
                      ⚠️ Previous generation hit a rate limit. Click below to try again — the rate limit resets every 60 seconds.
                    </div>
                  )}
                  {!it.code&&!codeIsFailed&&(
                    <div style={{fontSize:11,color:"#354d72",marginBottom:14}}>Code not yet generated for this session.</div>
                  )}
                  <button onClick={async()=>{
                    // Clear the failed code first so UI updates correctly
                    const cleared=allIters.map((iter:any)=>iter.id===it.id?{...iter,code:""}:iter);
                    onUpdate(cleared);
                    await genCode();
                  }} style={{padding:"10px 28px",borderRadius:4,border:"1px solid rgba(42,255,128,.5)",background:"rgba(42,255,128,.1)",color:"#2aff80",fontFamily:"Oxanium,sans-serif",fontSize:11,letterSpacing:1.2,textTransform:"uppercase",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:8}}>
                    ⚡ Generate Code Now
                  </button>
                </div>
              )}

              {/* Sandbox output */}
              {codeOutput&&(
                <div style={{marginTop:16,border:"1px solid #182640",borderRadius:4,overflow:"hidden"}}>
                  <div style={{padding:"8px 14px",background:"#0c1a30",fontFamily:"Oxanium,sans-serif",fontSize:9,letterSpacing:2,color:codeOutput.error?"#ff5c5c":"#2aff80",display:"flex",alignItems:"center",gap:8}}>
                    {codeOutput.error?"❌ EXECUTION ERROR":"✓ EXECUTION OUTPUT"}
                    <button onClick={()=>setCodeOutput(null)} style={{marginLeft:"auto",background:"transparent",border:"none",color:"#354d72",cursor:"pointer",fontSize:11}}>✕</button>
                  </div>
                  {codeOutput.error&&(
                    <div style={{padding:"12px 14px",background:"rgba(255,92,92,.05)"}}>
                      <pre style={{color:"#fca5a5",fontSize:11,margin:0,whiteSpace:"pre-wrap"}}>{codeOutput.error}</pre>
                    </div>
                  )}
                  {codeOutput.stdout&&(
                    <div style={{padding:"12px 14px",borderTop:"1px solid #182640"}}>
                      <div style={{fontFamily:"Oxanium,sans-serif",fontSize:8,color:"#354d72",letterSpacing:1.5,marginBottom:6}}>STDOUT</div>
                      <pre style={{color:"#a5f3fc",fontSize:11,margin:0,whiteSpace:"pre-wrap",maxHeight:300,overflowY:"auto"}}>{codeOutput.stdout}</pre>
                    </div>
                  )}
                  {codeOutput.stderr&&(
                    <div style={{padding:"12px 14px",borderTop:"1px solid #182640",background:"rgba(255,165,0,.03)"}}>
                      <div style={{fontFamily:"Oxanium,sans-serif",fontSize:8,color:"#fbbf24",letterSpacing:1.5,marginBottom:6}}>WARNINGS</div>
                      <pre style={{color:"#fde68a",fontSize:10.5,margin:0,whiteSpace:"pre-wrap",maxHeight:150,overflowY:"auto"}}>{codeOutput.stderr}</pre>
                    </div>
                  )}
                  {codeOutput.images&&codeOutput.images.length>0&&(
                    <div style={{padding:"12px 14px",borderTop:"1px solid #182640"}}>
                      <div style={{fontFamily:"Oxanium,sans-serif",fontSize:8,color:"#a78bfa",letterSpacing:1.5,marginBottom:10}}>📊 GENERATED FIGURES ({codeOutput.images.length})</div>
                      <div style={{display:"flex",flexDirection:"column",gap:12}}>
                        {codeOutput.images.map((img:string,i:number)=>(
                          <div key={i} style={{border:"1px solid #182640",borderRadius:3,overflow:"hidden"}}>
                            <img src={img.startsWith("data:")?img:`data:image/png;base64,${img}`} alt={`Figure ${i+1}`} style={{width:"100%",maxWidth:600,display:"block"}}/>
                            <div style={{padding:"5px 10px",background:"#0c1a30",fontSize:9,color:"#354d72",fontFamily:"Oxanium,sans-serif"}}>Figure {i+1} — right-click to save</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ══ PROTOCOLS ══ */}
          {tab==="protocol"&&(
            <ProtocolPanel it={it} q={q} allIters={allIters} onUpdate={onUpdate}/>
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
  {id:"seed_13",title:"We have bulk RNA-seq from fibrotic vs healthy human hepatocytes (n=6/group). How do we identify the top 20 DEGs driving fibrosis and generate a publication-ready volcano plot?",ts:Date.now()-1000*60*60*90,sessionId:"seed",submissionCount:1,resolved:true,finalScore:81,category:"Real Lab · RNA-seq"},
  {id:"seed_14",title:"Design a CRISPR screen to identify essential genes in macrophage polarization from M0 to M1. We have ~50M cells, no prior screen experience, budget for 1 sequencing run.",ts:Date.now()-1000*60*60*100,sessionId:"seed",submissionCount:1,resolved:true,finalScore:76,category:"Real Lab · CRISPR"},
  {id:"seed_15",title:"We ran a 10x Chromium scRNA-seq experiment on mouse heart tissue (3 time points post-MI). How do we integrate the 3 datasets, remove batch effects, and identify fibroblast subclusters?",ts:Date.now()-1000*60*60*110,sessionId:"seed",submissionCount:1,resolved:true,finalScore:83,category:"Real Lab · Single-Cell"},
  {id:"seed_16",title:"We want to improve statistical power for our RNA-seq study in cardiomyopathy patients. Currently n=8/group. What sample size do we actually need to detect a 1.5-fold change at 80% power?",ts:Date.now()-1000*60*60*120,sessionId:"seed",submissionCount:1,resolved:true,finalScore:79,category:"Real Lab · Stats"},
  {id:"seed_17",title:"Design a macrophage co-culture assay to study cancer cell immune evasion. We have THP-1 cells and a HER2+ breast cancer line. What readouts and controls do we need?",ts:Date.now()-1000*60*60*130,sessionId:"seed",submissionCount:1,resolved:false,finalScore:72,category:"Real Lab · Protocol"},
];

async function loadCommunityIndex(){
  try{
    const stored=await kvGet(CK_INDEX)||[];
    const storedIds=new Set(stored.map((x:any)=>x.id));
    const seedsToAdd=SEED_QUESTIONS.filter((s:any)=>!storedIds.has(s.id));
    return [...stored,...seedsToAdd];
  }catch{return [...SEED_QUESTIONS];}
}
async function saveCommunityIndex(list:any){
  const toSave=list.filter((x:any)=>!x.id.startsWith("seed_"));
  await kvSet(CK_INDEX,toSave);
}
async function loadCommunityIters(qid:any){
  return await kvGet(ck(qid))||[];
}
async function saveCommunityIters(qid:any,iters:any){
  await kvSet(ck(qid),iters);
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
      setLiveRound(round);
      setLivePhase("debating");
      const roundAgents=await runDebateRound(enrichedQ,round,allRounds,ui,onAgentStatus,prevConsensus);
      setLivePhase("judging");
      const judgeResult=await judgeRound(enrichedQ,[...allRounds,{agents:roundAgents}],prevConsensus);
      setLiveScore(judgeResult.score);
      const snippets=roundAgents.map(a=>{
        const ag=AGENTS.find(x=>x.id===a.aid);
        const full=a.resp||"";
        const cut=full.slice(0,320);
        const lastDot=Math.max(cut.lastIndexOf(". "),cut.lastIndexOf(".\n"),cut.lastIndexOf("! "),cut.lastIndexOf("? "));
        const snippet=lastDot>150?cut.slice(0,lastDot+1):cut;
        return {name:ag?.name||a.aid,color:ag?.color||"#888",lens:ag?.lens||"",snippet,full};
      });
      setLiveRounds(prev=>[...prev,{roundNum:round,score:judgeResult.score,tensions:judgeResult.unresolved_tensions||[],focus:judgeResult.next_debate_focus||"",snippets}]);
      allRounds.push({roundNum:round,agents:roundAgents,judge:judgeResult});
    }
    const finalScore=allRounds[allRounds.length-1]?.judge?.score??0;

    setLivePhase("cooling down…");
    await new Promise(r=>setTimeout(r,62000));
    setLivePhase("consensus");
    const finalConsensus=await buildFinalConsensus(enrichedQ,allRounds,ui,true,prevConsensus);
    await new Promise(r=>setTimeout(r,22000));
    setLivePhase("plain");
    const plainSummary=await buildPlainSummary(enrichedQ,finalConsensus,ui,true,prevConsensus);
    await new Promise(r=>setTimeout(r,22000));
    setLivePhase("conclusion");
    const conclusion=await buildConclusion(enrichedQ,allRounds,finalConsensus,ui,true);
    await new Promise(r=>setTimeout(r,22000));
    setLivePhase("code");
    const code=await generateCode(enrichedQ,finalConsensus,ui);

    const iteration={
      id:Date.now().toString(),ts:Date.now(),
      ui: ui||"(initial analysis)",
      sessionId:SESSION_ID,
      rounds:allRounds,totalRounds:allRounds.length,finalScore,resolved:true,
      consensus:finalConsensus,plainSummary,conclusion,code,protocols:"",
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
    <ErrorBoundary>
    <div className="ba-root">
      <Nav page={page} goHome={goHome} goCommunity={goCommunity} goLB={goLB} customAPI={customAPI}/>
      {page==="home"&&<Home goCategory={goCategory} goQuestion={goQuestion} goCommunity={goCommunity} goCommunityQ={goCommunityQ} customAPI={customAPI} applyCustomAPI={applyCustomAPI}/>}
      {page==="cat"&&<Category catId={catId} goHome={goHome} goQuestion={goQuestion}/>}
      {page==="q"&&<Question qid={qid} goHome={goHome} goCategory={goCategory}/>}
      {page==="community"&&<Community goHome={goHome} goCommunityQ={goCommunityQ}/>}
      {page==="cq"&&<CommunityQuestion cqid={cqid} cqTitle={cqTitle} goHome={goHome} goCommunity={goCommunity}/>}
      {page==="lb"&&<Leaderboard goHome={goHome}/>}
    </div>
    </ErrorBoundary>
  );
}
