// src/App.tsx
import { useEffect, useRef, useState } from "react";
import "./App.css";
import bigOCheatSheet from "./assets/Big-O_Cheatsheet.png";
import swapSfxUrl from "./assets/swap.wav";
import sortedSfxUrl from "./assets/sorted.wav";

type StepBubble =
    | { type: "compare"; i: number; j: number }
    | { type: "swap"; i: number; j: number }
    | { type: "markSorted"; index: number };

type StepMerge =
    | { type: "compare"; i: number; j: number }
    | { type: "overwrite"; i: number; value: number }
    | { type: "markSorted"; index: number };

type Step = StepBubble | StepMerge;

type Algo = "bubble" | "merge" | "quick";
type SortGen = (arr: number[]) => Generator<Step, void, void>;

function* bubbleSortSteps(arr: number[]): Generator<Step, void, void> {
    const a = arr.slice();
    const n = a.length;

    for (let end = n - 1; end > 0; end--) {
        for (let i = 0; i < end; i++) {
            yield { type: "compare", i, j: i + 1 };
            if (a[i] > a[i + 1]) {
                [a[i], a[i + 1]] = [a[i + 1], a[i]];
                yield { type: "swap", i, j: i + 1 };
            }
        }
        yield { type: "markSorted", index: end };
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

    for (let idx = 0; idx < a.length; idx++) {
        yield { type: "markSorted", index: idx };
    }
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

export default function App() {
    // --- Sound ---
    const [soundOn, setSoundOn] = useState(true);

    // keep latest toggle value during async play loop
    const soundOnRef = useRef(soundOn);
    useEffect(() => {
        soundOnRef.current = soundOn;
    }, [soundOn]);

    // separate pools so swap and sorted can have different files
    const swapPoolRef = useRef<HTMLAudioElement[]>([]);
    const sortedPoolRef = useRef<HTMLAudioElement[]>([]);
    const swapIdxRef = useRef(0);
    const sortedIdxRef = useRef(0);

    useEffect(() => {
        swapPoolRef.current = Array.from({ length: 6 }, () => {
            const a = new Audio(swapSfxUrl);
            a.volume = 0.25;
            a.preload = "auto";
            return a;
        });

        sortedPoolRef.current = Array.from({ length: 4 }, () => {
            const a = new Audio(sortedSfxUrl);
            a.volume = 0.35; // a bit louder so it stands out
            a.preload = "auto";
            return a;
        });

        return () => {
            swapPoolRef.current = [];
            sortedPoolRef.current = [];
        };
    }, []);

    async function primeAudio() {
        // unlock audio on a user gesture
        const a1 = swapPoolRef.current[0];
        const a2 = sortedPoolRef.current[0];

        try {
            if (a1) {
                a1.currentTime = 0;
                await a1.play();
                a1.pause();
                a1.currentTime = 0;
            }
        } catch {//catch
            }

        try {
            if (a2) {
                a2.currentTime = 0;
                await a2.play();
                a2.pause();
                a2.currentTime = 0;
            }
        } catch {//catch
             }
    }

    function playFromPool(pool: HTMLAudioElement[], idxRef: React.MutableRefObject<number>) {
        if (!soundOnRef.current) return;
        if (!pool.length) return;

        const a = pool[idxRef.current];
        idxRef.current = (idxRef.current + 1) % pool.length;

        a.currentTime = 0;
        void a.play().catch(() => {});
    }

    function playSwapSound() {
        playFromPool(swapPoolRef.current, swapIdxRef);
    }

    function playSortedSound() {
        playFromPool(sortedPoolRef.current, sortedIdxRef);
    }

    // --- Sorting state ---
    const [algo, setAlgo] = useState<Algo>("bubble");
    const [n, setN] = useState(40);
    const [speedMs, setSpeedMs] = useState(20);

    const [values, setValues] = useState<number[]>(() => randomArray(40));
    const [active, setActive] = useState<{ i: number; j: number } | null>(null);
    const [sorted, setSorted] = useState<Set<number>>(new Set());

    const playingRef = useRef(false);
    const iterRef = useRef<Generator<Step, void, void> | null>(null);

    const valuesRef = useRef(values);
    useEffect(() => {
        valuesRef.current = values;
    }, [values]);

    function resetArray(newN = n) {
        playingRef.current = false;
        iterRef.current = null;
        setActive(null);
        setSorted(new Set());

        const next = randomArray(newN);
        valuesRef.current = next;
        setValues(next);
    }

    function applyStep(step: Step) {
        if (step.type === "compare") {
            setActive({ i: step.i, j: step.j });
            return;
        }

        if (step.type === "swap") {
            playSwapSound();
            setValues((prev) => {
                const next = prev.slice();
                [next[step.i], next[step.j]] = [next[step.j], next[step.i]];
                return next;
            });
            return;
        }

        if (step.type === "overwrite") {
            playSwapSound();
            setValues((prev) => {
                const next = prev.slice();
                next[step.i] = step.value;
                return next;
            });
            return;
        }

        if (step.type === "markSorted") {
            // play only when newly marked (prevents repeats)
            setSorted((prev) => {
                if (prev.has(step.index)) return prev;
                playSortedSound();
                const next = new Set(prev);
                next.add(step.index);
                return next;
            });
            return;
        }
    }

    function pause() {
        playingRef.current = false;
    }

    async function play() {
        if (playingRef.current) return;

        await primeAudio();

        if (!iterRef.current) {
            setSorted(new Set());
            setActive(null);
            iterRef.current = ALGORITHMS[algo].gen(valuesRef.current);
        }

        playingRef.current = true;

        while (playingRef.current && iterRef.current) {
            const res = iterRef.current.next();

            if (res.done) {
                playingRef.current = false;
                iterRef.current = null;
                setActive(null);
                break;
            }

            applyStep(res.value);
            await new Promise((r) => setTimeout(r, speedMs));
        }
    }

    function stepOnce() {
        void primeAudio();

        if (!iterRef.current) {
            setSorted(new Set());
            setActive(null);
            iterRef.current = ALGORITHMS[algo].gen(valuesRef.current);
        }

        const res = iterRef.current.next();
        if (!res.done) {
            applyStep(res.value);
        } else {
            iterRef.current = null;
            setActive(null);
        }
    }

    const info = ALGORITHMS[algo];

    return (
        <div className="app">
            <h1>Sorting Visualizer</h1>

            <div className="controls">
                <label>
                    Sound:{" "}
                    <input
                        type="checkbox"
                        checked={soundOn}
                        onChange={(e) => setSoundOn(e.target.checked)}
                    />
                </label>

                <label>
                    Algorithm:{" "}
                    <select
                        value={algo}
                        onChange={(e) => {
                            pause();
                            iterRef.current = null;
                            setActive(null);
                            setSorted(new Set());
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
                        onChange={(e) => {
                            const nextN = Number(e.target.value);
                            setN(nextN);
                            resetArray(nextN);
                        }}
                    />
                </label>

                <label>
                    Speed (ms): {speedMs}
                    <input
                        type="range"
                        min={0}
                        max={200}
                        value={speedMs}
                        onChange={(e) => setSpeedMs(Number(e.target.value))}
                    />
                </label>

                <div className="buttons">
                    <button onClick={() => resetArray()}>Randomize</button>
                    <button onClick={play}>Play</button>
                    <button onClick={pause}>Pause</button>
                    <button onClick={stepOnce}>Step</button>
                </div>
            </div>

            <div className="bars">
                {values.map((v, idx) => {
                    const isActive = active && (idx === active.i || idx === active.j);
                    const isSorted = sorted.has(idx);
                    return (
                        <div
                            key={idx}
                            className={`bar ${isActive ? "bar--active" : ""} ${isSorted ? "bar--sorted" : ""}`}
                            style={{ height: `${v}%` }}
                            title={`${v}`}
                        />
                    );
                })}
            </div>

            <div className="explain">
                <h2>{info.label} Complexity</h2>
                <p>{info.time}</p>
                <p>{info.space}</p>
            </div>

            <div className="image-wrap">
                <img src={bigOCheatSheet} alt="Big-O cheat sheet" className="cheatsheet-img" />
            </div>

            <div className="source-information">
                <p>Image Source: Big-O Cheatsheet by Eric Rowell (bigocheatsheet.com), via Wikimedia Commons.</p>
            </div>
        </div>
    );
}
