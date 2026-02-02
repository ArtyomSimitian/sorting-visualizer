// src/App.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import type { MutableRefObject } from "react";
import "./App.css";

import bigOCheatSheet from "./assets/Big-O_Cheatsheet.png";
import swapSfxUrl from "./assets/swap.wav";
import sortedSfxUrl from "./assets/sorted.wav";

import { Link, Route, Routes } from "react-router-dom";
import About from "./pages/About";

/* ----------------------------- Types ----------------------------- */

type Step =
    | { type: "compare"; i: number; j: number }
    | { type: "swap"; i: number; j: number }
    | { type: "overwrite"; i: number; value: number }
    | { type: "markSorted"; index: number };

type Algo = "bubble" | "merge" | "quick";
type SortGen = (arr: number[]) => Generator<Step, void, void>;

/* --------------------------- Algorithms -------------------------- */

function* bubbleSortSteps(arr: number[]): Generator<Step, void, void> {
    const a = arr.slice();
    const n = a.length;

    for (let end = n - 1; end > 0; end--) {
        let swapped = false;

        for (let i = 0; i < end; i++) {
            yield { type: "compare", i, j: i + 1 };
            if (a[i] > a[i + 1]) {
                swapped = true;
                [a[i], a[i + 1]] = [a[i + 1], a[i]];
                yield { type: "swap", i, j: i + 1 };
            }
        }

        yield { type: "markSorted", index: end };

        // Early exit if already sorted
        if (!swapped) {
            for (let k = end - 1; k >= 0; k--) yield { type: "markSorted", index: k };
            return;
        }
    }

    yield { type: "markSorted", index: 0 };
}

function* mergeSortSteps(arr: number[]): Generator<Step, void, void> {
    const a = arr.slice();
    const aux = new Array<number>(a.length);

    function* sort(lo: number, hi: number): Generator<Step, void, void> {
        if (hi - lo <= 1) return;
        const mid = lo + ((hi - lo) >> 1);
        yield* sort(lo, mid);
        yield* sort(mid, hi);
        yield* merge(lo, mid, hi);
    }

    function* merge(lo: number, mid: number, hi: number): Generator<Step, void, void> {
        for (let k = lo; k < hi; k++) aux[k] = a[k];

        let i = lo;
        let j = mid;

        for (let k = lo; k < hi; k++) {
            if (i >= mid) {
                a[k] = aux[j];
                yield { type: "overwrite", i: k, value: aux[j] };
                j++;
            } else if (j >= hi) {
                a[k] = aux[i];
                yield { type: "overwrite", i: k, value: aux[i] };
                i++;
            } else {
                yield { type: "compare", i, j };
                if (aux[j] < aux[i]) {
                    a[k] = aux[j];
                    yield { type: "overwrite", i: k, value: aux[j] };
                    j++;
                } else {
                    a[k] = aux[i];
                    yield { type: "overwrite", i: k, value: aux[i] };
                    i++;
                }
            }
        }
    }

    yield* sort(0, a.length);

    for (let idx = 0; idx < a.length; idx++) yield { type: "markSorted", index: idx };
}

function* quickSortSteps(arr: number[]): Generator<Step, void, void> {
    const a = arr.slice();
    const sorted = new Array<boolean>(a.length).fill(false);

    function* sort(lo: number, hi: number): Generator<Step, void, void> {
        if (lo > hi) return;

        if (lo === hi) {
            if (!sorted[lo]) {
                sorted[lo] = true;
                yield { type: "markSorted", index: lo };
            }
            return;
        }

        const p = yield* partition(lo, hi);

        if (!sorted[p]) {
            sorted[p] = true;
            yield { type: "markSorted", index: p };
        }

        yield* sort(lo, p - 1);
        yield* sort(p + 1, hi);
    }

    function* partition(lo: number, hi: number): Generator<Step, number, void> {
        const pivotIndex = lo + ((hi - lo) >> 1);
        if (pivotIndex !== hi) {
            [a[pivotIndex], a[hi]] = [a[hi], a[pivotIndex]];
            yield { type: "swap", i: pivotIndex, j: hi };
        }

        const pivot = a[hi];
        let i = lo;

        for (let j = lo; j < hi; j++) {
            yield { type: "compare", i: j, j: hi };
            if (a[j] < pivot) {
                if (i !== j) {
                    [a[i], a[j]] = [a[j], a[i]];
                    yield { type: "swap", i, j };
                }
                i++;
            }
        }

        if (i !== hi) {
            [a[i], a[hi]] = [a[hi], a[i]];
            yield { type: "swap", i, j: hi };
        }

        return i;
    }

    yield* sort(0, a.length - 1);

    for (let idx = 0; idx < a.length; idx++) {
        if (!sorted[idx]) yield { type: "markSorted", index: idx };
    }
}

/**
 * Optimization: collapse runs of compares to the latest compare
 * before a real action step. Huge step-count reduction.
 */
function* coalesceCompareSteps(src: Generator<Step, void, void>): Generator<Step, void, void> {
    let pending: Step | null = null;

    while (true) {
        const r = src.next();
        if (r.done) {
            if (pending) yield pending;
            return;
        }

        const step = r.value;
        if (step.type === "compare") {
            pending = step;
            continue;
        }

        if (pending) {
            yield pending;
            pending = null;
        }

        yield step;
    }
}

const ALGORITHMS: Record<Algo, { label: string; gen: SortGen; time: string; space: string }> = {
    bubble: {
        label: "Bubble Sort",
        gen: bubbleSortSteps,
        time: "Time: O(n²) average/worst, O(n) best (already sorted)",
        space: "Space: O(1)",
    },
    merge: {
        label: "Merge Sort",
        gen: mergeSortSteps,
        time: "Time: O(n log(n)) best/avg/worst",
        space: "Space: O(n) (auxiliary array)",
    },
    quick: {
        label: "Quick Sort",
        gen: quickSortSteps,
        time: "Time: O(n log(n)) best/avg, O(n²) worst",
        space: "Space: O(log(n))",
    },
};

function randomArray(n: number) {
    return Array.from({ length: n }, () => Math.floor(5 + Math.random() * 95));
}

/* --------------------------- Audio Hook -------------------------- */

function useAudioPools(soundOn: boolean) {
    const soundOnRef = useRef(soundOn);
    useEffect(() => {
        soundOnRef.current = soundOn;
    }, [soundOn]);

    const swapPoolRef = useRef<HTMLAudioElement[]>([]);
    const sortedPoolRef = useRef<HTMLAudioElement[]>([]);
    const swapIdxRef = useRef(0);
    const sortedIdxRef = useRef(0);

    const lastSwapSoundRef = useRef(0);
    const lastSortedSoundRef = useRef(0);

    const isMobileRef = useRef(false);
    useEffect(() => {
        const mql = window.matchMedia("(pointer: coarse)");
        const update = () => {
            isMobileRef.current = mql.matches || window.innerWidth <= 768;
        };
        update();

        if ("addEventListener" in mql) mql.addEventListener("change", update);
        else (mql as any).addListener(update);

        window.addEventListener("resize", update);
        return () => {
            if ("removeEventListener" in mql) mql.removeEventListener("change", update);
            else (mql as any).removeListener(update);
            window.removeEventListener("resize", update);
        };
    }, []);

    useEffect(() => {
        swapPoolRef.current = Array.from({ length: 6 }, () => {
            const a = new Audio(swapSfxUrl);
            a.volume = 0.25;
            a.preload = "auto";
            return a;
        });

        sortedPoolRef.current = Array.from({ length: 4 }, () => {
            const a = new Audio(sortedSfxUrl);
            a.volume = 0.35;
            a.preload = "auto";
            return a;
        });

        return () => {
            swapPoolRef.current = [];
            sortedPoolRef.current = [];
        };
    }, []);

    async function primeAudio() {
        const a1 = swapPoolRef.current[0];
        const a2 = sortedPoolRef.current[0];
        try {
            if (a1) {
                a1.currentTime = 0;
                await a1.play();
                a1.pause();
                a1.currentTime = 0;
            }
        } catch {
            /* ignore */
        }
        try {
            if (a2) {
                a2.currentTime = 0;
                await a2.play();
                a2.pause();
                a2.currentTime = 0;
            }
        } catch {
            /* ignore */
        }
    }

    function playFromPool(pool: HTMLAudioElement[], idxRef: MutableRefObject<number>) {
        if (!soundOnRef.current) return;
        if (!pool.length) return;

        const a = pool[idxRef.current];
        idxRef.current = (idxRef.current + 1) % pool.length;

        a.currentTime = 0;
        void a.play().catch(() => {});
    }

    const audioRafRef = useRef<number | null>(null);
    const pendingSwapRef = useRef(false);
    const pendingSortedRef = useRef(false);
    const pendingSwapSpeedRef = useRef(20);

    function flushQueuedAudio() {
        audioRafRef.current = null;
        const now = performance.now();

        if (pendingSwapRef.current) {
            pendingSwapRef.current = false;

            const speedMs = pendingSwapSpeedRef.current;
            const minGap = speedMs <= 0 ? 60 : speedMs <= 5 ? 70 : speedMs <= 15 ? 55 : 40;

            if (now - lastSwapSoundRef.current >= minGap) {
                lastSwapSoundRef.current = now;
                playFromPool(swapPoolRef.current, swapIdxRef);
            }
        }

        if (pendingSortedRef.current) {
            pendingSortedRef.current = false;

            const minGap = 140;
            if (now - lastSortedSoundRef.current >= minGap) {
                lastSortedSoundRef.current = now;
                playFromPool(sortedPoolRef.current, sortedIdxRef);
            }
        }
    }

    function scheduleAudioFlush() {
        if (audioRafRef.current != null) return;
        audioRafRef.current = requestAnimationFrame(flushQueuedAudio);
    }

    function queueSwapSound(speedMs: number) {
        if (!soundOnRef.current) return;
        const forceThrottle = speedMs === 0;
        if (!isMobileRef.current && !forceThrottle) {
            playFromPool(swapPoolRef.current, swapIdxRef);
            return;
        }
        pendingSwapSpeedRef.current = speedMs;
        pendingSwapRef.current = true;
        scheduleAudioFlush();
    }

    function queueSortedSound(speedMs: number) {
        if (!soundOnRef.current) return;
        const forceThrottle = speedMs === 0;
        if (!isMobileRef.current && !forceThrottle) {
            playFromPool(sortedPoolRef.current, sortedIdxRef);
            return;
        }
        pendingSortedRef.current = true;
        scheduleAudioFlush();
    }

    function resetSoundTimers() {
        lastSwapSoundRef.current = 0;
        lastSortedSoundRef.current = 0;
    }

    useEffect(() => {
        return () => {
            if (audioRafRef.current != null) cancelAnimationFrame(audioRafRef.current);
        };
    }, []);

    return { primeAudio, queueSwapSound, queueSortedSound, resetSoundTimers };
}

/* ------------------------- Visualizer Page ------------------------ */

type ActivePair = { i: number; j: number } | null;

function SortingVisualizer() {
    // UI State
    const [algo, setAlgo] = useState<Algo>("bubble");
    const [n, setN] = useState(40);
    const [speedMs, setSpeedMs] = useState(20);
    const [soundOn, setSoundOn] = useState(true);

    // Force bar remount on reset/size change for clean refs/classes
    const [barsVersion, setBarsVersion] = useState(0);

    // Audio
    const { primeAudio, queueSwapSound, queueSortedSound, resetSoundTimers } = useAudioPools(soundOn);

    // Hot state in refs
    const algoRef = useRef(algo);
    const speedRef = useRef(speedMs);
    useEffect(() => void (algoRef.current = algo), [algo]);
    useEffect(() => void (speedRef.current = speedMs), [speedMs]);

    const valuesRef = useRef<number[]>(randomArray(40));
    const sortedRef = useRef<boolean[]>(new Array(40).fill(false));

    const activeRef = useRef<ActivePair>(null);
    const pendingActiveRef = useRef<ActivePair>(null);

    // DOM refs
    const barElsRef = useRef<(HTMLDivElement | null)[]>(new Array(40).fill(null));

    // Runner refs
    const playingRef = useRef(false);
    const iterRef = useRef<Generator<Step, void, void> | null>(null);

    const rafIdRef = useRef<number | null>(null);
    const lastTimeRef = useRef(0);
    const accRef = useRef(0);

    const info = useMemo(() => ALGORITHMS[algo], [algo]);

    /* ---------- DOM helpers ---------- */

    function addClass(idx: number, cls: string) {
        const el = barElsRef.current[idx];
        if (el) el.classList.add(cls);
    }

    function removeClass(idx: number, cls: string) {
        const el = barElsRef.current[idx];
        if (el) el.classList.remove(cls);
    }

    function setBarHeight(idx: number, v: number) {
        const el = barElsRef.current[idx];
        if (!el) return;
        el.style.height = `${v}%`;
        el.title = String(v);
    }

    function setActivePair(next: ActivePair) {
        const prev = activeRef.current;
        if (prev) {
            removeClass(prev.i, "bar--active");
            removeClass(prev.j, "bar--active");
        }

        if (next) {
            addClass(next.i, "bar--active");
            addClass(next.j, "bar--active");
        }

        activeRef.current = next;
    }

    function clearMarks() {
        for (let i = 0; i < valuesRef.current.length; i++) {
            removeClass(i, "bar--active");
            removeClass(i, "bar--sorted");
        }
        activeRef.current = null;
        pendingActiveRef.current = null;
        sortedRef.current.fill(false);
    }

    /* ---------- Run control ---------- */

    function cancelRaf() {
        if (rafIdRef.current != null) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
        }
    }

    function pause() {
        playingRef.current = false;
        cancelRaf();
    }

    function initIteratorIfNeeded() {
        if (iterRef.current) return;

        clearMarks();

        const raw = ALGORITHMS[algoRef.current].gen(valuesRef.current);
        iterRef.current = coalesceCompareSteps(raw);

        resetSoundTimers();
    }

    function applyStep(step: Step) {
        const speed = speedRef.current;

        switch (step.type) {
            case "compare":
                // latch and paint once per frame (so it shows even < 10ms)
                pendingActiveRef.current = { i: step.i, j: step.j };
                return;

            case "swap": {
                pendingActiveRef.current = { i: step.i, j: step.j };
                queueSwapSound(speed);

                const a = valuesRef.current;
                const i = step.i;
                const j = step.j;

                const tmp = a[i];
                a[i] = a[j];
                a[j] = tmp;

                setBarHeight(i, a[i]);
                setBarHeight(j, a[j]);
                return;
            }

            case "overwrite":
                pendingActiveRef.current = { i: step.i, j: step.i };
                queueSwapSound(speed);

                valuesRef.current[step.i] = step.value;
                setBarHeight(step.i, step.value);
                return;

            case "markSorted":
                if (sortedRef.current[step.index]) return;
                sortedRef.current[step.index] = true;
                addClass(step.index, "bar--sorted");
                queueSortedSound(speed);
                return;
        }
    }

    function advanceOneStep(): boolean {
        const it = iterRef.current;
        if (!it) return true;

        const res = it.next();
        if (res.done) {
            iterRef.current = null;
            pendingActiveRef.current = null;
            setActivePair(null);
            return true;
        }

        applyStep(res.value);
        return false;
    }

    function tick(now: number) {
        if (!playingRef.current) return;

        const speed = speedRef.current;
        const dt = now - lastTimeRef.current;
        lastTimeRef.current = now;

        // never lock the UI
        const MAX_STEPS_PER_FRAME = speed === 0 ? 900 : 240;

        let steps = 0;

        if (speed === 0) {
            while (playingRef.current && iterRef.current && steps < MAX_STEPS_PER_FRAME) {
                const done = advanceOneStep();
                steps++;
                if (done) break;
            }
        } else {
            accRef.current += dt;
            while (playingRef.current && iterRef.current && accRef.current >= speed && steps < MAX_STEPS_PER_FRAME) {
                accRef.current -= speed;
                const done = advanceOneStep();
                steps++;
                if (done) break;
            }
        }

        // paint active ONCE per frame (after swaps/sorted updates)
        if (pendingActiveRef.current) {
            setActivePair(pendingActiveRef.current);
            pendingActiveRef.current = null;
        }

        if (playingRef.current && iterRef.current) {
            rafIdRef.current = requestAnimationFrame(tick);
        }
    }

    async function play() {
        if (playingRef.current) return;

        await primeAudio();
        initIteratorIfNeeded();

        playingRef.current = true;
        accRef.current = 0;
        lastTimeRef.current = performance.now();

        cancelRaf();
        rafIdRef.current = requestAnimationFrame(tick);
    }

    function stepOnce() {
        void primeAudio();
        initIteratorIfNeeded();

        advanceOneStep();

        // ensure a single step paints immediately
        if (pendingActiveRef.current) {
            setActivePair(pendingActiveRef.current);
            pendingActiveRef.current = null;
        }
    }

    function resetArray(newN = n) {
        pause();
        iterRef.current = null;

        // reset data + DOM refs
        valuesRef.current = randomArray(newN);
        sortedRef.current = new Array(newN).fill(false);
        activeRef.current = null;
        pendingActiveRef.current = null;
        barElsRef.current = new Array(newN).fill(null);

        resetSoundTimers();

        if (newN !== n) setN(newN);
        setBarsVersion((v) => v + 1);
    }

    // cleanup
    useEffect(() => {
        return () => pause();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <h1>Sorting Visualizer</h1>

            <div className="controls">
                <label>
                    Sound:{" "}
                    <input type="checkbox" checked={soundOn} onChange={(e) => setSoundOn(e.target.checked)} />
                </label>

                <label>
                    Algorithm:{" "}
                    <select
                        value={algo}
                        onChange={(e) => {
                            pause();
                            iterRef.current = null;
                            clearMarks();
                            setAlgo(e.target.value as Algo);
                        }}
                    >
                        {Object.entries(ALGORITHMS).map(([key, a]) => (
                            <option key={key} value={key}>
                                {a.label}
                            </option>
                        ))}
                    </select>
                </label>

                <label>
                    Size: {n}
                    <input
                        type="range"
                        min={5}
                        max={150}
                        value={n}
                        onChange={(e) => resetArray(Number(e.target.value))}
                    />
                </label>

                <label>
                    Speed (ms): {speedMs}
                    <input type="range" min={0} max={200} value={speedMs} onChange={(e) => setSpeedMs(Number(e.target.value))} />
                </label>

                <div className="buttons">
                    <button onClick={() => resetArray()}>Randomize</button>
                    <button onClick={play}>Play</button>
                    <button onClick={pause}>Pause</button>
                    <button onClick={stepOnce}>Step</button>
                </div>
            </div>

            <div key={barsVersion} className="bars">
                {Array.from({ length: n }).map((_, idx) => {
                    const v = valuesRef.current[idx] ?? 0;
                    return (
                        <div
                            key={idx}
                            ref={(el) => {
                                barElsRef.current[idx] = el;
                            }}
                            className="bar"
                            style={{ height: `${v}%` }}
                            title={`${v}`}
                        />
                    );
                })}
            </div>

            <div className="explain">
                <h2 className="blankComplexity">{info.label} Complexity:</h2>
                <p>{info.time}</p>
                <p>{info.space}</p>
            </div>

            <div className="image-wrap">
                <img src={bigOCheatSheet} alt="Big-O cheat sheet" className="cheatsheet-img" />
            </div>

            <div className="source-information">
                <p>Image Source: Big-O Cheatsheet by Eric Rowell (bigocheatsheet.com), via Wikimedia Commons.</p>
            </div>

            <div className="copyright">
                <p>Copyright &#169; 2026 Artyom Simitian. All Rights Reserved</p>
            </div>
        </>
    );
}

/* ---------------------------- Router ---------------------------- */

export default function App() {
    return (
        <div className="app">
            <nav className="nav">
                <Link className="nav__link" to="/">
                    Home
                </Link>
                <i className="nav__link">|</i>
                <Link className="nav__link" to="/about">
                    About
                </Link>
            </nav>

            <Routes>
                <Route path="/" element={<SortingVisualizer />} />
                <Route path="/about" element={<About />} />
                <Route path="*" element={<div>Page not found</div>} />
            </Routes>
        </div>
    );
}
