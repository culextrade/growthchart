# PLAN — Nellhaus Head Circumference Update to 10 Years

This plan outlines the steps required to transition the head circumference (Lingkar Kepala / LK) calculations from WHO-only (capped at 60 months) to the Nellhaus reference standards, and extend the maximum supported age range up to 10 years (120 months).

---

## 1. Overview & Medical Background

The Head Circumference (Lingkar Kepala / LK) measurement is a critical indicator of brain development in children. Currently, the application uses WHO curves (which only cover 0-60 months) labeled as Nellhaus/WHO. 

To expand pediatric growth monitoring up to 10 years (120 months) for Indonesian clinical settings (matching IDAI guidelines), we will transition to the actual **Nellhaus (1968) Head Circumference Standards** (Composite International and Interracial Curves) covering boys and girls from birth up to 120 months.

### Nellhaus Calculation Mechanics (For Documentation)
Nellhaus reference curves are defined by a Mean ($\mu$) and Standard Deviation ($\sigma$) for each month. To seamlessly integrate Nellhaus with the existing LMS-based z-score calculator, we map them as follows:
- **L (Box-Cox power)**: Set to `1.0` (indicates no skewness, assuming standard normal distribution).
- **M (Median)**: Set to the Nellhaus Mean ($\mu$).
- **S (Coefficient of Variation)**: Set to $\sigma / \mu$ (Standard Deviation divided by the Mean).

Using these values, the LMS Z-score formula simplifies exactly to the standard normal Z-score formula:
$$Z = \frac{(\frac{x}{M})^L - 1}{L \cdot S} \Rightarrow \frac{\frac{x}{M} - 1}{\frac{\sigma}{M}} = \frac{x - M}{\sigma} = \frac{x - \mu}{\sigma}$$

### Clinical Classification (Nellhaus)
- **Mikrosefali (Microcephaly)**: $Z < -2$ SD (head circumference is abnormally small, indicating potential developmental restrictions).
- **Normal**: $-2 \le Z \le +2$ SD (healthy head growth trajectory).
- **Makrosefali (Macrocephaly)**: $Z > +2$ SD (head circumference is abnormally large, indicating potential conditions such as hydrocephalus).

---

## 2. Project Type & Scope

- **Project Type**: WEB (Next.js & React Web Application)
- **Primary Agent**: `frontend-specialist` (UI/UX and growth standards)
- **Scope**: Modifying calculations in `lib/growth-standards.ts`, introducing a new dataset file, and updating chart rendering constraints in `components/growth-chart.tsx`. No changes to database schema are required.

---

## 3. Success Criteria

1. Head circumference calculations evaluate ages up to 120 months (10 years) instead of being capped at 60 months.
2. Z-Scores and clinical interpretations (Normal, Mikrosefali, Makrosefali) for head circumference use the Nellhaus dataset.
3. The growth chart renders the Nellhaus curve (Median, $\pm 2$ SD, and $\pm 3$ SD lines) up to 120 months.
4. Measurements for older children (60–120 months) plot correctly on the head circumference growth chart without being filtered out.
5. Next.js application builds successfully without compiler or TypeScript errors.

---

## 4. Tech Stack

- **Core**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS
- **Visualization**: Recharts (for growth curve plotting)
- **Database/ORM**: Prisma & PostgreSQL (schema remains unchanged)

---

## 5. Proposed File Structure Changes

No directories are modified, but we will add a new data file and update existing standards.

- **[NEW]** `app/lib/nellhaus-head-circumference-data.ts` — Contains the digitized Nellhaus LMS parameter dataset (0-120 months) for boys and girls.
- **[MODIFY]** `app/lib/growth-standards.ts` — Update `getStandardData` to load Nellhaus data for `headCircumference` and modify `getInterpretation` age bounds.
- **[MODIFY]** `app/components/growth-chart.tsx` — Update chart rendering domain, X-axis ticks, and measurement filters to allow 120 months for head circumference.

---

## 6. Task Breakdown

### Task 1: Create Nellhaus Dataset
- **Task ID**: `TASK_01`
- **Agent**: `frontend-specialist`
- **Priority**: High
- **Dependencies**: None
- **Input**: Nellhaus (1968) Mean & SD tables from birth to 10 years.
- **Output**: [nellhaus-head-circumference-data.ts](file:///d:/growthchart/app/lib/nellhaus-head-circumference-data.ts) file with `NELLHAUS_BOYS_HEAD_CIRCUMFERENCE` and `NELLHAUS_GIRLS_HEAD_CIRCUMFERENCE` arrays typed as `LMS[]`.
- **Verify**: Inspect file to ensure entries range from month 0 to 120, with `L: 1`, `M: mean`, and `S: sd / mean`.

### Task 2: Update Growth Standards Calculation
- **Task ID**: `TASK_02`
- **Agent**: `frontend-specialist`
- **Priority**: High
- **Dependencies**: `TASK_01`
- **Input**: [nellhaus-head-circumference-data.ts](file:///d:/growthchart/app/lib/nellhaus-head-circumference-data.ts)
- **Output**: Modified [growth-standards.ts](file:///d:/growthchart/app/lib/growth-standards.ts)
  - Import the new Nellhaus data arrays.
  - Return Nellhaus arrays for `metric === 'headCircumference'` inside `getStandardData`.
  - Update `getInterpretation` head circumference age limit check from `ageMonths <= 60` to `ageMonths <= 120`, and revise the warning message.
- **Verify**: Type-check project compiles without errors.

### Task 3: Adjust Growth Chart Component
- **Task ID**: `TASK_03`
- **Agent**: `frontend-specialist`
- **Priority**: High
- **Dependencies**: `TASK_02`
- **Input**: [growth-chart.tsx](file:///d:/growthchart/app/components/growth-chart.tsx)
- **Output**: Modified [growth-chart.tsx](file:///d:/growthchart/app/components/growth-chart.tsx)
  - Change user measurement filter to accept `ageMonths <= 120` specifically when `effectiveChartType === 'headCircumference'`.
  - Dynamically set the `xDomain` to `[0, 120]` and add ticks `[0, 12, 24, 36, 48, 60, 72, 84, 96, 108, 120]` when head circumference chart is active.
- **Verify**: Ensure the head circumference option allows age range up to 10 years (120 months) and compiles correctly.

---

## 7. Verification Plan (Phase X)

- [ ] Run typescript checks: `npx tsc --noEmit`
- [ ] Run application build to ensure no Next.js errors: `npm run build`
- [ ] Run local server to visually test the updated chart: `npm run dev`
