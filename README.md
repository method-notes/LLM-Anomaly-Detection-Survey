# Anomaly Detection in LLM-Based Systems: A Survey

Research companion website by Chiming Duan, Tong Jia, Minghua He,
Lingzhe Zhang, Haobo Wang, and Ying Li, Peking University.

The manuscript is in preparation for submission to ACM Computing Surveys.
The repository does not include the submission PDF or a public paper link.

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

`assets/survey.bib` contains unpublished-manuscript citation metadata.

## Publishing

GitHub Pages serves the root of the `main` branch.
All resource paths are relative and support a project-page subdirectory.

## Third-Party Assets

Lucide is distributed under the ISC license. Its notice is retained in
`assets/LUCIDE-LICENSE`.
