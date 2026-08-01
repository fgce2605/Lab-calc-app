import { Batch, ResinSpecification, TestResult, UserProfile, ViscositySpindleFactor } from '../types';
import { DEFAULT_BROOKFIELD_FACTORS, DEFAULT_RESIN_GRADES, DEFAULT_USERS } from './constants';

const KEYS = {
  USERS: 'labcalc_users_v1',
  ACTIVE_USER: 'labcalc_active_user_v1',
  BATCHES: 'labcalc_batches_v1',
  ACTIVE_BATCH_ID: 'labcalc_active_batch_id_v1',
  RESIN_GRADES: 'labcalc_resin_grades_v1',
  VISCOSITY_FACTORS: 'labcalc_viscosity_factors_v1',
  SOUND_ENABLED: 'labcalc_sound_enabled_v1',
};

// Audio synthesized beeps for physical laboratory feedback
export function playLabBeep(type: 'pass' | 'fail' | 'click' | 'alert' = 'click') {
  try {
    const soundOn = localStorage.getItem(KEYS.SOUND_ENABLED) !== 'false';
    if (!soundOn) return;

    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'pass') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.12); // E5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === 'fail') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
      osc.frequency.linearRampToValueAtTime(164.81, ctx.currentTime + 0.2); // E3
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'alert') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else {
      // standard mechanical button tap
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch {
    // Ignore audio context autoplay restrictions
  }
}

export function isSoundEnabled(): boolean {
  return localStorage.getItem(KEYS.SOUND_ENABLED) !== 'false';
}

export function setSoundEnabled(enabled: boolean) {
  localStorage.setItem(KEYS.SOUND_ENABLED, String(enabled));
}

export function getUsers(): UserProfile[] {
  const data = localStorage.getItem(KEYS.USERS);
  if (!data) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(DEFAULT_USERS));
    return DEFAULT_USERS;
  }
  return JSON.parse(data);
}

export function getActiveUser(): UserProfile {
  const users = getUsers();
  const activeId = localStorage.getItem(KEYS.ACTIVE_USER);
  const found = users.find((u) => u.id === activeId);
  return found || users[0];
}

export function setActiveUser(user: UserProfile) {
  localStorage.setItem(KEYS.ACTIVE_USER, user.id);
}

export function getResinGrades(): ResinSpecification[] {
  const data = localStorage.getItem(KEYS.RESIN_GRADES);
  if (!data) {
    localStorage.setItem(KEYS.RESIN_GRADES, JSON.stringify(DEFAULT_RESIN_GRADES));
    return DEFAULT_RESIN_GRADES;
  }
  return JSON.parse(data);
}

export function saveResinGrade(grade: ResinSpecification) {
  const grades = getResinGrades();
  const idx = grades.findIndex((g) => g.id === grade.id);
  if (idx >= 0) {
    grades[idx] = grade;
  } else {
    grades.push(grade);
  }
  localStorage.setItem(KEYS.RESIN_GRADES, JSON.stringify(grades));
}

export function deleteResinGrade(id: string) {
  const grades = getResinGrades().filter((g) => g.id !== id);
  localStorage.setItem(KEYS.RESIN_GRADES, JSON.stringify(grades));
}

export function getViscosityFactors(): ViscositySpindleFactor[] {
  const data = localStorage.getItem(KEYS.VISCOSITY_FACTORS);
  if (!data) {
    localStorage.setItem(KEYS.VISCOSITY_FACTORS, JSON.stringify(DEFAULT_BROOKFIELD_FACTORS));
    return DEFAULT_BROOKFIELD_FACTORS;
  }
  return JSON.parse(data);
}

export function saveViscosityFactors(factors: ViscositySpindleFactor[]) {
  localStorage.setItem(KEYS.VISCOSITY_FACTORS, JSON.stringify(factors));
}

// Initial seed batches if empty
const INITIAL_DEMO_BATCHES: Batch[] = [
  {
    id: 'BAT-2026-0801',
    sampleName: 'Epoxy Resin Clear Coat Lot A',
    resinGradeId: 'grade_epoxy_e12',
    resinGradeName: 'Epoxy Resin E-12',
    lotNumber: 'LOT-9921',
    quantityKg: 2500,
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 1).toISOString(),
    operatorId: 'usr_op_1',
    operatorName: 'Alex Rivera',
    status: 'passed',
    notes: 'Standard production reactor 4 run. Passed all physical & chemical tests.',
    testResults: [
      {
        id: 'res_1',
        batchId: 'BAT-2026-0801',
        calcType: 'nco',
        calcName: 'Isocyanate Content (NCO%)',
        timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
        operatorId: 'usr_op_1',
        operatorName: 'Alex Rivera',
        inputs: { vBlank: 25.0, vSample: 22.4, normality: 0.1, weight: 2.05 },
        resultValue: 0.107,
        resultFormatted: '0.107',
        unit: '% NCO',
        specMin: 0,
        specMax: 0.2,
        isPass: true,
      },
      {
        id: 'res_2',
        batchId: 'BAT-2026-0801',
        calcType: 'viscosity',
        calcName: 'Brookfield Viscosity',
        timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
        operatorId: 'usr_op_1',
        operatorName: 'Alex Rivera',
        inputs: { spindle: 'LV-3 (63)', rpm: 12, dialReading: 24, factor: 100 },
        resultValue: 2400,
        resultFormatted: '2,400',
        unit: 'cP',
        specMin: 2000,
        specMax: 3200,
        isPass: true,
      },
      {
        id: 'res_3',
        batchId: 'BAT-2026-0801',
        calcType: 'acid_value',
        calcName: 'Acid Value (AV)',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        operatorId: 'usr_op_1',
        operatorName: 'Alex Rivera',
        inputs: { vKoh: 0.35, normality: 0.1, weight: 5.12 },
        resultValue: 0.38,
        resultFormatted: '0.38',
        unit: 'mg KOH/g',
        specMin: 0,
        specMax: 0.5,
        isPass: true,
      },
      {
        id: 'res_4',
        batchId: 'BAT-2026-0801',
        calcType: 'nvm',
        calcName: 'Non-Volatile Matter (NVM%)',
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        operatorId: 'usr_op_1',
        operatorName: 'Alex Rivera',
        inputs: { w1Dish: 12.45, w2Dried: 14.42, w3Wet: 14.43 },
        resultValue: 99.49,
        resultFormatted: '99.49',
        unit: '% Solids',
        specMin: 99.0,
        specMax: 100.0,
        isPass: true,
      },
    ],
  },
  {
    id: 'BAT-2026-0802',
    sampleName: 'Polyether Polyol Batch B',
    resinGradeId: 'grade_polyol_p2000',
    resinGradeName: 'Polyether Polyol P-2000',
    lotNumber: 'LOT-9922',
    quantityKg: 1800,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    operatorId: 'usr_op_1',
    operatorName: 'Alex Rivera',
    status: 'in_progress',
    notes: 'Sampling from main storage tank T-102.',
    testResults: [
      {
        id: 'res_5',
        batchId: 'BAT-2026-0802',
        calcType: 'hydroxyl',
        calcName: 'Hydroxyl Value (OH Value)',
        timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
        operatorId: 'usr_op_1',
        operatorName: 'Alex Rivera',
        inputs: { vBlank: 25.0, vSample: 15.2, normality: 0.5, weight: 4.8 },
        resultValue: 56.2,
        resultFormatted: '56.20',
        unit: 'mg KOH/g',
        specMin: 54,
        specMax: 58,
        isPass: true,
      },
      {
        id: 'res_6',
        batchId: 'BAT-2026-0802',
        calcType: 'karl_fischer',
        calcName: 'Moisture Content (KF %)',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
        operatorId: 'usr_op_1',
        operatorName: 'Alex Rivera',
        inputs: { vKf: 1.2, kfFactor: 5.1, weight: 15.0 },
        resultValue: 0.0408,
        resultFormatted: '0.0408',
        unit: '% H₂O',
        specMin: 0,
        specMax: 0.03,
        isPass: false,
        notes: 'Moisture elevated above 0.03% spec max.',
      },
    ],
  },
];

export function getBatches(): Batch[] {
  const data = localStorage.getItem(KEYS.BATCHES);
  if (!data) {
    localStorage.setItem(KEYS.BATCHES, JSON.stringify(INITIAL_DEMO_BATCHES));
    localStorage.setItem(KEYS.ACTIVE_BATCH_ID, INITIAL_DEMO_BATCHES[0].id);
    return INITIAL_DEMO_BATCHES;
  }
  return JSON.parse(data);
}

export function saveBatches(batches: Batch[]) {
  localStorage.setItem(KEYS.BATCHES, JSON.stringify(batches));
}

export function getBatchById(id: string): Batch | undefined {
  return getBatches().find((b) => b.id === id);
}

export function saveBatch(batch: Batch) {
  const batches = getBatches();
  const idx = batches.findIndex((b) => b.id === batch.id);
  batch.updatedAt = new Date().toISOString();

  // Evaluate overall batch status based on test results
  if (batch.testResults && batch.testResults.length > 0) {
    const hasFail = batch.testResults.some((r) => !r.isPass);
    if (hasFail) {
      batch.status = 'failed';
    } else if (batch.status === 'failed') {
      batch.status = 'in_progress';
    }
  }

  if (idx >= 0) {
    batches[idx] = batch;
  } else {
    batches.unshift(batch);
  }
  saveBatches(batches);
}

export function deleteBatch(id: string) {
  const batches = getBatches().filter((b) => b.id !== id);
  saveBatches(batches);
  const activeId = getActiveBatchId();
  if (activeId === id && batches.length > 0) {
    setActiveBatchId(batches[0].id);
  }
}

export function getActiveBatchId(): string | null {
  const batches = getBatches();
  const activeId = localStorage.getItem(KEYS.ACTIVE_BATCH_ID);
  if (activeId && batches.some((b) => b.id === activeId)) {
    return activeId;
  }
  return batches.length > 0 ? batches[0].id : null;
}

export function setActiveBatchId(id: string) {
  localStorage.setItem(KEYS.ACTIVE_BATCH_ID, id);
}

export function addTestResultToBatch(batchId: string, testResult: TestResult) {
  const batch = getBatchById(batchId);
  if (!batch) return;

  batch.testResults = batch.testResults || [];
  batch.testResults.push(testResult);
  saveBatch(batch);
  playLabBeep(testResult.isPass ? 'pass' : 'fail');
}

export function exportDataJSON(): string {
  const data = {
    batches: getBatches(),
    resinGrades: getResinGrades(),
    viscosityFactors: getViscosityFactors(),
    exportDate: new Date().toISOString(),
    version: '1.0',
  };
  return JSON.stringify(data, null, 2);
}

export function exportBatchesCSV(): string {
  const batches = getBatches();
  const rows: string[] = [
    'Batch ID,Sample Name,Resin Grade,Lot Number,Status,Date,Test Name,Result,Unit,Spec Min,Spec Max,Pass/Fail,Operator',
  ];

  batches.forEach((b) => {
    if (b.testResults.length === 0) {
      rows.push(
        `"${b.id}","${b.sampleName}","${b.resinGradeName}","${b.lotNumber}","${b.status}","${b.createdAt}","N/A","N/A","N/A","N/A","N/A","N/A","${b.operatorName}"`
      );
    } else {
      b.testResults.forEach((t) => {
        rows.push(
          `"${b.id}","${b.sampleName}","${b.resinGradeName}","${b.lotNumber}","${b.status}","${t.timestamp}","${t.calcName}","${t.resultValue}","${t.unit}","${t.specMin ?? ''}","${t.specMax ?? ''}","${t.isPass ? 'PASS' : 'FAIL'}","${t.operatorName}"`
        );
      });
    }
  });

  return rows.join('\n');
}

export function importDataJSON(jsonStr: string): boolean {
  try {
    const parsed = JSON.parse(jsonStr);
    if (parsed.batches && Array.isArray(parsed.batches)) {
      localStorage.setItem(KEYS.BATCHES, JSON.stringify(parsed.batches));
    }
    if (parsed.resinGrades && Array.isArray(parsed.resinGrades)) {
      localStorage.setItem(KEYS.RESIN_GRADES, JSON.stringify(parsed.resinGrades));
    }
    if (parsed.viscosityFactors && Array.isArray(parsed.viscosityFactors)) {
      localStorage.setItem(KEYS.VISCOSITY_FACTORS, JSON.stringify(parsed.viscosityFactors));
    }
    return true;
  } catch {
    return false;
  }
}
