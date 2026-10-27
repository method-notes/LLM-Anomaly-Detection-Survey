# Anomaly Detection in LLM-Based Systems: A Survey

Research companion website by Chiming Duan, Tong Jia, Minghua He,
Lingzhe Zhang, Haobo Wang, and Ying Li, Peking University.

The manuscript is in preparation for submission to ACM Computing Surveys.

## Preprint

[Preprint v1](https://www.alphaxiv.org/abs/2610.anomaly-detection-llm-systems)
was released on October 10, 2026. The complete 34-page manuscript is available
for [direct PDF viewing](https://method-notes.github.io/LLM-Anomaly-Detection-Survey/assets/preprint-v1.pdf)
and as a [Release download](https://github.com/method-notes/LLM-Anomaly-Detection-Survey/releases/download/preprint-v1/main.pdf).
This preprint has not been peer reviewed. The release notes include the
authors, abstract, and PDF SHA-256 checksum.

[Read the abstract](https://method-notes.github.io/LLM-Anomaly-Detection-Survey/abstract.html).
The abstract page includes bibliographic metadata and links to the original PDF.
The PDF and versioned Release are unchanged.

## Website

[Open the website](https://method-notes.github.io/LLM-Anomaly-Detection-Survey/).

The site presents Boundary-Modeling AD and Alignment-Based AD, five method
families, a searchable directory of 181 selected taxonomy examples, the
alignment framework, and the survey's coverage and research challenges.
Method entries link to the surveyed publications.

All page assets are local. Search, filters, pagination, figure viewing,
CSV export, and BibTeX copy run in the browser. No build step is required.

Open `index.html` directly, or serve the repository with:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Then visit `http://127.0.0.1:8000/`.

## Data and Citation

`assets/data.js` and `assets/survey-methods.csv` contain the manuscript's
selected taxonomy examples. Each example has one principal method family;
the counts are not a census of all publications. Supporting and adjacent
works are excluded from the directory count.

`assets/survey.bib` contains the alphaXiv BibTeX citation and links to the
paper's alphaXiv record.

## Publishing

GitHub Pages serves the root of the `main` branch.
All resource paths are relative and support a project-page subdirectory.
`sitemap.xml` lists the homepage and abstract page.

## Third-Party Assets

Lucide is distributed under the ISC license. Its notice is retained in
`assets/LUCIDE-LICENSE`.

Bundled Mozilla PDF.js 6.4.299 assets are distributed under Apache 2.0. The license is
retained in `assets/pdfjs/LICENSE`.
