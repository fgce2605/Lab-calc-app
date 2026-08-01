import { CalcType } from '../types';

export interface CalculationDetails {
  result: number;
  formatted: string;
  unit: string;
  isValid: boolean;
  errorMessage?: string;
}

/**
 * 1. NCO% (Isocyanate Content)
 * Formula: NCO% = [(V_blank - V_sample) * N * 4.202] / W
 * V = mL HCl titrant, N = normality of HCl, W = sample weight in g
 */
export function calculateNCO(
  vBlank: number,
  vSample: number,
  normality: number,
  weight: number
): CalculationDetails {
  if (weight <= 0) {
    return { result: 0, formatted: '0.00', unit: '%', isValid: false, errorMessage: 'Sample weight must be > 0' };
  }
  const diff = vBlank - vSample;
  if (diff < 0) {
    return { result: 0, formatted: '0.00', unit: '%', isValid: false, errorMessage: 'V_blank must be >= V_sample' };
  }
  const result = (diff * normality * 4.202) / weight;
  return {
    result,
    formatted: result.toFixed(3),
    unit: '% NCO',
    isValid: true,
  };
}

/**
 * 2. Acid Value
 * Formula: Acid Value = (V * N * 56.1) / W
 * V = mL KOH used, N = normality of KOH, W = sample weight in g
 */
export function calculateAcidValue(
  vKoh: number,
  normality: number,
  weight: number
): CalculationDetails {
  if (weight <= 0) {
    return { result: 0, formatted: '0.00', unit: 'mg KOH/g', isValid: false, errorMessage: 'Sample weight must be > 0' };
  }
  if (vKoh < 0) {
    return { result: 0, formatted: '0.00', unit: 'mg KOH/g', isValid: false, errorMessage: 'Volume must be >= 0' };
  }
  const result = (vKoh * normality * 56.1) / weight;
  return {
    result,
    formatted: result.toFixed(2),
    unit: 'mg KOH/g',
    isValid: true,
  };
}

/**
 * 3. Karl Fischer (Moisture %)
 * Formula: Moisture % = (V * F * 100) / (W * 1000)
 * V = mL KF reagent consumed, F = KF factor (mg H2O/mL), W = sample weight in g
 */
export function calculateKarlFischer(
  vKf: number,
  kfFactor: number,
  weight: number
): CalculationDetails {
  if (weight <= 0) {
    return { result: 0, formatted: '0.000', unit: '% H₂O', isValid: false, errorMessage: 'Sample weight must be > 0' };
  }
  if (vKf < 0 || kfFactor < 0) {
    return { result: 0, formatted: '0.000', unit: '% H₂O', isValid: false, errorMessage: 'Inputs must be >= 0' };
  }
  const result = (vKf * kfFactor * 100) / (weight * 1000);
  return {
    result,
    formatted: result.toFixed(4),
    unit: '% H₂O',
    isValid: true,
  };
}

/**
 * 4. HPLC (Purity/Content %)
 * Formula: Content % = (Area_sample / Area_standard) * (Weight_standard / Weight_sample) * Purity_standard * 100
 * Area in mAU, Weight in mg/g, Purity_standard as percentage (e.g. 99.5 for 99.5%)
 */
export function calculateHPLC(
  areaSample: number,
  areaStandard: number,
  weightStandard: number,
  weightSample: number,
  purityStandard: number // e.g., 99.5 for 99.5%
): CalculationDetails {
  if (areaStandard <= 0 || weightSample <= 0) {
    return { result: 0, formatted: '0.00', unit: '%', isValid: false, errorMessage: 'Area_std & Weight_sample must be > 0' };
  }
  // Convert purity from percentage if entered as > 1 (e.g. 99.5 -> 0.995)
  const purityFraction = purityStandard > 1 ? purityStandard / 100 : purityStandard;
  const result = (areaSample / areaStandard) * (weightStandard / weightSample) * purityFraction * 100;
  return {
    result,
    formatted: result.toFixed(2),
    unit: '% Content',
    isValid: true,
  };
}

/**
 * 5. Brookfield Viscosity
 * Formula: Viscosity (cP) = Dial Reading * Factor
 */
export function calculateViscosity(
  dialReading: number,
  factor: number
): CalculationDetails {
  if (dialReading < 0 || factor <= 0) {
    return { result: 0, formatted: '0', unit: 'cP', isValid: false, errorMessage: 'Dial reading >= 0 and Factor > 0 required' };
  }
  const result = dialReading * factor;
  return {
    result,
    formatted: Math.round(result).toLocaleString('en-US'),
    unit: 'cP (mPa·s)',
    isValid: true,
  };
}

/**
 * 6. Hydroxyl Value (OH Value)
 * Formula: OH Value = [(V_blank - V_sample) * N * 56.1 / W] + Acid Value
 */
export function calculateHydroxylValue(
  vBlank: number,
  vSample: number,
  normality: number,
  weight: number,
  acidValue: number
): CalculationDetails {
  if (weight <= 0) {
    return { result: 0, formatted: '0.00', unit: 'mg KOH/g', isValid: false, errorMessage: 'Sample weight must be > 0' };
  }
  const diff = vBlank - vSample;
  if (diff < 0) {
    return { result: 0, formatted: '0.00', unit: 'mg KOH/g', isValid: false, errorMessage: 'V_blank must be >= V_sample' };
  }
  const baseOh = (diff * normality * 56.1) / weight;
  const result = baseOh + (acidValue || 0);
  return {
    result,
    formatted: result.toFixed(2),
    unit: 'mg KOH/g',
    isValid: true,
  };
}

/**
 * 7. Non-Volatile Matter (NVM% / Solid Content)
 * Formula: NVM% = (W2 - W1) / (W3 - W1) * 100
 * W1 = dish weight, W2 = dish + dried sample, W3 = dish + wet sample
 */
export function calculateNVM(
  w1Dish: number,
  w2Dried: number,
  w3Wet: number
): CalculationDetails {
  const wetSampleWeight = w3Wet - w1Dish;
  const driedSampleWeight = w2Dried - w1Dish;

  if (wetSampleWeight <= 0) {
    return { result: 0, formatted: '0.00', unit: '%', isValid: false, errorMessage: 'W3 (Wet) must be > W1 (Dish)' };
  }
  if (driedSampleWeight < 0) {
    return { result: 0, formatted: '0.00', unit: '%', isValid: false, errorMessage: 'W2 (Dried) must be >= W1 (Dish)' };
  }
  if (w2Dried > w3Wet) {
    return { result: 0, formatted: '0.00', unit: '%', isValid: false, errorMessage: 'W2 (Dried) cannot exceed W3 (Wet)' };
  }

  const result = (driedSampleWeight / wetSampleWeight) * 100;
  return {
    result,
    formatted: result.toFixed(2),
    unit: '% Solids',
    isValid: true,
  };
}

/**
 * 8. Specific Gravity
 * Formula: Specific Gravity = Weight of sample / Weight of equal volume of water
 */
export function calculateSpecificGravity(
  weightSample: number,
  weightWater: number
): CalculationDetails {
  if (weightWater <= 0) {
    return { result: 0, formatted: '0.000', unit: 'g/cm³', isValid: false, errorMessage: 'Weight of water must be > 0' };
  }
  if (weightSample <= 0) {
    return { result: 0, formatted: '0.000', unit: 'g/cm³', isValid: false, errorMessage: 'Weight of sample must be > 0' };
  }
  const result = weightSample / weightWater;
  return {
    result,
    formatted: result.toFixed(3),
    unit: 'Sp.Gr. @25°C',
    isValid: true,
  };
}

/**
 * 9. Gel Time / Pot Life
 * Calculate Duration = Gel time - Start time in minutes
 */
export function calculateGelTime(
  startTimeStr: string, // "10:15" or ISO string
  gelTimeStr: string,   // "11:03" or ISO string
  manualMinutes?: number
): CalculationDetails {
  if (typeof manualMinutes === 'number' && manualMinutes >= 0) {
    const hours = Math.floor(manualMinutes / 60);
    const mins = Math.round(manualMinutes % 60);
    const formatted = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;
    return {
      result: manualMinutes,
      formatted,
      unit: 'minutes',
      isValid: true,
    };
  }

  if (!startTimeStr || !gelTimeStr) {
    return { result: 0, formatted: '0 min', unit: 'minutes', isValid: false, errorMessage: 'Start and Gel times required' };
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const startDate = new Date(`${today}T${startTimeStr}:00`);
    let gelDate = new Date(`${today}T${gelTimeStr}:00`);

    // Handle cross-midnight
    if (gelDate < startDate) {
      gelDate = new Date(gelDate.getTime() + 24 * 60 * 60 * 1000);
    }

    const diffMs = gelDate.getTime() - startDate.getTime();
    const minutes = Math.round(diffMs / (1000 * 60));

    if (isNaN(minutes) || minutes < 0) {
      return { result: 0, formatted: '0 min', unit: 'minutes', isValid: false, errorMessage: 'Invalid time sequence' };
    }

    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const formatted = hours > 0 ? `${hours}h ${mins}m` : `${mins} min`;

    return {
      result: minutes,
      formatted,
      unit: 'minutes',
      isValid: true,
    };
  } catch {
    return { result: 0, formatted: '0 min', unit: 'minutes', isValid: false, errorMessage: 'Failed to parse times' };
  }
}

/**
 * General helper to evaluate pass/fail against resin specifications
 */
export function evaluatePassFail(
  value: number,
  min?: number,
  max?: number
): boolean {
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
}
