# Image Audit

## Case 01 — Conversational AI

- Intro / scope: image strip removed (text-only metadata strip).
- D1 primary: `/images/case1/Case1-02.jpg`
- D1 supporting pair: `/images/case1/case1-01.jpg` + `/images/case1/Case1-04.jpg`
- D1 secondary pair: `/images/case1/Case1-05.jpg` + `/images/case1/Case1-06.jpg`
- D1 -> D2 bridge: `/images/case1/Case1-03.jpg`
- D2 primary: `/images/case1/Case1-09.jpg`
- D3 primary: `/images/case1/Case1-13.jpg` (source-aware knowledge response)
- D3 supporting pair: `/images/case1/Case1-07.jpg` + `/images/case1/Case1-08.jpg`
- D3 supporting strip: `/images/case1/Case1-10.jpg` + `/images/case1/Case1-11.jpg` + `/images/case1/Case1-12.jpg`

## Asset Check Notes

- D3 primary uses `Case1-13.jpg` (source-aware knowledge response).
- Current filesystem names are mixed-case (`Case1-XX.jpg` plus `case1-01.jpg`), so full lowercase references cannot be standardized without renaming/adding files.

## Case 03 — Supply Chain Agents

- Intro / hero: no product screenshot (text-first thesis only).
- Scope context only: `/images/case3/case3-00.jpg`
- D1 primary only: `/images/case3/case3-04.jpg`
- D2 primary only (highest weight): `/images/case3/case3-02.jpg`
- D2 supporting only: `/images/case3/case3-03.jpg`
- D3 primary only: `/images/case3/case3-01.jpg`
- D3 lightweight control chain: `Conversational entry → Orchestrator state → Agent execution surface → Human intervention point`
