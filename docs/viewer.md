# Viewer scale and posture

The viewer represents a **170 cm person**. World units are metres. Camera height is the eye level, not the top of the head: **1.59 m standing**, and **0.78 m above the chair seat when seated**. Both procedural chair assets now have a **0.46 m seat surface**, giving **1.24 m seated eye level**.

These are representative preview assumptions inferred from the stature, standing eye height, and seated eye height measurements in the [FAA Technical Operations anthropometric survey, Appendix B](https://hf.tc.faa.gov/hfds/download-hfds/hfds_pdfs/App_B_Tech_Ops_Anthropometrics.pdf). The standing eye level is about 93.5% of stature; seated eye height above the seat is about 46% of stature. The ratios are approximations from population summaries, not a prediction of an individual person's proportions or an ergonomic fit assessment.

The seated viewpoint follows the selected chair's floor position, sits over the cushion ahead of its backrest, and allows looking around. Walking is disabled while seated. Stand up finds a clear floor position beside the chair, avoiding the desk, room bounds, and storage stool. Posture and lens zoom are view controls; they never change the saved rental configuration.

Chair wheels and desk feet meet Y=0. The rug is an 8 mm surface on the floor. Rounded room geometry clamps its bevel radius below half its smallest dimension, preventing a thin rug from becoming an inflated slab. Asset validation checks floor contact and the chair seat surface after compression. Revised desk/chair model and thumbnail URLs include their asset version to avoid stale cached geometry.

The visible +/− buttons dolly the overview camera or adjust the first-person lens. Fullscreen uses the browser API when available and viewport expansion otherwise, with a visible exit. Escape exits viewport expansion before leaving first-person mode.
