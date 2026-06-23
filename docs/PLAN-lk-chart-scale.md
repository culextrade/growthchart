# PLAN — growth-chart Y-Axis Dynamic Scaling Optimization

This plan details the steps to implement dynamic Y-axis auto-scaling across all growth charts in the SEHA+ application. It solves the issue where curves are vertically compressed at the top of the chart because Recharts stacks area backgrounds from a baseline of 0.

---

## 1. Overview & Analysis

Currently, the Y-axis of the growth charts (especially for Head Circumference) starts near 0 or -1. This is because the background `Area` components (used to draw the normal and critical standard deviation zones) default to stacking from the baseline of 0, forcing Recharts to include 0 in the Y-axis domain.

To optimize the visual representation, we will calculate the Y-axis domain dynamically:
1.  Scan the selected metric's curve dataset (WHO or CDC) to find the minimum and maximum standard deviation bounds.
2.  Scan the patient's recorded measurements to ensure no data points are clipped.
3.  Add a small visual buffer (5% of the range or at least 1 unit) to ensure padding at the top and bottom of the chart.
4.  Apply this dynamic domain to the Recharts `YAxis` component, which automatically clips the background `Area` zones and centers the curves.

---

## 2. Project Type & Scope

- **Project Type**: WEB (Next.js & React Web Application)
- **Primary Agent**: `frontend-specialist`
- **Scope**: Modifying the chart rendering component in `components/growth-chart.tsx`. No changes to calculation logic or database schemas.

---

## 3. Success Criteria

1. The Y-axis domain for all growth charts (Weight, Height, BMI, Head Circumference, Arm Circumference, and Skinfolds) scales dynamically according to the data range.
2. The empty space below the curves (e.g., 0 to 30 cm for head circumference) is compressed, making the curves occupy the full height of the chart.
3. Patient measurement points that lie outside the standard curves are still fully visible (dynamic domain adapts to user measurements).
4. The background standard deviation zones (`Area` components) are clipped correctly at the bottom of the chart.
5. The application compiles and builds successfully without TypeScript or Next.js build errors.

---

## 4. Tech Stack

- Next.js 16, React 19, TypeScript
- Recharts (Visualization)

---

## 5. Proposed File Structure Changes

No new files are added. We will modify the main growth chart component.

- **[MODIFY]** `app/components/growth-chart.tsx` — Add `yDomain` calculation logic and bind it to the `YAxis` component.

---

## 6. Task Breakdown

### Task 1: Implement Dynamic Y-Axis Domain calculation
- **Task ID**: `TASK_01`
- **Agent**: `frontend-specialist`
- **Priority**: High
- **Dependencies**: None
- **Input**: `chartData`, `userPoints`, and `effectiveChartType` inside the `GrowthChart` component.
- **Output**: A new `yDomain` `useMemo` block that:
  - Scans `chartData` to find the minimum of the lowest curve (`s3neg` or `P3`) and maximum of the highest curve (`s3pos` or `P97`).
  - Scans `userPoints` to ensure patient measurements are within the domain bounds.
  - Adds a dynamic buffer (5% of the range, min 1 unit).
  - Returns `[calculatedMin, calculatedMax]`.
- **Verify**: Inspect code to ensure bounds are calculated correctly and return numeric arrays or `["auto", "auto"]` fallbacks.

### Task 2: Apply yDomain to YAxis Component
- **Task ID**: `TASK_02`
- **Agent**: `frontend-specialist`
- **Priority**: High
- **Dependencies**: `TASK_01`
- **Input**: Computed `yDomain` value.
- **Output**: Modified `YAxis` component in [growth-chart.tsx](file:///d:/growthchart/app/components/growth-chart.tsx).
  - Bind `domain={yDomain}` to the `<YAxis />` tag.
- **Verify**: Type-check and ensure Recharts compiles without errors.

---

## 7. Verification Plan (Phase X)

- [ ] Run typescript type-check: `npx tsc --noEmit`
- [ ] Run application build: `npm run build`
- [ ] Run local development server to test visual rendering of all charts: `npm run dev`
